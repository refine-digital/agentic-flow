# SONA Performance Benchmarks

Comprehensive performance analysis for Self-Optimizing Neural Architecture (SONA) training system.

## Executive Summary

This benchmark suite validates SONA's performance claims and provides actionable insights for optimization. The benchmarks measure 7 key dimensions across 5 different configuration profiles.

### Target Performance Metrics

Based on KEY_FINDINGS from vibecast research:

| Metric | Target | Unit | Baseline |
|--------|--------|------|----------|
| Training Throughput | 800 | patterns/sec | 1.25ms per pattern |
| Query Latency (k=3) | 392 | queries/sec | 2.55ms total |
| LoRA Operations | 2211 | ops/sec | Sub-millisecond |
| Memory per Pattern | 3 | KB | ~3072 bytes |

## Benchmark Architecture

### 7 Core Benchmarks

1. **Agent Creation Latency**
   - Tests initialization time for different profiles
   - Measures cold start performance
   - Validates profile configuration overhead

2. **Training Throughput**
   - End-to-end trajectory processing
   - Pattern learning cycle efficiency
   - Quality score tracking

3. **Query Latency**
   - HNSW vector search performance
   - K-value impact analysis (k=1,3,5,10,20)
   - Pattern similarity computation

4. **LoRA Operations**
   - Micro-LoRA (rank-2 optimization)
   - Base-LoRA (layer-specific adaptation)
   - SIMD acceleration validation

5. **Memory Usage**
   - Per-pattern storage cost
   - Scaling behavior (10-1000 patterns)
   - Memory efficiency vs. quality trade-offs

6. **Scaling Behavior**
   - Pattern count impact (10, 100, 1000, 10000)
   - Time complexity analysis
   - Breaking point identification

7. **Batch Training Efficiency**
   - Bulk processing performance
   - Batch size optimization (10-500)
   - Learning cycle throughput

### 5 Configuration Profiles

Each benchmark runs across multiple profiles to identify optimal configurations:

| Profile | Use Case | Key Settings | Memory Target |
|---------|----------|--------------|---------------|
| **real-time** | Low latency | rank-2, 25 clusters, 0.7 threshold | ~2MB/1000 |
| **balanced** ⭐ | Production | rank-2, 50 clusters, 0.4 threshold | ~5MB/5000 |
| **batch** | Bulk processing | rank-2/8, 5000 capacity | ~15MB/5000 |
| **research** | Max quality | rank-2/16, 100 clusters, 0.2 threshold | ~30MB/10000 |
| **edge** | Constrained | rank-1, 15 clusters, 200 capacity | <5MB total |

## Running Benchmarks

### Quick Start

```bash
# Run full benchmark suite
npm run bench:sona

# Quick benchmark (reduced iterations)
npm run bench:sona:quick

# With garbage collection (requires --expose-gc)
npm run bench:sona:gc
```

### Advanced Usage

```bash
# Custom iterations
npx tsx tests/sona/sona-performance.bench.ts --iterations 5000

# Verbose output
npx tsx tests/sona/sona-performance.bench.ts --verbose

# Production mode
NODE_ENV=production npm run bench:sona

# With explicit GC between tests
node --expose-gc tests/sona/benchmark-runner.ts --gc
```

### Environment Variables

- `BENCHMARK_QUICK=1`: Reduced iterations for quick validation
- `NODE_ENV=production`: Production optimization mode
- `NODE_OPTIONS="--max-old-space-size=4096"`: Increase heap size

## Output Format

### Console Output

Real-time progress with detailed metrics:

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

### Generated Reports

Located in `benchmark-results/`:

1. **Text Report** (`sona-performance-YYYY-MM-DD-HHmmss.txt`)
   - Executive summary
   - Per-benchmark detailed results
   - Performance analysis
   - Recommendations

2. **JSON Data** (`sona-performance-YYYY-MM-DD-HHmmss.json`)
   - Machine-readable results
   - Full statistics (min, max, mean, p50, p95, p99, p999, stdDev)
   - Metadata for analysis

## Performance Analysis

### Latency Percentiles

All benchmarks report comprehensive latency distributions:

- **p50 (median)**: Typical case performance
- **p95**: 95% of requests complete within this time
- **p99**: 99% of requests (captures tail latency)
- **p999**: 99.9% (extreme tail, identifies outliers)

### Throughput Calculations

```
throughput = iterations / (total_time_seconds)
```

Benchmarks measure both:
- **Sustained throughput**: Over long runs
- **Peak throughput**: Best-case scenario
- **Average throughput**: Across all runs

### Memory Measurements

```
per_pattern_memory = (heap_after - heap_before) / pattern_count
```

Includes:
- Heap used (actual memory allocation)
- Heap total (reserved memory)
- External memory (native allocations)
- RSS (resident set size)

## Optimization Guidelines

### Profile Selection Decision Tree

```
Start
  ↓
Latency critical? ────yes───→ real-time profile
  ↓ no
Memory constrained? ──yes───→ edge profile
  ↓ no
Quality critical? ────yes───→ research profile
  ↓ no
Bulk processing? ────yes───→ batch profile
  ↓ no
  → balanced profile (default) ⭐
```

### Performance Tuning

#### If Training Below Target (< 800 patterns/sec)

1. **Use batch profile**
   ```typescript
   const sona = createSONAService({ profile: 'batch' });
   ```

2. **Increase trajectory capacity**
   ```typescript
   const sona = createSONAService({
     trajectoryCapacity: 10000  // vs default 5000
   });
   ```

3. **Enable SIMD** (if not already)
   ```typescript
   const sona = createSONAService({
     enableSimd: true  // +10% performance
   });
   ```

4. **Use rank-2 over rank-1**
   ```typescript
   const sona = createSONAService({
     microLoraRank: 2  // +5% faster than rank-1
   });
   ```

#### If Query Below Target (< 392 queries/sec)

1. **Reduce cluster count**
   ```typescript
   const sona = createSONAService({
     patternClusters: 50  // vs 100
   });
   // Expected: 3.0ms → 1.3ms (breakpoint optimization)
   ```

2. **Use lower k values**
   ```typescript
   // k=3 optimal: 761 decisions/sec
   const patterns = sona.findPatterns(query, 3);
   ```

3. **Use real-time profile**
   ```typescript
   const sona = createSONAService({ profile: 'real-time' });
   // Target: <0.5ms per operation
   ```

#### If Memory Above Target (> 3KB per pattern)

1. **Use edge profile**
   ```typescript
   const sona = createSONAService({ profile: 'edge' });
   // Target: <5MB total, rank-1
   ```

2. **Reduce trajectory capacity**
   ```typescript
   const sona = createSONAService({
     trajectoryCapacity: 1000  // vs 5000
   });
   ```

3. **Lower cluster count**
   ```typescript
   const sona = createSONAService({
     patternClusters: 25  // vs 50
   });
   ```

4. **Use rank-1**
   ```typescript
   const sona = createSONAService({
     microLoraRank: 1  // Lower memory footprint
   });
   ```

### Quality vs. Performance Trade-offs

| Configuration | Latency | Quality Gain | Memory | Use When |
|---------------|---------|--------------|--------|----------|
| rank-2, LR=0.002, thresh=0.2 | 18ms | +55% | High | Research |
| rank-2, LR=0.002, thresh=0.4 | 18ms | +25% | Medium | Production |
| rank-2, 25 clusters, thresh=0.7 | <0.5ms | +15% | Low | Real-time |
| rank-1, 15 clusters | <0.3ms | +8% | Very Low | Edge |

### Scaling Characteristics

Expected behavior as pattern count increases:

| Pattern Count | Creation Time | Query Time (k=3) | Memory | Notes |
|--------------|---------------|------------------|--------|-------|
| 10 | ~12ms | ~0.8ms | ~30KB | Baseline |
| 100 | ~125ms | ~1.2ms | ~300KB | Linear |
| 1000 | ~1.25s | ~1.8ms | ~3MB | Sub-linear query |
| 10000 | ~12.5s | ~2.5ms | ~30MB | HNSW efficiency |

## Validation Tests

Quick validation suite (faster than full benchmarks):

```bash
# Run validation tests
npm test -- tests/sona/benchmark-validation.test.ts

# Or with Jest directly
npx jest tests/sona/benchmark-validation.test.ts
```

Validation tests ensure:
- All profiles instantiate correctly
- Basic operations complete successfully
- Performance is within reasonable bounds
- Memory usage is controlled

## CI/CD Integration

### GitHub Actions Example

```yaml
name: SONA Benchmarks

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  benchmark:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run validation tests
        run: npm test -- tests/sona/benchmark-validation.test.ts

      - name: Run benchmarks
        run: npm run bench:sona

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: benchmark-results/

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = fs.readFileSync('benchmark-results/sona-performance-latest.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## SONA Benchmark Results\n\n```\n' + results + '\n```'
            });
```

### Benchmark Regression Detection

```javascript
// scripts/check-benchmark-regression.js
const fs = require('fs');

const current = JSON.parse(fs.readFileSync('benchmark-results/current.json'));
const baseline = JSON.parse(fs.readFileSync('benchmark-results/baseline.json'));

const regressions = [];

// Check training throughput
if (current.trainingThroughput < baseline.trainingThroughput * 0.9) {
  regressions.push('Training throughput regressed by >10%');
}

// Check query latency
if (current.queryLatency.p95 > baseline.queryLatency.p95 * 1.1) {
  regressions.push('Query p95 latency regressed by >10%');
}

if (regressions.length > 0) {
  console.error('❌ Performance regressions detected:');
  regressions.forEach(r => console.error(`  - ${r}`));
  process.exit(1);
}

console.log('✅ No performance regressions detected');
```

## Troubleshooting

### Out of Memory Errors

```bash
# Increase heap size
NODE_OPTIONS="--max-old-space-size=4096" npm run bench:sona

# Or use edge profile for lower memory
SONA_PROFILE=edge npm run bench:sona
```

### Slow Benchmark Execution

```bash
# Use quick mode for development
npm run bench:sona:quick

# Or reduce iterations
npx tsx tests/sona/sona-performance.bench.ts --iterations 100 --warmup 10
```

### Inconsistent Results

```bash
# Enable GC for stable measurements
npm run bench:sona:gc

# Run multiple times and average
for i in {1..5}; do npm run bench:sona; done
```

### SIMD Not Working

```bash
# Check CPU features
node -e "console.log(require('os').cpus()[0].model)"

# Disable SIMD if unsupported
# In code:
const sona = createSONAService({ enableSimd: false });
```

## Benchmarking Best Practices

1. **Warmup Phase**: Always include warmup iterations
2. **Multiple Runs**: Average multiple runs for consistency
3. **GC Control**: Force GC between major tests
4. **Baseline Comparison**: Track performance over time
5. **Environment Consistency**: Same hardware, OS, Node version
6. **Background Processes**: Minimize interference
7. **Statistics**: Report percentiles, not just averages

## Related Documentation

- [SONA Service Implementation](../agentic-flow/src/services/sona-service.ts)
- [SONA Test Suite](../tests/sona/sona-service.test.ts)
- [Benchmark Runner](../tests/sona/benchmark-runner.ts)
- [Vibecast Research](https://github.com/ruvnet/vibecast/tree/claude/test-ruvector-sona-01Raj3Q3P4qjff4JGVipJhvz)

## Contributing

When adding new benchmarks:

1. Follow existing patterns in `sona-performance.bench.ts`
2. Include comprehensive warmup phase
3. Calculate all percentiles (p50, p95, p99, p999)
4. Compare against established targets
5. Document expected behavior and trade-offs
6. Add validation test in `benchmark-validation.test.ts`

## License

MIT License - Same as agentic-flow project

---

**Last Updated**: 2025-12-03
**Version**: 1.0.0
**Maintainer**: agentic-flow team
