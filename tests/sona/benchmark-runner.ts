#!/usr/bin/env tsx
/**
 * SONA Benchmark Runner
 *
 * Simple CLI tool to run performance benchmarks with different configurations
 */

import { runAllBenchmarks } from './sona-performance.bench';

interface BenchmarkOptions {
  warmup?: number;
  iterations?: number;
  verbose?: boolean;
  gc?: boolean;
}

function parseArgs(): BenchmarkOptions {
  const args = process.argv.slice(2);
  const options: BenchmarkOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--warmup':
        options.warmup = parseInt(args[++i], 10);
        break;
      case '--iterations':
        options.iterations = parseInt(args[++i], 10);
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--gc':
        options.gc = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
SONA Benchmark Runner

Usage: npm run bench:sona [options]

Options:
  --warmup <n>       Number of warmup iterations (default: 100)
  --iterations <n>   Number of measurement iterations (default: 1000)
  --verbose          Enable verbose output
  --gc               Enable garbage collection between tests (requires --expose-gc)
  --help             Show this help message

Examples:
  npm run bench:sona
  npm run bench:sona -- --iterations 5000 --verbose
  node --expose-gc tests/sona/benchmark-runner.ts --gc

Environment:
  NODE_ENV=production    Run in production mode
  BENCHMARK_QUICK=1      Run quick benchmark (fewer iterations)
`);
}

async function main() {
  console.log('🧠 SONA Performance Benchmark Suite\n');

  const options = parseArgs();

  if (options.verbose) {
    console.log('Options:', options);
  }

  // Check for GC availability
  if (options.gc && !global.gc) {
    console.warn('⚠️  Warning: --gc flag requires Node.js to be started with --expose-gc');
    console.warn('    Example: node --expose-gc tests/sona/benchmark-runner.ts --gc\n');
  }

  // Quick benchmark mode
  if (process.env.BENCHMARK_QUICK === '1') {
    console.log('⚡ Quick benchmark mode enabled (reduced iterations)\n');
  }

  // Production mode
  if (process.env.NODE_ENV === 'production') {
    console.log('🏭 Production mode enabled\n');
  }

  const startTime = Date.now();

  try {
    await runAllBenchmarks();

    const duration = Date.now() - startTime;
    console.log(`\n⏱️  Total benchmark time: ${(duration / 1000).toFixed(2)}s`);

  } catch (error) {
    console.error('\n❌ Benchmark failed:', error);
    process.exit(1);
  }
}

// Run
main().catch(console.error);
