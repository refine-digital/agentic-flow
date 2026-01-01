/**
 * Audit Logger Security Tests
 *
 * Test suite for AuditLogger covering:
 * - Event logging
 * - Event querying
 * - Statistics generation
 * - Cleanup and limits
 */

import { AuditLogger, AuditEvent } from '../../src/security/audit-logger.js';

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger();
  });

  describe('logEvent', () => {
    test('should log event with timestamp', () => {
      logger.logEvent({
        eventType: 'api_key_valid',
        userId: 'user1',
        success: true,
      });

      const events = logger.queryEvents();
      expect(events).toHaveLength(1);
      expect(events[0].timestamp).toBeDefined();
      expect(events[0].eventType).toBe('api_key_valid');
    });

    test('should log event with custom timestamp', () => {
      const customTimestamp = Date.now() - 1000;

      logger.logEvent({
        eventType: 'token_valid',
        userId: 'user1',
        success: true,
        timestamp: customTimestamp,
      });

      const events = logger.queryEvents();
      expect(events[0].timestamp).toBe(customTimestamp);
    });

    test('should log event with metadata', () => {
      logger.logEvent({
        eventType: 'access_granted',
        userId: 'user1',
        success: true,
        metadata: {
          resource: 'database',
          action: 'read',
        },
      });

      const events = logger.queryEvents();
      expect(events[0].metadata).toEqual({
        resource: 'database',
        action: 'read',
      });
    });

    test('should enforce max events limit', () => {
      const smallLogger = new AuditLogger(10);

      // Add 15 events
      for (let i = 0; i < 15; i++) {
        smallLogger.logEvent({
          eventType: 'api_key_valid',
          userId: `user${i}`,
          success: true,
        });
      }

      // Should only keep last 10
      expect(smallLogger.getEventCount()).toBe(10);
    });
  });

  describe('queryEvents', () => {
    beforeEach(() => {
      // Add sample events
      logger.logEvent({
        eventType: 'api_key_valid',
        userId: 'user1',
        success: true,
      });

      logger.logEvent({
        eventType: 'api_key_invalid',
        userId: 'user1',
        success: false,
      });

      logger.logEvent({
        eventType: 'token_valid',
        userId: 'user2',
        success: true,
      });

      logger.logEvent({
        eventType: 'token_expired',
        userId: 'user2',
        success: false,
      });
    });

    test('should query all events', () => {
      const events = logger.queryEvents();
      expect(events).toHaveLength(4);
    });

    test('should query by userId', () => {
      const events = logger.queryEvents({ userId: 'user1' });
      expect(events).toHaveLength(2);
      expect(events.every((e) => e.userId === 'user1')).toBe(true);
    });

    test('should query by eventType', () => {
      const events = logger.queryEvents({ eventType: 'api_key_valid' });
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('api_key_valid');
    });

    test('should query by success', () => {
      const successfulEvents = logger.queryEvents({ success: true });
      const failedEvents = logger.queryEvents({ success: false });

      expect(successfulEvents).toHaveLength(2);
      expect(failedEvents).toHaveLength(2);
      expect(successfulEvents.every((e) => e.success)).toBe(true);
      expect(failedEvents.every((e) => !e.success)).toBe(true);
    });

    test('should query by time range', () => {
      const now = Date.now();
      const oneHourAgo = now - 3600000;

      const events = logger.queryEvents({
        startTime: oneHourAgo,
        endTime: now,
      });

      expect(events).toHaveLength(4);
    });

    test('should limit results', () => {
      const events = logger.queryEvents({ limit: 2 });
      expect(events).toHaveLength(2);
    });

    test('should combine multiple filters', () => {
      const events = logger.queryEvents({
        userId: 'user1',
        success: false,
      });

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('api_key_invalid');
    });
  });

  describe('getStatistics', () => {
    beforeEach(() => {
      // Add diverse events
      logger.logEvent({
        eventType: 'api_key_valid',
        userId: 'user1',
        success: true,
      });

      logger.logEvent({
        eventType: 'api_key_valid',
        userId: 'user2',
        success: true,
      });

      logger.logEvent({
        eventType: 'api_key_invalid',
        userId: 'user3',
        success: false,
      });

      logger.logEvent({
        eventType: 'token_expired',
        userId: 'user4',
        success: false,
      });
    });

    test('should count total events', () => {
      const stats = logger.getStatistics();
      expect(stats.totalEvents).toBe(4);
    });

    test('should count successful events', () => {
      const stats = logger.getStatistics();
      expect(stats.successfulEvents).toBe(2);
    });

    test('should count failed events', () => {
      const stats = logger.getStatistics();
      expect(stats.failedEvents).toBe(2);
    });

    test('should group events by type', () => {
      const stats = logger.getStatistics();
      expect(stats.eventsByType).toEqual({
        api_key_valid: 2,
        api_key_invalid: 1,
        token_expired: 1,
      });
    });

    test('should include recent failures', () => {
      const stats = logger.getStatistics();
      expect(stats.recentFailures).toHaveLength(2);
      expect(stats.recentFailures.every((e) => !e.success)).toBe(true);
    });

    test('should limit recent failures to 10', () => {
      // Add 15 failures
      for (let i = 0; i < 15; i++) {
        logger.logEvent({
          eventType: 'api_key_invalid',
          userId: `user${i}`,
          success: false,
        });
      }

      const stats = logger.getStatistics();
      expect(stats.recentFailures.length).toBeLessThanOrEqual(10);
    });
  });

  describe('clear', () => {
    test('should clear all events', () => {
      logger.logEvent({
        eventType: 'api_key_valid',
        userId: 'user1',
        success: true,
      });

      expect(logger.getEventCount()).toBe(1);

      logger.clear();

      expect(logger.getEventCount()).toBe(0);
    });

    test('should reset statistics', () => {
      logger.logEvent({
        eventType: 'api_key_valid',
        userId: 'user1',
        success: true,
      });

      logger.clear();

      const stats = logger.getStatistics();
      expect(stats.totalEvents).toBe(0);
      expect(stats.successfulEvents).toBe(0);
      expect(stats.failedEvents).toBe(0);
    });
  });

  describe('exportToJson', () => {
    test('should export events as JSON', () => {
      logger.logEvent({
        eventType: 'api_key_valid',
        userId: 'user1',
        success: true,
      });

      const json = logger.exportToJson();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].eventType).toBe('api_key_valid');
    });

    test('should export empty array when no events', () => {
      const json = logger.exportToJson();
      const parsed = JSON.parse(json);

      expect(parsed).toEqual([]);
    });
  });

  describe('getRecentEvents', () => {
    test('should get events within time window', () => {
      // Add old event
      logger.logEvent({
        eventType: 'api_key_valid',
        userId: 'user1',
        success: true,
        timestamp: Date.now() - 3600000, // 1 hour ago
      });

      // Add recent event
      logger.logEvent({
        eventType: 'token_valid',
        userId: 'user2',
        success: true,
        timestamp: Date.now() - 1000, // 1 second ago
      });

      // Get events from last 10 minutes
      const recentEvents = logger.getRecentEvents(600000);

      expect(recentEvents).toHaveLength(1);
      expect(recentEvents[0].eventType).toBe('token_valid');
    });

    test('should return empty array when no recent events', () => {
      logger.logEvent({
        eventType: 'api_key_valid',
        userId: 'user1',
        success: true,
        timestamp: Date.now() - 7200000, // 2 hours ago
      });

      const recentEvents = logger.getRecentEvents(3600000); // Last hour
      expect(recentEvents).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    test('should handle events without metadata', () => {
      logger.logEvent({
        eventType: 'access_granted',
        userId: 'user1',
        success: true,
      });

      const events = logger.queryEvents();
      expect(events[0].metadata).toBeUndefined();
    });

    test('should handle empty userId', () => {
      logger.logEvent({
        eventType: 'api_key_valid',
        userId: '',
        success: true,
      });

      const events = logger.queryEvents({ userId: '' });
      expect(events).toHaveLength(1);
    });

    test('should handle concurrent logging', () => {
      // Simulate concurrent logs
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() =>
            logger.logEvent({
              eventType: 'api_key_valid',
              userId: `user${i}`,
              success: true,
            })
          )
        );
      }

      return Promise.all(promises).then(() => {
        expect(logger.getEventCount()).toBe(100);
      });
    });
  });

  describe('performance', () => {
    test('should handle large number of events', () => {
      const startTime = Date.now();

      // Log 10,000 events
      for (let i = 0; i < 10000; i++) {
        logger.logEvent({
          eventType: 'api_key_valid',
          userId: `user${i % 100}`,
          success: i % 3 !== 0, // 2/3 successful
        });
      }

      const duration = Date.now() - startTime;

      // Should be reasonably fast (< 1 second)
      expect(duration).toBeLessThan(1000);
    });

    test('should query efficiently', () => {
      // Add 1000 events
      for (let i = 0; i < 1000; i++) {
        logger.logEvent({
          eventType: 'api_key_valid',
          userId: `user${i % 10}`,
          success: true,
        });
      }

      const startTime = Date.now();

      // Query multiple times
      for (let i = 0; i < 100; i++) {
        logger.queryEvents({ userId: 'user5' });
      }

      const duration = Date.now() - startTime;

      // Should be fast (< 100ms for 100 queries)
      expect(duration).toBeLessThan(100);
    });

    test('should generate statistics efficiently', () => {
      // Add many events
      for (let i = 0; i < 1000; i++) {
        logger.logEvent({
          eventType: i % 2 === 0 ? 'api_key_valid' : 'token_valid',
          userId: `user${i}`,
          success: i % 3 !== 0,
        });
      }

      const startTime = Date.now();
      const stats = logger.getStatistics();
      const duration = Date.now() - startTime;

      // Should be fast (< 50ms)
      expect(duration).toBeLessThan(50);
      expect(stats.totalEvents).toBe(1000);
    });
  });
});
