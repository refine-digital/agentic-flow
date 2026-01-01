/**
 * Quick validation test for SONA benchmarks
 *
 * Ensures benchmarks can run without errors
 * Does NOT run full benchmark suite (use npm run bench:sona for that)
 */

import { describe, it, expect } from '@jest/globals';
import { createSONAService } from '../../agentic-flow/src/services/sona-service';

describe('SONA Benchmark Validation', () => {
  it('should create SONA service instances', () => {
    const profiles = ['real-time', 'balanced', 'batch', 'research', 'edge'] as const;

    for (const profile of profiles) {
      const sona = createSONAService({ profile });
      expect(sona).toBeDefined();
      expect(sona.isEnabled()).toBe(true);

      const stats = sona.getStats();
      expect(stats.config.microLoraRank).toBeGreaterThan(0);
    }
  });

  it('should measure agent creation latency', () => {
    const start = performance.now();
    const sona = createSONAService({ profile: 'balanced' });
    const end = performance.now();

    const latency = end - start;
    expect(latency).toBeLessThan(100); // Should be fast
    expect(sona).toBeDefined();
  });

  it('should measure training throughput', () => {
    const sona = createSONAService({ profile: 'balanced' });
    const iterations = 10; // Small test

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const embedding = Array.from({ length: 1536 }, () => Math.random());
      const id = sona.beginTrajectory(embedding);
      const activations = Array.from({ length: 3072 }, () => Math.random());
      const attentionWeights = Array.from({ length: 40 }, () => Math.random());
      sona.addTrajectoryStep(id, activations, attentionWeights, 0.9);
      sona.endTrajectory(id, 0.9);
    }

    const end = performance.now();
    const duration = (end - start) / 1000; // seconds
    const throughput = iterations / duration;

    expect(throughput).toBeGreaterThan(0);
    expect(duration).toBeLessThan(5000); // Should complete quickly
  });

  it('should measure query latency', () => {
    const sona = createSONAService({ profile: 'balanced' });

    // Create some patterns
    for (let i = 0; i < 10; i++) {
      const embedding = Array.from({ length: 1536 }, () => Math.random());
      const id = sona.beginTrajectory(embedding);
      const activations = Array.from({ length: 3072 }, () => Math.random());
      const attentionWeights = Array.from({ length: 40 }, () => Math.random());
      sona.addTrajectoryStep(id, activations, attentionWeights, 0.9);
      sona.endTrajectory(id, 0.9);
    }

    sona.forceLearn();

    // Query
    const query = Array.from({ length: 1536 }, () => Math.random());
    const start = performance.now();
    const patterns = sona.findPatterns(query, 3);
    const end = performance.now();

    const latency = end - start;
    expect(latency).toBeLessThan(100); // Should be fast
    expect(Array.isArray(patterns)).toBe(true);
  });

  it('should measure LoRA operations', () => {
    const sona = createSONAService({ profile: 'balanced' });
    const input = Array.from({ length: 3072 }, () => Math.random());

    // Micro-LoRA
    const microStart = performance.now();
    const microOutput = sona.applyMicroLora(input);
    const microEnd = performance.now();

    expect(microOutput).toHaveLength(3072);
    expect(microEnd - microStart).toBeLessThan(10); // Should be very fast

    // Base-LoRA
    const baseStart = performance.now();
    const baseOutput = sona.applyBaseLora(10, input);
    const baseEnd = performance.now();

    expect(baseOutput).toHaveLength(3072);
    expect(baseEnd - baseStart).toBeLessThan(10); // Should be very fast
  });

  it('should measure memory usage', () => {
    const memStart = process.memoryUsage();

    const sona = createSONAService({ profile: 'balanced' });

    // Create patterns
    for (let i = 0; i < 50; i++) {
      const embedding = Array.from({ length: 1536 }, () => Math.random());
      const id = sona.beginTrajectory(embedding);
      const activations = Array.from({ length: 3072 }, () => Math.random());
      const attentionWeights = Array.from({ length: 40 }, () => Math.random());
      sona.addTrajectoryStep(id, activations, attentionWeights, 0.9);
      sona.endTrajectory(id, 0.9);
    }

    sona.forceLearn();

    const memEnd = process.memoryUsage();
    const memDelta = memEnd.heapUsed - memStart.heapUsed;
    const perPattern = memDelta / 50;

    expect(memDelta).toBeGreaterThan(0);
    expect(perPattern).toBeLessThan(1024 * 1024); // Less than 1MB per pattern
  });

  it('should validate scaling behavior', () => {
    const sizes = [5, 10, 20];
    const latencies: number[] = [];

    for (const size of sizes) {
      const sona = createSONAService({ profile: 'balanced' });

      const start = performance.now();

      for (let i = 0; i < size; i++) {
        const embedding = Array.from({ length: 1536 }, () => Math.random());
        const id = sona.beginTrajectory(embedding);
        const activations = Array.from({ length: 3072 }, () => Math.random());
        const attentionWeights = Array.from({ length: 40 }, () => Math.random());
        sona.addTrajectoryStep(id, activations, attentionWeights, 0.9);
        sona.endTrajectory(id, 0.9);
      }

      sona.forceLearn();

      const end = performance.now();
      latencies.push(end - start);
    }

    // Check that scaling is reasonable (not exponential)
    expect(latencies[0]).toBeLessThan(1000);
    expect(latencies[1]).toBeLessThan(2000);
    expect(latencies[2]).toBeLessThan(4000);
  });

  it('should validate batch training', () => {
    const sona = createSONAService({ profile: 'batch' });
    const batchSize = 10;

    const start = performance.now();

    // Create batch
    for (let i = 0; i < batchSize; i++) {
      const embedding = Array.from({ length: 1536 }, () => Math.random());
      const id = sona.beginTrajectory(embedding);
      const activations = Array.from({ length: 3072 }, () => Math.random());
      const attentionWeights = Array.from({ length: 40 }, () => Math.random());
      sona.addTrajectoryStep(id, activations, attentionWeights, 0.9);
      sona.endTrajectory(id, 0.9);
    }

    // Learn batch
    sona.forceLearn();

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(1000);
    expect(sona.getStats().completedTrajectories).toBe(batchSize);
  });
});
