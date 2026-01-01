/**
 * SDK Session Manager - Manages Claude Agent SDK session lifecycle
 *
 * Provides session ID capture, resume capability, and session forking
 * for maintaining context across multiple queries.
 */

import { logger } from "../utils/logger.js";

// Session info stored in memory
interface SessionInfo {
  sessionId: string;
  startTime: number;
  messageCount: number;
  lastActivity: number;
  agentName?: string;
  resumed: boolean;
}

// Session TTL: 30 minutes of inactivity
const SESSION_TTL_MS = 30 * 60 * 1000;

// In-memory session storage
const activeSessions = new Map<string, SessionInfo>();

// Current session for quick access
let currentSessionId: string | null = null;

// Cleanup stale sessions periodically
function cleanupStaleSessions(): void {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      activeSessions.delete(id);
      if (currentSessionId === id) {
        currentSessionId = null;
      }
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupStaleSessions, 5 * 60 * 1000).unref();

/**
 * SDK Message types (from documentation)
 */
interface SDKSystemMessage {
  type: 'system';
  subtype: 'init' | 'compact_boundary';
  uuid: string;
  session_id: string;
  apiKeySource?: string;
  cwd?: string;
  tools?: string[];
  model?: string;
  permissionMode?: string;
}

interface SDKResultMessage {
  type: 'result';
  subtype: 'success' | 'error_max_turns' | 'error_during_execution' | 'error_max_budget_usd';
  uuid: string;
  session_id: string;
  duration_ms: number;
  total_cost_usd: number;
  result?: string;
  errors?: string[];
}

type SDKMessage = SDKSystemMessage | SDKResultMessage | { type: string; session_id?: string };

/**
 * Capture session ID from SDK init message
 * Call this for every message received from query()
 */
export function captureSessionId(message: SDKMessage): string | null {
  if (
    message.type === 'system' &&
    (message as SDKSystemMessage).subtype === 'init' &&
    (message as SDKSystemMessage).session_id
  ) {
    const sessionId = (message as SDKSystemMessage).session_id;

    // Store session info
    activeSessions.set(sessionId, {
      sessionId,
      startTime: Date.now(),
      messageCount: 1,
      lastActivity: Date.now(),
      resumed: false
    });

    currentSessionId = sessionId;

    logger.info('Session captured', {
      sessionId,
      model: (message as SDKSystemMessage).model,
      tools: (message as SDKSystemMessage).tools?.length
    });

    return sessionId;
  }

  // Update message count for existing session
  if (message.session_id && activeSessions.has(message.session_id)) {
    const session = activeSessions.get(message.session_id)!;
    session.messageCount++;
    session.lastActivity = Date.now();
  }

  return null;
}

/**
 * Get the current active session ID
 */
export function getCurrentSessionId(): string | null {
  return currentSessionId;
}

/**
 * Get session info by ID
 */
export function getSessionInfo(sessionId: string): SessionInfo | undefined {
  return activeSessions.get(sessionId);
}

/**
 * Get all active sessions
 */
export function getActiveSessions(): SessionInfo[] {
  return Array.from(activeSessions.values());
}

/**
 * Get resume options for continuing a session
 * @param sessionId - Session ID to resume, or uses current session if not provided
 */
export function getResumeOptions(sessionId?: string): { resume?: string } {
  const id = sessionId || currentSessionId;

  if (!id) {
    return {};
  }

  // Mark session as resumed
  const session = activeSessions.get(id);
  if (session) {
    session.resumed = true;
  }

  logger.info('Preparing session resume', { sessionId: id });

  return {
    resume: id
  };
}

/**
 * Get fork options for creating a new session branch from an existing one
 * @param sessionId - Session ID to fork from
 */
export function getForkOptions(sessionId: string): { resume: string; forkSession: boolean } {
  logger.info('Forking session', { sourceSessionId: sessionId });

  return {
    resume: sessionId,
    forkSession: true
  };
}

/**
 * Mark a session as ended
 */
export function endSession(sessionId: string): void {
  if (activeSessions.has(sessionId)) {
    const session = activeSessions.get(sessionId)!;
    logger.info('Session ended', {
      sessionId,
      duration: Date.now() - session.startTime,
      messageCount: session.messageCount
    });

    activeSessions.delete(sessionId);

    if (currentSessionId === sessionId) {
      currentSessionId = null;
    }
  }
}

/**
 * Clear all sessions (for testing/reset)
 */
export function clearAllSessions(): void {
  activeSessions.clear();
  currentSessionId = null;
  logger.info('All sessions cleared');
}

/**
 * Get session statistics
 */
export function getSessionStats(): {
  totalSessions: number;
  activeSessions: number;
  currentSessionId: string | null;
  totalMessages: number;
} {
  const sessions = Array.from(activeSessions.values());

  return {
    totalSessions: sessions.length,
    activeSessions: sessions.filter(s => !s.resumed).length,
    currentSessionId,
    totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0)
  };
}

/**
 * Process result message and extract session info
 */
export function processResultMessage(message: SDKMessage): {
  success: boolean;
  sessionId?: string;
  duration?: number;
  cost?: number;
  result?: string;
  errors?: string[];
} | null {
  if (message.type !== 'result') return null;

  const resultMsg = message as SDKResultMessage;

  return {
    success: resultMsg.subtype === 'success',
    sessionId: resultMsg.session_id,
    duration: resultMsg.duration_ms,
    cost: resultMsg.total_cost_usd,
    result: resultMsg.result,
    errors: resultMsg.errors
  };
}

/**
 * Build query options with session support
 */
export function buildQueryOptionsWithSession(
  baseOptions: Record<string, any>,
  options: {
    resumeSession?: boolean;
    sessionId?: string;
    forkSession?: boolean;
  } = {}
): Record<string, any> {
  const { resumeSession, sessionId, forkSession } = options;

  if (forkSession && sessionId) {
    return {
      ...baseOptions,
      ...getForkOptions(sessionId)
    };
  }

  if (resumeSession) {
    return {
      ...baseOptions,
      ...getResumeOptions(sessionId)
    };
  }

  return baseOptions;
}
