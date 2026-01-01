# Contributing to Agentic-Flow Benchmarks

Thank you for contributing to the Agentic-Flow benchmark suite! This guide will help you add new benchmarks and maintain existing ones.

## Benchmark Structure

### File Organization

```
benchmarks/
├── src/                      # Benchmark implementations
│   └── your-feature.bench.ts # New benchmark file
├── utils/
│   ├── benchmark.ts          # Core benchmark utilities
│   └── report-generator.ts   # HTML report generator
├── data/
│   ├── baseline-v1.0.json    # Historical baseline
│   └── results-v2.0.json     # Current results
└── reports/
    └── benchmark-report.html # Generated report
```

### Creating a New Benchmark

1. **Create benchmark file** in `src/`:

```typescript
/**
 * Your Feature Performance Benchmarks
 * Target: <XXms P50 for your operation
 */

import { benchmark, benchmarkSuite, formatDuration } from '../utils/benchmark';

export async function runYourFeatureBenchmark(): Promise<void> {
  console.log('\n🎯 Your Feature Performance Benchmark');
  console.log('Target: <XXms P50');
  console.log('─'.repeat(80));

  // Setup
  const yourSetup = setupYourFeature();

  // Run benchmark
  const result = await benchmark(
    async () => {
      // Your code to benchmark
      await yourSetup.doSomething();
    },
    {
      iterations: 1000,
      warmup: 100,
      name: 'your-feature-benchmark',
    }
  );

  // Validate against target
  const targetP50 = 10; // ms
  const targetMet = result.p50 <= targetP50;

  console.log(`\n🎯 Target Analysis:`);
  console.table({
    'Target P50': `${targetP50}ms`,
    'Actual P50': formatDuration(result.p50),
    'Status': targetMet ? '✅ PASS' : '❌ FAIL',
  });
}

// Run if executed directly
if (require.main === module) {
  (async () => {
    try {
      await runYourFeatureBenchmark();
      process.exit(0);
    } catch (error) {
      console.error('❌ Benchmark failed:', error);
      process.exit(1);
    }
  })();
}
```

2. **Add to package.json**:

```json
{
  "scripts": {
    "benchmark:your-feature": "ts-node src/your-feature.bench.ts"
  }
}
```

3. **Update run-all.ts**:

```typescript
import { runYourFeatureBenchmark } from './src/your-feature.bench';

// In main() function:
console.log('\n' + '═'.repeat(80));
console.log('🎯 YOUR FEATURE BENCHMARKS');
console.log('═'.repeat(80));
await runYourFeatureBenchmark();
```

## Benchmark Best Practices

### 1. Warmup Phase

Always include a warmup phase to eliminate JIT compilation effects:

```typescript
const result = await benchmark(fn, {
  iterations: 1000,
  warmup: 100, // 10% of iterations is a good rule of thumb
});
```

### 2. Consistent Environment

- Close unnecessary applications
- Disable CPU throttling
- Use dedicated hardware for CI benchmarks
- Run benchmarks multiple times and average results

### 3. Sample Size

Choose appropriate iteration counts:

- **Fast operations (<1ms)**: 10,000+ iterations
- **Medium operations (1-10ms)**: 1,000-5,000 iterations
- **Slow operations (>10ms)**: 100-1,000 iterations

### 4. Statistical Significance

Always report percentiles, not just averages:

```typescript
console.table({
  'P50': formatDuration(result.p50),
  'P95': formatDuration(result.p95),
  'P99': formatDuration(result.p99),
  'Mean': formatDuration(result.mean),
  'Std Dev': formatDuration(result.stdDev),
});
```

### 5. Performance Targets

Set realistic targets based on:
- Previous version performance
- Production requirements
- Industry benchmarks

Document your rationale:

```typescript
// Target: <10ms P50
// Rationale: 150x improvement over v1.0 (1500ms → 10ms)
// Required for real-time agent coordination
const targetP50 = 10;
```

## Regression Detection

### Adding Baseline Data

1. Run benchmarks on v1.0 (or previous version):
```bash
npm run benchmark
```

2. Save results as baseline:
```bash
cp data/results-v2.0.json data/baseline-v1.0.json
```

3. Update baseline in `regression.bench.ts`:
```typescript
const PERFORMANCE_TARGETS = {
  'your-feature': 10, // 10x faster than baseline
};
```

### Regression Thresholds

Default thresholds in `compareWithBaseline()`:
- **Mean**: 10% regression allowed
- **P50**: 10% regression allowed
- **P95**: 20% regression allowed
- **P99**: 30% regression allowed

Customize for specific benchmarks:

```typescript
const regressionResults = compareWithBaseline(current, baseline, {
  mean: 1.05,  // Only 5% regression allowed
  p50: 1.05,
  p95: 1.10,
  p99: 1.15,
});
```

## CI/CD Integration

### GitHub Actions Workflow

The benchmark workflow runs on:
- Pull requests (regression detection)
- Main branch commits (baseline updates)
- Nightly schedule (comprehensive suite)

### Adding Benchmark to CI

1. Ensure your benchmark can run headless (no manual input)
2. Add to `.github/workflows/benchmarks.yml`:

```yaml
- name: Run Your Feature Benchmarks
  run: |
    cd benchmarks
    npm run benchmark:your-feature
  continue-on-error: true
```

3. Update regression analysis to include your benchmark

## HTML Report Generation

The report generator automatically includes all benchmarks in `data/results-v2.0.json`.

To customize visualization:

1. Edit `utils/report-generator.ts`
2. Add custom chart configuration
3. Regenerate report:

```bash
npm run benchmark:report
```

## Testing Benchmarks

### Unit Tests

Create test file: `src/__tests__/your-feature.bench.test.ts`

```typescript
import { runYourFeatureBenchmark } from '../your-feature.bench';

describe('Your Feature Benchmark', () => {
  it('should complete without errors', async () => {
    await expect(runYourFeatureBenchmark()).resolves.not.toThrow();
  });

  it('should meet performance targets', async () => {
    const result = await runYourFeatureBenchmark();
    expect(result.p50).toBeLessThan(10); // your target
  });
});
```

### Local Validation

```bash
# Quick validation (reduced iterations)
npm run benchmark:quick

# Full benchmark suite
npm run benchmark

# Specific benchmark
npm run benchmark:your-feature

# With regression analysis
npm run benchmark:regression
```

## Performance Optimization Tips

### 1. Identify Bottlenecks

Use the profiler to find slow sections:

```typescript
console.time('operation');
await yourOperation();
console.timeEnd('operation');
```

### 2. Benchmark Variations

Test different approaches:

```typescript
const approaches = [
  { name: 'approach-a', fn: () => approachA() },
  { name: 'approach-b', fn: () => approachB() },
  { name: 'approach-c', fn: () => approachC() },
];

for (const { name, fn } of approaches) {
  const result = await benchmark(fn, { name });
  // Compare results
}
```

### 3. Memory Profiling

Track memory usage:

```typescript
const before = process.memoryUsage();
await yourOperation();
const after = process.memoryUsage();

console.log('Memory delta:', {
  heapUsed: (after.heapUsed - before.heapUsed) / 1024 / 1024 + ' MB',
  external: (after.external - before.external) / 1024 / 1024 + ' MB',
});
```

## Troubleshooting

### Inconsistent Results

**Problem**: Benchmark results vary significantly between runs.

**Solutions**:
1. Increase warmup iterations
2. Increase sample size
3. Close background applications
4. Check for system throttling
5. Run on dedicated hardware

### Memory Leaks

**Problem**: Memory usage grows during benchmark.

**Solutions**:
1. Add explicit cleanup in benchmark loop
2. Use `--expose-gc` and call `global.gc()`
3. Profile with `--inspect` flag

### Slow Benchmarks

**Problem**: Benchmark takes too long to complete.

**Solutions**:
1. Reduce iterations for expensive operations
2. Use `maxTime` option to cap benchmark duration
3. Implement sampling for large datasets

## Code Review Checklist

Before submitting a benchmark PR:

- [ ] Benchmark runs without errors
- [ ] Performance target is documented and justified
- [ ] Warmup phase is included
- [ ] Adequate sample size (min 100 iterations)
- [ ] Results are reproducible
- [ ] Added to `run-all.ts`
- [ ] Added to `package.json` scripts
- [ ] Updated README with benchmark description
- [ ] CI workflow updated (if needed)
- [ ] Baseline data added (if new feature)
- [ ] Regression thresholds set

## Questions?

- Open an issue: https://github.com/ruvnet/agentic-flow/issues
- Discussions: https://github.com/ruvnet/agentic-flow/discussions
- Documentation: https://docs.agentic-flow.dev

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
