#!/usr/bin/env ts-node
/**
 * Master benchmark runner
 * Runs all benchmarks and generates comprehensive report
 */

import { saveBenchmarkResults, BenchmarkResult } from './utils/benchmark';
import path from 'path';

// Import all benchmark suites
import {
  runVectorSearchBenchmarks,
  runAdvancedVectorBenchmarks,
  runDistanceMetricBenchmarks,
} from './src/vector-search.bench';

import {
  runAgentSpawnBenchmark,
  runAgentExecutionBenchmark,
  runMultiAgentCoordinationBenchmark,
  runAgentMemoryBenchmark,
  runAgentLifecycleBenchmark,
} from './src/agent-operations.bench';

import {
  runMemoryInsertBenchmark,
  runMemoryRetrievalBenchmark,
  runMemorySearchBenchmark,
  runMemoryUpdateBenchmark,
  runMemoryDeleteBenchmark,
  runBatchOperationsBenchmark,
  runConcurrentOperationsBenchmark,
} from './src/memory-operations.bench';

import {
  runTaskOrchestrationBenchmark,
  runScalabilityBenchmark,
  runDependencyResolutionBenchmark,
  runPrioritySchedulingBenchmark,
} from './src/task-orchestration.bench';

import {
  runAttentionBenchmark,
  runVariableSequenceBenchmark,
  runMultiHeadBenchmark,
  runBatchAttentionBenchmark,
  runHyperbolicAttentionBenchmark,
} from './src/attention.bench';

import {
  runGNNForwardPassBenchmark,
  runVariableGraphSizeBenchmark,
  runVariableDepthBenchmark,
  runGraphTopologyBenchmark,
  runBatchGraphBenchmark,
} from './src/gnn.bench';

import { runRegressionAnalysis, generateRegressionReport } from './src/regression.bench';

/**
 * Main execution
 */
async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('🚀 Agentic-Flow v2.0.0-alpha Comprehensive Performance Benchmark Suite');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`\nStarted: ${new Date().toLocaleString()}`);
  console.log(`Node: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Arch: ${process.arch}`);
  console.log('\n');

  const startTime = Date.now();
  const allResults: BenchmarkResult[] = [];

  try {
    // Vector Search Benchmarks
    console.log('\n' + '═'.repeat(80));
    console.log('📊 VECTOR SEARCH BENCHMARKS');
    console.log('═'.repeat(80));
    await runVectorSearchBenchmarks();
    await runAdvancedVectorBenchmarks();
    await runDistanceMetricBenchmarks();

    // Agent Operations Benchmarks
    console.log('\n' + '═'.repeat(80));
    console.log('🤖 AGENT OPERATIONS BENCHMARKS');
    console.log('═'.repeat(80));
    await runAgentSpawnBenchmark();
    await runAgentExecutionBenchmark();
    await runMultiAgentCoordinationBenchmark();
    await runAgentMemoryBenchmark();
    await runAgentLifecycleBenchmark();

    // Memory Operations Benchmarks
    console.log('\n' + '═'.repeat(80));
    console.log('💾 MEMORY OPERATIONS BENCHMARKS');
    console.log('═'.repeat(80));
    await runMemoryInsertBenchmark();
    await runMemoryRetrievalBenchmark();
    await runMemorySearchBenchmark();
    await runMemoryUpdateBenchmark();
    await runMemoryDeleteBenchmark();
    await runBatchOperationsBenchmark();
    await runConcurrentOperationsBenchmark();

    // Task Orchestration Benchmarks
    console.log('\n' + '═'.repeat(80));
    console.log('🎯 TASK ORCHESTRATION BENCHMARKS');
    console.log('═'.repeat(80));
    await runTaskOrchestrationBenchmark();
    await runScalabilityBenchmark();
    await runDependencyResolutionBenchmark();
    await runPrioritySchedulingBenchmark();

    // Attention Mechanism Benchmarks
    console.log('\n' + '═'.repeat(80));
    console.log('🧠 ATTENTION MECHANISM BENCHMARKS');
    console.log('═'.repeat(80));
    await runAttentionBenchmark();
    await runVariableSequenceBenchmark();
    await runMultiHeadBenchmark();
    await runBatchAttentionBenchmark();
    await runHyperbolicAttentionBenchmark();

    // GNN Benchmarks
    console.log('\n' + '═'.repeat(80));
    console.log('🕸️  GRAPH NEURAL NETWORK BENCHMARKS');
    console.log('═'.repeat(80));
    await runGNNForwardPassBenchmark();
    await runVariableGraphSizeBenchmark();
    await runVariableDepthBenchmark();
    await runGraphTopologyBenchmark();
    await runBatchGraphBenchmark();

    // Save results
    console.log('\n' + '═'.repeat(80));
    console.log('💾 SAVING RESULTS');
    console.log('═'.repeat(80));

    const resultsPath = path.join(__dirname, 'data/results-v2.0.json');
    await saveBenchmarkResults(allResults, resultsPath);

    // Regression Analysis
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 REGRESSION ANALYSIS');
    console.log('═'.repeat(80));
    await runRegressionAnalysis();
    await generateRegressionReport();

    // Generate HTML Report
    console.log('\n' + '═'.repeat(80));
    console.log('📄 GENERATING HTML REPORT');
    console.log('═'.repeat(80));

    const { spawn } = require('child_process');
    const reportProcess = spawn('npx', ['ts-node', 'utils/report-generator.ts'], {
      cwd: __dirname,
      stdio: 'inherit',
    });

    await new Promise((resolve, reject) => {
      reportProcess.on('close', (code: number) => {
        if (code === 0) resolve(undefined);
        else reject(new Error(`Report generation failed with code ${code}`));
      });
    });

    // Summary
    const duration = Date.now() - startTime;
    console.log('\n' + '═'.repeat(80));
    console.log('✅ BENCHMARK SUITE COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(80));
    console.log(`\nTotal Duration: ${(duration / 1000 / 60).toFixed(2)} minutes`);
    console.log(`Completed: ${new Date().toLocaleString()}`);
    console.log('\n📊 Results saved to:');
    console.log(`   - benchmarks/data/results-v2.0.json`);
    console.log(`   - benchmarks/data/regression-report.json`);
    console.log(`   - benchmarks/reports/benchmark-report.html`);
    console.log('\n💡 Open HTML report:');
    console.log(`   file://${path.join(__dirname, 'reports/benchmark-report.html')}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Benchmark suite failed:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Benchmark suite interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Benchmark suite terminated');
  process.exit(1);
});

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
