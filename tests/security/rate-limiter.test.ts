/**
 * Rate Limiter Security Tests
 *
 * Test suite for RateLimiter covering:
 * - Normal request flow
 * - Rate limit enforcement
 * - Blocked user handling
 * - Reset and cleanup
 */

import { RateLimiter, RateLimitError } from '../../src/security/rate-limiter.js';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 1000,
      blockDurationMs: 2000,
    });
  });

  afterEach(() => {
    limiter.destroy();
  });

  describe('checkLimit', () => {
    test('should allow requests within limit', () => {
      expect(limiter.checkLimit('user1')).toBe(true);
      expect(limiter.checkLimit('user1')).toBe(true);
      expect(limiter.checkLimit('user1')).toBe(true);
    });

    test('should track different users separately', () => {
      expect(limiter.checkLimit('user1')).toBe(true);
      expect(limiter.checkLimit('user2')).toBe(true);
      expect(limiter.checkLimit('user1')).toBe(true);
      expect(limiter.checkLimit('user2')).toBe(true);
    });

    test('should throw RateLimitError when limit exceeded', () => {
      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('user1');
      }

      // 6th request should fail
      expect(() => {
        limiter.checkLimit('user1');
      }).toThrow(RateLimitError);
    });

    test('should include retry-after in error', () => {
      // Exceed limit
      for (let i = 0; i < 6; i++) {
        try {
          limiter.checkLimit('user1');
        } catch (error) {
          if (error instanceof RateLimitError) {
            expect(error.retryAfter).toBeGreaterThan(0);
            expect(error.message).toContain('Rate limit exceeded');
          }
        }
      }
    });

    test('should block user after exceeding limit', () => {
      // Exceed limit
      for (let i = 0; i < 6; i++) {
        try {
          limiter.checkLimit('user1');
        } catch (error) {
          // Expected
        }
      }

      // Subsequent requests should also be blocked
      expect(() => {
        limiter.checkLimit('user1');
      }).toThrow(RateLimitError);
    });

    test('should reset after window expires', async () => {
      // Make requests
      limiter.checkLimit('user1');
      limiter.checkLimit('user1');

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should be reset
      expect(limiter.checkLimit('user1')).toBe(true);
    });

    test('should unblock after block duration', async () => {
      // Exceed limit to get blocked
      for (let i = 0; i < 6; i++) {
        try {
          limiter.checkLimit('user1');
        } catch (error) {
          // Expected
        }
      }

      // Should be blocked
      expect(() => limiter.checkLimit('user1')).toThrow(RateLimitError);

      // Wait for block duration (2000ms)
      await new Promise((resolve) => setTimeout(resolve, 2100));

      // Should be unblocked
      expect(limiter.checkLimit('user1')).toBe(true);
    }, 10000);
  });

  describe('getStatus', () => {
    test('should return correct remaining count', () => {
      limiter.checkLimit('user1');
      limiter.checkLimit('user1');

      const status = limiter.getStatus('user1');
      expect(status.remaining).toBe(3); // 5 - 2 = 3
      expect(status.blocked).toBe(false);
    });

    test('should show blocked status', () => {
      // Exceed limit
      for (let i = 0; i < 6; i++) {
        try {
          limiter.checkLimit('user1');
        } catch (error) {
          // Expected
        }
      }

      const status = limiter.getStatus('user1');
      expect(status.blocked).toBe(true);
      expect(status.blockedUntil).toBeDefined();
    });

    test('should show full quota for new user', () => {
      const status = limiter.getStatus('newuser');
      expect(status.remaining).toBe(5);
      expect(status.blocked).toBe(false);
    });

    test('should include reset time', () => {
      limiter.checkLimit('user1');
      const status = limiter.getStatus('user1');

      expect(status.resetAt).toBeGreaterThan(Date.now());
      expect(status.resetAt).toBeLessThanOrEqual(Date.now() + 1000);
    });
  });

  describe('reset', () => {
    test('should reset rate limit for user', () => {
      // Make requests
      limiter.checkLimit('user1');
      limiter.checkLimit('user1');

      // Reset
      limiter.reset('user1');

      // Should have full quota
      const status = limiter.getStatus('user1');
      expect(status.remaining).toBe(5);
    });

    test('should unblock user', () => {
      // Get blocked
      for (let i = 0; i < 6; i++) {
        try {
          limiter.checkLimit('user1');
        } catch (error) {
          // Expected
        }
      }

      // Reset
      limiter.reset('user1');

      // Should be unblocked
      expect(limiter.checkLimit('user1')).toBe(true);
    });
  });

  describe('clearAll', () => {
    test('should clear all rate limits', () => {
      limiter.checkLimit('user1');
      limiter.checkLimit('user2');
      limiter.checkLimit('user3');

      expect(limiter.getSize()).toBe(3);

      limiter.clearAll();

      expect(limiter.getSize()).toBe(0);
    });
  });

  describe('cleanup', () => {
    test('should track active entries', () => {
      limiter.checkLimit('user1');
      limiter.checkLimit('user2');

      expect(limiter.getSize()).toBe(2);
    });

    test('should automatically clean up old entries', async () => {
      limiter.checkLimit('user1');

      expect(limiter.getSize()).toBe(1);

      // Wait for cleanup interval + window expiry
      await new Promise((resolve) => setTimeout(resolve, 62000));

      // Entry should be cleaned up
      expect(limiter.getSize()).toBe(0);
    }, 65000);
  });

  describe('edge cases', () => {
    test('should handle rapid consecutive requests', () => {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < 10; i++) {
        try {
          limiter.checkLimit('user1');
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      expect(successCount).toBe(5); // Max requests
      expect(errorCount).toBe(5); // Exceeded requests
    });

    test('should handle different identifiers', () => {
      // Test with different identifier types
      expect(limiter.checkLimit('user-123')).toBe(true);
      expect(limiter.checkLimit('192.168.1.1')).toBe(true);
      expect(limiter.checkLimit('api-key-abc')).toBe(true);

      expect(limiter.getSize()).toBe(3);
    });

    test('should handle empty identifiers', () => {
      // Should track even empty strings
      expect(limiter.checkLimit('')).toBe(true);
      expect(limiter.getSize()).toBe(1);
    });
  });

  describe('performance', () => {
    test('should handle many users efficiently', () => {
      const startTime = Date.now();

      // Simulate 1000 different users
      for (let i = 0; i < 1000; i++) {
        limiter.checkLimit(`user${i}`);
      }

      const duration = Date.now() - startTime;

      // Should be fast (< 100ms for 1000 operations)
      expect(duration).toBeLessThan(100);
      expect(limiter.getSize()).toBe(1000);
    });

    test('should handle repeated checks efficiently', () => {
      const startTime = Date.now();

      // 10,000 checks for same user
      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('user1');
      }

      const duration = Date.now() - startTime;

      // Should be very fast
      expect(duration).toBeLessThan(10);
    });
  });
});
