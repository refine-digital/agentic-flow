/**
 * AgentDB - Main Entry Point
 *
 * Frontier Memory Features with MCP Integration:
 * - Causal reasoning and memory graphs
 * - Reflexion memory with self-critique
 * - Skill library with automated learning
 * - Vector search with embeddings
 * - Reinforcement learning (9 algorithms)
 */

// Main AgentDB class
export { AgentDB } from './core/AgentDB.js';
import { AgentDB as AgentDBClass } from './core/AgentDB.js';
export default AgentDBClass;

// Core controllers
export { CausalMemoryGraph } from './controllers/CausalMemoryGraph.js';
export { CausalRecall } from './controllers/CausalRecall.js';
export { ExplainableRecall } from './controllers/ExplainableRecall.js';
export { NightlyLearner } from './controllers/NightlyLearner.js';
export { ReflexionMemory } from './controllers/ReflexionMemory.js';
export { SkillLibrary } from './controllers/SkillLibrary.js';
export { LearningSystem } from './controllers/LearningSystem.js';
export { ReasoningBank } from './controllers/ReasoningBank.js';

// Embedding services
export { EmbeddingService } from './controllers/EmbeddingService.js';
export { EnhancedEmbeddingService } from './controllers/EnhancedEmbeddingService.js';

// Model cache (offline .rvf model loading)
export { ModelCacheLoader } from './model/ModelCacheLoader.js';

// WASM acceleration and HNSW indexing
export { WASMVectorSearch } from './controllers/WASMVectorSearch.js';
export { HNSWIndex, isHnswlibAvailable } from './controllers/HNSWIndex.js';

// Attention mechanisms
export { AttentionService } from './controllers/AttentionService.js';

// Memory Controller with Attention Integration
export { MemoryController } from './controllers/MemoryController.js';

// Attention Controllers
export { SelfAttentionController } from './controllers/attention/SelfAttentionController.js';
export { CrossAttentionController } from './controllers/attention/CrossAttentionController.js';
export { MultiHeadAttentionController } from './controllers/attention/MultiHeadAttentionController.js';

// Database utilities
export { createDatabase } from './db-fallback.js';

// Optimizations
export { BatchOperations } from './optimizations/BatchOperations.js';
export { QueryOptimizer } from './optimizations/QueryOptimizer.js';
export { QueryCache } from './core/QueryCache.js';
export type { QueryCacheConfig, CacheEntry, CacheStatistics } from './core/QueryCache.js';

// Security
export {
  validateTableName,
  validateColumnName,
  validatePragmaCommand,
  buildSafeWhereClause,
  buildSafeSetClause,
  ValidationError,
} from './security/input-validation.js';

// Vector Quantization
export {
  // Types
  type QuantizationStats,
  type QuantizedVector,
  type ProductQuantizerConfig,
  type PQEncodedVector,
  type QuantizedVectorStoreConfig,
  type QuantizedSearchResult,
  // Scalar Quantization
  quantize8bit,
  quantize4bit,
  dequantize8bit,
  dequantize4bit,
  calculateQuantizationError,
  getQuantizationStats,
  // Product Quantization
  ProductQuantizer,
  // Quantized Vector Store
  QuantizedVectorStore,
  // Factory Functions
  createScalar8BitStore,
  createScalar4BitStore,
  createProductQuantizedStore,
} from './quantization/index.js';

// Hybrid Search (Vector + Keyword)
export {
  KeywordIndex,
  HybridSearch,
  createKeywordIndex,
  createHybridSearch,
  type HybridSearchOptions,
  type HybridSearchResult,
  type HybridQuery,
  type BM25Config,
} from './search/index.js';

// Benchmarking Suite
export {
  // Main Suite
  BenchmarkSuite,
  // Base class for custom benchmarks
  Benchmark,
  // Built-in benchmarks
  VectorInsertBenchmark,
  VectorSearchBenchmark,
  MemoryUsageBenchmark,
  ConcurrencyBenchmark,
  QuantizationBenchmark,
  // CLI integration functions
  runBenchmarks,
  runSelectedBenchmarks,
  // Formatting utilities
  formatReportAsMarkdown,
  formatComparisonAsMarkdown,
  // Types
  type LatencyStats,
  type BenchmarkResult,
  type BenchmarkReport,
  type ComparisonReport,
  type BenchmarkConfig,
} from './benchmark/index.js';

// Additional controllers not explicitly listed above
export { MMRDiversityRanker } from './controllers/MMRDiversityRanker.js';
export { ContextSynthesizer } from './controllers/ContextSynthesizer.js';
export { MetadataFilter } from './controllers/MetadataFilter.js';
export { QUICServer } from './controllers/QUICServer.js';
export { QUICClient } from './controllers/QUICClient.js';
export { SyncCoordinator } from './controllers/SyncCoordinator.js';

// Controller types
export type { Episode, EpisodeWithEmbedding, ReflexionQuery } from './controllers/ReflexionMemory.js';
export type { Skill, SkillLink, SkillQuery } from './controllers/SkillLibrary.js';
export type { EmbeddingConfig } from './controllers/EmbeddingService.js';
export type { VectorSearchConfig, VectorSearchResult, VectorIndex } from './controllers/WASMVectorSearch.js';
export type { HNSWConfig, HNSWSearchResult, HNSWStats } from './controllers/HNSWIndex.js';
export type { EnhancedEmbeddingConfig } from './controllers/EnhancedEmbeddingService.js';
export type { MMROptions, MMRCandidate } from './controllers/MMRDiversityRanker.js';
export type { MemoryPattern, SynthesizedContext } from './controllers/ContextSynthesizer.js';
export type { MetadataFilters, FilterableItem, FilterOperator, FilterValue } from './controllers/MetadataFilter.js';
export type { QUICServerConfig, SyncRequest, SyncResponse } from './controllers/QUICServer.js';
export type { QUICClientConfig } from './controllers/QUICClient.js';
export type { SyncCoordinatorConfig, SyncState, SyncReport } from './controllers/SyncCoordinator.js';
export type { AttentionConfig, AttentionResult, AttentionStats } from './controllers/AttentionService.js';
export type {
  MemoryControllerConfig,
  Memory,
  SearchOptions,
  SearchResult,
  AttentionRetrievalResult,
} from './controllers/MemoryController.js';
export type { SelfAttentionConfig, AttentionScore, SelfAttentionResult, SelfAttentionMemoryEntry } from './controllers/attention/index.js';
export type { CrossAttentionConfig, CrossAttentionScore, CrossAttentionResult, ContextEntry } from './controllers/attention/index.js';
export type { MultiHeadAttentionConfig, HeadAttentionOutput, MultiHeadAttentionResult, MultiHeadMemoryEntry } from './controllers/attention/index.js';

// Coordination - Multi-database synchronization
export {
  MultiDatabaseCoordinator,
  type DatabaseInstance,
  type InstanceStatus,
  type ConflictResolutionStrategy,
  type SyncOptions,
  type SyncProgress,
  type SyncResult,
  type ConflictInfo,
  type VectorData,
  type MultiDatabaseCoordinatorConfig,
  type StatusChangeCallback,
  type DistributedOperationResult,
} from './coordination/index.js';

// LLM Router - Multi-provider LLM integration with RuvLLM support
export {
  LLMRouter,
  isRuvLLMInstalled,
  type LLMConfig,
  type LLMResponse,
} from './services/LLMRouter.js';
