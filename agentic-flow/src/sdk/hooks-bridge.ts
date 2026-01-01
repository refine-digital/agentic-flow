/**
 * SDK Hooks Bridge - Connects agentic-flow intelligence layer to Claude Agent SDK hooks
 *
 * Bridges our custom hooks (intelligence-bridge.ts) with the native SDK hook system
 * enabling seamless integration with Claude Code's event loop.
 */

import { logger } from "../utils/logger.js";

// Types from Claude Agent SDK (inferred from documentation)
export type HookEvent =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'PostToolUseFailure'
  | 'Notification'
  | 'UserPromptSubmit'
  | 'SessionStart'
  | 'SessionEnd'
  | 'Stop'
  | 'SubagentStart'
  | 'SubagentStop'
  | 'PreCompact'
  | 'PermissionRequest';

export interface BaseHookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode?: string;
}

export interface PreToolUseHookInput extends BaseHookInput {
  hook_event_name: 'PreToolUse';
  tool_name: string;
  tool_input: unknown;
}

export interface PostToolUseHookInput extends BaseHookInput {
  hook_event_name: 'PostToolUse';
  tool_name: string;
  tool_input: unknown;
  tool_response: unknown;
}

export interface SessionStartHookInput extends BaseHookInput {
  hook_event_name: 'SessionStart';
  source: 'startup' | 'resume' | 'clear' | 'compact';
}

export interface SessionEndHookInput extends BaseHookInput {
  hook_event_name: 'SessionEnd';
  reason: string;
}

export interface SubagentStartHookInput extends BaseHookInput {
  hook_event_name: 'SubagentStart';
  agent_id: string;
  agent_type: string;
}

export interface SubagentStopHookInput extends BaseHookInput {
  hook_event_name: 'SubagentStop';
  stop_hook_active: boolean;
}

export type HookInput =
  | PreToolUseHookInput
  | PostToolUseHookInput
  | SessionStartHookInput
  | SessionEndHookInput
  | SubagentStartHookInput
  | SubagentStopHookInput
  | BaseHookInput & { hook_event_name: string };

export interface HookJSONOutput {
  continue?: boolean;
  suppressOutput?: boolean;
  stopReason?: string;
  decision?: 'approve' | 'block';
  systemMessage?: string;
  reason?: string;
  hookSpecificOutput?: {
    hookEventName: string;
    additionalContext?: string;
    permissionDecision?: 'allow' | 'deny' | 'ask';
    permissionDecisionReason?: string;
    updatedInput?: Record<string, unknown>;
  };
}

export type HookCallback = (
  input: HookInput,
  toolUseId: string | undefined,
  options: { signal: AbortSignal }
) => Promise<HookJSONOutput>;

export interface HookCallbackMatcher {
  matcher?: string;
  hooks: HookCallback[];
}

// Lazy import intelligence bridge to avoid circular dependencies
let intelligenceBridge: any = null;

async function getIntelligenceBridge() {
  if (!intelligenceBridge) {
    try {
      intelligenceBridge = await import("../mcp/fastmcp/tools/hooks/intelligence-bridge.js");
    } catch (e) {
      logger.warn('Intelligence bridge not available', { error: (e as Error).message });
      return null;
    }
  }
  return intelligenceBridge;
}

// Active trajectory tracking with TTL (5 minutes max)
const TRAJECTORY_TTL_MS = 5 * 60 * 1000;
const activeTrajectories = new Map<string, { trajectoryId: number; timestamp: number }>();

// Cleanup stale trajectories periodically
function cleanupStaleTrajectories(): void {
  const now = Date.now();
  for (const [key, value] of activeTrajectories.entries()) {
    if (now - value.timestamp > TRAJECTORY_TTL_MS) {
      activeTrajectories.delete(key);
    }
  }
}

// Run cleanup every 2 minutes
setInterval(cleanupStaleTrajectories, 2 * 60 * 1000).unref();

/**
 * PreToolUse hook - Called before tool execution
 * Routes to best agent and starts trajectory tracking
 */
export const preToolUseHook: HookCallback = async (input, toolUseId, { signal }) => {
  if (input.hook_event_name !== 'PreToolUse') return {};

  const { tool_name, tool_input, session_id } = input as PreToolUseHookInput;

  try {
    const bridge = await getIntelligenceBridge();
    if (!bridge) return {};

    // Start trajectory for edit operations
    if (['Edit', 'Write', 'Bash'].includes(tool_name)) {
      const filePath = (tool_input as any)?.file_path || (tool_input as any)?.command || 'unknown';
      const result = await bridge.beginTaskTrajectory(
        `${tool_name}: ${filePath.substring(0, 100)}`,
        'coder'
      );

      if (result.success && result.trajectoryId > 0) {
        activeTrajectories.set(`${session_id}:${toolUseId}`, {
          trajectoryId: result.trajectoryId,
          timestamp: Date.now()
        });
        logger.debug('Trajectory started', { trajectoryId: result.trajectoryId, tool: tool_name });
      }
    }

    return {};
  } catch (error) {
    logger.warn('PreToolUse hook error', { error: (error as Error).message });
    return {};
  }
};

/**
 * PostToolUse hook - Called after successful tool execution
 * Records patterns and ends trajectories
 */
export const postToolUseHook: HookCallback = async (input, toolUseId, { signal }) => {
  if (input.hook_event_name !== 'PostToolUse') return {};

  const { tool_name, tool_input, tool_response, session_id } = input as PostToolUseHookInput;

  try {
    const bridge = await getIntelligenceBridge();
    if (!bridge) return {};

    // End trajectory if one was started
    const trajectoryKey = `${session_id}:${toolUseId}`;
    const trajectoryEntry = activeTrajectories.get(trajectoryKey);

    if (trajectoryEntry) {
      await bridge.endTaskTrajectory(trajectoryEntry.trajectoryId, 'success');
      activeTrajectories.delete(trajectoryKey);
      logger.debug('Trajectory completed', { trajectoryId: trajectoryEntry.trajectoryId, tool: tool_name });
    }

    // Store successful pattern
    if (['Edit', 'Write'].includes(tool_name)) {
      const filePath = (tool_input as any)?.file_path || 'unknown';
      await bridge.storePattern({
        id: `sdk-${tool_name.toLowerCase()}-${Date.now()}`,
        metadata: {
          tool: tool_name,
          file: filePath,
          success: true,
          timestamp: Date.now()
        }
      });
    }

    return {};
  } catch (error) {
    logger.warn('PostToolUse hook error', { error: (error as Error).message });
    return {};
  }
};

/**
 * PostToolUseFailure hook - Called when tool execution fails
 * Ends trajectories as failures
 */
export const postToolUseFailureHook: HookCallback = async (input, toolUseId, { signal }) => {
  if (input.hook_event_name !== 'PostToolUseFailure') return {};

  const { session_id } = input;

  try {
    const bridge = await getIntelligenceBridge();
    if (!bridge) return {};

    // End trajectory as failure
    const trajectoryKey = `${session_id}:${toolUseId}`;
    const trajectoryEntry = activeTrajectories.get(trajectoryKey);

    if (trajectoryEntry) {
      await bridge.endTaskTrajectory(trajectoryEntry.trajectoryId, 'failure');
      activeTrajectories.delete(trajectoryKey);
      logger.debug('Trajectory failed', { trajectoryId: trajectoryEntry.trajectoryId });
    }

    return {};
  } catch (error) {
    logger.warn('PostToolUseFailure hook error', { error: (error as Error).message });
    return {};
  }
};

/**
 * SessionStart hook - Called when session begins
 * Initializes intelligence layer
 */
export const sessionStartHook: HookCallback = async (input, toolUseId, { signal }) => {
  if (input.hook_event_name !== 'SessionStart') return {};

  const { source, session_id } = input as SessionStartHookInput;

  try {
    const bridge = await getIntelligenceBridge();
    if (!bridge) {
      return {
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: 'Intelligence layer not available.'
        }
      };
    }

    const stats = await bridge.getIntelligenceStats();
    const message = `RuVector Intelligence active. ` +
      `Trajectories: ${stats.trajectoryCount}, ` +
      `Features: ${stats.features?.join(', ') || 'none'}`;

    logger.info('Session started', { sessionId: session_id, source, stats });

    return {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: message
      }
    };
  } catch (error) {
    logger.warn('SessionStart hook error', { error: (error as Error).message });
    return {};
  }
};

/**
 * SessionEnd hook - Called when session ends
 * Persists learning data
 */
export const sessionEndHook: HookCallback = async (input, toolUseId, { signal }) => {
  if (input.hook_event_name !== 'SessionEnd') return {};

  const { reason, session_id } = input as SessionEndHookInput;

  try {
    const bridge = await getIntelligenceBridge();
    if (!bridge) return {};

    // Force learning cycle on session end
    await bridge.forceLearningCycle();

    logger.info('Session ended', { sessionId: session_id, reason });

    return {};
  } catch (error) {
    logger.warn('SessionEnd hook error', { error: (error as Error).message });
    return {};
  }
};

/**
 * SubagentStart hook - Called when a subagent is spawned
 */
export const subagentStartHook: HookCallback = async (input, toolUseId, { signal }) => {
  if (input.hook_event_name !== 'SubagentStart') return {};

  const { agent_id, agent_type } = input as SubagentStartHookInput;

  logger.info('Subagent started', { agentId: agent_id, agentType: agent_type });

  return {};
};

/**
 * SubagentStop hook - Called when a subagent completes
 */
export const subagentStopHook: HookCallback = async (input, toolUseId, { signal }) => {
  if (input.hook_event_name !== 'SubagentStop') return {};

  logger.info('Subagent stopped');

  return {};
};

/**
 * Get SDK hooks configuration
 * Returns hooks in the format expected by Claude Agent SDK query() options
 */
export function getSdkHooks(): Partial<Record<HookEvent, HookCallbackMatcher[]>> {
  return {
    PreToolUse: [{ hooks: [preToolUseHook] }],
    PostToolUse: [{ hooks: [postToolUseHook] }],
    PostToolUseFailure: [{ hooks: [postToolUseFailureHook] }],
    SessionStart: [{ hooks: [sessionStartHook] }],
    SessionEnd: [{ hooks: [sessionEndHook] }],
    SubagentStart: [{ hooks: [subagentStartHook] }],
    SubagentStop: [{ hooks: [subagentStopHook] }]
  };
}

/**
 * Get filtered hooks for specific tools
 */
export function getToolSpecificHooks(toolMatcher: string): Partial<Record<HookEvent, HookCallbackMatcher[]>> {
  return {
    PreToolUse: [{ matcher: toolMatcher, hooks: [preToolUseHook] }],
    PostToolUse: [{ matcher: toolMatcher, hooks: [postToolUseHook] }],
    PostToolUseFailure: [{ matcher: toolMatcher, hooks: [postToolUseFailureHook] }]
  };
}
