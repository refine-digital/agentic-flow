/**
 * Audit Logger
 *
 * Comprehensive audit logging for security and compliance:
 * - All API requests
 * - Authentication events
 * - Security violations
 * - Performance metrics
 */

export interface AuditEvent {
  timestamp: number;
  eventType: 'REQUEST' | 'AUTH' | 'ERROR' | 'SECURITY' | 'PERFORMANCE';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  userId?: string;
  ip?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  latencyMs?: number;
  message: string;
  metadata?: Record<string, any>;
}

export interface AuditLoggerConfig {
  /** Enable console logging */
  enableConsole?: boolean;
  /** Enable file logging */
  enableFile?: boolean;
  /** Log file path */
  logFilePath?: string;
  /** Minimum severity to log */
  minSeverity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  /** Maximum log entries in memory */
  maxMemoryEntries?: number;
}

/**
 * Audit Logger
 *
 * Logs all security-relevant events:
 * - API requests and responses
 * - Authentication attempts
 * - Rate limit violations
 * - Input validation failures
 * - Circuit breaker state changes
 */
export class AuditLogger {
  private config: Required<AuditLoggerConfig>;
  private memoryLog: AuditEvent[];
  private static instance: AuditLogger;

  constructor(config?: AuditLoggerConfig) {
    this.config = {
      enableConsole: config?.enableConsole ?? true,
      enableFile: config?.enableFile ?? false,
      logFilePath: config?.logFilePath ?? './logs/audit.log',
      minSeverity: config?.minSeverity ?? 'INFO',
      maxMemoryEntries: config?.maxMemoryEntries ?? 1000,
    };

    this.memoryLog = [];
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: AuditLoggerConfig): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger(config);
    }
    return AuditLogger.instance;
  }

  /**
   * Log event
   *
   * @param event - Audit event to log
   */
  log(event: AuditEvent): void {
    // Check severity filter
    const severities = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];
    const minIndex = severities.indexOf(this.config.minSeverity);
    const eventIndex = severities.indexOf(event.severity);

    if (eventIndex < minIndex) {
      return;
    }

    // Add to memory log
    this.memoryLog.push(event);
    if (this.memoryLog.length > this.config.maxMemoryEntries) {
      this.memoryLog.shift();
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(event);
    }

    // File logging (in production, use Winston or Pino)
    if (this.config.enableFile) {
      this.logToFile(event);
    }
  }

  /**
   * Log API request
   */
  logRequest(req: any, res: any, latencyMs: number): void {
    this.log({
      timestamp: Date.now(),
      eventType: 'REQUEST',
      severity: res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARNING' : 'INFO',
      userId: req.user?.id,
      ip: req.ip || req.connection.remoteAddress,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      latencyMs,
      message: `${req.method} ${req.path} - ${res.statusCode} (${latencyMs}ms)`,
      metadata: {
        userAgent: req.headers['user-agent'],
        query: req.query,
      },
    });
  }

  /**
   * Log authentication event
   */
  logAuth(success: boolean, userId?: string, ip?: string, reason?: string): void {
    this.log({
      timestamp: Date.now(),
      eventType: 'AUTH',
      severity: success ? 'INFO' : 'WARNING',
      userId,
      ip,
      message: success
        ? `Authentication successful for user ${userId}`
        : `Authentication failed: ${reason}`,
      metadata: { success, reason },
    });
  }

  /**
   * Log security violation
   */
  logSecurityViolation(
    type: 'RATE_LIMIT' | 'INPUT_VALIDATION' | 'AUTH_FAILURE' | 'SUSPICIOUS_ACTIVITY',
    userId?: string,
    ip?: string,
    details?: string
  ): void {
    this.log({
      timestamp: Date.now(),
      eventType: 'SECURITY',
      severity: 'WARNING',
      userId,
      ip,
      message: `Security violation: ${type}`,
      metadata: { type, details },
    });
  }

  /**
   * Log error
   */
  logError(error: Error, userId?: string, ip?: string, context?: Record<string, any>): void {
    this.log({
      timestamp: Date.now(),
      eventType: 'ERROR',
      severity: 'ERROR',
      userId,
      ip,
      message: error.message,
      metadata: {
        error: error.name,
        stack: error.stack,
        ...context,
      },
    });
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 100): AuditEvent[] {
    return this.memoryLog.slice(-limit);
  }

  /**
   * Get logs by user
   */
  getLogsByUser(userId: string, limit: number = 100): AuditEvent[] {
    return this.memoryLog
      .filter(event => event.userId === userId)
      .slice(-limit);
  }

  /**
   * Get logs by type
   */
  getLogsByType(
    eventType: AuditEvent['eventType'],
    limit: number = 100
  ): AuditEvent[] {
    return this.memoryLog
      .filter(event => event.eventType === eventType)
      .slice(-limit);
  }

  /**
   * Log to console
   */
  private logToConsole(event: AuditEvent): void {
    const timestamp = new Date(event.timestamp).toISOString();
    const prefix = `[${timestamp}] [${event.severity}] [${event.eventType}]`;

    const logFn = event.severity === 'ERROR' || event.severity === 'CRITICAL'
      ? console.error
      : event.severity === 'WARNING'
      ? console.warn
      : console.log;

    logFn(`${prefix} ${event.message}`);

    if (event.metadata) {
      logFn('  Metadata:', event.metadata);
    }
  }

  /**
   * Log to file (placeholder - use Winston/Pino in production)
   */
  private logToFile(event: AuditEvent): void {
    // In production, use Winston or Pino for file logging
    // This is a placeholder
    const line = JSON.stringify(event) + '\n';
    // fs.appendFileSync(this.config.logFilePath, line);
  }

  /**
   * Clear memory logs
   */
  clear(): void {
    this.memoryLog = [];
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalEvents: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    errorRate: number;
  } {
    const stats = {
      totalEvents: this.memoryLog.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      errorRate: 0,
    };

    for (const event of this.memoryLog) {
      stats.byType[event.eventType] = (stats.byType[event.eventType] || 0) + 1;
      stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
    }

    const errorCount = (stats.bySeverity['ERROR'] || 0) + (stats.bySeverity['CRITICAL'] || 0);
    stats.errorRate = stats.totalEvents > 0 ? errorCount / stats.totalEvents : 0;

    return stats;
  }
}

/**
 * Create audit logging middleware
 */
export function createAuditMiddleware(logger?: AuditLogger) {
  const auditLogger = logger || AuditLogger.getInstance();

  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Log after response finishes
    res.on('finish', () => {
      const latencyMs = Date.now() - startTime;
      auditLogger.logRequest(req, res, latencyMs);
    });

    next();
  };
}

// Export singleton
export const auditLogger = AuditLogger.getInstance();
