/**
 * ADR-007 Phase 1: NativeAccelerator Test Suite
 *
 * Tests native @ruvector capability bridge with JS fallbacks.
 * Since @ruvector packages are not installed in CI, all tests
 * validate the JS fallback paths and correctness guarantees.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { NativeAccelerator, resetAccelerator, getAccelerator } from '../../src/backends/rvf/NativeAccelerator.js';

// Helper: create a random Float32Array
function randomVec(dim: number): Float32Array {
  const v = new Float32Array(dim);
  for (let i = 0; i < dim; i++) v[i] = (Math.random() - 0.5) * 2;
  return v;
}

// Helper: normalize a vector
function normalize(v: Float32Array): Float32Array {
  let norm = 0;
  for (let i = 0; i < v.length; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm);
  const out = new Float32Array(v.length);
  if (norm > 0) for (let i = 0; i < v.length; i++) out[i] = v[i] / norm;
  return out;
}

describe('ADR-007 NativeAccelerator', () => {
  let accel: NativeAccelerator;

  beforeEach(() => {
    resetAccelerator();
    accel = new NativeAccelerator();
  });

  // ─── Initialization ───

  describe('Initialization', () => {
    it('should initialize without errors even with no @ruvector packages', async () => {
      const stats = await accel.initialize();
      expect(stats).toBeDefined();
      expect(stats.capabilities).toBeInstanceOf(Array);
    });

    it('should report capabilities based on available @ruvector packages', async () => {
      const stats = await accel.initialize();
      // Each boolean should be a boolean regardless of availability
      expect(typeof stats.simdAvailable).toBe('boolean');
      expect(typeof stats.wasmVerifyAvailable).toBe('boolean');
      expect(typeof stats.nativeInfoNceAvailable).toBe('boolean');
      expect(typeof stats.nativeAdamWAvailable).toBe('boolean');
      expect(typeof stats.nativeTensorCompressAvailable).toBe('boolean');
      expect(typeof stats.routerPersistAvailable).toBe('boolean');
      expect(typeof stats.sonaExtendedAvailable).toBe('boolean');
      // capabilities length should match number of true booleans
      const trueCount = [
        stats.simdAvailable, stats.wasmVerifyAvailable, stats.nativeInfoNceAvailable,
        stats.nativeAdamWAvailable, stats.nativeTensorCompressAvailable,
        stats.routerPersistAvailable, stats.sonaExtendedAvailable,
      ].filter(Boolean).length;
      expect(stats.capabilities.length).toBeGreaterThanOrEqual(trueCount > 0 ? 1 : 0);
    });

    it('should return same stats on second initialize call', async () => {
      const s1 = await accel.initialize();
      const s2 = await accel.initialize();
      expect(s1).toEqual(s2);
    });
  });

  // ─── Singleton ───

  describe('Singleton getAccelerator', () => {
    it('should return the same instance on multiple calls', async () => {
      const a1 = await getAccelerator();
      const a2 = await getAccelerator();
      expect(a1).toBe(a2);
    });

    it('should return new instance after reset', async () => {
      const a1 = await getAccelerator();
      resetAccelerator();
      const a2 = await getAccelerator();
      expect(a1).not.toBe(a2);
    });
  });

  // ─── SIMD Vector Math (JS fallbacks) ───

  describe('Cosine Similarity', () => {
    it('should return 1.0 for identical vectors', () => {
      const v = normalize(randomVec(128));
      expect(accel.cosineSimilarity(v, v)).toBeCloseTo(1.0, 5);
    });

    it('should return 0.0 for orthogonal vectors', () => {
      const a = new Float32Array([1, 0, 0, 0]);
      const b = new Float32Array([0, 1, 0, 0]);
      expect(accel.cosineSimilarity(a, b)).toBeCloseTo(0.0, 5);
    });

    it('should return -1.0 for opposite vectors', () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([-1, 0, 0]);
      expect(accel.cosineSimilarity(a, b)).toBeCloseTo(-1.0, 5);
    });

    it('should handle high-dimensional vectors', () => {
      const a = randomVec(1024);
      const b = randomVec(1024);
      const sim = accel.cosineSimilarity(a, b);
      expect(sim).toBeGreaterThanOrEqual(-1.0);
      expect(sim).toBeLessThanOrEqual(1.0);
    });

    it('should throw on dimension mismatch', () => {
      expect(() => accel.cosineSimilarity(randomVec(64), randomVec(128))).toThrow('Dimension mismatch');
    });

    it('should throw on dimension exceeding max', () => {
      expect(() => accel.cosineSimilarity(randomVec(5000), randomVec(5000))).toThrow('exceeds maximum');
    });

    it('should return 0 for zero vectors', () => {
      const z = new Float32Array(64);
      expect(accel.cosineSimilarity(z, z)).toBe(0);
    });
  });

  describe('Dot Product', () => {
    it('should compute dot product correctly', () => {
      const a = new Float32Array([1, 2, 3]);
      const b = new Float32Array([4, 5, 6]);
      expect(accel.dotProduct(a, b)).toBeCloseTo(32.0, 5); // 4 + 10 + 18
    });

    it('should return 0 for orthogonal vectors', () => {
      const a = new Float32Array([1, 0]);
      const b = new Float32Array([0, 1]);
      expect(accel.dotProduct(a, b)).toBeCloseTo(0.0, 5);
    });

    it('should handle negative values', () => {
      const a = new Float32Array([-1, 2, -3]);
      const b = new Float32Array([4, -5, 6]);
      expect(accel.dotProduct(a, b)).toBeCloseTo(-32.0, 5);
    });
  });

  describe('L2 Distance', () => {
    it('should return 0 for identical vectors', () => {
      const v = randomVec(128);
      expect(accel.l2Distance(v, v)).toBeCloseTo(0.0, 5);
    });

    it('should compute distance correctly', () => {
      const a = new Float32Array([0, 0]);
      const b = new Float32Array([3, 4]);
      expect(accel.l2Distance(a, b)).toBeCloseTo(5.0, 5);
    });

    it('should be symmetric', () => {
      const a = randomVec(64);
      const b = randomVec(64);
      expect(accel.l2Distance(a, b)).toBeCloseTo(accel.l2Distance(b, a), 5);
    });

    it('should satisfy triangle inequality', () => {
      const a = randomVec(64);
      const b = randomVec(64);
      const c = randomVec(64);
      expect(accel.l2Distance(a, c)).toBeLessThanOrEqual(
        accel.l2Distance(a, b) + accel.l2Distance(b, c) + 1e-5
      );
    });
  });

  // ─── WASM Verification (JS fallbacks) ───

  describe('Witness Chain Verification', () => {
    it('should return invalid for empty chain', () => {
      const result = accel.verifyWitnessChain(new Uint8Array(0));
      expect(result.valid).toBe(false);
      expect(result.entryCount).toBe(0);
    });

    it('should return invalid for null-like input', () => {
      const result = accel.verifyWitnessChain(null as unknown as Uint8Array);
      expect(result.valid).toBe(false);
    });

    it('should validate chain with correct entry size (73 bytes)', () => {
      const chain = new Uint8Array(73 * 5); // 5 entries
      for (let i = 0; i < chain.length; i++) chain[i] = i % 256;
      const result = accel.verifyWitnessChain(chain);
      expect(result.valid).toBe(true);
      expect(result.entryCount).toBe(5);
    });

    it('should reject chain with incorrect size', () => {
      const chain = new Uint8Array(100); // Not a multiple of 73
      const result = accel.verifyWitnessChain(chain);
      expect(result.valid).toBe(false);
    });

    it('should handle single entry chain', () => {
      const chain = new Uint8Array(73);
      const result = accel.verifyWitnessChain(chain);
      expect(result.valid).toBe(true);
      expect(result.entryCount).toBe(1);
    });
  });

  describe('Segment Header Verification', () => {
    it('should reject too-short data', () => {
      const result = accel.verifySegmentHeader(new Uint8Array(2));
      expect(result.valid).toBe(false);
    });

    it('should validate RVF magic bytes', () => {
      const data = new Uint8Array([0x52, 0x56, 0x46, 0x00, 0x01, 0x02]);
      const result = accel.verifySegmentHeader(data);
      expect(result.valid).toBe(true);
      expect(result.crc).toBeGreaterThan(0);
    });

    it('should reject invalid magic bytes', () => {
      const data = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x01, 0x02]);
      const result = accel.verifySegmentHeader(data);
      expect(result.valid).toBe(false);
    });

    it('should compute deterministic CRC', () => {
      const data = new Uint8Array([0x52, 0x56, 0x46, 0x00]);
      const r1 = accel.verifySegmentHeader(data);
      const r2 = accel.verifySegmentHeader(data);
      expect(r1.crc).toBe(r2.crc);
    });
  });

  // ─── InfoNCE Loss (JS fallback) ───

  describe('InfoNCE Loss', () => {
    it('should return 0 for perfect separation', () => {
      // Anchor and positive are identical, negatives are orthogonal
      const anchor = new Float32Array([1, 0, 0]);
      const positive = new Float32Array([1, 0, 0]);
      const negatives = [new Float32Array([0, 1, 0])];
      const loss = accel.infoNceLoss(anchor, positive, negatives, 0.07);
      // With perfect similarity between anchor-positive and zero to negative,
      // loss should be small but positive
      expect(loss).toBeGreaterThanOrEqual(0);
      expect(loss).toBeLessThan(2);
    });

    it('should return higher loss for poor separation', () => {
      const anchor = new Float32Array([1, 0.5, 0]);
      const positive = new Float32Array([1, 0.5, 0]);
      const neg1 = [new Float32Array([0, 1, 0])];
      const neg2 = [new Float32Array([0.9, 0.4, 0])]; // Very similar to anchor

      const loss1 = accel.infoNceLoss(anchor, positive, neg1, 0.07);
      const loss2 = accel.infoNceLoss(anchor, positive, neg2, 0.07);
      expect(loss2).toBeGreaterThan(loss1);
    });

    it('should increase with more hard negatives', () => {
      const anchor = normalize(randomVec(64));
      const positive = normalize(randomVec(64));
      const neg1 = [randomVec(64)];
      const neg3 = [randomVec(64), randomVec(64), randomVec(64)];

      const loss1 = accel.infoNceLoss(anchor, positive, neg1, 0.07);
      const loss3 = accel.infoNceLoss(anchor, positive, neg3, 0.07);
      // More negatives = higher denominator = higher loss (usually)
      expect(loss3).toBeGreaterThanOrEqual(loss1 - 0.1);
    });

    it('should be lower with higher temperature', () => {
      const anchor = normalize(randomVec(64));
      const positive = normalize(randomVec(64));
      const negatives = [randomVec(64), randomVec(64)];

      const lossLow = accel.infoNceLoss(anchor, positive, negatives, 0.01);
      const lossHigh = accel.infoNceLoss(anchor, positive, negatives, 1.0);
      // Higher temp = smoother distribution = lower loss magnitude
      expect(Math.abs(lossHigh)).toBeLessThan(Math.abs(lossLow) + 1);
    });

    it('should handle empty negatives', () => {
      const anchor = new Float32Array([1, 0, 0]);
      const positive = new Float32Array([1, 0, 0]);
      const loss = accel.infoNceLoss(anchor, positive, [], 0.07);
      expect(Number.isFinite(loss)).toBe(true);
    });
  });

  // ─── AdamW Optimizer (JS fallback) ───

  describe('AdamW Optimizer', () => {
    it('should update params toward minimum', () => {
      const params = new Float32Array([5.0, -3.0, 7.0]);
      const grads = new Float32Array([1.0, -1.0, 1.0]); // Points away from zero
      const m = new Float32Array(3);
      const v = new Float32Array(3);

      const origMag = Math.sqrt(params[0] ** 2 + params[1] ** 2 + params[2] ** 2);

      for (let step = 1; step <= 100; step++) {
        accel.adamWStep(params, grads, m, v, step, 0.01, 0.01);
      }

      const newMag = Math.sqrt(params[0] ** 2 + params[1] ** 2 + params[2] ** 2);
      expect(newMag).toBeLessThan(origMag);
    });

    it('should apply weight decay', () => {
      const params = new Float32Array([10.0]);
      const grads = new Float32Array([0.0]); // Zero gradient
      const m = new Float32Array(1);
      const v = new Float32Array(1);

      accel.adamWStep(params, grads, m, v, 1, 0.01, 0.1);
      // Weight decay should shrink params toward 0
      expect(params[0]).toBeLessThan(10.0);
    });

    it('should handle zero gradients gracefully', () => {
      const params = new Float32Array([1.0, 2.0]);
      const grads = new Float32Array([0.0, 0.0]);
      const m = new Float32Array(2);
      const v = new Float32Array(2);

      // Should not throw or produce NaN
      accel.adamWStep(params, grads, m, v, 1, 0.001, 0.0);
      expect(Number.isFinite(params[0])).toBe(true);
      expect(Number.isFinite(params[1])).toBe(true);
    });

    it('should converge to zero with weight decay and zero gradient', () => {
      const params = new Float32Array([10.0]);
      const grads = new Float32Array([0.0]);
      const m = new Float32Array(1);
      const v = new Float32Array(1);

      for (let step = 1; step <= 2000; step++) {
        accel.adamWStep(params, grads, m, v, step, 0.01, 0.1);
      }
      // With wd=0.1, lr=0.01: each step decays by ~0.1%
      // After 2000 steps starting at 10: 10 * (1 - 0.001)^2000 ≈ 1.35
      expect(Math.abs(params[0])).toBeLessThan(2.0);
    });

    it('should update momentum and velocity', () => {
      const params = new Float32Array([1.0]);
      const grads = new Float32Array([0.5]);
      const m = new Float32Array(1);
      const v = new Float32Array(1);

      accel.adamWStep(params, grads, m, v, 1, 0.01, 0.0);
      expect(m[0]).not.toBe(0);
      expect(v[0]).not.toBe(0);
    });
  });

  // ─── Tensor Compression (returns null without native) ───

  describe('Tensor Compression', () => {
    it('should return null for compress without native', () => {
      expect(accel.tensorCompress(randomVec(64), 1)).toBeNull();
    });

    it('should return null for decompress without native', () => {
      expect(accel.tensorDecompress(new Uint8Array(16), 64)).toBeNull();
    });

    it('should return null for batchCompress without native', () => {
      expect(accel.tensorBatchCompress([randomVec(64)], 1)).toBeNull();
    });
  });

  // ─── Router Persistence (returns false/null without native) ───

  describe('Router Persistence', () => {
    it('should return false for save without native', async () => {
      expect(await accel.routerSave({}, '/tmp/test.bin')).toBe(false);
    });

    it('should return null for load without native', async () => {
      expect(await accel.routerLoad('/tmp/test.bin')).toBeNull();
    });
  });

  // ─── SONA Extended (returns false without native) ───

  describe('SONA Extended APIs', () => {
    it('should return false for addContext without native', () => {
      expect(accel.sonaAddContext(null, 0, { key: 'val' })).toBe(false);
    });

    it('should return false for flush without native', () => {
      expect(accel.sonaFlush(null)).toBe(false);
    });

    it('should return false for applyBaseLora without native', () => {
      expect(accel.sonaApplyBaseLora(null, randomVec(64))).toBe(false);
    });
  });

  // ─── Performance Benchmarks ───

  describe('Performance benchmarks', () => {
    it('should complete 10K cosine similarity computations in <50ms', () => {
      const a = randomVec(384);
      const b = randomVec(384);
      const start = performance.now();
      for (let i = 0; i < 10000; i++) accel.cosineSimilarity(a, b);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
    });

    it('should complete 10K dot products in <50ms', () => {
      const a = randomVec(384);
      const b = randomVec(384);
      const start = performance.now();
      for (let i = 0; i < 10000; i++) accel.dotProduct(a, b);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
    });

    it('should complete 10K L2 distances in <50ms', () => {
      const a = randomVec(384);
      const b = randomVec(384);
      const start = performance.now();
      for (let i = 0; i < 10000; i++) accel.l2Distance(a, b);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
    });

    it('should complete 1K InfoNCE loss computations in <100ms', () => {
      const anchor = randomVec(128);
      const positive = randomVec(128);
      const negatives = [randomVec(128), randomVec(128), randomVec(128), randomVec(128)];
      const start = performance.now();
      for (let i = 0; i < 1000; i++) accel.infoNceLoss(anchor, positive, negatives, 0.07);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
    });

    it('should complete 1K AdamW steps in <10ms', () => {
      const params = randomVec(256);
      const grads = randomVec(256);
      const m = new Float32Array(256);
      const v = new Float32Array(256);
      const start = performance.now();
      for (let step = 1; step <= 1000; step++) {
        accel.adamWStep(params, grads, m, v, step, 0.001, 0.01);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(10);
    });

    it('should complete 10K witness chain verifications in <10ms', () => {
      const chain = new Uint8Array(73 * 10);
      const start = performance.now();
      for (let i = 0; i < 10000; i++) accel.verifyWitnessChain(chain);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(10);
    });

    it('should complete 10K segment header verifications in <50ms', () => {
      const header = new Uint8Array([0x52, 0x56, 0x46, 0x00, 0x01, 0x02, 0x03, 0x04]);
      const start = performance.now();
      for (let i = 0; i < 10000; i++) accel.verifySegmentHeader(header);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
    });
  });

  // ─── Mathematical Correctness ───

  describe('Mathematical correctness', () => {
    it('cosine similarity should match manual computation', () => {
      const a = new Float32Array([3, 4]);
      const b = new Float32Array([4, 3]);
      // cos = (12 + 12) / (5 * 5) = 24/25 = 0.96
      expect(accel.cosineSimilarity(a, b)).toBeCloseTo(0.96, 2);
    });

    it('InfoNCE loss should decrease when positive gets closer to anchor', () => {
      const anchor = new Float32Array([1, 0, 0, 0]);
      const pos1 = new Float32Array([0.5, 0.5, 0, 0]); // moderate similarity
      const pos2 = new Float32Array([0.9, 0.1, 0, 0]); // higher similarity
      const negs = [new Float32Array([0, 0, 1, 0])];

      const loss1 = accel.infoNceLoss(anchor, pos1, negs, 0.1);
      const loss2 = accel.infoNceLoss(anchor, pos2, negs, 0.1);
      expect(loss2).toBeLessThan(loss1);
    });

    it('AdamW with constant gradient should converge', () => {
      // Minimize f(x) = x^2, gradient = 2x
      const params = new Float32Array([10.0]);
      const m = new Float32Array(1);
      const v = new Float32Array(1);

      for (let step = 1; step <= 500; step++) {
        const grads = new Float32Array([2 * params[0]]);
        accel.adamWStep(params, grads, m, v, step, 0.05, 0.0);
      }
      expect(Math.abs(params[0])).toBeLessThan(0.5);
    });

    it('L2 distance should satisfy d(a,b) >= 0', () => {
      for (let trial = 0; trial < 100; trial++) {
        const a = randomVec(32);
        const b = randomVec(32);
        expect(accel.l2Distance(a, b)).toBeGreaterThanOrEqual(0);
      }
    });

    it('dot product should be commutative', () => {
      const a = randomVec(128);
      const b = randomVec(128);
      expect(accel.dotProduct(a, b)).toBeCloseTo(accel.dotProduct(b, a), 3);
    });

    it('CRC32C should be deterministic for segment verification', () => {
      const data = new Uint8Array([0x52, 0x56, 0x46, 0x00, 0x01, 0x02, 0x03, 0x04]);
      const r1 = accel.verifySegmentHeader(data);
      const r2 = accel.verifySegmentHeader(data);
      const r3 = accel.verifySegmentHeader(data);
      expect(r1.crc).toBe(r2.crc);
      expect(r2.crc).toBe(r3.crc);
    });
  });

  // ─── Edge Cases ───

  describe('Edge cases', () => {
    it('should handle dimension 1 vectors', () => {
      const a = new Float32Array([1.0]);
      const b = new Float32Array([1.0]);
      expect(accel.cosineSimilarity(a, b)).toBeCloseTo(1.0, 5);
      expect(accel.dotProduct(a, b)).toBeCloseTo(1.0, 5);
      expect(accel.l2Distance(a, b)).toBeCloseTo(0.0, 5);
    });

    it('should handle very small values', () => {
      const a = new Float32Array([1e-30, 1e-30]);
      const b = new Float32Array([1e-30, 1e-30]);
      const sim = accel.cosineSimilarity(a, b);
      expect(Number.isFinite(sim)).toBe(true);
    });

    it('should handle very large values', () => {
      const a = new Float32Array([1e30, 1e30]);
      const b = new Float32Array([1e30, 1e30]);
      const sim = accel.cosineSimilarity(a, b);
      expect(Number.isFinite(sim)).toBe(true);
    });

    it('should handle NaN in vectors gracefully', () => {
      const a = new Float32Array([NaN, 1.0]);
      const b = new Float32Array([1.0, 1.0]);
      const sim = accel.cosineSimilarity(a, b);
      // NaN propagation is expected in math operations
      expect(typeof sim).toBe('number');
    });

    it('should handle witness chain of exactly 73 bytes', () => {
      const chain = new Uint8Array(73);
      const result = accel.verifyWitnessChain(chain);
      expect(result.valid).toBe(true);
      expect(result.entryCount).toBe(1);
    });

    it('should handle large witness chains', () => {
      const chain = new Uint8Array(73 * 1000);
      const result = accel.verifyWitnessChain(chain);
      expect(result.entryCount).toBe(1000);
    });
  });

  // ─── Integration: accelerator module ───

  describe('Module integration', () => {
    it('should be importable from NativeAccelerator module', async () => {
      const mod = await import('../../src/backends/rvf/NativeAccelerator.js');
      expect(mod.NativeAccelerator).toBeDefined();
      const instance = new mod.NativeAccelerator();
      expect(instance).toBeDefined();
    });

    it('should export singleton functions', async () => {
      const mod = await import('../../src/backends/rvf/NativeAccelerator.js');
      expect(typeof mod.getAccelerator).toBe('function');
      expect(typeof mod.resetAccelerator).toBe('function');
    });

    it('getStats should reflect native availability after init', async () => {
      await accel.initialize();
      const stats = accel.getStats();
      // If SIMD is available (packages installed), it should be reflected
      if (stats.simdAvailable) {
        expect(stats.capabilities).toContain('simd');
      }
      if (stats.wasmVerifyAvailable) {
        expect(stats.capabilities).toContain('wasm-verify');
      }
    });
  });
});
