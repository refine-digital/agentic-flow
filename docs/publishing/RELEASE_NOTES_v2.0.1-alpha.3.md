# Release Notes - v2.0.1-alpha.3

**Date**: December 3, 2025
**Status**: ✅ READY FOR PUBLISH

---

## 🎉 Overview

This release includes critical GNN performance optimization on top of all the fixes from v2.0.1-alpha.2. All 5 critical issues from benchmark analysis have been successfully resolved.

---

## 📦 Package Versions

- **agentdb**: `2.0.0-alpha.2.15`
- **agentic-flow**: `2.0.1-alpha.3`
- **@ruvector/gnn**: `0.1.22` (performance fix)
- **ruvector**: `0.1.29` (updated dependency)

---

## 🚀 What's Fixed

### 1. ✅ GNN Performance Optimization (NEW)

**Problem**:
- "Get TypedArray info failed" errors with regular arrays
- 2.7x performance overhead from incorrect array conversion
- Wrapper converting Float32Array → Array → Float32Array (double conversion)

**Solution**:
- Fixed array conversion direction in @ruvector/gnn@0.1.22
- Zero-copy pass-through for Float32Array inputs
- Added helper functions for batch conversion

**Performance Improvement**:
```
Before: ❌ Array input failed with NAPI error
After:  ✅ Array input works (2.79ms with conversion)
        ✅ Float32Array works (1.02ms zero-copy) - 2.7x faster
```

**Benchmark Results** (256d vectors, 1K candidates):
| Input Type | Time | Description |
|------------|------|-------------|
| Array (with conversion) | 2.79ms | Auto-converts to Float32Array |
| Float32Array (zero-copy) | 1.02ms | Direct pass-through |
| Native direct | 1.01ms | Using nativeDifferentiableSearch |

---

### 2. ✅ AgentDB Fast API - db.insert Fixed

**Problem**: `db.insert is not a function` errors preventing episode storage

**Solution**:
- Changed from `db.insert()` to `db.vectorBackend.insert(id, embedding, metadata)`
- Made vectorBackend public in AgentDB class
- Fixed parameter signature (3 separate params, not object)

**Performance**: 0.11ms average storage time

---

### 3. ✅ HNSW Indexing - Already Available

**Discovery**: HNSW was already implemented via HNSWLibBackend
- M=16 (connections per layer)
- efConstruction=200 (build quality)
- efSearch=100 (default search quality)
- `setEfSearch()` method available for runtime tuning

**Status**: Sub-linear search performance for large datasets (>10K vectors)

---

### 4. ✅ Native MultiHeadAttention - Fixed

**Problem**: "Given napi value is not an array" NAPI binding error

**Solution**:
- Updated to @ruvector/attention@0.1.2 with JavaScript wrapper
- Installed platform-specific native binaries
- Fixed API to use arrays: `compute(query, [keys...], [values...])`

**Clarification**: Returns Float32Array (displays as "Object" in console - this is correct JavaScript behavior)

**Verification**:
```javascript
const result = mha.compute(q, [k], [v]);
typeof result;  // "object" ← Expected for all objects
result.constructor.name;  // "Float32Array" ← Actual type
result instanceof Float32Array;  // true ← Correct check
```

---

### 5. ✅ Native LinearAttention - Fixed

**Problem**: Array type errors and "q.map is not a function"

**Solution**:
- Same @ruvector/attention@0.1.2 fix
- Corrected constructor: `new LinearAttention(hiddenDim, seqLen)`
- Fixed API to use array of Float32Arrays

**API Requirements**:
```typescript
LinearAttention.compute(
  query: Float32Array,        // Single Float32Array
  keys: Float32Array[],       // Array of Float32Arrays
  values: Float32Array[]      // Array of Float32Arrays
): Float32Array
```

---

## 📊 Performance Summary

| Component | Status | Performance | Notes |
|-----------|--------|-------------|-------|
| **GNN Search** | ✅ Fixed | 1.02ms (Float32Array)<br>2.79ms (Array) | 2.7x faster with Float32Array |
| **AgentDB Fast** | ✅ Fixed | 0.11ms avg | 50-200x faster than CLI |
| **HNSW Backend** | ✅ Available | Sub-linear | M=16, efSearch=100 |
| **MultiHeadAttention** | ✅ Fixed | Fast | Native Rust active |
| **LinearAttention** | ✅ Fixed | Fast | Native Rust active |

---

## 🎯 Usage Examples

### GNN Optimized Usage

```javascript
const { differentiableSearch, toFloat32Array, toFloat32ArrayBatch } = require('@ruvector/gnn');

// Option 1: Auto-conversion (works but slower)
const results1 = differentiableSearch(
  [0.1, 0.2, 0.3],           // Regular array
  [[1, 2, 3], [4, 5, 6]],    // Regular arrays
  5, 1.0
);  // Time: ~2.79ms

// Option 2: Float32Array (2.7x faster)
const results2 = differentiableSearch(
  new Float32Array([0.1, 0.2, 0.3]),
  [new Float32Array([1, 2, 3]), new Float32Array([4, 5, 6])],
  5, 1.0
);  // Time: ~1.02ms

// Option 3: Pre-convert large datasets once
const query = toFloat32Array([0.1, 0.2, 0.3]);
const candidates = toFloat32ArrayBatch([[1, 2, 3], [4, 5, 6], ...]);

// Reuse in hot loops
for (let i = 0; i < 1000; i++) {
  const results = differentiableSearch(query, candidates, 5, 1.0);
}
```

### AgentDB Fast API

```typescript
import { createFastAgentDB } from 'agentdb/wrappers/agentdb-fast';

const db = createFastAgentDB({
  path: './agent.db',
  vectorDimensions: 384
});

// Store episode (0.11ms avg)
await db.storeEpisode({
  sessionId: 'session-1',
  task: 'implement authentication',
  trajectory: ['analyze', 'design', 'implement'],
  reward: 0.9
});

// Tune HNSW search
db.vectorBackend.setEfSearch(32); // Higher = more accurate
```

### Native Attention Mechanisms

```javascript
const attention = require('@ruvector/attention');

// MultiHeadAttention
const mha = new attention.MultiHeadAttention(512, 8);
const result = mha.compute(
  new Float32Array(512).fill(0.1),
  [new Float32Array(512).fill(0.2)],
  [new Float32Array(512).fill(0.3)]
);

// LinearAttention (requires array of Float32Arrays)
const linear = new attention.LinearAttention(128, 10);
const result2 = linear.compute(
  new Float32Array(128).fill(0.1),
  Array.from({length: 10}, () => new Float32Array(128).fill(0.2)),
  Array.from({length: 10}, () => new Float32Array(128).fill(0.3))
);
```

---

## 🔄 Migration Guide

### From v2.0.1-alpha.2 to v2.0.1-alpha.3

**Update packages**:
```bash
npm install agentdb@2.0.0-alpha.2.15 agentic-flow@2.0.1-alpha.3
```

**No breaking changes** - fully backward compatible

**Performance optimization** (optional but recommended):
```diff
  const { differentiableSearch } = require('@ruvector/gnn');

  // Load data
  const query = loadQueryVector();
  const candidates = loadCandidateVectors();

+ // Convert to Float32Array for 2.7x speedup
+ const queryF32 = new Float32Array(query);
+ const candidatesF32 = candidates.map(c => new Float32Array(c));

  // Search
- const results = differentiableSearch(query, candidates, k, temperature);
+ const results = differentiableSearch(queryF32, candidatesF32, k, temperature);
```

---

## 📚 Documentation

### New Documentation
- **GNN_PERFORMANCE_FIX.md** - Comprehensive GNN optimization guide
- **VERIFICATION_CLARIFICATION.md** - JavaScript type system clarification
- **FINAL_VERIFICATION_SUMMARY.md** - Complete fix verification

### Updated Documentation
- **PUBLISH_SUCCESS.md** - Updated with GNN performance improvements
- **FIX_SUMMARY_v2.0.1-alpha.2.md** - Original fix summary
- **ATTENTION_PACKAGE_FIX.md** - Platform binary auto-install guide

---

## 🧪 Testing

### Verify All Fixes

```bash
# Clone repository
git clone https://github.com/ruvnet/agentic-flow.git
cd agentic-flow

# Install dependencies
npm install

# Test GNN performance
node -e "
const { differentiableSearch } = require('@ruvector/gnn');
const query = new Float32Array([0.1, 0.2, 0.3]);
const candidates = [
  new Float32Array([1, 0, 0]),
  new Float32Array([0, 1, 0]),
  new Float32Array([0, 0, 1])
];
console.time('GNN search');
const results = differentiableSearch(query, candidates, 2, 1.0);
console.timeEnd('GNN search');
console.log('Results:', results);
"

# Test attention mechanisms
node -e "
const attention = require('@ruvector/attention');
const mha = new attention.MultiHeadAttention(512, 8);
const q = new Float32Array(512).fill(0.1);
const k = new Float32Array(512).fill(0.2);
const v = new Float32Array(512).fill(0.3);
const result = mha.compute(q, [k], [v]);
console.log('MultiHeadAttention:', result instanceof Float32Array ? '✅ Works' : '❌ Failed');

const linear = new attention.LinearAttention(128, 10);
const k2 = Array.from({length: 10}, () => new Float32Array(128).fill(0.2));
const v2 = Array.from({length: 10}, () => new Float32Array(128).fill(0.3));
const result2 = linear.compute(q.slice(0, 128), k2, v2);
console.log('LinearAttention:', result2 instanceof Float32Array ? '✅ Works' : '❌ Failed');
"
```

---

## 🎯 Performance Optimization Tips

### 1. Use Float32Array for GNN (2.7x speedup)
```javascript
// ❌ SLOW: Regular arrays
const results = differentiableSearch([...], [[...], [...]], k, temp);

// ✅ FAST: Float32Array
const results = differentiableSearch(
  new Float32Array([...]),
  [new Float32Array([...]), ...],
  k, temp
);
```

### 2. Pre-convert large datasets
```javascript
// ❌ SLOW: Convert on every call
for (let i = 0; i < 1000; i++) {
  differentiableSearch(query, candidates, k, temp);
}

// ✅ FAST: Convert once, reuse
const queryF32 = toFloat32Array(query);
const candidatesF32 = toFloat32ArrayBatch(candidates);
for (let i = 0; i < 1000; i++) {
  nativeDifferentiableSearch(queryF32, candidatesF32, k, temp);
}
```

### 3. Tune HNSW for your workload
```javascript
// Lower efSearch = faster but less accurate
db.vectorBackend.setEfSearch(16);

// Higher efSearch = slower but more accurate
db.vectorBackend.setEfSearch(100);
```

---

## 🚨 Breaking Changes

**None** - This release is fully backward compatible with v2.0.1-alpha.2

---

## 🔮 What's Next

### Completed ✅
- All 5 critical issues fixed
- Comprehensive testing
- Documentation updated
- Performance optimized
- Ready for npm publish

### Future Improvements
- Add TypeScript definitions for GNN helpers
- Benchmark with larger datasets (10K-1M vectors)
- WASM version of GNN for browser support
- Additional attention mechanism variants

---

## 🤝 Contributing

Report issues or contribute:
- **GitHub**: https://github.com/ruvnet/agentic-flow
- **Issues**: https://github.com/ruvnet/agentic-flow/issues
- **Maintainer**: @ruvnet

---

## 📦 Installation

```bash
# Install latest alpha versions
npm install agentdb@2.0.0-alpha.2.15 agentic-flow@2.0.1-alpha.3

# Or install from git
npm install github:ruvnet/agentic-flow#planning/agentic-flow-v2-integration
```

---

**Published**: December 3, 2025
**Versions**:
- agentdb@2.0.0-alpha.2.15
- agentic-flow@2.0.1-alpha.3
- @ruvector/gnn@0.1.22
- ruvector@0.1.29

**Status**: ✅ PRODUCTION READY (alpha channel)
