/**
 * AgentDB Wrapper Type Definitions
 *
 * Type definitions for AgentDB v2 integration with Agentic-Flow
 */

/**
 * AgentDB document for storage
 */
export interface AgentDBDocument {
  content: string;
  embedding: Float32Array;
  metadata: Record<string, any>;
}

/**
 * Vector search result
 */
export interface AgentDBSearchResult {
  id: string;
  content?: string;
  similarity: number;
  metadata: Record<string, any>;
  embedding?: Float32Array;
}

/**
 * Query options for AgentDB
 */
export interface AgentDBQueryOptions {
  filter?: (metadata: Record<string, any>) => boolean;
  limit?: number;
  offset?: number;
}

/**
 * Vector search options
 */
export interface VectorSearchOptions {
  filter?: (metadata: Record<string, any>) => boolean;
  threshold?: number;
}

/**
 * Update options
 */
export interface AgentDBUpdateOptions {
  filter: (metadata: Record<string, any>) => boolean;
  updates: Record<string, any>;
}

/**
 * AgentDB statistics
 */
export interface AgentDBStats {
  totalVectors: number;
  dimensions: number;
  indexType?: string;
  memoryUsage?: number;
}

/**
 * AgentDB Wrapper Interface
 *
 * Provides unified interface for AgentDB v2 operations
 */
export interface AgentDBWrapper {
  /**
   * Insert a document with embedding
   */
  insert(document: AgentDBDocument): Promise<{ id: string; success: boolean }>;

  /**
   * Perform vector similarity search
   */
  vectorSearch(
    queryEmbedding: Float32Array,
    k: number,
    options?: VectorSearchOptions
  ): Promise<AgentDBSearchResult[]>;

  /**
   * Update documents matching filter
   */
  update(options: AgentDBUpdateOptions): Promise<{ success: boolean; count?: number }>;

  /**
   * Delete documents matching filter
   */
  delete(options: AgentDBQueryOptions): Promise<{ success: boolean; count?: number }>;

  /**
   * Query documents with filtering
   */
  query(options: AgentDBQueryOptions): Promise<AgentDBSearchResult[]>;

  /**
   * Generate embedding for text
   */
  embed(text: string): Promise<Float32Array>;

  /**
   * Get database statistics
   */
  stats(): Promise<AgentDBStats>;

  /**
   * Clear query cache
   */
  clearCache(): Promise<void>;
}
