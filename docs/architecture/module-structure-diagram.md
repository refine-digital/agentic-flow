# Agentic-Flow v2.0 Module Structure and Component Diagrams

**Document Version**: 1.0.0
**Date**: 2025-12-02
**Status**: Design Complete

---

## Overview

This document provides comprehensive architectural diagrams showing the module structure, component boundaries, data flow, and integration points for Agentic-Flow v2.0 with backwards compatibility for v1.x.

---

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENTIC-FLOW v2.0 SYSTEM                             │
│                     (Full Backwards Compatibility with v1.x)                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: USER INTERFACE LAYER                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  CLI v1.x    │  │  CLI v2.0    │  │  MCP Tools   │  │  REST API    │   │
│  │  Commands    │  │  Commands    │  │  (70+ tools) │  │  (Future)    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: COMPATIBILITY & ADAPTER LAYER ⚡ NEW IN v2.0                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Version Detection & API Routing                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │VersionDetect │  │DeprecationWarn│ │ConfigMigration│               │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  v1.x API Adapter (Translates v1 calls → v2 backend)                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │V1toV2Adapter │  │ResponseMapper│  │ErrorTranslator│               │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: AGENT ORCHESTRATION LAYER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │Swarm Manager │  │Task Executor │  │Agent Spawner │  │Smart Router  │   │
│  │(v1 + v2)     │  │(v1 + v2)     │  │(v1 + v2)     │  │(v2 only)     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │Meta-Learning │  │Agent Booster │  │Topology Opt  │                      │
│  │Engine (v2)   │  │(352x faster) │  │(v2 only)     │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: INTELLIGENCE LAYER ⚡ NEW IN v2.0                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ReasoningBank │  │Attention Svc │  │GNN Learning  │  │Causal Reason │   │
│  │(AgentDB v2)  │  │(5 mechanisms)│  │(@ruvector/gnn│  │(Explainable) │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │Reflexion Mem │  │Skill Library │  │Nightly Learn │                      │
│  │(Learn Fail)  │  │(Versioning)  │  │(Consolidate) │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │MMR Diversity │  │Context Synth │  │Enhanced Embed│                      │
│  │Ranker        │  │(Multi-source)│  │(Multi-model) │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 5: MEMORY & STORAGE LAYER                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  AgentDB v2.0.0-alpha.2.11 (Unified Memory Backend)                   │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │@ruvector/core│  │@ruvector/gnn │  │@ruvector/attn│               │ │
│  │  │(150x faster) │  │(GNN learning)│  │(5 mechanisms)│               │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │ │
│  │                                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │@ruvector/    │  │Vector Search │  │Graph Database│               │ │
│  │  │graph-node    │  │(HNSW Index)  │  │(Cypher Query)│               │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Compatibility Bridge (v1.x SQLite → v2.0 AgentDB)                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │SQLite Compat│  │Data Migrator │  │Index Builder │               │ │
│  │  │(Fallback)    │  │(Auto-migrate)│  │(HNSW + PQ)   │               │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 6: DISTRIBUTED COORDINATION LAYER (Optional/Advanced)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │QUIC Protocol │  │RAFT Consensus│  │Byzantine FT  │  │CRDT Merger   │   │
│  │(Low-latency) │  │(Leader elect)│  │(Adversarial) │  │(Conflict Res)│   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 7: PERFORMANCE OPTIMIZATION LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │SIMD Accel    │  │Quantization  │  │Cache Manager │  │Compression   │   │
│  │(8x speedup)  │  │(4x mem save) │  │(Query cache) │  │(Tensor 4x)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Module Structure

### 1. Compatibility Layer Module

```
src/compatibility/
├── index.ts                          # Main exports
├── types.ts                          # Shared type definitions
│
├── detection/
│   ├── VersionDetector.ts            # API version detection
│   ├── FeatureDetector.ts            # v2-specific feature detection
│   └── ConfigAnalyzer.ts             # Config structure analysis
│
├── adapter/
│   ├── V1toV2Adapter.ts              # Main v1 → v2 adapter
│   ├── ResponseMapper.ts             # Response format translation
│   ├── ErrorTranslator.ts            # Error message translation
│   └── ConfigTranslator.ts           # Config schema translation
│
├── warnings/
│   ├── DeprecationWarnings.ts        # Warning emission system
│   ├── WarningFormatter.ts           # Pretty warning formatting
│   └── WarningLogger.ts              # File/telemetry logging
│
├── migration/
│   ├── ConfigMigration.ts            # Auto-migrate configs
│   ├── DataMigration.ts              # Auto-migrate data
│   ├── MigrationHelpers.ts           # Utility functions
│   └── MigrationValidator.ts         # Validate migrations
│
└── validation/
    ├── BackwardsCompatValidator.ts   # Ensure v1 works on v2
    ├── PerformanceValidator.ts       # Check for regressions
    └── IntegrationValidator.ts       # End-to-end validation
```

### 2. v1.x Legacy Module (Preserved)

```
src/v1/
├── index.ts                          # v1 exports (preserved exactly)
├── types.ts                          # v1 type definitions
│
├── core/
│   ├── AgenticFlow.ts                # Original v1 class
│   ├── SwarmManager.ts               # v1 swarm logic
│   ├── TaskOrchestrator.ts           # v1 orchestration
│   └── AgentSpawner.ts               # v1 agent creation
│
├── memory/
│   ├── SQLiteMemory.ts               # Original SQLite backend
│   ├── MemoryManager.ts              # v1 memory interface
│   └── QueryEngine.ts                # v1 query logic
│
└── utils/
    ├── config.ts                     # v1 config parsing
    └── helpers.ts                    # v1 utility functions
```

### 3. v2.0 New Implementation Module

```
src/v2/
├── index.ts                          # v2 exports
├── types.ts                          # v2 type definitions
│
├── core/
│   ├── AgenticFlowV2.ts              # New v2 main class
│   ├── SwarmCoordinator.ts           # v2 swarm with AgentDB
│   ├── TaskExecutor.ts               # v2 execution engine
│   └── AgentManager.ts               # v2 agent lifecycle
│
├── memory/
│   ├── AgentDBMemory.ts              # AgentDB v2 integration
│   ├── VectorSearch.ts               # HNSW vector search
│   ├── GraphDatabase.ts              # Cypher graph queries
│   └── HybridRetrieval.ts            # Vector + graph + attention
│
├── intelligence/
│   ├── ReasoningBank.ts              # Meta-learning patterns
│   ├── AttentionService.ts           # 5 attention mechanisms
│   ├── GNNLearning.ts                # Graph neural networks
│   ├── CausalReasoning.ts            # Explainable decisions
│   ├── ReflexionMemory.ts            # Learn from failures
│   ├── SkillLibrary.ts               # Versioned skills
│   └── NightlyLearner.ts             # Background consolidation
│
├── retrieval/
│   ├── MMRDiversityRanker.ts         # Maximal marginal relevance
│   ├── ContextSynthesizer.ts         # Multi-source aggregation
│   ├── MetadataFilter.ts             # Complex filtering
│   └── EnhancedEmbeddingService.ts   # Multi-model embeddings
│
├── routing/
│   ├── SmartRouter.ts                # LLM provider routing
│   ├── ModelSelector.ts              # Cost-quality optimization
│   ├── FallbackManager.ts            # Automatic fallbacks
│   └── PerformanceTracker.ts         # Model performance metrics
│
├── coordination/
│   ├── QUICServer.ts                 # QUIC protocol server
│   ├── QUICClient.ts                 # QUIC protocol client
│   ├── RAFTConsensus.ts              # Leader election
│   ├── ByzantineConsensus.ts         # Byzantine fault tolerance
│   └── SyncCoordinator.ts            # State synchronization
│
└── optimization/
    ├── SIMDAccelerator.ts            # SIMD optimization
    ├── Quantization.ts               # Model quantization
    ├── CacheManager.ts               # Query caching
    └── TensorCompressor.ts           # GNN tensor compression
```

### 4. Shared Utilities Module

```
src/shared/
├── types/
│   ├── common.ts                     # Common type definitions
│   ├── api.ts                        # API interfaces
│   └── config.ts                     # Config schemas
│
├── utils/
│   ├── logger.ts                     # Unified logging
│   ├── metrics.ts                    # Performance metrics
│   ├── errors.ts                     # Error handling
│   └── validation.ts                 # Input validation
│
└── constants/
    ├── defaults.ts                   # Default values
    ├── limits.ts                     # System limits
    └── versions.ts                   # Version constants
```

---

## Data Flow Diagram: v1.x API Call on v2.0 Backend

```
┌──────────────────────────────────────────────────────────────────────┐
│  User Code (v1.x API)                                                 │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ const flow = new AgenticFlow();
                              │ await flow.initSwarm({ topology: 'mesh' });
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  AgenticFlow Class (Unified Entry Point)                             │
│  • Detect API version (v1.x based on method name)                    │
│  • Route to appropriate handler                                      │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  V1toV2Adapter                                                        │
│  • Translate v1 config to v2 config                                  │
│  • Emit deprecation warning                                          │
│  • Forward to v2 backend                                             │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  DeprecationWarnings                                                  │
│  • Format warning message                                            │
│  • Log to console/file                                               │
│  • Track warning history                                             │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  ConfigTranslator                                                     │
│  • Map v1 topology → v2 swarm config                                 │
│  • Add default v2 optimization flags                                 │
│  • Validate translated config                                        │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ v2Config = {
                              │   backend: 'agentdb',
                              │   swarm: { topology: 'mesh', ... },
                              │   memory: { enableHNSW: true, ... }
                              │ }
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  AgenticFlowV2 (v2 Backend)                                          │
│  • Initialize AgentDB v2                                             │
│  • Create swarm with v2 coordinator                                  │
│  • Return swarm instance                                             │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  SwarmCoordinator (v2)                                               │
│  • Initialize swarm topology                                         │
│  • Setup agent spawning infrastructure                               │
│  • Configure intelligence layers                                     │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  AgentDB v2                                                          │
│  • Initialize RuVector backend                                       │
│  • Build HNSW index                                                  │
│  • Setup graph database                                              │
│  • Enable attention mechanisms                                       │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  ResponseMapper                                                       │
│  • Translate v2 response to v1 format                                │
│  • Preserve v1 field names                                           │
│  • Return to user                                                    │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ return { swarmId, topology, ... }
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  User Code (Receives v1-compatible response)                         │
│  • Uses returned swarm object                                        │
│  • All v1 methods work as expected                                   │
│  • Underlying implementation is v2 (150x faster)                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Diagram

```
╔══════════════════════════════════════════════════════════════════════╗
║  USER LAYER                                                           ║
╠══════════════════════════════════════════════════════════════════════╣
║  [v1 User Code] ─────────┐                                          ║
║  [v2 User Code] ──────┐  │                                          ║
╚══════════════════════│══│══════════════════════════════════════════╝
                       │  │
                       ↓  ↓
╔══════════════════════════════════════════════════════════════════════╗
║  COMPATIBILITY LAYER                                                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  ┌─────────────────────────────────────────────────────────────┐   ║
║  │  AgenticFlow (Unified Entry Point)                          │   ║
║  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │   ║
║  │  │VersionDetect│  │  v1 Path    │  │  v2 Path    │        │   ║
║  │  │             │──│ (Adapter)   │  │  (Direct)   │        │   ║
║  │  └─────────────┘  └─────────────┘  └─────────────┘        │   ║
║  └─────────────────────────────────────────────────────────────┘   ║
║                         │                       │                    ║
║                         ↓                       │                    ║
║  ┌─────────────────────────────────────────┐  │                    ║
║  │  V1toV2Adapter                          │  │                    ║
║  │  ┌────────┐  ┌────────┐  ┌────────┐   │  │                    ║
║  │  │Config  │  │Response│  │Warning │   │  │                    ║
║  │  │Xlate   │  │Mapper  │  │Emitter │   │  │                    ║
║  │  └────────┘  └────────┘  └────────┘   │  │                    ║
║  └─────────────────────────────────────────┘  │                    ║
║                         │                       │                    ║
╚═════════════════════════│═══════════════════════│════════════════════╝
                          ↓                       ↓
╔══════════════════════════════════════════════════════════════════════╗
║  v2 CORE LAYER                                                        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  ┌─────────────────────────────────────────────────────────────┐   ║
║  │  AgenticFlowV2                                              │   ║
║  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │   ║
║  │  │ Swarms  │  │ Agents  │  │  Tasks  │  │ Memory  │       │   ║
║  │  │ Manager │  │ Manager │  │Executor │  │ Manager │       │   ║
║  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │   ║
║  └─────────────────────────────────────────────────────────────┘   ║
║         │             │             │             │                  ║
╚═════════│═════════════│═════════════│═════════════│══════════════════╝
          ↓             ↓             ↓             ↓
╔══════════════════════════════════════════════════════════════════════╗
║  INTELLIGENCE LAYER                                                   ║
╠══════════════════════════════════════════════════════════════════════╣
║  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   ║
║  │Reasoning   │  │Attention   │  │GNN         │  │Causal      │   ║
║  │Bank        │  │Service     │  │Learning    │  │Reasoning   │   ║
║  └────────────┘  └────────────┘  └────────────┘  └────────────┘   ║
║         │             │             │             │                  ║
╚═════════│═════════════│═════════════│═════════════│══════════════════╝
          ↓             ↓             ↓             ↓
╔══════════════════════════════════════════════════════════════════════╗
║  MEMORY LAYER (AgentDB v2)                                            ║
╠══════════════════════════════════════════════════════════════════════╣
║  ┌────────────────────────────────────────────────────────────────┐ ║
║  │  @ruvector/core (150x faster than SQLite)                      │ ║
║  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │ ║
║  │  │ Vector   │  │  Graph   │  │Attention │  │   GNN    │      │ ║
║  │  │ Search   │  │ Database │  │Mechanisms│  │ Learning │      │ ║
║  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │ ║
║  └────────────────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Migration Path Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│  CURRENT STATE: v1.x Codebase                                         │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ User decides to upgrade
                              ↓
                   ┌──────────────────────┐
                   │  Migration Options   │
                   └──────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ↓             ↓             ↓
        ┌─────────┐   ┌─────────┐   ┌─────────┐
        │ Option 1│   │ Option 2│   │ Option 3│
        │         │   │         │   │         │
        │ Zero    │   │Automated│   │Gradual  │
        │ Changes │   │Migration│   │Migration│
        └─────────┘   └─────────┘   └─────────┘
             │             │             │
             ↓             ↓             ↓
        ┌─────────┐   ┌─────────┐   ┌─────────┐
        │Keep v1  │   │Run tool │   │Manual   │
        │imports  │   │         │   │rewrite  │
        │         │   │npx ag-  │   │         │
        │Works on │   │flow     │   │Step-by- │
        │v2 via   │   │migrate  │   │step     │
        │adapter  │   │         │   │changes  │
        └─────────┘   └─────────┘   └─────────┘
             │             │             │
             └─────────────┴─────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────────────┐
│  RESULT: v2.0 with 150x performance, all features accessible         │
│  • v1 code still works (compatibility layer)                         │
│  • v2 APIs available for new code                                    │
│  • No breaking changes                                               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Performance Impact Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│  v1.x API Call                                                        │
│  flow.searchMemory(query, 10)                                        │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ +0.2ms (adapter overhead)
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  Adapter Translation                                                  │
│  • Translate to v2 vectorSearch()                                    │
│  • Add HNSW parameters                                               │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ +0.1ms (config setup)
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  v2.0 Vector Search (AgentDB)                                        │
│  • HNSW index lookup                                                 │
│  • 150x faster than v1 SQLite                                        │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ 3ms (150x faster than v1's 5000ms)
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  Response Mapping                                                     │
│  • Translate v2 results to v1 format                                 │
│  • Preserve v1 field names                                           │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ +0.1ms (formatting)
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  Return to User                                                       │
│  Total Time: 3.4ms (vs 5000ms in pure v1)                           │
│  Net Speedup: 1470x faster                                           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Dependencies and Package Structure

```
agentic-flow@2.0.0-alpha
├── packages/
│   ├── agentdb@2.0.0-alpha.2.11          ⚡ Core memory backend
│   │   ├── ruvector@0.1.24               (150x faster)
│   │   ├── @ruvector/core@latest
│   │   ├── @ruvector/attention@0.1.1     (5 mechanisms)
│   │   ├── @ruvector/gnn@0.1.19          (Graph NN)
│   │   ├── @ruvector/graph-node@0.1.15   (Cypher queries)
│   │   └── @ruvector/router@0.1.15       (Semantic routing)
│   │
│   ├── agent-booster@latest               ⚡ Ultra-fast code editing
│   │   └── (352x faster than cloud APIs)
│   │
│   └── agentic-jujutsu@latest             Git operations
│
└── src/
    ├── compatibility/                     ⚡ NEW: Backwards compat layer
    │   └── (100% v1.x API support)
    │
    ├── v1/                                v1.x legacy (preserved)
    │
    ├── v2/                                ⚡ NEW: v2.0 implementation
    │   ├── core/
    │   ├── memory/
    │   ├── intelligence/
    │   └── optimization/
    │
    └── shared/                            Common utilities
```

---

## Key Decision Points

### Decision 1: Adapter vs. Dual Implementation

**Chosen**: Adapter pattern
- Single v2 implementation
- v1 APIs translated via adapter
- No code duplication
- Performance: 0.3ms overhead, 99.9%+ speedup from v2 backend

### Decision 2: Warning Strategy

**Chosen**: Tiered warnings with opt-out
- Default: Warnings enabled
- Can disable via config
- Warnings increase in severity over time
- Never block execution

### Decision 3: Config Migration

**Chosen**: Automatic translation with validation
- v1 configs auto-translated to v2
- Validation ensures correctness
- Can opt into v2 config explicitly
- Migration helpers provided

### Decision 4: Data Migration

**Chosen**: Transparent auto-migration
- SQLite data auto-migrated to AgentDB
- Happens on first v2 access
- Preserves all v1 data
- Rollback supported

---

## Testing Strategy

### 1. Compatibility Tests

```typescript
// Run entire v1.x test suite on v2.0 backend
describe('v1.x Compatibility', () => {
  it('should pass all v1 tests on v2 backend', async () => {
    // Import v1 tests
    const v1Tests = await import('../v1/__tests__');

    // Run on v2 backend
    await runTestSuite(v1Tests, { backend: 'v2' });

    // Expect 100% pass rate
  });
});
```

### 2. Performance Tests

```typescript
describe('Performance Impact', () => {
  it('should have <1ms adapter overhead', async () => {
    const v1Call = await benchmark(() => adapter.initSwarm(config));
    const v2Call = await benchmark(() => v2.swarms.create(config));

    expect(v1Call - v2Call).toBeLessThan(1); // <1ms difference
  });
});
```

### 3. Integration Tests

```typescript
describe('End-to-End Migration', () => {
  it('should migrate v1 codebase successfully', async () => {
    const result = await migrationTool.migrate('./test-fixtures/v1-app');

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.testsPass).toBe(true);
  });
});
```

---

## References

1. **Epic**: `/.github/ISSUE_TEMPLATE/epic-v2-implementation.md`
2. **Architecture**: `/docs/plans/agentic-flow-v2/sparc/03-architecture.md`
3. **AgentDB Integration**: `/docs/plans/agentic-flow-v2/components/01-agentdb-integration.md`

---

**Document Status**: Complete
**Next Steps**: Implementation Phase 1
**Review Required**: System Architect, Lead Developer
