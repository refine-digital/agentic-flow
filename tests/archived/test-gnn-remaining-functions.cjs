/**
 * Test Remaining GNN Functions
 * Verify which GNN functions work and which are broken
 */

const gnn = require('@ruvector/gnn');

async function testRemainingFunctions() {
  console.log('\n🔬 Testing Remaining GNN Functions\n');
  console.log('=' .repeat(60));

  // Test 1: hierarchicalForward
  console.log('📝 Test 1: hierarchicalForward');
  try {
    const input = new Float32Array(128).map(() => Math.random());
    const weights = new Float32Array(128 * 64).map(() => Math.random());

    const result = gnn.hierarchicalForward(input, weights, 128, 64);
    console.log('   ✅ SUCCESS: hierarchicalForward works');
    console.log(`   Output type: ${result.constructor.name}`);
    console.log(`   Output length: ${result.length}`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
  }

  // Test 2: hierarchicalForward with different signatures
  console.log('\n📝 Test 2: hierarchicalForward (alt signature)');
  try {
    const input = new Float32Array(128).map(() => Math.random());
    const weights1 = new Float32Array(128 * 64).map(() => Math.random());
    const weights2 = new Float32Array(64 * 32).map(() => Math.random());

    const result = gnn.hierarchicalForward(input, [weights1, weights2]);
    console.log('   ✅ SUCCESS: hierarchicalForward with array of weights');
    console.log(`   Output length: ${result.length}`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
  }

  // Test 3: RuvectorLayer constructor
  console.log('\n📝 Test 3: RuvectorLayer constructor');
  try {
    // Try different constructor signatures
    const layer1 = new gnn.RuvectorLayer(128, 64);
    console.log('   ✅ SUCCESS: RuvectorLayer(inputDim, outputDim)');
  } catch (error) {
    console.log(`   ❌ FAILED (2 args): ${error.message}`);

    try {
      const layer2 = new gnn.RuvectorLayer({ inputDim: 128, outputDim: 64 });
      console.log('   ✅ SUCCESS: RuvectorLayer({inputDim, outputDim})');
    } catch (error2) {
      console.log(`   ❌ FAILED (config obj): ${error2.message}`);

      try {
        const layer3 = new gnn.RuvectorLayer(128, 64, 'relu');
        console.log('   ✅ SUCCESS: RuvectorLayer(input, output, activation)');
      } catch (error3) {
        console.log(`   ❌ FAILED (3 args): ${error3.message}`);
      }
    }
  }

  // Test 4: TensorCompress constructor
  console.log('\n📝 Test 4: TensorCompress constructor');
  try {
    // Try different compression levels
    const compress1 = new gnn.TensorCompress('half');
    console.log('   ✅ SUCCESS: TensorCompress("half")');
  } catch (error) {
    console.log(`   ❌ FAILED (string): ${error.message}`);

    try {
      const compress2 = new gnn.TensorCompress({ levelType: 'half' });
      console.log('   ✅ SUCCESS: TensorCompress({levelType: "half"})');
    } catch (error2) {
      console.log(`   ❌ FAILED (config obj): ${error2.message}`);

      try {
        const compress3 = new gnn.TensorCompress({ levelType: 'half', scale: 1.0 });
        console.log('   ✅ SUCCESS: TensorCompress({levelType, scale})');
      } catch (error3) {
        console.log(`   ❌ FAILED (full config): ${error3.message}`);
      }
    }
  }

  // Test 5: getCompressionLevel
  console.log('\n📝 Test 5: getCompressionLevel');
  try {
    const levels = ['none', 'half', 'pq8', 'pq4', 'binary'];

    for (const level of levels) {
      try {
        const config = gnn.getCompressionLevel(level);
        console.log(`   ✅ SUCCESS: getCompressionLevel("${level}")`);
        console.log(`      Config: ${JSON.stringify(config)}`);
      } catch (error) {
        console.log(`   ❌ FAILED ("${level}"): ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
  }

  // Test 6: Check type definitions
  console.log('\n📝 Test 6: Exported Types and Functions');
  console.log(`   Exports: ${Object.keys(gnn).join(', ')}`);

  for (const key of Object.keys(gnn)) {
    console.log(`   - ${key}: ${typeof gnn[key]}`);
  }

  console.log('\n📊 Summary:');
  console.log('=' .repeat(60));
  console.log('   differentiableSearch: ✅ Working (Float32Array required)');
  console.log('   hierarchicalForward: Testing above...');
  console.log('   RuvectorLayer: Testing above...');
  console.log('   TensorCompress: Testing above...');
  console.log('   getCompressionLevel: Testing above...');

  console.log('\n' + '=' .repeat(60));
  console.log('🎉 GNN Function Testing Complete!\n');
}

testRemainingFunctions().catch(console.error);
