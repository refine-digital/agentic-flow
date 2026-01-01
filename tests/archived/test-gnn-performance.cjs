/**
 * GNN differentiableSearch Performance Test
 * Verifies claimed 125x speedup vs brute force
 */

const gnn = require('@ruvector/gnn');

async function testGNN() {
  console.log('\n🔬 Testing GNN differentiableSearch Performance\n');
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

    // Generate random query vector
    const query = Array.from({ length: dimensions }, () => Math.random());

    // Generate random candidate vectors
    const candidates = Array.from({ length: numVectors }, () =>
      Array.from({ length: dimensions }, () => Math.random())
    );

    // Test 1: Single query
    console.log('📝 Test 1: Single Query');
    const start1 = Date.now();
    const result1 = gnn.differentiableSearch(query, candidates, k, 0.5);
    const time1 = Date.now() - start1;

    console.log(`   Latency: ${time1}ms`);
    console.log(`   Results: ${result1.indices.length} neighbors`);
    console.log(`   Top score: ${result1.scores[0].toFixed(4)}`);

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
    const similarities = candidates.map((candidate, idx) => {
      let dot = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < dimensions; i++) {
        dot += query[i] * candidate[i];
        normA += query[i] * query[i];
        normB += candidate[i] * candidate[i];
      }
      const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
      return { idx, similarity };
    });

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
      console.log(`   ✅ VERIFIED: Significant speedup (>${speedup.toFixed(0)}x)`);
    } else if (speedup > 5) {
      console.log(`   ⚠️  MODERATE: Some speedup but less than claimed (${speedup.toFixed(1)}x vs 125x)`);
    } else {
      console.log(`   ❌ FAILED: Minimal speedup (${speedup.toFixed(1)}x vs 125x claimed)`);
    }

    // Test 4: Larger dataset (10K vectors)
    console.log('\n📝 Test 4: Larger Dataset (10K vectors)');
    const largeCandidates = Array.from({ length: 10000 }, () =>
      Array.from({ length: dimensions }, () => Math.random())
    );

    const largeStart = Date.now();
    gnn.differentiableSearch(query, largeCandidates, k, 0.5);
    const largeTime = Date.now() - largeStart;

    console.log(`   Latency: ${largeTime}ms`);
    console.log(`   Per-vector overhead: ${(largeTime / 10000).toFixed(3)}ms`);

    // Brute force for 10K
    const largeBruteStart = Date.now();
    const largeSimilarities = largeCandidates.map((candidate, idx) => {
      let dot = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < dimensions; i++) {
        dot += query[i] * candidate[i];
        normA += query[i] * query[i];
        normB += candidate[i] * candidate[i];
      }
      const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
      return { idx, similarity };
    });
    largeSimilarities.sort((a, b) => b.similarity - a.similarity);
    const largeBruteTime = Date.now() - largeBruteStart;

    const largeSpeedup = largeBruteTime / largeTime;

    console.log(`   Brute Force: ${largeBruteTime}ms`);
    console.log(`   Speedup: ${largeSpeedup.toFixed(1)}x`);

    console.log('\n📊 Summary:');
    console.log('=' .repeat(60));
    console.log(`   1K vectors: ${speedup.toFixed(1)}x speedup`);
    console.log(`   10K vectors: ${largeSpeedup.toFixed(1)}x speedup`);
    console.log(`   Avg latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`   Throughput: ${(1000 / avgLatency).toFixed(0)} queries/sec`);

    if (largeSpeedup > 50) {
      console.log('\n✅ CONCLUSION: GNN achieves significant speedup at scale');
      console.log(`   ${largeSpeedup.toFixed(0)}x speedup approaches claimed 125x`);
    } else if (largeSpeedup > 10) {
      console.log('\n⚠️  CONCLUSION: GNN provides good speedup but less than claimed');
      console.log(`   ${largeSpeedup.toFixed(0)}x speedup vs 125x claimed`);
    } else {
      console.log('\n❌ CONCLUSION: GNN speedup does not match claims');
      console.log(`   Only ${largeSpeedup.toFixed(1)}x vs 125x claimed`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 GNN Performance Test Complete!\n');

  } catch (error) {
    console.error('\n❌ Error testing GNN:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testGNN();
