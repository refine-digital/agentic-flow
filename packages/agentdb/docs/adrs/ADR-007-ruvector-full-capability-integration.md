# ADR-007: @ruvector Full Capability Integration

**Status:** Phase 1 Complete (Proposed for Phases 2-4)
**Date:** 2026-02-17
**Author:** System Architect (AgentDB v3)
**Supersedes:** None
**Related:** ADR-002 (WASM Integration), ADR-003 (RVF Format), ADR-004 (AGI), ADR-005 (Self-Learning), ADR-006 (Unified Self-Learning RVF)

## Context

AgentDB depends on 11 `@ruvector/*` npm packages but uses only a fraction of
their exported APIs. A deep audit of every package's type definitions against
AgentDB's `import` statements reveals significant untapped capability across
training, graph operations, quantization, persistence, and model management.

### Package Inventory (11 packages)

| Package                | Version | AgentDB Usage                      | Capability Coverage |
| ---------------------- | ------- | ---------------------------------- | ------------------- |
| `@ruvector/core`       | 0.1.30  | VectorDb HNSW search               | ~40%                |
| `@ruvector/attention`  | 0.1.4   | 5 attention types (fallback JS)    | ~15%                |
| `@ruvector/gnn`        | 0.1.23  | RuvectorLayer forward pass         | ~20%                |
| `@ruvector/graph-node` | 0.1.26  | Basic CRUD (addNode/addEdge/query) | ~15%                |
| `@ruvector/router`     | 0.1.28  | SemanticRouter.addRoute/route      | ~30%                |
| `@ruvector/ruvllm`     | 0.2.4   | FederatedCoordinator, LoraManager  | ~10%                |
| `@ruvector/rvf`        | 0.1.9   | RvfDatabase open/insert/search     | ~60%                |
| `@ruvector/rvf-node`   | 0.1.7   | NodeBackend (auto-detected)        | ~80%                |
| `@ruvector/rvf-solver` | 0.1.2   | ThompsonSampling policy            | ~70%                |
| `@ruvector/rvf-wasm`   | 0.1.6   | Availability check only            | ~5%                 |
| `@ruvector/sona`       | 0.1.5   | SonaEngine basic API               | ~30%                |

**Problem:** AgentDB leaves ~70% of available @ruvector capability unused.
This includes production-critical features: optimizers for training loops,
quantization for memory efficiency, graph transactions for consistency,
Cypher queries for complex traversals, WASM verification for audit trails,
and LoRA lifecycle management for federated learning.

## Decision

Integrate unused @ruvector capabilities in four phases, prioritized by
impact on AgentDB's core value proposition (memory persistence, search
quality, learning speed).

## Gap Analysis by Package

### 1. @ruvector/attention (v0.1.4) — 85% unused

**Currently used:**

- 5 attention mechanisms via JS fallbacks in `attention-fallbacks.ts`
- NAPI module loaded in `AttentionService.ts` (with fallback)

**Unused capabilities:**

| Category                | APIs                                                                                        | Priority | Phase |
| ----------------------- | ------------------------------------------------------------------------------------------- | -------- | ----- |
| **Optimizers**          | `AdamOptimizer`, `AdamWOptimizer`, `SgdOptimizer`                                           | HIGH     | 1     |
| **Loss Functions**      | `InfoNceLoss`, `LocalContrastiveLoss`, `SpectralRegularization`                             | HIGH     | 1     |
| **Curriculum Learning** | `CurriculumScheduler`, `TemperatureAnnealing`, `LearningRateScheduler`                      | MEDIUM   | 2     |
| **Mining**              | `HardNegativeMiner`, `InBatchMiner`                                                         | MEDIUM   | 2     |
| **Graph Attention**     | `GraphRoPeAttention`, `EdgeFeaturedAttention`, `DualSpaceAttention`, `LocalGlobalAttention` | LOW      | 3     |
| **Hyperbolic Math**     | `expMap`, `logMap`, `mobiusAddition`, `poincareDistance`                                    | LOW      | 3     |
| **Batch/Parallel**      | `batchAttention`, `parallelMultiHead`, `crossAttention`                                     | MEDIUM   | 2     |

**Impact:** AgentDB's `ContrastiveTrainer` currently implements InfoNCE loss
and AdamW in pure JavaScript. Switching to native NAPI versions provides
estimated 10-50x speedup for training loops.

### 2. @ruvector/ruvllm (v0.2.4) — 90% unused

**Currently used:**

- `FederatedCoordinator` (in `FederatedSessionManager.ts`)
- `LoraManager` (basic create/merge)

**Unused capabilities:**

| Category               | APIs                                                                                          | Priority | Phase |
| ---------------------- | --------------------------------------------------------------------------------------------- | -------- | ----- |
| **LLM Engine**         | `RuvLLM`, `StreamingGenerator`                                                                | LOW      | 4     |
| **Session Management** | `SessionManager`                                                                              | MEDIUM   | 2     |
| **SONA Coordination**  | `SonaCoordinator`, `TrajectoryBuilder`, `ReasoningBank`                                       | HIGH     | 1     |
| **EWC Memory**         | `EwcManager`                                                                                  | HIGH     | 1     |
| **LoRA Full API**      | `LoraAdapter` (apply/remove/merge), `TrainingPipeline`, `TrainingFactory`                     | HIGH     | 1     |
| **SIMD Ops**           | `SimdOps` (dot product, cosine similarity, L2 distance)                                       | HIGH     | 1     |
| **Model I/O**          | `SafeTensorsWriter`, `SafeTensorsReader`, `ModelExporter`, `ModelImporter`, `DatasetExporter` | MEDIUM   | 3     |

**Impact:** `SonaCoordinator` and `TrajectoryBuilder` provide native
trajectory management that AgentDB's `SonaLearningBackend` currently
reimplements in TypeScript. `SimdOps` provides NAPI-accelerated vector
math that would replace AgentDB's manual Float32Array loops. `EwcManager`
provides native EWC++ that `SelfLearningRvfBackend` approximates in JS.

### 3. @ruvector/graph-node (v0.1.26) — 85% unused

**Currently used:**

- `GraphDatabase`: `addNode`, `addEdge`, `query` (basic CRUD)
- Constructor with persistence path

**Unused capabilities:**

| Category                | APIs                                                 | Priority | Phase |
| ----------------------- | ---------------------------------------------------- | -------- | ----- |
| **Cypher Queries**      | `cypher(query)` — full Cypher query language         | HIGH     | 1     |
| **Transactions**        | `beginTransaction`, `commit`, `rollback`             | HIGH     | 1     |
| **Hyperedges**          | `addHyperedge`, `queryHyperedges`                    | MEDIUM   | 2     |
| **Temporal Hyperedges** | `addTemporalHyperedge`, `queryTemporalRange`         | MEDIUM   | 2     |
| **Streaming**           | `QueryResultStream`, `HyperedgeStream`, `NodeStream` | MEDIUM   | 3     |
| **Batch Insert**        | `batchInsert(nodes[])`                               | HIGH     | 1     |

**Impact:** Without transactions, `GraphDatabaseAdapter` has no consistency
guarantees for multi-step graph mutations. Cypher support would replace
the current imperative query building with declarative graph queries.
Batch insert would accelerate bulk memory ingestion 10-100x.

### 4. @ruvector/router (v0.1.28) — 70% unused

**Currently used:**

- `SemanticRouter`: `addRoute`, `route` (basic routing)

**Unused capabilities:**

| Category             | APIs                                                | Priority | Phase |
| -------------------- | --------------------------------------------------- | -------- | ----- |
| **VectorDb Class**   | Direct HNSW-backed VectorDb for route storage       | MEDIUM   | 2     |
| **Persistence**      | `save(path)`, `load(path)` — serialize router state | HIGH     | 1     |
| **Async Operations** | `routeAsync`, `addRouteAsync`                       | MEDIUM   | 2     |

**Impact:** `SemanticQueryRouter` rebuilds its route index from scratch on
every initialization because it doesn't use `save/load`. This means the
router loses all learned routes on restart. Persistence support would
give the router cross-session continuity.

### 5. @ruvector/sona (v0.1.5) — 70% unused

**Currently used:**

- `SonaEngine`: `init`, `recordStep`, `getAdaptation`, `exportState`, `importState`

**Unused capabilities:**

| Category               | APIs                                | Priority | Phase |
| ---------------------- | ----------------------------------- | -------- | ----- |
| **Trajectory Routing** | `setTrajectoryRoute`                | HIGH     | 1     |
| **Context Enrichment** | `addTrajectoryContext`              | HIGH     | 1     |
| **Base LoRA**          | `applyBaseLora`                     | MEDIUM   | 2     |
| **Pattern Discovery**  | `findPatterns`                      | HIGH     | 1     |
| **Flush**              | `flush` — force write pending state | MEDIUM   | 2     |

**Impact:** `SonaLearningBackend` records trajectories but never uses
`setTrajectoryRoute` (which enables route-specific adaptation) or
`findPatterns` (which discovers cross-trajectory patterns automatically).
These would significantly improve the self-learning pipeline's ability
to specialize by query type.

### 6. @ruvector/rvf-wasm (v0.1.6) — 95% unused

**Currently used:**

- Availability check in `detector.ts` and `factory.ts`

**Unused capabilities:**

| Category                 | APIs                                                                               | Priority | Phase |
| ------------------------ | ---------------------------------------------------------------------------------- | -------- | ----- |
| **Quantization**         | `rvf_load_sq_params`, `rvf_dequant_i8`, `rvf_load_pq_codebook`, `rvf_pq_distances` | HIGH     | 1     |
| **HNSW Navigation**      | `rvf_load_neighbors`, `rvf_greedy_step`                                            | MEDIUM   | 2     |
| **Segment Verification** | `rvf_verify_header`, `rvf_crc32c`                                                  | HIGH     | 1     |
| **Witness Chain**        | `rvf_witness_verify`, `rvf_witness_count`                                          | HIGH     | 1     |

**Impact:** The WASM microkernel provides browser-compatible quantization
(scalar + product quantization) that AgentDB cannot currently use.
Witness chain verification would allow clients to audit the tamper-evident
chain that `RvfSolver` creates, without requiring N-API bindings. Segment
verification provides integrity checks for `.rvf` files loaded from
untrusted sources.

### 7. @ruvector/gnn (v0.1.23) — 80% unused

**Currently used:**

- `RuvectorLayer`: `forward`, `hierarchicalForward`
- `TensorCompress`: `getCompressionLevel`

**Unused capabilities:**

| Category                  | APIs                                      | Priority | Phase |
| ------------------------- | ----------------------------------------- | -------- | ----- |
| **Differentiable Search** | `differentiableSearch`                    | MEDIUM   | 2     |
| **Full TensorCompress**   | `compress`, `decompress`, `batchCompress` | HIGH     | 1     |
| **Batch Forward**         | `batchForward`                            | MEDIUM   | 2     |

**Impact:** `AdaptiveIndexTuner` uses `getCompressionLevel` for tier
classification but never calls `compress`/`decompress` for actual data
reduction. Native tensor compression would reduce memory footprint for
large vector stores.

### 8. @ruvector/core (v0.1.30) — 60% unused

**Currently used:**

- `VectorDb`: CRUD, search, HNSW config

**Unused capabilities:**

| Category             | APIs                             | Priority | Phase |
| -------------------- | -------------------------------- | -------- | ----- |
| **Batch Operations** | `batchInsert`, `batchDelete`     | HIGH     | 1     |
| **Index Management** | `optimize`, `compact`, `rebuild` | MEDIUM   | 2     |
| **Persistence**      | `save`, `load`, `export`         | MEDIUM   | 2     |

## Integration Phases

### Phase 1: Critical Path (Weeks 1-3)

**Goal:** Replace JS reimplementations with native @ruvector APIs.

1. **Native Optimizers in ContrastiveTrainer**
   - Replace JS AdamW with `@ruvector/attention.AdamWOptimizer`
   - Replace JS InfoNCE with `@ruvector/attention.InfoNceLoss`
   - Expected: 10-50x training speedup

2. **Native EWC++ in SelfLearningRvfBackend**
   - Replace JS EWC approximation with `@ruvector/ruvllm.EwcManager`
   - Use `SimdOps` for vector math in hot paths

3. **WASM Verification APIs**
   - Integrate `rvf_witness_verify` and `rvf_witness_count` into RvfSolver
   - Add `rvf_verify_header` and `rvf_crc32c` to RvfBackend file loading
   - Enables client-side audit of witness chains

4. **Graph Transactions**
   - Wrap `GraphDatabaseAdapter` mutations in `beginTransaction`/`commit`/`rollback`
   - Add Cypher query support alongside imperative API

5. **Router Persistence**
   - Use `@ruvector/router` `save`/`load` in SemanticQueryRouter
   - Cross-session route continuity

6. **SONA Pattern Discovery**
   - Integrate `findPatterns` and `setTrajectoryRoute` into SonaLearningBackend
   - Enable route-specific trajectory adaptation

7. **Batch Operations**
   - Use `@ruvector/core.batchInsert` and `@ruvector/graph-node.batchInsert`
   - 10-100x bulk ingestion speedup

8. **Tensor Compression**
   - Use `@ruvector/gnn.TensorCompress.compress/decompress` in AdaptiveIndexTuner
   - Reduce memory footprint for cold-tier vectors

### Phase 2: Enhanced Learning (Weeks 4-6)

**Goal:** Deeper learning pipeline integration.

1. **Curriculum Learning**
   - Replace JS curriculum scheduling with `@ruvector/attention.CurriculumScheduler`
   - Integrate `TemperatureAnnealing` and `LearningRateScheduler`

2. **Hard Negative Mining**
   - Use `HardNegativeMiner` and `InBatchMiner` from `@ruvector/attention`
   - Replace `ContrastiveTrainer`'s JS mining implementation

3. **SessionManager Integration**
   - Use `@ruvector/ruvllm.SessionManager` for federated session lifecycle
   - Replace custom session tracking in `FederatedSessionManager`

4. **Temporal Hyperedges**
   - Use `@ruvector/graph-node` temporal hyperedge APIs
   - Model time-decaying relationships between memories

5. **Async Router Operations**
   - Migrate to `routeAsync`/`addRouteAsync`
   - Non-blocking route updates during search

6. **SONA Base LoRA + Flush**
   - Use `applyBaseLora` for pre-trained adaptation baselines
   - Use `flush` for guaranteed state persistence

7. **Differentiable Search**
   - Integrate `@ruvector/gnn.differentiableSearch` for gradient-informed retrieval
   - Enable end-to-end trainable search paths

### Phase 3: Advanced Features (Weeks 7-10)

**Goal:** Leverage advanced @ruvector capabilities.

1. **Graph Attention Mechanisms**
   - Integrate `GraphRoPeAttention`, `EdgeFeaturedAttention` from `@ruvector/attention`
   - Enable attention-weighted graph traversal

2. **Hyperbolic Embeddings**
   - Use `expMap`, `logMap`, `mobiusAddition`, `poincareDistance`
   - Better representation of hierarchical memory relationships

3. **Model Import/Export**
   - Use `SafeTensorsWriter/Reader` for model checkpoint persistence
   - Use `ModelExporter/Importer` for cross-instance model sharing

4. **Streaming Graph Queries**
   - Use `QueryResultStream`, `HyperedgeStream`, `NodeStream`
   - Support large-scale graph traversals without memory pressure

5. **WASM Quantization**
   - Integrate scalar quantization (`rvf_load_sq_params`, `rvf_dequant_i8`)
   - Integrate product quantization (`rvf_load_pq_codebook`, `rvf_pq_distances`)
   - 4-8x memory reduction for stored vectors

6. **HNSW Navigation (WASM)**
   - Use `rvf_load_neighbors`/`rvf_greedy_step` for browser-side search
   - Enable full vector search in WASM-only environments

### Phase 4: Full Ecosystem (Weeks 11-14)

**Goal:** Complete @ruvector integration for all use cases.

1. **LLM Engine Integration**
   - Explore `RuvLLM` and `StreamingGenerator` for inference
   - Evaluate `TrajectoryBuilder` and `ReasoningBank` native implementations

2. **Full LoRA Lifecycle**
   - Use `LoraAdapter` full API (apply/remove/merge per-layer)
   - Use `TrainingPipeline` and `TrainingFactory` for systematic training

3. **SONA Context Enrichment**
   - Integrate `addTrajectoryContext` for richer trajectory metadata
   - Enable multi-modal context in learning pipeline

4. **Index Management**
   - Use `@ruvector/core` `optimize`/`compact`/`rebuild` for index maintenance
   - Automated background index optimization

## Architecture: Wrapper Strategy

All @ruvector package integrations MUST follow the established lazy-loading
pattern with graceful fallback:

```typescript
// REQUIRED pattern for all @ruvector imports
class FeatureWrapper {
  private native: NativeModule | null = null;

  async initialize(): Promise<void> {
    try {
      const mod = await import("@ruvector/package-name");
      this.native = mod.FeatureClass;
    } catch {
      console.warn("@ruvector/package-name not available — using JS fallback");
    }
  }

  isNativeAvailable(): boolean {
    return this.native !== null;
  }
}
```

**Rationale:** All @ruvector packages are optional peer dependencies.
AgentDB must function (with degraded performance) when any or all packages
are missing. The lazy-loading pattern is already used by every existing
wrapper (`RvfBackend`, `SonaLearningBackend`, `SemanticQueryRouter`, etc.).

## Risks

| Risk                                                           | Likelihood | Mitigation                                                                        |
| -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| @ruvector API breaking changes (alpha packages)                | HIGH       | Pin exact versions in package.json; wrap all imports in version-checking adapters |
| Native module build failures on some platforms                 | MEDIUM     | WASM fallback for all N-API features; JS fallback for all WASM features           |
| Performance regression from abstraction layers                 | LOW        | Benchmark each integration against JS baseline; keep fast path native             |
| @ruvector/attention "completely broken" (per existing comment) | HIGH       | Keep JS fallbacks in `attention-fallbacks.ts`; test native on every CI run        |
| Increased bundle size from unused package imports              | LOW        | All imports are dynamic (`await import()`); tree-shaking at module level          |

## Success Metrics

| Metric                            | Current           | Phase 1 Target             | Phase 4 Target           |
| --------------------------------- | ----------------- | -------------------------- | ------------------------ |
| @ruvector capability coverage     | ~30%              | ~55%                       | ~90%                     |
| ContrastiveTrainer training speed | JS baseline       | 10-50x (native optimizers) | 50-100x                  |
| Bulk ingestion throughput         | Sequential insert | 10x (batch)                | 100x (batch + quantized) |
| Memory footprint (per 1M vectors) | ~4GB (f32)        | ~2GB (compression)         | ~500MB (PQ)              |
| Witness chain verification        | Server-only       | WASM-verified              | Full audit               |
| Graph mutation consistency        | No guarantees     | Transactional              | ACID                     |
| Router cold-start time            | Full rebuild      | Persisted                  | <100ms                   |
| Self-learning adaptation          | Static HNSW       | Route-aware                | Context-enriched         |

## Consequences

### Positive

- Eliminates JS reimplementations of native functionality (InfoNCE, AdamW, EWC++)
- Unlocks 10-100x performance improvements in training and bulk operations
- Provides transaction safety for graph mutations
- Enables browser-compatible vector operations via WASM quantization
- Gives witness chain auditability to all clients (not just N-API)
- Achieves near-complete utilization of @ruvector investment

### Negative

- Increased dependency surface on alpha-versioned packages
- More complex initialization logic (11 packages with individual availability checks)
- Testing matrix expands (with/without each @ruvector package)
- Migration risk for existing deployments using JS fallback paths

### Neutral

- Wrapper pattern remains the same (lazy-load + fallback) — no architectural change
- All integrations are additive — no existing API changes required
- Each phase is independently deployable and testable
