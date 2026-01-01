/**
 * GNN differentiableSearch with TypedArrays
 * Test different array types to find what works
 */

const gnn = require('@ruvector/gnn');

async function testGNN() {
  console.log('\n🔬 Testing GNN with Different Array Types\n');
  console.log('=' .repeat(60));

  const dimensions = 128;
  const k = 10;

  // Test 1: Regular arrays (reported to fail)
  console.log('📝 Test 1: Regular JavaScript Arrays');
  try {
    const query = Array.from({ length: dimensions }, () => Math.random());
    const candidates = [
      Array.from({ length: dimensions }, () => Math.random()),
      Array.from({ length: dimensions }, () => Math.random())
    ];

    const result = gnn.differentiableSearch(query, candidates, k, 0.5);
    console.log('   ✅ SUCCESS with regular arrays');
    console.log(`   Results: ${result.indices.length} indices`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
  }

  // Test 2: Float32Array
  console.log('\n📝 Test 2: Float32Array');
  try {
    const query = new Float32Array(dimensions);
    for (let i = 0; i < dimensions; i++) query[i] = Math.random();

    const candidates = [
      new Float32Array(dimensions).map(() => Math.random()),
      new Float32Array(dimensions).map(() => Math.random())
    ];

    const result = gnn.differentiableSearch(query, candidates, k, 0.5);
    console.log('   ✅ SUCCESS with Float32Array');
    console.log(`   Results: ${result.indices.length} indices`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
  }

  // Test 3: Float64Array
  console.log('\n📝 Test 3: Float64Array');
  try {
    const query = new Float64Array(dimensions);
    for (let i = 0; i < dimensions; i++) query[i] = Math.random();

    const candidates = [
      new Float64Array(dimensions).map(() => Math.random()),
      new Float64Array(dimensions).map(() => Math.random())
    ];

    const result = gnn.differentiableSearch(query, candidates, k, 0.5);
    console.log('   ✅ SUCCESS with Float64Array');
    console.log(`   Results: ${result.indices.length} indices`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
  }

  // Test 4: Array.from with Float32Array source
  console.log('\n📝 Test 4: Array.from(Float32Array)');
  try {
    const queryTyped = new Float32Array(dimensions);
    for (let i = 0; i < dimensions; i++) queryTyped[i] = Math.random();
    const query = Array.from(queryTyped);

    const candidatesTyped = [
      new Float32Array(dimensions).map(() => Math.random()),
      new Float32Array(dimensions).map(() => Math.random())
    ];
    const candidates = candidatesTyped.map(c => Array.from(c));

    const result = gnn.differentiableSearch(query, candidates, k, 0.5);
    console.log('   ✅ SUCCESS with Array.from(Float32Array)');
    console.log(`   Results: ${result.indices.length} indices`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
  }

  // Test 5: Check if init() is required
  console.log('\n📝 Test 5: Call init() first');
  try {
    if (typeof gnn.init === 'function') {
      gnn.init();
      console.log('   ✅ init() called');
    } else {
      console.log('   ⚠️  No init() function found');
    }

    const query = Array.from({ length: dimensions }, () => Math.random());
    const candidates = [
      Array.from({ length: dimensions }, () => Math.random()),
      Array.from({ length: dimensions }, () => Math.random())
    ];

    const result = gnn.differentiableSearch(query, candidates, k, 0.5);
    console.log('   ✅ SUCCESS after init()');
    console.log(`   Results: ${result.indices.length} indices`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
  }

  // Test 6: Simple 2D test
  console.log('\n📝 Test 6: Minimal 2D Test');
  try {
    const query = [1.0, 0.0];
    const candidates = [[1.0, 0.0], [0.0, 1.0]];

    const result = gnn.differentiableSearch(query, candidates, 2, 1.0);
    console.log('   ✅ SUCCESS with 2D vectors');
    console.log(`   Indices: [${result.indices}]`);
    console.log(`   Weights: [${result.weights.map(w => w.toFixed(3))}]`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🎉 GNN Type Testing Complete!\n');
}

testGNN();
