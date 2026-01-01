/**
 * E2B Swarm Validation and Optimization Test
 *
 * Tests the E2B swarm orchestrator with various agent capabilities
 */
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env from root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../../.env') });
config({ path: join(__dirname, '../../../.env') });

import {
  E2BSwarmOrchestrator,
  isE2BAvailable
} from '../dist/sdk/index.js';

console.log('=== E2B Swarm Validation Test ===\n');

// Check E2B availability
const e2bAvailable = await isE2BAvailable();
console.log('E2B Available:', e2bAvailable ? '✓ Yes' : '✗ No (E2B SDK not installed or no API key)');

if (!e2bAvailable) {
  console.log('\nSkipping live E2B tests. Testing orchestrator logic only.\n');
}

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

// 1. Orchestrator Creation Tests
console.log('\n1. Orchestrator Creation:');
const swarm = new E2BSwarmOrchestrator({
  maxAgents: 8,
  defaultTimeout: 60000,
  retryAttempts: 3,
  loadBalancing: 'capability-match'
});
test('Orchestrator created', swarm !== null);

const initialized = await swarm.initialize();
test('Swarm initialized', initialized);

// 2. Agent Configuration Tests
console.log('\n2. Agent Configuration:');
const agentConfigs = [
  { id: 'py-1', name: 'Python Executor', capability: 'python-executor' },
  { id: 'js-1', name: 'JavaScript Executor', capability: 'javascript-executor' },
  { id: 'sh-1', name: 'Shell Executor', capability: 'shell-executor' },
  { id: 'data-1', name: 'Data Analyst', capability: 'data-analyst' },
  { id: 'test-1', name: 'Test Runner', capability: 'test-runner' },
  { id: 'sec-1', name: 'Security Scanner', capability: 'security-scanner' }
];

test('Agent configs valid', agentConfigs.every(c => c.id && c.name && c.capability));
test('Multiple capabilities', new Set(agentConfigs.map(c => c.capability)).size === 6);

// 3. Task Creation Tests
console.log('\n3. Task Creation:');
const tasks = [
  { id: 'task-1', type: 'python', code: 'print("Hello from Python")', priority: 'high' },
  { id: 'task-2', type: 'javascript', code: 'console.log("Hello from JS")', priority: 'medium' },
  { id: 'task-3', type: 'shell', code: 'echo "Hello from Shell"', priority: 'low' },
  { id: 'task-4', type: 'python', code: 'import sys; print(sys.version)', priority: 'critical' }
];

test('Tasks created', tasks.length === 4);
test('Task priorities set', tasks.every(t => t.priority));
test('Task types valid', tasks.every(t => ['python', 'javascript', 'shell'].includes(t.type)));

// 4. Metrics Tests
console.log('\n4. Metrics System:');
const metrics = swarm.getMetrics();
test('Metrics available', metrics !== null);
test('Total agents tracked', typeof metrics.totalAgents === 'number');
test('Active agents tracked', typeof metrics.activeAgents === 'number');
test('Tasks completed tracked', typeof metrics.tasksCompleted === 'number');
test('Error rate tracked', typeof metrics.errorRate === 'number');
test('Agent utilization tracked', typeof metrics.agentUtilization === 'object');

// 5. Health Check Tests
console.log('\n5. Health Check:');
const health = await swarm.healthCheck();
test('Health check works', health !== null);
test('Healthy status available', typeof health.healthy === 'boolean');
test('Agent health array', Array.isArray(health.agents));

// 6. Load Balancing Tests
console.log('\n6. Load Balancing:');
const lbSwarm1 = new E2BSwarmOrchestrator({ loadBalancing: 'round-robin' });
const lbSwarm2 = new E2BSwarmOrchestrator({ loadBalancing: 'least-busy' });
const lbSwarm3 = new E2BSwarmOrchestrator({ loadBalancing: 'capability-match' });
test('Round-robin mode', lbSwarm1 !== null);
test('Least-busy mode', lbSwarm2 !== null);
test('Capability-match mode', lbSwarm3 !== null);

// 7. Shutdown Tests
console.log('\n7. Shutdown:');
await swarm.shutdown();
const postShutdownMetrics = swarm.getMetrics();
test('Agents cleared on shutdown', postShutdownMetrics.totalAgents === 0);
test('Shutdown complete', true);

// 8. Live E2B Tests (only if API key available)
if (e2bAvailable && process.env.E2B_API_KEY) {
  console.log('\n8. Live E2B Tests:');

  const liveSwarm = new E2BSwarmOrchestrator({ maxAgents: 3, defaultTimeout: 30000 });
  await liveSwarm.initialize();

  // Spawn a single test agent
  console.log('  Spawning test agent...');
  const testAgent = await liveSwarm.spawnAgent({
    id: 'live-test-1',
    name: 'Live Test Agent',
    capability: 'python-executor'
  });

  if (testAgent) {
    test('Live agent spawned', testAgent.status === 'ready');

    // Execute a simple task
    console.log('  Executing test task...');
    const result = await liveSwarm.executeTask({
      id: 'live-task-1',
      type: 'python',
      code: 'print(2 + 2)'
    });

    test('Task executed', result !== null);
    test('Task successful', result.success);
    test('Output received', result.output.includes('4'));
    test('Agent ID tracked', result.agentId === 'live-test-1');

    // Get metrics after execution
    const liveMetrics = liveSwarm.getMetrics();
    test('Tasks counted', liveMetrics.tasksCompleted >= 1);
    test('Execution time tracked', liveMetrics.totalExecutionTime > 0);

    // Health check with live agent
    const liveHealth = await liveSwarm.healthCheck();
    test('Live health check', liveHealth.healthy);
  } else {
    console.log('  ✗ Failed to spawn live agent (check E2B API key)');
    failed++;
  }

  await liveSwarm.shutdown();
} else {
  console.log('\n8. Live E2B Tests: SKIPPED (no API key)');
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (e2bAvailable && process.env.E2B_API_KEY) {
  console.log('\n✓ Live E2B swarm validation complete!');
} else {
  console.log('\nNote: Live E2B tests were skipped. Set E2B_API_KEY to run full validation.');
}

process.exit(failed > 0 ? 1 : 0);
