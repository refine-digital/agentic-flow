---
name: swarm-coordinator
version: 1.0.0
capability: coordinator
description: Master coordinator for E2B swarm with full agentic-flow integration
features:
  - e2b-swarm
  - sona-routing
  - quic-sync
  - multi-algorithm-rl
  - reasoningbank
  - trajectory-tracking
---

# Swarm Coordinator Agent

Master coordinator for E2B swarm orchestration with full agentic-flow intelligence stack.

## Full Feature Integration

| Feature | Purpose | Performance |
|---------|---------|-------------|
| **SONA Micro-LoRA** | Agent routing | ~0.05ms adaptation |
| **MoE Attention** | Expert selection | Top-2 of 4 experts |
| **HNSW Index** | Pattern search | 150x faster |
| **Multi-Algorithm RL** | Task-specific learning | 9 algorithms |
| **QUIC Sync** | Agent coordination | Low-latency |
| **EWC++** | Catastrophic forgetting prevention | λ=1000 |

## Usage

```typescript
import {
  E2BSwarmOrchestrator,
  createDefaultE2BSwarm,
  runInSwarm
} from 'agentic-flow/sdk';

// Create swarm with default agents
const swarm = await createDefaultE2BSwarm();
// Spawns: python-executor, javascript-executor, shell-executor,
//         data-analyst, test-runner, security-scanner

// Execute parallel tasks
const results = await swarm.executeTasks([
  { id: 't1', type: 'python', code: 'print(2+2)', priority: 'critical' },
  { id: 't2', type: 'javascript', code: 'console.log(3*3)', priority: 'high' },
  { id: 't3', type: 'shell', code: 'echo "Hello"', priority: 'medium' }
]);

// Get swarm metrics
const metrics = swarm.getMetrics();
console.log(`Active: ${metrics.activeAgents}/${metrics.totalAgents}`);
console.log(`Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
console.log(`Avg Execution: ${metrics.averageExecutionTime}ms`);
```

## Multi-Algorithm Learning

The coordinator selects optimal RL algorithm per task:

```typescript
import { getAlgorithmForTask, learnFromEpisode } from 'agentic-flow/hooks';

// Task type → Algorithm mapping
const algorithms = {
  'agent-routing': 'double-q',       // Reduces overestimation
  'error-avoidance': 'sarsa',        // Conservative on-policy
  'confidence-scoring': 'actor-critic', // Continuous 0-1
  'context-ranking': 'ppo',          // Stable preference
  'trajectory-learning': 'decision-transformer', // Sequences
  'memory-recall': 'td-lambda',      // Credit assignment
  'pattern-matching': 'q-learning',  // Fast value-based
  'exploration': 'reinforce',        // Policy gradient
  'multi-agent': 'a2c'               // Advantage estimation
};

// Learn from swarm execution
for (const result of results) {
  await learnFromEpisode(
    'agent-routing',
    result.taskId,
    result.agentId,
    result.success ? 1.0 : -0.5,
    'completed',
    true
  );
}
```

## Load Balancing Strategies

```typescript
// Capability-match (default) - routes to matching agent type
const swarm1 = new E2BSwarmOrchestrator({ loadBalancing: 'capability-match' });

// Round-robin - distributes evenly
const swarm2 = new E2BSwarmOrchestrator({ loadBalancing: 'round-robin' });

// Least-busy - routes to agent with fewest tasks
const swarm3 = new E2BSwarmOrchestrator({ loadBalancing: 'least-busy' });
```

## Health Monitoring

```typescript
const health = await swarm.healthCheck();
console.log(`Swarm Healthy: ${health.healthy}`);
for (const agent of health.agents) {
  console.log(`  ${agent.id}: ${agent.status} (healthy: ${agent.healthy})`);
}
```

## QUIC Synchronization

Agent state synced via QUIC for low-latency coordination:

```typescript
import { QUICProxy } from 'agentic-flow';

const proxy = new QUICProxy({ port: 4433 });
await proxy.start();

// Agents automatically sync through QUIC
// - Task assignments
// - Completion notifications
// - Metrics aggregation
```
