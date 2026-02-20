/**
 * AgentDB - Main database wrapper class
 *
 * Provides a unified interface to all AgentDB controllers with:
 * - sql.js WASM for relational storage (with better-sqlite3 fallback)
 * - RuVector for optimized vector search (150x faster than SQLite)
 * - Unified integration passing vector backend to all controllers
 *
 * Unified single-file mode (vectorBackend='rvf', the default):
 *   One sql.js Database instance holds BOTH relational tables (episodes,
 *   skills, causal edges — 21+ tables) AND vector tables (rvf_vectors,
 *   rvf_meta). Everything persists to a single .rvf file.
 */
import { ReflexionMemory } from '../controllers/ReflexionMemory.js';
import { SkillLibrary } from '../controllers/SkillLibrary.js';
import { CausalMemoryGraph } from '../controllers/CausalMemoryGraph.js';
import { EmbeddingService } from '../controllers/EmbeddingService.js';
import { createBackend } from '../backends/factory.js';
import { SqlJsRvfBackend } from '../backends/rvf/SqlJsRvfBackend.js';
import type { VectorBackend, VectorConfig } from '../backends/VectorBackend.js';
import type { IDatabaseConnection } from '../types/database.types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface AgentDBConfig {
  dbPath?: string;
  namespace?: string;
  enableAttention?: boolean;
  attentionConfig?: Record<string, unknown>;
  /** Force use of sql.js WASM even if better-sqlite3 is available */
  forceWasm?: boolean;
  /** Vector backend type: 'auto' | 'ruvector' | 'rvf' | 'hnswlib' */
  vectorBackend?: 'auto' | 'ruvector' | 'rvf' | 'hnswlib';
  /** Vector dimension (default: 384 for MiniLM) */
  vectorDimension?: number;
}

export class AgentDB {
  private db!: IDatabaseConnection;
  private reflexion!: ReflexionMemory;
  private skills!: SkillLibrary;
  private causalGraph!: CausalMemoryGraph;
  private embedder!: EmbeddingService;
  public vectorBackend!: VectorBackend;
  private initialized = false;
  private config: AgentDBConfig;
  private usingWasm = false;
  /** True when vectors + relational share one sql.js database */
  private unifiedMode = false;
  /** Reference to the rvf backend when in unified mode (for save/close) */
  private rvfBackendRef: SqlJsRvfBackend | null = null;

  constructor(config: AgentDBConfig = {}) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const dbPath = this.config.dbPath || ':memory:';
    const vectorDimension = this.config.vectorDimension || 384;
    const backendType = this.config.vectorBackend || 'rvf';

    if (backendType === 'rvf') {
      // ── Unified single-file mode ──
      // One sql.js database for everything: vectors + relational tables
      const rvfBackend = new SqlJsRvfBackend({
        dimension: vectorDimension,
        metric: 'cosine' as const,
        storagePath: dbPath,
      } as VectorConfig & { storagePath: string });
      await rvfBackend.initialize();

      // Extract the raw sql.js database and wrap it with better-sqlite3 API
      const rawDb = rvfBackend.getDatabase();
      const { wrapExistingSqlJsDatabase } = await import('../db-fallback.js');
      this.db = wrapExistingSqlJsDatabase(rawDb, dbPath) as IDatabaseConnection;

      this.vectorBackend = rvfBackend;
      this.rvfBackendRef = rvfBackend;
      this.unifiedMode = true;
      this.usingWasm = true;

      // Load relational schemas into the same database
      await this.loadSchemas();
    } else {
      // ── Legacy separate-database mode ──
      this.db = await this.initializeDatabase(dbPath);
      await this.loadSchemas();

      this.vectorBackend = await createBackend(backendType, {
        dimensions: vectorDimension,
        metric: 'cosine',
      });
    }

    // Initialize embedder with default Xenova model
    this.embedder = new EmbeddingService({
      model: 'Xenova/all-MiniLM-L6-v2',
      dimension: vectorDimension,
      provider: 'transformers',
    });
    await this.embedder.initialize();

    // Initialize controllers WITH vector backend for optimized search
    this.reflexion = new ReflexionMemory(this.db, this.embedder, this.vectorBackend);
    this.skills = new SkillLibrary(this.db, this.embedder, this.vectorBackend);
    this.causalGraph = new CausalMemoryGraph(
      this.db,
      undefined, // graphBackend
      this.embedder,
      undefined, // config
      this.vectorBackend,
    );

    this.initialized = true;

    const mode = this.unifiedMode ? 'unified .rvf' : (this.usingWasm ? 'sql.js WASM' : 'better-sqlite3');
    console.log(`[AgentDB] Initialized with ${mode} + ${this.vectorBackend.name} vector backend`);
  }

  /**
   * Save the database to disk.
   * In unified mode, delegates to SqlJsRvfBackend.save() which exports the
   * entire database (vectors + relational) to a single .rvf file.
   * In legacy mode, saves the relational database via the wrapper's save().
   */
  async save(savePath?: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('AgentDB not initialized. Call initialize() first.');
    }

    if (this.unifiedMode && this.rvfBackendRef) {
      const target = savePath || this.config.dbPath || ':memory:';
      await this.rvfBackendRef.save(target);
    } else if (this.db && typeof (this.db as unknown as { save?: () => void }).save === 'function') {
      (this.db as unknown as { save: () => void }).save();
    }
  }

  /**
   * Initialize database with automatic fallback:
   * 1. Try better-sqlite3 (native, fastest)
   * 2. Fallback to sql.js WASM (no build tools required)
   */
  private async initializeDatabase(dbPath: string): Promise<IDatabaseConnection> {
    if (this.config.forceWasm) {
      return this.initializeSqlJsWasm(dbPath);
    }

    try {
      const Database = (await import('better-sqlite3')).default;
      const db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      this.usingWasm = false;
      return db as unknown as IDatabaseConnection;
    } catch {
      console.log('[AgentDB] better-sqlite3 not available, using sql.js WASM');
      return this.initializeSqlJsWasm(dbPath);
    }
  }

  /**
   * Initialize sql.js WASM database
   */
  private async initializeSqlJsWasm(dbPath: string): Promise<IDatabaseConnection> {
    const { createDatabase } = await import('../db-fallback.js');
    const db = await createDatabase(dbPath);
    this.usingWasm = true;
    return db as IDatabaseConnection;
  }

  /**
   * Load database schemas
   */
  private async loadSchemas(): Promise<void> {
    const schemaPath = path.join(__dirname, '../../schemas/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      this.db.exec(schema);
    }

    const frontierSchemaPath = path.join(__dirname, '../../schemas/frontier-schema.sql');
    if (fs.existsSync(frontierSchemaPath)) {
      const frontierSchema = fs.readFileSync(frontierSchemaPath, 'utf-8');
      this.db.exec(frontierSchema);
    }
  }

  getController(name: string): ReflexionMemory | SkillLibrary | CausalMemoryGraph {
    if (!this.initialized) {
      throw new Error('AgentDB not initialized. Call initialize() first.');
    }

    switch (name) {
      case 'memory':
      case 'reflexion':
        return this.reflexion;
      case 'skills':
        return this.skills;
      case 'causal':
      case 'causalGraph':
        return this.causalGraph;
      default:
        throw new Error(`Unknown controller: ${name}`);
    }
  }

  /**
   * Close the database. In unified mode, auto-saves before closing.
   */
  async close(): Promise<void> {
    if (this.unifiedMode && this.rvfBackendRef) {
      // rvfBackendRef.close() flushes pending writes, auto-saves, and closes
      this.rvfBackendRef.close();
      this.rvfBackendRef = null;
    } else if (this.db) {
      this.db.close();
    }
  }

  // Expose database for advanced usage
  get database(): IDatabaseConnection {
    return this.db;
  }

  // Check if using WASM backend
  get isWasm(): boolean {
    return this.usingWasm;
  }

  // Check if running in unified single-file mode
  get isUnifiedMode(): boolean {
    return this.unifiedMode;
  }

  // Get vector backend info
  get vectorBackendName(): string {
    return this.vectorBackend?.name || 'none';
  }
}
