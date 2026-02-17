# AgentDB v3

> Intelligent agentic vector database — learns from experience, optimizes itself, runs anywhere

[![npm version](https://img.shields.io/npm/v/agentdb.svg?style=flat-square)](https://www.npmjs.com/package/agentdb)
[![npm downloads](https://img.shields.io/npm/dm/agentdb.svg?style=flat-square)](https://www.npmjs.com/package/agentdb)
[![License](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-green?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-32%20tools-blueviolet?style=flat-square)](docs/guides/)

---

## What is AgentDB?

AgentDB is the first vector database built specifically for autonomous AI agents. Unlike traditional databases that just store vectors, AgentDB **learns from every interaction**, **heals itself automatically**, and **gets smarter over time** — all while being **150x faster** than cloud alternatives and running **anywhere** (Node.js, browsers, edge functions, even offline).

It combines six cognitive memory patterns (how humans learn), latent space simulations (empirically validated optimizations), Graph Neural Networks (self-improving search), and the new RVF native format (single-file, crash-safe, COW branching) into a single, zero-config package that just works.

**Built for:** LangChain agents, AutoGPT, Claude Code tools, custom AI assistants, RAG systems, or any application where AI needs to remember, learn, and improve.

---

## Features

| Category             | Highlights                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| **Cognitive Memory** | 6 patterns: Reflexion, Skills, Causal Graph, Explainable Recall, Utility Ranking, Nightly Learner |
| **Vector Search**    | 150x faster than cloud alternatives, 61us p50 latency, SIMD-accelerated                           |
| **RVF Format**       | Single-file storage with crash safety, COW branching, lineage tracking, progressive indexing      |
| **Self-Learning**    | GNN with 8-head attention (+12.4% recall), 97.9% self-healing, automatic optimization             |
| **Runs Anywhere**    | Node.js, browsers, edge functions, offline — auto-selects best backend                            |
| **Developer Tools**  | 32 MCP tools, 60+ CLI commands, simulation wizard, batch operations                               |
| **Zero Config**      | `npm install agentdb` and go — auto-detects optimal backend chain                                 |
| **Free**             | Fully local, no API keys, no cloud fees                                                           |

---

## Comparison

### vs. Other Vector Databases

| Feature               | AgentDB v3      | Pinecone   | Chroma | Weaviate  | pgvector |
| --------------------- | --------------- | ---------- | ------ | --------- | -------- |
| **Self-learning**     | GNN + Reflexion | No         | No     | No        | No       |
| **Cognitive memory**  | 6 patterns      | No         | No     | No        | No       |
| **Local-first**       | Yes             | Cloud only | Yes    | Self-host | Postgres |
| **COW branching**     | RVF native      | No         | No     | No        | No       |
| **MCP integration**   | 32 tools        | No         | No     | No        | No       |
| **Search latency**    | 61us            | ~50ms      | ~10ms  | ~5ms      | ~2ms     |
| **Monthly cost**      | $0              | $70+       | $0     | $0+       | $0+      |
| **Offline mode**      | Full            | No         | Yes    | Yes       | Yes      |
| **Auto-optimization** | Yes             | No         | No     | No        | No       |
| **Browser support**   | WASM fallback   | No         | No     | No        | No       |

### Backend Performance

| Backend                    | Latency | Recall@10 | Native | Best For                     |
| -------------------------- | ------- | --------- | ------ | ---------------------------- |
| **RuVector** (Rust + SIMD) | 61us    | 96.8%     | Yes    | Production, high throughput  |
| **RVF** (single-file)      | ~100us  | 96.8%     | Yes    | Portable, branching, lineage |
| **HNSWLib** (C++)          | ~500us  | 95%+      | Yes    | Compatibility                |
| **sql.js** (WASM)          | ~5ms    | 90%+      | No     | Zero-dependency fallback     |

AgentDB auto-selects the best available: RuVector > RVF > HNSWLib > sql.js

---

## Quick Start

### Install

```bash
npm install agentdb
```

### Basic Usage

```typescript
import { createDatabase, ReasoningBank, EmbeddingService } from "agentdb";

const db = await createDatabase("./agent-memory.db");
const embedder = new EmbeddingService({ model: "Xenova/all-MiniLM-L6-v2" });
await embedder.initialize();

const reasoningBank = new ReasoningBank(db, embedder);

// Store what your agent learned
await reasoningBank.storePattern({
  taskType: "code_review",
  approach: "Security-first analysis",
  successRate: 0.95,
});

// Find similar successful patterns
const patterns = await reasoningBank.searchPatterns({
  task: "security code review",
  k: 10,
});
```

### CLI

```bash
# Initialize a new database
npx agentdb init

# Check system health
npx agentdb doctor

# Run diagnostics
npx agentdb status

# Manage RVF stores
npx agentdb rvf status ./store.rvf
npx agentdb rvf compact ./store.rvf
npx agentdb rvf derive ./parent.rvf ./branch.rvf
```

---

## MCP Integration

Connect AgentDB to Claude Code, Cursor, or any MCP-compatible AI assistant with one command:

```bash
claude mcp add agentdb npx agentdb mcp start
```

Or add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agentdb": {
      "command": "npx",
      "args": ["agentdb", "mcp", "start"],
      "env": { "AGENTDB_PATH": "./agentdb.db" }
    }
  }
}
```

### MCP Tools Overview

| Category     | Tools | Examples                                                                                                 |
| ------------ | ----- | -------------------------------------------------------------------------------------------------------- |
| **Core DB**  | 5     | init, insert, batch insert, search, delete                                                               |
| **Patterns** | 4     | store, search, stats, cache management                                                                   |
| **Memory**   | 9     | reflexion store/retrieve, skill create/search, causal edges/queries, explainable recall, nightly learner |
| **Learning** | 10    | RL sessions, predictions, feedback, training, transfer learning, explainability                          |
| **Admin**    | 4     | stats, diagnostics, migration, pruning                                                                   |

All 32 tools support parallel execution markers, batch operations, intelligent caching, and format parameters for token reduction.

---

<details>
<summary><h2>Cognitive Memory Patterns</h2></summary>

AgentDB implements six cognitive memory patterns inspired by how humans learn:

### 1. ReasoningBank — Pattern Learning

Store successful reasoning patterns and retrieve them by semantic similarity. The system learns which approaches work best for different task types.

```typescript
await reasoningBank.storePattern({
  taskType: "bug_investigation",
  approach: "Check logs > Reproduce > Binary search for root cause",
  successRate: 0.92,
  tags: ["debugging", "systematic"],
});

const patterns = await reasoningBank.searchPatterns({
  task: "debug memory leak",
  k: 10,
  threshold: 0.7,
});
```

### 2. Reflexion Memory — Learn from Experience

Store complete task episodes with self-generated critiques, then replay them to improve future performance. Based on Shinn et al., 2023.

```typescript
await reflexion.storeEpisode({
  sessionId: "session-1",
  task: "Fix authentication bug",
  reward: 0.95,
  success: true,
  critique: "OAuth2 PKCE flow was more secure than basic flow",
  input: "Users cannot log in",
  output: "Working OAuth2 implementation",
  latencyMs: 1200,
  tokensUsed: 500,
});

const similar = await reflexion.retrieveRelevant({
  task: "authentication issues",
  k: 10,
  onlySuccesses: true,
});
```

### 3. Skill Library — Lifelong Learning

Transform successful patterns into reusable, composable skills that improve over time.

```typescript
await skills.createSkill({
  name: "jwt_authentication",
  description: "Generate and validate JWT tokens",
  signature: { inputs: { userId: "string" }, outputs: { token: "string" } },
  code: "implementation...",
  successRate: 0.92,
});

const applicable = await skills.searchSkills({
  task: "user authentication",
  k: 5,
  minSuccessRate: 0.7,
});
```

### 4. Causal Memory Graph — Intervention Causality

Track `p(y|do(x))` using doubly robust estimation. Learn what interventions cause what outcomes.

```typescript
const causalGraph = new CausalMemoryGraph(db);

const experimentId = causalGraph.createExperiment({
  name: "test_error_handling",
  hypothesis: "Try-catch reduces crash rate",
  treatmentId: 123,
  treatmentType: "episode",
  controlId: 124,
  startTime: Date.now(),
  sampleSize: 0,
  status: "running",
});

const { uplift, pValue } = causalGraph.calculateUplift(experimentId);
```

### 5. Explainable Recall — Provenance Certificates

Every retrieval comes with a cryptographic Merkle proof explaining why specific memories were selected.

```typescript
const result = await causalRecall.recall(
  "query-123",
  "How to optimize API response time",
  12,
  ["performance"],
  "internal",
);

console.log(`Certificate: ${result.certificate.id}`);
console.log(`Completeness: ${result.certificate.completenessScore}`);
```

### 6. Nightly Learner — Automated Discovery

Background process that discovers causal patterns, consolidates skills, and prunes low-quality data automatically.

```typescript
const learner = new NightlyLearner(db, embedder);
const discovered = await learner.discover({
  minAttempts: 3,
  minSuccessRate: 0.6,
  minConfidence: 0.7,
  dryRun: false,
});
```

</details>

---

<details>
<summary><h2>RVF Native Format (New in v3)</h2></summary>

RVF (RuVector Format) is a single-file vector storage format with crash safety, progressive indexing, and lineage tracking.

### Key Capabilities

| Feature                  | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| **Single-file**          | Everything in one `.rvf` file — vectors, index, metadata |
| **Crash-safe**           | Append-only log with checksums, safe concurrent access   |
| **COW Branching**        | Create copy-on-write branches for experiments            |
| **Lineage Tracking**     | Track parent-child relationships between stores          |
| **Progressive Indexing** | Index builds incrementally as data arrives               |
| **Witness Chains**       | Cryptographic verification of data integrity             |

### CLI Commands

```bash
# Show store status
npx agentdb rvf status ./store.rvf

# Compact to reclaim space
npx agentdb rvf compact ./store.rvf

# Create a branch (copy-on-write)
npx agentdb rvf derive ./parent.rvf ./experiment.rvf

# List segments
npx agentdb rvf segments ./store.rvf

# Detect SDK availability
npx agentdb rvf detect
```

### Programmatic Usage

```typescript
import { RvfBackend } from "agentdb/backends/rvf/RvfBackend";

const backend = new RvfBackend({
  dimension: 384,
  metric: "cosine",
  storagePath: "./vectors.rvf",
  rvfBackend: "auto", // 'node' for N-API, 'wasm' for browser
});
await backend.initialize();

// Async operations (native)
await backend.insertAsync("vec-1", embedding, { tag: "example" });
const results = await backend.searchAsync(queryVector, 10);
await backend.flush();

// COW branching
const branch = await backend.derive("./experiment.rvf");
const lineage = await backend.lineageDepth();
```

### Backend Selection

```bash
# Initialize with RVF backend
npx agentdb init --backend rvf --rvf-path ./vectors.rvf

# Migrate existing data to RVF
npx agentdb migrate --to rvf --rvf-path ./vectors.rvf

# Check RVF in diagnostics
npx agentdb doctor --rvf-path ./vectors.rvf
```

</details>

---

<details>
<summary><h2>Performance & Benchmarks</h2></summary>

### Core Operations

| Operation         | Throughput          | Latency                     |
| ----------------- | ------------------- | --------------------------- |
| Pattern search    | 32.6M ops/sec       | <1ms                        |
| Pattern storage   | 388K ops/sec        | ~2.5us                      |
| Episode retrieval | 957 ops/sec         | ~1ms                        |
| Skill search      | 694 ops/sec         | ~1.4ms                      |
| Batch insert      | 5,556-7,692 ops/sec | 3-4x faster than sequential |

### Scaling Behavior

```
500 patterns:    1,475/sec, 2MB memory
2,000 patterns:  3,818/sec, 0MB delta
5,000 patterns:  4,536/sec, 4MB memory (super-linear)
```

### Self-Learning

```
Adaptive Learning (10 sessions, 50 episodes each)
  Initial success rate: 54%
  Final success rate:   90%
  Improvement:          +36%
```

### Latent Space Validation (25 scenarios, 98.2% reproducibility)

| Scenario            | Result                                          |
| ------------------- | ----------------------------------------------- |
| HNSW Optimization   | 61us p50, 96.8% recall@10, 8.2x vs hnswlib      |
| GNN Attention       | +12.4% recall, 3.8ms forward pass, 91% transfer |
| Self-Healing        | 97.9% degradation prevention, <100ms repair     |
| Neural Augmentation | +29.4% improvement, -32% memory, -52% hops      |

</details>

---

<details>
<summary><h2>Guides</h2></summary>

### Embedding Models

AgentDB supports multiple embedding models. No API key required — all Xenova models run locally.

| Model                          | Dimension | Quality   | Speed    | Best For          |
| ------------------------------ | --------- | --------- | -------- | ----------------- |
| **all-MiniLM-L6-v2** (default) | 384       | Good      | Fastest  | Prototyping       |
| **bge-small-en-v1.5**          | 384       | Excellent | Fast     | Best 384d quality |
| **bge-base-en-v1.5**           | 768       | Excellent | Moderate | Production        |
| **all-mpnet-base-v2**          | 768       | Excellent | Moderate | All-around        |
| **e5-base-v2**                 | 768       | Excellent | Moderate | Multilingual      |

```bash
# Default (384d, fast)
npx agentdb init

# Production (768d, high quality)
npx agentdb init --dimension 768 --model "Xenova/bge-base-en-v1.5"
```

### Backend Selection

```bash
# Auto-detect best backend (recommended)
npx agentdb init --backend auto

# Force RuVector (fastest, requires native bindings)
npx agentdb init --backend ruvector

# Force RVF (single-file, portable)
npx agentdb init --backend rvf --rvf-path ./vectors.rvf

# Force HNSWLib (C++ HNSW)
npx agentdb init --backend hnswlib
```

### Migration

```bash
# Migrate v1 -> v2 -> v3
npx agentdb migrate --source ./old.db --target ./new.db

# Export to RVF format
npx agentdb migrate --to rvf --rvf-path ./vectors.rvf

# Dry-run migration
npx agentdb migrate --dry-run --verbose
```

### Health Checks

```bash
# Full diagnostic
npx agentdb doctor --verbose

# Check specific RVF store
npx agentdb doctor --rvf-path ./vectors.rvf

# Auto-fix issues
npx agentdb doctor --fix
```

</details>

---

<details>
<summary><h2>Tutorials</h2></summary>

### Tutorial 1: Build a Learning Code Review Agent

```typescript
import {
  createDatabase,
  ReasoningBank,
  ReflexionMemory,
  EmbeddingService,
} from "agentdb";

const db = await createDatabase("./code-reviewer.db");
const embedder = new EmbeddingService({ model: "Xenova/all-MiniLM-L6-v2" });
await embedder.initialize();

const reasoningBank = new ReasoningBank(db, embedder);
const reflexion = new ReflexionMemory(db, embedder);

// 1. Store review patterns
await reasoningBank.storePattern({
  taskType: "code_review",
  approach: "Security scan > Type safety > Code quality > Performance",
  successRate: 0.94,
  tags: ["security", "typescript"],
});

// 2. Review code and record the episode
const result = await performCodeReview(code);
await reflexion.storeEpisode({
  sessionId: "review-1",
  task: "Review authentication PR",
  reward: result.issuesFound > 0 ? 0.9 : 0.6,
  success: true,
  critique: "Found SQL injection — security checks work!",
  input: code,
  output: result.findings,
  latencyMs: result.timeMs,
  tokensUsed: result.tokensUsed,
});

// 3. Next time, learn from past reviews
const pastReviews = await reflexion.retrieveRelevant({
  task: "authentication code review",
  k: 5,
  onlySuccesses: true,
});
```

### Tutorial 2: RAG with Self-Learning Skills

```typescript
import {
  createDatabase,
  ReasoningBank,
  SkillLibrary,
  EmbeddingService,
} from "agentdb";

const db = await createDatabase("./rag-system.db");
const embedder = new EmbeddingService({ model: "Xenova/all-MiniLM-L6-v2" });
await embedder.initialize();

const skills = new SkillLibrary(db, embedder);

// Create a reusable query expansion skill
await skills.createSkill({
  name: "expand_query",
  description: "Expand user query with domain-specific synonyms",
  signature: { inputs: { query: "string" }, outputs: { expanded: "string[]" } },
  code: `const map = { 'bug': ['issue', 'defect', 'error'] }; ...`,
  successRate: 0.92,
});

// Search for applicable skills
const applicable = await skills.searchSkills({
  task: "find technical documentation",
  k: 10,
});
```

### Tutorial 3: Run Latent Space Simulations

```bash
# HNSW optimization (validates 8.2x speedup)
npx agentdb simulate hnsw --iterations 3

# GNN attention mechanism
npx agentdb simulate attention --iterations 3

# 30-day self-healing validation
npx agentdb simulate self-organizing --days 30

# Interactive wizard
npx agentdb simulate --wizard
```

### Tutorial 4: RVF Branching for Experiments

```typescript
import { RvfBackend } from "agentdb/backends/rvf/RvfBackend";

// Create main store
const main = new RvfBackend({
  dimension: 384,
  metric: "cosine",
  storagePath: "./main.rvf",
  rvfBackend: "auto",
});
await main.initialize();

// Add production data
await main.insertAsync("doc-1", embedding1, { source: "production" });
await main.flush();

// Branch for experiment (copy-on-write, near-instant)
const experiment = await main.derive("./experiment.rvf");

// Experiment branch has all parent data, changes are isolated
await experiment.insertAsync("doc-exp-1", experimentEmbedding);
await experiment.flush();

// Check lineage
console.log(`Lineage depth: ${await experiment.lineageDepth()}`);
console.log(`Parent ID: ${await experiment.parentId()}`);
```

</details>

---

<details>
<summary><h2>Advanced Usage</h2></summary>

### Batch Operations

```typescript
import { BatchOperations } from "agentdb/optimizations/BatchOperations";

const batchOps = new BatchOperations(db, embedder, {
  batchSize: 100,
  parallelism: 4,
  progressCallback: (done, total) => console.log(`${done}/${total}`),
});

// 3-4x faster than sequential
await batchOps.insertSkills([...skills]);
await batchOps.insertEpisodes([...episodes]);
await batchOps.insertPatterns([...patterns]);
```

### Data Pruning

```typescript
const results = await batchOps.pruneData({
  maxAge: 90, // Keep last 90 days
  minReward: 0.3, // Minimum episode quality
  minSuccessRate: 0.5, // Minimum skill success rate
  maxRecords: 100000, // Cap per table
  dryRun: false,
});
```

### Intelligent Caching

```typescript
import { ToolCache, MCPToolCaches } from "agentdb/optimizations/ToolCache";

const caches = new MCPToolCaches();
// Stats: 60s TTL, Patterns: 30s, Searches: 15s, Metrics: 120s

const custom = new ToolCache(1000, 60000);
custom.set("key", value, 60000);
const stats = custom.getStats(); // { hitRate, size, maxSize }
```

### Input Validation

```typescript
import {
  validateTaskString,
  validateNumericRange,
  validateArrayLength,
  validateEnum,
  ValidationError,
} from "agentdb/security/input-validation";

const task = validateTaskString(input, "task"); // XSS detection
const k = validateNumericRange(kVal, "k", 1, 100); // Range check
const format = validateEnum(fmt, "format", ["json", "concise", "detailed"]);
```

### VectorBackendAsync Interface

```typescript
import { VectorBackendAsync } from "agentdb";

// For backends that support native async (RVF)
interface VectorBackendAsync extends VectorBackend {
  insertAsync(
    id: string,
    embedding: Float32Array,
    metadata?: Record<string, any>,
  ): Promise<void>;
  insertBatchAsync(
    items: Array<{
      id: string;
      vector: Float32Array;
      metadata?: Record<string, any>;
    }>,
  ): Promise<void>;
  searchAsync(
    query: Float32Array,
    k: number,
  ): Promise<Array<{ id: string; score: number }>>;
  removeAsync(id: string): Promise<boolean>;
  getStatsAsync(): Promise<VectorStats>;
  flush(): Promise<void>;
}
```

### Custom Backend Selection

```typescript
import { createBackend, detectBackends } from "agentdb/backends/factory";

// Detect what's available
const detection = await detectBackends();
console.log(detection);
// { ruvector: { available, native, gnn }, rvf: { sdk, node, wasm }, hnswlib: { available } }

// Create specific backend
const backend = await createBackend({
  type: "rvf",
  dimension: 384,
  metric: "cosine",
  storagePath: "./vectors.rvf",
});
```

</details>

---

<details>
<summary><h2>Architecture</h2></summary>

```
+----------------------------------------------------------+
|                    AgentDB v3 Core                        |
+----------------------------------------------------------+
|  Cognitive Memory:                                       |
|  ReasoningBank | Reflexion | Skills | Causal | Recall    |
+----------------------------------------------------------+
|  Optimizations:                                          |
|  BatchOps | ToolCache (LRU+TTL) | Validation | Pruning   |
+----------------------------------------------------------+
|  Backend Auto-Selection (fastest available):             |
|  RuVector > RVF > HNSWLib > sql.js (WASM fallback)      |
+----------------------------------------------------------+
      |              |              |              |
+----------+  +----------+  +----------+  +----------+
| RuVector |  |   RVF    |  | HNSWLib  |  | sql.js   |
| Rust+SIMD|  | Single   |  | C++ HNSW |  | WASM     |
| 150x     |  | file,COW |  | 100x     |  | Zero-dep |
+----------+  +----------+  +----------+  +----------+
```

### Data Flow

```
User Input > Validation (XSS/injection) > Cache Check
  |-- Hit  --> Return cached (8.8x faster)
  |-- Miss --> Embedding Service > Vector Backend > Memory Layer
                                                       |
                                          Result + Provenance Certificate
                                                       |
                                               Cache & Return
```

</details>

---

## Testing

```bash
npm test                    # All tests
npm run test:unit           # Unit tests
npm run test:integration    # Integration tests
npm run test:performance    # Performance benchmarks
npm run test:security       # Security validation
```

---

## Documentation

| Document                                    | Description                      |
| ------------------------------------------- | -------------------------------- |
| [MCP Tool Optimization Guide](docs/guides/) | Comprehensive MCP patterns       |
| [Embedding Models Guide](docs/guides/)      | Model selection and benchmarks   |
| [Simulation System](simulation/README.md)   | 25 scenarios, interactive wizard |
| [ADR-003: RVF Integration](docs/adrs/)      | RVF format architecture decision |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Areas of interest: additional RL algorithms, performance optimizations, new backend integrations, documentation improvements.

---

## License

MIT OR Apache-2.0 — See [LICENSE-MIT](LICENSE-MIT) and [LICENSE-APACHE](LICENSE-APACHE).

---

**Built for the agentic era** | [Quick Start](#quick-start) | [Docs](./docs/) | [GitHub](https://github.com/ruvnet/agentic-flow/tree/main/packages/agentdb) | [npm](https://www.npmjs.com/package/agentdb)
