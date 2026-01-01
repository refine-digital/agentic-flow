# RuvLLM Integration Guide

**Package:** @ruvector/ruvllm@0.2.2
**Published:** 2025-12-03 (41 minutes ago)
**Repository:** https://github.com/ruvnet/ruvector/tree/main/examples/ruvLLM

## Overview

RuvLLM is a **self-learning LLM orchestration system** that enhances any LLM through adaptive memory and intelligent routing. It makes existing models smarter through continuous learning from interactions.

### Key Features

- 🚀 **Ultra-fast**: 0.06ms latency (~7,500x faster than GPT-4o API)
- 🧠 **Self-learning**: SONA adaptive learning with MicroLoRA
- 💾 **Smart Memory**: HNSW vector database for context
- 🎯 **Intelligent Routing**: FastGRNN router with EWC learning
- ⚡ **SIMD Performance**: CPU optimization (AVX2/AVX512)
- 🔄 **Continual Learning**: LoRA + EWC++ anti-forgetting

## Installation

### Global Installation (CLI)
```bash
npm install -g @ruvector/ruvllm
```

### Project Installation
```bash
npm install @ruvector/ruvllm
```

### For agentic-flow
```bash
cd /workspaces/agentic-flow/agentic-flow
npm install @ruvector/ruvllm --save
```

## CLI Usage

### Basic Commands

```bash
# Query with automatic routing
ruvllm query "What is machine learning?"

# Generate text with SIMD inference
ruvllm generate "Write a poem about AI" --temperature 0.9

# Get routing decision
ruvllm route "Complex technical question about quantum computing"

# Add to memory
ruvllm memory add "Important context about the project" --metadata '{"type":"note","priority":"high"}'

# Search memory
ruvllm memory search "project context" --k 5

# Get embedding
ruvllm embed "Sample text for embedding"

# Compute similarity
ruvllm similarity "hello world" "hi there"

# View statistics
ruvllm stats

# Performance benchmark
ruvllm benchmark --dims 1024 --iterations 5000

# System info
ruvllm info
```

### Advanced Options

```bash
# JSON output
ruvllm query "test" --json

# Custom temperature
ruvllm generate "prompt" --temperature 1.2

# Max tokens
ruvllm generate "prompt" --max-tokens 500

# Top-p sampling
ruvllm generate "prompt" --top-p 0.9

# Top-k sampling
ruvllm generate "prompt" --top-k 50

# Search with custom k
ruvllm memory search "query" --k 10
```

## Architecture

### Core Components

1. **LFM2 Cortex**
   - Frozen reasoning engine
   - 135M-2.6B parameters
   - Pre-trained foundation

2. **Ruvector Memory**
   - Adaptive synaptic mesh
   - HNSW indexing for fast retrieval
   - Vector similarity search

3. **FastGRNN Router**
   - Intelligent model selection
   - Sparse matrices
   - EWC learning for stability

4. **Graph Attention**
   - 8-head multi-head attention
   - Edge features
   - Context-aware processing

### SONA Learning System

Three temporal learning loops:

#### 1. Instant Loop (per-request)
- **Speed:** <100μs latency
- **Method:** MicroLoRA adaptation
- **Purpose:** Immediate response optimization

#### 2. Background Loop (hourly)
- **Method:** K-means++ clustering
- **Purpose:** Pattern extraction
- **Frequency:** Every hour

#### 3. Deep Loop (weekly)
- **Method:** Dream consolidation with EWC++
- **Purpose:** Long-term knowledge retention
- **Frequency:** Weekly

## Performance Metrics

| Metric | Value | Comparison |
|--------|-------|------------|
| Orchestration Latency (P50) | 0.06ms | ~7,500x faster than GPT-4o |
| Throughput | ~38,000 queries/sec | Production-ready |
| Memory Footprint | ~50MB | Lightweight |
| MicroLoRA Operations | 2,236 ops/sec | Fast adaptation |

## Integration with agentic-flow

### 1. Basic Integration

```typescript
import RuvLLM from '@ruvector/ruvllm';

// Initialize RuvLLM
const ruvllm = new RuvLLM({
  embeddingDim: 768,
  routerHiddenDim: 128,
  learningEnabled: true,
  memoryPath: './data/ruvllm-memory'
});

// Query with automatic routing
const response = await ruvllm.query({
  text: "How do I implement vector search?",
  sessionId: "user-123",
  temperature: 0.7
});

console.log(response);
```

### 2. Memory Integration

```typescript
// Add context to memory
await ruvllm.memory.add({
  content: "Project uses agentdb for vector storage",
  metadata: {
    type: "context",
    project: "agentic-flow",
    importance: "high"
  }
});

// Search memory before query
const context = await ruvllm.memory.search({
  query: "vector storage",
  k: 3
});

// Query with retrieved context
const response = await ruvllm.query({
  text: "What vector database do we use?",
  context: context.map(r => r.content).join('\n')
});
```

### 3. Intelligent Routing

```typescript
// Get routing decision
const route = await ruvllm.route({
  text: "Complex quantum computing question"
});

console.log(route);
// {
//   model: "gpt-4",
//   confidence: 0.95,
//   reasoning: "Technical complexity requires advanced model"
// }

// Use routing for cost optimization
if (route.model === "gpt-3.5-turbo") {
  // Use cheaper model for simple queries
} else {
  // Use advanced model for complex queries
}
```

### 4. Adaptive Learning

```typescript
// Provide feedback for learning
await ruvllm.feedback({
  queryId: response.id,
  rating: 5,
  helpful: true,
  metadata: {
    task: "code-generation",
    success: true
  }
});

// View learning statistics
const stats = await ruvllm.stats();
console.log(stats);
// {
//   totalQueries: 1234,
//   averageLatency: 0.062,
//   learningRate: 0.001,
//   memorySize: 5678,
//   routerAccuracy: 0.94
// }
```

## Use Cases in agentic-flow

### 1. Agent Orchestration Enhancement

```typescript
import { AgenticFlow } from 'agentic-flow';
import RuvLLM from '@ruvector/ruvllm';

const ruvllm = new RuvLLM({ learningEnabled: true });
const flow = new AgenticFlow();

// Enhance agent queries with RuvLLM routing
flow.on('agent:query', async (query) => {
  // Get intelligent routing
  const route = await ruvllm.route({ text: query.text });

  // Use recommended model
  query.model = route.model;
  query.temperature = route.suggestedTemperature;

  // Add memory context
  const context = await ruvllm.memory.search({
    query: query.text,
    k: 5
  });
  query.context = context;

  return query;
});
```

### 2. ReasoningBank Integration

```typescript
import { ReasoningBank } from 'agentdb';
import RuvLLM from '@ruvector/ruvllm';

const reasoningBank = new ReasoningBank();
const ruvllm = new RuvLLM();

// Store successful patterns in RuvLLM memory
reasoningBank.on('pattern:success', async (pattern) => {
  await ruvllm.memory.add({
    content: JSON.stringify(pattern),
    metadata: {
      type: 'reasoning-pattern',
      reward: pattern.reward,
      task: pattern.task
    }
  });
});

// Retrieve patterns for new tasks
async function enhanceReasoning(task: string) {
  const patterns = await ruvllm.memory.search({
    query: task,
    k: 3
  });

  return patterns.map(p => JSON.parse(p.content));
}
```

### 3. Multi-Agent Coordination

```typescript
import RuvLLM from '@ruvector/ruvllm';

const ruvllm = new RuvLLM();

// Coordinate multiple agents
async function coordinateAgents(task: string, agents: Agent[]) {
  // Get routing decision
  const route = await ruvllm.route({
    text: task,
    metadata: {
      agents: agents.map(a => a.type)
    }
  });

  // Select best agent
  const selectedAgent = agents.find(a =>
    a.capabilities.includes(route.recommendedCapability)
  );

  // Add interaction to memory
  await ruvllm.memory.add({
    content: `Task: ${task}\nAgent: ${selectedAgent.name}\nResult: success`,
    metadata: {
      type: 'coordination',
      agentType: selectedAgent.type
    }
  });

  return selectedAgent;
}
```

## Performance Optimization

### 1. SIMD Benchmarking

```bash
# Run comprehensive benchmark
ruvllm benchmark --dims 768 --iterations 10000

# Expected output:
# SIMD Performance Benchmark
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Dimensions: 768
# Iterations: 10000
#
# Results:
#   Throughput: 38,234 ops/sec
#   Latency P50: 0.062ms
#   Latency P95: 0.089ms
#   Latency P99: 0.124ms
#   Memory: 52.3 MB
```

### 2. Memory Optimization

```typescript
// Configure memory limits
const ruvllm = new RuvLLM({
  memory: {
    maxEntries: 10000,
    evictionPolicy: 'lru',
    persistPath: './data/ruvllm-memory.db'
  }
});

// Periodic cleanup
setInterval(async () => {
  await ruvllm.memory.cleanup({
    olderThan: 30 * 24 * 60 * 60 * 1000, // 30 days
    minRelevance: 0.3
  });
}, 24 * 60 * 60 * 1000); // Daily
```

### 3. Learning Rate Tuning

```typescript
const ruvllm = new RuvLLM({
  learning: {
    microLoraLr: 0.001,      // Instant loop
    clusteringInterval: 3600, // Background loop (1 hour)
    consolidationDays: 7      // Deep loop (weekly)
  }
});
```

## Advanced Features

### 1. Federated Learning

```typescript
// Enable federated learning across agents
const ruvllm = new RuvLLM({
  federated: {
    enabled: true,
    peers: ['agent-1', 'agent-2', 'agent-3'],
    syncInterval: 300000 // 5 minutes
  }
});

// Share learning updates
await ruvllm.federated.sync();
```

### 2. Export to HuggingFace

```typescript
// Export learned model
await ruvllm.export({
  format: 'huggingface',
  path: './models/ruvllm-finetuned',
  includeWeights: true
});
```

### 3. WASM Browser Deployment

```typescript
// Browser-compatible version
import RuvLLM from '@ruvector/ruvllm/wasm';

const ruvllm = await RuvLLM.initWasm({
  wasmPath: '/wasm/ruvllm.wasm'
});

// Use in browser
const response = await ruvllm.query({ text: "Hello" });
```

## Configuration Reference

```typescript
interface RuvLLMConfig {
  // Core settings
  embeddingDim: number;          // Default: 768
  routerHiddenDim: number;       // Default: 128
  learningEnabled: boolean;      // Default: true

  // Memory settings
  memory?: {
    maxEntries?: number;         // Default: 100000
    evictionPolicy?: 'lru' | 'lfu';
    persistPath?: string;
  };

  // Learning settings
  learning?: {
    microLoraLr?: number;        // Default: 0.001
    clusteringInterval?: number; // Default: 3600 (1 hour)
    consolidationDays?: number;  // Default: 7
    ewcLambda?: number;          // Default: 0.4
  };

  // Router settings
  router?: {
    temperature?: number;        // Default: 0.7
    topK?: number;              // Default: 3
    confidence?: number;         // Default: 0.8
  };

  // Performance settings
  simd?: {
    enabled?: boolean;           // Default: true
    cpuFeatures?: string[];      // Auto-detected
  };
}
```

## Troubleshooting

### Issue: Slow Performance

```bash
# Check SIMD support
ruvllm info

# Run benchmark
ruvllm benchmark

# Expected: ~38,000 ops/sec
# If slower, check CPU features and enable SIMD
```

### Issue: Memory Growth

```typescript
// Configure memory limits
const ruvllm = new RuvLLM({
  memory: {
    maxEntries: 10000,
    evictionPolicy: 'lru'
  }
});

// Monitor memory
const stats = await ruvllm.stats();
console.log(`Memory: ${stats.memoryMB}MB`);
```

### Issue: Learning Not Improving

```typescript
// Increase learning rate
const ruvllm = new RuvLLM({
  learning: {
    microLoraLr: 0.01, // 10x higher
    clusteringInterval: 1800 // 30 minutes
  }
});

// Provide more feedback
await ruvllm.feedback({
  queryId: response.id,
  rating: 5,
  helpful: true
});
```

## Examples

### Example 1: Smart Code Assistant

```typescript
import RuvLLM from '@ruvector/ruvllm';

const ruvllm = new RuvLLM({ learningEnabled: true });

async function codeAssistant(question: string) {
  // Add code context to memory
  await ruvllm.memory.add({
    content: "Project uses TypeScript, React, and AgentDB",
    metadata: { type: "project-context" }
  });

  // Query with context
  const response = await ruvllm.query({
    text: question,
    sessionId: "code-session",
    temperature: 0.3 // Lower for code
  });

  return response.text;
}

// Usage
const answer = await codeAssistant("How do I query the vector database?");
console.log(answer);
```

### Example 2: Multi-Model Routing

```typescript
async function smartQuery(text: string) {
  const route = await ruvllm.route({ text });

  let response;
  if (route.model === 'gpt-4') {
    // Use expensive model for complex queries
    response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: text }]
    });
  } else {
    // Use cheaper model for simple queries
    response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: text }]
    });
  }

  // Learn from result
  await ruvllm.feedback({
    queryId: route.id,
    rating: 5,
    costSavings: route.model === 'gpt-3.5-turbo' ? 0.9 : 0
  });

  return response;
}
```

## Resources

- **npm Package:** https://www.npmjs.com/package/@ruvector/ruvllm
- **GitHub:** https://github.com/ruvnet/ruvector/tree/main/examples/ruvLLM
- **Documentation:** https://github.com/ruvnet/ruvector
- **Issues:** https://github.com/ruvnet/ruvector/issues

## License

MIT OR Apache-2.0

## Version

Current: v0.2.2
Published: 2025-12-03 (latest)

---

**Status:** Production Ready 🚀

RuvLLM provides ultra-fast, self-learning LLM orchestration with adaptive memory and intelligent routing - perfect for enhancing agentic-flow's multi-agent coordination and reasoning capabilities.
