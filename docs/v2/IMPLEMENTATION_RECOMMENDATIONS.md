# Agentic-Flow v2 Implementation Recommendations

> Based on Claude Agent SDK v0.1.76 Gap Analysis
> Created: December 31, 2025

## Quick Reference: SDK Options Not Used

```typescript
// Current agentic-flow implementation
const queryOptions = {
  systemPrompt: agent.systemPrompt,
  model: finalModel,
  permissionMode: 'bypassPermissions',
  allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'NotebookEdit', 'TodoWrite'],
  mcpServers
};

// MISSING options from Claude Agent SDK:
{
  // Subagents
  agents: Record<string, AgentDefinition>,  // NOT USED

  // Tools
  allowedTools: [..., 'Task', 'AskUserQuestion', 'ExitPlanMode', 'KillBash', 'BashOutput'],  // MISSING TOOLS
  disallowedTools: string[],  // NOT USED

  // Hooks
  hooks: Partial<Record<HookEvent, HookCallbackMatcher[]>>,  // NOT USED

  // Sessions
  resume: string,  // NOT USED
  forkSession: boolean,  // NOT USED
  continue: boolean,  // NOT USED

  // Permissions
  canUseTool: CanUseTool,  // NOT USED

  // Settings
  settingSources: ['user' | 'project' | 'local'][],  // NOT USED

  // Outputs
  outputFormat: { type: 'json_schema', schema: JSONSchema },  // NOT USED

  // Limits
  maxTurns: number,  // NOT USED
  maxBudgetUsd: number,  // NOT USED
  maxThinkingTokens: number,  // NOT USED
  fallbackModel: string,  // NOT USED

  // Sandbox
  sandbox: SandboxSettings,  // NOT USED

  // Features
  betas: SdkBeta[],  // NOT USED
  enableFileCheckpointing: boolean,  // NOT USED
  includePartialMessages: boolean,  // NOT USED

  // Plugins
  plugins: SdkPluginConfig[],  // NOT USED

  // Streaming
  abortController: AbortController,  // NOT USED
  stderr: (data: string) => void,  // NOT USED
}
```

---

## 1. Enable Subagents (Critical)

### Current Code Location
`src/agents/claudeAgent.ts:261-282`

### Required Changes

```typescript
// Add to imports
import { AgentDefinition as SDKAgentDefinition } from "@anthropic-ai/claude-agent-sdk";

// Convert agentic-flow agents to SDK format
function convertAgentsToSdkFormat(agents: AgentDefinition[]): Record<string, SDKAgentDefinition> {
  const sdkAgents: Record<string, SDKAgentDefinition> = {};

  for (const agent of agents) {
    sdkAgents[agent.name] = {
      description: agent.description,
      prompt: agent.systemPrompt,
      tools: agent.tools || ['Read', 'Glob', 'Grep'],
      model: agent.model || 'inherit'
    };
  }

  return sdkAgents;
}

// Update queryOptions
const queryOptions = {
  // ... existing options ...

  // Enable Task tool for subagents
  allowedTools: [
    'Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep',
    'WebFetch', 'WebSearch', 'NotebookEdit', 'TodoWrite',
    'Task',  // NEW: Enable subagent spawning
    'AskUserQuestion',  // NEW: Interactive queries
    'KillBash',  // NEW: Background shell control
    'BashOutput'  // NEW: Background shell output
  ],

  // NEW: Provide agent definitions
  agents: convertAgentsToSdkFormat(loadAgentsFromClaudeDir())
};
```

### Files to Modify
- `src/agents/claudeAgent.ts`
- `src/utils/agentLoader.ts` (add SDK conversion)

---

## 2. Connect Hooks to SDK (High)

### Current Hook System
`src/mcp/fastmcp/tools/hooks/intelligence-bridge.ts`

### Bridge Implementation

```typescript
// New file: src/sdk/hooks-bridge.ts
import { HookCallback, HookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk";
import {
  routeTaskIntelligent,
  beginTaskTrajectory,
  endTaskTrajectory,
  storePattern,
  getIntelligenceStats
} from "../mcp/fastmcp/tools/hooks/intelligence-bridge.js";

// PreToolUse hook - route to best agent
export const preToolUseHook: HookCallback = async (input: HookInput, toolUseId, { signal }) => {
  if (input.hook_event_name !== 'PreToolUse') return {};

  const { tool_name, tool_input } = input as PreToolUseHookInput;

  // Start trajectory tracking
  if (tool_name === 'Edit' || tool_name === 'Write') {
    const filePath = (tool_input as any).file_path;
    await beginTaskTrajectory(`Editing ${filePath}`, 'coder');
  }

  return {};  // Allow tool to proceed
};

// PostToolUse hook - learn from outcomes
export const postToolUseHook: HookCallback = async (input: HookInput, toolUseId, { signal }) => {
  if (input.hook_event_name !== 'PostToolUse') return {};

  const { tool_name, tool_input, tool_response } = input as PostToolUseHookInput;

  // Store successful patterns
  if (tool_name === 'Edit' || tool_name === 'Write') {
    await storePattern({
      id: `edit-${Date.now()}`,
      metadata: {
        tool: tool_name,
        file: (tool_input as any).file_path,
        success: true
      }
    });
  }

  return {};
};

// SessionStart hook - initialize intelligence
export const sessionStartHook: HookCallback = async (input: HookInput) => {
  if (input.hook_event_name !== 'SessionStart') return {};

  const stats = await getIntelligenceStats();
  console.log(`[Intelligence] Session started. Trajectories: ${stats.trajectoryCount}`);

  return {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: `RuVector Intelligence active. ${stats.trajectoryCount} learning trajectories available.`
    }
  };
};

// Export hooks configuration for SDK
export function getSdkHooks() {
  return {
    PreToolUse: [{ hooks: [preToolUseHook] }],
    PostToolUse: [{ hooks: [postToolUseHook] }],
    SessionStart: [{ hooks: [sessionStartHook] }]
  };
}
```

### Integration in claudeAgent.ts

```typescript
import { getSdkHooks } from "../sdk/hooks-bridge.js";

const queryOptions = {
  // ... existing options ...
  hooks: getSdkHooks()
};
```

---

## 3. Session Management (High)

### Implementation

```typescript
// New file: src/sdk/session-manager.ts
import { SDKMessage, SDKSystemMessage } from "@anthropic-ai/claude-agent-sdk";
import { getIntelligenceStore } from "../intelligence/IntelligenceStore.js";

interface SessionInfo {
  sessionId: string;
  startTime: number;
  messageCount: number;
  lastActivity: number;
}

const activeSessions = new Map<string, SessionInfo>();

export function captureSessionId(message: SDKMessage): string | null {
  if (message.type === 'system' && (message as SDKSystemMessage).subtype === 'init') {
    const sessionId = (message as SDKSystemMessage).session_id;

    activeSessions.set(sessionId, {
      sessionId,
      startTime: Date.now(),
      messageCount: 0,
      lastActivity: Date.now()
    });

    // Persist to SQLite
    const store = getIntelligenceStore();
    store.startTrajectory(`Session ${sessionId}`, 'coordinator');

    return sessionId;
  }
  return null;
}

export function getResumeOptions(sessionId?: string) {
  if (!sessionId) return {};

  return {
    resume: sessionId,
    forkSession: false  // Continue same session
  };
}

export function forkSession(sessionId: string) {
  return {
    resume: sessionId,
    forkSession: true  // Create new branch
  };
}
```

### Usage in claudeAgent.ts

```typescript
import { captureSessionId, getResumeOptions } from "../sdk/session-manager.js";

// Store session for reuse
let currentSessionId: string | null = null;

for await (const msg of result) {
  // Capture session ID from init
  const sessionId = captureSessionId(msg);
  if (sessionId) {
    currentSessionId = sessionId;
    logger.info('Session captured', { sessionId });
  }

  // ... rest of message handling
}

// Later, resume with context
const resumeOptions = getResumeOptions(currentSessionId);
const continued = query({
  prompt: "Continue the previous task",
  options: { ...queryOptions, ...resumeOptions }
});
```

---

## 4. Custom Permission Handler (Medium)

### Implementation

```typescript
// New file: src/sdk/permission-handler.ts
import { CanUseTool, PermissionResult, ToolInput } from "@anthropic-ai/claude-agent-sdk";
import { logger } from "../utils/logger.js";

// Dangerous command patterns
const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+[\/~]/,
  /chmod\s+777/,
  /curl.*\|\s*bash/,
  /wget.*\|\s*sh/,
  /eval\s*\(/,
  /DROP\s+TABLE/i,
  /DELETE\s+FROM.*WHERE\s+1/i
];

// Allowed directories
const ALLOWED_DIRS = [
  process.cwd(),
  '/tmp',
  '/var/tmp'
];

export const customPermissionHandler: CanUseTool = async (
  toolName: string,
  input: ToolInput,
  { signal, suggestions }
): Promise<PermissionResult> => {

  // Log all tool usage
  logger.info('Permission check', { tool: toolName, input });

  // Block dangerous Bash commands
  if (toolName === 'Bash') {
    const command = (input as any).command || '';

    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        logger.warn('Dangerous command blocked', { command });
        return {
          behavior: 'deny',
          message: `Dangerous command pattern blocked: ${pattern.source}`
        };
      }
    }
  }

  // Restrict file operations to allowed directories
  if (['Read', 'Write', 'Edit'].includes(toolName)) {
    const filePath = (input as any).file_path || '';
    const isAllowed = ALLOWED_DIRS.some(dir => filePath.startsWith(dir));

    if (!isAllowed) {
      return {
        behavior: 'deny',
        message: `File access outside allowed directories: ${filePath}`
      };
    }
  }

  // Allow with original input
  return {
    behavior: 'allow',
    updatedInput: input
  };
};
```

### Usage

```typescript
import { customPermissionHandler } from "../sdk/permission-handler.js";

const queryOptions = {
  // Change from bypassPermissions
  permissionMode: 'default',
  canUseTool: customPermissionHandler
};
```

---

## 5. Enable Settings Sources (Medium)

### Changes to claudeAgent.ts

```typescript
const queryOptions = {
  // ... existing options ...

  // NEW: Load project settings and CLAUDE.md
  settingSources: ['project'],

  // NEW: Use Claude Code's system prompt as base, extend with agent prompt
  systemPrompt: {
    type: 'preset',
    preset: 'claude_code',
    append: agent.systemPrompt  // Add agent-specific instructions
  }
};
```

### Create Project Settings

```json
// .claude/settings.json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Glob(**)",
      "Grep(**)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Write(/etc/**)"
    ]
  },
  "mcpServers": {
    "claude-flow": {
      "command": "npx",
      "args": ["claude-flow@alpha", "mcp", "start"]
    }
  }
}
```

---

## 6. Structured Outputs (Medium)

### Implementation

```typescript
import { z } from 'zod';

// Define output schema
const CodeReviewSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { enum: ['critical', 'high', 'medium', 'low'] },
          file: { type: 'string' },
          line: { type: 'number' },
          description: { type: 'string' },
          suggestion: { type: 'string' }
        }
      }
    },
    score: { type: 'number', minimum: 0, maximum: 100 }
  },
  required: ['summary', 'issues', 'score']
};

// Usage
const queryOptions = {
  // ... existing options ...
  outputFormat: {
    type: 'json_schema',
    schema: CodeReviewSchema
  }
};

// Parse result
for await (const msg of result) {
  if (msg.type === 'result' && msg.subtype === 'success') {
    const structured = msg.structured_output as CodeReviewResult;
    console.log(`Score: ${structured.score}`);
    console.log(`Issues: ${structured.issues.length}`);
  }
}
```

---

## 7. Sandbox Configuration (Lower)

### Implementation

```typescript
const queryOptions = {
  // ... existing options ...

  sandbox: {
    enabled: true,
    autoAllowBashIfSandboxed: true,
    excludedCommands: ['docker', 'npm', 'npx'],  // Always allow these
    allowUnsandboxedCommands: false,  // Strict mode
    network: {
      allowLocalBinding: true,  // Dev servers
      allowUnixSockets: ['/var/run/docker.sock']
    }
  }
};
```

---

## 8. Beta Features (Lower)

### Enable 1M Context Window

```typescript
const queryOptions = {
  // ... existing options ...
  betas: ['context-1m-2025-08-07'],
  model: 'claude-sonnet-4-5-20250929'  // Must be Sonnet 4 or 4.5
};
```

---

## Migration Checklist

### Phase 1: Core (Week 1-2)
- [ ] Add `Task` to allowedTools
- [ ] Implement agent conversion to SDK format
- [ ] Create hooks bridge
- [ ] Connect hooks to SDK query options

### Phase 2: Sessions & Permissions (Week 2-3)
- [ ] Capture session IDs
- [ ] Implement resume capability
- [ ] Create custom permission handler
- [ ] Add settings sources

### Phase 3: Advanced (Week 3-4)
- [ ] Add structured outputs
- [ ] Configure sandbox
- [ ] Enable beta features
- [ ] Add file checkpointing

### Validation
- [ ] Test subagent spawning
- [ ] Verify hook callbacks fire
- [ ] Confirm session resume works
- [ ] Validate permission blocking
- [ ] Check structured output parsing
