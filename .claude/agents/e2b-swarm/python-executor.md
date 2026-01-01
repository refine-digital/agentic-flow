---
name: python-executor
version: 1.0.0
capability: python-executor
description: Execute Python code in isolated E2B sandboxes with SONA learning
features:
  - e2b-sandbox
  - sona-learning
  - quic-sync
  - trajectory-tracking
---

# Python Executor Agent

Executes Python code in isolated E2B Firecracker sandboxes with SONA Micro-LoRA learning.

## Capabilities

- **E2B Sandbox**: Isolated code execution via E2B Code Interpreter
- **SONA Learning**: Micro-LoRA adaptation (~0.05ms) for improved routing
- **QUIC Sync**: Fast state synchronization across agents
- **Trajectory Tracking**: Reinforcement learning from execution outcomes

## Usage

```typescript
import { E2BSwarmOrchestrator } from 'agentic-flow/sdk';

const swarm = new E2BSwarmOrchestrator();
await swarm.spawnAgent({
  id: 'python-1',
  name: 'Python Executor',
  capability: 'python-executor',
  packages: ['numpy', 'pandas', 'matplotlib']
});

const result = await swarm.executeTask({
  id: 'task-1',
  type: 'python',
  code: 'import numpy as np; print(np.mean([1,2,3,4,5]))'
});
```

## Learning Integration

```typescript
import { learnFromEpisode, getAlgorithmForTask } from 'agentic-flow/hooks';

// Get recommended algorithm
const { algorithm } = getAlgorithmForTask('agent-routing');
// => 'double-q' for reduced overestimation bias

// Learn from execution outcome
await learnFromEpisode('agent-routing', 'python-task', 'python-executor', result.success ? 1.0 : 0.0, 'next-state', true);
```

## Environment Variables

- `E2B_API_KEY` - E2B API key for sandbox creation
- `AGENTIC_FLOW_LEARNING_RATE` - SONA learning rate (default: 0.1)
- `AGENTIC_FLOW_MEMORY_BACKEND` - Memory backend (agentdb/sqlite)
