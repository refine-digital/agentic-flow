# RuvLLM Quick Start Guide

**Package:** @ruvector/ruvllm v0.2.2
**Status:** ✅ Installed and Working

## What is RuvLLM?

RuvLLM is a **self-learning LLM orchestration system** that makes any LLM smarter through:
- ⚡ **Ultra-fast routing** (0.06ms latency)
- 🧠 **Adaptive learning** (SONA with MicroLoRA)
- 💾 **Smart memory** (HNSW vector database)
- 🎯 **Intelligent model selection** (FastGRNN router)

## System Info

```
Version       : 0.1.0
Native Module : Loaded ✅
SIMD Support  : Yes ✅
Capabilities  : AVX2, SSE4.1, FMA
Platform      : linux-x64
Node.js       : v22.17.0
```

## Performance Benchmarks

**768 dimensions, 1000 iterations:**
- Dot Product: 4,608 ops/sec
- Cosine Similarity: 3,546 ops/sec
- L2 Distance: 4,587 ops/sec
- Softmax: 3,876 ops/sec

**All with Native SIMD acceleration (AVX2, FMA)** ✅

## Quick Commands

### Memory Operations

```bash
# Add to memory
ruvllm memory add "Important context" --metadata '{"type":"note"}'

# Search memory
ruvllm memory search "context" --k 5

# Add technical info
ruvllm memory add "AgentDB uses Float32Array for performance" \\
  --metadata '{"type":"technical","priority":"high"}'
```

### Text Operations

```bash
# Generate embeddings
ruvllm embed "Sample text"

# Compute similarity
ruvllm similarity "hello world" "hi there"

# Query (with routing)
ruvllm query "What is machine learning?"

# Generate text
ruvllm generate "Write a poem" --temperature 0.9
```

### Performance

```bash
# View stats
ruvllm stats

# Run benchmark
ruvllm benchmark --dims 768 --iterations 1000

# System info
ruvllm info
```

## Integration with agentic-flow

### Install in Project

```bash
cd /workspaces/agentic-flow/agentic-flow
npm install @ruvector/ruvllm --save
```

### Basic Usage

```typescript
import RuvLLM from '@ruvector/ruvllm';

// Initialize
const ruvllm = new RuvLLM({
  embeddingDim: 768,
  learningEnabled: true
});

// Query with routing
const response = await ruvllm.query({
  text: "How do I use vector search?",
  sessionId: "user-123"
});

console.log(response);
```

### Memory Integration

```typescript
// Add context
await ruvllm.memory.add({
  content: "Project uses agentdb@2.0.0-alpha.2.20 with Float32Array",
  metadata: {
    type: "project-info",
    version: "2.0.0-alpha.2.20"
  }
});

// Search and use context
const context = await ruvllm.memory.search({
  query: "vector database",
  k: 3
});
```

### Intelligent Routing

```typescript
// Get routing decision
const route = await ruvllm.route({
  text: "Complex quantum physics question"
});

// route.model = "gpt-4" (for complex queries)
// route.confidence = 0.95
// Use recommended model to optimize cost/quality
```

## Use Cases

### 1. Cost Optimization
Route simple queries to cheaper models, complex to GPT-4

### 2. Context Awareness
Store project context in memory for better responses

### 3. Continuous Learning
Learn from interactions to improve over time

### 4. Multi-Agent Coordination
Smart routing between specialized agents

## Key Features

- **0.06ms latency** (~7,500x faster than GPT-4o API)
- **38,000 queries/sec** throughput
- **~50MB** memory footprint
- **SIMD** CPU optimization (AVX2/AVX512)
- **Q4** weight quantization
- **LoRA + EWC++** learning
- **WASM** browser compatibility

## Example: Smart Code Assistant

```typescript
import RuvLLM from '@ruvector/ruvllm';

const ruvllm = new RuvLLM({ learningEnabled: true });

// Add project context
await ruvllm.memory.add({
  content: "Project: agentic-flow v2.0.1-alpha.7, Uses: AgentDB, TypeScript, React",
  metadata: { type: "project" }
});

// Query with context
const answer = await ruvllm.query({
  text: "How do I query the vector database?",
  sessionId: "code-session",
  temperature: 0.3 // Lower for code
});

console.log(answer.text);
```

## Resources

- **Documentation:** `/workspaces/agentic-flow/docs/RUVLLM_INTEGRATION.md`
- **npm:** https://www.npmjs.com/package/@ruvector/ruvllm
- **GitHub:** https://github.com/ruvnet/ruvector/tree/main/examples/ruvLLM

## CLI Help

```bash
ruvllm --help
```

Shows all available commands and options.

---

**Status:** ✅ Ready to Use

RuvLLM is installed and working with native SIMD acceleration. Perfect for enhancing agentic-flow's LLM orchestration!
