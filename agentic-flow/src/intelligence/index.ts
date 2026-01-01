/**
 * RuVector Intelligence Layer - Unified Exports
 *
 * Exposes the full power of RuVector ecosystem:
 *
 * Features Used:
 * - @ruvector/sona: Micro-LoRA, Base-LoRA, EWC++, ReasoningBank, Trajectories
 * - @ruvector/attention: Multi-head, Flash, Hyperbolic, MoE, Graph, DualSpace
 * - ruvector core: HNSW indexing, vector similarity search
 */

export {
  RuVectorIntelligence,
  createIntelligenceLayer,
  IntelligencePresets,
  type RuVectorIntelligenceConfig,
  type Trajectory,
  type TrajectoryStep,
  type AgentRoutingResult,
  type LearningOutcome,
  type OperationResult,
} from './RuVectorIntelligence.js';

// Re-export key types from @ruvector/sona
export type {
  JsSonaConfig as SonaConfig,
  JsLearnedPattern as LearnedPattern,
} from '@ruvector/sona';

// Re-export attention types
export {
  AttentionType,
  type MoEConfig,
} from '@ruvector/attention';

// Enhanced Agent Booster v2 with full RuVector intelligence
export {
  EnhancedAgentBooster,
  getEnhancedBooster,
  enhancedApply,
  benchmark as benchmarkEnhancedBooster,
  type EnhancedEditRequest,
  type EnhancedEditResult,
  type LearnedPattern as BoosterPattern,
  type BoosterStats,
  type ErrorPattern,
  type PrefetchResult,
} from './agent-booster-enhanced.js';

// WASM Acceleration - 150x faster pattern search
export {
  WasmPatternIndex,
  WasmAgentRouter,
  getWasmPatternIndex,
  getWasmAgentRouter,
  initWasmAcceleration,
  getWasmAccelerationStatus,
  type PatternEntry,
  type AgentProfile,
} from './wasm-acceleration.js';

// TinyDancer - FastGRNN Neural Routing
export {
  TinyDancerRouter,
  getTinyDancerRouter,
  initTinyDancer,
  isTinyDancerAvailable,
  type RouteResult,
  type RouterMetrics,
  type TinyDancerConfig,
} from '../routing/TinyDancerRouter.js';

// ONNX Embeddings WASM - Browser-compatible embeddings
export {
  OnnxEmbeddingsWasm,
  getOnnxEmbeddingsWasm,
  initOnnxEmbeddingsWasm,
  isOnnxWasmAvailable,
  isSIMDEnabled,
  embed as onnxEmbed,
  embedBatch as onnxEmbedBatch,
  cosineSimilarity as onnxCosineSimilarity,
  type OnnxEmbeddingResult,
  type OnnxBatchResult,
  type OnnxEmbeddingsStats,
} from '../wasm/onnx-embeddings-wasm.js';

// RuVector Edge - WASM-accelerated primitives
export {
  initRuVectorWasm,
  isWasmInitialized,
  isWasmSupported,
  RuVectorHnswIndex,
  RuVectorSemanticMatcher,
  generateIdentity,
  signData,
  verifySignature,
  type WasmIdentityKeys,
  type HnswSearchResult,
  type SemanticMatch,
} from '../wasm/ruvector-edge.js';

// RuVector Edge-Full - Complete WASM toolkit
export {
  initEdgeFull,
  isEdgeFullAvailable,
  getEdgeFull,
  getEdgeFullStats,
  EdgeFullHnswIndex,
  EdgeFullGraphDB,
  EdgeFullSonaEngine,
  EdgeFullOnnxEmbeddings,
  EdgeFullDagWorkflow,
  cosineSimilarity as edgeFullCosineSimilarity,
  dotProduct,
  normalize,
  isSIMDEnabled as edgeFullSIMDEnabled,
  type EdgeFullStats,
} from '../wasm/edge-full.js';

// Embedding Service - Unified embedding interface
export {
  EmbeddingService,
  getEmbeddingService,
  embed,
  embedBatch,
  textSimilarity,
  simpleEmbed,
  semanticSearch,
  findDuplicates,
  clusterTexts,
  pretrainCodePatterns,
  pretrainFromRepo,
  type EmbeddingBackend,
  type EmbeddingStats,
  type SimilarityResult,
  type SearchResult,
  type DuplicateGroup,
} from './EmbeddingService.js';
