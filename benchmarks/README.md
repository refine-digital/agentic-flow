# Agentic-Flow v2.0.0-alpha Performance Benchmarks

Comprehensive benchmark suite for validating all performance targets in Agentic-Flow v2.0.0-alpha.

## Performance Targets

| Metric | Target | v1.0 Baseline | Improvement |
|--------|--------|---------------|-------------|
| Vector search (1M vectors) | <10ms P50 | ~1500ms | 150x faster |
| Agent spawn | <10ms P50 | ~100ms | 10x faster |
| Memory insert | <2ms P50 | ~250ms | 125x faster |
| Task orchestration | <50ms P50 | ~250ms | 5x faster |
| Attention mechanisms (512 tokens) | <20ms P50 | N/A (new) | - |
| GNN forward pass | <50ms P50 | N/A (new) | - |

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Benchmarks

```bash
# Run all benchmarks
npm run benchmark

# Run specific benchmark suite
npm run benchmark:vector-search
npm run benchmark:agent-operations
npm run benchmark:memory
npm run benchmark:task-orchestration
npm run benchmark:attention
npm run benchmark:gnn
```

### Generate HTML Report

```bash
npm run benchmark:report
```

Open `benchmarks/reports/benchmark-report.html` in your browser.

## Benchmark Structure

```
benchmarks/
├── src/                           # Benchmark implementations
│   ├── vector-search.bench.ts     # Vector search benchmarks
│   ├── agent-operations.bench.ts  # Agent spawn/lifecycle benchmarks
│   ├── memory-operations.bench.ts # Memory insert/retrieve benchmarks
│   ├── task-orchestration.bench.ts# Task orchestration benchmarks
│   ├── attention.bench.ts         # Attention mechanism benchmarks
│   ├── gnn.bench.ts              # GNN forward pass benchmarks
│   └── regression.bench.ts        # Regression detection (v1.0 vs v2.0)
├── utils/                         # Benchmark utilities
│   ├── benchmark.ts              # Core benchmark runner
│   └── report-generator.ts       # HTML report generator
├── data/                          # Benchmark data
│   ├── baseline-v1.0.json        # v1.0 baseline results
│   └── results-v2.0.json         # v2.0 current results
├── reports/                       # Generated reports
│   └── benchmark-report.html     # Interactive HTML report
└── README.md                      # This file
```

## Benchmark Details

### Vector Search Benchmarks

Tests vector search performance across different database sizes:

- **1K vectors**: <1ms P50 target
- **10K vectors**: <5ms P50 target
- **100K vectors**: <8ms P50 target
- **1M vectors**: <10ms P50 target

Features tested:
- HNSW index performance
- Distance metrics (cosine, euclidean, dot product)
- Variable k (number of nearest neighbors)
- Cache effectiveness

```bash
npm run benchmark:vector-search
```

### Agent Operations Benchmarks

Tests agent lifecycle and coordination:

- **Agent spawn**: <10ms P50 target
- **Task execution**: Measures throughput
- **Multi-agent coordination**: Scalability testing
- **Agent memory operations**: Store/retrieve/search
- **Full lifecycle**: Spawn → execute → destroy

```bash
npm run benchmark:agent-operations
```

### Memory Operations Benchmarks

Tests memory store performance:

- **Insert**: <2ms P50 target (125x faster)
- **Retrieval**: <1ms P50 target
- **Search**: Performance with varying result sets
- **Update**: In-place updates
- **Delete**: Deletion with index cleanup
- **Batch operations**: Bulk insert/update
- **Concurrent operations**: Parallel access patterns

```bash
npm run benchmark:memory
```

### Task Orchestration Benchmarks

Tests task scheduling and coordination:

- **Orchestration**: <50ms P50 target (5x faster)
- **Scalability**: 10 to 1000 tasks
- **Dependency resolution**: Complex task graphs
- **Priority scheduling**: Priority-based task assignment

```bash
npm run benchmark:task-orchestration
```

### Attention Mechanism Benchmarks

Tests attention mechanism performance:

- **Self-attention**: <20ms P50 for 512 tokens
- **Variable sequence lengths**: 64, 128, 256, 512, 1024 tokens
- **Batch processing**: Multiple sequences
- **Hyperbolic attention**: Performance comparison

```bash
npm run benchmark:attention
```

### GNN Forward Pass Benchmarks

Tests Graph Neural Network performance:

- **Forward pass**: <50ms P50 target
- **Variable graph sizes**: 100 to 10,000 nodes
- **Message passing**: Multi-hop aggregation
- **Graph types**: Random, scale-free, small-world

```bash
npm run benchmark:gnn
```

### Regression Detection

Compares v2.0 performance against v1.0 baseline:

```bash
npm run benchmark:regression
```

Features:
- Automated regression detection
- Threshold-based alerts (10% regression tolerance)
- Detailed comparison reports
- Historical trend analysis

## Benchmark Runner API

The benchmark utility provides a high-precision timer and statistical analysis:

```typescript
import { benchmark } from './utils/benchmark';

const result = await benchmark(
  async () => {
    // Your code to benchmark
  },
  {
    iterations: 1000,  // Number of iterations
    warmup: 100,       // Warmup iterations
    name: 'my-bench',  // Benchmark name
    silent: false,     // Suppress console output
    minSamples: 5,     // Minimum samples required
    maxTime: 30000,    // Max time in ms (30s)
  }
);

// Results include:
console.log(result.p50);   // 50th percentile (median)
console.log(result.p95);   // 95th percentile
console.log(result.p99);   // 99th percentile
console.log(result.mean);  // Mean latency
console.log(result.stdDev);// Standard deviation
console.log(result.opsPerSecond); // Throughput
```

## CI/CD Integration

Benchmarks run automatically on:
- Pull requests (regression detection)
- Main branch commits (baseline updates)
- Nightly (comprehensive suite)

```yaml
# .github/workflows/benchmarks.yml
name: Performance Benchmarks

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run benchmarks
        run: npm run benchmark
      - name: Check regressions
        run: npm run benchmark:regression
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: benchmarks/data/results-v2.0.json
```

## Interpreting Results

### Performance Metrics

- **P50 (Median)**: 50% of operations complete within this time
- **P95**: 95% of operations complete within this time
- **P99**: 99% of operations complete within this time
- **P99.9**: 99.9% of operations complete within this time

### Status Indicators

- ✅ **PASS**: Performance meets or exceeds target
- ❌ **FAIL**: Performance below target threshold
- ⚠️ **WARNING**: Performance within 10% of target

### Regression Thresholds

- **Acceptable**: <10% slower than baseline
- **Warning**: 10-20% slower than baseline
- **Critical**: >20% slower than baseline

## Best Practices

1. **Consistent Environment**: Run benchmarks on dedicated hardware
2. **Warmup**: Always include warmup iterations to eliminate JIT effects
3. **Sample Size**: Use sufficient iterations for statistical significance
4. **Isolation**: Close unnecessary applications during benchmarking
5. **Multiple Runs**: Run benchmarks multiple times and compare results
6. **Baseline Updates**: Update baseline after verified improvements

## Troubleshooting

### Inconsistent Results

```bash
# Run with more iterations
npm run benchmark -- --iterations=10000

# Run multiple times and average
for i in {1..5}; do npm run benchmark; done
```

### Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=8192" npm run benchmark
```

### Slow Benchmarks

```bash
# Run with reduced iterations for quick validation
npm run benchmark -- --quick
```

## Contributing

When adding new benchmarks:

1. Follow existing benchmark structure
2. Include performance targets with rationale
3. Add comprehensive documentation
4. Update CI/CD workflows
5. Include regression tests

## License

MIT License - see LICENSE file for details

## Support

- Issues: https://github.com/ruvnet/agentic-flow/issues
- Discussions: https://github.com/ruvnet/agentic-flow/discussions
- Documentation: https://docs.agentic-flow.dev
