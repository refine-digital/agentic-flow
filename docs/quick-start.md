# Quick Start Guide - Agentic-Flow v2.0

Get started with Agentic-Flow v2.0 in 5 minutes. This guide covers installation, basic usage, and key features.

## Installation

### Alpha Release (Early Adopters)

```bash
# Install v2.0.0-alpha with all new features
npm install agentic-flow@alpha
```

### Stable Release (Production)

```bash
# Install current stable version (v1.x)
npm install agentic-flow@latest
```

## Your First Agent (60 seconds)

### 1. Basic Agent Execution

```typescript
import { AgenticFlowV2 } from 'agentic-flow';

// Initialize with AgentDB v2 backend
const flow = new AgenticFlowV2({
  backend: 'agentdb',  // 150x faster than v1.0
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Spawn an agent
const agent = await flow.agents.spawn({
  type: 'coder',
  capabilities: ['typescript', 'react']
});

// Execute a task
const result = await agent.execute({
  task: 'Build a REST API with authentication',
  optimize: 'cost'  // Uses smart router for 85% cost savings
});

console.log(result.output);
```

### 2. Using Memory (ReasoningBank)

```typescript
// Search for similar past solutions
const context = await flow.memory.search('authentication patterns', {
  k: 10,
  lambda: 0.6  // MMR diversity
});

// Spawn agent with pre-loaded context
const agent = await flow.agents.spawn({
  type: 'coder',
  memory: context  // Agent starts with relevant knowledge
});

// Execute task (agent learns from context)
const result = await agent.execute({
  task: 'Implement OAuth2 authentication'
});

// Store successful outcome for future learning
await flow.reasoningBank.store({
  task: result.task,
  approach: 'OAuth2 with PKCE flow',
  reward: 0.95,
  critique: 'PKCE prevented token interception attacks'
});
```

### 3. Agent Booster (352x Faster Code Editing)

```typescript
// Agent automatically uses Agent Booster for code edits
const result = await agent.edit({
  file: 'src/auth.ts',
  instruction: 'Add JWT token validation',
  codeEdit: `
    // ... existing code ...

    // Add token validation
    function validateToken(token: string): boolean {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.exp > Date.now() / 1000;
      } catch (error) {
        return false;
      }
    }

    // ... existing code ...
  `
});

console.log(`✨ Edited in ${result.latencyMs}ms`);  // ~1ms vs 352ms
```

### 4. Smart LLM Router (85% Cost Savings)

```typescript
// Automatic cost optimization
const result = await flow.execute({
  agent: 'coder',
  task: 'Review code for security issues',
  optimize: 'cost'  // Selects DeepSeek R1: 85% cheaper
});

// Or optimize for quality
const qualityResult = await flow.execute({
  agent: 'coder',
  task: 'Critical security audit',
  optimize: 'quality'  // Selects Claude Sonnet 4.5
});

// Or optimize for speed
const speedResult = await flow.execute({
  agent: 'coder',
  task: 'Simple code formatting',
  optimize: 'speed'  // Selects Gemini 2.5 Flash
});
```

## Key Features (5-Minute Tour)

### 1. ReasoningBank: Population-Wide Learning

```typescript
import { ReasoningBank } from 'agentic-flow';

const reasoningBank = new ReasoningBank(flow.db);

// Store pattern
await reasoningBank.store({
  taskType: 'code_review',
  approach: 'Security scan → Type safety → Code quality',
  successRate: 0.94,
  tags: ['security', 'typescript']
});

// Search patterns (32.6M ops/sec - ultra-fast!)
const patterns = await reasoningBank.search({
  task: 'security code review',
  k: 10,
  threshold: 0.7
});

console.log(`Found ${patterns.length} similar patterns`);
patterns.forEach(p => {
  console.log(`- ${p.approach} (${(p.successRate * 100).toFixed(0)}% success)`);
});
```

### 2. ReflexionMemory: Learn from Experience

```typescript
import { ReflexionMemory } from 'agentic-flow';

const reflexion = new ReflexionMemory(flow.db);

// Store episode with self-critique
await reflexion.store({
  sessionId: 'debug-session-1',
  task: 'Fix authentication bug',
  reward: 0.95,
  success: true,
  critique: 'OAuth2 PKCE flow was more secure. Always check token expiration.',
  input: 'Users can\'t log in',
  output: 'Working OAuth2 with refresh tokens',
  latencyMs: 1200,
  tokensUsed: 500
});

// Retrieve similar episodes
const similar = await reflexion.retrieve({
  task: 'authentication issues',
  k: 10,
  onlySuccesses: true,
  minReward: 0.7
});

console.log(`Learning from ${similar.length} past successes`);
```

### 3. SkillLibrary: Reusable Capabilities

```typescript
import { SkillLibrary } from 'agentic-flow';

const skills = new SkillLibrary(flow.db);

// Create skill
await skills.create({
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
const applicable = await skills.search({
  task: 'user authentication with tokens',
  k: 5,
  minSuccessRate: 0.7
});

console.log(`Found ${applicable.length} applicable skills`);
```

### 4. Multi-Agent Swarms

```typescript
// Create a swarm with QUIC coordination
const swarm = await flow.swarm.create({
  topology: 'mesh',
  transport: 'quic',  // 50-70% faster than TCP
  agents: [
    { type: 'researcher', count: 2 },
    { type: 'coder', count: 3 },
    { type: 'tester', count: 2 },
    { type: 'reviewer', count: 1 }
  ]
});

// Distribute tasks across swarm
const tasks = [
  'Research authentication best practices',
  'Implement OAuth2 flow',
  'Write comprehensive tests',
  'Review security implications'
];

const results = await swarm.execute(tasks, {
  strategy: 'adaptive',  // Auto-optimizes topology
  parallel: true
});

console.log(`Completed ${results.length} tasks in parallel`);
```

## CLI Tools

### agentic-flow: Main Agent Execution

```bash
# Execute agent with auto-optimization
npx agentic-flow@alpha \
  --agent coder \
  --task "Build a REST API" \
  --optimize cost

# List available agents
npx agentic-flow@alpha --list

# Get agent details
npx agentic-flow@alpha agent info coder
```

### agentdb: Memory Operations

```bash
# Initialize database
npx agentdb@alpha init --dimension 768 --preset medium

# System diagnostics
npx agentdb@alpha doctor --verbose

# Store reflexion episode
npx agentdb@alpha reflexion store \
  "session-1" \
  "fix_auth_bug" \
  0.95 \
  true \
  "OAuth2 PKCE worked perfectly"

# Search patterns
npx agentdb@alpha pattern search "authentication" 10

# Run latent space simulation
npx agentdb@alpha simulate hnsw --iterations 3
```

### ajj-billing: Subscription Management

```bash
# Create subscription
npx ajj-billing subscription:create user123 professional monthly payment_123

# Check subscription status
npx ajj-billing subscription:status sub_456

# Record usage
npx ajj-billing usage:record sub_456 agent_hours 10.5

# View pricing tiers
npx ajj-billing pricing:tiers
```

## MCP Integration (Claude Code)

### One-Command Setup

```bash
# Add AgentDB to Claude Code
claude mcp add agentdb npx agentdb@alpha mcp start
```

### Manual Setup

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agentdb": {
      "command": "npx",
      "args": ["agentdb@alpha", "mcp", "start"],
      "env": {
        "AGENTDB_PATH": "./agentdb.db"
      }
    }
  }
}
```

### Available MCP Tools (32 total)

Now Claude Code can:
- Store reasoning patterns automatically
- Search 32.6M patterns/sec for relevant approaches
- Learn from successful task completions
- Build reusable skills over time
- Run latent space simulations

## Performance Tips

### 1. Enable HNSW Indexing

```typescript
// Build index for 150x faster search
await flow.db.buildHNSWIndex({
  M: 16,              // Connections per layer
  efConstruction: 200, // Build-time accuracy
  efSearch: 50        // Search-time accuracy
});
```

### 2. Use Batch Operations

```typescript
import { BatchOperations } from 'agentic-flow';

const batchOps = new BatchOperations(flow.db);

// 3.6x faster than sequential
await batchOps.insertSkills([...100 skills]);

// 3.4x faster than sequential
await batchOps.insertEpisodes([...100 episodes]);
```

### 3. Enable Quantization

```typescript
// 4x memory reduction with minimal accuracy loss
await flow.db.enableQuantization({
  type: 'product',
  codebookSize: 256,
  subvectorCount: 8
});
```

### 4. Use Smart Caching

```typescript
// Cache configuration (automatic)
flow.db.enableCache({
  maxSize: 1000,  // Top 1000 queries
  ttl: 3600000    // 1 hour TTL
});
```

## Common Patterns

### Pattern 1: Learning Agent

```typescript
// Agent that learns from every task
async function createLearningAgent(flow, agentType) {
  const agent = await flow.agents.spawn({ type: agentType });

  // Pre-load context from past successes
  const context = await flow.reasoningBank.search(
    `${agentType} best practices`,
    10
  );

  agent.setContext(context);

  // Execute task
  const result = await agent.execute(task);

  // Store outcome for future learning
  if (result.success) {
    await flow.reasoningBank.store({
      task: result.task,
      approach: result.approach,
      reward: result.reward,
      critique: result.critique
    });
  }

  return result;
}
```

### Pattern 2: Self-Improving Pipeline

```typescript
// Pipeline that improves over time
async function selfImprovingPipeline(flow, tasks) {
  const results = [];

  for (const task of tasks) {
    // Search for similar past solutions
    const patterns = await flow.reasoningBank.search(task, 5);

    // Select best approach
    const bestPattern = patterns.sort((a, b) =>
      b.successRate - a.successRate
    )[0];

    // Execute with learned approach
    const result = await flow.execute({
      task,
      approach: bestPattern?.approach,
      optimize: 'balanced'
    });

    // Store for future improvement
    await flow.reflexion.store({
      sessionId: 'pipeline',
      task,
      reward: result.success ? 0.9 : 0.3,
      success: result.success,
      critique: result.critique
    });

    results.push(result);
  }

  return results;
}
```

### Pattern 3: Distributed Swarm

```typescript
// Distribute work across multiple agents
async function distributedSwarm(flow, tasks) {
  // Create swarm with optimal topology
  const swarm = await flow.swarm.create({
    topology: 'mesh',      // Peer-to-peer
    transport: 'quic',     // Ultra-low latency
    agents: tasks.length   // One agent per task
  });

  // Execute all tasks in parallel
  const results = await swarm.execute(tasks, {
    strategy: 'adaptive',  // Auto-optimizes
    parallel: true,
    timeout: 60000         // 60 second timeout
  });

  // Learn from swarm performance
  await flow.reasoningBank.store({
    taskType: 'swarm_execution',
    approach: `${swarm.topology} topology with ${swarm.agents.length} agents`,
    successRate: results.filter(r => r.success).length / results.length,
    metadata: {
      totalTime: swarm.totalTime,
      avgLatency: swarm.avgLatency
    }
  });

  return results;
}
```

## Next Steps

- **[API Reference](api-reference.md)**: Complete API documentation
- **[Migration Guide](migration-guide.md)**: Upgrade from v1.x
- **[Benchmarks](benchmarks.md)**: Performance reports
- **[Tutorials](../examples)**: Example projects

## Troubleshooting

### Issue: Agent spawn is slow

```typescript
// Solution: Use warm start with pre-loaded context
const context = await flow.memory.search('relevant topic', 10);
const agent = await flow.agents.spawn({
  type: 'coder',
  memory: context  // Pre-loaded context for instant startup
});
```

### Issue: High memory usage

```typescript
// Solution: Enable quantization
await flow.db.enableQuantization({
  type: 'product',
  codebookSize: 256
});
```

### Issue: Slow searches

```typescript
// Solution: Build HNSW index
await flow.db.buildHNSWIndex({
  M: 16,
  efConstruction: 200,
  efSearch: 50
});
```

### Issue: High API costs

```typescript
// Solution: Use smart router with cost optimization
const result = await flow.execute({
  agent: 'coder',
  task: 'Your task',
  optimize: 'cost'  // 85% cost reduction
});
```

## Support

- **Documentation**: [Complete Docs](../docs)
- **Issues**: [GitHub Issues](https://github.com/ruvnet/agentic-flow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ruvnet/agentic-flow/discussions)
- **Discord**: [Join Community](https://discord.gg/agentic-flow)

---

**Ready to build intelligent agents?** Start with the [API Reference](api-reference.md) or explore [Example Projects](../examples).
