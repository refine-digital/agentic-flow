# agentic-flow@2.0.1-alpha Benchmark Results

**Date**: December 3, 2025
**Version**: agentic-flow@2.0.1-alpha
**Platform**: Node.js (testing environment)

---

## Executive Summary

✅ **Progress from v2.0.0-alpha**:
- RuvectorLayer: ❌ Broken → ✅ Working (native Rust)
- GNN Search: ❌ Type errors → ✅ Working (native Rust)
- Attention: ❌ Completely broken → ⚠️ Partially working

⚠️ **Limitations**:
- MultiHeadAttention using JS fallback (not native Rust)
- AgentDB Fast API has db.insert errors
- Linear O(n) search (HNSW not enabled)
- Performance claims unverified (125-150x claimed, ~13x observed)

---

## Detailed Benchmark Results

### 1. GNN Vector Search (Native Rust) ✅

**Component**: `differentiableSearch`
**Status**: Working (native Rust)
**Performance**: Linear O(n) scaling

| Vectors | Avg (ms) | Min (ms) | Ops/sec |
|---------|----------|----------|---------|
| 1K      | 3.8      | 2.3      | 261     |
| 5K      | 23.9     | 13.5     | 42      |
| 10K     | 62.7     | 40.3     | 16      |
| 25K     | 156.3    | 93.3     | 6       |

**Analysis**:
- ✅ Consistent performance
- ✅ Native Rust working correctly
- ⚠️ Linear O(n) scaling (not sub-linear as HNSW would provide)
- 📊 ~13x speedup vs SQLite (good, but not claimed 125-150x)

**Recommendation**: Use for production if <10K vectors. For larger datasets, wait for HNSW.

---

### 2. RuvectorLayer (Native Rust) ✅

**Component**: `RuvectorLayer.forward`
**Status**: Working (native Rust)
**Performance**: Excellent for neural network layers

| Input→Output | Avg (ms) | Ops/sec |
|--------------|----------|---------|
| 384→128      | 0.19     | 5,157   |
| 768→256      | 0.78     | 1,280   |
| 1024→512     | 2.04     | 490     |

**Analysis**:
- ✅ **Major fix from v2.0.0** where this was completely broken
- ✅ Native Rust performance
- ✅ 5,000+ ops/sec for typical use cases
- ✅ Scales reasonably with dimension increases

**Recommendation**: Production-ready for neural network layer operations.

---

### 3. Attention Mechanisms ⚠️

#### 3.1 scaledDotProductAttention ✅

**Component**: `scaledDotProductAttention`
**Status**: Working
**Performance**: Better than O(n²) quadratic

| Seq Length | Avg (ms) | Scaling Factor |
|------------|----------|----------------|
| 128        | 0.70     | baseline       |
| 256        | 1.47     | 2.1x           |
| 512        | 2.79     | 1.9x           |
| 1024       | 5.43     | 1.9x           |

**Analysis**:
- ✅ Working correctly
- ✅ ~1.9x scaling per 2x sequence (better than O(n²) = 4x)
- ✅ Suggests optimizations in implementation
- ✅ Acceptable for production use

**Recommendation**: Use for attention operations, good performance.

#### 3.2 MultiHeadAttention ⚠️

**Component**: `MultiHeadAttention.forward`
**Status**: Using JavaScript fallback
**Performance**: 0.003ms (suspiciously fast)

**Analysis**:
- ⚠️ NOT using native Rust
- ⚠️ Using JavaScript fallback implementation
- ⚠️ 0.003ms is too fast - likely not doing real computation
- ⚠️ Claimed "4.51x Flash Attention" speedup not verifiable

**Recommendation**: Use `scaledDotProductAttention` directly for production.

#### 3.3 LinearAttention ❌

**Component**: `LinearAttention`
**Status**: Array type errors
**Performance**: N/A (broken)

**Analysis**:
- ❌ Array type mismatches
- ❌ Cannot run benchmarks
- 🔧 Needs fixing

**Recommendation**: Do not use. Wait for fix or use alternatives.

---

### 4. AgentDB Fast API ❌

**Component**: `AgentDBFast` / `createFastAgentDB`
**Status**: API added but db.insert broken
**Performance**: N/A (cannot complete operations)

**Issues**:
```javascript
// db.insert errors prevent:
- storeEpisode()
- storePattern()
- retrieveEpisodes()
- searchPatterns()
```

**Analysis**:
- ✅ API wrapper created
- ✅ Eliminates 2.3s CLI overhead (in theory)
- ❌ db.insert() not working
- ⚠️ Claimed "50-200x faster" not verifiable

**Recommendation**: Use CLI for now. Wait for agentdb core API updates.

---

## Performance Claims vs Reality

| Claim                          | Observed         | Verdict |
|--------------------------------|------------------|---------|
| 125-150x speedup vs SQLite     | ~13x speedup     | ⚠️ 10x less |
| Sub-linear vector search       | Linear O(n)      | ❌ Not observed |
| Flash Attention 4.51x          | JS fallback      | ⚠️ Untestable |
| Agent Booster 352x             | N/A              | ⚠️ Untestable |
| AgentDB Fast 50-200x           | db.insert broken | ⚠️ Untestable |

---

## What Works in Production

### ✅ Production-Ready

1. **GNN Search** (`differentiableSearch`)
   - Native Rust working
   - 3.8ms for 1K vectors
   - Reliable and consistent
   - Good for <10K vector datasets

2. **RuvectorLayer** (`RuvectorLayer.forward`)
   - Native Rust working
   - 0.19ms for typical transforms
   - 5,000+ ops/sec
   - Excellent for neural networks

3. **Scaled Dot-Product Attention** (`scaledDotProductAttention`)
   - Working correctly
   - 0.7-5.4ms for 128-1024 sequences
   - Better than O(n²) scaling
   - Good for production attention

4. **Embedding Service**
   - OpenAI provider working
   - Transformers.js provider working
   - Mock provider for development
   - 3 production options

### ⚠️ Use with Caution

1. **MultiHeadAttention**
   - Using JS fallback
   - Performance not verified
   - Consider using scaledDotProductAttention instead

### ❌ Not Working

1. **AgentDB Fast API**
   - db.insert errors
   - Cannot store/retrieve episodes
   - Use CLI instead

2. **LinearAttention**
   - Array type errors
   - Cannot run
   - Use alternatives

---

## Recommendations by Use Case

### Neural Network Layers
✅ **Use**: `RuvectorLayer`
**Performance**: 5,000+ ops/sec
**Status**: Production-ready

### Vector Search (<10K vectors)
✅ **Use**: `differentiableSearch`
**Performance**: 3.8ms/1K vectors
**Status**: Production-ready

### Attention Mechanisms
✅ **Use**: `scaledDotProductAttention`
**Performance**: 0.7-5.4ms (128-1024 seq)
**Status**: Production-ready

### Embeddings
✅ **Use**: `createEmbeddingService`
**Providers**: OpenAI, Transformers.js, Mock
**Status**: Production-ready

### ReasoningBank / Episode Storage
❌ **Avoid**: `AgentDBFast` (broken)
⚠️ **Use**: CLI instead
**Status**: Waiting for fix

---

## Version Comparison

| Feature           | v2.0.0-alpha | v2.0.1-alpha |
|-------------------|--------------|--------------|
| GNN Search        | ❌ Broken    | ✅ Works     |
| RuvectorLayer     | ❌ Broken    | ✅ Works     |
| Attention         | ❌ Broken    | ⚠️ Partial   |
| AgentDB Fast      | ❌ N/A       | ❌ Broken    |
| Wrappers Added    | None         | 4 (43 KB)    |
| Documentation     | Minimal      | Comprehensive|

**Overall**: v2.0.1-alpha is **significantly better** than v2.0.0-alpha. Major components now work.

---

## Next Steps for Maintainers

### High Priority

1. **Fix AgentDB Fast db.insert** - Most critical for ReasoningBank functionality
2. **Enable HNSW** - Critical for sub-linear search performance
3. **Fix LinearAttention** - Array type mismatches
4. **Verify MultiHeadAttention** - Should use native Rust, not JS fallback

### Medium Priority

5. **Benchmark verification** - Validate 125-150x claims with real datasets
6. **Performance profiling** - Identify bottlenecks in current implementation
7. **Documentation updates** - Reflect actual benchmark results

### Low Priority

8. **Browser bundle optimization** - Reduce package size
9. **Example applications** - Demonstrate working features
10. **Integration tests** - Automated benchmarking suite

---

## Conclusion

**v2.0.1-alpha represents significant progress**:
- ✅ 2 major components fixed (GNN, RuvectorLayer)
- ✅ Wrappers provide stable interfaces
- ✅ Production-ready for specific use cases

**Limitations are known and documented**:
- ⚠️ Some claims remain unverified
- ⚠️ HNSW not enabled (linear search only)
- ❌ AgentDB Fast needs fixing

**Recommendation**:
- **Use for**: GNN search, neural layers, attention (scaledDotProduct), embeddings
- **Avoid**: AgentDB Fast API, LinearAttention
- **Wait for stable**: Full attention suite, sub-linear search

---

**Benchmark Date**: December 3, 2025
**Next Review**: After v2.0.2-alpha or beta release
**Benchmark Platform**: Node.js (production environment simulation)
