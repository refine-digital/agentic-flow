# API Reference - Agentic-Flow v2.0

Complete API documentation for Agentic-Flow v2.0.0-alpha.

## Core Classes

### AgenticFlowV2

Main entry point for v2.0 with AgentDB integration, smart routing, and learning features.

```typescript
class AgenticFlowV2 {
  constructor(options: AgenticFlowOptions)

  // Agent management
  agents: AgentManager

  // Memory system
  memory: MemoryManager
  db: AgentDB

  // Learning systems
  reasoningBank: ReasoningBank
  reflexion: ReflexionMemory
  skills: SkillLibrary

  // Swarm coordination
  swarm: SwarmManager

  // Execution
  execute(options: ExecutionOptions): Promise<ExecutionResult>
}
```

#### Constructor Options

```typescript
interface AgenticFlowOptions {
  // Backend configuration
  backend?: 'agentdb' | 'sqlite' | 'memory';  // Default: 'agentdb'
  apiKey?: string;  // LLM API key

  // Performance
  optimize?: 'quality' | 'balanced' | 'cost' | 'speed';  // Default: 'balanced'
  enableLearning?: boolean;  // Default: true
  enableCache?: boolean;  // Default: true

  // Database
  dbPath?: string;  // Default: './agentdb.db'
  dimension?: number;  // Embedding dimension (default: 384)

  // Advanced
  features?: {
    vectorSearch?: boolean;
    graphDatabase?: boolean;
    attention?: 'mha' | 'flash' | 'linear' | 'hyperbolic' | 'moe';
    gnnLearning?: boolean;
  };
}
```

#### Example

```typescript
import { AgenticFlowV2 } from 'agentic-flow';

const flow = new AgenticFlowV2({
  backend: 'agentdb',  // 150x faster
  apiKey: process.env.ANTHROPIC_API_KEY,
  optimize: 'balanced',
  enableLearning: true,
  dbPath: './my-agentdb.db',
  dimension: 768,
  features: {
    vectorSearch: true,
    graphDatabase: true,
    attention: 'hyperbolic',
    gnnLearning: true
  }
});
```

---

## Agent Management

### AgentManager

Manages agent spawning, lifecycle, and coordination.

```typescript
class AgentManager {
  // Spawn new agent
  spawn(options: AgentSpawnOptions): Promise<Agent>

  // Get agent by ID
  get(agentId: string): Agent

  // List all agents
  list(): Agent[]

  // Destroy agent
  destroy(agentId: string): Promise<void>
}
```

#### AgentSpawnOptions

```typescript
interface AgentSpawnOptions {
  type: string;  // Agent type (e.g., 'coder', 'reviewer')
  name?: string;  // Optional agent name
  capabilities?: string[];  // Agent capabilities
  memory?: Memory[];  // Pre-loaded context
  optimize?: 'quality' | 'balanced' | 'cost' | 'speed';
  model?: string;  // Override smart router
}
```

#### Example

```typescript
// Spawn agent with optimizations
const agent = await flow.agents.spawn({
  type: 'coder',
  capabilities: ['typescript', 'react'],
  optimize: 'cost'  // Uses DeepSeek R1
});

// Spawn with pre-loaded context
const context = await flow.memory.search('authentication', { k: 10 });
const expertAgent = await flow.agents.spawn({
  type: 'coder',
  memory: context  // Instant startup with relevant knowledge
});
```

### Agent

Individual agent instance with execution capabilities.

```typescript
class Agent {
  id: string;
  type: string;
  name: string;
  capabilities: string[];

  // Execution
  execute(task: Task | string): Promise<ExecutionResult>
  edit(options: EditOptions): Promise<EditResult>

  // Memory
  setContext(context: Memory[]): void
  getContext(): Memory[]

  // Lifecycle
  destroy(): Promise<void>
}
```

#### Task Execution

```typescript
interface Task {
  description: string;
  input?: any;
  context?: Memory[];
  timeout?: number;
}

interface ExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  latencyMs: number;
  tokensUsed: number;
  model: string;
  cost: number;
}
```

#### Example

```typescript
// Execute task
const result = await agent.execute({
  description: 'Implement OAuth2 authentication',
  context: await flow.memory.search('oauth2', { k: 5 }),
  timeout: 60000
});

// Check result
if (result.success) {
  console.log(`✓ Completed in ${result.latencyMs}ms`);
  console.log(`Used: ${result.model}, Cost: $${result.cost}`);
}
```

---

## Memory System

### MemoryManager

Unified memory interface with AgentDB v2.

```typescript
class MemoryManager {
  // Vector search
  search(query: string, options?: SearchOptions): Promise<Memory[]>
  insert(content: string, metadata?: object): Promise<string>
  delete(id: string): Promise<void>

  // Batch operations
  batchInsert(items: InsertItem[]): Promise<string[]>
  batchDelete(ids: string[]): Promise<void>

  // Advanced
  unifiedSearch(options: UnifiedSearchOptions): Promise<SearchResult>
}
```

#### SearchOptions

```typescript
interface SearchOptions {
  k?: number;  // Number of results (default: 10)
  threshold?: number;  // Similarity threshold (0-1)
  lambda?: number;  // MMR diversity (default: 0.6)
  filters?: object;  // Metadata filters
  includeGraph?: boolean;  // Traverse relationships
  useAttention?: boolean;  // Use attention mechanism
}
```

#### Example

```typescript
// Basic vector search
const memories = await flow.memory.search('authentication patterns', {
  k: 10,
  threshold: 0.7,
  filters: { category: 'security' }
});

// Advanced unified search
const results = await flow.memory.unifiedSearch({
  query: 'best practices for OAuth2',
  k: 10,
  includeGraph: true,      // Traverse causal relationships
  useAttention: true,      // Hyperbolic attention
  learnFromResults: true   // GNN updates embeddings
});
```

### AgentDB

Low-level database interface with RuVector backend.

```typescript
class AgentDB {
  // Initialization
  static create(options: AgentDBOptions): Promise<AgentDB>

  // Vector operations
  vectorSearch(query: Float32Array, k: number, options?: any): Promise<VectorResult[]>
  insertVector(vector: Float32Array, metadata: object): Promise<string>

  // Graph operations
  cypherQuery(query: string, params: object): Promise<GraphResult>
  addNode(node: GraphNode): Promise<string>
  addEdge(edge: GraphEdge): Promise<string>

  // Attention
  hyperbolicAttention(Q: Float32Array, K: Float32Array, V: Float32Array, curvature?: number): Promise<AttentionResult>
  flashAttention(Q: Float32Array, K: Float32Array, V: Float32Array): Promise<AttentionResult>

  // Performance
  buildHNSWIndex(options: HNSWOptions): Promise<void>
  enableQuantization(options: QuantizationOptions): Promise<void>
  enableCache(options: CacheOptions): Promise<void>
}
```

#### Example

```typescript
// Build HNSW index for 150x speedup
await flow.db.buildHNSWIndex({
  M: 16,               // Connections per layer
  efConstruction: 200,  // Build accuracy
  efSearch: 50         // Search accuracy
});

// Enable quantization for 4x memory reduction
await flow.db.enableQuantization({
  type: 'product',
  codebookSize: 256,
  subvectorCount: 8
});

// Enable caching
await flow.db.enableCache({
  maxSize: 1000,   // Top 1000 queries
  ttl: 3600000     // 1 hour TTL
});
```

---

## Learning Systems

### ReasoningBank

Population-wide pattern learning system.

```typescript
class ReasoningBank {
  // Store patterns
  store(pattern: Pattern): Promise<string>
  storePattern(options: PatternOptions): Promise<string>

  // Search patterns
  search(task: string, k?: number): Promise<Pattern[]>
  searchPatterns(options: SearchPatternOptions): Promise<Pattern[]>

  // Analytics
  getStats(taskType?: string): Promise<PatternStats>
  getPatternStats(): Promise<PatternStats>
}
```

#### Pattern Interface

```typescript
interface Pattern {
  id?: string;
  taskType: string;
  approach: string;
  successRate: number;
  reward?: number;
  tags?: string[];
  metadata?: object;
  createdAt?: number;
}

interface PatternOptions {
  taskType: string;
  approach: string;
  successRate: number;
  reward?: number;
  tags?: string[];
  metadata?: object;
}
```

#### Example

```typescript
// Store successful pattern
await flow.reasoningBank.store({
  taskType: 'code_review',
  approach: 'Security → Type safety → Code quality',
  successRate: 0.94,
  tags: ['security', 'typescript'],
  metadata: { avgTime: 3000 }
});

// Search for similar patterns (32.6M ops/sec!)
const patterns = await flow.reasoningBank.search('security review', 5);

// Get aggregated statistics
const stats = await flow.reasoningBank.getStats('code_review');
console.log(`Success rate: ${stats.avgSuccessRate}`);
```

### ReflexionMemory

Episodic replay with self-critique.

```typescript
class ReflexionMemory {
  // Store episodes
  store(episode: Episode): Promise<string>
  storeEpisode(options: EpisodeOptions): Promise<string>

  // Retrieve episodes
  retrieve(options: RetrieveOptions): Promise<Episode[]>
  retrieveRelevant(options: RetrieveOptions): Promise<Episode[]>

  // Analytics
  getTaskStats(sessionId: string): Promise<TaskStats>
  getCritiqueSummary(task: string, k?: number): Promise<string>
}
```

#### Episode Interface

```typescript
interface Episode {
  id?: string;
  sessionId: string;
  task: string;
  reward: number;
  success: boolean;
  critique: string;
  input?: string;
  output?: string;
  latencyMs?: number;
  tokensUsed?: number;
  createdAt?: number;
}

interface RetrieveOptions {
  task: string;
  k?: number;
  onlySuccesses?: boolean;
  onlyFailures?: boolean;
  minReward?: number;
}
```

#### Example

```typescript
// Store episode with self-critique
await flow.reflexion.store({
  sessionId: 'debug-session-1',
  task: 'Fix authentication bug',
  reward: 0.95,
  success: true,
  critique: 'OAuth2 PKCE flow was more secure. Always validate token expiration.',
  input: 'Users can\'t log in',
  output: 'Working OAuth2 implementation',
  latencyMs: 1200,
  tokensUsed: 500
});

// Retrieve similar successes
const similar = await flow.reflexion.retrieve({
  task: 'authentication issues',
  k: 10,
  onlySuccesses: true,
  minReward: 0.7
});

// Get critique summary
const summary = await flow.reflexion.getCritiqueSummary('authentication', 10);
console.log(summary);
```

### SkillLibrary

Reusable skill management with lifelong learning.

```typescript
class SkillLibrary {
  // Skill management
  create(skill: Skill): Promise<string>
  createSkill(options: SkillOptions): Promise<string>
  update(skillId: string, updates: Partial<Skill>): Promise<void>
  delete(skillId: string): Promise<void>

  // Search & discovery
  search(options: SkillSearchOptions): Promise<Skill[]>
  searchSkills(options: SkillSearchOptions): Promise<Skill[]>

  // Auto-consolidation
  consolidateFromEpisodes(options: ConsolidateOptions): Promise<Skill[]>

  // Analytics
  updateSkillStats(skillId: string, stats: SkillStats): Promise<void>
}
```

#### Skill Interface

```typescript
interface Skill {
  id?: string;
  name: string;
  description: string;
  signature?: {
    inputs: object;
    outputs: object;
  };
  code?: string;
  successRate: number;
  uses?: number;
  avgReward?: number;
  avgLatencyMs?: number;
  createdAt?: number;
}

interface SkillSearchOptions {
  task: string;
  k?: number;
  minSuccessRate?: number;
}
```

#### Example

```typescript
// Create skill
await flow.skills.create({
  name: 'jwt_authentication',
  description: 'Generate and validate JWT tokens',
  signature: {
    inputs: { userId: 'string', permissions: 'array' },
    outputs: { accessToken: 'string', refreshToken: 'string' }
  },
  code: 'implementation code...',
  successRate: 0.92
});

// Search for applicable skills
const skills = await flow.skills.search({
  task: 'user authentication with tokens',
  k: 5,
  minSuccessRate: 0.7
});

// Auto-consolidate from successful episodes
const newSkills = await flow.skills.consolidateFromEpisodes({
  minAttempts: 3,
  minSuccessRate: 0.7,
  lookbackDays: 7
});

console.log(`Auto-generated ${newSkills.length} skills`);
```

---

## Swarm Coordination

### SwarmManager

Multi-agent swarm orchestration with QUIC protocol.

```typescript
class SwarmManager {
  // Swarm lifecycle
  create(options: SwarmOptions): Promise<Swarm>
  destroy(swarmId: string): Promise<void>

  // Management
  get(swarmId: string): Swarm
  list(): Swarm[]
}
```

#### SwarmOptions

```typescript
interface SwarmOptions {
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  transport?: 'http' | 'quic';  // Default: 'http'
  maxAgents?: number;  // Default: 10
  strategy?: 'balanced' | 'specialized' | 'adaptive';

  agents?: {
    type: string;
    count: number;
  }[];
}
```

#### Example

```typescript
// Create QUIC-enabled swarm
const swarm = await flow.swarm.create({
  topology: 'mesh',
  transport: 'quic',  // 50-70% faster
  maxAgents: 10,
  strategy: 'adaptive',
  agents: [
    { type: 'researcher', count: 2 },
    { type: 'coder', count: 3 },
    { type: 'tester', count: 2 },
    { type: 'reviewer', count: 1 }
  ]
});

// Execute tasks in parallel
const results = await swarm.execute([
  'Research best practices',
  'Implement features',
  'Write tests',
  'Review code'
], {
  strategy: 'adaptive',
  parallel: true
});
```

### Swarm

Active swarm instance with task distribution.

```typescript
class Swarm {
  id: string;
  topology: string;
  transport: string;
  agents: Agent[];

  // Task execution
  execute(tasks: Task[], options?: ExecuteOptions): Promise<Result[]>
  assign(task: Task): Promise<Agent>

  // Monitoring
  getStatus(): SwarmStatus
  getMetrics(): SwarmMetrics

  // Lifecycle
  scale(targetSize: number): Promise<void>
  destroy(): Promise<void>
}
```

#### Example

```typescript
// Get swarm status
const status = swarm.getStatus();
console.log(`Active agents: ${status.activeAgents}`);
console.log(`Pending tasks: ${status.pendingTasks}`);

// Scale swarm
await swarm.scale(20);  // Add 10 more agents

// Get metrics
const metrics = swarm.getMetrics();
console.log(`Avg latency: ${metrics.avgLatencyMs}ms`);
console.log(`Throughput: ${metrics.throughput} tasks/sec`);
```

---

## Batch Operations

### BatchOperations

Optimized batch processing for 3-4x speedup.

```typescript
class BatchOperations {
  constructor(db: AgentDB, embedder: EmbeddingService, options?: BatchOptions)

  // Batch inserts
  insertSkills(skills: Skill[]): Promise<string[]>
  insertPatterns(patterns: Pattern[]): Promise<string[]>
  insertEpisodes(episodes: Episode[]): Promise<string[]>

  // Pruning
  pruneData(options: PruneOptions): Promise<PruneResult>
}
```

#### BatchOptions

```typescript
interface BatchOptions {
  batchSize?: number;  // Default: 100
  parallelism?: number;  // Default: 4
  progressCallback?: (completed: number, total: number) => void;
}

interface PruneOptions {
  maxAge?: number;  // Days to keep (default: 90)
  minReward?: number;  // Min reward to keep (default: 0.3)
  minSuccessRate?: number;  // Min success rate (default: 0.5)
  maxRecords?: number;  // Max records per table
  dryRun?: boolean;  // Preview without deleting
}
```

#### Example

```typescript
const batchOps = new BatchOperations(flow.db, embedder, {
  batchSize: 100,
  parallelism: 4,
  progressCallback: (done, total) => {
    console.log(`Progress: ${done}/${total}`);
  }
});

// Batch insert (3.6x faster)
await batchOps.insertSkills([...100 skills]);

// Intelligent pruning
const pruned = await batchOps.pruneData({
  maxAge: 90,
  minReward: 0.3,
  minSuccessRate: 0.5,
  dryRun: false
});

console.log(`Pruned ${pruned.episodesPruned} episodes`);
console.log(`Saved ${pruned.spaceSaved} bytes`);
```

---

## Agent Booster

### AgentBooster

Ultra-fast local code editing (352x faster).

```typescript
class AgentBooster {
  // Single file editing
  editFile(options: EditFileOptions): Promise<EditResult>

  // Batch editing
  batchEdit(edits: EditRequest[]): Promise<BatchEditResult>

  // Markdown parsing
  parseMarkdown(markdown: string): Promise<MultiFileEditResult>

  // Rollback
  rollback(editId: string): Promise<void>
}
```

#### EditFileOptions

```typescript
interface EditFileOptions {
  targetFilepath: string;
  instructions: string;
  codeEdit: string;
  language?: string;  // Auto-detected if not provided
}

interface EditResult {
  success: boolean;
  editId: string;
  diff: string;
  latencyMs: number;
  error?: string;
}
```

#### Example

```typescript
// Single file edit (1ms vs 352ms)
const result = await agent.edit({
  file: 'src/auth.ts',
  instruction: 'Add JWT token validation',
  codeEdit: `
    // ... existing code ...

    function validateToken(token: string): boolean {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.exp > Date.now() / 1000;
      } catch {
        return false;
      }
    }

    // ... existing code ...
  `
});

console.log(`Edited in ${result.latencyMs}ms`);  // ~1ms!

// Batch editing for multi-file refactoring
const booster = new AgentBooster();
await booster.batchEdit([
  { targetFilepath: 'src/auth.ts', instructions: '...', codeEdit: '...' },
  { targetFilepath: 'src/user.ts', instructions: '...', codeEdit: '...' },
  { targetFilepath: 'src/api.ts', instructions: '...', codeEdit: '...' }
]);
```

---

## Smart Router

### ModelRouter

Adaptive LLM selection for 85% cost savings.

```typescript
class ModelRouter {
  // Model selection
  selectModel(task: Task, constraints: Constraints): Promise<ModelSelection>

  // Execution with fallback
  execute(task: Task, constraints?: Constraints): Promise<ExecutionResult>

  // Performance tracking
  recordPerformance(execution: ExecutionResult): Promise<void>
  getPerformanceStats(filters: StatFilters): Promise<PerformanceStats>

  // Optimization strategies
  optimizeForCost(task: Task): Promise<ModelSelection>
  optimizeForQuality(task: Task): Promise<ModelSelection>
  optimizeForSpeed(task: Task): Promise<ModelSelection>
  optimizeBalanced(task: Task): Promise<ModelSelection>
}
```

#### Example

```typescript
// Automatic cost optimization
const result = await flow.execute({
  agent: 'coder',
  task: 'Review code for security',
  optimize: 'cost'  // Selects DeepSeek R1: 85% cheaper
});

// Manual model selection
const selection = await router.optimizeBalanced({
  description: 'Complex reasoning task',
  estimatedTokens: 5000
});

console.log(`Selected: ${selection.model}`);
console.log(`Cost: $${selection.estimatedCost}`);
console.log(`Quality Score: ${selection.qualityScore}`);
```

---

## Utilities

### EmbeddingService

Text-to-vector embedding generation.

```typescript
class EmbeddingService {
  constructor(options: EmbeddingOptions)

  initialize(): Promise<void>
  embed(text: string): Promise<Float32Array>
  batchEmbed(texts: string[]): Promise<Float32Array[]>
}
```

### CacheManager

Intelligent caching with TTL and LRU eviction.

```typescript
class CacheManager {
  constructor(maxSize: number, ttl: number)

  set(key: string, value: any, ttl?: number): void
  get(key: string): any | null
  clear(pattern?: string): void
  getStats(): CacheStats
}
```

---

## Type Definitions

### Common Types

```typescript
type OptimizationMode = 'quality' | 'balanced' | 'cost' | 'speed';
type Backend = 'agentdb' | 'sqlite' | 'memory';
type Topology = 'mesh' | 'hierarchical' | 'ring' | 'star';
type Transport = 'http' | 'quic';
type AttentionType = 'mha' | 'flash' | 'linear' | 'hyperbolic' | 'moe';
```

---

## Error Handling

All async methods can throw errors. Use try-catch:

```typescript
try {
  const agent = await flow.agents.spawn({ type: 'coder' });
  const result = await agent.execute(task);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network issue:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...       # For Claude models

# Optional
OPENROUTER_API_KEY=sk-or-...       # For OpenRouter models
GOOGLE_GEMINI_API_KEY=...          # For Gemini models

# AgentDB
AGENTDB_PATH=./agentdb.db          # Database path
AGENTDB_BACKEND=ruvector           # Backend selection

# Features
ENABLE_SMART_ROUTER=true           # Smart routing
ENABLE_LEARNING=true               # Learning features
ENABLE_CACHE=true                  # Caching

# QUIC (optional)
QUIC_PORT=4433                     # QUIC server port
QUIC_CERT_PATH=./certs/cert.pem    # TLS certificate
QUIC_KEY_PATH=./certs/key.pem      # TLS private key
```

---

## Next Steps

- [Quick Start Guide](quick-start.md) - Get started in 5 minutes
- [Migration Guide](migration-guide.md) - Upgrade from v1.x
- [Benchmarks](benchmarks.md) - Performance reports
- [Examples](../examples) - Example projects

---

**API Documentation Version:** v2.0.0-alpha.1
**Last Updated:** 2025-12-02
