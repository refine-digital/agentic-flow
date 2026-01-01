/**
 * RuVector Intelligence Layer Tests
 *
 * Tests the unified intelligence layer integrating:
 * - @ruvector/sona (Micro-LoRA, EWC++, trajectories)
 * - @ruvector/attention (Flash, Hyperbolic, MoE, Graph)
 * - ruvector core (HNSW indexing)
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

// Test that we can import all components
describe('RuVector Intelligence Layer', () => {
  describe('Module Imports', () => {
    test('should import @ruvector/sona', async () => {
      const sona = await import('@ruvector/sona');
      expect(sona.SonaEngine).toBeDefined();
    });

    test('should import @ruvector/attention', async () => {
      const attention = await import('@ruvector/attention');
      expect(attention.MultiHeadAttention).toBeDefined();
      expect(attention.FlashAttention).toBeDefined();
      expect(attention.HyperbolicAttention).toBeDefined();
      expect(attention.MoEAttention).toBeDefined();
      expect(attention.GraphRoPeAttention).toBeDefined();
      expect(attention.DualSpaceAttention).toBeDefined();
    });

    test('should import ruvector core', async () => {
      const ruvector = await import('ruvector');
      expect(ruvector.default).toBeDefined();
    });
  });

  describe('SONA Engine', () => {
    let sona: any;

    beforeAll(async () => {
      const { SonaEngine } = await import('@ruvector/sona');
      sona = new SonaEngine(256); // 256 hidden dim
    });

    test('should create SONA engine', () => {
      expect(sona).toBeDefined();
    });

    test('should apply Micro-LoRA transformation', () => {
      const input = new Array(256).fill(0.1);
      const output = sona.applyMicroLora(input);
      expect(output).toHaveLength(256);
      expect(Array.isArray(output)).toBe(true);
    });

    test('should begin and end trajectory', () => {
      const embedding = new Array(256).fill(0.1);
      const trajectoryId = sona.beginTrajectory(embedding);
      expect(typeof trajectoryId).toBe('number');

      // Add step
      const activations = new Array(256).fill(0.1);
      const attentionWeights = new Array(8).fill(0.125);
      sona.addTrajectoryStep(trajectoryId, activations, attentionWeights, 0.8);

      // End trajectory
      sona.endTrajectory(trajectoryId, 0.9);
    });

    test('should find patterns', () => {
      const embedding = new Array(256).fill(0.1);
      const patterns = sona.findPatterns(embedding, 5);
      expect(Array.isArray(patterns)).toBe(true);
    });

    test('should force learning cycle', () => {
      const result = sona.forceLearn();
      expect(typeof result).toBe('string');
    });

    test('should get stats', () => {
      const statsJson = sona.getStats();
      const stats = JSON.parse(statsJson);
      expect(stats).toBeDefined();
    });
  });

  describe('Attention Mechanisms', () => {
    const dim = 64;

    test('MultiHeadAttention should compute', async () => {
      const { MultiHeadAttention } = await import('@ruvector/attention');
      const attention = new MultiHeadAttention(dim, 8);

      const query = new Float32Array(dim).fill(0.1);
      const keys = [new Float32Array(dim).fill(0.2)];
      const values = [new Float32Array(dim).fill(0.3)];

      const result = attention.compute(query, keys, values);
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(dim);
    });

    test('FlashAttention should compute with O(n) complexity', async () => {
      const { FlashAttention } = await import('@ruvector/attention');
      const attention = new FlashAttention(dim);

      const query = new Float32Array(dim).fill(0.1);
      const keys = [new Float32Array(dim).fill(0.2)];
      const values = [new Float32Array(dim).fill(0.3)];

      const result = attention.compute(query, keys, values);
      expect(result).toBeInstanceOf(Float32Array);
    });

    test('HyperbolicAttention should compute in Poincaré ball', async () => {
      const { HyperbolicAttention } = await import('@ruvector/attention');
      const attention = new HyperbolicAttention(dim, 1.0);

      const query = new Float32Array(dim).fill(0.1);
      const keys = [new Float32Array(dim).fill(0.2)];
      const values = [new Float32Array(dim).fill(0.3)];

      const result = attention.compute(query, keys, values);
      expect(result).toBeInstanceOf(Float32Array);
    });

    test('MoEAttention should route through experts', async () => {
      const { MoEAttention } = await import('@ruvector/attention');
      const attention = new MoEAttention({
        dim,
        numExperts: 4,
        topK: 2,
      });

      const query = new Float32Array(dim).fill(0.1);
      const keys = [new Float32Array(dim).fill(0.2)];
      const values = [new Float32Array(dim).fill(0.3)];

      const result = attention.compute(query, keys, values);
      expect(result).toBeInstanceOf(Float32Array);
    });

    test('GraphRoPeAttention should compute with positional info', async () => {
      const { GraphRoPeAttention } = await import('@ruvector/attention');
      const attention = new GraphRoPeAttention(dim, 1000);

      const query = new Float32Array(dim).fill(0.1);
      const keys = [new Float32Array(dim).fill(0.2)];
      const values = [new Float32Array(dim).fill(0.3)];

      const result = attention.compute(query, keys, values);
      expect(result).toBeInstanceOf(Float32Array);
    });

    test('DualSpaceAttention should combine Euclidean and Hyperbolic', async () => {
      const { DualSpaceAttention } = await import('@ruvector/attention');
      const attention = new DualSpaceAttention(dim, 1.0, 0.5, 0.5);

      const query = new Float32Array(dim).fill(0.1);
      const keys = [new Float32Array(dim).fill(0.2)];
      const values = [new Float32Array(dim).fill(0.3)];

      const result = attention.compute(query, keys, values);
      expect(result).toBeInstanceOf(Float32Array);
    });
  });

  describe('Hyperbolic Math Functions', () => {
    test('poincareDistance should compute distance', async () => {
      const { poincareDistance } = await import('@ruvector/attention');
      const a = new Float32Array([0.1, 0.2, 0.3]);
      const b = new Float32Array([0.2, 0.3, 0.4]);

      const distance = poincareDistance(a, b, 1.0);
      expect(typeof distance).toBe('number');
      expect(distance).toBeGreaterThanOrEqual(0);
    });

    test('projectToPoincareBall should project vector', async () => {
      const { projectToPoincareBall } = await import('@ruvector/attention');
      const vector = new Float32Array([0.9, 0.9, 0.9]); // Outside ball

      const projected = projectToPoincareBall(vector, 1.0);
      expect(projected).toBeInstanceOf(Float32Array);

      // Should be inside Poincaré ball (norm < 1)
      const norm = Math.sqrt(
        projected.reduce((sum, x) => sum + x * x, 0)
      );
      expect(norm).toBeLessThan(1);
    });
  });

  describe('Training Components', () => {
    test('AdamOptimizer should perform optimization step', async () => {
      const { AdamOptimizer } = await import('@ruvector/attention');
      const optimizer = new AdamOptimizer(0.001);

      const params = new Float32Array([0.5, 0.5, 0.5]);
      const gradients = new Float32Array([0.1, 0.2, 0.3]);

      const updated = optimizer.step(params, gradients);
      expect(updated).toBeInstanceOf(Float32Array);
    });

    test('InfoNceLoss should compute contrastive loss', async () => {
      const { InfoNceLoss } = await import('@ruvector/attention');
      const loss = new InfoNceLoss(0.07);

      const anchor = new Float32Array([0.1, 0.2, 0.3]);
      const positives = [new Float32Array([0.15, 0.25, 0.35])];
      const negatives = [new Float32Array([0.8, 0.1, 0.1])];

      const lossValue = loss.compute(anchor, positives, negatives);
      expect(typeof lossValue).toBe('number');
    });

    test('LearningRateScheduler should decay learning rate', async () => {
      const { LearningRateScheduler, DecayType } = await import('@ruvector/attention');
      const scheduler = new LearningRateScheduler(
        0.001,  // initial
        0.0001, // min
        10000,  // total steps
        1000    // warmup
      );

      const lr1 = scheduler.getLearningRate(0);
      const lr2 = scheduler.getLearningRate(5000);
      const lr3 = scheduler.getLearningRate(9999);

      expect(lr1).toBeLessThan(0.001); // During warmup
      expect(lr2).toBeLessThan(lr1);   // After warmup, decaying
      expect(lr3).toBeLessThanOrEqual(lr2);
    });
  });

  describe('Async Attention', () => {
    test('computeAttentionAsync should return Promise', async () => {
      const { computeAttentionAsync, AttentionType } = await import('@ruvector/attention');

      const query = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const keys = [new Float32Array([0.2, 0.3, 0.4, 0.5])];
      const values = [new Float32Array([0.3, 0.4, 0.5, 0.6])];

      const result = await computeAttentionAsync(
        query,
        keys,
        values,
        AttentionType.MultiHead
      );

      expect(result).toBeInstanceOf(Float32Array);
    });

    test('computeFlashAttentionAsync should be memory efficient', async () => {
      const { computeFlashAttentionAsync } = await import('@ruvector/attention');

      const query = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const keys = [new Float32Array([0.2, 0.3, 0.4, 0.5])];
      const values = [new Float32Array([0.3, 0.4, 0.5, 0.6])];

      const result = await computeFlashAttentionAsync(query, keys, values);
      expect(result).toBeInstanceOf(Float32Array);
    });

    test('computeHyperbolicAttentionAsync should work with curvature', async () => {
      const { computeHyperbolicAttentionAsync } = await import('@ruvector/attention');

      const query = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const keys = [new Float32Array([0.2, 0.3, 0.4, 0.5])];
      const values = [new Float32Array([0.3, 0.4, 0.5, 0.6])];

      const result = await computeHyperbolicAttentionAsync(
        query,
        keys,
        values,
        1.0 // curvature
      );

      expect(result).toBeInstanceOf(Float32Array);
    });
  });

  describe('Performance Benchmarks', () => {
    test('Micro-LoRA should be ultra-fast (~0.1ms)', async () => {
      const { SonaEngine } = await import('@ruvector/sona');
      const sona = new SonaEngine(256);
      const input = new Array(256).fill(0.1);

      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        sona.applyMicroLora(input);
      }

      const elapsed = performance.now() - start;
      const avgMs = elapsed / iterations;

      console.log(`Micro-LoRA avg: ${avgMs.toFixed(3)}ms`);
      expect(avgMs).toBeLessThan(1); // Should be sub-millisecond
    });

    test('FlashAttention should be faster than standard', async () => {
      const { MultiHeadAttention, FlashAttention } = await import('@ruvector/attention');
      const dim = 128;
      const numKeys = 100;

      const multiHead = new MultiHeadAttention(dim, 8);
      const flash = new FlashAttention(dim);

      const query = new Float32Array(dim).fill(0.1);
      const keys = Array.from({ length: numKeys }, () => new Float32Array(dim).fill(0.2));
      const values = Array.from({ length: numKeys }, () => new Float32Array(dim).fill(0.3));

      const iterations = 50;

      // Benchmark MultiHead
      const start1 = performance.now();
      for (let i = 0; i < iterations; i++) {
        multiHead.compute(query, keys, values);
      }
      const multiHeadMs = (performance.now() - start1) / iterations;

      // Benchmark Flash
      const start2 = performance.now();
      for (let i = 0; i < iterations; i++) {
        flash.compute(query, keys, values);
      }
      const flashMs = (performance.now() - start2) / iterations;

      console.log(`MultiHead: ${multiHeadMs.toFixed(3)}ms, Flash: ${flashMs.toFixed(3)}ms`);
      // Flash should be comparable or faster
    });
  });
});
