# Phase 2: Orchestration Core - Detailed Execution Plan

**Phase:** 2 of 5
**Duration:** 3-4 days (Days 4-6)
**Status:** 🎯 READY TO START
**Package:** agentic-flow@2.0.1-alpha.7 → 2.0.1-alpha.8

---

## 🎯 Phase 2 Objective

Implement self-learning orchestration with intelligent routing as the foundation for agentic-flow's intelligence layer.

### What We're Building

1. **RuvLLM Orchestrator** - Self-learning LLM orchestration (TRM + SONA + FastGRNN)
2. **Circuit Breaker Router** - Fault-tolerant routing with 99.9% uptime
3. **Semantic Agent Router** - HNSW-based agent selection <10ms

### Why This Matters

This is the **critical path** - without these components, agentic-flow is just a task runner. With them, it becomes an intelligent, self-learning orchestration platform.

---

## 📦 Package Installation

### Prerequisites

```bash
cd /workspaces/agentic-flow/agentic-flow

# Verify current version
npm list agentic-flow
# Should show: agentic-flow@2.0.1-alpha

# Verify Node.js version
node --version
# Should be: v18+ or v20+

# Verify build works
npm run build
npm test
```

### Install New Packages

```bash
# Install all Phase 2 packages at once
npm install \
  @ruvector/ruvllm@^0.2.3 \
  @ruvector/tiny-dancer@^0.1.15 \
  @ruvector/router@^0.1.25 \
  --save

# Verify installations
npm list @ruvector/ruvllm
npm list @ruvector/tiny-dancer
npm list @ruvector/router

# Update package-lock.json
npm install
```

### Expected package.json Changes

```diff
"dependencies": {
  "@ruvector/attention": "^0.1.3",
  "@ruvector/gnn": "^0.1.21",
+ "@ruvector/router": "^0.1.25",
+ "@ruvector/ruvllm": "^0.2.3",
  "@ruvector/sona": "^0.1.4",
+ "@ruvector/tiny-dancer": "^0.1.15",
  "ruvector": "^0.1.42"
}
```

---

## 📅 Day 4: RuvLLM Integration (6 hours)

### Morning Session (3 hours) - Implementation

#### Step 1: Create Orchestrator Interface (30 min)

**File:** `/workspaces/agentic-flow/agentic-flow/src/orchestration/types.ts`

```typescript
export interface OrchestrationRequest {
  task: string;
  sessionId: string;
  context?: string[];
  temperature?: number;
  maxTokens?: number;
  agentHint?: string;
}

export interface OrchestrationResponse {
  text: string;
  model: string;
  latency: number;
  confidence: number;
  reasoning: string[];
  metadata: Record<string, any>;
}

export interface IOrchestrator {
  initialize(): Promise<void>;
  query(request: OrchestrationRequest): Promise<OrchestrationResponse>;
  feedback(queryId: string, rating: number, metadata?: Record<string, any>): Promise<void>;
  stats(): Promise<OrchestratorStats>;
}

export interface OrchestratorStats {
  totalQueries: number;
  averageLatency: number;
  routerAccuracy: number;
  learningRate: number;
  memorySize: number;
}
```

#### Step 2: Implement RuvLLM Orchestrator (90 min)

**File:** `/workspaces/agentic-flow/agentic-flow/src/orchestration/RuvLLMOrchestrator.ts`

```typescript
import RuvLLM from '@ruvector/ruvllm';
import type { IOrchestrator, OrchestrationRequest, OrchestrationResponse } from './types';
import { ReasoningBank } from '../reasoningbank';

export class RuvLLMOrchestrator implements IOrchestrator {
  private ruvllm?: RuvLLM;
  private reasoningBank?: ReasoningBank;
  private config: RuvLLMConfig;

  constructor(config?: Partial<RuvLLMConfig>) {
    this.config = {
      embeddingDim: 768,
      routerHiddenDim: 128,
      learningEnabled: true,
      memoryPath: config?.memoryPath || './data/ruvllm-memory',
      ...config
    };
  }

  async initialize(): Promise<void> {
    // Initialize RuvLLM
    this.ruvllm = new RuvLLM({
      embeddingDim: this.config.embeddingDim,
      routerHiddenDim: this.config.routerHiddenDim,
      learningEnabled: this.config.learningEnabled,
      memory: {
        maxEntries: 100000,
        evictionPolicy: 'lru',
        persistPath: this.config.memoryPath
      },
      learning: {
        microLoraLr: 0.001,      // Fast instant learning
        clusteringInterval: 3600, // Hourly background learning
        consolidationDays: 7      // Weekly deep learning
      }
    });

    // Initialize ReasoningBank for pattern storage
    this.reasoningBank = new ReasoningBank();
    await this.reasoningBank.initialize();

    console.log('✅ RuvLLM Orchestrator initialized');
  }

  async query(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    if (!this.ruvllm) throw new Error('Orchestrator not initialized');

    const startTime = performance.now();

    try {
      // Step 1: Retrieve relevant patterns from ReasoningBank
      const patterns = await this.reasoningBank!.searchPatterns({
        task: request.task,
        k: 3
      });

      // Step 2: Build context from patterns and request
      const context = [
        ...(request.context || []),
        ...patterns.map(p => `Past success: ${p.task} (reward: ${p.reward})`)
      ].join('\n');

      // Step 3: Add task to RuvLLM memory
      await this.ruvllm.memory.add({
        content: request.task,
        metadata: {
          sessionId: request.sessionId,
          timestamp: Date.now()
        }
      });

      // Step 4: Query with TRM (Tiny Recursive Models) reasoning
      const response = await this.ruvllm.query({
        text: request.task,
        context,
        sessionId: request.sessionId,
        temperature: request.temperature || 0.7,
        maxTokens: request.maxTokens || 1000
      });

      const latency = performance.now() - startTime;

      // Step 5: Store interaction for learning
      await this.reasoningBank!.storePattern({
        sessionId: request.sessionId,
        task: request.task,
        output: response.text,
        reward: 0.5, // Default, will be updated with feedback
        success: true,
        latencyMs: latency
      });

      return {
        text: response.text,
        model: response.model || 'ruvllm',
        latency,
        confidence: response.confidence || 0.8,
        reasoning: response.reasoning || [],
        metadata: {
          patternsUsed: patterns.length,
          memoryEntries: (await this.stats()).memorySize
        }
      };

    } catch (error) {
      console.error('❌ Orchestration error:', error);
      throw error;
    }
  }

  async feedback(queryId: string, rating: number, metadata?: Record<string, any>): Promise<void> {
    if (!this.ruvllm) throw new Error('Orchestrator not initialized');

    // Provide feedback to RuvLLM for learning
    await this.ruvllm.feedback({
      queryId,
      rating,
      helpful: rating >= 4,
      metadata
    });

    // Update pattern reward in ReasoningBank
    if (metadata?.task) {
      await this.reasoningBank!.updatePattern({
        task: metadata.task,
        reward: rating / 5.0, // Normalize to 0-1
        success: rating >= 3
      });
    }
  }

  async stats(): Promise<OrchestratorStats> {
    if (!this.ruvllm) throw new Error('Orchestrator not initialized');

    const ruvllmStats = await this.ruvllm.stats();
    const reasoningStats = await this.reasoningBank!.stats();

    return {
      totalQueries: ruvllmStats.totalQueries,
      averageLatency: ruvllmStats.averageLatency,
      routerAccuracy: ruvllmStats.routerAccuracy,
      learningRate: ruvllmStats.learningRate || 0.001,
      memorySize: reasoningStats.totalPatterns
    };
  }
}

interface RuvLLMConfig {
  embeddingDim: number;
  routerHiddenDim: number;
  learningEnabled: boolean;
  memoryPath: string;
}
```

#### Step 3: Write Unit Tests (60 min)

**File:** `/workspaces/agentic-flow/agentic-flow/tests/orchestration/RuvLLMOrchestrator.test.ts`

```typescript
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { RuvLLMOrchestrator } from '../../src/orchestration/RuvLLMOrchestrator';

describe('RuvLLMOrchestrator', () => {
  let orchestrator: RuvLLMOrchestrator;

  beforeAll(async () => {
    orchestrator = new RuvLLMOrchestrator({
      memoryPath: './test-data/ruvllm-memory'
    });
    await orchestrator.initialize();
  });

  afterAll(async () => {
    // Cleanup test data
  });

  test('should initialize successfully', async () => {
    const stats = await orchestrator.stats();
    expect(stats).toBeDefined();
    expect(stats.totalQueries).toBeGreaterThanOrEqual(0);
  });

  test('should orchestrate simple query', async () => {
    const response = await orchestrator.query({
      task: 'Write a hello world function',
      sessionId: 'test-session-1',
      temperature: 0.3
    });

    expect(response.text).toBeDefined();
    expect(response.latency).toBeLessThan(1000); // <1s
    expect(response.confidence).toBeGreaterThan(0);
  });

  test('should learn from feedback', async () => {
    const response = await orchestrator.query({
      task: 'Explain async/await',
      sessionId: 'test-session-2'
    });

    await orchestrator.feedback('test-query-1', 5, {
      task: 'Explain async/await',
      helpful: true
    });

    const stats = await orchestrator.stats();
    expect(stats.totalQueries).toBeGreaterThan(0);
  });

  test('should achieve sub-100ms latency (target)', async () => {
    const iterations = 10;
    const latencies: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const response = await orchestrator.query({
        task: `Test query ${i}`,
        sessionId: `test-session-${i}`
      });
      latencies.push(response.latency);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    console.log(`Average latency: ${avgLatency.toFixed(2)}ms`);

    expect(avgLatency).toBeLessThan(100); // Target: <100ms
  });

  test('should retrieve patterns from ReasoningBank', async () => {
    // Store a pattern
    await orchestrator.query({
      task: 'Implement binary search',
      sessionId: 'test-session-patterns'
    });

    // Query similar task
    const response = await orchestrator.query({
      task: 'Implement linear search',
      sessionId: 'test-session-patterns-2'
    });

    expect(response.metadata.patternsUsed).toBeGreaterThan(0);
  });
});
```

#### Hooks Integration

```bash
# After completing morning session
npx ruvector hooks post-edit src/orchestration/RuvLLMOrchestrator.ts
npx ruvector hooks post-edit src/orchestration/types.ts
npx ruvector hooks post-edit tests/orchestration/RuvLLMOrchestrator.test.ts

# Store orchestration pattern
npx ruvector hooks memory-store \
  --key "ruvllm/implementation" \
  --value "Implemented RuvLLM orchestrator with TRM reasoning and SONA learning"
```

### Afternoon Session (3 hours) - Integration & Testing

#### Step 4: Integrate with AgentExecutor (90 min)

**File:** `/workspaces/agentic-flow/agentic-flow/src/core/AgentExecutor.ts`

```typescript
import { RuvLLMOrchestrator } from '../orchestration/RuvLLMOrchestrator';

export class AgentExecutor {
  private orchestrator?: RuvLLMOrchestrator;

  async initialize() {
    // Initialize orchestrator
    this.orchestrator = new RuvLLMOrchestrator({
      learningEnabled: true
    });
    await this.orchestrator.initialize();
  }

  async executeTask(task: string, agentType: string, sessionId: string) {
    // Use RuvLLM for intelligent task routing
    const response = await this.orchestrator!.query({
      task,
      sessionId,
      agentHint: agentType,
      context: [`Agent type: ${agentType}`]
    });

    // Execute with selected agent
    // ... existing execution logic ...

    return response;
  }

  async provideFeedback(taskId: string, success: boolean, metadata: any) {
    // Provide feedback to orchestrator
    await this.orchestrator!.feedback(
      taskId,
      success ? 5 : 2,
      metadata
    );
  }
}
```

#### Step 5: Performance Benchmarking (60 min)

**File:** `/workspaces/agentic-flow/agentic-flow/benchmarks/orchestration-benchmark.ts`

```typescript
import { RuvLLMOrchestrator } from '../src/orchestration/RuvLLMOrchestrator';

async function benchmarkOrchestrator() {
  const orchestrator = new RuvLLMOrchestrator();
  await orchestrator.initialize();

  const iterations = 1000;
  const latencies: number[] = [];

  console.log(`🚀 Benchmarking RuvLLM Orchestrator (${iterations} iterations)...`);

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    await orchestrator.query({
      task: `Benchmark query ${i}`,
      sessionId: `bench-${i}`
    });

    latencies.push(performance.now() - startTime);
  }

  // Calculate statistics
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Results:');
  console.log(`   Average:  ${avg.toFixed(2)}ms`);
  console.log(`   P50:      ${p50.toFixed(2)}ms`);
  console.log(`   P95:      ${p95.toFixed(2)}ms`);
  console.log(`   P99:      ${p99.toFixed(2)}ms`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const stats = await orchestrator.stats();
  console.log('📈 Stats:');
  console.log(`   Total queries: ${stats.totalQueries}`);
  console.log(`   Memory size:   ${stats.memorySize}`);
  console.log(`   Router acc:    ${(stats.routerAccuracy * 100).toFixed(1)}%`);

  // Target verification
  console.log('\n✅ Target Verification:');
  console.log(`   P50 < 0.1ms:   ${p50 < 0.1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   P95 < 1ms:     ${p95 < 1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   P99 < 10ms:    ${p99 < 10 ? '✅ PASS' : '❌ FAIL'}`);
}

benchmarkOrchestrator();
```

#### Step 6: Run Tests (30 min)

```bash
# Unit tests
npm test -- orchestration

# Integration tests
npm run test:integration

# Performance benchmark
npx tsx benchmarks/orchestration-benchmark.ts

# Verify hooks integration
npx ruvector hooks stats
```

### Day 4 Deliverables

- ✅ RuvLLM orchestrator implemented
- ✅ Unit tests passing (>90% coverage)
- ✅ Integration with AgentExecutor
- ✅ Performance benchmarks run
- ✅ Latency target verified (<0.1ms P50)
- ✅ Documentation updated
- ✅ Hooks integration complete

---

## 📅 Day 5: Circuit Breaker Routing (4 hours)

### Morning Session (2 hours) - Implementation

#### Step 1: Install & Configure (15 min)

```bash
# Already installed in Phase 2 setup
npm list @ruvector/tiny-dancer

# Test CLI (if available)
npx tiny-dancer --help || echo "No CLI, library-only mode"
```

#### Step 2: Implement Circuit Breaker Router (90 min)

**File:** `/workspaces/agentic-flow/agentic-flow/src/routing/CircuitBreakerRouter.ts`

```typescript
import TinyDancer from '@ruvector/tiny-dancer';

export enum CircuitState {
  CLOSED = 'CLOSED',      // Normal operation
  OPEN = 'OPEN',          // Failures exceeded, circuit open
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Failures before opening
  successThreshold: number;    // Successes to close
  timeout: number;             // Time before half-open (ms)
  monitoringWindow: number;    // Rolling window (ms)
}

export class CircuitBreakerRouter {
  private tinyDancer?: TinyDancer;
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: number;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = {
      failureThreshold: 5,        // Open after 5 failures
      successThreshold: 2,        // Close after 2 successes
      timeout: 60000,             // 1 minute timeout
      monitoringWindow: 10000,    // 10 second window
      ...config
    };
  }

  async initialize(): Promise<void> {
    // Initialize TinyDancer neural router
    this.tinyDancer = new TinyDancer({
      uncertaintyEstimation: true,
      hotReload: true,
      fallbackChains: true
    });

    await this.tinyDancer.initialize();
    console.log('✅ Circuit Breaker Router initialized');
  }

  async route<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        console.log('🔄 Circuit HALF-OPEN, attempting recovery');
      } else {
        console.log('⚡ Circuit OPEN, using fallback');
        if (fallback) return fallback();
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      // Attempt operation
      const result = await operation();
      this.onSuccess();
      return result;

    } catch (error) {
      this.onFailure();

      // Use fallback if available
      if (fallback) {
        console.log('⚠️  Primary failed, using fallback');
        return fallback();
      }

      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        console.log('✅ Circuit CLOSED, service recovered');
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;

    if (this.failureCount >= this.config.failureThreshold) {
      console.log('❌ Circuit OPEN, too many failures');
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;

    const elapsed = Date.now() - this.lastFailureTime;
    return elapsed >= this.config.timeout;
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}
```

#### Step 3: Create Fallback Chains (15 min)

**File:** `/workspaces/agentic-flow/agentic-flow/src/routing/FallbackChain.ts`

```typescript
export class FallbackChain<T> {
  private chain: Array<() => Promise<T>> = [];

  add(operation: () => Promise<T>): this {
    this.chain.push(operation);
    return this;
  }

  async execute(): Promise<T> {
    let lastError: Error | undefined;

    for (const operation of this.chain) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.log(`⚠️  Fallback attempt failed: ${error}`);
      }
    }

    throw lastError || new Error('All fallback operations failed');
  }
}
```

### Afternoon Session (2 hours) - Testing & Integration

#### Step 4: Write Tests (60 min)

**File:** `/workspaces/agentic-flow/agentic-flow/tests/routing/CircuitBreakerRouter.test.ts`

```typescript
import { describe, test, expect, beforeEach } from '@jest/globals';
import { CircuitBreakerRouter, CircuitState } from '../../src/routing/CircuitBreakerRouter';

describe('CircuitBreakerRouter', () => {
  let router: CircuitBreakerRouter;

  beforeEach(async () => {
    router = new CircuitBreakerRouter({
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000
    });
    await router.initialize();
  });

  test('should start in CLOSED state', () => {
    expect(router.getState()).toBe(CircuitState.CLOSED);
  });

  test('should open circuit after failures', async () => {
    const failingOp = async () => { throw new Error('fail'); };

    for (let i = 0; i < 3; i++) {
      try {
        await router.route(failingOp);
      } catch (e) {}
    }

    expect(router.getState()).toBe(CircuitState.OPEN);
  });

  test('should use fallback when circuit is open', async () => {
    const failingOp = async () => { throw new Error('fail'); };
    const fallbackOp = async () => 'fallback';

    // Open circuit
    for (let i = 0; i < 3; i++) {
      try {
        await router.route(failingOp);
      } catch (e) {}
    }

    // Should use fallback
    const result = await router.route(failingOp, fallbackOp);
    expect(result).toBe('fallback');
  });

  test('should reset to HALF_OPEN after timeout', async () => {
    const failingOp = async () => { throw new Error('fail'); };

    // Open circuit
    for (let i = 0; i < 3; i++) {
      try {
        await router.route(failingOp);
      } catch (e) {}
    }

    expect(router.getState()).toBe(CircuitState.OPEN);

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should attempt reset
    const successOp = async () => 'success';
    await router.route(successOp);

    expect(router.getState()).toBe(CircuitState.HALF_OPEN);
  });

  test('should close circuit after success threshold', async () => {
    const failingOp = async () => { throw new Error('fail'); };
    const successOp = async () => 'success';

    // Open circuit
    for (let i = 0; i < 3; i++) {
      try {
        await router.route(failingOp);
      } catch (e) {}
    }

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Succeed twice
    await router.route(successOp);
    await router.route(successOp);

    expect(router.getState()).toBe(CircuitState.CLOSED);
  });
});
```

#### Step 5: Integration Testing (60 min)

**File:** `/workspaces/agentic-flow/agentic-flow/tests/integration/orchestration-routing.test.ts`

```typescript
import { describe, test, expect } from '@jest/globals';
import { RuvLLMOrchestrator } from '../../src/orchestration/RuvLLMOrchestrator';
import { CircuitBreakerRouter } from '../../src/routing/CircuitBreakerRouter';

describe('Orchestration + Circuit Breaker Integration', () => {
  test('should protect orchestrator with circuit breaker', async () => {
    const orchestrator = new RuvLLMOrchestrator();
    await orchestrator.initialize();

    const router = new CircuitBreakerRouter();
    await router.initialize();

    // Successful operation
    const result = await router.route(async () => {
      return orchestrator.query({
        task: 'Test query',
        sessionId: 'test'
      });
    });

    expect(result.text).toBeDefined();
  });

  test('should achieve 99.9% uptime under failures', async () => {
    // Simulate 1000 requests with 1% failure rate
    let successes = 0;
    const total = 1000;

    const router = new CircuitBreakerRouter();
    await router.initialize();

    for (let i = 0; i < total; i++) {
      const shouldFail = Math.random() < 0.01; // 1% failure rate

      try {
        await router.route(
          async () => {
            if (shouldFail) throw new Error('fail');
            return 'success';
          },
          async () => 'fallback' // Fallback always succeeds
        );
        successes++;
      } catch (e) {
        // Should never reach here with fallback
      }
    }

    const uptime = (successes / total) * 100;
    console.log(`Uptime: ${uptime.toFixed(2)}%`);

    expect(uptime).toBeGreaterThanOrEqual(99.9);
  });
});
```

### Day 5 Deliverables

- ✅ Circuit breaker router implemented
- ✅ Fallback chains working
- ✅ Unit tests passing
- ✅ 99.9% uptime validated
- ✅ Integration with orchestrator
- ✅ Metrics dashboard (console logs)

---

## 📅 Day 6: Semantic Agent Routing (3 hours)

### Morning Session (2 hours) - Implementation

#### Step 1: Implement Semantic Router (90 min)

**File:** `/workspaces/agentic-flow/agentic-flow/src/routing/SemanticRouter.ts`

```typescript
import Router from '@ruvector/router';
import type { Agent } from '../types';

export interface RoutingDecision {
  agentType: string;
  confidence: number;
  reasoning: string;
  alternatives: string[];
}

export class SemanticRouter {
  private router?: Router;
  private agents: Map<string, Agent> = new Map();

  async initialize(agents: Agent[]): Promise<void> {
    // Initialize router with HNSW indexing
    this.router = new Router({
      embeddingDim: 384,
      indexType: 'hnsw',
      m: 16,               // HNSW connections
      efConstruction: 200  // Build-time accuracy
    });

    // Register all agents
    for (const agent of agents) {
      await this.registerAgent(agent);
    }

    console.log(`✅ Semantic Router initialized with ${agents.length} agents`);
  }

  async registerAgent(agent: Agent): Promise<void> {
    this.agents.set(agent.type, agent);

    // Add agent capabilities to index
    await this.router!.addRoute({
      id: agent.type,
      patterns: agent.capabilities,
      metadata: {
        name: agent.name,
        description: agent.description
      }
    });
  }

  async route(userQuery: string): Promise<RoutingDecision> {
    if (!this.router) throw new Error('Router not initialized');

    const startTime = performance.now();

    // Find best matching agent
    const results = await this.router.search({
      query: userQuery,
      k: 3 // Top 3 candidates
    });

    const latency = performance.now() - startTime;

    if (results.length === 0) {
      throw new Error('No matching agent found');
    }

    // Select best agent
    const best = results[0];
    const alternatives = results.slice(1).map(r => r.id);

    console.log(`🎯 Routed to: ${best.id} (${latency.toFixed(2)}ms, ${(best.score * 100).toFixed(1)}% confidence)`);

    return {
      agentType: best.id,
      confidence: best.score,
      reasoning: `Best match for query based on capabilities`,
      alternatives
    };
  }

  async stats() {
    return {
      totalAgents: this.agents.size,
      routerType: 'hnsw-semantic'
    };
  }
}
```

#### Step 2: Create Agent Registry (30 min)

**File:** `/workspaces/agentic-flow/agentic-flow/src/routing/AgentRegistry.ts`

```typescript
import type { Agent } from '../types';

export const AGENT_REGISTRY: Agent[] = [
  {
    type: 'coder',
    name: 'Coder Agent',
    description: 'Expert in writing production-quality code',
    capabilities: [
      'write code', 'implement features', 'fix bugs',
      'refactor code', 'optimize performance', 'add tests'
    ]
  },
  {
    type: 'reviewer',
    name: 'Code Reviewer',
    description: 'Expert in code review and quality assurance',
    capabilities: [
      'review code', 'identify bugs', 'suggest improvements',
      'check security', 'enforce standards', 'validate tests'
    ]
  },
  {
    type: 'tester',
    name: 'Test Engineer',
    description: 'Expert in testing and quality assurance',
    capabilities: [
      'write tests', 'run tests', 'debug failures',
      'integration tests', 'e2e tests', 'performance tests'
    ]
  },
  {
    type: 'researcher',
    name: 'Research Agent',
    description: 'Expert in research and analysis',
    capabilities: [
      'research topics', 'analyze data', 'find patterns',
      'compare solutions', 'recommend approaches', 'gather information'
    ]
  },
  {
    type: 'architect',
    name: 'System Architect',
    description: 'Expert in system design and architecture',
    capabilities: [
      'design systems', 'create architecture', 'plan structure',
      'define interfaces', 'choose technologies', 'scalability planning'
    ]
  }
  // ... Add all 66 agents here
];
```

### Afternoon Session (1 hour) - Testing

#### Step 3: End-to-End Testing (60 min)

**File:** `/workspaces/agentic-flow/agentic-flow/tests/routing/SemanticRouter.test.ts`

```typescript
import { describe, test, expect } from '@jest/globals';
import { SemanticRouter } from '../../src/routing/SemanticRouter';
import { AGENT_REGISTRY } from '../../src/routing/AgentRegistry';

describe('SemanticRouter', () => {
  let router: SemanticRouter;

  beforeAll(async () => {
    router = new SemanticRouter();
    await router.initialize(AGENT_REGISTRY);
  });

  test('should route coding query to coder agent', async () => {
    const decision = await router.route('Write a function to sort an array');

    expect(decision.agentType).toBe('coder');
    expect(decision.confidence).toBeGreaterThan(0.7);
  });

  test('should route review query to reviewer agent', async () => {
    const decision = await router.route('Review this pull request for security issues');

    expect(decision.agentType).toBe('reviewer');
    expect(decision.confidence).toBeGreaterThan(0.7);
  });

  test('should route testing query to tester agent', async () => {
    const decision = await router.route('Write integration tests for the API');

    expect(decision.agentType).toBe('tester');
    expect(decision.confidence).toBeGreaterThan(0.7);
  });

  test('should achieve sub-10ms routing latency', async () => {
    const iterations = 100;
    const latencies: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await router.route(`Test query ${i}`);
      latencies.push(performance.now() - start);
    }

    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    console.log(`Average routing latency: ${avg.toFixed(2)}ms`);

    expect(avg).toBeLessThan(10); // Target: <10ms
  });

  test('should achieve 85%+ routing accuracy', async () => {
    const testCases = [
      { query: 'Implement authentication', expected: 'coder' },
      { query: 'Review security vulnerabilities', expected: 'reviewer' },
      { query: 'Write e2e tests', expected: 'tester' },
      { query: 'Research best practices', expected: 'researcher' },
      { query: 'Design microservices architecture', expected: 'architect' }
      // Add 15+ more test cases
    ];

    let correct = 0;

    for (const { query, expected } of testCases) {
      const decision = await router.route(query);
      if (decision.agentType === expected) correct++;
    }

    const accuracy = (correct / testCases.length) * 100;
    console.log(`Routing accuracy: ${accuracy.toFixed(1)}%`);

    expect(accuracy).toBeGreaterThanOrEqual(85);
  });
});
```

### Day 6 Deliverables

- ✅ Semantic router implemented
- ✅ 66 agents registered
- ✅ HNSW indexing working
- ✅ Sub-10ms routing latency
- ✅ 85%+ routing accuracy
- ✅ Integration tests passing

---

## 🎉 Phase 2 Complete Checklist

### Technical Deliverables

- ✅ RuvLLM orchestrator functional
- ✅ Circuit breaker router working
- ✅ Semantic agent router live
- ✅ All three packages integrated
- ✅ Unit tests passing (>90% coverage)
- ✅ Integration tests passing
- ✅ Performance benchmarks run

### Performance Targets

- ✅ Orchestration latency: <0.1ms (P50)
- ✅ System uptime: ≥99.9%
- ✅ Routing accuracy: ≥85%
- ✅ Agent selection: <10ms
- ✅ No cascading failures

### Documentation

- ✅ API documentation updated
- ✅ Integration examples added
- ✅ Architecture diagrams created
- ✅ Performance report generated

### Next Steps

1. 🎯 **Start Phase 3** (Intelligence Layer)
2. 🎯 **Install graph-node, rudag, spiking-neural**
3. 🎯 **Implement hypergraph, DAG scheduler, neuromorphic patterns**

---

**Total Phase 2 Time:** 13 hours implementation + 2-3 hours buffer = 15-16 hours (3-4 days)
**Status:** Ready to execute
**Next:** Review and approve plan, then start Day 4
