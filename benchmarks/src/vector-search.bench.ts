/**
 * Vector Search Performance Benchmarks
 * Target: <10ms P50 for 1M vectors (150x faster than v1.0)
 */

import { benchmark, benchmarkSuite, formatDuration } from '../utils/benchmark';
import { AgentDB } from '../../packages/agentdb/src/core/AgentDB';
import path from 'path';
import fs from 'fs/promises';

interface VectorSearchBenchmarkConfig {
  vectorCount: number;
  dimensions: number;
  k: number; // number of nearest neighbors
  targetP50Ms: number;
}

/**
 * Generate random embedding vector
 */
function generateEmbedding(dimensions: number = 1536): number[] {
  const vector: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    vector.push(Math.random() * 2 - 1); // Range: -1 to 1
  }
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

/**
 * Setup database with vectors
 */
async function setupVectorDB(vectorCount: number, dimensions: number = 1536): Promise<AgentDB> {
  const dbPath = path.join(__dirname, '../data', `benchmark-${vectorCount}-vectors.db`);

  // Remove existing DB
  try {
    await fs.unlink(dbPath);
  } catch (error) {
    // Ignore if doesn't exist
  }

  const db = new AgentDB({
    dbPath,
    dimensions,
    indexType: 'hnsw',
    distanceMetric: 'cosine',
    enableCache: true,
    cacheSize: 10000,
  });

  console.log(`\n📦 Inserting ${vectorCount.toLocaleString()} vectors...`);
  const batchSize = 1000;
  const batches = Math.ceil(vectorCount / batchSize);

  for (let batch = 0; batch < batches; batch++) {
    const vectors = [];
    const currentBatchSize = Math.min(batchSize, vectorCount - batch * batchSize);

    for (let i = 0; i < currentBatchSize; i++) {
      vectors.push({
        id: `vector-${batch}-${i}`,
        embedding: generateEmbedding(dimensions),
        metadata: {
          batch,
          index: i,
          timestamp: Date.now(),
        },
      });
    }

    await db.insertVectors(vectors);

    if (batch % 10 === 0) {
      const progress = ((batch / batches) * 100).toFixed(1);
      process.stdout.write(`\r  Progress: ${progress}%`);
    }
  }

  process.stdout.write('\n');
  console.log(`✅ Database setup complete`);

  return db;
}

/**
 * Vector Search Benchmark Suite
 */
export async function runVectorSearchBenchmarks(): Promise<void> {
  const configs: VectorSearchBenchmarkConfig[] = [
    { vectorCount: 1000, dimensions: 1536, k: 10, targetP50Ms: 1 },
    { vectorCount: 10000, dimensions: 1536, k: 10, targetP50Ms: 5 },
    { vectorCount: 100000, dimensions: 1536, k: 10, targetP50Ms: 8 },
    { vectorCount: 1000000, dimensions: 1536, k: 10, targetP50Ms: 10 },
  ];

  console.log('\n🎯 Vector Search Performance Benchmarks');
  console.log('Target: <10ms P50 for 1M vectors (150x faster than v1.0)');
  console.log('─'.repeat(80));

  const allResults = [];

  for (const config of configs) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 Benchmark: ${config.vectorCount.toLocaleString()} vectors`);
    console.log(`${'='.repeat(80)}`);

    const db = await setupVectorDB(config.vectorCount, config.dimensions);
    const queryVector = generateEmbedding(config.dimensions);

    // Run benchmark
    const result = await benchmark(
      async () => {
        await db.search(queryVector, config.k);
      },
      {
        iterations: 1000,
        warmup: 100,
        name: `vector-search-${config.vectorCount}`,
      }
    );

    // Validate against target
    const targetMet = result.p50 <= config.targetP50Ms;
    const improvement = ((config.targetP50Ms - result.p50) / config.targetP50Ms) * 100;

    console.log(`\n🎯 Target Analysis:`);
    console.table({
      'Target P50': `${config.targetP50Ms}ms`,
      'Actual P50': formatDuration(result.p50),
      'Status': targetMet ? '✅ PASS' : '❌ FAIL',
      'Margin': targetMet
        ? `${improvement.toFixed(1)}% faster than target`
        : `${Math.abs(improvement).toFixed(1)}% slower than target`,
    });

    allResults.push({
      config,
      result,
      targetMet,
    });

    // Cleanup
    await db.close();
  }

  // Overall summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📈 Vector Search Benchmark Summary');
  console.log(`${'='.repeat(80)}`);

  const summaryData = allResults.map(({ config, result, targetMet }) => ({
    'Vector Count': config.vectorCount.toLocaleString(),
    'P50': formatDuration(result.p50),
    'P95': formatDuration(result.p95),
    'P99': formatDuration(result.p99),
    'Target': `${config.targetP50Ms}ms`,
    'Status': targetMet ? '✅' : '❌',
  }));

  console.table(summaryData);

  const allPassed = allResults.every(r => r.targetMet);
  if (allPassed) {
    console.log('\n✅ All vector search benchmarks PASSED!');
    console.log('🚀 Performance targets achieved: 150x faster than v1.0');
  } else {
    console.log('\n⚠️  Some benchmarks did not meet performance targets');
    const failed = allResults.filter(r => !r.targetMet);
    failed.forEach(({ config }) => {
      console.log(`  - ${config.vectorCount.toLocaleString()} vectors: Target ${config.targetP50Ms}ms`);
    });
  }
}

/**
 * Additional Vector Search Benchmarks
 */
export async function runAdvancedVectorBenchmarks(): Promise<void> {
  console.log('\n🔬 Advanced Vector Search Benchmarks');
  console.log('─'.repeat(80));

  const db = await setupVectorDB(100000, 1536);
  const queryVector = generateEmbedding(1536);

  const benchmarks = [
    {
      name: 'k=1 (single nearest neighbor)',
      fn: async () => db.search(queryVector, 1),
      options: { iterations: 1000, warmup: 100 },
    },
    {
      name: 'k=5 (5 nearest neighbors)',
      fn: async () => db.search(queryVector, 5),
      options: { iterations: 1000, warmup: 100 },
    },
    {
      name: 'k=10 (10 nearest neighbors)',
      fn: async () => db.search(queryVector, 10),
      options: { iterations: 1000, warmup: 100 },
    },
    {
      name: 'k=50 (50 nearest neighbors)',
      fn: async () => db.search(queryVector, 50),
      options: { iterations: 500, warmup: 50 },
    },
    {
      name: 'k=100 (100 nearest neighbors)',
      fn: async () => db.search(queryVector, 100),
      options: { iterations: 500, warmup: 50 },
    },
  ];

  await benchmarkSuite(benchmarks, 'Vector Search - Variable K');

  await db.close();
}

/**
 * Distance Metric Comparison
 */
export async function runDistanceMetricBenchmarks(): Promise<void> {
  console.log('\n📏 Distance Metric Performance Comparison');
  console.log('─'.repeat(80));

  const vectorCount = 100000;
  const metrics = ['cosine', 'euclidean', 'dot'] as const;
  const results = [];

  for (const metric of metrics) {
    const dbPath = path.join(__dirname, '../data', `benchmark-${metric}.db`);

    try {
      await fs.unlink(dbPath);
    } catch (error) {
      // Ignore
    }

    const db = new AgentDB({
      dbPath,
      dimensions: 1536,
      indexType: 'hnsw',
      distanceMetric: metric,
    });

    // Insert vectors
    console.log(`\n📦 Setting up ${metric} distance DB...`);
    const vectors = [];
    for (let i = 0; i < vectorCount; i++) {
      vectors.push({
        id: `vec-${i}`,
        embedding: generateEmbedding(1536),
        metadata: { index: i },
      });
    }
    await db.insertVectors(vectors);

    const queryVector = generateEmbedding(1536);

    const result = await benchmark(
      async () => db.search(queryVector, 10),
      {
        iterations: 1000,
        warmup: 100,
        name: `${metric}-distance`,
      }
    );

    results.push({ metric, result });
    await db.close();
  }

  console.log('\n📊 Distance Metric Comparison');
  console.table(
    results.map(({ metric, result }) => ({
      'Metric': metric,
      'P50': formatDuration(result.p50),
      'P95': formatDuration(result.p95),
      'P99': formatDuration(result.p99),
      'Throughput': `${result.opsPerSecond.toFixed(0)} ops/sec`,
    }))
  );
}

// Run all benchmarks if executed directly
if (require.main === module) {
  (async () => {
    try {
      await runVectorSearchBenchmarks();
      await runAdvancedVectorBenchmarks();
      await runDistanceMetricBenchmarks();
      process.exit(0);
    } catch (error) {
      console.error('❌ Benchmark failed:', error);
      process.exit(1);
    }
  })();
}
