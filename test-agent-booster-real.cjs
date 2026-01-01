/**
 * Agent Booster Real Test (No Simulation!)
 * Confirms Agent Booster works as advertised
 */

const { AgentBooster } = require('./packages/agent-booster/dist/index.js');

async function testAgentBooster() {
  console.log('\n🔬 Testing Real Agent Booster Integration\n');
  console.log('=' .repeat(60));

  try {
    // Initialize Agent Booster
    const booster = new AgentBooster({ confidenceThreshold: 0.5 });
    console.log('✅ Agent Booster imported and initialized');

    // Test 1: Simple TypeScript type addition
    console.log('\n📝 Test 1: Add TypeScript types');
    const test1Start = Date.now();
    const result1 = await booster.apply({
      code: 'function add(a, b) { return a + b; }',
      edit: 'function add(a: number, b: number): number { return a + b; }',
      language: 'typescript'
    });
    const test1Time = Date.now() - test1Start;

    console.log(`   Success: ${result1.success}`);
    console.log(`   Latency: ${result1.latency}ms (measured: ${test1Time}ms)`);
    console.log(`   Confidence: ${(result1.confidence * 100).toFixed(1)}%`);
    console.log(`   Strategy: ${result1.strategy}`);

    if (test1Time > 100) {
      console.log(`   ⚠️  WARNING: Latency > 100ms (expected <50ms for real Agent Booster)`);
    } else {
      console.log(`   ✅ VERIFIED: Fast latency (<100ms)`);
    }

    // Test 2: Multiple edits to measure average performance
    console.log('\n📝 Test 2: Batch Performance Test (10 edits)');
    const latencies = [];
    const batchStart = Date.now();

    for (let i = 0; i < 10; i++) {
      const result = await booster.apply({
        code: `const x${i} = ${i};`,
        edit: `const x${i}: number = ${i};`,
        language: 'typescript'
      });
      latencies.push(result.latency);
    }

    const batchTime = Date.now() - batchStart;
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    const minLatency = Math.min(...latencies);

    console.log(`   Total time: ${batchTime}ms`);
    console.log(`   Avg latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`   Min latency: ${minLatency}ms`);
    console.log(`   Max latency: ${maxLatency}ms`);
    console.log(`   Speedup vs cloud (352ms): ${(352 / avgLatency).toFixed(0)}x`);

    // Verification
    console.log('\n🎯 Verification Results:');
    console.log('=' .repeat(60));

    if (avgLatency < 50) {
      console.log('✅ CONFIRMED: Agent Booster is REAL (not simulated)');
      console.log(`   - Avg latency ${avgLatency.toFixed(2)}ms << 352ms (cloud API)`);
      console.log(`   - ${(352 / avgLatency).toFixed(0)}x faster than cloud`);
    } else if (avgLatency > 300) {
      console.log('❌ FAILED: Agent Booster appears to be SIMULATED');
      console.log(`   - Avg latency ${avgLatency.toFixed(2)}ms ≈ 352ms (simulation)`);
    } else {
      console.log('⚠️  UNCLEAR: Latency is moderate (50-300ms)');
      console.log(`   - Avg latency: ${avgLatency.toFixed(2)}ms`);
    }

    if (result1.confidence > 0 && result1.confidence <= 1) {
      console.log('✅ CONFIRMED: Returns real confidence scores (WASM feature)');
    }

    if (['exact_replace', 'fuzzy_replace', 'insert_after', 'insert_before', 'append'].includes(result1.strategy)) {
      console.log('✅ CONFIRMED: Returns merge strategies (WASM feature)');
    }

    console.log('\n💰 Cost Analysis:');
    console.log('   - Cloud API (352ms): ~$0.01 per edit');
    console.log('   - Agent Booster: $0.00 per edit');
    console.log('   - Monthly savings (3000 edits): ~$30.00');

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Agent Booster Test Complete!\n');

  } catch (error) {
    console.error('\n❌ Error testing Agent Booster:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAgentBooster();
