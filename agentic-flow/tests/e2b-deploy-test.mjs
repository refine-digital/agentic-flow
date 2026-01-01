/**
 * E2B Swarm Deployment Test
 * Deploys and validates E2B swarm with live agents
 */
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../../.env') });
config({ path: join(__dirname, '../../../.env') });

import {
  E2BSwarmOrchestrator,
  createSwarmOptimizer,
  isE2BAvailable
} from '../dist/sdk/index.js';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║           E2B SWARM DEPLOYMENT VALIDATION                    ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const startTime = Date.now();

// Check E2B availability
console.log('1. Checking E2B Configuration...');
const e2bKey = process.env.E2B_API_KEY;
console.log(`   API Key: ${e2bKey ? e2bKey.slice(0, 10) + '...' : 'NOT SET'}`);

const available = await isE2BAvailable();
console.log(`   E2B SDK Available: ${available ? '✓ Yes' : '✗ No'}`);

if (!available) {
  console.log('\n⚠️  E2B SDK not available. Installing...');
  console.log('   Run: npm install e2b @e2b/code-interpreter');
  process.exit(1);
}

// Initialize swarm
console.log('\n2. Initializing E2B Swarm...');
const swarm = new E2BSwarmOrchestrator({
  maxAgents: 4,
  defaultTimeout: 60000,
  loadBalancing: 'capability-match'
});

await swarm.initialize();
console.log('   ✓ Swarm initialized');

// Spawn agents
console.log('\n3. Spawning E2B Agents...');
const agentConfigs = [
  { id: 'python-1', name: 'Python Executor', capability: 'python-executor' },
  { id: 'js-1', name: 'JavaScript Executor', capability: 'javascript-executor' },
  { id: 'shell-1', name: 'Shell Executor', capability: 'shell-executor' }
];

const spawnResults = [];
for (const config of agentConfigs) {
  console.log(`   Spawning ${config.name}...`);
  const agent = await swarm.spawnAgent(config);
  if (agent) {
    console.log(`   ✓ ${config.name} ready (${agent.id})`);
    spawnResults.push({ ...config, success: true });
  } else {
    console.log(`   ✗ ${config.name} failed`);
    spawnResults.push({ ...config, success: false });
  }
}

const successfulAgents = spawnResults.filter(r => r.success).length;
console.log(`\n   Agents: ${successfulAgents}/${agentConfigs.length} spawned`);

// Execute test tasks
console.log('\n4. Executing Test Tasks...');
const testTasks = [
  { id: 'test-py', type: 'python', code: 'print("Hello from Python!", 2+2)', name: 'Python Math' },
  { id: 'test-js', type: 'javascript', code: 'console.log("Hello from JS!", 3*3)', name: 'JS Math' },
  { id: 'test-sh', type: 'shell', code: 'echo "Hello from Shell!" && date', name: 'Shell Echo' }
];

const taskResults = [];
for (const task of testTasks) {
  if (successfulAgents === 0) {
    console.log(`   ⊘ ${task.name} skipped (no agents)`);
    continue;
  }

  console.log(`   Running ${task.name}...`);
  const result = await swarm.executeTask(task);
  taskResults.push(result);

  if (result.success) {
    console.log(`   ✓ ${task.name}: ${result.output.trim().slice(0, 50)}`);
  } else {
    console.log(`   ✗ ${task.name}: ${result.error}`);
  }
}

// Run optimizer
console.log('\n5. Running Optimization...');
const optimizer = createSwarmOptimizer(swarm);
const report = await optimizer.optimize();
console.log(`   Health Score: ${report.healthScore}/100`);
console.log(`   Recommendations: ${report.recommendations.length}`);

// Get final metrics
console.log('\n6. Final Metrics...');
const metrics = swarm.getMetrics();
console.log(`   Total Agents: ${metrics.totalAgents}`);
console.log(`   Tasks Completed: ${metrics.tasksCompleted}`);
console.log(`   Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
console.log(`   Avg Execution Time: ${metrics.averageExecutionTime.toFixed(2)}ms`);

// Health check
console.log('\n7. Health Check...');
const health = await swarm.healthCheck();
console.log(`   Swarm Healthy: ${health.healthy ? '✓ Yes' : '✗ No'}`);
for (const agent of health.agents) {
  console.log(`   - ${agent.id}: ${agent.status} (${agent.healthy ? 'healthy' : 'unhealthy'})`);
}

// Cleanup
console.log('\n8. Cleanup...');
await swarm.shutdown();
console.log('   ✓ Swarm shutdown complete');

// Summary
const duration = ((Date.now() - startTime) / 1000).toFixed(2);
const successTasks = taskResults.filter(r => r.success).length;

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                    DEPLOYMENT SUMMARY                        ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log(`║  Agents Spawned:     ${successfulAgents}/${agentConfigs.length}                                    ║`);
console.log(`║  Tasks Executed:     ${successTasks}/${testTasks.length}                                    ║`);
console.log(`║  Health Score:       ${report.healthScore}/100                                 ║`);
console.log(`║  Duration:           ${duration}s                                   ║`);
console.log('╠══════════════════════════════════════════════════════════════╣');

if (successfulAgents > 0 && successTasks > 0) {
  console.log('║  Status:             ✓ DEPLOYMENT SUCCESSFUL                 ║');
} else if (successfulAgents > 0) {
  console.log('║  Status:             ⚠ PARTIAL SUCCESS                       ║');
} else {
  console.log('║  Status:             ✗ DEPLOYMENT FAILED                     ║');
}
console.log('╚══════════════════════════════════════════════════════════════╝');

process.exit(successfulAgents > 0 ? 0 : 1);
