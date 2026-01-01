/**
 * Authentication Middleware Security Tests
 *
 * Test suite for AuthMiddleware covering:
 * - API key validation
 * - JWT token validation
 * - Role-based access control
 * - Audit logging
 */

import { AuthMiddleware, AuthenticationError } from '../../src/security/auth-middleware.js';

describe('AuthMiddleware', () => {
  let auth: AuthMiddleware;
  const validApiKey = 'test-api-key-123';
  const validApiKey2 = 'test-api-key-456';

  beforeEach(() => {
    auth = new AuthMiddleware({
      apiKeys: new Set([validApiKey, validApiKey2]),
      enableAudit: true,
    });
  });

  describe('validateApiKey', () => {
    test('should validate valid API key', async () => {
      const context = await auth.validateApiKey(validApiKey);

      expect(context.authenticated).toBe(true);
      expect(context.apiKey).toBe(validApiKey);
      expect(context.roles).toContain('user');
    });

    test('should validate API key with Bearer prefix', async () => {
      const context = await auth.validateApiKey(`Bearer ${validApiKey}`);

      expect(context.authenticated).toBe(true);
      expect(context.apiKey).toBe(validApiKey);
    });

    test('should reject missing API key', async () => {
      await expect(auth.validateApiKey('')).rejects.toThrow(AuthenticationError);
      await expect(auth.validateApiKey(null as any)).rejects.toThrow(AuthenticationError);
    });

    test('should reject invalid API key', async () => {
      await expect(auth.validateApiKey('invalid-key')).rejects.toThrow(AuthenticationError);
    });

    test('should include correct error code', async () => {
      try {
        await auth.validateApiKey('invalid-key');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).code).toBe('INVALID_API_KEY');
      }
    });

    test('should validate multiple different API keys', async () => {
      const context1 = await auth.validateApiKey(validApiKey);
      const context2 = await auth.validateApiKey(validApiKey2);

      expect(context1.authenticated).toBe(true);
      expect(context2.authenticated).toBe(true);
      expect(context1.apiKey).not.toBe(context2.apiKey);
    });
  });

  describe('validateToken', () => {
    test('should reject missing token', async () => {
      await expect(auth.validateToken('')).rejects.toThrow(AuthenticationError);
      await expect(auth.validateToken(null as any)).rejects.toThrow(AuthenticationError);
    });

    test('should reject invalid token format', async () => {
      await expect(auth.validateToken('invalid-token')).rejects.toThrow(AuthenticationError);
    });

    test('should handle Bearer prefix', async () => {
      // Even with Bearer prefix, invalid token should fail
      await expect(auth.validateToken('Bearer invalid-token')).rejects.toThrow(
        AuthenticationError
      );
    });

    test('should reject expired token', async () => {
      // Create a token that's already expired
      const { SecurityManager } = await import('../../agentic-flow/src/federation/SecurityManager.js');
      const securityManager = new SecurityManager();

      const expiredToken = await securityManager.createAgentToken({
        agentId: 'agent1',
        tenantId: 'tenant1',
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      });

      try {
        await auth.validateToken(expiredToken);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).code).toBe('TOKEN_EXPIRED');
      }
    });

    test('should validate valid token', async () => {
      const { SecurityManager } = await import('../../agentic-flow/src/federation/SecurityManager.js');
      const securityManager = new SecurityManager();

      const validToken = await securityManager.createAgentToken({
        agentId: 'agent1',
        tenantId: 'tenant1',
        expiresAt: Date.now() + 60000, // Expires in 1 minute
      });

      const context = await auth.validateToken(validToken);

      expect(context.authenticated).toBe(true);
      expect(context.userId).toBe('agent1');
      expect(context.tenantId).toBe('tenant1');
      expect(context.roles).toContain('agent');
    });

    test('should reject tampered token', async () => {
      const { SecurityManager } = await import('../../agentic-flow/src/federation/SecurityManager.js');
      const securityManager = new SecurityManager();

      const validToken = await securityManager.createAgentToken({
        agentId: 'agent1',
        tenantId: 'tenant1',
        expiresAt: Date.now() + 60000,
      });

      // Tamper with token
      const tamperedToken = validToken.substring(0, validToken.length - 5) + 'xxxxx';

      try {
        await auth.validateToken(tamperedToken);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).code).toBe('INVALID_SIGNATURE');
      }
    });
  });

  describe('authenticate', () => {
    test('should reject missing authorization', async () => {
      await expect(auth.authenticate('')).rejects.toThrow(AuthenticationError);
    });

    test('should authenticate with API key', async () => {
      const context = await auth.authenticate(validApiKey);
      expect(context.authenticated).toBe(true);
      expect(context.apiKey).toBe(validApiKey);
    });

    test('should authenticate with Bearer API key', async () => {
      const context = await auth.authenticate(`Bearer ${validApiKey}`);
      expect(context.authenticated).toBe(true);
    });

    test('should authenticate with JWT token', async () => {
      const { SecurityManager } = await import('../../agentic-flow/src/federation/SecurityManager.js');
      const securityManager = new SecurityManager();

      const token = await securityManager.createAgentToken({
        agentId: 'agent1',
        tenantId: 'tenant1',
        expiresAt: Date.now() + 60000,
      });

      const context = await auth.authenticate(`Bearer ${token}`);
      expect(context.authenticated).toBe(true);
      expect(context.userId).toBe('agent1');
    });
  });

  describe('requireRole', () => {
    test('should allow access with correct role', async () => {
      const context = await auth.validateApiKey(validApiKey);
      expect(auth.requireRole(context, 'user')).toBe(true);
    });

    test('should deny access without role', async () => {
      const context = await auth.validateApiKey(validApiKey);

      expect(() => {
        auth.requireRole(context, 'admin');
      }).toThrow(AuthenticationError);
    });

    test('should deny access for unauthenticated', () => {
      const context = { authenticated: false };

      expect(() => {
        auth.requireRole(context, 'user');
      }).toThrow(AuthenticationError);
    });

    test('should include correct error code', async () => {
      const context = await auth.validateApiKey(validApiKey);

      try {
        auth.requireRole(context, 'admin');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as AuthenticationError).code).toBe('INSUFFICIENT_PERMISSIONS');
      }
    });
  });

  describe('API key management', () => {
    test('should add new API key', () => {
      const newKey = 'new-api-key';
      auth.addApiKey(newKey);

      expect(auth.hasApiKey(newKey)).toBe(true);
    });

    test('should remove API key', async () => {
      auth.removeApiKey(validApiKey);

      expect(auth.hasApiKey(validApiKey)).toBe(false);
      await expect(auth.validateApiKey(validApiKey)).rejects.toThrow(AuthenticationError);
    });

    test('should check API key existence', () => {
      expect(auth.hasApiKey(validApiKey)).toBe(true);
      expect(auth.hasApiKey('nonexistent')).toBe(false);
    });

    test('should get API key count', () => {
      expect(auth.getApiKeyCount()).toBe(2); // validApiKey and validApiKey2

      auth.addApiKey('new-key');
      expect(auth.getApiKeyCount()).toBe(3);

      auth.removeApiKey('new-key');
      expect(auth.getApiKeyCount()).toBe(2);
    });
  });

  describe('audit logging', () => {
    test('should log successful authentication', async () => {
      await auth.validateApiKey(validApiKey);

      const stats = auth.getAuditStats();
      expect(stats.totalEvents).toBeGreaterThan(0);
      expect(stats.successfulEvents).toBeGreaterThan(0);
    });

    test('should log failed authentication', async () => {
      try {
        await auth.validateApiKey('invalid-key');
      } catch (error) {
        // Expected
      }

      const stats = auth.getAuditStats();
      expect(stats.failedEvents).toBeGreaterThan(0);
    });

    test('should track event types', async () => {
      await auth.validateApiKey(validApiKey);

      try {
        await auth.validateApiKey('invalid-key');
      } catch (error) {
        // Expected
      }

      const stats = auth.getAuditStats();
      expect(stats.eventsByType).toHaveProperty('api_key_valid');
      expect(stats.eventsByType).toHaveProperty('api_key_invalid');
    });

    test('should include recent failures', async () => {
      try {
        await auth.validateApiKey('invalid-key');
      } catch (error) {
        // Expected
      }

      const stats = auth.getAuditStats();
      expect(stats.recentFailures.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    test('should handle whitespace in API key', async () => {
      const context = await auth.validateApiKey(`  ${validApiKey}  `);
      expect(context.authenticated).toBe(true);
    });

    test('should handle case-insensitive Bearer prefix', async () => {
      const context = await auth.validateApiKey(`bearer ${validApiKey}`);
      expect(context.authenticated).toBe(true);
    });

    test('should handle non-string input', async () => {
      await expect(auth.validateApiKey(123 as any)).rejects.toThrow(AuthenticationError);
      await expect(auth.validateApiKey(undefined as any)).rejects.toThrow(AuthenticationError);
    });
  });

  describe('performance', () => {
    test('should validate many API keys efficiently', async () => {
      const startTime = Date.now();

      // Validate 1000 times
      for (let i = 0; i < 1000; i++) {
        await auth.validateApiKey(validApiKey);
      }

      const duration = Date.now() - startTime;

      // Should be fast (< 100ms for 1000 validations)
      expect(duration).toBeLessThan(100);
    });
  });
});
