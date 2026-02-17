# ADR-005: Self-Learning Pipeline Integration

**Status:** Accepted
**Date:** 2026-02-17
**Author:** System Architect (AgentDB v3)
**Supersedes:** None
**Related:** ADR-003 (RVF Format), ADR-004 (AGI Capabilities)

## Context

ADR-004 established the RVF solver and 4 AGI N-API methods. Six additional
@ruvector packages are installed but underutilized:

- **@ruvector/sona** (native adaptive learning engine) -- UNUSED
- **@ruvector/ruvllm** (federated learning, LoRA, training pipeline) -- UNUSED
- **@ruvector/attention** training infra (optimizers, losses, miners) -- UNUSED
- **@ruvector/gnn** TensorCompress (access-frequency compression) -- UNUSED
- **@ruvector/graph-node** temporal hyperedges + subscribe() -- UNUSED
- **@ruvector/router** SemanticRouter (intent-based routing) -- UNUSED

The current learning pipeline uses pure JS implementations where native
N-API equivalents exist with 10-100x better performance.

### Package Assessment

#### @ruvector/sona@0.1.5 -- Self-Optimizing Neural Architecture (N-API)

| Method                                                         | Description                       |
| -------------------------------------------------------------- | --------------------------------- |
| `beginTrajectory(queryEmbedding)`                              | Start trajectory recording        |
| `addTrajectoryStep(id, activations, attentionWeights, reward)` | Record step                       |
| `endTrajectory(id, quality)`                                   | End trajectory with quality score |
| `applyMicroLora(input)`                                        | Apply micro-LoRA transformation   |
| `applyBaseLora(layerIdx, input)`                               | Apply base-LoRA per layer         |
| `tick()`                                                       | Run background learning cycle     |
| `forceLearn()`                                                 | Immediate learning cycle          |
| `findPatterns(queryEmbedding, k)`                              | Discover learned patterns         |
| `getStats()`                                                   | Engine statistics                 |

Config: hiddenDim, embeddingDim, microLoraRank, baseLoraRank, ewcLambda,
patternClusters, trajectoryCapacity, backgroundIntervalMs, qualityThreshold

#### @ruvector/gnn@0.1.23 -- TensorCompress (N-API)

| Method                                | Description                              |
| ------------------------------------- | ---------------------------------------- |
| `compress(embedding, accessFreq)`     | Adaptive compression by access frequency |
| `compressWithLevel(embedding, level)` | Direct level: none/half/pq8/pq4/binary   |
| `decompress(compressedJson)`          | Lossless decompression                   |
| `getCompressionLevel(accessFreq)`     | Frequency -> compression tier mapping    |

#### @ruvector/attention@0.1.4 -- Training Infrastructure (N-API)

| Export                | Description                                |
| --------------------- | ------------------------------------------ |
| `InfoNceLoss`         | Contrastive loss for embedding improvement |
| `HardNegativeMiner`   | Hard negative sampling for training        |
| `CurriculumScheduler` | Progressive difficulty scaling             |
| `DualSpaceAttention`  | Euclidean + Hyperbolic dual-space          |
| `AdamWOptimizer`      | Weight-decayed Adam optimizer              |

#### @ruvector/router@0.1.28 -- Semantic Router (N-API)

| Export           | Description                                      |
| ---------------- | ------------------------------------------------ |
| `SemanticRouter` | Intent-based query routing with learned patterns |
| `VectorDb`       | HNSW vector database with SIMD                   |

## Decision

Integrate the self-learning pipeline across 4 phases:

### Phase 1: SONA Native Learning Engine

- Create `SonaLearningBackend` implementing the `LearningBackend` interface
- Wire `SonaEngine` into `LearningSystem` trajectory lifecycle
- Replace JS SonaCoordinator calls with native SonaEngine
- Add `SonaEngine.tick()` to periodic maintenance
- Estimated: 1 new file, ~250 lines

### Phase 2: Adaptive Index & Memory Management

- Create `AdaptiveIndexTuner` using solver Thompson Sampling for query strategy
- Create `TemporalCompressor` using `TensorCompress` for memory decay
- Add `IndexHealthMonitor` using `indexStats()` + performance stats
- Wire into NightlyLearner as periodic maintenance tasks
- Estimated: 1 new file, ~300 lines

### Phase 3: Contrastive Embedding Improvement

- Add `ContrastiveTrainer` using `InfoNceLoss` + `HardNegativeMiner`
- Integrate `CurriculumScheduler` for progressive training difficulty
- Estimated: 1 new file, ~200 lines

### Phase 4: Federated Cross-Session Learning (Future)

- Wrap sessions in `EphemeralAgent`
- Aggregate via `FederatedCoordinator`
- Export/import trajectory state across sessions
- Estimated: 2-3 files, ~300 lines

## Security

- SonaEngine operates on embeddings only (no user text)
- TensorCompress is lossless/reversible (decompression available)
- All new APIs are bounded by existing dimension/batch limits
- EWC lambda prevents catastrophic forgetting (bounded 0-1)
- Trajectory capacity has a configurable upper bound

## Performance

| Operation                     | Expected Latency        |
| ----------------------------- | ----------------------- |
| `SonaEngine.applyMicroLora()` | <1ms (N-API native)     |
| `SonaEngine.tick()`           | <5ms (background batch) |
| `TensorCompress.compress()`   | <100us per vector       |
| `InfoNceLoss.forward()`       | <1ms per batch          |
| `SemanticRouter.route()`      | <500us (HNSW + SIMD)    |

## Consequences

### Positive

- 10-100x learning performance improvement (native N-API vs pure JS)
- Automatic memory management via access-frequency compression
- Self-improving query quality via contrastive embedding refinement
- EWC++ prevents catastrophic forgetting across task switches
- Tamper-evident learning provenance (SHAKE-256 witness chains)

### Negative

- Increased dependency on @ruvector N-API binaries
- More complex initialization/configuration surface
- SonaEngine requires lifecycle management

### Risks

- N-API binary compatibility across platforms (mitigated: WASM fallback exists)
- Learning instability from multiple adaptive systems (mitigated: EWC protection)
- Memory growth from trajectory buffers (mitigated: TensorCompress + TTL)
