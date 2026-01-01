# Claude Agent SDK v0.1.76 Gap Analysis for Agentic-Flow v2

> **Analysis Date**: December 31, 2025
> **Claude Agent SDK Version**: 0.1.76
> **Agentic-Flow Version**: 2.0.1-alpha.25

## Executive Summary

This document provides a comprehensive analysis of the Claude Agent SDK capabilities and identifies gaps in the current agentic-flow v2 implementation. The analysis covers API features, hooks, tools, sessions, permissions, and advanced capabilities.

## Sources

- [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [TypeScript SDK Reference](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [Building Agents with Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Claude Agent SDK Demos](https://github.com/anthropics/claude-agent-sdk-demos)

---

## 1. Claude Agent SDK Core Capabilities

### 1.1 Primary API Functions

| Function | Description | Status in Agentic-Flow |
|----------|-------------|------------------------|
| `query()` | Primary async generator for Claude interactions | ✅ Used |
| `tool()` | Type-safe MCP tool definition | ✅ Used |
| `createSdkMcpServer()` | In-process MCP server creation | ✅ Used |

### 1.2 Built-in Tools

| Tool | Description | Status |
|------|-------------|--------|
| `Read` | Read files from filesystem | ✅ Enabled |
| `Write` | Create new files | ✅ Enabled |
| `Edit` | Make precise file edits | ✅ Enabled |
| `Bash` | Run terminal commands | ✅ Enabled |
| `Glob` | Find files by pattern | ✅ Enabled |
| `Grep` | Search file contents with regex | ✅ Enabled |
| `WebSearch` | Search the web | ✅ Enabled |
| `WebFetch` | Fetch and parse web pages | ✅ Enabled |
| `NotebookEdit` | Edit Jupyter notebooks | ✅ Enabled |
| `TodoWrite` | Task list management | ✅ Enabled |
| `Task` | Launch subagents | ❌ **NOT ENABLED** |
| `AskUserQuestion` | Interactive user queries | ❌ **NOT ENABLED** |
| `ExitPlanMode` | Exit planning mode | ❌ **NOT ENABLED** |
| `ListMcpResources` | List MCP resources | ❌ **NOT ENABLED** |
| `ReadMcpResource` | Read MCP resources | ❌ **NOT ENABLED** |
| `KillBash` | Kill background shells | ❌ **NOT ENABLED** |
| `BashOutput` | Get background shell output | ❌ **NOT ENABLED** |

---

## 2. Missing SDK Features in Agentic-Flow v2

### 2.1 Subagent System (CRITICAL GAP)

**SDK Capability**: Define and spawn specialized subagents for focused tasks.

```typescript
// SDK Pattern
const result = query({
  prompt: "Use the code-reviewer agent to review this codebase",
  options: {
    allowedTools: ["Read", "Glob", "Grep", "Task"],  // Task enables subagents
    agents: {
      "code-reviewer": {
        description: "Expert code reviewer for quality and security reviews.",
        prompt: "Analyze code quality and suggest improvements.",
        tools: ["Read", "Glob", "Grep"],
        model: "sonnet"  // Model override per agent
      }
    }
  }
});
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- No `agents` option passed to `query()`
- `Task` tool not in `allowedTools`
- No programmatic agent definitions

**Priority**: CRITICAL - Core feature for multi-agent orchestration

### 2.2 Hooks System (PARTIAL GAP)

**SDK Hook Events**:
| Hook Event | Description | Agentic-Flow |
|------------|-------------|--------------|
| `PreToolUse` | Before tool execution | ❌ Not passed to SDK |
| `PostToolUse` | After tool execution | ❌ Not passed to SDK |
| `PostToolUseFailure` | On tool failure | ❌ Not passed to SDK |
| `Notification` | System notifications | ❌ Not passed to SDK |
| `UserPromptSubmit` | User message submitted | ❌ Not passed to SDK |
| `SessionStart` | Session begins | ❌ Not passed to SDK |
| `SessionEnd` | Session ends | ❌ Not passed to SDK |
| `Stop` | Agent stops | ❌ Not passed to SDK |
| `SubagentStart` | Subagent spawned | ❌ Not passed to SDK |
| `SubagentStop` | Subagent finished | ❌ Not passed to SDK |
| `PreCompact` | Before context compaction | ❌ Not passed to SDK |
| `PermissionRequest` | Permission needed | ❌ Not passed to SDK |

**Agentic-Flow Status**: ❌ NOT CONNECTED
- Has custom hooks system (`intelligence-bridge.ts`)
- Hooks not passed to Claude Agent SDK `query()` options
- SDK hooks would enable native Claude Code integration

**SDK Hook Example**:
```typescript
const logFileChange: HookCallback = async (input) => {
  const filePath = (input as any).tool_input?.file_path ?? "unknown";
  appendFileSync("./audit.log", `${new Date().toISOString()}: ${filePath}\n`);
  return {};
};

query({
  prompt: "Refactor utils.py",
  options: {
    hooks: {
      PostToolUse: [{ matcher: "Edit|Write", hooks: [logFileChange] }]
    }
  }
});
```

### 2.3 Session Management (NOT IMPLEMENTED)

**SDK Capability**: Resume conversations, fork sessions, maintain context.

```typescript
// Capture session ID
let sessionId: string;
for await (const msg of query({ prompt: "Read auth module" })) {
  if (msg.type === "system" && msg.subtype === "init") {
    sessionId = msg.session_id;
  }
}

// Resume with full context
for await (const msg of query({
  prompt: "Now find all places that call it",
  options: { resume: sessionId }
})) { ... }

// Fork session for parallel exploration
query({ options: { resume: sessionId, forkSession: true } });
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- No session ID capture
- No `resume` option usage
- No `forkSession` support
- Each `query()` call is standalone

### 2.4 Custom Permission System (NOT IMPLEMENTED)

**SDK Capability**: Fine-grained tool permission control.

```typescript
const canUseTool: CanUseTool = async (toolName, input, { suggestions }) => {
  if (toolName === "Bash" && input.command?.includes("rm -rf")) {
    return { behavior: 'deny', message: 'Dangerous command blocked' };
  }
  return { behavior: 'allow', updatedInput: input };
};

query({ options: { canUseTool } });
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- Uses `permissionMode: 'bypassPermissions'` only
- No custom `canUseTool` handler
- No permission suggestions

### 2.5 Settings Sources (NOT IMPLEMENTED)

**SDK Capability**: Load CLAUDE.md, project settings, user settings.

```typescript
query({
  options: {
    settingSources: ['project'],  // Load .claude/settings.json and CLAUDE.md
    systemPrompt: { type: 'preset', preset: 'claude_code' }
  }
});
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- No `settingSources` option
- CLAUDE.md files not loaded by SDK
- Only custom `systemPrompt` string passed

### 2.6 Sandbox Configuration (NOT IMPLEMENTED)

**SDK Capability**: Secure command execution with network restrictions.

```typescript
query({
  options: {
    sandbox: {
      enabled: true,
      autoAllowBashIfSandboxed: true,
      excludedCommands: ["docker"],
      network: {
        allowLocalBinding: true,
        allowUnixSockets: ["/var/run/docker.sock"]
      }
    }
  }
});
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- No `sandbox` option passed
- Commands run without isolation

### 2.7 File Checkpointing (NOT IMPLEMENTED)

**SDK Capability**: Track file changes, enable rewind.

```typescript
const q = query({
  prompt: "Refactor the codebase",
  options: { enableFileCheckpointing: true }
});

// Rewind to previous state
await q.rewindFiles(userMessageUuid);
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- No `enableFileCheckpointing` option
- No `rewindFiles()` capability

### 2.8 Structured Outputs (NOT IMPLEMENTED)

**SDK Capability**: Define JSON schema for agent results.

```typescript
query({
  options: {
    outputFormat: {
      type: 'json_schema',
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          issues: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }
});
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- No structured output support
- Results parsed from raw text

### 2.9 Beta Features (NOT IMPLEMENTED)

**SDK Capability**: Enable experimental features.

```typescript
query({
  options: {
    betas: ['context-1m-2025-08-07']  // 1M token context
  }
});
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- No `betas` option
- Cannot enable 1M context window

### 2.10 Query Control Methods (NOT IMPLEMENTED)

**SDK Capability**: Runtime control of running queries.

```typescript
const q = query({ prompt: "Complex task" });

// Runtime controls
await q.setPermissionMode('acceptEdits');
await q.setModel('claude-opus-4-5');
await q.setMaxThinkingTokens(8000);
await q.interrupt();  // Streaming mode only

// Introspection
const commands = await q.supportedCommands();
const models = await q.supportedModels();
const mcpStatus = await q.mcpServerStatus();
const account = await q.accountInfo();
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- No query control methods used
- No runtime model/permission switching

### 2.11 Plugins System (NOT IMPLEMENTED)

**SDK Capability**: Load custom plugins programmatically.

```typescript
query({
  options: {
    plugins: [
      { type: 'local', path: './my-plugin' }
    ]
  }
});
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- No `plugins` option
- Uses MCP servers only

### 2.12 Streaming Input Mode (NOT IMPLEMENTED)

**SDK Capability**: Stream prompts as async iterables.

```typescript
async function* streamPrompts(): AsyncIterable<SDKUserMessage> {
  yield { type: 'user', message: { content: [{ type: 'text', text: 'Hello' }] } };
  await delay(1000);
  yield { type: 'user', message: { content: [{ type: 'text', text: 'Continue' }] } };
}

query({ prompt: streamPrompts() });
```

**Agentic-Flow Status**: ❌ NOT IMPLEMENTED
- Only string prompts supported
- No async iterable input

---

## 3. Partial Implementations

### 3.1 MCP Server Integration

**SDK Support**: Multiple transport types
- `stdio`: ✅ Used
- `sse`: ❌ Not configured
- `http`: ❌ Not configured
- `sdk` (in-process): ✅ Used (claudeFlowSdkServer)

### 3.2 System Prompt

**SDK Support**:
```typescript
// String prompt
systemPrompt: "You are a helpful assistant"

// Preset with extension
systemPrompt: {
  type: 'preset',
  preset: 'claude_code',
  append: 'Additional instructions...'
}
```

**Agentic-Flow**: ✅ String only, ❌ Preset not used

### 3.3 Model Configuration

**SDK Options**:
- `model`: ✅ Passed
- `fallbackModel`: ❌ Not used
- `maxThinkingTokens`: ❌ Not used
- `maxTurns`: ❌ Not used
- `maxBudgetUsd`: ❌ Not used

### 3.4 Message Handling

**SDK Message Types**:
- `SDKAssistantMessage`: ✅ Handled
- `SDKUserMessage`: ⚠️ Partial
- `SDKResultMessage`: ❌ Not fully parsed
- `SDKSystemMessage`: ❌ Not captured
- `SDKPartialAssistantMessage`: ⚠️ Limited
- `SDKCompactBoundaryMessage`: ❌ Not handled

---

## 4. Recommendations

### 4.1 Critical Priority (Must Have)

1. **Enable Subagents**
   - Add `Task` to `allowedTools`
   - Implement `agents` option with agent definitions
   - Support per-agent model overrides

2. **Connect SDK Hooks**
   - Bridge existing hooks to SDK hook callbacks
   - Enable `PreToolUse`, `PostToolUse` for learning
   - Use `SessionStart`/`SessionEnd` for persistence

3. **Session Management**
   - Capture `session_id` from init messages
   - Implement `resume` option for continuity
   - Support `forkSession` for parallel exploration

### 4.2 High Priority (Should Have)

4. **Custom Permissions**
   - Implement `canUseTool` handler
   - Integrate with existing rate limiting
   - Add audit logging

5. **Settings Sources**
   - Enable `settingSources: ['project']`
   - Load CLAUDE.md for project context
   - Use Claude Code's system prompt preset

6. **Structured Outputs**
   - Implement `outputFormat` for JSON responses
   - Enable schema validation

### 4.3 Medium Priority (Nice to Have)

7. **Sandbox Mode**
   - Enable for secure execution
   - Configure network restrictions
   - Add Docker socket access

8. **File Checkpointing**
   - Enable for refactoring operations
   - Implement rollback capability

9. **Beta Features**
   - Enable 1M context window
   - Track new betas

### 4.4 Lower Priority (Future)

10. **Query Control Methods**
11. **Plugins System**
12. **Streaming Input Mode**

---

## 5. Implementation Roadmap

### Phase 1: Core SDK Integration (Week 1-2)

```typescript
// Updated claudeAgent.ts pattern
const queryOptions = {
  systemPrompt: agent.systemPrompt,
  model: finalModel,
  permissionMode: 'acceptEdits',  // Changed from bypassPermissions

  // NEW: Enable subagents
  allowedTools: [
    'Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep',
    'WebFetch', 'WebSearch', 'NotebookEdit', 'TodoWrite',
    'Task',  // Enable subagents
    'AskUserQuestion'  // Enable user interaction
  ],

  // NEW: Define subagents
  agents: convertAgentsToSdkFormat(loadedAgents),

  // NEW: Connect hooks
  hooks: {
    PreToolUse: [{ hooks: [preToolUseHook] }],
    PostToolUse: [{ hooks: [postToolUseHook] }],
    SessionStart: [{ hooks: [sessionStartHook] }]
  },

  // NEW: Load project settings
  settingSources: ['project'],

  mcpServers
};
```

### Phase 2: Session & Permissions (Week 2-3)

- Implement session ID tracking
- Add resume capability
- Create custom `canUseTool` handler
- Integrate with IntelligenceStore

### Phase 3: Advanced Features (Week 3-4)

- Structured outputs
- Sandbox configuration
- File checkpointing
- Beta features

---

## 6. Current Agentic-Flow Advantages

Features in agentic-flow v2 that go beyond Claude Agent SDK:

| Feature | Description |
|---------|-------------|
| **Multi-Provider Routing** | Supports Anthropic, Gemini, OpenRouter, Requesty, ONNX |
| **ReasoningBank** | Learning memory with trajectories |
| **SONA Micro-LoRA** | ~0.05ms adaptation |
| **HNSW Vector Search** | 150x faster pattern matching |
| **TensorCompress** | Tiered memory compression |
| **Multi-Algorithm RL** | 9 specialized learning algorithms |
| **Swarm Orchestration** | Multi-agent coordination |
| **IntelligenceStore** | SQLite persistence |

These should be preserved while adding SDK native features.

---

## 7. Conclusion

Agentic-flow v2 uses the Claude Agent SDK but only leverages approximately **30%** of its capabilities. The most critical gaps are:

1. **Subagent system** - Cannot spawn specialized subagents
2. **SDK Hooks** - Custom hooks not connected to SDK
3. **Session management** - No context persistence across queries
4. **Permission system** - Uses bypass mode only

Implementing these features would significantly enhance agentic-flow's capabilities while maintaining its unique advantages (multi-provider, learning, compression).

---

## Appendix A: SDK Version History

| Version | Key Features |
|---------|--------------|
| 0.1.76 | Latest (Dec 2025) |
| 0.1.x | Renamed from Claude Code SDK |

## Appendix B: Related Documentation

- [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Claude Code CLI](https://code.claude.com/docs/en/cli-reference)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)
