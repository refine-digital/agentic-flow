/**
 * AgentDB Backends - Unified Vector Storage Interface
 *
 * Provides automatic backend selection between RuVector, RVF, and HNSWLib
 * with graceful fallback and clear error messages.
 */

// Core interfaces
export type {
  VectorBackend,
  VectorBackendAsync,
  VectorConfig,
  SearchResult,
  SearchOptions,
  VectorStats
} from './VectorBackend.js';

// Backend implementations
export { RuVectorBackend } from './ruvector/RuVectorBackend.js';
export { RuVectorLearning } from './ruvector/RuVectorLearning.js';
export { HNSWLibBackend } from './hnswlib/HNSWLibBackend.js';
export { RvfBackend } from './rvf/RvfBackend.js';

// Factory and detection
export {
  createBackend,
  detectBackends,
  getRecommendedBackend,
  isBackendAvailable,
  getInstallCommand
} from './factory.js';

export type { BackendType, BackendDetection, RvfDetection } from './factory.js';
export type { LearningConfig, EnhancementOptions } from './ruvector/RuVectorLearning.js';
export type { RvfConfig, IndexStats, WitnessVerification } from './rvf/RvfBackend.js';

// RVF Solver (AGI capabilities - ADR-004)
export { AgentDBSolver } from './rvf/RvfSolver.js';
export type {
  SolverTrainOptions,
  SolverTrainResult,
  SolverCycleMetrics,
  SolverModeResult,
  SolverAcceptanceManifest,
  SolverAcceptanceOptions,
  SolverPolicyState,
} from './rvf/RvfSolver.js';

// SONA Learning Backend (ADR-005)
export { SonaLearningBackend } from './rvf/SonaLearningBackend.js';
export type {
  SonaConfig,
  LearnedPattern,
  SonaStats,
  SonaTrainingSample,
} from './rvf/SonaLearningBackend.js';

// Adaptive Index & Memory Management (ADR-005)
export { TemporalCompressor, IndexHealthMonitor } from './rvf/AdaptiveIndexTuner.js';
export type {
  CompressionTier,
  CompressedEntry,
  IndexHealth,
  CompressionStats,
} from './rvf/AdaptiveIndexTuner.js';

// Contrastive Embedding Improvement (ADR-005 Phase 3)
export { ContrastiveTrainer } from './rvf/ContrastiveTrainer.js';
export type {
  ContrastiveSample,
  TrainBatchResult,
  TrainingStats,
  CurriculumStage,
  ContrastiveConfig,
} from './rvf/ContrastiveTrainer.js';

// Semantic Query Router (ADR-005 Phase 3)
export { SemanticQueryRouter } from './rvf/SemanticQueryRouter.js';
export type {
  RouteMatch,
  IntentConfig,
  RouterConfig,
  RouterStats,
} from './rvf/SemanticQueryRouter.js';

// Federated Cross-Session Learning (ADR-005 Phase 4)
export { FederatedSessionManager, SessionHandle } from './rvf/FederatedSessionManager.js';
export type {
  FederatedConfig,
  SessionState,
  TrajectoryRecord,
  SessionStats,
  FederatedStats,
  FederatedPattern,
} from './rvf/FederatedSessionManager.js';

// Unified Self-Learning RVF Integration (ADR-006)
export { SelfLearningRvfBackend } from './rvf/SelfLearningRvfBackend.js';
export type {
  SelfLearningConfig,
  LearningStats,
} from './rvf/SelfLearningRvfBackend.js';

// Native Accelerator Bridge (ADR-007 Phase 1)
export { NativeAccelerator, getAccelerator, resetAccelerator } from './rvf/NativeAccelerator.js';
export type {
  AcceleratorStats,
  WitnessVerifyResult,
  SegmentVerifyResult,
} from './rvf/NativeAccelerator.js';
