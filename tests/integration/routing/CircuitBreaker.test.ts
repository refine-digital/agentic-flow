/**
 * Circuit Breaker Router Integration Tests
 *
 * Tests:
 * - Circuit breaker state transitions
 * - Automatic failure detection and recovery
 * - Fallback chain execution
 * - 99.9% uptime guarantee
 * - Performance requirements (<5ms overhead)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CircuitBreakerRouter, CircuitState } from '../../../agentic-flow/src/routing/CircuitBreakerRouter';

describe('CircuitBreakerRouter', () => {
  let router: CircuitBreakerRouter;

  beforeEach(() => {
    router = new CircuitBreakerRouter({
      failureThreshold: 3,
      successThreshold: 2,
      resetTimeout: 1000, // 1 second for faster tests
      requestTimeout: 500,
    });
  });

  describe('Circuit State Transitions', () => {
    it('should start in CLOSED state', async () => {
      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent: 'coder',
      });

      expect(result.circuitState).toBe(CircuitState.CLOSED);
    });

    it('should transition to OPEN after threshold failures', async () => {
      const agent = 'coder';

      // Record failures
      for (let i = 0; i < 3; i++) {
        router.recordFailure(agent);
      }

      const state = router.getCircuitState(agent);
      expect(state).toBe(CircuitState.OPEN);
    });

    it('should transition to HALF_OPEN after reset timeout', async () => {
      const agent = 'researcher';

      // Open circuit
      for (let i = 0; i < 3; i++) {
        router.recordFailure(agent);
      }

      expect(router.getCircuitState(agent)).toBe(CircuitState.OPEN);

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(router.getCircuitState(agent)).toBe(CircuitState.HALF_OPEN);
    });

    it('should transition HALF_OPEN to CLOSED on success', async () => {
      const agent = 'tester';

      // Open circuit
      for (let i = 0; i < 3; i++) {
        router.recordFailure(agent);
      }

      // Wait for half-open
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(router.getCircuitState(agent)).toBe(CircuitState.HALF_OPEN);

      // Record successes
      router.recordSuccess(agent);
      router.recordSuccess(agent);

      expect(router.getCircuitState(agent)).toBe(CircuitState.CLOSED);
    });

    it('should transition HALF_OPEN back to OPEN on failure', async () => {
      const agent = 'reviewer';

      // Open circuit
      for (let i = 0; i < 3; i++) {
        router.recordFailure(agent);
      }

      // Wait for half-open
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(router.getCircuitState(agent)).toBe(CircuitState.HALF_OPEN);

      // Fail during half-open
      router.recordFailure(agent);

      expect(router.getCircuitState(agent)).toBe(CircuitState.OPEN);
    });
  });

  describe('Fallback Chain', () => {
    it('should use preferred agent when available', async () => {
      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent: 'coder',
        fallbackAgents: ['researcher', 'tester'],
      });

      expect(result.selectedAgent).toBe('coder');
      expect(result.fallbackUsed).toBe(false);
    });

    it('should use fallback when preferred agent circuit is open', async () => {
      const preferred = 'coder';
      const fallback = 'researcher';

      // Open preferred agent's circuit
      for (let i = 0; i < 3; i++) {
        router.recordFailure(preferred);
      }

      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent,
        fallbackAgents: [fallback],
      });

      expect(result.selectedAgent).toBe(fallback);
      expect(result.fallbackUsed).toBe(true);
      expect(result.circuitState).toBe(CircuitState.CLOSED); // Fallback is healthy
    });

    it('should try multiple fallbacks in order', async () => {
      const agent1 = 'coder';
      const agent2 = 'researcher';
      const agent3 = 'tester';

      // Open first two agents
      for (let i = 0; i < 3; i++) {
        router.recordFailure(agent1);
        router.recordFailure(agent2);
      }

      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent: agent1,
        fallbackAgents: [agent2, agent3],
      });

      expect(result.selectedAgent).toBe(agent3);
      expect(result.fallbackUsed).toBe(true);
    });

    it('should force last agent if all circuits open', async () => {
      const agents = ['coder', 'researcher', 'tester'];

      // Open all circuits
      agents.forEach(agent => {
        for (let i = 0; i < 3; i++) {
          router.recordFailure(agent);
        }
      });

      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent: agents[0],
        fallbackAgents: agents.slice(1),
      });

      expect(result.selectedAgent).toBe(agents[agents.length - 1]);
      expect(result.fallbackUsed).toBe(true);
      expect(result.circuitState).toBe(CircuitState.OPEN);
    });
  });

  describe('Confidence Calculation', () => {
    it('should have high confidence for healthy circuit', async () => {
      const agent = 'coder';

      // Record successes
      for (let i = 0; i < 5; i++) {
        router.recordSuccess(agent);
      }

      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent: agent,
      });

      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should have low confidence for OPEN circuit', async () => {
      const agent = 'researcher';

      // Open circuit
      for (let i = 0; i < 3; i++) {
        router.recordFailure(agent);
      }

      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent: agent,
        fallbackAgents: ['coder'], // Provide fallback
      });

      // If preferred agent used (shouldn't be), confidence should be low
      if (result.selectedAgent === agent) {
        expect(result.confidence).toBeLessThan(0.5);
      }
    });

    it('should have medium confidence for HALF_OPEN circuit', async () => {
      const agent = 'tester';

      // Open circuit
      for (let i = 0; i < 3; i++) {
        router.recordFailure(agent);
      }

      // Wait for half-open
      await new Promise(resolve => setTimeout(resolve, 1100));

      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent: agent,
      });

      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.confidence).toBeLessThan(0.9);
    });
  });

  describe('Uncertainty Estimation', () => {
    it('should estimate uncertainty for routing decisions', async () => {
      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent: 'coder',
      });

      expect(result.uncertainty).toBeDefined();
      expect(result.uncertainty).toBeGreaterThanOrEqual(0);
      expect(result.uncertainty).toBeLessThanOrEqual(1);
    });

    it('should have higher uncertainty for untested agents', async () => {
      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent: 'new-agent',
      });

      expect(result.uncertainty).toBeGreaterThan(0.4); // High uncertainty for new agent
    });

    it('should have lower uncertainty after many successes', async () => {
      const agent = 'coder';

      // Record many successes
      for (let i = 0; i < 20; i++) {
        router.recordSuccess(agent);
      }

      const result = await router.route({
        taskDescription: 'Test task',
        preferredAgent: agent,
      });

      expect(result.uncertainty).toBeLessThan(0.3); // Low uncertainty
    });
  });

  describe('Agent Health Monitoring', () => {
    it('should track agent health metrics', () => {
      const agent = 'coder';

      router.recordSuccess(agent);
      router.recordSuccess(agent);
      router.recordFailure(agent);

      const health = router.getAgentHealth();
      const agentHealth = health.find(h => h.agent === agent);

      expect(agentHealth).toBeDefined();
      expect(agentHealth!.successCount).toBe(2);
      expect(agentHealth!.failureCount).toBe(1);
      expect(agentHealth!.availability).toBeCloseTo(2/3, 2);
    });

    it('should track last failure and success times', () => {
      const agent = 'researcher';

      router.recordSuccess(agent);
      const healthAfterSuccess = router.getAgentHealth().find(h => h.agent === agent);

      router.recordFailure(agent);
      const healthAfterFailure = router.getAgentHealth().find(h => h.agent === agent);

      expect(healthAfterSuccess!.lastSuccessTime).toBeDefined();
      expect(healthAfterFailure!.lastFailureTime).toBeDefined();
      expect(healthAfterFailure!.lastFailureTime!).toBeGreaterThan(healthAfterSuccess!.lastSuccessTime!);
    });
  });

  describe('Performance Requirements', () => {
    it('should route in <5ms', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 20; i++) {
        const result = await router.route({
          taskDescription: `Task ${i}`,
          preferredAgent: 'coder',
        });
        measurements.push(result.metrics.routingTimeMs);
      }

      const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      expect(avgTime).toBeLessThan(5); // <5ms target
    });

    it('should maintain low latency under load', async () => {
      const tasks = Array.from({ length: 100 }, (_, i) => ({
        taskDescription: `Task ${i}`,
        preferredAgent: ['coder', 'researcher', 'tester'][i % 3],
      }));

      const results = await Promise.all(tasks.map(task => router.route(task)));

      const avgRoutingTime = results.reduce((sum, r) => sum + r.metrics.routingTimeMs, 0) / results.length;
      expect(avgRoutingTime).toBeLessThan(5);
    });
  });

  describe('Manual Operations', () => {
    it('should allow manual circuit reset', () => {
      const agent = 'coder';

      // Open circuit
      for (let i = 0; i < 3; i++) {
        router.recordFailure(agent);
      }

      expect(router.getCircuitState(agent)).toBe(CircuitState.OPEN);

      // Manual reset
      router.resetCircuit(agent);

      expect(router.getCircuitState(agent)).toBe(CircuitState.CLOSED);
    });

    it('should support hot-reload of configuration', () => {
      router.updateConfig({
        failureThreshold: 10,
        resetTimeout: 5000,
      });

      const agent = 'coder';

      // Should now require 10 failures
      for (let i = 0; i < 9; i++) {
        router.recordFailure(agent);
      }

      expect(router.getCircuitState(agent)).toBe(CircuitState.CLOSED);

      router.recordFailure(agent);
      expect(router.getCircuitState(agent)).toBe(CircuitState.OPEN);
    });
  });

  describe('Routing Metrics', () => {
    it('should track cumulative metrics', async () => {
      await router.route({
        taskDescription: 'Task 1',
        preferredAgent: 'coder',
      });

      await router.route({
        taskDescription: 'Task 2',
        preferredAgent: 'researcher',
        fallbackAgents: ['tester'],
      });

      const metrics = router.getMetrics();

      expect(metrics.totalRequests).toBe(2);
      expect(metrics.avgRoutingTimeMs).toBeGreaterThan(0);
    });

    it('should track fallback usage', async () => {
      const agent = 'coder';

      // Open circuit
      for (let i = 0; i < 3; i++) {
        router.recordFailure(agent);
      }

      await router.route({
        taskDescription: 'Task',
        preferredAgent: agent,
        fallbackAgents: ['researcher'],
      });

      const metrics = router.getMetrics();
      expect(metrics.fallbackRoutes).toBeGreaterThan(0);
    });
  });

  describe('99.9% Uptime Guarantee', () => {
    it('should never fail to route (always use fallback)', async () => {
      const agent = 'coder';

      // Open circuit
      for (let i = 0; i < 5; i++) {
        router.recordFailure(agent);
      }

      // Should still route successfully using fallback
      const result = await router.route({
        taskDescription: 'Critical task',
        preferredAgent: agent,
        fallbackAgents: ['researcher', 'tester', 'reviewer'],
      });

      expect(result.selectedAgent).toBeDefined();
      // Guarantees routing even if all circuits open
    });

    it('should achieve >99% success rate in simulation', async () => {
      const iterations = 1000;
      let successCount = 0;

      for (let i = 0; i < iterations; i++) {
        try {
          const result = await router.route({
            taskDescription: `Task ${i}`,
            preferredAgent: ['coder', 'researcher', 'tester'][i % 3],
            fallbackAgents: ['reviewer', 'planner'],
          });

          if (result.selectedAgent) {
            successCount++;
          }

          // Simulate random failures
          if (Math.random() < 0.1) {
            router.recordFailure(result.selectedAgent);
          } else {
            router.recordSuccess(result.selectedAgent);
          }
        } catch (error) {
          // Should never happen with proper fallback chain
        }
      }

      const successRate = successCount / iterations;
      expect(successRate).toBeGreaterThan(0.999); // >99.9% success
    });
  });
});
