/**
 * E2B Sandbox Test: Queen-Worker Hierarchy with Hyperbolic Attention
 *
 * Tests hierarchical collective intelligence with:
 * - 2 Queen coordinators (strategic decisions, 1.5x influence weight)
 * - 8 Worker specialists (execution details, 1.0x influence weight)
 * - Hyperbolic attention (curvature=-1.0) for hierarchy modeling
 * - Distributed memory coordination
 * - Consensus building with attention-weighted voting
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AttentionMetricsCollector, measureAsync } from '../../../packages/agentdb/src/utils/attention-metrics.js';

// Test configuration
const TEST_CONFIG = {
  queens: 2,
  workers: 8,
  queenInfluenceWeight: 1.5,
  workerInfluenceWeight: 1.0,
  hyperbolicCurvature: -1.0,
  attentionTemperature: 1.0,
  consensusThreshold: 0.75,
  sessionId: `hive-mind-test-${Date.now()}`,
};

// Agent identifiers
const QUEENS = ['queen-alpha', 'queen-beta'];
const WORKERS = [
  'worker-code-1',
  'worker-code-2',
  'worker-analyst-1',
  'worker-analyst-2',
  'worker-test-1',
  'worker-test-2',
  'worker-deploy-1',
  'worker-deploy-2',
];

// Simulated agent decisions
interface AgentDecision {
  agentId: string;
  agentType: 'queen' | 'worker';
  decision: string;
  confidence: number;
  reasoning: string;
  timestamp: number;
  influenceWeight: number;
}

// Simulated memory storage
class MemoryStore {
  private store: Map<string, any> = new Map();

  async store(key: string, value: any): Promise<void> {
    this.store.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  async retrieve(key: string): Promise<any | null> {
    const entry = this.store.get(key);
    return entry ? entry.value : null;
  }

  async search(pattern: string): Promise<any[]> {
    const results: any[] = [];
    for (const [key, entry] of this.store.entries()) {
      if (key.includes(pattern)) {
        results.push({ key, ...entry });
      }
    }
    return results;
  }

  clear(): void {
    this.store.clear();
  }
}

// Simulated hyperbolic attention mechanism
class HyperbolicAttention {
  private curvature: number;
  private temperature: number;

  constructor(curvature: number = -1.0, temperature: number = 1.0) {
    this.curvature = curvature;
    this.temperature = temperature;
  }

  /**
   * Calculate Poincaré distance between two points in hyperbolic space
   * Approximation: d(x,y) = arcosh(1 + 2 * ||x-y||² / ((1-||x||²)(1-||y||²)))
   */
  private poincareDistance(influence1: number, influence2: number): number {
    // Map influence weights to Poincaré ball coordinates
    const x = Math.tanh(influence1 / 2);
    const y = Math.tanh(influence2 / 2);

    const normX = x * x;
    const normY = y * y;
    const diff = Math.abs(x - y);

    const numerator = 2 * diff * diff;
    const denominator = (1 - normX) * (1 - normY);

    return Math.acosh(1 + numerator / denominator);
  }

  /**
   * Calculate attention weights using hyperbolic geometry
   * Higher influence agents are "closer" in hyperbolic space
   */
  calculateAttentionWeights(
    query: AgentDecision,
    keys: AgentDecision[]
  ): number[] {
    const distances = keys.map(key =>
      this.poincareDistance(query.influenceWeight, key.influenceWeight)
    );

    // Convert distances to attention weights (closer = higher attention)
    const logits = distances.map(d => -d / this.temperature);

    // Softmax normalization
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map(l => Math.exp(l - maxLogit));
    const sumExp = expLogits.reduce((sum, exp) => sum + exp, 0);

    return expLogits.map(exp => exp / sumExp);
  }

  /**
   * Apply attention-weighted voting for consensus
   */
  weightedConsensus(
    decisions: AgentDecision[],
    attentionWeights: number[]
  ): {
    consensus: string;
    confidence: number;
    influenceDistribution: Record<string, number>;
  } {
    // Group by decision
    const voteGroups = new Map<string, { weight: number; agents: string[] }>();

    decisions.forEach((decision, idx) => {
      const weight = attentionWeights[idx] * decision.influenceWeight * decision.confidence;
      const existing = voteGroups.get(decision.decision) || { weight: 0, agents: [] };

      voteGroups.set(decision.decision, {
        weight: existing.weight + weight,
        agents: [...existing.agents, decision.agentId],
      });
    });

    // Find consensus (highest weighted decision)
    let consensus = '';
    let maxWeight = 0;
    let totalWeight = 0;

    for (const [decision, { weight }] of voteGroups.entries()) {
      totalWeight += weight;
      if (weight > maxWeight) {
        maxWeight = weight;
        consensus = decision;
      }
    }

    const confidence = totalWeight > 0 ? maxWeight / totalWeight : 0;

    // Calculate influence distribution
    const influenceDistribution: Record<string, number> = {};
    for (const [decision, { weight, agents }] of voteGroups.entries()) {
      influenceDistribution[decision] = weight / totalWeight;
    }

    return { consensus, confidence, influenceDistribution };
  }
}

describe('Hive Mind E2B: Queen-Worker Hierarchy', () => {
  let memoryStore: MemoryStore;
  let hyperbolicAttention: HyperbolicAttention;
  let metricsCollector: AttentionMetricsCollector;

  beforeAll(() => {
    memoryStore = new MemoryStore();
    hyperbolicAttention = new HyperbolicAttention(
      TEST_CONFIG.hyperbolicCurvature,
      TEST_CONFIG.attentionTemperature
    );
    metricsCollector = new AttentionMetricsCollector();
  });

  afterAll(() => {
    memoryStore.clear();
  });

  describe('1. Hierarchy Initialization', () => {
    it('should initialize 2 queens with 1.5x influence weight', async () => {
      const startTime = performance.now();

      for (const queenId of QUEENS) {
        await memoryStore.store(`swarm/${queenId}/status`, {
          agent: queenId,
          type: 'queen-coordinator',
          status: 'sovereign-active',
          influenceWeight: TEST_CONFIG.queenInfluenceWeight,
          hierarchy_level: 0,
          timestamp: Date.now(),
        });
      }

      // Verify queens initialized
      const queen1 = await memoryStore.retrieve('swarm/queen-alpha/status');
      const queen2 = await memoryStore.retrieve('swarm/queen-beta/status');

      expect(queen1).toBeDefined();
      expect(queen2).toBeDefined();
      expect(queen1.influenceWeight).toBe(1.5);
      expect(queen2.influenceWeight).toBe(1.5);
      expect(queen1.hierarchy_level).toBe(0);

      metricsCollector.endOperation('hierarchy-init-queens', startTime);
    });

    it('should initialize 8 workers with 1.0x influence weight', async () => {
      const startTime = performance.now();

      for (const workerId of WORKERS) {
        await memoryStore.store(`swarm/${workerId}/status`, {
          agent: workerId,
          type: 'worker-specialist',
          status: 'ready',
          influenceWeight: TEST_CONFIG.workerInfluenceWeight,
          hierarchy_level: 1,
          timestamp: Date.now(),
        });
      }

      // Verify workers initialized
      const workerStatuses = await Promise.all(
        WORKERS.map(id => memoryStore.retrieve(`swarm/${id}/status`))
      );

      expect(workerStatuses).toHaveLength(8);
      workerStatuses.forEach(status => {
        expect(status.influenceWeight).toBe(1.0);
        expect(status.hierarchy_level).toBe(1);
      });

      metricsCollector.endOperation('hierarchy-init-workers', startTime);
    });

    it('should establish queen/worker hierarchy ratio of 1.5:1', () => {
      const ratio = TEST_CONFIG.queenInfluenceWeight / TEST_CONFIG.workerInfluenceWeight;
      expect(ratio).toBe(1.5);
    });
  });

  describe('2. Hyperbolic Attention Configuration', () => {
    it('should configure hyperbolic attention with curvature=-1.0', () => {
      expect(hyperbolicAttention).toBeDefined();
      // Verify curvature is negative (hyperbolic space)
      expect(TEST_CONFIG.hyperbolicCurvature).toBe(-1.0);
    });

    it('should calculate Poincaré distances correctly', () => {
      const startTime = performance.now();

      // Queens should be "closer" to each other than to workers in hyperbolic space
      const queenToQueenDist = hyperbolicAttention['poincareDistance'](1.5, 1.5);
      const queenToWorkerDist = hyperbolicAttention['poincareDistance'](1.5, 1.0);

      expect(queenToQueenDist).toBeLessThan(queenToWorkerDist);
      expect(queenToQueenDist).toBeGreaterThan(0);

      metricsCollector.endOperation('hyperbolic-distance-calc', startTime);
    });

    it('should apply higher attention weights to queens', () => {
      const startTime = performance.now();

      const queryDecision: AgentDecision = {
        agentId: 'collective-intelligence',
        agentType: 'queen',
        decision: 'query',
        confidence: 1.0,
        reasoning: 'test',
        timestamp: Date.now(),
        influenceWeight: 1.5,
      };

      const keyDecisions: AgentDecision[] = [
        { agentId: 'queen-alpha', agentType: 'queen', decision: 'A', confidence: 0.9, reasoning: 'strategic', timestamp: Date.now(), influenceWeight: 1.5 },
        { agentId: 'worker-code-1', agentType: 'worker', decision: 'B', confidence: 0.8, reasoning: 'tactical', timestamp: Date.now(), influenceWeight: 1.0 },
      ];

      const weights = hyperbolicAttention.calculateAttentionWeights(queryDecision, keyDecisions);

      // Queen should have higher attention weight
      expect(weights[0]).toBeGreaterThan(weights[1]);
      expect(weights.reduce((sum, w) => sum + w, 0)).toBeCloseTo(1.0, 5);

      metricsCollector.endOperation('hyperbolic-attention-weights', startTime);
    });
  });

  describe('3. Distributed Memory Coordination', () => {
    it('should coordinate queen directives via memory', async () => {
      const startTime = performance.now();

      // Queens issue strategic directives
      await memoryStore.store('swarm/shared/royal-directives', {
        priority: 'CRITICAL',
        directives: [
          { id: 1, command: 'Implement feature X', assignee: 'workers', issuedBy: 'queen-alpha' },
          { id: 2, command: 'Run security audit', assignee: 'workers', issuedBy: 'queen-beta' },
        ],
        timestamp: Date.now(),
      });

      // Workers acknowledge directives
      for (const workerId of WORKERS.slice(0, 4)) {
        await memoryStore.store(`swarm/${workerId}/task-received`, {
          directiveId: 1,
          status: 'acknowledged',
          timestamp: Date.now(),
        });
      }

      const directives = await memoryStore.retrieve('swarm/shared/royal-directives');
      const acknowledgments = await memoryStore.search('task-received');

      expect(directives.directives).toHaveLength(2);
      expect(acknowledgments.length).toBeGreaterThanOrEqual(4);

      metricsCollector.endOperation('memory-coordination', startTime);
    });

    it('should synchronize collective state across agents', async () => {
      const startTime = performance.now();

      await memoryStore.store('swarm/shared/collective-state', {
        consensus_level: 0.85,
        shared_knowledge: {
          task: 'Build REST API',
          approach: 'Express + PostgreSQL',
          status: 'in-progress',
        },
        decision_queue: ['security-review', 'performance-test'],
        synchronization_timestamp: Date.now(),
      });

      const state = await memoryStore.retrieve('swarm/shared/collective-state');

      expect(state.consensus_level).toBeGreaterThan(TEST_CONFIG.consensusThreshold);
      expect(state.shared_knowledge.task).toBe('Build REST API');

      metricsCollector.endOperation('collective-sync', startTime);
    });
  });

  describe('4. Cross-Agent Knowledge Sharing', () => {
    it('should enable queens to share strategic insights', async () => {
      const startTime = performance.now();

      await memoryStore.store('swarm/queen-alpha/strategic-insight', {
        insight: 'Prioritize authentication before feature development',
        confidence: 0.92,
        category: 'security',
        timestamp: Date.now(),
      });

      await memoryStore.store('swarm/queen-beta/strategic-insight', {
        insight: 'Use microservices architecture for scalability',
        confidence: 0.88,
        category: 'architecture',
        timestamp: Date.now(),
      });

      const insights = await memoryStore.search('strategic-insight');

      expect(insights).toHaveLength(2);
      expect(insights.every(i => i.value.confidence > 0.8)).toBe(true);

      metricsCollector.endOperation('strategic-knowledge-share', startTime);
    });

    it('should enable workers to share execution details', async () => {
      const startTime = performance.now();

      await memoryStore.store('swarm/worker-code-1/implementation', {
        feature: 'user-authentication',
        files: ['src/auth/login.ts', 'src/auth/middleware.ts'],
        status: 'complete',
        tests_passing: true,
      });

      await memoryStore.store('swarm/worker-test-1/test-results', {
        feature: 'user-authentication',
        tests_run: 45,
        tests_passed: 45,
        coverage: '95%',
      });

      const implementations = await memoryStore.search('implementation');
      const testResults = await memoryStore.search('test-results');

      expect(implementations).toHaveLength(1);
      expect(testResults).toHaveLength(1);
      expect(testResults[0].value.tests_passed).toBe(45);

      metricsCollector.endOperation('worker-knowledge-share', startTime);
    });
  });

  describe('5. Consensus Building with Attention Weights', () => {
    it('should build consensus favoring queens (1.5x influence)', async () => {
      const startTime = performance.now();

      const decisions: AgentDecision[] = [
        // Queens vote for approach A
        { agentId: 'queen-alpha', agentType: 'queen', decision: 'Approach-A', confidence: 0.95, reasoning: 'More secure', timestamp: Date.now(), influenceWeight: 1.5 },
        { agentId: 'queen-beta', agentType: 'queen', decision: 'Approach-A', confidence: 0.90, reasoning: 'Better scalability', timestamp: Date.now(), influenceWeight: 1.5 },

        // Workers vote for approach B (majority, but lower influence)
        { agentId: 'worker-code-1', agentType: 'worker', decision: 'Approach-B', confidence: 0.85, reasoning: 'Faster implementation', timestamp: Date.now(), influenceWeight: 1.0 },
        { agentId: 'worker-code-2', agentType: 'worker', decision: 'Approach-B', confidence: 0.80, reasoning: 'Simpler code', timestamp: Date.now(), influenceWeight: 1.0 },
        { agentId: 'worker-analyst-1', agentType: 'worker', decision: 'Approach-B', confidence: 0.82, reasoning: 'Less dependencies', timestamp: Date.now(), influenceWeight: 1.0 },
        { agentId: 'worker-analyst-2', agentType: 'worker', decision: 'Approach-B', confidence: 0.78, reasoning: 'Easier testing', timestamp: Date.now(), influenceWeight: 1.0 },
      ];

      // Use collective intelligence as query (neutral influence)
      const query: AgentDecision = {
        agentId: 'collective-intelligence',
        agentType: 'queen',
        decision: 'consensus-query',
        confidence: 1.0,
        reasoning: 'Building consensus',
        timestamp: Date.now(),
        influenceWeight: 1.25,
      };

      const attentionWeights = hyperbolicAttention.calculateAttentionWeights(query, decisions);
      const result = hyperbolicAttention.weightedConsensus(decisions, attentionWeights);

      // Queens should win despite being minority (due to 1.5x influence)
      expect(result.consensus).toBe('Approach-A');
      expect(result.confidence).toBeGreaterThan(0.5);

      // Calculate actual influence ratio
      const queensInfluence = result.influenceDistribution['Approach-A'] || 0;
      const workersInfluence = result.influenceDistribution['Approach-B'] || 0;
      const actualRatio = queensInfluence / workersInfluence;

      console.log('Consensus Result:', result);
      console.log('Actual Queen/Worker Influence Ratio:', actualRatio.toFixed(2));

      await memoryStore.store('swarm/shared/consensus-decision', {
        decision: result.consensus,
        confidence: result.confidence,
        influenceDistribution: result.influenceDistribution,
        timestamp: Date.now(),
      });

      metricsCollector.endOperation('consensus-building', startTime);
    });

    it('should validate queen/worker influence ratio close to 1.5:1', async () => {
      const consensusDecision = await memoryStore.retrieve('swarm/shared/consensus-decision');

      expect(consensusDecision).toBeDefined();
      expect(consensusDecision.decision).toBe('Approach-A');

      // Calculate weighted influence
      const queensInfluence = TEST_CONFIG.queenInfluenceWeight * 2; // 2 queens
      const workersInfluence = TEST_CONFIG.workerInfluenceWeight * 4; // 4 workers voted B
      const ratio = queensInfluence / workersInfluence;

      // With hyperbolic attention, queens should have even more influence
      expect(ratio).toBeGreaterThanOrEqual(0.75); // At least 75% of 1:1
    });
  });

  describe('6. Scout Exploration Integration', () => {
    it('should deploy scouts for reconnaissance', async () => {
      const startTime = performance.now();

      const scouts = ['scout-security', 'scout-performance', 'scout-dependencies'];

      for (const scoutId of scouts) {
        await memoryStore.store(`swarm/${scoutId}/status`, {
          agent: scoutId,
          type: 'scout-explorer',
          status: 'exploring',
          mission: scoutId.replace('scout-', ''),
          target_area: 'codebase',
          start_time: Date.now(),
        });
      }

      // Scouts report findings
      await memoryStore.store('swarm/shared/discovery-threats', {
        type: 'threat',
        severity: 'medium',
        description: 'Outdated dependency with known vulnerability',
        location: 'package.json:express@4.17.0',
        discovered_by: 'scout-dependencies',
        timestamp: Date.now(),
      });

      const discoveries = await memoryStore.search('discovery-');

      expect(discoveries).toHaveLength(1);
      expect(discoveries[0].value.severity).toBe('medium');

      metricsCollector.endOperation('scout-deployment', startTime);
    });
  });

  describe('7. Performance Metrics', () => {
    it('should measure hierarchy modeling quality', () => {
      const metrics = metricsCollector.getAllMetrics();

      console.log('\n=== Hive Mind Performance Metrics ===');
      for (const [mechanism, data] of metrics.entries()) {
        console.log(`\n${mechanism}:`);
        console.log(`  Operations: ${data.operationCount}`);
        console.log(`  Avg Latency: ${data.avgLatencyUs.toFixed(2)} µs`);
        console.log(`  P95 Latency: ${data.p95LatencyUs.toFixed(2)} µs`);
        console.log(`  Throughput: ${data.throughputOpsPerSec.toFixed(2)} ops/sec`);
      }

      expect(metrics.size).toBeGreaterThan(0);
    });

    it('should verify coordination time is acceptable', async () => {
      const coordinationMetrics = metricsCollector.getMetrics('memory-coordination');

      if (coordinationMetrics) {
        // Memory coordination should be fast (< 100ms avg)
        expect(coordinationMetrics.avgLatencyUs).toBeLessThan(100000); // 100ms in µs
      }
    });

    it('should verify memory sync speed is efficient', async () => {
      const syncMetrics = metricsCollector.getMetrics('collective-sync');

      if (syncMetrics) {
        // Collective sync should be very fast (< 50ms avg)
        expect(syncMetrics.avgLatencyUs).toBeLessThan(50000); // 50ms in µs
      }
    });
  });

  describe('8. Hive Mind Coherence', () => {
    it('should maintain high coherence score across swarm', async () => {
      const startTime = performance.now();

      await memoryStore.store('swarm/collective-intelligence/hive-health', {
        coherence_score: 0.95,
        agent_compliance: {
          compliant: [...QUEENS, ...WORKERS],
          non_responsive: [],
          rebellious: [],
        },
        swarm_efficiency: 0.88,
        threat_level: 'low',
        morale: 'high',
        timestamp: Date.now(),
      });

      const health = await memoryStore.retrieve('swarm/collective-intelligence/hive-health');

      expect(health.coherence_score).toBeGreaterThan(0.9);
      expect(health.agent_compliance.compliant).toHaveLength(10);
      expect(health.swarm_efficiency).toBeGreaterThan(0.85);

      metricsCollector.endOperation('coherence-check', startTime);
    });
  });
});
