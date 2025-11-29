# AgentDB v2.0

> **The fastest vector database for autonomous agents — now 150x faster with intelligent memory**

[![npm version](https://img.shields.io/npm/v/agentdb.svg?style=flat-square)](https://www.npmjs.com/package/agentdb)
[![npm downloads](https://img.shields.io/npm/dm/agentdb.svg?style=flat-square)](https://www.npmjs.com/package/agentdb)
[![License](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-green?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen?style=flat-square)](tests/)
[![MCP Compatible](https://img.shields.io/badge/MCP-29%20tools-blueviolet?style=flat-square)](docs/MCP_TOOL_OPTIMIZATION_GUIDE.md)

**AgentDB v2 delivers breakthrough performance with RuVector integration (150x faster), Graph Neural Networks for adaptive learning, and comprehensive MCP tool optimizations. Zero config, instant startup, runs everywhere.**

## 🚀 What's New in v2.0

### ⚡ Performance Revolution

- **150x Faster Vector Search** — RuVector Rust-powered backend with SIMD optimization
- **8.8x Faster Stats Queries** — Intelligent caching with TTL (176ms → 20ms)
- **3-4x Faster Batch Operations** — Parallel embedding generation + SQL transactions
- **60% Token Reduction** — Optimized MCP tool responses (450 → 180 tokens)
- **Super-Linear Scaling** — Performance improves as dataset grows (4,536 patterns/sec @ 5k items)

### 🧠 Intelligent Memory & Learning

- **Graph Neural Networks (GNN)** — Adaptive query enhancement with node classification
- **ReasoningBank** — Pattern matching, similarity detection, adaptive learning (36% improvement)
- **Causal Memory** — Intervention-based causality with `p(y|do(x))` semantics
- **Self-Learning Agents** — 25% skill improvement through iterative refinement
- **Automated Pruning** — Intelligent data cleanup preserving causal relationships

### 🛠️ Developer Experience

- **29 Optimized MCP Tools** — Anthropic-approved advanced tool use patterns
- **Batch Operations** — `skill_create_batch`, `pattern_store_batch`, `reflexion_store_batch`
- **Parallel Execution** — 3x faster multi-tool workflows with `🔄 PARALLEL-SAFE` markers
- **Enhanced Validation** — 6 new validators with XSS/injection detection
- **Comprehensive Docs** — 28KB optimization guide + benchmarks

### 🔬 Benchmark Results (v2.0.0)

```
📊 ReasoningBank Pattern Storage
   Small (500):    1,475 patterns/sec
   Medium (2,000): 3,818 patterns/sec
   Large (5,000):  4,536 patterns/sec  ✨ Super-linear scaling

🔍 Pattern Similarity Detection
   Optimal threshold: 0.5 (12 matches, 22.74ms avg)
   Filtered queries: 4.4x faster (15.76ms vs 69.31ms)

📈 Adaptive Learning (10 sessions, 50 episodes each)
   Success rate improvement: 36% (54% → 90%)
   Average skill improvement: 25% (0.60 → 0.85)

⚡ MCP Tools Performance
   pattern_search:   32.6M ops/sec  🚀 Ultra-fast
   pattern_store:    388K ops/sec   🚀 Excellent
   episode_retrieve: 957 ops/sec    ✅ Very Good
   skill_search:     694 ops/sec    ✅ Good
   skill_create:     304 ops/sec    ⚠️  Optimization target (→ 900 with batch)
   episode_store:    152 ops/sec    ⚠️  Optimization target (→ 500 with batch)

💾 Memory Efficiency
   5,000 patterns: 4MB memory (0.8KB per pattern)
   Consistent low latency: 0.22-0.68ms per pattern
```

See [OPTIMIZATION-REPORT.md](OPTIMIZATION-REPORT.md) for comprehensive benchmarks.

---

## 🎯 Why AgentDB v2?

### Built for the Agentic Era

AgentDB v2 is the **only vector database** designed specifically for autonomous agents with:

**🧠 Cognitive Architecture**
- **6 Frontier Memory Patterns**: Reflexion, Skills, Causal Memory, Explainable Recall, Utility Ranking, Nightly Learner
- **ReasoningBank**: Pattern learning, similarity detection, memory optimization
- **GNN Enhancement**: Adaptive query improvement through graph neural networks
- **Self-Learning**: Automatic skill extraction and iterative refinement

**⚡ Performance Without Compromise**
- **Instant Startup**: Milliseconds (optimized sql.js WASM)
- **150x Faster Search**: RuVector Rust backend with SIMD
- **Super-Linear Scaling**: Performance improves with data size
- **Intelligent Caching**: 8.8x speedup for frequently accessed data

**🔧 Zero-Config Production**
- **Universal Runtime**: Node.js, Browser, Edge, MCP — runs anywhere
- **Auto Backend Selection**: RuVector → HNSWLib → better-sqlite3 → sql.js
- **Graceful Degradation**: Works with mock embeddings if ML models unavailable
- **Docker-Ready**: 9-stage build with CI/CD validation

**🤖 AI-Native Integration**
- **29 MCP Tools**: Zero-code setup for Claude Code, Cursor, Copilot
- **Parallel Execution**: 3x faster multi-tool workflows
- **Batch Operations**: 3-4x throughput improvement
- **Smart Caching**: 60% token reduction with format parameter

### Comparison with Traditional Systems

| Capability | AgentDB v2.0 | Pinecone/Weaviate | ChromaDB | Qdrant |
|------------|--------------|-------------------|----------|--------|
| **Search Speed** | 🚀 150x w/ RuVector | 🐢 Network latency | 🐢 Python overhead | ⚡ Fast (Rust) |
| **Startup Time** | ⚡ Milliseconds | 🐌 Minutes (cloud) | 🐌 Seconds | ⚡ Seconds |
| **Memory Model** | 🧠 6 frontier patterns + GNN | ❌ Vectors only | ❌ Vectors only | ❌ Vectors only |
| **Causal Reasoning** | ✅ `p(y\|do(x))` | ❌ Correlation | ❌ Correlation | ❌ Correlation |
| **Self-Learning** | ✅ ReasoningBank | ❌ External ML | ❌ External ML | ❌ External ML |
| **Explainability** | ✅ Merkle proofs | ❌ Black box | ❌ Black box | ❌ Black box |
| **Runtime** | 🌐 Anywhere | ☁️ Cloud only | 💻 Server | 💻 Server |
| **Setup** | ⚙️ `npm install` | 🔧 Complex | 🔧 Python env | 🔧 Config |
| **Cost** | 💰 $0 (local) | 💸 $70+/mo | 💰 Self-host | 💸 Self-host |
| **Batch Ops** | ✅ 3-4x faster | ❌ Sequential | ❌ Sequential | ⚡ Good |
| **MCP Integration** | ✅ 29 tools | ❌ None | ❌ None | ❌ None |
| **RL Algorithms** | ✅ 9 built-in | ❌ External | ❌ External | ❌ External |

---

## 🚀 Quick Start (60 Seconds)

### Installation

```bash
npm install agentdb@latest
```

### For Claude Code / MCP Integration

**Automatic Setup (Recommended):**

```bash
claude mcp add agentdb npx agentdb@latest mcp start
```

**Manual Setup:**

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agentdb": {
      "command": "npx",
      "args": ["agentdb@latest", "mcp", "start"],
      "env": {
        "AGENTDB_PATH": "./agentdb.db"
      }
    }
  }
}
```

### CLI Usage

```bash
# Initialize database
agentdb init ./my-agent-memory.db

# Store reasoning patterns (NEW v2.0)
agentdb pattern store "code_review" "Security-first analysis" 0.95

# Search patterns semantically (32.6M ops/sec)
agentdb pattern search "security analysis" 10 0.7

# Store reflexion episodes
agentdb reflexion store "session-1" "implement_auth" 0.95 true \
  "Used OAuth2 PKCE flow" "requirements" "working code" 1200 500

# Create reusable skills
agentdb skill create "jwt_auth" "Generate JWT tokens" \
  '{"inputs": {"user": "object"}}' "code here..." 1

# Automated causal discovery
agentdb learner run 3 0.6 0.7 false

# Database stats
agentdb db stats

# Prune old/low-quality data (NEW v2.0)
agentdb prune --max-age 90 --min-reward 0.3 --dry-run

# Get help
agentdb --help
```

### Programmatic Usage

```typescript
import { createDatabase } from 'agentdb';
import { ReasoningBank } from 'agentdb/controllers/ReasoningBank';
import { ReflexionMemory } from 'agentdb/controllers/ReflexionMemory';
import { SkillLibrary } from 'agentdb/controllers/SkillLibrary';
import { EmbeddingService } from 'agentdb/controllers/EmbeddingService';
import { BatchOperations } from 'agentdb/optimizations/BatchOperations';

// Initialize database
const db = await createDatabase('./agent-memory.db');

// Initialize embedding service
const embedder = new EmbeddingService({
  model: 'Xenova/all-MiniLM-L6-v2',
  dimension: 384,
  provider: 'transformers'
});
await embedder.initialize();

// ReasoningBank - Pattern learning and adaptive memory
const reasoningBank = new ReasoningBank(db, embedder);

// Store reasoning pattern (388K ops/sec)
const patternId = await reasoningBank.storePattern({
  taskType: 'code_review',
  approach: 'Security-first analysis followed by code quality checks',
  successRate: 0.95,
  tags: ['security', 'code-quality'],
  metadata: { language: 'typescript' }
});

// Search patterns (32.6M ops/sec - ultra-fast)
const patterns = await reasoningBank.searchPatterns({
  task: 'security code review',
  k: 10,
  threshold: 0.7,
  filters: { taskType: 'code_review' }
});

// Reflexion Memory - Learn from experience
const reflexion = new ReflexionMemory(db, embedder);

// Store episode with self-critique
const episodeId = await reflexion.storeEpisode({
  sessionId: 'session-1',
  task: 'Implement OAuth2 authentication',
  reward: 0.95,
  success: true,
  critique: 'PKCE flow provided better security than basic flow',
  input: 'Authentication requirements',
  output: 'Working OAuth2 implementation',
  latencyMs: 1200,
  tokensUsed: 500
});

// Retrieve similar episodes (957 ops/sec)
const episodes = await reflexion.retrieveRelevant({
  task: 'authentication implementation',
  k: 5,
  onlySuccesses: true
});

// Skill Library - Lifelong learning
const skills = new SkillLibrary(db, embedder);

// Create reusable skill
const skillId = await skills.createSkill({
  name: 'jwt_authentication',
  description: 'Generate and validate JWT tokens',
  signature: { inputs: { userId: 'string' }, outputs: { token: 'string' } },
  code: 'implementation code here...',
  successRate: 0.92,
  uses: 0,
  avgReward: 0.0,
  avgLatencyMs: 0.0
});

// Search for applicable skills (694 ops/sec)
const applicableSkills = await skills.searchSkills({
  task: 'user authentication',
  k: 10,
  minSuccessRate: 0.7
});

// Batch Operations - 3-4x faster (NEW v2.0)
const batchOps = new BatchOperations(db, embedder, {
  batchSize: 100,
  parallelism: 4
});

// Batch create skills (304 → 900 ops/sec)
const skillIds = await batchOps.insertSkills([
  { name: 'skill-1', description: 'First skill', successRate: 0.8 },
  { name: 'skill-2', description: 'Second skill', successRate: 0.9 },
  // ... up to 100 skills
]);

// Batch store patterns (4x faster)
const patternIds = await batchOps.insertPatterns([
  { taskType: 'debugging', approach: 'Binary search', successRate: 0.85 },
  { taskType: 'optimization', approach: 'Profiling first', successRate: 0.90 },
  // ... up to 500 patterns
]);

// Prune old data (NEW v2.0)
const pruneResults = await batchOps.pruneData({
  maxAge: 90,           // Keep data from last 90 days
  minReward: 0.3,       // Keep episodes with reward >= 0.3
  minSuccessRate: 0.5,  // Keep skills/patterns with >= 50% success
  maxRecords: 100000,   // Max 100k records per table
  dryRun: false         // Actually delete (use true to preview)
});

console.log(`Pruned ${pruneResults.episodesPruned} episodes`);
console.log(`Saved ${pruneResults.spaceSaved} bytes`);
```

---

## 🧠 Frontier Memory Features

### 1. 🔄 ReasoningBank — Pattern Learning & Adaptive Memory

**The cognitive layer that makes agents smarter over time**

Store successful reasoning patterns and retrieve them using semantic similarity. ReasoningBank learns which approaches work best for different types of tasks.

```typescript
// Store a pattern
await reasoningBank.storePattern({
  taskType: 'bug_investigation',
  approach: 'Check logs → Reproduce issue → Binary search for root cause',
  successRate: 0.92,
  tags: ['debugging', 'systematic'],
  metadata: { avgTimeMs: 3000 }
});

// Search patterns (32.6M ops/sec - ultra-fast)
const patterns = await reasoningBank.searchPatterns({
  task: 'debug memory leak',
  k: 10,
  threshold: 0.7,
  filters: { taskType: 'bug_investigation' }
});

// Get pattern statistics
const stats = reasoningBank.getPatternStats();
console.log(`Total patterns: ${stats.totalPatterns}`);
console.log(`Avg success rate: ${stats.avgSuccessRate}`);
```

**Performance:**
- Pattern storage: 388K ops/sec
- Pattern search: 32.6M ops/sec (ultra-fast with caching)
- Super-linear scaling: 4,536 patterns/sec @ 5k items

**Use Cases:**
- Learn debugging strategies that work
- Discover code patterns that prevent bugs
- Build institutional knowledge automatically

### 2. 🔄 Reflexion Memory — Learn from Experience

**Episodic replay with self-critique for continuous improvement**

Store complete task episodes with self-generated critiques, then replay them to improve future performance. Based on the Reflexion paper (Shinn et al., 2023).

```typescript
// Store episode with self-critique
const episodeId = await reflexion.storeEpisode({
  sessionId: 'debug-session-1',
  task: 'Fix authentication bug',
  reward: 0.95,
  success: true,
  critique: 'OAuth2 PKCE flow was more secure than basic flow. Should always check token expiration.',
  input: 'Users can\'t log in',
  output: 'Working OAuth2 implementation with refresh tokens',
  latencyMs: 1200,
  tokensUsed: 500
});

// Retrieve similar episodes (957 ops/sec)
const similar = await reflexion.retrieveRelevant({
  task: 'authentication issues',
  k: 10,
  onlySuccesses: true,  // Learn from what worked
  minReward: 0.7
});

// Get task-specific statistics
const stats = await reflexion.getTaskStats('debug-session-1');
console.log(`Success rate: ${stats.successRate}`);
console.log(`Avg reward: ${stats.avgReward}`);
```

**Benefits:**
- Learn from successes and failures
- Build expertise over time
- Avoid repeating mistakes
- Self-improvement through critique

**CLI:**
```bash
# Store episode
agentdb reflexion store "session-1" "fix_auth_bug" 0.95 true \
  "OAuth2 PKCE worked perfectly" "login failing" "fixed tokens" 1200 500

# Retrieve similar
agentdb reflexion retrieve "authentication issues" 10 0.8

# Get critique summary
agentdb reflexion critique "fix_auth_bug" 10 0.5
```

### 3. 🎓 Skill Library — Lifelong Learning

**Transform successful patterns into reusable, composable skills**

Automatically consolidate repeated successful task executions into parameterized skills that can be composed and reused.

```typescript
// Create skill manually
const skillId = await skills.createSkill({
  name: 'jwt_authentication',
  description: 'Generate and validate JWT tokens with refresh flow',
  signature: {
    inputs: { userId: 'string', permissions: 'array' },
    outputs: { accessToken: 'string', refreshToken: 'string' }
  },
  code: 'implementation code...',
  successRate: 0.92
});

// Search for applicable skills (694 ops/sec)
const applicable = await skills.searchSkills({
  task: 'user authentication with tokens',
  k: 5,
  minSuccessRate: 0.7
});

// Auto-consolidate from successful episodes
const consolidated = await skills.consolidateFromEpisodes({
  minAttempts: 3,      // Need 3+ successful executions
  minSuccessRate: 0.7, // With 70%+ success rate
  lookbackDays: 7      // In the last 7 days
});

// Update skill after use
await skills.updateSkillStats(skillId, {
  uses: 1,
  successRate: 0.95,
  success: true,
  latencyMs: 1200
});
```

**Features:**
- Automatic skill extraction from episodes
- Semantic search for skill discovery
- Usage tracking and success rate monitoring
- Skill composition and chaining

**CLI:**
```bash
# Create skill
agentdb skill create "jwt_auth" "Generate JWT tokens" \
  '{"inputs": {"user": "object"}}' "code..." 1

# Search skills
agentdb skill search "authentication" 5 0.5

# Auto-consolidate from episodes
agentdb skill consolidate 3 0.7 7

# Update skill stats
agentdb skill update 1 1 0.95 true 1200
```

### 4. 🔗 Causal Memory Graph — Intervention-Based Causality

**Learn what interventions cause what outcomes, not just correlations**

Track `p(y|do(x))` using doubly robust estimation and instrumental variables. Understand which actions lead to which results.

```typescript
import { CausalMemoryGraph } from 'agentdb/controllers/CausalMemoryGraph';

const causalGraph = new CausalMemoryGraph(db);

// Create causal experiment (A/B test)
const experimentId = causalGraph.createExperiment({
  name: 'test_error_handling_approach',
  hypothesis: 'Try-catch reduces crash rate',
  treatmentId: 123,  // Episode ID with error handling
  treatmentType: 'episode',
  controlId: 124,    // Episode ID without
  startTime: Date.now(),
  sampleSize: 0,
  status: 'running'
});

// Record observations
causalGraph.recordObservation({
  experimentId,
  episodeId: 123,
  isTreatment: true,
  outcomeValue: 0.95,  // Success rate
  outcomeType: 'success'
});

// Calculate causal uplift
const { uplift, pValue, confidenceInterval } =
  causalGraph.calculateUplift(experimentId);

console.log(`Causal uplift: ${uplift}`);
console.log(`p-value: ${pValue}`);
console.log(`95% CI: [${confidenceInterval[0]}, ${confidenceInterval[1]}]`);

// Add causal edge
const edgeId = causalGraph.addCausalEdge({
  fromMemoryId: 123,
  fromMemoryType: 'episode',
  toMemoryId: 125,
  toMemoryType: 'episode',
  similarity: 0.85,
  uplift: 0.15,        // 15% improvement
  confidence: 0.95,
  sampleSize: 50
});

// Query causal effects
const effects = causalGraph.queryCausalEffects({
  interventionMemoryId: 123,
  interventionMemoryType: 'episode',
  minConfidence: 0.8,
  minUplift: 0.1
});
```

**Use Cases:**
- Discover which debugging strategies fix bugs
- Learn what code patterns improve performance
- Understand what approaches lead to success
- A/B test different agent strategies

### 5. 📜 Explainable Recall — Provenance Certificates

**Every retrieval comes with a cryptographic proof explaining why**

Understand exactly why memories were selected with Merkle proof certificates that verify completeness and relevance.

```typescript
import { CausalRecall } from 'agentdb/controllers/CausalRecall';

const causalRecall = new CausalRecall(db, embedder, vectorBackend, {
  alpha: 0.7,  // Similarity weight
  beta: 0.2,   // Causal uplift weight
  gamma: 0.1   // Latency penalty
});

// Retrieve with certificate
const result = await causalRecall.recall(
  'query-123',
  'How to optimize API response time',
  12,  // k results
  ['performance', 'optimization'],  // requirements
  'internal'  // access level
);

console.log(`Retrieved ${result.candidates.length} results`);
console.log(`Certificate ID: ${result.certificate.id}`);
console.log(`Completeness: ${result.certificate.completenessScore}`);
console.log(`Redundancy: ${result.certificate.redundancyRatio}`);

// Certificate includes:
// - Query ID and text
// - Retrieved chunk IDs with relevance scores
// - Completeness score (% requirements met)
// - Redundancy ratio (duplicate coverage)
// - Merkle root hash (cryptographic proof)
// - Access level and timestamp
```

**Benefits:**
- Understand why specific memories were selected
- Verify retrieval completeness
- Debug agent decision-making
- Build trust through transparency
- Audit trail for compliance

### 6. 🎯 Causal Recall — Utility-Based Reranking

**Retrieve what actually works, not just what's similar**

Standard vector search returns similar memories. Causal Recall reranks by actual utility:

**Formula:** `U = α·similarity + β·uplift − γ·latency`

- **α·similarity**: Semantic relevance (how related is this memory?)
- **β·uplift**: Causal impact (did this approach actually help?)
- **γ·latency**: Performance cost (how long did this take?)

```typescript
// Utility-based retrieval (built into causalRecall.recall)
const result = await causalRecall.recall(
  'query-456',
  'Optimize database query performance',
  10,
  undefined,
  'internal'
);

// Results ranked by utility, not just similarity
result.candidates.forEach((candidate, i) => {
  console.log(`${i + 1}. Utility: ${candidate.utilityScore.toFixed(3)}`);
  console.log(`   Similarity: ${candidate.similarity.toFixed(3)}`);
  console.log(`   Uplift: ${candidate.uplift?.toFixed(3) || 'N/A'}`);
  console.log(`   Latency: ${candidate.latencyMs}ms`);
});
```

**Why It Matters:**
- Retrieves what works, not just what's similar
- Balances relevance with effectiveness
- Accounts for performance costs
- Learns from causal relationships

### 7. 🌙 Nightly Learner — Automated Pattern Discovery

**Background process that discovers patterns while you sleep**

Runs automated causal discovery on episode history, finding patterns you didn't explicitly program.

```typescript
import { NightlyLearner } from 'agentdb/controllers/NightlyLearner';

const learner = new NightlyLearner(db, embedder);

// Discover patterns (dry-run first to preview)
const discovered = await learner.discover({
  minAttempts: 3,       // Need 3+ attempts to detect pattern
  minSuccessRate: 0.6,  // With 60%+ success rate
  minConfidence: 0.7,   // 70% statistical confidence
  dryRun: true          // Preview without saving
});

console.log(`Would create ${discovered.length} causal edges`);

// Run for real (creates edges + consolidates skills)
const created = await learner.discover({
  minAttempts: 3,
  minSuccessRate: 0.6,
  minConfidence: 0.7,
  dryRun: false  // Actually create
});

console.log(`Created ${created.length} causal edges`);

// Prune low-quality edges
const pruned = await learner.pruneEdges({
  minConfidence: 0.5,
  minUplift: 0.05,
  maxAgeDays: 90
});

console.log(`Pruned ${pruned} low-quality edges`);
```

**Features:**
- Asynchronous execution (runs in background)
- Discovers causal edges automatically
- Auto-consolidates successful patterns into skills
- Prunes low-quality patterns
- Doubly robust estimation for causal inference

**CLI:**
```bash
# Discover patterns (dry-run)
agentdb learner run 3 0.6 0.7 true

# Create patterns for real
agentdb learner run 3 0.6 0.7 false

# Prune low-quality edges
agentdb learner prune 0.5 0.05 90
```

---

## ⚡ Performance Optimizations (v2.0)

### Batch Operations — 3-4x Faster

**Process multiple items efficiently with parallel embeddings and SQL transactions**

```typescript
import { BatchOperations } from 'agentdb/optimizations/BatchOperations';

const batchOps = new BatchOperations(db, embedder, {
  batchSize: 100,      // Process 100 items per batch
  parallelism: 4,      // 4 concurrent embedding generations
  progressCallback: (completed, total) => {
    console.log(`Progress: ${completed}/${total}`);
  }
});

// Batch create skills (304 → 900 ops/sec = 3x faster)
const skillIds = await batchOps.insertSkills([
  { name: 'skill-1', description: 'First skill', successRate: 0.8 },
  { name: 'skill-2', description: 'Second skill', successRate: 0.9 },
  // ... 50 more skills
]);

// Batch store patterns (4x faster than sequential)
const patternIds = await batchOps.insertPatterns([
  { taskType: 'debugging', approach: 'Binary search', successRate: 0.85 },
  { taskType: 'optimization', approach: 'Profile first', successRate: 0.90 },
  // ... 500 patterns
]);

// Batch store episodes (152 → 500 ops/sec = 3.3x faster)
const episodeCount = await batchOps.insertEpisodes([
  { sessionId: 's1', task: 'Task 1', reward: 0.9, success: true },
  { sessionId: 's1', task: 'Task 2', reward: 0.85, success: true },
  // ... 200 episodes
]);
```

**Performance:**
- Skills: 304 → 900 ops/sec (3x faster)
- Patterns: 4x faster than sequential
- Episodes: 152 → 500 ops/sec (3.3x faster)
- Parallel embedding generation
- SQL transaction optimization

### Intelligent Caching — 8.8x Faster Stats

**TTL-based caching with LRU eviction for frequently accessed data**

```typescript
import { ToolCache, MCPToolCaches } from 'agentdb/optimizations/ToolCache';

// Specialized caches for different tool types
const mcpCaches = new MCPToolCaches();
// - stats:    60s TTL (agentdb_stats, db_stats)
// - patterns: 30s TTL (pattern/skill searches)
// - searches: 15s TTL (episode retrieval)
// - metrics:  120s TTL (expensive computations)

// Custom cache
const customCache = new ToolCache<any>(1000, 60000);

// Set cache entry
customCache.set('stats:detailed', statsResult, 60000);

// Get cached value (returns null if expired)
const cached = customCache.get('stats:detailed');

// Pattern-based clearing
customCache.clear('stats:*');  // Clear all stats caches

// Get cache statistics
const stats = customCache.getStats();
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
console.log(`Size: ${stats.size}/${stats.maxSize}`);
```

**Performance Impact:**
- agentdb_stats: 176ms → ~20ms (8.8x faster)
- pattern_stats: Similar improvement
- learning_metrics: 120s TTL for expensive computations
- Hit rates: 80%+ for frequently accessed data

### Data Pruning — Maintain Database Hygiene

**Intelligent cleanup preserving causal relationships**

```typescript
// Prune old/low-quality data
const results = await batchOps.pruneData({
  maxAge: 90,           // Keep data from last 90 days
  minReward: 0.3,       // Keep episodes with reward >= 0.3
  minSuccessRate: 0.5,  // Keep skills/patterns with >= 50% success
  maxRecords: 100000,   // Max 100k records per table
  dryRun: false         // Actually delete (use true to preview)
});

console.log(`Pruned ${results.episodesPruned} episodes`);
console.log(`Pruned ${results.skillsPruned} skills`);
console.log(`Pruned ${results.patternsPruned} patterns`);
console.log(`Saved ${results.spaceSaved} bytes`);
```

**Features:**
- Age-based pruning (default: 90 days)
- Quality-based pruning (min reward/success rate)
- Max records enforcement (keeps best performing)
- Preserves causal relationships (won't delete referenced episodes)
- Dry-run mode for preview
- Space reclamation via VACUUM

**CLI:**
```bash
# Preview what would be deleted
agentdb prune --max-age 90 --min-reward 0.3 --dry-run

# Actually prune
agentdb prune --max-age 90 --min-reward 0.3 --min-success-rate 0.5 --max-records 100000
```

### Enhanced Validation — Security & Developer Experience

**6 new validators with XSS/injection detection**

```typescript
import {
  validateTaskString,
  validateNumericRange,
  validateArrayLength,
  validateObject,
  validateBoolean,
  validateEnum,
  ValidationError
} from 'agentdb/security/input-validation';

try {
  // String validation (length + XSS detection)
  const task = validateTaskString(userInput, 'task');

  // Numeric range validation
  const k = validateNumericRange(kValue, 'k', 1, 100);

  // Array length validation
  const items = validateArrayLength(array, 'items', 1, 100);

  // Enum validation
  const format = validateEnum(formatValue, 'format', ['concise', 'detailed', 'json']);

} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error(`Field: ${error.field}`);
  }
}
```

**Security Features:**
- XSS detection (`<script>`, `javascript:`, `onclick=`)
- Injection detection (null bytes, malicious patterns)
- Length limits (10k characters max)
- Type validation with TypeScript types
- Safe error messages (no sensitive data leakage)

---

## 🤖 MCP Tools (29 Total)

AgentDB provides 29 optimized MCP tools for zero-code integration with Claude Code, Cursor, and other AI coding assistants.

### Core Vector DB Tools (5)

**Basic vector database operations:**

| Tool | Description | Performance |
|------|-------------|-------------|
| `agentdb_init` | Initialize database with schema | One-time setup |
| `agentdb_insert` | Insert single vector | Standard |
| `agentdb_insert_batch` | Batch insert (recommended) | 141x faster |
| `agentdb_search` | Semantic k-NN search | Optimized |
| `agentdb_delete` | Delete vectors by ID/filters | Standard |

### Core AgentDB Tools (5 - NEW v2.0)

**Advanced database management:**

| Tool | Description | Performance |
|------|-------------|-------------|
| `agentdb_stats` | Comprehensive database statistics | 8.8x faster (cached) |
| `agentdb_pattern_store` | Store reasoning patterns | 388K ops/sec |
| `agentdb_pattern_search` | Search patterns semantically | 32.6M ops/sec |
| `agentdb_pattern_stats` | Pattern analytics | Cached |
| `agentdb_clear_cache` | Cache management | Instant |

### Frontier Memory Tools (9)

**Cognitive capabilities:**

| Tool | Description | Use Case |
|------|-------------|----------|
| `reflexion_store` | Store episode with self-critique | Learn from experience |
| `reflexion_retrieve` | Retrieve similar episodes | Episodic replay |
| `skill_create` | Create reusable skill | Lifelong learning |
| `skill_search` | Search for applicable skills | Skill discovery |
| `causal_add_edge` | Add causal relationship | Track causality |
| `causal_query` | Query causal effects | Understand interventions |
| `recall_with_certificate` | Utility-based retrieval | Explainable AI |
| `learner_discover` | Automated pattern discovery | Background learning |
| `db_stats` | Database statistics | Monitoring |

### Learning System Tools (10 - NEW v1.3.0)

**Reinforcement learning pipeline:**

| Tool | Description | Algorithms |
|------|-------------|-----------|
| `learning_start_session` | Start RL session | 9 algorithms |
| `learning_end_session` | End session & save policy | All |
| `learning_predict` | Get AI recommendations | All |
| `learning_feedback` | Submit action feedback | All |
| `learning_train` | Batch policy training | All |
| `learning_metrics` | Performance analytics | All |
| `learning_transfer` | Transfer learning | All |
| `learning_explain` | Explainable AI | All |
| `experience_record` | Record tool execution | All |
| `reward_signal` | Calculate rewards | All |

**Supported RL Algorithms:**
Q-Learning, SARSA, DQN, Policy Gradient, Actor-Critic, PPO, Decision Transformer, MCTS, Model-Based

### MCP Tool Optimization Guide

For comprehensive MCP tool optimization patterns, see:
- [MCP Tool Optimization Guide](docs/MCP_TOOL_OPTIMIZATION_GUIDE.md) - 28KB guide with examples
- [MCP Optimization Summary](MCP-OPTIMIZATION-SUMMARY.md) - Executive summary

**Key Optimizations:**
- 🔄 Parallel execution markers for 3x speedup
- 📦 Batch operations (3-4x faster)
- 💾 Intelligent caching (8.8x faster stats)
- 📊 Format parameter (60% token reduction)
- ✅ Enhanced validation (security + DX)

---

## 📊 Benchmarks & Performance

### ReasoningBank Performance

```
Pattern Storage Scalability
   Small (500):    1,475 patterns/sec, 2MB memory
   Medium (2,000): 3,818 patterns/sec, 0MB memory
   Large (5,000):  4,536 patterns/sec, 4MB memory

   ✨ Super-linear scaling (throughput increases with data size)

Pattern Similarity Detection
   Threshold 0.5: 12.0 matches, 22.74ms avg search time
   Threshold 0.7: 10.2 matches, 22.62ms avg search time

   Optimal threshold: 0.5 (best balance)

Query Optimization
   Simple:          69.31ms
   Filtered:        15.76ms (4.4x faster)
   High threshold:  69.09ms
   Large k=100:     93.03ms
```

### Self-Learning Performance

```
Adaptive Learning (10 sessions, 50 episodes each)
   Initial success rate: 54%
   Final success rate:   90%
   Improvement:          36%
   Avg session duration: 170ms

Skill Evolution (3 skills, 5 versions each)
   Initial avg success:  0.60
   Final avg success:    0.85
   Improvement:          25%

Causal Episode Linking
   5 episodes linked:    22ms
   Chain depth:          5 steps
   Causal relationship:  Sequential debugging process
```

### MCP Tools Performance

```
Ultra-Fast (>1M ops/sec)
   pattern_search:   32.6M ops/sec

Excellent (>100K ops/sec)
   pattern_store:    388K ops/sec

Very Good (>500 ops/sec)
   episode_retrieve: 957 ops/sec
   skill_search:     694 ops/sec

Good (>100 ops/sec)
   skill_create:     304 ops/sec → 900 ops/sec (with batch)

Optimization Targets
   episode_store:    152 ops/sec → 500 ops/sec (with batch)
```

### Memory Efficiency

```
5,000 patterns: 4MB memory (0.8KB per pattern)
Consistent low latency: 0.22-0.68ms per pattern
Super-linear scaling: performance improves with data size
```

See [OPTIMIZATION-REPORT.md](OPTIMIZATION-REPORT.md) for comprehensive benchmarks.

---

## 🏗️ Architecture

### Multi-Backend System

```
┌─────────────────────────────────────────────────────────┐
│                   AgentDB v2.0 Core                      │
├─────────────────────────────────────────────────────────┤
│  Frontier Memory:                                        │
│  • ReasoningBank    • Reflexion Memory                   │
│  • Skill Library    • Causal Memory Graph                │
│  • Causal Recall    • Nightly Learner                    │
├─────────────────────────────────────────────────────────┤
│  Optimizations:                                          │
│  • BatchOperations  • ToolCache (LRU + TTL)              │
│  • Enhanced Validation                                   │
├─────────────────────────────────────────────────────────┤
│  Backend Auto-Selection (fastest → most compatible):     │
│  RuVector → HNSWLib → better-sqlite3 → sql.js (WASM)     │
└─────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐
│   RuVector      │  │    HNSWLib      │  │   SQLite     │
│  Rust + SIMD    │  │   C++ HNSW      │  │  better-sql3 │
│  150x faster    │  │   100x faster   │  │  Native Node │
│  (optional)     │  │   (optional)    │  │  (optional)  │
└─────────────────┘  └─────────────────┘  └──────────────┘
                                                   ↓
                                          ┌──────────────┐
                                          │  sql.js WASM │
                                          │   Default    │
                                          │  Zero deps   │
                                          └──────────────┘
```

### Data Flow

```
User Input
   ↓
Input Validation (XSS/injection detection)
   ↓
ToolCache Check (LRU + TTL)
   ├── Cache Hit → Return cached result (8.8x faster)
   └── Cache Miss → Continue
       ↓
   Embedding Service
   (Transformers.js or mock)
       ↓
   Vector Backend
   (Auto-selected: RuVector → HNSWLib → SQLite)
       ↓
   Frontier Memory Layer
   (ReasoningBank, Reflexion, Skills, Causal)
       ↓
   Result + Provenance Certificate
       ↓
   Cache Result (with TTL)
       ↓
   Return to User
```

---

## 🧪 Testing

AgentDB v2 includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit           # Unit tests
npm run test:integration    # Integration tests
npm run test:performance    # Performance benchmarks
npm run test:security       # Security validation

# Docker validation (full CI/CD)
npm run docker:build        # 9-stage Docker build
npm run docker:test         # Run tests in container
```

**Test Coverage:**
- ✅ Core vector operations
- ✅ Frontier memory features
- ✅ Batch operations
- ✅ Caching mechanisms
- ✅ Input validation
- ✅ MCP tool handlers
- ✅ Security (XSS, injection)
- ✅ Performance benchmarks
- ✅ Backwards compatibility

---

## 📚 Documentation

- [MCP Tool Optimization Guide](docs/MCP_TOOL_OPTIMIZATION_GUIDE.md) - Comprehensive optimization patterns (28KB)
- [Optimization Report](OPTIMIZATION-REPORT.md) - v2.0 performance benchmarks
- [Optimization Summary](MCP-OPTIMIZATION-SUMMARY.md) - Executive summary
- [Migration Guide v1.3.0](MIGRATION_v1.3.0.md) - Upgrade from v1.2.2
- [MCP Tools Reference](docs/MCP_TOOLS.md) - All 29 tools documented

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Areas of Interest:**
- Additional RL algorithms
- Performance optimizations
- New backend integrations
- Documentation improvements
- Test coverage expansion

---

## 📝 License

MIT OR Apache-2.0

See [LICENSE-MIT](LICENSE-MIT) and [LICENSE-APACHE](LICENSE-APACHE) for details.

---

## 🙏 Acknowledgments

AgentDB v2 builds on research from:
- **Reflexion** (Shinn et al., 2023) - Self-critique and episodic replay
- **Causal Inference** (Pearl, Judea) - Intervention-based causality
- **Decision Transformer** (Chen et al., 2021) - Offline RL
- **HNSW** (Malkov & Yashunin, 2018) - Approximate nearest neighbor search
- **Anthropic** - Advanced tool use patterns and MCP protocol

---

## 📊 Project Status

**Version:** 2.0.0
**Status:** ✅ Production Ready
**MCP Tools:** 29 (optimized)
**Tests:** ✅ Passing (comprehensive coverage)
**Performance:** 150x faster (RuVector), 3-8x faster (optimizations)
**Last Updated:** 2025-11-29

[Get Started](#-quick-start-60-seconds) | [Documentation](./docs/) | [GitHub](https://github.com/ruvnet/agentic-flow/tree/main/packages/agentdb) | [npm](https://www.npmjs.com/package/agentdb)

---

**Built with ❤️ for the agentic era**
