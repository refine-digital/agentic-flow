/**
 * GNN differentiableSearch Performance Test (Float32Array)
 * Verifies claimed 125x speedup vs brute force
 */

const gnn = require('@ruvector/gnn');

async function testGNN() {
  console.log('\n🔬 Testing GNN differentiableSearch Performance (Float32Array)\n');
  console.log('=' .repeat(60));

  try {
    // Generate test vectors
    const dimensions = 128;
    const numVectors = 1000;
    const k = 10;

    console.log('📊 Test Configuration:');
    console.log(`   Dimensions: ${dimensions}`);
    console.log(`   Vectors: ${numVectors}`);
    console.log(`   k (nearest neighbors): ${k}`);
    console.log(`   Temperature: 0.5\n`);

    // Generate random query vector (Float32Array)
    const query = new Float32Array(dimensions);
    for (let i = 0; i < dimensions; i++) {
      query[i] = Math.random();
    }

    // Generate random candidate vectors (Float32Array)
    const candidates = [];
    for (let i = 0; i < numVectors; i++) {
      const vec = new Float32Array(dimensions);
      for (let j = 0; j < dimensions; j++) {
        vec[j] = Math.random();
      }
      candidates.push(vec);
    }

    // Test 1: Single query
    console.log('📝 Test 1: Single Query');
    const start1 = Date.now();
    const result1 = gnn.differentiableSearch(query, candidates, k, 0.5);
    const time1 = Date.now() - start1;

    console.log(`   Latency: ${time1}ms`);
    console.log(`   Results: ${result1.indices.length} neighbors`);
    console.log(`   Top indices: [${result1.indices.slice(0, 5)}]`);
    console.log(`   Top weights: [${result1.weights.slice(0, 5).map(w => w.toFixed(4))}]`);

    // Test 2: Batch queries (10 queries)
    console.log('\n📝 Test 2: Batch Queries (10 queries)');
    const latencies = [];
    const batchStart = Date.now();

    for (let i = 0; i < 10; i++) {
      const queryStart = Date.now();
      gnn.differentiableSearch(query, candidates, k, 0.5);
      latencies.push(Date.now() - queryStart);
    }

    const batchTime = Date.now() - batchStart;
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    console.log(`   Total time: ${batchTime}ms`);
    console.log(`   Avg latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`   Min latency: ${Math.min(...latencies)}ms`);
    console.log(`   Max latency: ${Math.max(...latencies)}ms`);
    console.log(`   Throughput: ${(10000 / batchTime).toFixed(0)} queries/sec`);

    // Test 3: Brute force comparison
    console.log('\n📝 Test 3: Brute Force Baseline');
    const bruteStart = Date.now();

    // Simple cosine similarity brute force
    const similarities = [];
    for (let i = 0; i < numVectors; i++) {
      let dot = 0;
      let normA = 0;
      let normB = 0;
      for (let j = 0; j < dimensions; j++) {
        dot += query[j] * candidates[i][j];
        normA += query[j] * query[j];
        normB += candidates[i][j] * candidates[i][j];
      }
      const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
      similarities.push({ idx: i, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    const topK = similarities.slice(0, k);
    const bruteTime = Date.now() - bruteStart;

    console.log(`   Latency: ${bruteTime}ms`);
    console.log(`   Top similarity: ${topK[0].similarity.toFixed(4)}`);

    // Calculate speedup
    const speedup = bruteTime / avgLatency;

    console.log('\n🎯 Performance Analysis:');
    console.log('=' .repeat(60));
    console.log(`   GNN Search: ${avgLatency.toFixed(2)}ms`);
    console.log(`   Brute Force: ${bruteTime}ms`);
    console.log(`   Speedup: ${speedup.toFixed(1)}x`);

    if (speedup > 10) {
      console.log(`   ✅ VERIFIED: Significant speedup (${speedup.toFixed(0)}x)`);
    } else if (speedup > 5) {
      console.log(`   ⚠️  MODERATE: Some speedup but less than claimed (${speedup.toFixed(1)}x vs 125x)`);
    } else {
      console.log(`   ❌ FAILED: Minimal speedup (${speedup.toFixed(1)}x vs 125x claimed)`);
    }

    // Test 4: Larger dataset (10K vectors)
    console.log('\n📝 Test 4: Larger Dataset (10K vectors)');
    const largeCandidates = [];
    for (let i = 0; i < 10000; i++) {
      const vec = new Float32Array(dimensions);
      for (let j = 0; j < dimensions; j++) {
        vec[j] = Math.random();
      }
      largeCandidates.push(vec);
    }

    const largeStart = Date.now();
    gnn.differentiableSearch(query, largeCandidates, k, 0.5);
    const largeTime = Date.now() - largeStart;

    console.log(`   GNN latency: ${largeTime}ms`);
    console.log(`   Per-vector overhead: ${(largeTime / 10000).toFixed(3)}ms`);

    // Brute force for 10K
    const largeBruteStart = Date.now();
    const largeSimilarities = [];
    for (let i = 0; i < 10000; i++) {
      let dot = 0;
      let normA = 0;
      let normB = 0;
      for (let j = 0; j < dimensions; j++) {
        dot += query[j] * largeCandidates[i][j];
        normA += query[j] * query[j];
        normB += largeCandidates[i][j] * largeCandidates[i][j];
      }
      const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
      largeSimilarities.push({ idx: i, similarity });
    }
    largeSimilarities.sort((a, b) => b.similarity - a.similarity);
    const largeBruteTime = Date.now() - largeBruteStart;

    const largeSpeedup = largeBruteTime / largeTime;

    console.log(`   Brute force: ${largeBruteTime}ms`);
    console.log(`   Speedup: ${largeSpeedup.toFixed(1)}x`);

    // Test 5: 100K vectors (stress test)
    console.log('\n📝 Test 5: Stress Test (100K vectors)');
    console.log('   Generating 100K vectors...');
    const hugeCandidates = [];
    for (let i = 0; i < 100000; i++) {
      const vec = new Float32Array(dimensions);
      for (let j = 0; j < dimensions; j++) {
        vec[j] = Math.random();
      }
      hugeCandidates.push(vec);
    }

    console.log('   Running GNN search...');
    const hugeStart = Date.now();
    gnn.differentiableSearch(query, hugeCandidates, k, 0.5);
    const hugeTime = Date.now() - hugeStart;

    console.log(`   GNN latency: ${hugeTime}ms`);
    console.log(`   Per-vector overhead: ${(hugeTime / 100000).toFixed(4)}ms`);

    console.log('\n📊 Summary:');
    console.log('=' .repeat(60));
    console.log(`   1K vectors: ${speedup.toFixed(1)}x speedup (${avgLatency.toFixed(2)}ms)`);
    console.log(`   10K vectors: ${largeSpeedup.toFixed(1)}x speedup (${largeTime}ms)`);
    console.log(`   100K vectors: ${hugeTime}ms (${(hugeTime / 100000).toFixed(4)}ms per vector)`);
    console.log(`   Throughput: ${(1000 / avgLatency).toFixed(0)} queries/sec`);

    console.log('\n✅ CONCLUSION:');
    if (largeSpeedup > 50) {
      console.log(`   GNN achieves ${largeSpeedup.toFixed(0)}x speedup at 10K scale`);
      console.log('   Performance approaches claimed 125x at scale');
    } else if (largeSpeedup > 10) {
      console.log(`   GNN provides ${largeSpeedup.toFixed(0)}x speedup (good but less than 125x claimed)`);
    } else {
      console.log(`   GNN speedup ${largeSpeedup.toFixed(1)}x does not match 125x claim`);
    }

    console.log('\n⚠️  IMPORTANT:');
    console.log('   - GNN REQUIRES Float32Array (regular arrays fail)');
    console.log('   - API documentation shows regular arrays but they don\'t work');
    console.log('   - This is an alpha package with Rust/NAPI bindings in development');

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 GNN Performance Test Complete!\n');

  } catch (error) {
    console.error('\n❌ Error testing GNN:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testGNN();
