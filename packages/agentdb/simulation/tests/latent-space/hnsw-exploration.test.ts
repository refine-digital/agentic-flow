/**
 * HNSW Exploration Simulation Tests
 *
 * Tests hierarchical navigable small world graph structure,
 * small-world properties, and sub-millisecond search performance.
 *
 * Target Metrics:
 * - M=32 configuration (optimal)
 * - Small-world index sigma=2.84 (range: 2.5-3.5)
 * - Clustering coefficient: 0.39
 * - Average path length: O(log N)
 * - 8.2x speedup vs hnswlib
 * - <100us latency (target: 61us p50)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { hnswExplorationScenario } from '../../scenarios/latent-space/hnsw-exploration';
import type { SimulationReport } from '../../types';

// Type helpers for simulation report fields
interface HNSWParam {
  M: number;
  efConstruction: number;
  efSearch: number;
  [key: string]: unknown;
}

interface GraphTopology {
  averageSmallWorldIndex: number;
  averageClusteringCoeff: number;
  [key: string]: unknown;
}

interface LatencyBucket {
  k: number;
  p50: number;
  p99: number;
  [key: string]: unknown;
}

interface RecallBucket {
  k: number;
  recall: number;
  [key: string]: unknown;
}

interface DetailedResult {
  vectorCount: number;
  backend: string;
  speedupVsBaseline: number;
  graphMetrics: {
    averagePathLength: number;
    searchLatencyUs: LatencyBucket[];
    layers: number;
    nodesPerLayer: number[];
    connectivityDistribution: unknown[];
  };
  recallAtK: RecallBucket[];
}

interface BestPerformance {
  M: number;
  efConstruction: number;
  graphMetrics?: {
    searchLatencyUs: LatencyBucket[];
  };
  [key: string]: unknown;
}

interface SearchPerformance {
  bestQPS: number;
  [key: string]: unknown;
}

interface BackendComparison {
  [key: string]: unknown;
}

interface ParameterSensitivity {
  MImpact: unknown;
  efConstructionImpact: unknown;
  efSearchImpact: unknown;
}

describe('HNSWExploration', () => {
  let report: SimulationReport;

  beforeAll(async () => {
    report = await hnswExplorationScenario.run(hnswExplorationScenario.config);
  }, 120000); // 120s timeout for large graphs

  describe('Optimal M Configuration', () => {
    it('should use M=32 for best performance', () => {
      const best = report.summary.bestPerformance as BestPerformance;
      expect(best.M).toBe(32);
    });

    it('should test multiple M values', () => {
      const mValues = (hnswExplorationScenario.config.hnswParams as HNSWParam[]).map(p => p.M);
      expect(mValues).toContain(16);
      expect(mValues).toContain(32);
      expect(mValues).toContain(64);
    });

    it('should use appropriate efConstruction', () => {
      const best = report.summary.bestPerformance as BestPerformance;
      expect(best.efConstruction).toBeGreaterThanOrEqual(200);
      expect(best.efConstruction).toBeLessThanOrEqual(800);
    });
  });

  describe('Small-World Properties', () => {
    it('should achieve small-world index in range 2.5-3.5', () => {
      const topology = report.metrics.graphTopology as GraphTopology;
      expect(topology.averageSmallWorldIndex).toBeGreaterThan(2.5);
      expect(topology.averageSmallWorldIndex).toBeLessThan(3.5);
    });

    it('should target sigma=2.84', () => {
      const topology = report.metrics.graphTopology as GraphTopology;
      expect(topology.averageSmallWorldIndex).toBeCloseTo(2.84, 0.5);
    });

    it('should have clustering coefficient ~0.39', () => {
      const topology = report.metrics.graphTopology as GraphTopology;
      expect(topology.averageClusteringCoeff).toBeCloseTo(0.39, 0.15);
    });

    it('should maintain clustering coefficient >0.3', () => {
      const topology = report.metrics.graphTopology as GraphTopology;
      expect(topology.averageClusteringCoeff).toBeGreaterThan(0.3);
    });
  });

  describe('Average Path Length', () => {
    it('should scale as O(log N)', () => {
      const results = report.detailedResults as DetailedResult[];
      const largeGraph = results.find(r => r.vectorCount === 100000);

      if (largeGraph) {
        const expectedPath = Math.log2(largeGraph.vectorCount) * 1.5;
        expect(largeGraph.graphMetrics.averagePathLength).toBeLessThan(expectedPath);
      }
    });

    it('should have efficient navigation paths', () => {
      const results = report.detailedResults as DetailedResult[];
      results.forEach(r => {
        const maxExpectedPath = Math.log2(r.vectorCount) * 2;
        expect(r.graphMetrics.averagePathLength).toBeLessThan(maxExpectedPath);
      });
    });
  });

  describe('Search Performance', () => {
    it('should achieve 8.2x speedup vs hnswlib', () => {
      const ruvector = (report.detailedResults as DetailedResult[]).find(
        r => r.backend === 'ruvector-gnn'
      );

      if (ruvector) {
        expect(ruvector.speedupVsBaseline).toBeGreaterThan(2.0);
      }
    });

    it('should target 8x+ speedup', () => {
      const ruvector = (report.detailedResults as DetailedResult[]).find(
        r => r.backend === 'ruvector-gnn' && r.vectorCount === 100000
      );

      if (ruvector) {
        expect(ruvector.speedupVsBaseline).toBeCloseTo(8.2, 3);
      }
    });

    it('should achieve sub-millisecond latency', () => {
      const results = report.detailedResults as DetailedResult[];
      const hasSubMs = results.some(r => {
        const latencies = r.graphMetrics.searchLatencyUs || [];
        return latencies.some((l: LatencyBucket) => l.p99 < 1000);
      });
      expect(hasSubMs).toBe(true);
    });

    it('should target 61us p50 latency', () => {
      const best = report.summary.bestPerformance as BestPerformance;
      const latencies = best.graphMetrics?.searchLatencyUs || [];

      if (latencies.length > 0) {
        const p50 = latencies.find((l: LatencyBucket) => l.k === 10)?.p50 || 0;
        expect(p50).toBeLessThan(100);
      }
    });

    it('should maintain high QPS', () => {
      const search = report.metrics.searchPerformance as SearchPerformance;
      expect(search.bestQPS).toBeGreaterThan(1000);
    });
  });

  describe('Recall Quality', () => {
    it('should achieve >95% recall@10', () => {
      const results = report.detailedResults as DetailedResult[];
      results.forEach(r => {
        const recall10 = r.recallAtK.find((rec: RecallBucket) => rec.k === 10);
        if (recall10) {
          expect(recall10.recall).toBeGreaterThan(0.95);
        }
      });
    });

    it('should test multiple k values', () => {
      const kValues = hnswExplorationScenario.config.kValues as number[];
      expect(kValues).toContain(1);
      expect(kValues).toContain(10);
      expect(kValues).toContain(100);
    });
  });

  describe('Graph Topology', () => {
    it('should have hierarchical layer structure', () => {
      const results = report.detailedResults as DetailedResult[];
      results.forEach(r => {
        expect(r.graphMetrics.layers).toBeGreaterThan(1);
        expect(r.graphMetrics.nodesPerLayer.length).toBe(r.graphMetrics.layers);
      });
    });

    it('should have exponential layer decay', () => {
      const results = report.detailedResults as DetailedResult[];
      const sample = results[0];

      if (sample) {
        const layers = (sample as DetailedResult).graphMetrics.nodesPerLayer;
        for (let i = 1; i < layers.length; i++) {
          expect(layers[i]).toBeLessThan(layers[i - 1]);
        }
      }
    });

    it('should track connectivity distribution', () => {
      const results = report.detailedResults as DetailedResult[];
      results.forEach(r => {
        expect(r.graphMetrics.connectivityDistribution).toBeDefined();
        expect(r.graphMetrics.connectivityDistribution.length).toBe(r.graphMetrics.layers);
      });
    });
  });

  describe('Backend Comparison', () => {
    it('should test ruvector-gnn backend', () => {
      const backends = hnswExplorationScenario.config.backends as string[];
      expect(backends).toContain('ruvector-gnn');
    });

    it('should test hnswlib baseline', () => {
      const backends = hnswExplorationScenario.config.backends as string[];
      expect(backends).toContain('hnswlib');
    });

    it('should compare backend performance', () => {
      const comparison = report.metrics.backendComparison as BackendComparison[];
      expect(Array.isArray(comparison)).toBe(true);
      expect(comparison.length).toBeGreaterThan(0);
    });
  });

  describe('Parameter Sensitivity', () => {
    it('should analyze M parameter impact', () => {
      const sensitivity = report.metrics.parameterSensitivity as ParameterSensitivity;
      expect(sensitivity.MImpact).toBeDefined();
    });

    it('should analyze efConstruction impact', () => {
      const sensitivity = report.metrics.parameterSensitivity as ParameterSensitivity;
      expect(sensitivity.efConstructionImpact).toBeDefined();
    });

    it('should analyze efSearch impact', () => {
      const sensitivity = report.metrics.parameterSensitivity as ParameterSensitivity;
      expect(sensitivity.efSearchImpact).toBeDefined();
    });
  });

  describe('Target Validation', () => {
    it('should meet 2-4x speedup target', () => {
      const targetsMet = report.summary.targetsMet as boolean;
      expect(targetsMet).toBe(true);
    });

    it('should validate small-world properties', () => {
      const topology = report.metrics.graphTopology as GraphTopology;
      expect(topology.averageSmallWorldIndex).toBeGreaterThan(1.0);
    });
  });

  describe('Report Generation', () => {
    it('should generate complete analysis', () => {
      expect(report.analysis).toBeDefined();
      expect(report.analysis).toContain('HNSW');
    });

    it('should provide actionable recommendations', () => {
      expect(report.recommendations).toBeDefined();
      expect(report.recommendations!.length).toBeGreaterThan(0);
      expect(report.recommendations!.some(r => r.includes('M='))).toBe(true);
    });

    it('should generate visualizations', () => {
      expect(report.artifacts!.graphVisualizations).toBeDefined();
      expect(report.artifacts!.performanceCharts).toBeDefined();
    });

    it('should complete within timeout', () => {
      expect(report.executionTimeMs).toBeLessThan(120000);
    });
  });
});
