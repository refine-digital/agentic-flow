# SONA Performance Benchmarks

Comprehensive performance testing suite for Self-Optimizing Neural Architecture (SONA) training system.

## Overview

This benchmark suite validates SONA's performance claims and provides detailed analysis across multiple dimensions:

### Target Performance Metrics (from KEY_FINDINGS)
- **Training**: 800 patterns/sec (1.25ms each)
- **Query**: 392 queries/sec (2.55ms total)
- **LoRA ops**: 2211 ops/sec
- **Storage**: ~3KB per pattern

## Benchmark Scenarios

### 1. Agent Creation Latency
Tests instantiation time for different SONA profiles:
- Real-time (minimal latency)
- Balanced (production default)
- Batch (high throughput)
- Research (maximum quality)
- Edge (minimal memory)

**Metrics**: p50, p95, p99 latency, throughput (agents/sec)

### 2. Training Throughput
Measures pattern learning performance:
- Trajectory creation
- Step addition (activations + attention weights)
- Quality scoring
- Learning cycle execution

**Metrics**: patterns/sec, latency distribution, memory usage

### 3. Query Latency
Tests pattern retrieval with different k values (1, 3, 5, 10, 20):
- HNSW vector search
- Pattern similarity calculation
- Result ranking

**Metrics**: queries/sec, p50/p95/p99 latency per k value

### 4. LoRA Operations
Benchmarks neural adaptation layers:
- Micro-LoRA (rank-2 optimization)
- Base-LoRA (layer-specific adaptation)

**Metrics**: ops/sec, sub-millisecond latency

### 5. Memory Usage
Analyzes memory consumption:
- Per-pattern storage cost
- Scaling with pattern count (10-1000)
- Memory efficiency vs. quality

**Metrics**: bytes per pattern, total memory, target comparison

### 6. Scaling Behavior
Tests performance with increasing data:
- Pattern counts: 10, 100, 1000, 10000
- Creation time scaling
- Query time scaling
- Memory growth

**Metrics**: O(n) behavior, breaking points, efficiency

### 7. Batch Training Efficiency
Evaluates bulk processing:
- Batch sizes: 10, 50, 100, 500
- Multi-batch workflows
- Learning cycle optimization

**Metrics**: patterns/sec, batch throughput, efficiency ratio

## Running Benchmarks

### Basic Usage

```bash
# Run all benchmarks (default configuration)
npm run bench:sona

# Or directly with tsx
npx tsx tests/sona/sona-performance.bench.ts
```

### Advanced Usage

```bash
# Custom iterations
npm run bench:sona -- --iterations 5000 --warmup 200

# Enable verbose output
npm run bench:sona -- --verbose

# Enable garbage collection between tests
node --expose-gc tests/sona/benchmark-runner.ts --gc

# Quick benchmark (reduced iterations)
BENCHMARK_QUICK=1 npm run bench:sona

# Production mode
NODE_ENV=production npm run bench:sona
```

### CLI Options

- `--warmup <n>`: Number of warmup iterations (default: 100)
- `--iterations <n>`: Measurement iterations (default: 1000)
- `--verbose`: Enable detailed output
- `--gc`: Force GC between tests (requires `--expose-gc`)
- `--help`: Show help message

## Output

### Console Output
Real-time progress with:
- Per-benchmark results
- Latency percentiles (p50, p95, p99, p999)
- Throughput metrics
- Target comparison (✅ PASS / ❌ BELOW TARGET)

### Report Files
Generated in `benchmark-results/`:

1. **Text Report** (`sona-performance-YYYY-MM-DD.txt`)
   - Summary of all benchmarks
   - Performance analysis
   - Recommendations

2. **JSON Data** (`sona-performance-YYYY-MM-DD.json`)
   - Machine-readable results
   - Full statistics
   - Metadata for analysis

## Interpreting Results

### Performance Targets

| Metric | Target | Status Check |
|--------|--------|--------------|
| Training | 800 patterns/sec | ✅ if ≥800 |
| Query (k=3) | 392 queries/sec | ✅ if ≥392 |
| LoRA ops | 2211 ops/sec | ✅ if ≥2211 |
| Memory | 3KB per pattern | ✅ if ≤3KB |

### Profile Recommendations

**Real-time** (`real-time`)
- Use when: Sub-millisecond latency required
- Trade-off: Lower quality threshold (0.7)
- Memory: ~2MB for 1000 patterns
- Best for: Live inference, streaming

**Balanced** (`balanced`) ⭐ Default
- Use when: Production deployment
- Trade-off: 18ms overhead, +25% quality
- Memory: ~5MB for 5000 patterns
- Best for: Most applications

**Batch** (`batch`)
- Use when: Offline processing
- Trade-off: Higher capacity (5000)
- Memory: ~15MB for 5000 patterns
- Best for: Bulk training, ETL

**Research** (`research`)
- Use when: Maximum quality needed
- Trade-off: 100 clusters, +55% quality
- Memory: ~30MB for 10000 patterns
- Best for: Fine-tuning, experiments

**Edge** (`edge`)
- Use when: Resource-constrained
- Trade-off: Rank-1, 200 capacity
- Memory: <5MB total
- Best for: Mobile, embedded

### Optimization Guidelines

**If Training Below Target**:
1. Use batch profile
2. Increase `trajectoryCapacity`
3. Enable SIMD (`enableSimd: true`)
4. Consider rank-2 over rank-1 (+5% speed)

**If Query Below Target**:
1. Reduce `patternClusters` (100→50)
2. Use lower k values (3 vs 10)
3. Enable HNSW indexing
4. Use real-time profile

**If Memory Above Target**:
1. Use edge profile
2. Reduce `trajectoryCapacity`
3. Lower `patternClusters`
4. Use rank-1 instead of rank-2

## Example Output

```
📊 Benchmark 2: Training Throughput

Testing profile: balanced
  p50: 1.243ms | p95: 1.876ms
  Throughput: 804 patterns/sec
  Learning: 45.23ms for 100 patterns
  Target: 800 patterns/sec (1.25ms each) - ✅ PASS

Testing profile: research
  p50: 1.892ms | p95: 2.345ms
  Throughput: 529 patterns/sec
  Learning: 156.78ms for 100 patterns
  Target: 800 patterns/sec (1.25ms each) - ❌ BELOW TARGET
```

## Integration with CI/CD

Add to `.github/workflows/benchmarks.yml`:

```yaml
name: SONA Benchmarks

on:
  push:
    branches: [main]
  pull_request:

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run bench:sona
      - uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: benchmark-results/
```

## Troubleshooting

### Out of Memory
```bash
# Increase Node.js heap size
node --max-old-space-size=4096 tests/sona/benchmark-runner.ts
```

### Slow Performance
```bash
# Use quick mode for development
BENCHMARK_QUICK=1 npm run bench:sona

# Reduce iterations
npm run bench:sona -- --iterations 100 --warmup 10
```

### Inconsistent Results
```bash
# Enable GC for stable memory measurements
node --expose-gc tests/sona/benchmark-runner.ts --gc

# Run in production mode
NODE_ENV=production npm run bench:sona
```

## Contributing

When adding new benchmarks:

1. Follow existing patterns in `sona-performance.bench.ts`
2. Include warmup phase
3. Calculate percentiles (p50, p95, p99, p999)
4. Compare against targets
5. Document expected behavior

## References

- [SONA Service Implementation](../../agentic-flow/src/services/sona-service.ts)
- [SONA Package](https://www.npmjs.com/package/@ruvector/sona)
- [Vibecast Test Patterns](https://github.com/ruvnet/vibecast/tree/claude/test-ruvector-sona-01Raj3Q3P4qjff4JGVipJhvz)
- [KEY_FINDINGS.md](https://github.com/ruvnet/vibecast/blob/claude/test-ruvector-sona-01Raj3Q3P4qjff4JGVipJhvz/KEY_FINDINGS.md)
