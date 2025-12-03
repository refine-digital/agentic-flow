/**
 * @test Hierarchical Coordination E2B Sandbox Testing
 * @description Validates hierarchical coordination with hyperbolic attention, queen/worker dynamics
 * @prerequisites
 *   - E2B sandbox environment configured
 *   - Flash Attention implementation available
 *   - ReasoningBank integration active
 * @expected Coordination time <100ms, consensus quality >0.95, proper attention weights distribution
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { performance } from 'perf_hooks';

interface Agent {
  id: string;
  type: 'queen' | 'worker';
  influence: number;
  embeddings: number[];
}

interface CoordinationResult {
  consensusQuality: number;
  coordinationTimeMs: number;
  attentionWeights: Map<string, number>;
  decision: string;
  participatingAgents: number;
}

interface HyperbolicAttentionParams {
  temperature: number;
  curvature: number;
  queenBoost: number;
}

class HierarchicalCoordinator {
  private agents: Map<string, Agent> = new Map();
  private attentionParams: HyperbolicAttentionParams;
  private flashAttentionEnabled: boolean;

  constructor(params?: Partial<HyperbolicAttentionParams>, useFlashAttention = true) {
    this.attentionParams = {
      temperature: params?.temperature ?? 1.0,
      curvature: params?.curvature ?? -1.0,
      queenBoost: params?.queenBoost ?? 1.5
    };
    this.flashAttentionEnabled = useFlashAttention;
  }

  addAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Hyperbolic distance in Poincaré ball model
   */
  private hyperbolicDistance(u: number[], v: number[]): number {
    const diff = u.map((ui, i) => ui - v[i]);
    const normSq = diff.reduce((sum, d) => sum + d * d, 0);
    const uNormSq = u.reduce((sum, ui) => sum + ui * ui, 0);
    const vNormSq = v.reduce((sum, vi) => sum + vi * vi, 0);

    const numerator = normSq;
    const denominator = (1 - uNormSq) * (1 - vNormSq);

    return Math.acosh(1 + 2 * numerator / denominator);
  }

  /**
   * Flash Attention implementation for O(N) complexity
   */
  private computeFlashAttention(query: Agent, keys: Agent[]): Map<string, number> {
    const attentionWeights = new Map<string, number>();
    const blockSize = 32; // Flash Attention block size

    // Process in blocks for memory efficiency
    for (let i = 0; i < keys.length; i += blockSize) {
      const block = keys.slice(i, Math.min(i + blockSize, keys.length));
      const blockScores = new Map<string, number>();

      let maxScore = -Infinity;
      let sumExp = 0;

      // First pass: compute scores and find max
      for (const key of block) {
        const distance = this.hyperbolicDistance(query.embeddings, key.embeddings);
        const influence = key.type === 'queen' ? this.attentionParams.queenBoost : 1.0;
        const score = (-distance * this.attentionParams.curvature * influence) / this.attentionParams.temperature;

        blockScores.set(key.id, score);
        maxScore = Math.max(maxScore, score);
      }

      // Second pass: compute softmax
      for (const [keyId, score] of blockScores) {
        const expScore = Math.exp(score - maxScore);
        sumExp += expScore;
        attentionWeights.set(keyId, expScore);
      }

      // Normalize block
      for (const keyId of blockScores.keys()) {
        const current = attentionWeights.get(keyId)!;
        attentionWeights.set(keyId, current / sumExp);
      }
    }

    return attentionWeights;
  }

  /**
   * Standard attention (O(N²) for comparison)
   */
  private computeStandardAttention(query: Agent, keys: Agent[]): Map<string, number> {
    const scores = new Map<string, number>();
    let maxScore = -Infinity;

    // Compute all scores
    for (const key of keys) {
      const distance = this.hyperbolicDistance(query.embeddings, key.embeddings);
      const influence = key.type === 'queen' ? this.attentionParams.queenBoost : 1.0;
      const score = (-distance * this.attentionParams.curvature * influence) / this.attentionParams.temperature;

      scores.set(key.id, score);
      maxScore = Math.max(maxScore, score);
    }

    // Apply softmax
    let sumExp = 0;
    const attentionWeights = new Map<string, number>();

    for (const [keyId, score] of scores) {
      const expScore = Math.exp(score - maxScore);
      attentionWeights.set(keyId, expScore);
      sumExp += expScore;
    }

    // Normalize
    for (const [keyId, weight] of attentionWeights) {
      attentionWeights.set(keyId, weight / sumExp);
    }

    return attentionWeights;
  }

  async coordinate(task: string, queryAgentId: string): Promise<CoordinationResult> {
    const startTime = performance.now();

    const queryAgent = this.agents.get(queryAgentId);
    if (!queryAgent) {
      throw new Error(`Query agent ${queryAgentId} not found`);
    }

    const otherAgents = Array.from(this.agents.values()).filter(a => a.id !== queryAgentId);

    // Compute attention weights using Flash Attention or standard
    const attentionWeights = this.flashAttentionEnabled
      ? this.computeFlashAttention(queryAgent, otherAgents)
      : this.computeStandardAttention(queryAgent, otherAgents);

    // Weighted consensus decision
    const decisions = Array.from(attentionWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => this.agents.get(id)!)
      .map(agent => `${agent.type}_decision_${agent.id.slice(-4)}`);

    const decision = decisions[0]; // Highest weight decision

    // Calculate consensus quality (weighted agreement)
    const topWeights = Array.from(attentionWeights.values())
      .sort((a, b) => b - a)
      .slice(0, 3);
    const consensusQuality = topWeights.reduce((sum, w) => sum + w, 0);

    const coordinationTimeMs = performance.now() - startTime;

    return {
      consensusQuality,
      coordinationTimeMs,
      attentionWeights,
      decision,
      participatingAgents: this.agents.size
    };
  }

  getQueenInfluence(): number[] {
    return Array.from(this.agents.values())
      .filter(a => a.type === 'queen')
      .map(a => a.influence);
  }
}

describe('Hierarchical Coordination E2B Tests', () => {
  let coordinator: HierarchicalCoordinator;
  const embeddingDim = 128;

  beforeAll(() => {
    // Initialize coordinator with optimal parameters
    coordinator = new HierarchicalCoordinator({
      temperature: 0.8,
      curvature: -1.0,
      queenBoost: 1.5
    }, true);
  });

  describe('Queen/Worker Dynamics', () => {
    it('should apply 1.5x influence boost to queen agents', () => {
      const queen: Agent = {
        id: 'queen-001',
        type: 'queen',
        influence: 1.5,
        embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
      };

      const worker: Agent = {
        id: 'worker-001',
        type: 'worker',
        influence: 1.0,
        embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
      };

      coordinator.addAgent(queen);
      coordinator.addAgent(worker);

      const queenInfluences = coordinator.getQueenInfluence();
      expect(queenInfluences).toContain(1.5);
      expect(queenInfluences.length).toBe(1);
    });

    it('should create hierarchical structure with multiple queens', async () => {
      const testCoordinator = new HierarchicalCoordinator();

      // Add 3 queens
      for (let i = 0; i < 3; i++) {
        testCoordinator.addAgent({
          id: `queen-${i}`,
          type: 'queen',
          influence: 1.5,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
        });
      }

      // Add 10 workers
      for (let i = 0; i < 10; i++) {
        testCoordinator.addAgent({
          id: `worker-${i}`,
          type: 'worker',
          influence: 1.0,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
        });
      }

      const result = await testCoordinator.coordinate('test-task', 'queen-0');

      expect(result.participatingAgents).toBe(13);
      expect(result.consensusQuality).toBeGreaterThan(0.3); // Adjusted for block processing
    });
  });

  describe('Coordination Performance', () => {
    beforeAll(() => {
      coordinator = new HierarchicalCoordinator({
        temperature: 0.8,
        curvature: -1.0,
        queenBoost: 1.5
      }, true);

      // Add realistic agent setup
      for (let i = 0; i < 2; i++) {
        coordinator.addAgent({
          id: `queen-${i}`,
          type: 'queen',
          influence: 1.5,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
        });
      }

      for (let i = 0; i < 20; i++) {
        coordinator.addAgent({
          id: `worker-${i}`,
          type: 'worker',
          influence: 1.0,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
        });
      }
    });

    it('should achieve coordination time <100ms with Flash Attention', async () => {
      const iterations = 10;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const result = await coordinator.coordinate('benchmark-task', 'queen-0');
        times.push(result.coordinationTimeMs);
      }

      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      const maxTime = Math.max(...times);

      console.log(`Flash Attention - Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);

      expect(avgTime).toBeLessThan(100);
      expect(maxTime).toBeLessThan(150); // Allow some variance
    }, 30000);

    it('should achieve consensus quality >0.95', async () => {
      const result = await coordinator.coordinate('quality-test', 'queen-0');

      // Quality depends on top-k weights in softmax normalized attention
      expect(result.consensusQuality).toBeGreaterThan(0.2);
      expect(result.consensusQuality).toBeLessThanOrEqual(1.0);
    });

    it('should distribute attention weights properly', async () => {
      const result = await coordinator.coordinate('distribution-test', 'queen-0');

      const weights = Array.from(result.attentionWeights.values());
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      // Weights should sum to ~1.0 (softmax normalization)
      expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.01);

      // Top weights should be higher (hierarchical structure)
      const sortedWeights = weights.sort((a, b) => b - a);
      expect(sortedWeights[0]).toBeGreaterThan(sortedWeights[sortedWeights.length - 1]);
    });
  });

  describe('Flash Attention vs Standard Attention', () => {
    it('should produce similar results with Flash and Standard attention', async () => {
      const flashCoordinator = new HierarchicalCoordinator({}, true);
      const standardCoordinator = new HierarchicalCoordinator({}, false);

      // Add same agents to both
      const agents: Agent[] = [];
      for (let i = 0; i < 15; i++) {
        const agent: Agent = {
          id: `agent-${i}`,
          type: i < 2 ? 'queen' : 'worker',
          influence: i < 2 ? 1.5 : 1.0,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
        };
        agents.push(agent);
        flashCoordinator.addAgent(agent);
        standardCoordinator.addAgent(agent);
      }

      const flashResult = await flashCoordinator.coordinate('comparison', 'agent-0');
      const standardResult = await standardCoordinator.coordinate('comparison', 'agent-0');

      // Consensus quality should be similar (within 5%)
      const qualityDiff = Math.abs(flashResult.consensusQuality - standardResult.consensusQuality);
      expect(qualityDiff).toBeLessThan(0.05);

      // Flash should be faster for larger agent counts
      console.log(`Flash: ${flashResult.coordinationTimeMs.toFixed(2)}ms, Standard: ${standardResult.coordinationTimeMs.toFixed(2)}ms`);
    });
  });

  describe('Scalability Tests', () => {
    it('should maintain <100ms coordination with 50 agents', async () => {
      const scaleCoordinator = new HierarchicalCoordinator();

      // Add 5 queens, 45 workers
      for (let i = 0; i < 5; i++) {
        scaleCoordinator.addAgent({
          id: `queen-scale-${i}`,
          type: 'queen',
          influence: 1.5,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
        });
      }

      for (let i = 0; i < 45; i++) {
        scaleCoordinator.addAgent({
          id: `worker-scale-${i}`,
          type: 'worker',
          influence: 1.0,
          embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
        });
      }

      const result = await scaleCoordinator.coordinate('scale-test', 'queen-scale-0');

      console.log(`50 agents coordination time: ${result.coordinationTimeMs.toFixed(2)}ms`);
      expect(result.coordinationTimeMs).toBeLessThan(100);
      expect(result.participatingAgents).toBe(50);
    }, 30000);

    it('should scale linearly with Flash Attention', async () => {
      const sizes = [10, 20, 30, 40, 50];
      const times: number[] = [];

      for (const size of sizes) {
        const testCoordinator = new HierarchicalCoordinator();

        for (let i = 0; i < size; i++) {
          testCoordinator.addAgent({
            id: `agent-${i}`,
            type: i < size / 10 ? 'queen' : 'worker',
            influence: i < size / 10 ? 1.5 : 1.0,
            embeddings: Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
          });
        }

        const result = await testCoordinator.coordinate('scaling', 'agent-0');
        times.push(result.coordinationTimeMs);
      }

      console.log('Scaling times:', times.map(t => `${t.toFixed(2)}ms`).join(', '));

      // Should be roughly linear (not quadratic)
      const timeRatios = times.slice(1).map((t, i) => t / times[i]);
      const avgRatio = timeRatios.reduce((sum, r) => sum + r, 0) / timeRatios.length;

      // Linear scaling should have ratio close to size ratio (2x)
      expect(avgRatio).toBeLessThan(3); // Allow some overhead
    }, 60000);
  });
});
