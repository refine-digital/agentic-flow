/**
 * Rate Limiter - Prevent abuse and ensure fair resource usage
 *
 * Features:
 * - Token bucket algorithm
 * - Per-user and per-IP rate limiting
 * - Configurable limits and windows
 * - Automatic cleanup of expired entries
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Rate Limiter
 *
 * Implements token bucket algorithm for rate limiting:
 * - Tracks requests per identifier (user ID, IP, API key)
 * - Blocks excessive requests
 * - Automatic reset after time window
 */
export class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: Required<RateLimitConfig>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      blockDurationMs: config.blockDurationMs ?? config.windowMs * 2,
    };

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Check if request is allowed
   *
   * @param identifier - User ID, IP address, or API key
   * @returns true if allowed, throws RateLimitError if blocked
   * @throws RateLimitError if rate limit exceeded
   */
  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    // Check if blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      throw new RateLimitError(
        `Rate limit exceeded. Blocked until ${new Date(entry.blockedUntil).toISOString()}`,
        retryAfter
      );
    }

    // Initialize or reset if window expired
    if (!entry || now >= entry.resetAt) {
      this.limits.set(identifier, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return true;
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > this.config.maxRequests) {
      entry.blockedUntil = now + this.config.blockDurationMs;
      const retryAfter = Math.ceil(this.config.blockDurationMs / 1000);
      throw new RateLimitError(
        `Rate limit exceeded. Maximum ${this.config.maxRequests} requests per ${this.config.windowMs}ms`,
        retryAfter
      );
    }

    return true;
  }

  /**
   * Get current rate limit status
   *
   * @param identifier - User ID, IP address, or API key
   * @returns Rate limit status
   */
  getStatus(identifier: string): {
    remaining: number;
    resetAt: number;
    blocked: boolean;
    blockedUntil?: number;
  } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now >= entry.resetAt) {
      return {
        remaining: this.config.maxRequests,
        resetAt: now + this.config.windowMs,
        blocked: false,
      };
    }

    const blocked = !!entry.blockedUntil && now < entry.blockedUntil;

    return {
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetAt: entry.resetAt,
      blocked,
      blockedUntil: entry.blockedUntil,
    };
  }

  /**
   * Reset rate limit for identifier
   *
   * @param identifier - User ID, IP address, or API key
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }

  /**
   * Get total number of tracked identifiers
   */
  getSize(): number {
    return this.limits.size;
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [identifier, entry] of this.limits.entries()) {
      // Remove if reset time passed and not blocked
      if (now >= entry.resetAt && (!entry.blockedUntil || now >= entry.blockedUntil)) {
        this.limits.delete(identifier);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[RateLimiter] Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
