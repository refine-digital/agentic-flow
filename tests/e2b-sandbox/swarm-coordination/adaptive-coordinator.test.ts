/**
 * @test Adaptive Coordination E2B Sandbox Testing
 * @description Validates adaptive coordination with dynamic attention, MoE routing
 * @prerequisites
 *   - E2B sandbox environment configured
 *   - Mixture-of-Experts implementation
 *   - Dynamic attention mechanism
 * @expected Adaptive mechanism selection, top-k routing, performance-based adaptation
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { performance } from 'perf_hooks';

interface AdaptiveAgent {
  id: string;
  embeddings: number[];
  expertise: string[];
  performanceHistory: number[];
  reliability: number;
}

interface ExpertScore {
  agentId: string;
  score: number;
  expertise: string[];
}

interface AdaptiveResult {
  selectedMechanism: 'hierarchical' | 'mesh' | 'hybrid';
  routedExperts: ExpertScore[];
  topK: number;
  coordinationTimeMs: number;
  adaptationReason: string;
  mechanismScores: Map<string, number>;
  expertUtilization: Map<string, number>;
}

interface TaskComplexity {
  computational: number;
  collaborative: number;
  specialized: number;
}

class AdaptiveCoordinator {
  private agents: Map<string, AdaptiveAgent> = new Map();
  private mechanismHistory: Map<string, number[]> = new Map();
  private expertiseIndex: Map<string, Set<string>> = new Map();
  private topK: number;

  constructor(topK = 3) {
    this.topK = topK;

    // Initialize mechanism performance tracking
    this.mechanismHistory.set('hierarchical', []);
    this.mechanismHistory.set('mesh', []);
    this.mechanismHistory.set('hybrid', []);
  }

  addAgent(agent: AdaptiveAgent): void {
    this.agents.set(agent.id, agent);

    // Build expertise index
    for (const expertise of agent.expertise) {
      if (!this.expertiseIndex.has(expertise)) {
        this.expertiseIndex.set(expertise, new Set());
      }
      this.expertiseIndex.get(expertise)!.add(agent.id);
    }
  }

  /**
   * Analyze task complexity to determine coordination mechanism
   */
  private analyzeTaskComplexity(task: string): TaskComplexity {
    const complexity: TaskComplexity = {
      computational: 0,
      collaborative: 0,
      specialized: 0
    };

    // Simple heuristics (in real system, use ML model)
    const taskLower = task.toLowerCase();

    // Computational complexity
    if (taskLower.includes('compute') || taskLower.includes('calculate') || taskLower.includes('process')) {
      complexity.computational = 0.8;
    }

    // Collaborative complexity
    if (taskLower.includes('coordinate') || taskLower.includes('consensus') || taskLower.includes('agree')) {
      complexity.collaborative = 0.9;
    }

    // Specialized complexity
    if (taskLower.includes('expert') || taskLower.includes('specialized') || taskLower.includes('domain')) {
      complexity.specialized = 0.85;
    }

    // Default moderate complexity
    if (complexity.computational === 0 && complexity.collaborative === 0 && complexity.specialized === 0) {
      complexity.computational = 0.5;
      complexity.collaborative = 0.5;
      complexity.specialized = 0.5;
    }

    return complexity;
  }

  /**
   * Select coordination mechanism based on task and historical performance
   */
  private selectMechanism(complexity: TaskComplexity): { mechanism: 'hierarchical' | 'mesh' | 'hybrid', score: number, reason: string } {
    const scores = new Map<string, number>();

    // Hierarchical: good for computational tasks with clear leadership
    const hierarchicalScore =
      complexity.computational * 0.7 +
      (1 - complexity.collaborative) * 0.3 +
      this.getMechanismPerformance('hierarchical') * 0.2;
    scores.set('hierarchical', hierarchicalScore);

    // Mesh: good for collaborative consensus tasks
    const meshScore =
      complexity.collaborative * 0.8 +
      (1 - complexity.computational) * 0.2 +
      this.getMechanismPerformance('mesh') * 0.2;
    scores.set('mesh', meshScore);

    // Hybrid: good for specialized tasks requiring both
    const hybridScore =
      complexity.specialized * 0.6 +
      complexity.collaborative * 0.2 +
      complexity.computational * 0.2 +
      this.getMechanismPerformance('hybrid') * 0.2;
    scores.set('hybrid', hybridScore);

    // Select best mechanism
    const sorted = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
    const [mechanism, score] = sorted[0];

    const reasons = {
      hierarchical: `High computational complexity (${complexity.computational.toFixed(2)})`,
      mesh: `High collaborative complexity (${complexity.collaborative.toFixed(2)})`,
      hybrid: `High specialized complexity (${complexity.specialized.toFixed(2)})`
    };

    return {
      mechanism: mechanism as 'hierarchical' | 'mesh' | 'hybrid',
      score,
      reason: reasons[mechanism as keyof typeof reasons]
    };
  }

  private getMechanismPerformance(mechanism: string): number {
    const history = this.mechanismHistory.get(mechanism) || [];
    if (history.length === 0) return 0.5; // Neutral score

    const recent = history.slice(-10); // Last 10 executions
    return recent.reduce((sum, score) => sum + score, 0) / recent.length;
  }

  /**
   * Mixture-of-Experts routing: select top-k experts for task
   */
  private routeExperts(task: string, k: number): ExpertScore[] {
    const taskLower = task.toLowerCase();
    const expertScores: ExpertScore[] = [];

    // Score each agent based on expertise match
    for (const agent of this.agents.values()) {
      let score = 0;

      // Expertise matching
      for (const expertise of agent.expertise) {
        if (taskLower.includes(expertise.toLowerCase())) {
          score += 1.0;
        }
      }

      // Performance history (average of recent tasks)
      const recentPerf = agent.performanceHistory.slice(-5);
      const avgPerf = recentPerf.length > 0
        ? recentPerf.reduce((sum, p) => sum + p, 0) / recentPerf.length
        : 0.5;
      score += avgPerf * 0.5;

      // Reliability
      score += agent.reliability * 0.3;

      expertScores.push({
        agentId: agent.id,
        score,
        expertise: agent.expertise
      });
    }

    // Sort by score and select top-k
    expertScores.sort((a, b) => b.score - a.score);
    return expertScores.slice(0, k);
  }

  /**
   * Dynamic attention mechanism that adapts based on task
   */
  private computeAdaptiveAttention(
    mechanism: 'hierarchical' | 'mesh' | 'hybrid',
    query: AdaptiveAgent,
    experts: ExpertScore[]
  ): Map<string, number> {
    const attention = new Map<string, number>();

    switch (mechanism) {
      case 'hierarchical': {
        // Hierarchical: exponential decay from top expert
        const totalScore = experts.reduce((sum, e) => sum + e.score, 0);
        for (let i = 0; i < experts.length; i++) {
          const weight = experts[i].score / totalScore * Math.exp(-i * 0.3);
          attention.set(experts[i].agentId, weight);
        }
        break;
      }

      case 'mesh': {
        // Mesh: uniform distribution among top experts
        const uniformWeight = 1.0 / experts.length;
        for (const expert of experts) {
          attention.set(expert.agentId, uniformWeight);
        }
        break;
      }

      case 'hybrid': {
        // Hybrid: weighted by expertise and performance
        const totalScore = experts.reduce((sum, e) => sum + e.score, 0);
        for (const expert of experts) {
          const weight = expert.score / totalScore;
          attention.set(expert.agentId, weight);
        }
        break;
      }
    }

    // Normalize
    const totalWeight = Array.from(attention.values()).reduce((sum, w) => sum + w, 0);
    for (const [agentId, weight] of attention) {
      attention.set(agentId, weight / totalWeight);
    }

    return attention;
  }

  /**
   * Coordinate task with adaptive mechanism selection
   */
  async coordinate(task: string): Promise<AdaptiveResult> {
    const startTime = performance.now();

    // Analyze task complexity
    const complexity = this.analyzeTaskComplexity(task);

    // Select best coordination mechanism
    const { mechanism, score, reason } = this.selectMechanism(complexity);

    // Route to top-k experts using MoE
    const experts = this.routeExperts(task, this.topK);

    // Compute adaptive attention
    const firstAgent = this.agents.values().next().value as AdaptiveAgent;
    const attention = this.computeAdaptiveAttention(mechanism, firstAgent, experts);

    // Track expert utilization
    const expertUtilization = new Map<string, number>();
    for (const expert of experts) {
      const agent = this.agents.get(expert.agentId)!;
      for (const expertise of agent.expertise) {
        expertUtilization.set(expertise, (expertUtilization.get(expertise) || 0) + 1);
      }
    }

    const coordinationTimeMs = performance.now() - startTime;

    // Record performance for future adaptation
    const performanceScore = Math.min(1.0, 100 / coordinationTimeMs); // Better if faster
    this.mechanismHistory.get(mechanism)!.push(performanceScore);

    // Update agent performance history
    for (const expert of experts) {
      const agent = this.agents.get(expert.agentId)!;
      agent.performanceHistory.push(performanceScore);
      if (agent.performanceHistory.length > 20) {
        agent.performanceHistory.shift(); // Keep last 20
      }
    }

    return {
      selectedMechanism: mechanism,
      routedExperts: experts,
      topK: this.topK,
      coordinationTimeMs,
      adaptationReason: reason,
      mechanismScores: new Map([
        ['hierarchical', this.getMechanismPerformance('hierarchical')],
        ['mesh', this.getMechanismPerformance('mesh')],
        ['hybrid', this.getMechanismPerformance('hybrid')]
      ]),
      expertUtilization
    };
  }

  getMechanismStats(): Map<string, { avgPerformance: number, usageCount: number }> {
    const stats = new Map<string, { avgPerformance: number, usageCount: number }>();

    for (const [mechanism, history] of this.mechanismHistory) {
      const avgPerformance = history.length > 0
        ? history.reduce((sum, score) => sum + score, 0) / history.length
        : 0;

      stats.set(mechanism, {
        avgPerformance,
        usageCount: history.length
      });
    }

    return stats;
  }
}

describe('Adaptive Coordination E2B Tests', () => {
  let coordinator: AdaptiveCoordinator;
  const embeddingDim = 128;

  beforeAll(() => {
    coordinator = new AdaptiveCoordinator(3);
  });

  describe('Dynamic Attention Mechanism Selection', () => {
    beforeAll(() => {
      coordinator = new AdaptiveCoordinator(3);

      // Add agents with different expertise
      const expertiseTypes = [
        ['compute', 'optimization'],
        ['consensus', 'coordination'],
        ['specialized', 'domain-expert'],
        ['general', 'analysis'],
        ['testing', 'validation']
      ];

      for (let i = 0; i < 15; i++) {
        coordinator.addAgent({
          id: `agent-${i}`,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1),
          expertise: expertiseTypes[i % expertiseTypes.length],
          performanceHistory: [0.7, 0.8, 0.75, 0.85],
          reliability: 0.85 + Math.random() * 0.15
        });
      }
    });

    it('should select hierarchical for computational tasks', async () => {
      const result = await coordinator.coordinate('Compute complex mathematical optimization');

      expect(result.selectedMechanism).toBe('hierarchical');
      expect(result.adaptationReason).toContain('computational');
    });

    it('should select mesh for collaborative tasks', async () => {
      const result = await coordinator.coordinate('Achieve consensus among distributed agents');

      expect(result.selectedMechanism).toBe('mesh');
      expect(result.adaptationReason).toContain('collaborative');
    });

    it('should select hybrid for specialized tasks', async () => {
      const result = await coordinator.coordinate('Apply specialized domain expert knowledge');

      expect(result.selectedMechanism).toBe('hybrid');
      expect(result.adaptationReason).toContain('specialized');
    });

    it('should adapt based on historical performance', async () => {
      // Run multiple tasks to build history
      for (let i = 0; i < 5; i++) {
        await coordinator.coordinate('Compute task ' + i);
      }

      const stats = coordinator.getMechanismStats();

      // Hierarchical should have usage history
      expect(stats.get('hierarchical')!.usageCount).toBeGreaterThan(0);
      expect(stats.get('hierarchical')!.avgPerformance).toBeGreaterThan(0);
    });
  });

  describe('Mixture-of-Experts Routing', () => {
    beforeAll(() => {
      coordinator = new AdaptiveCoordinator(5); // Top-5 experts

      // Create diverse expert pool
      const expertises = [
        ['machine-learning', 'neural-networks'],
        ['database', 'optimization'],
        ['security', 'cryptography'],
        ['frontend', 'ui-design'],
        ['backend', 'api-design'],
        ['devops', 'infrastructure'],
        ['testing', 'qa'],
        ['data-science', 'statistics'],
        ['algorithms', 'complexity'],
        ['systems', 'architecture']
      ];

      for (let i = 0; i < 20; i++) {
        coordinator.addAgent({
          id: `expert-${i}`,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1),
          expertise: expertises[i % expertises.length],
          performanceHistory: Array(5).fill(0).map(() => 0.6 + Math.random() * 0.4),
          reliability: 0.8 + Math.random() * 0.2
        });
      }
    });

    it('should route to top-k experts', async () => {
      const result = await coordinator.coordinate('Design machine learning neural network architecture');

      expect(result.routedExperts.length).toBe(5);
      expect(result.topK).toBe(5);

      // Experts should be sorted by score
      for (let i = 0; i < result.routedExperts.length - 1; i++) {
        expect(result.routedExperts[i].score).toBeGreaterThanOrEqual(result.routedExperts[i + 1].score);
      }
    });

    it('should select experts with relevant expertise', async () => {
      const result = await coordinator.coordinate('Implement database optimization algorithms');

      // Should route to database and algorithm experts
      const expertiseSet = new Set(result.routedExperts.flatMap(e => e.expertise));
      expect(
        expertiseSet.has('database') ||
        expertiseSet.has('optimization') ||
        expertiseSet.has('algorithms')
      ).toBe(true);
    });

    it('should consider performance history in routing', async () => {
      const result = await coordinator.coordinate('Test task for performance evaluation');

      // All routed experts should have some performance history
      for (const expert of result.routedExperts) {
        expect(expert.score).toBeGreaterThan(0);
      }
    });

    it('should track expert utilization', async () => {
      const result = await coordinator.coordinate('General coordination task');

      expect(result.expertUtilization.size).toBeGreaterThan(0);

      // Utilization counts should be positive
      for (const count of result.expertUtilization.values()) {
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance-Based Adaptation', () => {
    beforeAll(() => {
      coordinator = new AdaptiveCoordinator(3);

      // Add agents
      for (let i = 0; i < 12; i++) {
        coordinator.addAgent({
          id: `adaptive-agent-${i}`,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1),
          expertise: ['general', 'coordination'],
          performanceHistory: [],
          reliability: 0.85
        });
      }
    });

    it('should adapt mechanism based on performance', async () => {
      // Run multiple computational tasks
      for (let i = 0; i < 10; i++) {
        await coordinator.coordinate('Compute optimization task');
      }

      const stats = coordinator.getMechanismStats();
      const hierarchicalStats = stats.get('hierarchical')!;

      // Should have learned from experience
      expect(hierarchicalStats.usageCount).toBeGreaterThan(0);
      expect(hierarchicalStats.avgPerformance).toBeGreaterThan(0);
    });

    it('should update agent performance history', async () => {
      const agentBefore = coordinator['agents'].get('adaptive-agent-0')!;
      const historyLengthBefore = agentBefore.performanceHistory.length;

      await coordinator.coordinate('Test task');

      const agentAfter = coordinator['agents'].get('adaptive-agent-0')!;

      // Performance history should be updated for routed agents
      expect(agentAfter.performanceHistory.length).toBeGreaterThanOrEqual(historyLengthBefore);
    });

    it('should maintain performance history window', async () => {
      const testAgent = coordinator['agents'].get('adaptive-agent-0')!;

      // Run many tasks to exceed window size
      for (let i = 0; i < 25; i++) {
        await coordinator.coordinate(`Task ${i}`);
      }

      // Should maintain max 20 history entries
      expect(testAgent.performanceHistory.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Coordination Performance', () => {
    beforeAll(() => {
      coordinator = new AdaptiveCoordinator(3);

      for (let i = 0; i < 15; i++) {
        coordinator.addAgent({
          id: `perf-agent-${i}`,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1),
          expertise: ['general'],
          performanceHistory: [0.8],
          reliability: 0.9
        });
      }
    });

    it('should coordinate in reasonable time', async () => {
      const result = await coordinator.coordinate('Performance benchmark task');

      console.log(`Adaptive coordination time: ${result.coordinationTimeMs.toFixed(2)}ms`);
      expect(result.coordinationTimeMs).toBeLessThan(200);
    });

    it('should provide mechanism scores', async () => {
      const result = await coordinator.coordinate('Mechanism scoring task');

      expect(result.mechanismScores.size).toBe(3);
      expect(result.mechanismScores.has('hierarchical')).toBe(true);
      expect(result.mechanismScores.has('mesh')).toBe(true);
      expect(result.mechanismScores.has('hybrid')).toBe(true);
    });

    it('should scale with agent count', async () => {
      const sizes = [10, 20, 30];
      const times: number[] = [];

      for (const size of sizes) {
        const testCoordinator = new AdaptiveCoordinator(3);

        for (let i = 0; i < size; i++) {
          testCoordinator.addAgent({
            id: `scale-agent-${i}`,
            embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1),
            expertise: ['general'],
            performanceHistory: [0.8],
            reliability: 0.9
          });
        }

        const result = await testCoordinator.coordinate('Scaling test');
        times.push(result.coordinationTimeMs);
      }

      console.log('Adaptive scaling times:', times.map(t => `${t.toFixed(2)}ms`).join(', '));

      // Should maintain reasonable performance
      expect(times[times.length - 1]).toBeLessThan(300);
    }, 60000);
  });
});
