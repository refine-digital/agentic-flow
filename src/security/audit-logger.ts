/**
 * Audit Logger - Track security events for compliance
 *
 * Features:
 * - Event logging with timestamps
 * - Query and search capabilities
 * - Statistics and reporting
 * - Automatic cleanup of old events
 */

export type AuditEventType =
  | 'api_key_valid'
  | 'api_key_invalid'
  | 'api_key_missing'
  | 'token_valid'
  | 'token_invalid'
  | 'token_expired'
  | 'token_invalid_signature'
  | 'token_missing'
  | 'role_denied'
  | 'access_granted'
  | 'access_denied';

export interface AuditEvent {
  eventType: AuditEventType;
  userId: string;
  timestamp?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface AuditQuery {
  userId?: string;
  eventType?: AuditEventType;
  success?: boolean;
  startTime?: number;
  endTime?: number;
  limit?: number;
}

/**
 * Audit Logger
 *
 * Tracks all security-related events for audit trails and compliance
 */
export class AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents: number;

  constructor(maxEvents: number = 10000) {
    this.maxEvents = maxEvents;
  }

  /**
   * Log an audit event
   *
   * @param event - Event to log
   */
  logEvent(event: AuditEvent): void {
    const fullEvent: AuditEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };

    this.events.push(fullEvent);

    // Trim old events if over limit
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Also log to console for real-time monitoring
    console.log(
      `[AUDIT] ${fullEvent.eventType} - User: ${fullEvent.userId} - Success: ${fullEvent.success}`,
      fullEvent.metadata
    );
  }

  /**
   * Query audit events
   *
   * @param query - Query parameters
   * @returns Matching events
   */
  queryEvents(query: AuditQuery = {}): AuditEvent[] {
    let results = [...this.events];

    // Filter by userId
    if (query.userId) {
      results = results.filter((event) => event.userId === query.userId);
    }

    // Filter by eventType
    if (query.eventType) {
      results = results.filter((event) => event.eventType === query.eventType);
    }

    // Filter by success
    if (query.success !== undefined) {
      results = results.filter((event) => event.success === query.success);
    }

    // Filter by time range
    if (query.startTime) {
      results = results.filter((event) => (event.timestamp || 0) >= query.startTime!);
    }

    if (query.endTime) {
      results = results.filter((event) => (event.timestamp || 0) <= query.endTime!);
    }

    // Limit results
    if (query.limit) {
      results = results.slice(-query.limit);
    }

    return results;
  }

  /**
   * Get statistics
   *
   * @returns Event statistics
   */
  getStatistics(): {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    eventsByType: Record<string, number>;
    recentFailures: AuditEvent[];
  } {
    const stats = {
      totalEvents: this.events.length,
      successfulEvents: 0,
      failedEvents: 0,
      eventsByType: {} as Record<string, number>,
      recentFailures: [] as AuditEvent[],
    };

    for (const event of this.events) {
      if (event.success) {
        stats.successfulEvents++;
      } else {
        stats.failedEvents++;
      }

      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;
    }

    // Get recent failures (last 10)
    stats.recentFailures = this.events
      .filter((event) => !event.success)
      .slice(-10);

    return stats;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Get total event count
   */
  getEventCount(): number {
    return this.events.length;
  }

  /**
   * Export events to JSON
   *
   * @returns JSON string of all events
   */
  exportToJson(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Get events within time window
   *
   * @param windowMs - Time window in milliseconds
   * @returns Events within window
   */
  getRecentEvents(windowMs: number): AuditEvent[] {
    const cutoff = Date.now() - windowMs;
    return this.events.filter((event) => (event.timestamp || 0) >= cutoff);
  }
}
