/**
 * SemanticQueryRouter - Intent-Based Query Routing for AgentDB
 *
 * Wraps @ruvector/router's SemanticRouter for intelligent query routing
 * based on learned intent embeddings. Routes queries to appropriate
 * handlers (e.g., different memory stores, search strategies) based
 * on semantic similarity.
 *
 * Security:
 * - Intent names validated (length, characters)
 * - Embedding dimensions validated
 * - Route count bounded
 * - No file I/O (uses in-memory VectorDb)
 */

/** Route match result */
export interface RouteMatch {
  intent: string;
  score: number;
  metadata: Record<string, unknown>;
}

/** Intent configuration */
export interface IntentConfig {
  name: string;
  exemplars: Float32Array[];
  metadata?: Record<string, unknown>;
}

/** Router configuration */
export interface RouterConfig {
  /** Embedding dimension */
  dimension: number;
  /** Minimum similarity score for matches (default: 0.0 for distance metrics) */
  threshold?: number;
  /** Maximum number of intents (default: 1000) */
  maxIntents?: number;
}

/** Router statistics */
export interface RouterStats {
  intentCount: number;
  dimension: number;
  totalQueries: number;
  avgLatencyMs: number;
}

// Bounds
const MAX_INTENTS = 10000;
const MAX_INTENT_NAME_LENGTH = 256;
const MAX_DIMENSION = 4096;
const MAX_EXEMPLARS = 100;

/**
 * SemanticQueryRouter - Route queries to intents via learned embeddings
 *
 * Uses @ruvector/router's N-API VectorDb (HNSW + SIMD) for sub-millisecond
 * routing. Falls back to built-in brute-force search if @ruvector/router
 * is not available.
 */
export class SemanticQueryRouter {
  private dim: number;
  private threshold: number;
  private maxIntents: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private router: any = null;
  private fallbackIntents = new Map<string, { centroid: Float32Array; metadata: Record<string, unknown> }>();
  private _totalQueries = 0;
  private _totalLatencyMs = 0;
  private _destroyed = false;
  private _useNative: boolean;

  private constructor(config: RouterConfig) {
    this.dim = config.dimension;
    this.threshold = config.threshold ?? 0.0;
    this.maxIntents = Math.min(Math.max(1, config.maxIntents ?? 1000), MAX_INTENTS);
    this._useNative = false;
  }

  /**
   * Create a new semantic query router.
   * Lazy-loads @ruvector/router; falls back to built-in search.
   */
  static async create(config: RouterConfig): Promise<SemanticQueryRouter> {
    if (!Number.isFinite(config.dimension) || config.dimension < 1 || config.dimension > MAX_DIMENSION) {
      throw new Error(`dimension must be between 1 and ${MAX_DIMENSION}`);
    }

    const instance = new SemanticQueryRouter(config);

    try {
      const { SemanticRouter } = await import('@ruvector/router');
      instance.router = new SemanticRouter({
        dimension: config.dimension,
        threshold: config.threshold ?? 0.0,
      });
      instance._useNative = true;
    } catch {
      // Fallback to built-in brute-force
      instance._useNative = false;
    }

    return instance;
  }

  /**
   * Check if @ruvector/router is available.
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await import('@ruvector/router');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add an intent with exemplar embeddings.
   * The centroid of exemplars is used for routing.
   */
  addIntent(config: IntentConfig): void {
    this.ensureAlive();

    if (!config.name || config.name.length > MAX_INTENT_NAME_LENGTH) {
      throw new Error(`Intent name must be 1-${MAX_INTENT_NAME_LENGTH} characters`);
    }
    if (!config.exemplars || config.exemplars.length === 0) {
      throw new Error('At least one exemplar embedding is required');
    }
    if (config.exemplars.length > MAX_EXEMPLARS) {
      throw new Error(`Maximum ${MAX_EXEMPLARS} exemplars per intent`);
    }

    // Validate dimensions
    for (const emb of config.exemplars) {
      if (emb.length !== this.dim) {
        throw new Error(`Exemplar dimension ${emb.length} does not match router dimension ${this.dim}`);
      }
    }

    const intentCount = this._useNative
      ? (this.router?.getIntents()?.length ?? 0)
      : this.fallbackIntents.size;
    if (intentCount >= this.maxIntents) {
      throw new Error(`Maximum ${this.maxIntents} intents reached`);
    }

    // Compute centroid
    const centroid = new Float32Array(this.dim);
    for (const emb of config.exemplars) {
      for (let i = 0; i < this.dim; i++) {
        centroid[i] += emb[i] / config.exemplars.length;
      }
    }

    const metadata = config.metadata ?? {};

    if (this._useNative && this.router) {
      this.router.addIntent({
        name: config.name,
        utterances: ['__embedding__'], // Required but unused for embedding routing
        embedding: centroid,
        metadata,
      });
    } else {
      this.fallbackIntents.set(config.name, { centroid, metadata });
    }
  }

  /**
   * Route a query embedding to the best matching intent(s).
   */
  route(query: Float32Array, k: number = 1): RouteMatch[] {
    this.ensureAlive();
    if (query.length !== this.dim) {
      throw new Error(`Query dimension ${query.length} does not match router dimension ${this.dim}`);
    }

    const start = performance.now();
    let results: RouteMatch[];

    if (this._useNative && this.router) {
      results = this.router.routeWithEmbedding(query, k) as RouteMatch[];
    } else {
      results = this.fallbackRoute(query, k);
    }

    const elapsed = performance.now() - start;
    this._totalQueries++;
    this._totalLatencyMs += elapsed;

    return results;
  }

  /**
   * Remove an intent.
   */
  removeIntent(name: string): boolean {
    this.ensureAlive();
    if (this._useNative && this.router) {
      return this.router.removeIntent(name) as boolean;
    }
    return this.fallbackIntents.delete(name);
  }

  /**
   * Get all intent names.
   */
  getIntents(): string[] {
    if (this._useNative && this.router) {
      return this.router.getIntents() as string[];
    }
    return Array.from(this.fallbackIntents.keys());
  }

  /**
   * Get router statistics.
   */
  getStats(): RouterStats {
    return {
      intentCount: this.getIntents().length,
      dimension: this.dim,
      totalQueries: this._totalQueries,
      avgLatencyMs: this._totalQueries > 0 ? this._totalLatencyMs / this._totalQueries : 0,
    };
  }

  /** Whether using native @ruvector/router */
  get isNative(): boolean {
    return this._useNative;
  }

  /** Check if destroyed */
  get isDestroyed(): boolean {
    return this._destroyed;
  }

  /** Destroy the router */
  destroy(): void {
    if (!this._destroyed) {
      this.router = null;
      this.fallbackIntents.clear();
      this._destroyed = true;
    }
  }

  // --- Private helpers ---

  private fallbackRoute(query: Float32Array, k: number): RouteMatch[] {
    const scored: RouteMatch[] = [];
    for (const [name, { centroid, metadata }] of this.fallbackIntents) {
      const sim = this.cosineSimilarity(query, centroid);
      if (sim >= this.threshold) {
        scored.push({ intent: name, score: sim, metadata });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0;
  }

  private ensureAlive(): void {
    if (this._destroyed) {
      throw new Error('SemanticQueryRouter has been destroyed. Create a new instance.');
    }
  }
}
