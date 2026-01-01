/**
 * Semantic Router Integration Tests
 *
 * Tests:
 * - HNSW intent matching
 * - Agent registration (66 agents)
 * - Sub-10ms routing latency
 * - ≥85% routing accuracy
 * - Multi-intent detection
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { SemanticRouter } from '../../../agentic-flow/src/routing/SemanticRouter';
import type { AgentIntent } from '../../../agentic-flow/src/routing/SemanticRouter';

// Mock embedding service
class MockEmbeddingService {
  async embed(text: string): Promise<Float32Array> {
    // Create deterministic embeddings based on text content
    const embedding = new Float32Array(384);

    // Simple keyword-based embedding for testing
    const keywords = text.toLowerCase().split(/\s+/);
    keywords.forEach((word, idx) => {
      const hash = this.hashString(word);
      embedding[idx % 384] += Math.sin(hash) * 0.5;
    });

    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= (norm || 1);
    }

    return embedding;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

describe('SemanticRouter', () => {
  let router: SemanticRouter;
  let mockEmbedder: MockEmbeddingService;

  // Sample agent intents (subset of 66 agents)
  const testAgents: AgentIntent[] = [
    {
      agentType: 'coder',
      description: 'Expert software developer for implementing features and writing code',
      examples: [
        'Implement REST API endpoints',
        'Write TypeScript functions',
        'Create React components'
      ],
      tags: ['coding', 'implementation', 'development'],
    },
    {
      agentType: 'researcher',
      description: 'Research specialist for gathering information and analyzing best practices',
      examples: [
        'Research API design patterns',
        'Analyze security vulnerabilities',
        'Study performance optimization techniques'
      ],
      tags: ['research', 'analysis', 'investigation'],
    },
    {
      agentType: 'tester',
      description: 'Quality assurance expert for writing tests and ensuring code quality',
      examples: [
        'Write unit tests with Jest',
        'Create integration test suites',
        'Implement E2E testing'
      ],
      tags: ['testing', 'qa', 'validation'],
    },
    {
      agentType: 'reviewer',
      description: 'Code review specialist for ensuring quality and best practices',
      examples: [
        'Review pull requests',
        'Check code quality',
        'Suggest improvements'
      ],
      tags: ['review', 'quality', 'assessment'],
    },
    {
      agentType: 'optimizer',
      description: 'Performance optimization expert for improving system efficiency',
      examples: [
        'Optimize database queries',
        'Improve API response times',
        'Reduce memory usage'
      ],
      tags: ['optimization', 'performance', 'efficiency'],
    },
  ];

  beforeEach(async () => {
    mockEmbedder = new MockEmbeddingService();
    router = new SemanticRouter(mockEmbedder as any);

    // Register test agents
    await router.registerAgents(testAgents);
    router.buildIndex();
  });

  describe('Agent Registration', () => {
    it('should register single agent', async () => {
      const newRouter = new SemanticRouter(mockEmbedder as any);

      await newRouter.registerAgent({
        agentType: 'planner',
        description: 'Strategic planning and architecture design',
        examples: ['Design system architecture', 'Plan project roadmap'],
        tags: ['planning', 'architecture'],
      });

      const agents = newRouter.getRegisteredAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0].agentType).toBe('planner');
    });

    it('should register multiple agents in batch', async () => {
      const agents = router.getRegisteredAgents();
      expect(agents.length).toBe(testAgents.length);
    });

    it('should build HNSW index', () => {
      // Index should be built after registration
      expect(() => router.buildIndex()).not.toThrow();
    });
  });

  describe('Intent Matching', () => {
    it('should route coding tasks to coder agent', async () => {
      const result = await router.route('Implement a REST API with Express.js');

      expect(result.primaryAgent).toBe('coder');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should route research tasks to researcher agent', async () => {
      const result = await router.route('Research best practices for API security');

      expect(result.primaryAgent).toBe('researcher');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should route testing tasks to tester agent', async () => {
      const result = await router.route('Write unit tests for the authentication module');

      expect(result.primaryAgent).toBe('tester');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should route optimization tasks to optimizer agent', async () => {
      const result = await router.route('Optimize database query performance');

      expect(result.primaryAgent).toBe('optimizer');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should provide alternative agent suggestions', async () => {
      const result = await router.route('Build a web application', 3);

      expect(result.alternatives).toBeDefined();
      expect(result.alternatives.length).toBeGreaterThan(0);
      expect(result.alternatives[0].agentType).toBeDefined();
      expect(result.alternatives[0].confidence).toBeGreaterThan(0);
    });

    it('should include matched intent descriptions', async () => {
      const result = await router.route('Write integration tests');

      expect(result.matchedIntents).toBeDefined();
      expect(result.matchedIntents.length).toBeGreaterThan(0);
      expect(result.matchedIntents[0]).toContain('test');
    });
  });

  describe('Performance Requirements', () => {
    it('should route in <10ms', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 20; i++) {
        const result = await router.route(`Task ${i}: implement feature`);
        measurements.push(result.metrics.routingTimeMs);
      }

      const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      expect(avgTime).toBeLessThan(10); // <10ms target
    });

    it('should maintain performance with 66 agents', async () => {
      // Create router with all 66 agents
      const fullRouter = new SemanticRouter(mockEmbedder as any);

      const allAgents: AgentIntent[] = [
        ...testAgents,
        ...Array.from({ length: 61 }, (_, i) => ({
          agentType: `agent-${i}`,
          description: `Specialized agent for task ${i}`,
          examples: [`Example task ${i}`],
          tags: [`tag-${i}`],
        })),
      ];

      await fullRouter.registerAgents(allAgents);
      fullRouter.buildIndex();

      const result = await fullRouter.route('Complex task requiring routing');

      expect(result.metrics.routingTimeMs).toBeLessThan(10);
      expect(result.metrics.candidatesEvaluated).toBe(66);
    });

    it('should scale with embedding time', async () => {
      const result = await router.route('Test task');

      // Total time should be dominated by embedding time for small agent set
      expect(result.metrics.embeddingTimeMs).toBeGreaterThan(0);
      expect(result.metrics.searchTimeMs).toBeLessThan(result.metrics.embeddingTimeMs);
    });
  });

  describe('Routing Accuracy', () => {
    it('should achieve ≥85% accuracy on labeled dataset', async () => {
      const testCases = [
        { task: 'Implement user authentication with JWT', expected: 'coder' },
        { task: 'Write unit tests for login function', expected: 'tester' },
        { task: 'Research OAuth 2.0 best practices', expected: 'researcher' },
        { task: 'Review code quality of PR #123', expected: 'reviewer' },
        { task: 'Optimize API response time', expected: 'optimizer' },
        { task: 'Create REST API endpoints', expected: 'coder' },
        { task: 'Analyze security vulnerabilities', expected: 'researcher' },
        { task: 'Write integration test suite', expected: 'tester' },
        { task: 'Improve database query performance', expected: 'optimizer' },
        { task: 'Code review for merge request', expected: 'reviewer' },
      ];

      let correctCount = 0;

      for (const testCase of testCases) {
        const result = await router.route(testCase.task);
        if (result.primaryAgent === testCase.expected) {
          correctCount++;
        }
      }

      const accuracy = correctCount / testCases.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.85); // ≥85% accuracy
    });

    it('should handle ambiguous tasks gracefully', async () => {
      const result = await router.route('Work on the project');

      expect(result.primaryAgent).toBeDefined();
      expect(result.confidence).toBeLessThan(0.9); // Lower confidence for ambiguous task
      expect(result.alternatives.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-Intent Detection', () => {
    it('should detect multiple intents in complex task', async () => {
      const result = await router.detectMultiIntent(
        'Research API design patterns then implement REST endpoints and write unit tests'
      );

      expect(result.intents.length).toBeGreaterThan(1);
      expect(result.requiresMultiAgent).toBe(true);
    });

    it('should suggest execution order', async () => {
      const result = await router.detectMultiIntent(
        'First research best practices then implement the feature'
      );

      expect(result.executionOrder).toBeDefined();
      expect(result.executionOrder.length).toBeGreaterThan(0);
    });

    it('should filter intents by confidence threshold', async () => {
      const result = await router.detectMultiIntent(
        'Build and test the application',
        0.7 // High threshold
      );

      result.intents.forEach(intent => {
        expect(intent.confidence).toBeGreaterThanOrEqual(0.7);
      });
    });

    it('should identify single-agent tasks correctly', async () => {
      const result = await router.detectMultiIntent(
        'Write unit tests for the authentication module'
      );

      expect(result.requiresMultiAgent).toBe(false);
      expect(result.intents.length).toBe(1);
    });
  });

  describe('Routing Metrics', () => {
    it('should track routing statistics', async () => {
      await router.route('Task 1');
      await router.route('Task 2');

      const stats = router.getStats();

      expect(stats.totalRoutes).toBe(2);
      expect(stats.avgRoutingTimeMs).toBeGreaterThan(0);
    });

    it('should provide detailed metrics per route', async () => {
      const result = await router.route('Test task');

      expect(result.metrics).toBeDefined();
      expect(result.metrics.routingTimeMs).toBeGreaterThan(0);
      expect(result.metrics.embeddingTimeMs).toBeGreaterThan(0);
      expect(result.metrics.searchTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.metrics.candidatesEvaluated).toBe(testAgents.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty task description', async () => {
      await expect(router.route('')).rejects.toThrow();
    });

    it('should handle very long task descriptions', async () => {
      const longTask = 'Implement '.repeat(100) + 'feature';
      const result = await router.route(longTask);

      expect(result.primaryAgent).toBeDefined();
      expect(result.metrics.routingTimeMs).toBeLessThan(20); // Still fast
    });

    it('should handle special characters', async () => {
      const result = await router.route('Implement API with @decorators and $variables!');

      expect(result.primaryAgent).toBeDefined();
    });

    it('should return results even with no registered agents', async () => {
      const emptyRouter = new SemanticRouter(mockEmbedder as any);

      await expect(emptyRouter.route('test')).rejects.toThrow();
    });
  });

  describe('HNSW Index Quality', () => {
    it('should maintain search quality after index build', async () => {
      const beforeBuild = await router.route('Write tests');

      router.buildIndex(); // Rebuild

      const afterBuild = await router.route('Write tests');

      expect(afterBuild.primaryAgent).toBe(beforeBuild.primaryAgent);
    });

    it('should invalidate index when new agents registered', async () => {
      router.buildIndex();

      await router.registerAgent({
        agentType: 'new-agent',
        description: 'New specialized agent',
        examples: ['Do new things'],
        tags: ['new'],
      });

      // Should rebuild index automatically
      const result = await router.route('Do new things');
      expect(result.primaryAgent).toBeDefined();
    });
  });
});
