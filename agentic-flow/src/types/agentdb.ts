/**
 * TypeScript type definitions for AgentDB wrapper
 *
 * Provides clean, typed interfaces for all AgentDB operations
 * following v2.0.0-alpha.2.11 specification
 */

/**
 * Vector search metrics supported by AgentDB
 */
export type DistanceMetric = 'cosine' | 'euclidean' | 'dot' | 'manhattan';

/**
 * HNSW index configuration
 */
export interface HNSWConfig {
  /** Maximum number of connections per element (default: 16) */
  M?: number;
  /** Size of dynamic candidate list during construction (default: 200) */
  efConstruction?: number;
  /** Size of dynamic candidate list during search (default: 100) */
  efSearch?: number;
}

/**
 * Vector embedding with metadata
 */
export interface VectorEntry {
  /** Unique identifier for the vector */
  id: string;
  /** Vector embedding (Float32Array for performance) */
  vector: Float32Array;
  /** Optional metadata for filtering and retrieval */
  metadata?: Record<string, any>;
  /** Timestamp of insertion */
  timestamp?: number;
}

/**
 * Vector search result
 */
export interface VectorSearchResult {
  /** Vector entry ID */
  id: string;
  /** Similarity score (higher = more similar) */
  score: number;
  /** Metadata associated with the vector */
  metadata?: Record<string, any>;
  /** Optional vector data if requested */
  vector?: Float32Array;
}

/**
 * Vector search options
 */
export interface VectorSearchOptions {
  /** Number of results to return (default: 10) */
  k?: number;
  /** Distance metric (default: 'cosine') */
  metric?: DistanceMetric;
  /** Metadata filters (key-value pairs) */
  filter?: Record<string, any>;
  /** Include vector data in results (default: false) */
  includeVectors?: boolean;
  /** HNSW-specific search parameters */
  hnswParams?: {
    efSearch?: number;
  };
}

/**
 * Memory operation types
 */
export type MemoryOperation = 'insert' | 'search' | 'update' | 'delete' | 'get';

/**
 * Memory insert options
 */
export interface MemoryInsertOptions {
  /** Vector embedding */
  vector: Float32Array;
  /** Metadata for the memory */
  metadata?: Record<string, any>;
  /** Optional custom ID (auto-generated if not provided) */
  id?: string;
  /** Namespace for organizing memories */
  namespace?: string;
}

/**
 * Memory update options
 */
export interface MemoryUpdateOptions {
  /** Vector ID to update */
  id: string;
  /** New vector embedding (optional) */
  vector?: Float32Array;
  /** New metadata (merged with existing) */
  metadata?: Record<string, any>;
  /** Namespace */
  namespace?: string;
}

/**
 * Memory delete options
 */
export interface MemoryDeleteOptions {
  /** Vector ID to delete */
  id: string;
  /** Namespace */
  namespace?: string;
}

/**
 * Memory get options
 */
export interface MemoryGetOptions {
  /** Vector ID to retrieve */
  id: string;
  /** Namespace */
  namespace?: string;
  /** Include vector data (default: true) */
  includeVector?: boolean;
}

/**
 * AgentDB configuration
 */
export interface AgentDBConfig {
  /** Database file path (default: ':memory:') */
  dbPath?: string;
  /** Namespace for organizing data */
  namespace?: string;
  /** Vector dimension (default: 384) */
  dimension?: number;
  /** HNSW index configuration */
  hnswConfig?: HNSWConfig;
  /** Enable attention mechanisms (default: false) */
  enableAttention?: boolean;
  /** Attention configuration */
  attentionConfig?: {
    /** Attention type */
    type?: 'multi-head' | 'flash' | 'linear' | 'hyperbolic' | 'moe' | 'graph-rope';
    /** Number of attention heads */
    numHeads?: number;
    /** Head dimension */
    headDim?: number;
  };
  /** Enable auto-initialization (default: true) */
  autoInit?: boolean;
}

/**
 * Statistics about the AgentDB instance
 */
export interface AgentDBStats {
  /** Total number of vectors */
  vectorCount: number;
  /** Vector dimension */
  dimension: number;
  /** Database size in bytes */
  databaseSize: number;
  /** HNSW index statistics */
  hnswStats?: {
    M: number;
    efConstruction: number;
    efSearch: number;
    levels: number;
  };
  /** Memory usage in bytes */
  memoryUsage?: number;
  /** Index build time in ms */
  indexBuildTime?: number;
}

/**
 * Batch insert result
 */
export interface BatchInsertResult {
  /** Number of successfully inserted vectors */
  inserted: number;
  /** Failed insertions with errors */
  failed: Array<{
    index: number;
    id?: string;
    error: string;
  }>;
  /** Total time in milliseconds */
  duration: number;
}

/**
 * Error types for AgentDB operations
 */
export class AgentDBError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly operation: MemoryOperation,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AgentDBError';
  }
}

/**
 * Validation error for invalid inputs
 */
export class ValidationError extends AgentDBError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 'insert', details);
    this.name = 'ValidationError';
  }
}

/**
 * Database error for storage issues
 */
export class DatabaseError extends AgentDBError {
  constructor(message: string, operation: MemoryOperation, details?: any) {
    super(message, 'DATABASE_ERROR', operation, details);
    this.name = 'DatabaseError';
  }
}

/**
 * Index error for HNSW operations
 */
export class IndexError extends AgentDBError {
  constructor(message: string, operation: MemoryOperation, details?: any) {
    super(message, 'INDEX_ERROR', operation, details);
    this.name = 'IndexError';
  }
}
