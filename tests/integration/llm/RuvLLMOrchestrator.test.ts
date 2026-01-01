/**
 * RuvLLMOrchestrator Integration Tests
 *
 * Tests:
 * - TRM multi-step reasoning
 * - SONA adaptive learning
 * - FastGRNN agent selection
 * - ReasoningBank integration
 * - Performance benchmarks
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { RuvLLMOrchestrator } from '../../../agentic-flow/src/llm/RuvLLMOrchestrator';
import type { ReasoningBank } from '../../../packages/agentdb/src/controllers/ReasoningBank';
import type { EmbeddingService } from '../../../packages/agentdb/src/controllers/EmbeddingService';

// Mock implementations
class MockEmbeddingService {
  async embed(text: string): Promise<Float32Array> {
    // Simple hash-based embedding for testing
    const embedding = new Float32Array(384);
    for (let i = 0; i < 384; i++) {
      embedding[i] = Math.sin(text.length + i) * 0.5;
    }
    return embedding;
  }
}

class MockReasoningBank {
  private patterns: any[] = [];
  private outcomes: any[] = [];

  async storePattern(pattern: any): Promise<number> {
    this.patterns.push(pattern);
    return this.patterns.length;
  }

  async searchPatterns(query: any): Promise<any[]> {
    // Return mock patterns based on task type
    const mockPatterns = [
      {
        id: 1,
        taskType: 'code_implementation',
        approach: 'Agent: coder, Success: true',
        successRate: 0.9,
        similarity: 0.85,
        metadata: { agent: 'coder' },
      },
      {
        id: 2,
        taskType: 'research',
        approach: 'Agent: researcher, Success: true',
        successRate: 0.85,
        similarity: 0.75,
        metadata: { agent: 'researcher' },
      },
      {
        id: 3,
        taskType: 'testing',
        approach: 'Agent: tester, Success: true',
        successRate: 0.88,
        similarity: 0.70,
        metadata: { agent: 'tester' },
      },
    ];

    return mockPatterns.slice(0, query.k || 5);
  }

  async recordOutcome(patternId: number, success: boolean, reward: number): Promise<void> {
    this.outcomes.push({ patternId, success, reward });
  }

  async trainGNN(options?: any): Promise<{ epochs: number; finalLoss: number }> {
    return { epochs: options?.epochs || 10, finalLoss: 0.15 };
  }
}

describe('RuvLLMOrchestrator', () => {
  let orchestrator: RuvLLMOrchestrator;
  let mockReasoningBank: MockReasoningBank;
  let mockEmbedder: MockEmbeddingService;

  beforeEach(() => {
    mockReasoningBank = new MockReasoningBank();
    mockEmbedder = new MockEmbeddingService();
    orchestrator = new RuvLLMOrchestrator(
      mockReasoningBank as any as ReasoningBank,
      mockEmbedder as any as EmbeddingService
    );
  });

  describe('Agent Selection', () => {
    it('should select agent with high confidence', async () => {
      const result = await orchestrator.selectAgent(
        'Implement a REST API with authentication'
      );

      expect(result.agentType).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reasoning).toBeDefined();
      expect(result.metrics.inferenceTimeMs).toBeLessThan(100); // <100ms target
    });

    it('should provide alternative agents', async () => {
      const result = await orchestrator.selectAgent(
        'Research best practices for API design'
      );

      expect(result.alternatives).toBeDefined();
      expect(result.alternatives!.length).toBeGreaterThan(0);
      expect(result.alternatives![0].agentType).toBeDefined();
      expect(result.alternatives![0].confidence).toBeGreaterThan(0);
    });

    it('should use FastGRNN routing for speed', async () => {
      const startTime = performance.now();

      await orchestrator.selectAgent('Write unit tests for the authentication module');

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(100); // <100ms routing time
    });

    it('should handle context information', async () => {
      const result = await orchestrator.selectAgent(
        'Optimize database queries',
        { language: 'postgresql', performance: 'critical' }
      );

      expect(result.agentType).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('Task Decomposition (TRM)', () => {
    it('should decompose complex task into steps', async () => {
      const decomposition = await orchestrator.decomposeTask(
        'Build a full-stack web application with React frontend and Node.js backend'
      );

      expect(decomposition.steps).toBeDefined();
      expect(decomposition.steps.length).toBeGreaterThan(1);
      expect(decomposition.totalComplexity).toBeGreaterThan(0);
    });

    it('should assign agents to sub-tasks', async () => {
      const decomposition = await orchestrator.decomposeTask(
        'Implement user authentication then create dashboard UI'
      );

      decomposition.steps.forEach(step => {
        expect(step.suggestedAgent).toBeDefined();
        expect(step.estimatedComplexity).toBeGreaterThan(0);
      });
    });

    it('should detect parallelizable tasks', async () => {
      const decomposition = await orchestrator.decomposeTask(
        'Write unit tests for module A. Write unit tests for module B.'
      );

      expect(decomposition.parallelizable).toBeDefined();
      // Independent test tasks should be parallelizable
    });

    it('should respect max depth', async () => {
      const decomposition = await orchestrator.decomposeTask(
        'Complex multi-step project with many sub-tasks',
        2 // maxDepth
      );

      expect(decomposition.steps.length).toBeLessThanOrEqual(10); // Reasonable limit
    });

    it('should cache decomposition results', async () => {
      const task = 'Build REST API with Express';

      const first = await orchestrator.decomposeTask(task);
      const startTime = performance.now();
      const second = await orchestrator.decomposeTask(task);
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(10); // Should be cached, very fast
      expect(second).toEqual(first);
    });
  });

  describe('SONA Adaptive Learning', () => {
    it('should record successful outcomes', async () => {
      await orchestrator.recordOutcome({
        taskType: 'code_implementation',
        selectedAgent: 'coder',
        success: true,
        reward: 0.9,
        latencyMs: 1500,
      });

      const stats = orchestrator.getStats();
      expect(stats.totalExecutions).toBe(1);
      expect(stats.agentPerformance).toHaveLength(1);
      expect(stats.agentPerformance[0].successRate).toBe(1.0);
    });

    it('should track agent performance over time', async () => {
      // Record multiple outcomes
      await orchestrator.recordOutcome({
        taskType: 'testing',
        selectedAgent: 'tester',
        success: true,
        reward: 0.8,
        latencyMs: 800,
      });

      await orchestrator.recordOutcome({
        taskType: 'testing',
        selectedAgent: 'tester',
        success: false,
        reward: 0.2,
        latencyMs: 1200,
      });

      const stats = orchestrator.getStats();
      const testerPerf = stats.agentPerformance.find(p => p.agent === 'tester');

      expect(testerPerf).toBeDefined();
      expect(testerPerf!.successRate).toBe(0.5); // 1 success, 1 failure
      expect(testerPerf!.uses).toBe(2);
    });

    it('should adapt weights based on failures', async () => {
      const agent = 'researcher';

      // Record multiple failures
      for (let i = 0; i < 5; i++) {
        await orchestrator.recordOutcome({
          taskType: 'research',
          selectedAgent: agent,
          success: false,
          reward: 0.1,
          latencyMs: 2000,
        });
      }

      const stats = orchestrator.getStats();
      const perf = stats.agentPerformance.find(p => p.agent === agent);

      expect(perf).toBeDefined();
      expect(perf!.successRate).toBeLessThan(0.5);
      // SONA should have adapted weights due to poor performance
    });
  });

  describe('GNN Training', () => {
    it('should train GNN on accumulated patterns', async () => {
      // Record some outcomes first
      await orchestrator.recordOutcome({
        taskType: 'code_review',
        selectedAgent: 'reviewer',
        success: true,
        reward: 0.85,
        latencyMs: 1000,
      });

      const result = await orchestrator.trainGNN({ epochs: 20, batchSize: 32 });

      expect(result.epochs).toBe(20);
      expect(result.finalLoss).toBeLessThan(1.0);
    });
  });

  describe('Performance Requirements', () => {
    it('should meet <100ms inference time', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 10; i++) {
        const result = await orchestrator.selectAgent(`Task ${i}: implement feature`);
        measurements.push(result.metrics.inferenceTimeMs);
      }

      const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      expect(avgTime).toBeLessThan(100);
    });

    it('should maintain performance under load', async () => {
      const tasks = Array.from({ length: 50 }, (_, i) => `Task ${i}`);
      const startTime = performance.now();

      await Promise.all(tasks.map(task => orchestrator.selectAgent(task)));

      const totalTime = performance.now() - startTime;
      const avgTimePerTask = totalTime / tasks.length;

      expect(avgTimePerTask).toBeLessThan(100); // <100ms average even under load
    });
  });

  describe('Statistics', () => {
    it('should provide comprehensive stats', async () => {
      await orchestrator.selectAgent('Test task 1');
      await orchestrator.recordOutcome({
        taskType: 'test',
        selectedAgent: 'tester',
        success: true,
        reward: 0.9,
        latencyMs: 500,
      });

      const stats = orchestrator.getStats();

      expect(stats.totalExecutions).toBeGreaterThan(0);
      expect(stats.agentPerformance).toBeDefined();
      expect(stats.cachedDecompositions).toBeGreaterThanOrEqual(0);
    });
  });
});
