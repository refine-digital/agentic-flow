# RuVector Package Allocation Strategy
## Which Packages Go Where: agentdb vs agentic-flow

**Date:** 2025-12-30
**Purpose:** Clear allocation of 15 RuVector packages between agentdb and agentic-flow
**Principle:** Data/storage in agentdb, orchestration/routing in agentic-flow

---

## 🎯 Allocation Principle

### agentdb (Database Layer)
**Purpose:** Vector database, memory persistence, data storage, learning backends
**Focus:** Data infrastructure, vector operations, graph storage, persistence

### agentic-flow (Orchestration Layer)
**Purpose:** Agent coordination, task routing, workflow orchestration, LLM integration
**Focus:** Agent management, task scheduling, multi-agent coordination

---

## 📦 Package Allocation Matrix

### ✅ agentdb Packages (Database Infrastructure - 7 packages)

| Package | Version | Why agentdb | Integration Point |
|---------|---------|-------------|-------------------|
| **ruvector** (core) | 0.1.38 | ✅ **Core vector database** | `src/backends/ruvector/RuVectorBackend.ts` |
| **@ruvector/postgres-cli** | 0.2.6 | ✅ **PostgreSQL backend** | NEW: `src/backends/postgres/PostgresBackend.ts` |
| **@ruvector/graph-node** | 0.1.25 | ✅ **Hypergraph storage** | `src/controllers/CausalMemoryGraph.ts` |
| **@ruvector/attention** | 0.1.3 | ✅ **Attention mechanisms** | `src/controllers/AttentionService.ts` |
| **@ruvector/gnn** | 0.1.22 | ✅ **Graph neural networks** | `src/backends/ruvector/RuVectorLearning.ts` |
| **@ruvector/sona** | 0.1.4 | ✅ **Federated learning** | `src/services/federated-learning.ts` |
| **@ruvector/cluster** | 0.1.0 | ✅ **Distributed clustering** | NEW: `src/distributed/cluster-manager.ts` |

**Rationale:** These are all **data infrastructure** components - storage backends, learning systems, and distributed data management.

---

### ✅ agentic-flow Packages (Orchestration Layer - 6 packages)

| Package | Version | Why agentic-flow | Integration Point |
|---------|---------|------------------|-------------------|
| **@ruvector/ruvllm** | 0.2.3 | ✅ **LLM orchestration** | NEW: `src/llm/ruvllm-orchestrator.ts` |
| **@ruvector/tiny-dancer** | 0.1.15 | ✅ **Agent routing** | NEW: `src/router/tiny-dancer-router.ts` |
| **@ruvector/router** | 0.1.25 | ✅ **Semantic routing** | NEW: `src/router/semantic-router.ts` |
| **@ruvector/rudag** | 0.1.0 | ✅ **Task scheduling** | NEW: `src/orchestration/dag-scheduler.ts` |
| **@ruvector/agentic-synth** | 0.1.6 | ✅ **Training data gen** | NEW: `scripts/generate-training-data.ts` |
| **spiking-neural** | 1.0.1 | ✅ **Pattern detection** | NEW: `src/neural/spiking-pattern-detector.ts` |

**Rationale:** These are all **orchestration** components - agent selection, task routing, workflow optimization, and training.

---

### 🔄 Shared/Utility Packages (2 packages)

| Package | Version | Primary | Secondary | Usage |
|---------|---------|---------|-----------|-------|
| **@ruvector/server** | 0.1.0 | agentdb | agentic-flow | **Primary:** Expose agentdb as HTTP/gRPC service<br>**Secondary:** Could expose agentic-flow API |
| **@ruvector/rvlite** | 0.2.4 | Development | Development | **CLI debugging tool** - installed globally, not in either package |

---

## 📋 Detailed Allocation Breakdown

### 🗄️ AGENTDB PACKAGES (Database Infrastructure)

#### 1. ruvector@0.1.38 (Core)
**Current:** ✅ Already integrated
**Location:** `packages/agentdb/package.json`
**Use Cases:**
- Vector storage backend
- HNSW indexing
- Similarity search
- Core database operations

**Why agentdb:**
- Foundation of vector database
- All vector operations go through this
- Data persistence layer

**Integration:**
```json
// packages/agentdb/package.json
{
  "dependencies": {
    "ruvector": "^0.1.38"  // UPDATE from 0.1.30
  }
}
```

---

#### 2. @ruvector/postgres-cli@0.2.6 (Enterprise Backend)
**Status:** 🆕 NEW - Not integrated
**Location:** `packages/agentdb/package.json`
**Use Cases:**
- Production-scale vector database
- 53+ SQL vector functions
- ACID transactions
- Enterprise deployment

**Why agentdb:**
- Alternative storage backend
- Database infrastructure
- Replaces SQLite for production
- Direct competitor to pgvector

**Integration:**
```typescript
// packages/agentdb/src/backends/postgres/PostgresBackend.ts
import { Client } from 'pg';

export class PostgresRuVectorBackend implements VectorBackend {
  readonly name = 'postgres-ruvector' as const;
  private client: Client;

  async initialize() {
    // Connect to RuVector PostgreSQL
    // Use 53+ SQL functions
  }
}
```

**Configuration:**
```json
{
  "dependencies": {
    "@ruvector/postgres-cli": "^0.2.6",
    "pg": "^8.11.0"
  }
}
```

---

#### 3. @ruvector/graph-node@0.1.25 (Hypergraph Storage)
**Status:** 🆕 NEW - Not integrated
**Location:** `packages/agentdb/package.json`
**Use Cases:**
- CausalMemoryGraph backend (10x faster)
- Hyperedge support (N-way relationships)
- Cypher query execution
- Persistent graph storage

**Why agentdb:**
- Graph database storage
- Backend for CausalMemoryGraph controller
- Data persistence layer
- 10x faster than in-memory graphs

**Integration:**
```typescript
// packages/agentdb/src/controllers/CausalMemoryGraph.ts
import { HyperGraph } from '@ruvector/graph-node';

export class CausalMemoryGraph {
  private graph: HyperGraph;

  async initialize() {
    this.graph = new HyperGraph({
      persistent: true,
      path: './data/causal-graph.db'
    });
  }
}
```

---

#### 4. @ruvector/attention@0.1.3 (Attention Mechanisms)
**Current:** ✅ Already integrated (v0.1.2)
**Location:** `packages/agentdb/package.json`
**Use Cases:**
- Attention-based vector operations
- Enhanced embedding quality
- Attention service

**Why agentdb:**
- Core vector operation
- Improves embedding quality
- Part of database infrastructure

**Update:**
```json
{
  "dependencies": {
    "@ruvector/attention": "^0.1.3"  // UPDATE from 0.1.2
  }
}
```

---

#### 5. @ruvector/gnn@0.1.22 (Graph Neural Networks)
**Current:** ✅ Already integrated
**Location:** `packages/agentdb/package.json`
**Use Cases:**
- Graph-based learning
- Pattern propagation
- Federated learning backend

**Why agentdb:**
- Learning backend
- Graph data processing
- Database-level learning

**Status:** Already current in agentdb

---

#### 6. @ruvector/sona@0.1.4 (Federated Learning)
**Current:** ✅ Already integrated (v0.1.3)
**Location:** `packages/agentdb/package.json`
**Use Cases:**
- Federated learning
- Adaptive learning
- LoRA + EWC++ training

**Why agentdb:**
- Database-level learning
- Memory persistence learning
- Part of data infrastructure

**Update:**
```json
{
  "dependencies": {
    "@ruvector/sona": "^0.1.4"  // UPDATE from 0.1.3
  }
}
```

---

#### 7. @ruvector/cluster@0.1.0 (Distributed Clustering)
**Status:** 🆕 NEW - Not integrated
**Location:** `packages/agentdb/package.json`
**Use Cases:**
- Distributed vector database
- Raft consensus
- Auto-sharding
- Multi-node deployment

**Why agentdb:**
- Database distribution
- Data replication
- Scaling the storage layer
- Enterprise deployment

**Integration:**
```typescript
// packages/agentdb/src/distributed/cluster-manager.ts
import { ClusterManager } from '@ruvector/cluster';

export class DistributedAgentDB {
  private cluster: ClusterManager;

  async initialize(nodes: string[]) {
    this.cluster = new ClusterManager({
      nodes,
      raft: { /* config */ },
      sharding: { strategy: 'consistent-hash' }
    });
  }
}
```

---

### 🤖 AGENTIC-FLOW PACKAGES (Orchestration Layer)

#### 1. @ruvector/ruvllm@0.2.3 (LLM Orchestration)
**Status:** 🆕 NEW - Not integrated
**Location:** `agentic-flow/package.json`
**Use Cases:**
- Multi-step reasoning (TRM)
- Self-learning orchestration (SONA)
- Agent routing (FastGRNN)
- Memory-augmented agents (HNSW)

**Why agentic-flow:**
- Orchestrates LLM interactions
- Agent workflow management
- Task planning and decomposition
- Application-level intelligence

**Integration:**
```typescript
// agentic-flow/src/llm/ruvllm-orchestrator.ts
import { RuvLLM } from '@ruvector/ruvllm';

export class AgenticFlowOrchestrator {
  private ruvllm: RuvLLM;

  async orchestrateTask(userQuery: string) {
    // TRM recursive reasoning
    const plan = await this.ruvllm.reason({ prompt: userQuery });

    // FastGRNN routing
    const agents = await Promise.all(
      plan.steps.map(step => this.ruvllm.route({ query: step }))
    );

    // Execute with memory
    return this.executeWithMemory(plan, agents);
  }
}
```

**Configuration:**
```json
{
  "dependencies": {
    "@ruvector/ruvllm": "^0.2.3"
  }
}
```

---

#### 2. @ruvector/tiny-dancer@0.1.15 (Neural Router)
**Status:** 🆕 NEW - Not integrated
**Location:** `agentic-flow/package.json`
**Use Cases:**
- Agent routing with circuit breaker
- Fault tolerance
- Uncertainty estimation
- Hot-reload routing models

**Why agentic-flow:**
- Routes tasks to agents
- Application-level routing
- Workflow orchestration
- Production reliability

**Integration:**
```typescript
// agentic-flow/src/router/tiny-dancer-router.ts
import { TinyDancer } from '@ruvector/tiny-dancer';

export class ProductionAgentRouter {
  private router: TinyDancer;

  async routeWithCircuitBreaker(query: string) {
    const decision = await this.router.route(query);

    if (this.router.isCircuitOpen(decision.agent)) {
      // Fallback to alternative
      return this.getFallbackAgent(decision);
    }

    return decision;
  }
}
```

---

#### 3. @ruvector/router@0.1.25 (Semantic Router)
**Status:** 🆕 NEW - Not integrated
**Location:** `agentic-flow/package.json`
**Use Cases:**
- HNSW-based intent matching
- Semantic agent selection
- 66 agent routing

**Why agentic-flow:**
- Routes user queries to agents
- Application-level semantic matching
- Agent orchestration

**Integration:**
```typescript
// agentic-flow/src/router/semantic-router.ts
import { SemanticRouter } from '@ruvector/router';

export class AgenticFlowRouter {
  async routeToAgent(userIntent: string): Promise<AgentType> {
    const match = await this.router.match(userIntent);
    return this.getAgentByIntent(match.id);
  }
}
```

---

#### 4. @ruvector/rudag@0.1.0 (DAG Scheduler)
**Status:** 🆕 NEW - Not integrated
**Location:** `agentic-flow/package.json`
**Use Cases:**
- Task dependency management
- Critical path analysis
- Parallel task scheduling
- Bottleneck detection

**Why agentic-flow:**
- Orchestrates multi-agent workflows
- Task scheduling and optimization
- Application-level workflow management

**Integration:**
```typescript
// agentic-flow/src/orchestration/dag-scheduler.ts
import { DAG } from '@ruvector/rudag';

export class AgentTaskScheduler {
  async buildTaskGraph(plan: TaskPlan) {
    // Build DAG from multi-agent plan
    // Analyze critical path
    // Schedule parallel execution
  }
}
```

---

#### 5. @ruvector/agentic-synth@0.1.6 (Synthetic Data)
**Status:** 🆕 NEW - Not integrated
**Location:** `agentic-flow/package.json` (devDependencies)
**Use Cases:**
- Generate training data for ReasoningBank
- Create test workflows
- Generate edge cases
- RAG dataset creation

**Why agentic-flow:**
- Generates training data for the application
- Creates agent workflow scenarios
- Testing and development tool
- Application-level data generation

**Integration:**
```typescript
// agentic-flow/scripts/generate-training-data.ts
import { AgenticSynth } from '@ruvector/agentic-synth';

export class TrainingDataGenerator {
  async generateReasoningPatterns(count: number) {
    // Generate patterns for ReasoningBank
    // Bootstrap learning system
  }
}
```

**Configuration:**
```json
{
  "devDependencies": {
    "@ruvector/agentic-synth": "^0.1.6"
  }
}
```

---

#### 6. spiking-neural@1.0.1 (Neuromorphic)
**Status:** 🆕 NEW - Not integrated
**Location:** `agentic-flow/package.json`
**Use Cases:**
- Agent collaboration pattern detection
- Temporal workflow analysis
- Event stream processing
- Ultra-low-power edge deployment

**Why agentic-flow:**
- Analyzes agent interaction patterns
- Application-level pattern detection
- Workflow optimization
- Agent coordination intelligence

**Integration:**
```typescript
// agentic-flow/src/neural/spiking-pattern-detector.ts
import { createFeedforwardSNN } from 'spiking-neural';

export class AgentPatternDetector {
  async detectCollaborationPattern(agentSequence: string[]) {
    // Detect successful agent patterns
    // Learn optimal workflows
  }
}
```

---

### 🔄 SHARED/UTILITY PACKAGES

#### @ruvector/server@0.1.0 (HTTP/gRPC Server)

**Primary: agentdb** (Recommended)
```typescript
// packages/agentdb/src/server/agentdb-server.ts
import { RuVectorServer } from '@ruvector/server';

export class AgentDBServer {
  // Expose AgentDB as HTTP/gRPC service
  // REST API for vector operations
  // Language-agnostic access
}
```

**Secondary: agentic-flow** (Optional)
```typescript
// agentic-flow/src/api/orchestration-server.ts
import { RuVectorServer } from '@ruvector/server';

export class OrchestrationServer {
  // Expose agent orchestration API
  // Task submission endpoint
  // Workflow status queries
}
```

**Recommendation:** Install in **agentdb** as primary use case is exposing the database. agentic-flow can use agentdb's API.

---

#### @ruvector/rvlite@0.2.4 (CLI Tool)

**Installation:** Global or devDependencies in both
```bash
# Global installation (recommended)
npm install -g @ruvector/rvlite

# Or as dev dependency for debugging
npm install --save-dev @ruvector/rvlite  # in both packages
```

**Usage:** Debugging and data exploration tool - not a runtime dependency.

---

## 📊 Summary Table

### agentdb Dependencies (7 packages)

```json
{
  "dependencies": {
    "ruvector": "^0.1.38",                    // UPDATE
    "@ruvector/postgres-cli": "^0.2.6",       // NEW
    "@ruvector/graph-node": "^0.1.25",        // NEW
    "@ruvector/attention": "^0.1.3",          // UPDATE
    "@ruvector/gnn": "^0.1.22",               // ✅ Current
    "@ruvector/sona": "^0.1.4",               // UPDATE
    "@ruvector/cluster": "^0.1.0",            // NEW
    "@ruvector/server": "^0.1.0"              // NEW (optional)
  }
}
```

**Total:** 3 updates, 4 new packages

---

### agentic-flow Dependencies (6 packages)

```json
{
  "dependencies": {
    "@ruvector/ruvllm": "^0.2.3",             // NEW
    "@ruvector/tiny-dancer": "^0.1.15",       // NEW
    "@ruvector/router": "^0.1.25",            // NEW
    "@ruvector/rudag": "^0.1.0",              // NEW
    "spiking-neural": "^1.0.1",               // NEW
    "agentdb": "^2.0.0-alpha.2.21"            // Depends on ruvector packages
  },
  "devDependencies": {
    "@ruvector/agentic-synth": "^0.1.6"       // NEW
  }
}
```

**Total:** 6 new packages (5 production, 1 dev)

---

## 🎯 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      agentic-flow                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Orchestration Layer                                │    │
│  │  • @ruvector/ruvllm (LLM orchestration)            │    │
│  │  • @ruvector/tiny-dancer (circuit breaker routing) │    │
│  │  • @ruvector/router (semantic routing)             │    │
│  │  • @ruvector/rudag (task scheduling)               │    │
│  │  • spiking-neural (pattern detection)              │    │
│  │  • @ruvector/agentic-synth (training data)         │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│                   Uses agentdb API                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        agentdb                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Database Layer                                     │    │
│  │  • ruvector (core vector DB)                       │    │
│  │  • @ruvector/postgres-cli (PostgreSQL backend)     │    │
│  │  • @ruvector/graph-node (hypergraph storage)       │    │
│  │  • @ruvector/attention (attention mechanisms)       │    │
│  │  • @ruvector/gnn (graph neural networks)           │    │
│  │  • @ruvector/sona (federated learning)             │    │
│  │  • @ruvector/cluster (distributed clustering)      │    │
│  │  • @ruvector/server (HTTP/gRPC API)                │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│                  Vector Storage + Learning                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Order

### Phase 1: agentdb Updates (Week 1)

**Update existing:**
```bash
cd packages/agentdb
npm install ruvector@^0.1.38 \
            @ruvector/attention@^0.1.3 \
            @ruvector/sona@^0.1.4
```

**Add new infrastructure:**
```bash
npm install @ruvector/postgres-cli@^0.2.6 \
            @ruvector/graph-node@^0.1.25 \
            @ruvector/cluster@^0.1.0 \
            @ruvector/server@^0.1.0
```

### Phase 2: agentic-flow Enhancements (Week 2)

**Add orchestration packages:**
```bash
cd agentic-flow
npm install @ruvector/ruvllm@^0.2.3 \
            @ruvector/tiny-dancer@^0.1.15 \
            @ruvector/router@^0.1.25 \
            @ruvector/rudag@^0.1.0 \
            spiking-neural@^1.0.1

npm install --save-dev @ruvector/agentic-synth@^0.1.6
```

### Phase 3: Integration (Week 3-4)

1. **agentdb:** Implement new backends
2. **agentic-flow:** Implement routing and orchestration
3. **Integration:** Connect agentic-flow to agentdb's new capabilities

---

## 💡 Key Takeaways

### Design Principles

1. **Separation of Concerns**
   - **agentdb** = Data infrastructure
   - **agentic-flow** = Orchestration logic

2. **Dependency Flow**
   - agentic-flow **depends on** agentdb
   - agentdb **standalone** database library
   - Clean architecture with no circular dependencies

3. **Package Placement Logic**
   - Storage/persistence → agentdb
   - Routing/orchestration → agentic-flow
   - Learning backends → agentdb
   - Agent coordination → agentic-flow

### Benefits

✅ **Clean separation** - No confusion about where code goes
✅ **Independent versioning** - agentdb can be used standalone
✅ **Clear boundaries** - Database vs orchestration
✅ **Scalable architecture** - Each layer can scale independently
✅ **Testable** - Can test database and orchestration separately

---

**Document Version:** 1.0
**Last Updated:** 2025-12-30
**Status:** ✅ Ready for implementation
**Next Step:** Begin Phase 1 (agentdb updates)
