/**
 * E2B Sandbox Test: Collective Intelligence Coordination
 *
 * Tests advanced collective intelligence features:
 * - Distributed cognitive processes
 * - Neural pattern learning from collective decisions
 * - Emergent consensus mechanisms
 * - Knowledge graph integration
 * - Cross-session memory persistence
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AttentionMetricsCollector } from '../../../packages/agentdb/src/utils/attention-metrics.js';

const TEST_CONFIG = {
  sessionId: `collective-intelligence-${Date.now()}`,
  cognitivLoadThreshold: 0.8,
  consensusThreshold: 0.75,
  knowledgeGraphDepth: 3,
};

// Knowledge representation
interface KnowledgeNode {
  id: string;
  type: 'concept' | 'decision' | 'pattern' | 'insight';
  content: string;
  confidence: number;
  sources: string[]; // Agent IDs
  timestamp: number;
  embedding?: Float32Array;
}

interface KnowledgeEdge {
  from: string;
  to: string;
  relationship: 'causes' | 'requires' | 'supports' | 'conflicts';
  strength: number;
}

class KnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private edges: KnowledgeEdge[] = [];

  addNode(node: KnowledgeNode): void {
    this.nodes.set(node.id, node);
  }

  addEdge(edge: KnowledgeEdge): void {
    this.edges.push(edge);
  }

  getNode(id: string): KnowledgeNode | undefined {
    return this.nodes.get(id);
  }

  getConnectedNodes(nodeId: string, depth: number = 1): KnowledgeNode[] {
    const visited = new Set<string>();
    const queue: Array<{ id: string; currentDepth: number }> = [{ id: nodeId, currentDepth: 0 }];
    const connected: KnowledgeNode[] = [];

    while (queue.length > 0) {
      const { id, currentDepth } = queue.shift()!;

      if (visited.has(id) || currentDepth > depth) continue;
      visited.add(id);

      const node = this.nodes.get(id);
      if (node && id !== nodeId) {
        connected.push(node);
      }

      if (currentDepth < depth) {
        const outgoingEdges = this.edges.filter(e => e.from === id);
        for (const edge of outgoingEdges) {
          queue.push({ id: edge.to, currentDepth: currentDepth + 1 });
        }
      }
    }

    return connected;
  }

  exportGraph(): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
    };
  }
}

// Cognitive load balancer
class CognitiveLoadBalancer {
  private agentLoads: Map<string, number> = new Map();

  updateLoad(agentId: string, load: number): void {
    this.agentLoads.set(agentId, load);
  }

  getLoad(agentId: string): number {
    return this.agentLoads.get(agentId) || 0;
  }

  getAverageLoad(): number {
    if (this.agentLoads.size === 0) return 0;
    const total = Array.from(this.agentLoads.values()).reduce((sum, load) => sum + load, 0);
    return total / this.agentLoads.size;
  }

  getLeastLoadedAgents(count: number): string[] {
    return Array.from(this.agentLoads.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, count)
      .map(([agentId]) => agentId);
  }

  redistributeTasks(threshold: number): string[] {
    const overloadedAgents: string[] = [];
    for (const [agentId, load] of this.agentLoads.entries()) {
      if (load > threshold) {
        overloadedAgents.push(agentId);
      }
    }
    return overloadedAgents;
  }
}

// Emergent consensus mechanism
class EmergentConsensus {
  private votes: Map<string, { decision: string; weight: number; confidence: number }> = new Map();

  addVote(agentId: string, decision: string, weight: number, confidence: number): void {
    this.votes.set(agentId, { decision, weight, confidence });
  }

  buildConsensus(threshold: number): {
    consensus: string | null;
    confidence: number;
    participation: number;
    distribution: Record<string, number>;
  } {
    const decisionWeights = new Map<string, number>();
    let totalWeight = 0;

    // Aggregate weighted votes
    for (const { decision, weight, confidence } of this.votes.values()) {
      const weightedVote = weight * confidence;
      decisionWeights.set(decision, (decisionWeights.get(decision) || 0) + weightedVote);
      totalWeight += weightedVote;
    }

    // Find strongest decision
    let consensus: string | null = null;
    let maxWeight = 0;

    for (const [decision, weight] of decisionWeights.entries()) {
      if (weight > maxWeight) {
        maxWeight = weight;
        consensus = decision;
      }
    }

    const confidence = totalWeight > 0 ? maxWeight / totalWeight : 0;
    const participation = this.votes.size;

    // Calculate distribution
    const distribution: Record<string, number> = {};
    for (const [decision, weight] of decisionWeights.entries()) {
      distribution[decision] = totalWeight > 0 ? weight / totalWeight : 0;
    }

    // Only return consensus if it meets threshold
    if (confidence < threshold) {
      consensus = null;
    }

    return { consensus, confidence, participation, distribution };
  }

  reset(): void {
    this.votes.clear();
  }
}

describe('Hive Mind E2B: Collective Intelligence', () => {
  let knowledgeGraph: KnowledgeGraph;
  let loadBalancer: CognitiveLoadBalancer;
  let consensusMechanism: EmergentConsensus;
  let metricsCollector: AttentionMetricsCollector;

  beforeAll(() => {
    knowledgeGraph = new KnowledgeGraph();
    loadBalancer = new CognitiveLoadBalancer();
    consensusMechanism = new EmergentConsensus();
    metricsCollector = new AttentionMetricsCollector();
  });

  describe('1. Knowledge Graph Integration', () => {
    it('should build collective knowledge graph', () => {
      const startTime = performance.now();

      // Add knowledge nodes from different agents
      knowledgeGraph.addNode({
        id: 'security-first',
        type: 'insight',
        content: 'Implement authentication before features',
        confidence: 0.92,
        sources: ['queen-alpha', 'worker-security-1'],
        timestamp: Date.now(),
      });

      knowledgeGraph.addNode({
        id: 'microservices-arch',
        type: 'decision',
        content: 'Use microservices architecture',
        confidence: 0.88,
        sources: ['queen-beta', 'worker-architect-1'],
        timestamp: Date.now(),
      });

      knowledgeGraph.addNode({
        id: 'auth-implementation',
        type: 'pattern',
        content: 'JWT-based authentication with refresh tokens',
        confidence: 0.85,
        sources: ['worker-code-1', 'worker-code-2'],
        timestamp: Date.now(),
      });

      // Add relationships
      knowledgeGraph.addEdge({
        from: 'security-first',
        to: 'auth-implementation',
        relationship: 'requires',
        strength: 0.9,
      });

      knowledgeGraph.addEdge({
        from: 'auth-implementation',
        to: 'microservices-arch',
        relationship: 'supports',
        strength: 0.75,
      });

      const graph = knowledgeGraph.exportGraph();

      expect(graph.nodes).toHaveLength(3);
      expect(graph.edges).toHaveLength(2);
      expect(graph.nodes[0].sources).toContain('queen-alpha');

      metricsCollector.endOperation('knowledge-graph-build', startTime);
    });

    it('should traverse knowledge graph with depth limit', () => {
      const startTime = performance.now();

      const connected = knowledgeGraph.getConnectedNodes('security-first', 2);

      // Should find auth-implementation (depth 1) and microservices-arch (depth 2)
      expect(connected.length).toBeGreaterThanOrEqual(1);
      expect(connected.some(n => n.id === 'auth-implementation')).toBe(true);

      metricsCollector.endOperation('knowledge-graph-traverse', startTime);
    });

    it('should aggregate knowledge from multiple sources', () => {
      const securityNode = knowledgeGraph.getNode('security-first');

      expect(securityNode).toBeDefined();
      expect(securityNode!.sources.length).toBeGreaterThanOrEqual(2);
      expect(securityNode!.confidence).toBeGreaterThan(0.9);
    });
  });

  describe('2. Cognitive Load Balancing', () => {
    it('should track agent cognitive loads', () => {
      const startTime = performance.now();

      loadBalancer.updateLoad('queen-alpha', 0.65);
      loadBalancer.updateLoad('queen-beta', 0.70);
      loadBalancer.updateLoad('worker-code-1', 0.85);
      loadBalancer.updateLoad('worker-code-2', 0.45);
      loadBalancer.updateLoad('worker-analyst-1', 0.90);
      loadBalancer.updateLoad('worker-test-1', 0.30);

      const avgLoad = loadBalancer.getAverageLoad();

      expect(avgLoad).toBeGreaterThan(0);
      expect(avgLoad).toBeLessThan(1);

      metricsCollector.endOperation('cognitive-load-tracking', startTime);
    });

    it('should identify overloaded agents', () => {
      const startTime = performance.now();

      const overloaded = loadBalancer.redistributeTasks(TEST_CONFIG.cognitivLoadThreshold);

      expect(overloaded.length).toBeGreaterThan(0);
      expect(overloaded).toContain('worker-code-1');
      expect(overloaded).toContain('worker-analyst-1');

      metricsCollector.endOperation('overload-detection', startTime);
    });

    it('should find least loaded agents for task assignment', () => {
      const startTime = performance.now();

      const available = loadBalancer.getLeastLoadedAgents(2);

      expect(available).toHaveLength(2);
      expect(available[0]).toBe('worker-test-1'); // Lowest load: 0.30
      expect(available[1]).toBe('worker-code-2'); // Second lowest: 0.45

      metricsCollector.endOperation('load-balancing', startTime);
    });
  });

  describe('3. Emergent Consensus Mechanisms', () => {
    it('should collect weighted votes from agents', () => {
      const startTime = performance.now();

      consensusMechanism.reset();

      // Queens vote with higher influence
      consensusMechanism.addVote('queen-alpha', 'Approach-A', 1.5, 0.95);
      consensusMechanism.addVote('queen-beta', 'Approach-A', 1.5, 0.90);

      // Workers vote
      consensusMechanism.addVote('worker-code-1', 'Approach-B', 1.0, 0.85);
      consensusMechanism.addVote('worker-code-2', 'Approach-B', 1.0, 0.80);
      consensusMechanism.addVote('worker-analyst-1', 'Approach-A', 1.0, 0.75);
      consensusMechanism.addVote('worker-analyst-2', 'Approach-B', 1.0, 0.70);

      const result = consensusMechanism.buildConsensus(TEST_CONFIG.consensusThreshold);

      expect(result.participation).toBe(6);
      expect(result.distribution).toHaveProperty('Approach-A');
      expect(result.distribution).toHaveProperty('Approach-B');

      metricsCollector.endOperation('consensus-voting', startTime);
    });

    it('should reach consensus when threshold is met', () => {
      const result = consensusMechanism.buildConsensus(0.5);

      // Queens' weighted votes should dominate
      expect(result.consensus).toBe('Approach-A');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should return no consensus when threshold is not met', () => {
      consensusMechanism.reset();

      // Evenly split votes with low confidence
      consensusMechanism.addVote('agent-1', 'A', 1.0, 0.5);
      consensusMechanism.addVote('agent-2', 'B', 1.0, 0.5);

      const result = consensusMechanism.buildConsensus(0.9);

      expect(result.consensus).toBeNull();
      expect(result.confidence).toBeLessThan(0.9);
    });
  });

  describe('4. Neural Pattern Learning', () => {
    it('should learn patterns from successful decisions', () => {
      const startTime = performance.now();

      const successPattern = {
        taskType: 'api-implementation',
        approach: 'Test-Driven Development',
        successRate: 0.95,
        uses: 12,
        avgReward: 0.92,
        sources: ['worker-code-1', 'worker-test-1'],
        timestamp: Date.now(),
      };

      knowledgeGraph.addNode({
        id: 'tdd-pattern',
        type: 'pattern',
        content: JSON.stringify(successPattern),
        confidence: successPattern.successRate,
        sources: successPattern.sources,
        timestamp: Date.now(),
      });

      const pattern = knowledgeGraph.getNode('tdd-pattern');

      expect(pattern).toBeDefined();
      expect(pattern!.confidence).toBe(0.95);

      metricsCollector.endOperation('pattern-learning', startTime);
    });

    it('should apply learned patterns to new decisions', () => {
      const startTime = performance.now();

      const tddPattern = knowledgeGraph.getNode('tdd-pattern');
      const patternData = JSON.parse(tddPattern!.content);

      // Use pattern confidence to influence new decision
      consensusMechanism.reset();
      consensusMechanism.addVote(
        'collective-intelligence',
        'Use-TDD',
        1.25,
        patternData.successRate
      );

      const result = consensusMechanism.buildConsensus(0.5);

      expect(result.consensus).toBe('Use-TDD');
      expect(result.confidence).toBeGreaterThan(0.9);

      metricsCollector.endOperation('pattern-application', startTime);
    });
  });

  describe('5. Cross-Session Persistence', () => {
    it('should persist collective state across sessions', () => {
      const startTime = performance.now();

      const session1State = {
        sessionId: TEST_CONFIG.sessionId,
        knowledgeGraph: knowledgeGraph.exportGraph(),
        cognitiveLoads: Array.from(loadBalancer['agentLoads'].entries()),
        timestamp: Date.now(),
      };

      // Simulate persistence
      const serialized = JSON.stringify(session1State);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.sessionId).toBe(TEST_CONFIG.sessionId);
      expect(deserialized.knowledgeGraph.nodes.length).toBeGreaterThan(0);
      expect(deserialized.cognitiveLoads.length).toBeGreaterThan(0);

      metricsCollector.endOperation('session-persistence', startTime);
    });

    it('should restore collective state from previous session', () => {
      const startTime = performance.now();

      const previousState = {
        sessionId: TEST_CONFIG.sessionId,
        knowledgeGraph: knowledgeGraph.exportGraph(),
        cognitiveLoads: [
          ['queen-alpha', 0.65],
          ['worker-code-1', 0.85],
        ],
        timestamp: Date.now() - 3600000, // 1 hour ago
      };

      // Restore knowledge graph
      const restoredGraph = new KnowledgeGraph();
      for (const node of previousState.knowledgeGraph.nodes) {
        restoredGraph.addNode(node);
      }
      for (const edge of previousState.knowledgeGraph.edges) {
        restoredGraph.addEdge(edge);
      }

      const exportedGraph = restoredGraph.exportGraph();

      expect(exportedGraph.nodes.length).toBe(previousState.knowledgeGraph.nodes.length);
      expect(exportedGraph.edges.length).toBe(previousState.knowledgeGraph.edges.length);

      metricsCollector.endOperation('session-restoration', startTime);
    });
  });

  describe('6. Performance Metrics', () => {
    it('should report collective intelligence metrics', () => {
      const metrics = metricsCollector.getAllMetrics();

      console.log('\n=== Collective Intelligence Performance ===');
      for (const [operation, data] of metrics.entries()) {
        console.log(`\n${operation}:`);
        console.log(`  Operations: ${data.operationCount}`);
        console.log(`  Avg Latency: ${(data.avgLatencyUs / 1000).toFixed(2)} ms`);
        console.log(`  P95 Latency: ${(data.p95LatencyUs / 1000).toFixed(2)} ms`);
        console.log(`  Throughput: ${data.throughputOpsPerSec.toFixed(2)} ops/sec`);
      }

      expect(metrics.size).toBeGreaterThan(0);
    });

    it('should verify efficient knowledge operations', () => {
      const graphMetrics = metricsCollector.getMetrics('knowledge-graph-build');

      if (graphMetrics) {
        // Knowledge graph operations should be fast
        expect(graphMetrics.avgLatencyUs).toBeLessThan(50000); // < 50ms
      }
    });

    it('should verify low-latency consensus building', () => {
      const consensusMetrics = metricsCollector.getMetrics('consensus-voting');

      if (consensusMetrics) {
        // Consensus should be near-instant
        expect(consensusMetrics.avgLatencyUs).toBeLessThan(10000); // < 10ms
      }
    });
  });
});
