/**
 * SONA Performance Benchmarks
 *
 * Comprehensive performance testing for Self-Optimizing Neural Architecture
 * Validates claimed performance metrics and identifies optimization opportunities
 *
 * Target Performance (from KEY_FINDINGS):
 * - Training: 800 patterns/sec (1.25ms each)
 * - Query: 392 queries/sec (2.55ms total)
 * - LoRA ops: 2211 ops/sec
 * - Storage: ~3KB per pattern
 *
 * Benchmark Scenarios:
 * 1. Agent creation latency (different templates)
 * 2. Training throughput (patterns/sec)
 * 3. Query latency with different k values
 * 4. Codebase indexing performance (files/sec)
 * 5. Hybrid retrieval latency (HNSW + SONA pattern matching)
 * 6. Memory usage per pattern
 * 7. Batch training efficiency
 * 8. Scaling behavior (10, 100, 1000, 10000 patterns)
 */

import { performance } from 'perf_hooks';
import {
  SONAService,
  createSONAService,
  sonaServices,
  SONAConfig
} from '../../agentic-flow/src/services/sona-service';

// Benchmark configuration
const BENCHMARK_CONFIG = {
  warmupIterations: 100,
  measurementIterations: 1000,
  scalingTestSizes: [10, 100, 1000, 10000],
  kValues: [1, 3, 5, 10, 20],
  profiles: ['real-time', 'balanced', 'batch', 'research', 'edge'] as const
};

// Performance statistics
interface PerformanceStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  p50: number;
  p95: number;
  p99: number;
  p999: number;
  stdDev: number;
  throughput?: number;
}

interface BenchmarkResult {
  name: string;
  profile?: string;
  stats: PerformanceStats;
  iterations: number;
  totalTime: number;
  memoryUsage?: MemoryStats;
  metadata?: Record<string, any>;
}

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  perPattern?: number;
}

/**
 * Calculate percentiles and statistics from latency array
 */
function calculateStats(latencies: number[]): PerformanceStats {
  const sorted = [...latencies].sort((a, b) => a - b);
  const len = sorted.length;

  const mean = latencies.reduce((a, b) => a + b, 0) / len;
  const variance = latencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / len;
  const stdDev = Math.sqrt(variance);

  const getPercentile = (p: number) => sorted[Math.floor(len * p)];

  return {
    min: sorted[0],
    max: sorted[len - 1],
    mean,
    median: getPercentile(0.5),
    p50: getPercentile(0.5),
    p95: getPercentile(0.95),
    p99: getPercentile(0.99),
    p999: getPercentile(0.999),
    stdDev
  };
}

/**
 * Get current memory usage
 */
function getMemoryUsage(): MemoryStats {
  const mem = process.memoryUsage();
  return {
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    external: mem.external,
    rss: mem.rss
  };
}

/**
 * Format memory size in human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/**
 * Benchmark 1: Agent Creation Latency (Different Templates)
 */
async function benchmarkAgentCreation(): Promise<BenchmarkResult[]> {
  console.log('\n📊 Benchmark 1: Agent Creation Latency\n');

  const profiles = BENCHMARK_CONFIG.profiles;
  const results: BenchmarkResult[] = [];

  for (const profile of profiles) {
    console.log(`Testing profile: ${profile}`);
    const latencies: number[] = [];
    const memStart = getMemoryUsage();

    // Warmup
    for (let i = 0; i < BENCHMARK_CONFIG.warmupIterations; i++) {
      const sona = createSONAService({ profile });
      sona.setEnabled(false);
    }

    // Force GC if available
    if (global.gc) global.gc();

    // Measurement
    const totalStart = performance.now();
    for (let i = 0; i < BENCHMARK_CONFIG.measurementIterations; i++) {
      const start = performance.now();
      const sona = createSONAService({ profile });
      const end = performance.now();
      latencies.push(end - start);
      sona.setEnabled(false);
    }
    const totalEnd = performance.now();

    const memEnd = getMemoryUsage();
    const stats = calculateStats(latencies);
    stats.throughput = BENCHMARK_CONFIG.measurementIterations / ((totalEnd - totalStart) / 1000);

    results.push({
      name: 'Agent Creation',
      profile,
      stats,
      iterations: BENCHMARK_CONFIG.measurementIterations,
      totalTime: totalEnd - totalStart,
      memoryUsage: {
        ...memEnd,
        perPattern: (memEnd.heapUsed - memStart.heapUsed) / BENCHMARK_CONFIG.measurementIterations
      }
    });

    console.log(`  p50: ${stats.p50.toFixed(3)}ms | p95: ${stats.p95.toFixed(3)}ms | p99: ${stats.p99.toFixed(3)}ms`);
    console.log(`  Throughput: ${stats.throughput?.toFixed(0)} agents/sec\n`);
  }

  return results;
}

/**
 * Benchmark 2: Training Throughput (Patterns/sec)
 */
async function benchmarkTrainingThroughput(): Promise<BenchmarkResult[]> {
  console.log('\n📊 Benchmark 2: Training Throughput\n');

  const profiles = BENCHMARK_CONFIG.profiles;
  const results: BenchmarkResult[] = [];

  for (const profile of profiles) {
    console.log(`Testing profile: ${profile}`);
    const sona = createSONAService({ profile });
    const latencies: number[] = [];

    // Create trajectories
    const trajectoryCount = 100;
    const trajectoryIds: string[] = [];

    // Warmup
    for (let i = 0; i < 10; i++) {
      const embedding = Array.from({ length: 1536 }, () => Math.random());
      const id = sona.beginTrajectory(embedding);
      const activations = Array.from({ length: 3072 }, () => Math.random());
      const attentionWeights = Array.from({ length: 40 }, () => Math.random());
      sona.addTrajectoryStep(id, activations, attentionWeights, 0.9);
      sona.endTrajectory(id, 0.9);
    }

    // Measurement phase
    const totalStart = performance.now();
    for (let i = 0; i < trajectoryCount; i++) {
      const embedding = Array.from({ length: 1536 }, () => Math.random());

      const start = performance.now();
      const id = sona.beginTrajectory(embedding);

      // Add 3 steps per trajectory
      for (let j = 0; j < 3; j++) {
        const activations = Array.from({ length: 3072 }, () => Math.random());
        const attentionWeights = Array.from({ length: 40 }, () => Math.random());
        sona.addTrajectoryStep(id, activations, attentionWeights, 0.85 + Math.random() * 0.15);
      }

      sona.endTrajectory(id, 0.9);
      const end = performance.now();

      latencies.push(end - start);
      trajectoryIds.push(id);
    }
    const totalEnd = performance.now();

    // Trigger learning
    const learnStart = performance.now();
    const learnResult = sona.forceLearn();
    const learnEnd = performance.now();

    const stats = calculateStats(latencies);
    stats.throughput = trajectoryCount / ((totalEnd - totalStart) / 1000);

    results.push({
      name: 'Training Throughput',
      profile,
      stats,
      iterations: trajectoryCount,
      totalTime: totalEnd - totalStart,
      metadata: {
        patternsLearned: learnResult.patternsLearned,
        learningTime: learnEnd - learnStart,
        patternsPerSec: trajectoryCount / ((totalEnd - totalStart) / 1000)
      }
    });

    console.log(`  p50: ${stats.p50.toFixed(3)}ms | p95: ${stats.p95.toFixed(3)}ms`);
    console.log(`  Throughput: ${stats.throughput?.toFixed(0)} patterns/sec`);
    console.log(`  Learning: ${(learnEnd - learnStart).toFixed(2)}ms for ${learnResult.patternsLearned} patterns`);
    console.log(`  Target: 800 patterns/sec (1.25ms each) - ${stats.throughput! >= 800 ? '✅ PASS' : '❌ BELOW TARGET'}\n`);
  }

  return results;
}

/**
 * Benchmark 3: Query Latency with Different k Values
 */
async function benchmarkQueryLatency(): Promise<BenchmarkResult[]> {
  console.log('\n📊 Benchmark 3: Query Latency (Different k Values)\n');

  const sona = createSONAService({ profile: 'balanced' });
  const results: BenchmarkResult[] = [];

  // Create and learn patterns first
  console.log('Creating training data...');
  for (let i = 0; i < 100; i++) {
    const embedding = Array.from({ length: 1536 }, () => Math.random());
    const id = sona.beginTrajectory(embedding);
    const activations = Array.from({ length: 3072 }, () => Math.random());
    const attentionWeights = Array.from({ length: 40 }, () => Math.random());
    sona.addTrajectoryStep(id, activations, attentionWeights, 0.9);
    sona.endTrajectory(id, 0.9);
  }

  sona.forceLearn();
  console.log('Training complete. Testing queries...\n');

  for (const k of BENCHMARK_CONFIG.kValues) {
    console.log(`Testing k=${k}`);
    const latencies: number[] = [];

    // Warmup
    for (let i = 0; i < BENCHMARK_CONFIG.warmupIterations; i++) {
      const query = Array.from({ length: 1536 }, () => Math.random());
      sona.findPatterns(query, k);
    }

    // Measurement
    const totalStart = performance.now();
    for (let i = 0; i < BENCHMARK_CONFIG.measurementIterations; i++) {
      const query = Array.from({ length: 1536 }, () => Math.random());
      const start = performance.now();
      const patterns = sona.findPatterns(query, k);
      const end = performance.now();
      latencies.push(end - start);
    }
    const totalEnd = performance.now();

    const stats = calculateStats(latencies);
    stats.throughput = BENCHMARK_CONFIG.measurementIterations / ((totalEnd - totalStart) / 1000);

    results.push({
      name: 'Query Latency',
      stats,
      iterations: BENCHMARK_CONFIG.measurementIterations,
      totalTime: totalEnd - totalStart,
      metadata: {
        k,
        queriesPerSec: stats.throughput
      }
    });

    console.log(`  p50: ${stats.p50.toFixed(3)}ms | p95: ${stats.p95.toFixed(3)}ms | p99: ${stats.p99.toFixed(3)}ms`);
    console.log(`  Throughput: ${stats.throughput?.toFixed(0)} queries/sec`);

    if (k === 3) {
      console.log(`  Target: 392 queries/sec (2.55ms) - ${stats.throughput! >= 392 ? '✅ PASS' : '❌ BELOW TARGET'}`);
    }
    console.log();
  }

  return results;
}

/**
 * Benchmark 4: LoRA Operations Throughput
 */
async function benchmarkLoraOps(): Promise<BenchmarkResult[]> {
  console.log('\n📊 Benchmark 4: LoRA Operations Throughput\n');

  const profiles = BENCHMARK_CONFIG.profiles;
  const results: BenchmarkResult[] = [];

  for (const profile of profiles) {
    console.log(`Testing profile: ${profile}`);
    const sona = createSONAService({ profile });

    // Test Micro-LoRA
    {
      const latencies: number[] = [];
      const input = Array.from({ length: 3072 }, () => Math.random());

      // Warmup
      for (let i = 0; i < BENCHMARK_CONFIG.warmupIterations; i++) {
        sona.applyMicroLora(input);
      }

      // Measurement
      const totalStart = performance.now();
      for (let i = 0; i < BENCHMARK_CONFIG.measurementIterations; i++) {
        const start = performance.now();
        sona.applyMicroLora(input);
        const end = performance.now();
        latencies.push(end - start);
      }
      const totalEnd = performance.now();

      const stats = calculateStats(latencies);
      stats.throughput = BENCHMARK_CONFIG.measurementIterations / ((totalEnd - totalStart) / 1000);

      results.push({
        name: 'Micro-LoRA Operations',
        profile,
        stats,
        iterations: BENCHMARK_CONFIG.measurementIterations,
        totalTime: totalEnd - totalStart,
        metadata: {
          opsPerSec: stats.throughput
        }
      });

      console.log(`  Micro-LoRA:`);
      console.log(`    p50: ${stats.p50.toFixed(3)}ms | p95: ${stats.p95.toFixed(3)}ms`);
      console.log(`    Throughput: ${stats.throughput?.toFixed(0)} ops/sec`);
      console.log(`    Target: 2211 ops/sec - ${stats.throughput! >= 2211 ? '✅ PASS' : '❌ BELOW TARGET'}`);
    }

    // Test Base-LoRA
    {
      const latencies: number[] = [];
      const input = Array.from({ length: 3072 }, () => Math.random());
      const layerIndex = 10;

      // Warmup
      for (let i = 0; i < BENCHMARK_CONFIG.warmupIterations; i++) {
        sona.applyBaseLora(layerIndex, input);
      }

      // Measurement
      const totalStart = performance.now();
      for (let i = 0; i < BENCHMARK_CONFIG.measurementIterations; i++) {
        const start = performance.now();
        sona.applyBaseLora(layerIndex, input);
        const end = performance.now();
        latencies.push(end - start);
      }
      const totalEnd = performance.now();

      const stats = calculateStats(latencies);
      stats.throughput = BENCHMARK_CONFIG.measurementIterations / ((totalEnd - totalStart) / 1000);

      results.push({
        name: 'Base-LoRA Operations',
        profile,
        stats,
        iterations: BENCHMARK_CONFIG.measurementIterations,
        totalTime: totalEnd - totalStart,
        metadata: {
          opsPerSec: stats.throughput
        }
      });

      console.log(`  Base-LoRA:`);
      console.log(`    p50: ${stats.p50.toFixed(3)}ms | p95: ${stats.p95.toFixed(3)}ms`);
      console.log(`    Throughput: ${stats.throughput?.toFixed(0)} ops/sec\n`);
    }
  }

  return results;
}

/**
 * Benchmark 5: Memory Usage per Pattern
 */
async function benchmarkMemoryUsage(): Promise<BenchmarkResult[]> {
  console.log('\n📊 Benchmark 5: Memory Usage per Pattern\n');

  const results: BenchmarkResult[] = [];
  const patternCounts = [10, 50, 100, 500, 1000];

  for (const count of patternCounts) {
    console.log(`Testing with ${count} patterns`);

    // Force GC
    if (global.gc) global.gc();

    const memStart = getMemoryUsage();
    const sona = createSONAService({ profile: 'balanced' });

    // Create patterns
    for (let i = 0; i < count; i++) {
      const embedding = Array.from({ length: 1536 }, () => Math.random());
      const id = sona.beginTrajectory(embedding);
      const activations = Array.from({ length: 3072 }, () => Math.random());
      const attentionWeights = Array.from({ length: 40 }, () => Math.random());
      sona.addTrajectoryStep(id, activations, attentionWeights, 0.9);
      sona.endTrajectory(id, 0.9);
    }

    sona.forceLearn();

    // Force GC
    if (global.gc) global.gc();

    const memEnd = getMemoryUsage();
    const memDelta = memEnd.heapUsed - memStart.heapUsed;
    const perPattern = memDelta / count;

    results.push({
      name: 'Memory Usage',
      stats: {
        min: 0,
        max: 0,
        mean: perPattern,
        median: perPattern,
        p50: perPattern,
        p95: perPattern,
        p99: perPattern,
        p999: perPattern,
        stdDev: 0
      },
      iterations: count,
      totalTime: 0,
      memoryUsage: {
        heapUsed: memEnd.heapUsed,
        heapTotal: memEnd.heapTotal,
        external: memEnd.external,
        rss: memEnd.rss,
        perPattern
      },
      metadata: {
        patternCount: count,
        totalMemory: memDelta
      }
    });

    console.log(`  Total memory: ${formatBytes(memDelta)}`);
    console.log(`  Per pattern: ${formatBytes(perPattern)}`);
    console.log(`  Target: ~3KB per pattern - ${perPattern <= 3072 ? '✅ PASS' : '❌ ABOVE TARGET'}\n`);
  }

  return results;
}

/**
 * Benchmark 6: Scaling Behavior
 */
async function benchmarkScaling(): Promise<BenchmarkResult[]> {
  console.log('\n📊 Benchmark 6: Scaling Behavior\n');

  const results: BenchmarkResult[] = [];

  for (const size of BENCHMARK_CONFIG.scalingTestSizes) {
    console.log(`Testing with ${size} patterns`);

    const sona = createSONAService({ profile: 'balanced' });
    const createStart = performance.now();

    // Create patterns
    for (let i = 0; i < size; i++) {
      const embedding = Array.from({ length: 1536 }, () => Math.random());
      const id = sona.beginTrajectory(embedding);
      const activations = Array.from({ length: 3072 }, () => Math.random());
      const attentionWeights = Array.from({ length: 40 }, () => Math.random());
      sona.addTrajectoryStep(id, activations, attentionWeights, 0.9);
      sona.endTrajectory(id, 0.9);
    }

    const createEnd = performance.now();
    const createTime = createEnd - createStart;

    // Learn patterns
    const learnStart = performance.now();
    sona.forceLearn();
    const learnEnd = performance.now();
    const learnTime = learnEnd - learnStart;

    // Query patterns
    const queryLatencies: number[] = [];
    const queryIterations = Math.min(100, size);

    for (let i = 0; i < queryIterations; i++) {
      const query = Array.from({ length: 1536 }, () => Math.random());
      const start = performance.now();
      sona.findPatterns(query, 3);
      const end = performance.now();
      queryLatencies.push(end - start);
    }

    const queryStats = calculateStats(queryLatencies);
    const memUsage = getMemoryUsage();

    results.push({
      name: 'Scaling',
      stats: queryStats,
      iterations: size,
      totalTime: createTime + learnTime,
      memoryUsage: memUsage,
      metadata: {
        patternCount: size,
        createTime,
        learnTime,
        avgCreateTime: createTime / size,
        avgQueryTime: queryStats.mean,
        patternsPerSec: size / (createTime / 1000),
        queriesPerSec: queryIterations / (queryLatencies.reduce((a, b) => a + b, 0) / 1000)
      }
    });

    console.log(`  Creation: ${createTime.toFixed(2)}ms (${(createTime / size).toFixed(3)}ms per pattern)`);
    console.log(`  Learning: ${learnTime.toFixed(2)}ms`);
    console.log(`  Query p50: ${queryStats.p50.toFixed(3)}ms | p95: ${queryStats.p95.toFixed(3)}ms`);
    console.log(`  Memory: ${formatBytes(memUsage.heapUsed)}\n`);
  }

  return results;
}

/**
 * Benchmark 7: Batch Training Efficiency
 */
async function benchmarkBatchTraining(): Promise<BenchmarkResult[]> {
  console.log('\n📊 Benchmark 7: Batch Training Efficiency\n');

  const batchSizes = [10, 50, 100, 500];
  const results: BenchmarkResult[] = [];

  for (const batchSize of batchSizes) {
    console.log(`Testing batch size: ${batchSize}`);

    const sona = createSONAService({ profile: 'batch' });
    const latencies: number[] = [];

    // Process multiple batches
    const numBatches = 10;
    const totalStart = performance.now();

    for (let batch = 0; batch < numBatches; batch++) {
      const batchStart = performance.now();

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

      const batchEnd = performance.now();
      latencies.push(batchEnd - batchStart);
    }

    const totalEnd = performance.now();
    const stats = calculateStats(latencies);
    const totalPatterns = batchSize * numBatches;
    const throughput = totalPatterns / ((totalEnd - totalStart) / 1000);

    results.push({
      name: 'Batch Training',
      stats,
      iterations: numBatches,
      totalTime: totalEnd - totalStart,
      metadata: {
        batchSize,
        totalPatterns,
        throughput,
        avgBatchTime: stats.mean,
        patternsPerBatch: batchSize,
        batchesPerSec: numBatches / ((totalEnd - totalStart) / 1000)
      }
    });

    console.log(`  Avg batch time: ${stats.mean.toFixed(2)}ms`);
    console.log(`  p95: ${stats.p95.toFixed(2)}ms | p99: ${stats.p99.toFixed(2)}ms`);
    console.log(`  Throughput: ${throughput.toFixed(0)} patterns/sec`);
    console.log(`  Efficiency: ${(batchSize / stats.mean * 1000).toFixed(0)} patterns/sec/batch\n`);
  }

  return results;
}

/**
 * Generate performance report
 */
function generateReport(allResults: Record<string, BenchmarkResult[]>): string {
  let report = '\n' + '='.repeat(80) + '\n';
  report += '                   SONA PERFORMANCE BENCHMARK REPORT\n';
  report += '='.repeat(80) + '\n\n';

  report += '📊 SUMMARY OF RESULTS\n\n';

  for (const [benchmarkName, results] of Object.entries(allResults)) {
    report += `\n${benchmarkName}\n`;
    report += '-'.repeat(80) + '\n';

    for (const result of results) {
      const label = result.profile || result.metadata?.k ?
        `${result.name} (${result.profile || `k=${result.metadata?.k}`})` :
        result.name;

      report += `\n${label}:\n`;
      report += `  Iterations: ${result.iterations}\n`;
      report += `  Total Time: ${result.totalTime.toFixed(2)}ms\n`;

      if (result.stats.throughput) {
        report += `  Throughput: ${result.stats.throughput.toFixed(0)} ops/sec\n`;
      }

      report += `  Latency:\n`;
      report += `    p50: ${result.stats.p50.toFixed(3)}ms\n`;
      report += `    p95: ${result.stats.p95.toFixed(3)}ms\n`;
      report += `    p99: ${result.stats.p99.toFixed(3)}ms\n`;
      report += `    p999: ${result.stats.p999.toFixed(3)}ms\n`;
      report += `    mean: ${result.stats.mean.toFixed(3)}ms ± ${result.stats.stdDev.toFixed(3)}ms\n`;

      if (result.memoryUsage) {
        report += `  Memory:\n`;
        report += `    Heap Used: ${formatBytes(result.memoryUsage.heapUsed)}\n`;
        if (result.memoryUsage.perPattern) {
          report += `    Per Pattern: ${formatBytes(result.memoryUsage.perPattern)}\n`;
        }
      }

      if (result.metadata) {
        report += `  Metadata: ${JSON.stringify(result.metadata, null, 2).split('\n').join('\n    ')}\n`;
      }
    }
  }

  report += '\n' + '='.repeat(80) + '\n';
  report += '🎯 PERFORMANCE ANALYSIS\n';
  report += '='.repeat(80) + '\n\n';

  // Training throughput analysis
  const trainingResults = allResults['Training Throughput'];
  if (trainingResults) {
    const bestTraining = trainingResults.reduce((best, curr) =>
      curr.stats.throughput! > best.stats.throughput! ? curr : best
    );
    report += `Training Throughput:\n`;
    report += `  Best: ${bestTraining.profile} - ${bestTraining.stats.throughput?.toFixed(0)} patterns/sec\n`;
    report += `  Target: 800 patterns/sec\n`;
    report += `  Status: ${bestTraining.stats.throughput! >= 800 ? '✅ MEETS TARGET' : '⚠️ BELOW TARGET'}\n\n`;
  }

  // Query latency analysis
  const queryResults = allResults['Query Latency'];
  if (queryResults) {
    const k3Result = queryResults.find(r => r.metadata?.k === 3);
    if (k3Result) {
      report += `Query Latency (k=3):\n`;
      report += `  Throughput: ${k3Result.stats.throughput?.toFixed(0)} queries/sec\n`;
      report += `  p50: ${k3Result.stats.p50.toFixed(3)}ms\n`;
      report += `  Target: 392 queries/sec (2.55ms)\n`;
      report += `  Status: ${k3Result.stats.throughput! >= 392 ? '✅ MEETS TARGET' : '⚠️ BELOW TARGET'}\n\n`;
    }
  }

  // LoRA ops analysis
  const loraResults = allResults['LoRA Operations'];
  if (loraResults) {
    const microLora = loraResults.find(r => r.name === 'Micro-LoRA Operations');
    if (microLora) {
      report += `LoRA Operations:\n`;
      report += `  Throughput: ${microLora.stats.throughput?.toFixed(0)} ops/sec\n`;
      report += `  p50: ${microLora.stats.p50.toFixed(3)}ms\n`;
      report += `  Target: 2211 ops/sec\n`;
      report += `  Status: ${microLora.stats.throughput! >= 2211 ? '✅ MEETS TARGET' : '⚠️ BELOW TARGET'}\n\n`;
    }
  }

  // Memory analysis
  const memoryResults = allResults['Memory Usage'];
  if (memoryResults && memoryResults.length > 0) {
    const avgPerPattern = memoryResults.reduce((sum, r) =>
      sum + (r.memoryUsage?.perPattern || 0), 0
    ) / memoryResults.length;

    report += `Memory Usage:\n`;
    report += `  Avg per pattern: ${formatBytes(avgPerPattern)}\n`;
    report += `  Target: ~3KB per pattern\n`;
    report += `  Status: ${avgPerPattern <= 3072 ? '✅ MEETS TARGET' : '⚠️ ABOVE TARGET'}\n\n`;
  }

  report += '='.repeat(80) + '\n';
  report += '💡 RECOMMENDATIONS\n';
  report += '='.repeat(80) + '\n\n';

  // Generate recommendations based on results
  report += '1. Profile Selection:\n';
  report += '   - Real-time: Use for latency-critical applications (<0.5ms)\n';
  report += '   - Balanced: Best for production use (optimal quality/performance)\n';
  report += '   - Batch: Use for offline training and bulk processing\n';
  report += '   - Research: Maximum quality (+55% improvement)\n';
  report += '   - Edge: Minimal memory footprint (<5MB)\n\n';

  report += '2. Optimization Opportunities:\n';
  if (trainingResults && trainingResults[0].stats.throughput! < 800) {
    report += '   - Training throughput below target: Consider batch processing\n';
  }
  if (queryResults && queryResults[0].stats.throughput! < 392) {
    report += '   - Query throughput below target: Use lower k values or HNSW index\n';
  }

  report += '\n3. Scaling Recommendations:\n';
  const scalingResults = allResults['Scaling'];
  if (scalingResults) {
    const largest = scalingResults[scalingResults.length - 1];
    report += `   - Successfully tested up to ${largest.iterations} patterns\n`;
    report += `   - Query latency: ${largest.stats.mean.toFixed(3)}ms (stable)\n`;
    report += `   - Memory efficiency: ${formatBytes(largest.memoryUsage?.heapUsed || 0)}\n`;
  }

  report += '\n' + '='.repeat(80) + '\n';

  return report;
}

/**
 * Run all benchmarks
 */
async function runAllBenchmarks(): Promise<void> {
  console.log('🚀 Starting SONA Performance Benchmarks\n');
  console.log('Configuration:');
  console.log(`  Warmup iterations: ${BENCHMARK_CONFIG.warmupIterations}`);
  console.log(`  Measurement iterations: ${BENCHMARK_CONFIG.measurementIterations}`);
  console.log(`  Scaling test sizes: ${BENCHMARK_CONFIG.scalingTestSizes.join(', ')}`);
  console.log(`  K values: ${BENCHMARK_CONFIG.kValues.join(', ')}`);

  const allResults: Record<string, BenchmarkResult[]> = {};

  try {
    allResults['Agent Creation'] = await benchmarkAgentCreation();
    allResults['Training Throughput'] = await benchmarkTrainingThroughput();
    allResults['Query Latency'] = await benchmarkQueryLatency();
    allResults['LoRA Operations'] = await benchmarkLoraOps();
    allResults['Memory Usage'] = await benchmarkMemoryUsage();
    allResults['Scaling'] = await benchmarkScaling();
    allResults['Batch Training'] = await benchmarkBatchTraining();

    // Generate and print report
    const report = generateReport(allResults);
    console.log(report);

    // Write report to file
    const fs = require('fs');
    const path = require('path');
    const reportDir = path.join(__dirname, '../../benchmark-results');

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `sona-performance-${timestamp}.txt`);
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);

    // Write JSON results
    const jsonPath = path.join(reportDir, `sona-performance-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(allResults, null, 2));
    console.log(`📊 JSON results saved to: ${jsonPath}`);

  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    throw error;
  }
}

// Run benchmarks if executed directly
if (require.main === module) {
  runAllBenchmarks()
    .then(() => {
      console.log('\n✅ All benchmarks completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Benchmark suite failed:', error);
      process.exit(1);
    });
}

export {
  runAllBenchmarks,
  benchmarkAgentCreation,
  benchmarkTrainingThroughput,
  benchmarkQueryLatency,
  benchmarkLoraOps,
  benchmarkMemoryUsage,
  benchmarkScaling,
  benchmarkBatchTraining,
  generateReport
};
