/**
 * E2B Advanced Capabilities Demo
 *
 * Runs agentic-flow in E2B sandboxes demonstrating:
 * - FastGRNN neural routing
 * - TinyDancer circuit breaker
 * - QUIC coordination
 * - SONA learning
 */
import { config } from 'dotenv';
config({ path: '/workspaces/agentic-flow/.env' });

import { E2BSwarmOrchestrator, createSwarmOptimizer } from '../dist/sdk/index.js';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║     E2B ADVANCED CAPABILITIES DEMO                           ║');
console.log('║     FastGRNN • TinyDancer • QUIC • SONA                      ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const swarm = new E2BSwarmOrchestrator({
  maxAgents: 3,
  loadBalancing: 'capability-match'
});

await swarm.initialize();

// Spawn Python agent for running agentic-flow demos
console.log('1. Spawning E2B Agent with agentic-flow...\n');
const agent = await swarm.spawnAgent({
  id: 'agentic-flow-runner',
  name: 'Agentic Flow Runner',
  capability: 'python-executor',
  packages: ['numpy', 'scipy']
});

if (!agent) {
  console.log('Failed to spawn agent');
  process.exit(1);
}

console.log('   ✓ Agent spawned:', agent.id);
console.log('   ✓ Sandbox ID:', swarm.getAgent(agent.id)?.sandbox.getSandboxId());

// Demo 1: FastGRNN-style neural routing simulation
console.log('\n2. FastGRNN Neural Routing Demo...\n');
const fastgrnnCode = `
import numpy as np
import time

print("=" * 50)
print("FastGRNN Neural Routing Simulation")
print("=" * 50)

# Simulate FastGRNN gate computation
# FastGRNN: h_t = tanh(Wx + Uh_(t-1) + b) * sigmoid(Wx + Uh_(t-1) + b)

def fastgrnn_cell(x, h_prev, W, U, b, zeta=1.0, nu=1.0):
    """FastGRNN cell with low-rank parameterization"""
    gate = np.dot(W, x) + np.dot(U, h_prev) + b
    z = 1 / (1 + np.exp(-gate))  # sigmoid
    h_tilde = np.tanh(gate)
    h = (zeta * (1 - z) + nu * z) * h_tilde
    return h

# Initialize parameters (small for demo)
hidden_size = 32
input_size = 8
np.random.seed(42)

W = np.random.randn(hidden_size, input_size) * 0.1
U = np.random.randn(hidden_size, hidden_size) * 0.1
b = np.zeros(hidden_size)

# Simulate agent routing decision
agent_embeddings = {
    'python-executor': np.random.randn(input_size),
    'js-executor': np.random.randn(input_size),
    'data-analyst': np.random.randn(input_size),
    'security-scanner': np.random.randn(input_size),
}

task_embedding = np.random.randn(input_size)

# Compute routing scores
start = time.time()
h = np.zeros(hidden_size)
for _ in range(3):  # 3 recurrence steps
    h = fastgrnn_cell(task_embedding, h, W, U, b)

# Score each agent
scores = {}
for agent, emb in agent_embeddings.items():
    score = np.dot(h, fastgrnn_cell(emb, h, W, U, b))
    scores[agent] = float(score)

routing_time = (time.time() - start) * 1000

print(f"\\nRouting Decision (in {routing_time:.2f}ms):")
sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
for i, (agent, score) in enumerate(sorted_scores):
    marker = "→" if i == 0 else " "
    print(f"  {marker} {agent}: {score:.4f}")

print(f"\\nSelected: {sorted_scores[0][0]}")
print(f"Confidence: {abs(sorted_scores[0][1] - sorted_scores[1][1]):.4f}")
`;

const fastgrnnResult = await swarm.executeTask({
  id: 'fastgrnn-demo',
  type: 'python',
  code: fastgrnnCode,
  priority: 'high'
});
console.log(fastgrnnResult.output || 'Running...');

// Demo 2: TinyDancer Circuit Breaker simulation
console.log('\n3. TinyDancer Circuit Breaker Demo...\n');
const circuitBreakerCode = `
import time
import random

print("=" * 50)
print("TinyDancer Circuit Breaker Simulation")
print("=" * 50)

class CircuitBreaker:
    """TinyDancer-style circuit breaker with 99.9% uptime target"""

    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

    def __init__(self, failure_threshold=5, success_threshold=3, reset_timeout=30):
        self.state = self.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.failure_threshold = failure_threshold
        self.success_threshold = success_threshold
        self.reset_timeout = reset_timeout
        self.last_failure_time = None

    def call(self, func, *args):
        if self.state == self.OPEN:
            if self._should_attempt_reset():
                self.state = self.HALF_OPEN
            else:
                raise Exception("Circuit OPEN - request blocked")

        try:
            result = func(*args)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failure_count = 0
        if self.state == self.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = self.CLOSED
                self.success_count = 0
                print("  Circuit CLOSED - recovered!")

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = self.OPEN
            print(f"  Circuit OPEN - {self.failure_count} failures")

    def _should_attempt_reset(self):
        if self.last_failure_time is None:
            return True
        return (time.time() - self.last_failure_time) >= self.reset_timeout

# Simulate agent calls with random failures
def agent_call(agent_name, fail_rate=0.3):
    if random.random() < fail_rate:
        raise Exception(f"{agent_name} failed")
    return f"{agent_name} succeeded"

# Create circuit breakers for each agent
agents = ['python-agent', 'js-agent', 'data-agent']
breakers = {agent: CircuitBreaker(failure_threshold=3, success_threshold=2, reset_timeout=5) for agent in agents}

print("\\nSimulating 20 agent calls with 30% failure rate:\\n")

results = {"success": 0, "blocked": 0, "failed": 0}
for i in range(20):
    agent = random.choice(agents)
    breaker = breakers[agent]

    try:
        result = breaker.call(agent_call, agent)
        results["success"] += 1
        print(f"  [{i+1:2d}] {agent}: ✓ success (circuit: {breaker.state})")
    except Exception as e:
        if "Circuit OPEN" in str(e):
            results["blocked"] += 1
            print(f"  [{i+1:2d}] {agent}: ⊘ blocked (circuit: {breaker.state})")
        else:
            results["failed"] += 1
            print(f"  [{i+1:2d}] {agent}: ✗ failed (circuit: {breaker.state})")

print(f"\\n--- Results ---")
print(f"  Success: {results['success']}")
print(f"  Blocked: {results['blocked']} (protected by circuit breaker)")
print(f"  Failed:  {results['failed']}")
uptime = results['success'] / (results['success'] + results['failed']) * 100 if (results['success'] + results['failed']) > 0 else 100
print(f"  Effective Uptime: {uptime:.1f}%")
`;

const circuitResult = await swarm.executeTask({
  id: 'circuit-demo',
  type: 'python',
  code: circuitBreakerCode,
  priority: 'high'
});
console.log(circuitResult.output || 'Running...');

// Demo 3: QUIC-style message passing simulation
console.log('\n4. QUIC Coordination Demo...\n');
const quicCode = `
import time
import random
from collections import defaultdict

print("=" * 50)
print("QUIC Multi-Agent Coordination Simulation")
print("=" * 50)

class QuicStream:
    """Simulated QUIC stream for agent communication"""
    def __init__(self, stream_id):
        self.stream_id = stream_id
        self.messages = []
        self.latency_samples = []

    def send(self, msg):
        # Simulate QUIC's low latency (0-RTT possible)
        latency = random.uniform(0.5, 3.0)  # ms
        self.latency_samples.append(latency)
        self.messages.append((time.time(), msg, latency))
        return latency

class QuicCoordinator:
    """QUIC-based swarm coordinator"""

    def __init__(self, topology='mesh'):
        self.topology = topology
        self.agents = {}
        self.streams = {}
        self.message_count = 0

    def add_agent(self, agent_id, role):
        self.agents[agent_id] = {'role': role, 'status': 'active'}
        # Create streams to all existing agents (mesh topology)
        for other_id in self.agents:
            if other_id != agent_id:
                stream_id = f"{agent_id}->{other_id}"
                self.streams[stream_id] = QuicStream(stream_id)

    def broadcast(self, from_agent, msg_type, payload):
        latencies = []
        for agent_id in self.agents:
            if agent_id != from_agent:
                stream_id = f"{from_agent}->{agent_id}"
                if stream_id in self.streams:
                    latency = self.streams[stream_id].send({
                        'type': msg_type,
                        'from': from_agent,
                        'payload': payload
                    })
                    latencies.append(latency)
                    self.message_count += 1
        return latencies

# Create coordinator with mesh topology
coordinator = QuicCoordinator(topology='mesh')

# Add agents
agents = [
    ('coordinator-1', 'coordinator'),
    ('worker-1', 'worker'),
    ('worker-2', 'worker'),
    ('aggregator-1', 'aggregator')
]

print("\\nInitializing QUIC mesh network:\\n")
for agent_id, role in agents:
    coordinator.add_agent(agent_id, role)
    print(f"  + {agent_id} ({role})")

print(f"\\n  Total streams: {len(coordinator.streams)}")

# Simulate task distribution
print("\\nSimulating task distribution (50 messages):\\n")
all_latencies = []

for i in range(50):
    sender = random.choice(list(coordinator.agents.keys()))
    msg_type = random.choice(['task', 'result', 'heartbeat', 'sync'])
    latencies = coordinator.broadcast(sender, msg_type, f"payload_{i}")
    all_latencies.extend(latencies)

avg_latency = sum(all_latencies) / len(all_latencies) if all_latencies else 0
max_latency = max(all_latencies) if all_latencies else 0
min_latency = min(all_latencies) if all_latencies else 0

print(f"  Messages sent: {coordinator.message_count}")
print(f"  Avg latency:   {avg_latency:.2f}ms")
print(f"  Min latency:   {min_latency:.2f}ms")
print(f"  Max latency:   {max_latency:.2f}ms")
print(f"  Throughput:    {coordinator.message_count / (sum(all_latencies)/1000):.0f} msg/sec")

print("\\n✓ QUIC coordination complete")
`;

const quicResult = await swarm.executeTask({
  id: 'quic-demo',
  type: 'python',
  code: quicCode,
  priority: 'high'
});
console.log(quicResult.output || 'Running...');

// Final metrics
console.log('\n5. Final Swarm Metrics...\n');
const metrics = swarm.getMetrics();
const optimizer = createSwarmOptimizer(swarm);
const report = await optimizer.optimize();

console.log(`   Total Tasks: ${metrics.tasksCompleted}`);
console.log(`   Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
console.log(`   Health Score: ${report.healthScore}/100`);

await swarm.shutdown();
console.log('\n✓ E2B Advanced Demo Complete');
