/**
 * Test Fixed Wrappers
 *
 * Verifies all 3 fixes:
 * 1. Native MultiHeadAttention (Rust)
 * 2. Native LinearAttention (Rust)
 * 3. AgentDB Fast with backend integration
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Testing Fixed Wrappers ===\n');

// Test 1: Native MultiHeadAttention
console.log('1️⃣ Testing Native MultiHeadAttention...');
try {
  const attention = await import('@ruvector/attention');
  const mha = new attention.MultiHeadAttention(512, 8);

  // MultiHeadAttention.compute expects: compute(query, keys, values)
  // where keys and values are arrays of Float32Array
  const q = new Float32Array(512).fill(0.1);
  const k = [new Float32Array(512).fill(0.2)]; // Array of Float32Array
  const v = [new Float32Array(512).fill(0.3)]; // Array of Float32Array

  const result = mha.compute(q, k, v);

  console.log('✅ Native MultiHeadAttention works!');
  console.log(`   Output type: ${result.constructor.name}`);
  console.log(`   Output length: ${result.length}`);
  console.log(`   First 3 values: [${Array.from(result.slice(0, 3)).map(v => v.toFixed(4)).join(', ')}]`);
} catch (err) {
  console.log(`❌ Error: ${err.message}`);
}

console.log('');

// Test 2: Native LinearAttention
console.log('2️⃣ Testing Native LinearAttention...');
try {
  const attention = await import('@ruvector/attention');

  // LinearAttention constructor signature: (hiddenDim, seqLen)
  const linear = new attention.LinearAttention(128, 10);

  // Create test tensors: arrays of Float32Array for keys/values
  const createTensorArray = (seqLen, dim) => {
    const arr = [];
    for (let i = 0; i < seqLen; i++) {
      const row = new Float32Array(dim);
      for (let j = 0; j < dim; j++) {
        row[j] = Math.random();
      }
      arr.push(row);
    }
    return arr;
  };

  const q = new Float32Array(128).fill(Math.random());
  const k = createTensorArray(10, 128);
  const v = createTensorArray(10, 128);

  const result = linear.compute(q, k, v);

  console.log('✅ Native LinearAttention works!');
  console.log(`   Output type: ${result.constructor.name}`);
  console.log(`   Output length: ${result.length}`);
} catch (err) {
  console.log(`❌ Error: ${err.message}`);
}

console.log('');

// Test 3: AgentDB Fast with backend
console.log('3️⃣ Testing AgentDB Fast API...');
try {
  const { AgentDB } = await import('agentdb');

  const db = new AgentDB({
    path: './test-agentdb-fix.db',
    dimensions: 384
  });

  await db.initialize();

  console.log('✅ AgentDB initialized');

  // Access backend directly
  const backend = db.vectorBackend;
  console.log(`   Backend type: ${backend.constructor.name}`);
  console.log(`   Backend name: ${backend.name}`);

  if (backend) {
    // Test insert - use correct parameter signature (id, embedding, metadata)
    const testId = `test-${Date.now()}`;
    backend.insert(
      testId,
      new Float32Array(384).fill(0.1),
      { type: 'test', value: 'hello' }
    );

    console.log('✅ Backend insert works!');
    console.log(`   Inserted ID: ${testId}`);

    // Test search
    const results = backend.search(
      new Float32Array(384).fill(0.1),
      5,
      {}
    );

    console.log('✅ Backend search works!');
    console.log(`   Found ${results.length} results`);

    if (results.length > 0) {
      console.log(`   First result ID: ${results[0].id}`);
      console.log(`   First result metadata: ${JSON.stringify(results[0].metadata)}`);
    }
  } else {
    console.log('❌ Backend not available');
  }

  await db.close();

} catch (err) {
  console.log(`❌ Error: ${err.message}`);
  console.log(`   Stack: ${err.stack}`);
}

console.log('');

// Test 4: HNSW availability
console.log('4️⃣ Testing HNSW Availability...');
try {
  const { AgentDB } = await import('agentdb');

  const db = new AgentDB({
    path: './test-hnsw.db',
    dimensions: 384
  });

  await db.initialize();

  const backend = db.vectorBackend;

  console.log(`   Backend type: ${backend.constructor.name}`);
  console.log(`   Has buildIndex: ${typeof backend.buildIndex === 'function'}`);

  // Check if HNSW is enabled
  if (typeof backend.buildIndex === 'function') {
    console.log('✅ HNSW index building available');

    // Try to build index
    try {
      await backend.buildIndex({ M: 16, efConstruction: 200 });
      console.log('✅ HNSW index built successfully');
    } catch (err) {
      console.log(`⚠️ Index build note: ${err.message}`);
    }
  } else {
    console.log('⚠️ HNSW not available in this backend');
  }

  await db.close();

} catch (err) {
  console.log(`❌ Error: ${err.message}`);
}

console.log('');
console.log('=== Test Complete ===');
