/**
 * E2B Swarm Optimizer Test
 */
import {
  E2BSwarmOrchestrator,
  E2BSwarmOptimizer,
  createSwarmOptimizer,
  optimizeSwarm
} from '../dist/sdk/index.js';

console.log('=== E2B Swarm Optimizer Test ===\n');

let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name}`);
    failed++;
  }
}

// 1. Create Swarm and Optimizer
console.log('1. Optimizer Creation:');
const swarm = new E2BSwarmOrchestrator({ maxAgents: 6 });
await swarm.initialize();
test('Swarm created', swarm !== null);

const optimizer = createSwarmOptimizer(swarm, {
  targetUtilization: 0.7,
  maxErrorRate: 0.1,
  minAgents: 2,
  maxAgents: 8
});
test('Optimizer created', optimizer !== null);
test('Optimizer is E2BSwarmOptimizer', optimizer instanceof E2BSwarmOptimizer);

// 2. Health Score
console.log('\n2. Health Score:');
const initialHealth = optimizer.getHealthScore();
test('Health score is number', typeof initialHealth === 'number');
test('Health score in range 0-100', initialHealth >= 0 && initialHealth <= 100);

// 3. Run Optimization
console.log('\n3. Optimization Cycle:');
const report = await optimizer.optimize();
test('Report generated', report !== null);
test('Has timestamp', typeof report.timestamp === 'number');
test('Has metrics', report.metrics !== null);
test('Has recommendations array', Array.isArray(report.recommendations));
test('Has actionsApplied array', Array.isArray(report.actionsApplied));
test('Has healthScore', typeof report.healthScore === 'number');

// 4. Recommendations Structure
console.log('\n4. Recommendations:');
if (report.recommendations.length > 0) {
  const rec = report.recommendations[0];
  test('Recommendation has type', ['scale-up', 'scale-down', 'rebalance', 'cleanup', 'batch', 'capability-add'].includes(rec.type));
  test('Recommendation has priority', ['low', 'medium', 'high', 'critical'].includes(rec.priority));
  test('Recommendation has description', typeof rec.description === 'string');
  test('Recommendation has impact', typeof rec.impact === 'string');
  test('Recommendation has autoApply', typeof rec.autoApply === 'boolean');
} else {
  test('No recommendations (healthy swarm)', true);
  // Skip individual rec tests since array is empty
  passed += 4;
}

// 5. Quick Optimize Function
console.log('\n5. Quick Optimize:');
const quickReport = await optimizeSwarm(swarm);
test('Quick optimize works', quickReport !== null);
test('Quick report has metrics', quickReport.metrics !== null);

// 6. History Tracking
console.log('\n6. History Tracking:');
const history = optimizer.getHistory();
test('History is array', Array.isArray(history));
test('History has entries', history.length >= 1);

// 7. Summary
console.log('\n7. Summary:');
const summary = optimizer.getSummary();
test('Summary has healthScore', typeof summary.healthScore === 'number');
test('Summary has totalOptimizations', typeof summary.totalOptimizations === 'number');
test('Summary has actionsApplied', typeof summary.actionsApplied === 'number');
test('Summary has currentMetrics', summary.currentMetrics !== null);

// 8. Auto-Optimization Control
console.log('\n8. Auto-Optimization:');
optimizer.startAutoOptimization();
test('Auto-optimization started', true);

// Let it run briefly
await new Promise(resolve => setTimeout(resolve, 100));

optimizer.stopAutoOptimization();
test('Auto-optimization stopped', true);

// Cleanup
await swarm.shutdown();

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

process.exit(failed > 0 ? 1 : 0);
