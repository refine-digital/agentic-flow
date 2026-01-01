/**
 * Security Integration Tests
 *
 * Tests that security utilities are properly integrated into:
 * - RuvLLMOrchestrator (input validation)
 * - CircuitBreakerRouter (rate limiting)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { InputValidator, ValidationError } from '../agentic-flow/src/utils/input-validator.js';
import { RateLimiter } from '../agentic-flow/src/utils/rate-limiter.js';
import { CircuitBreakerRouter } from '../agentic-flow/src/routing/CircuitBreakerRouter.js';

describe('Security Integration Tests', () => {
  describe('InputValidator', () => {
    it('should validate task descriptions', () => {
      const valid = 'Write a function to sort an array';
      const result = InputValidator.validateTaskDescription(valid);
      expect(result).toBe(valid);
    });

    it('should reject malicious input', () => {
      const malicious = '<script>alert("xss")</script>';
      expect(() => {
        InputValidator.validateTaskDescription(malicious);
      }).toThrow(ValidationError);
    });

    it('should reject oversized input', () => {
      const oversized = 'a'.repeat(20000);
      expect(() => {
        InputValidator.validateTaskDescription(oversized);
      }).toThrow(ValidationError);
    });

    it('should validate agent names', () => {
      expect(InputValidator.validateAgentName('coder')).toBe('coder');
      expect(InputValidator.validateAgentName('code-analyzer')).toBe('code-analyzer');
      expect(InputValidator.validateAgentName('test_agent')).toBe('test_agent');
    });

    it('should reject invalid agent names', () => {
      expect(() => InputValidator.validateAgentName('')).toThrow(ValidationError);
      expect(() => InputValidator.validateAgentName('agent with spaces')).toThrow(ValidationError);
      expect(() => InputValidator.validateAgentName('agent@special')).toThrow(ValidationError);
    });

    it('should validate timeouts', () => {
      expect(InputValidator.validateTimeout(5000)).toBe(5000);
      expect(() => InputValidator.validateTimeout(50)).toThrow(ValidationError); // Too short
      expect(() => InputValidator.validateTimeout(400000)).toThrow(ValidationError); // Too long
    });

    it('should validate confidence scores', () => {
      expect(InputValidator.validateConfidence(0.5)).toBe(0.5);
      expect(InputValidator.validateConfidence(0)).toBe(0);
      expect(InputValidator.validateConfidence(1)).toBe(1);
      expect(() => InputValidator.validateConfidence(-0.1)).toThrow(ValidationError);
      expect(() => InputValidator.validateConfidence(1.1)).toThrow(ValidationError);
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter({
        points: 3,
        duration: 1,
        blockDuration: 2,
      });
    });

    it('should allow requests within limit', async () => {
      await expect(rateLimiter.consume('test-key')).resolves.toBeUndefined();
      await expect(rateLimiter.consume('test-key')).resolves.toBeUndefined();
      await expect(rateLimiter.consume('test-key')).resolves.toBeUndefined();
    });

    it('should block requests exceeding limit', async () => {
      await rateLimiter.consume('test-key');
      await rateLimiter.consume('test-key');
      await rateLimiter.consume('test-key');

      await expect(rateLimiter.consume('test-key')).rejects.toThrow('Rate limit exceeded');
    });

    it('should track different keys separately', async () => {
      await rateLimiter.consume('key1');
      await rateLimiter.consume('key1');
      await rateLimiter.consume('key1');

      // Different key should not be affected
      await expect(rateLimiter.consume('key2')).resolves.toBeUndefined();
    });
  });

  describe('CircuitBreakerRouter Integration', () => {
    let router: CircuitBreakerRouter;

    beforeEach(() => {
      router = new CircuitBreakerRouter({
        failureThreshold: 3,
        successThreshold: 2,
        resetTimeout: 1000,
        requestTimeout: 5000,
      });
    });

    it('should validate task descriptions in route requests', async () => {
      const validRequest = {
        taskDescription: 'Analyze the codebase for performance issues',
        preferredAgent: 'perf-analyzer',
      };

      const result = await router.route(validRequest);
      expect(result.selectedAgent).toBe('perf-analyzer');
    });

    it('should reject malicious task descriptions', async () => {
      const maliciousRequest = {
        taskDescription: '<script>alert("xss")</script>',
        preferredAgent: 'coder',
      };

      await expect(router.route(maliciousRequest)).rejects.toThrow();
    });

    it('should validate agent names', async () => {
      const invalidRequest = {
        taskDescription: 'Write a function',
        preferredAgent: 'invalid agent name!',
      };

      await expect(router.route(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it('should validate timeout parameter', async () => {
      const invalidRequest = {
        taskDescription: 'Write a function',
        preferredAgent: 'coder',
        timeout: 50, // Too short
      };

      await expect(router.route(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it('should validate configuration in constructor', () => {
      // Valid config
      expect(() => {
        new CircuitBreakerRouter({
          failureThreshold: 5,
          successThreshold: 3,
          resetTimeout: 30000,
          requestTimeout: 5000,
        });
      }).not.toThrow();

      // Invalid config - failure threshold too high
      expect(() => {
        new CircuitBreakerRouter({
          failureThreshold: 200, // Max is 100
        });
      }).toThrow(ValidationError);

      // Invalid config - reset timeout too short
      expect(() => {
        new CircuitBreakerRouter({
          resetTimeout: 500, // Min is 1000
        });
      }).toThrow(ValidationError);
    });

    it('should apply rate limiting', async () => {
      const request = {
        taskDescription: 'Test task',
        preferredAgent: 'coder',
      };

      // Make many requests with same task (same rate limit key)
      const promises = [];
      for (let i = 0; i < 150; i++) {
        promises.push(router.route(request));
      }

      // Should eventually hit rate limit
      const results = await Promise.allSettled(promises);
      const rejected = results.filter(r => r.status === 'rejected');

      // At least some should be rate limited
      expect(rejected.length).toBeGreaterThan(0);

      // Check that rate limit error message is correct
      const rateLimitError = rejected.find(r =>
        r.status === 'rejected' && r.reason.message.includes('Rate limit exceeded')
      );
      expect(rateLimitError).toBeDefined();
    });
  });
});
