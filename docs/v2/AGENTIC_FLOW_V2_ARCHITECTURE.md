# Agentic-Flow v2 Architecture Overview

> Version 2.0.1-alpha.25
> Last Updated: December 31, 2025

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENTIC-FLOW v2                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐     │
│  │   CLI Layer      │    │   Agent Layer    │    │   MCP Layer      │     │
│  │                  │    │                  │    │                  │     │
│  │  - cli-proxy.ts  │───▶│  - claudeAgent   │───▶│  - fastmcp       │     │
│  │  - hooks.ts      │    │  - codeReview    │    │  - 213+ tools    │     │
│  │  - mcp.ts        │    │  - dataAgent     │    │  - claude-flow   │     │
│  │                  │    │  - webResearch   │    │  - flow-nexus    │     │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘     │
│           │                       │                       │               │
│           ▼                       ▼                       ▼               │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                    CLAUDE AGENT SDK                               │    │
│  │                    @anthropic-ai/claude-agent-sdk v0.1.5          │    │
│  │                                                                   │    │
│  │   query() ─▶ Built-in Tools ─▶ Agent Loop ─▶ Results             │    │
│  │                                                                   │    │
│  │   Used Features:        Missing Features:                         │    │
│  │   ✓ query()             ✗ agents (subagents)                     │    │
│  │   ✓ tool()              ✗ hooks (SDK hooks)                      │    │
│  │   ✓ createSdkMcpServer  ✗ resume/sessions                        │    │
│  │   ✓ allowedTools        ✗ canUseTool                             │    │
│  │   ✓ mcpServers          ✗ settingSources                         │    │
│  │   ✓ systemPrompt        ✗ outputFormat                           │    │
│  │   ✓ permissionMode      ✗ sandbox                                │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│           │                                                               │
│           ▼                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                    INTELLIGENCE LAYER                             │    │
│  │                    (RuVector + SONA + AgentDB)                    │    │
│  │                                                                   │    │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │    │
│  │   │ SONA        │   │ HNSW        │   │ TensorComp  │            │    │
│  │   │ Micro-LoRA  │   │ 150x faster │   │ Tiered      │            │    │
│  │   │ ~0.05ms     │   │ search      │   │ compression │            │    │
│  │   └─────────────┘   └─────────────┘   └─────────────┘            │    │
│  │                                                                   │    │
│  │   ┌─────────────────────────────────────────────────────────┐    │    │
│  │   │ Multi-Algorithm RL (9 algorithms)                        │    │    │
│  │   │ double-q, sarsa, actor-critic, ppo, decision-transformer │    │    │
│  │   │ td-lambda, q-learning, reinforce, a2c                    │    │    │
│  │   └─────────────────────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│           │                                                               │
│           ▼                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                    PERSISTENCE LAYER                              │    │
│  │                                                                   │    │
│  │   ┌─────────────────┐        ┌─────────────────┐                 │    │
│  │   │ IntelligenceStore│        │ ReasoningBank   │                 │    │
│  │   │ (SQLite)         │        │ (WASM)          │                 │    │
│  │   │                  │        │                  │                 │    │
│  │   │ - trajectories   │        │ - vector store   │                 │    │
│  │   │ - routings       │        │ - embeddings     │                 │    │
│  │   │ - patterns       │        │ - memories       │                 │    │
│  │   │ - stats          │        │                  │                 │    │
│  │   └─────────────────┘        └─────────────────┘                 │    │
│  │                                                                   │    │
│  │   intelligence.db              intelligence.json                  │    │
│  │   .agentic-flow/               .agentic-flow/                     │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. CLI Layer

| File | Purpose |
|------|---------|
| `src/cli-proxy.ts` | Main entry point, CLI argument parsing |
| `src/cli/commands/hooks.ts` | Intelligence hooks management |
| `src/cli/commands/mcp.ts` | MCP server management |
| `src/utils/cli.ts` | CLI utilities and help |

### 2. Agent Layer

| Agent | File | Purpose |
|-------|------|---------|
| claudeAgent | `src/agents/claudeAgent.ts` | Generic agent with multi-provider support |
| codeReviewAgent | `src/agents/codeReviewAgent.ts` | Code analysis and review |
| dataAgent | `src/agents/dataAgent.ts` | Data processing and analysis |
| webResearchAgent | `src/agents/webResearchAgent.ts` | Web search and research |
| claudeFlowAgent | `src/agents/claudeFlowAgent.ts` | Claude-flow specific operations |

### 3. MCP Layer

| Server | Purpose |
|--------|---------|
| claude-flow-sdk | In-process SDK server with memory, swarm, agent tools |
| claude-flow | External claude-flow MCP server (213+ tools) |
| flow-nexus | Flow Nexus platform integration |
| agentic-payments | Payment processing tools |

### 4. Intelligence Layer

| Component | Source | Features |
|-----------|--------|----------|
| SONA | ruvector | Micro-LoRA ~0.05ms, EWC++ consolidation |
| HNSW | ruvector/AgentDB | 150x faster vector search |
| TensorCompress | ruvector | Tiered pattern compression (hot/warm/cool/cold/archive) |
| Multi-Algorithm RL | ruvector@0.1.69 | 9 specialized algorithms |
| IntelligenceStore | Custom | SQLite persistence |

### 5. Hooks System

| Hook | Trigger | Purpose |
|------|---------|---------|
| PreToolUse | Before Edit/Write/Bash | Agent routing, file analysis |
| PostToolUse | After Edit/Write/Bash | SONA learning, pattern recording |
| SessionStart | Conversation begins | Load intelligence state |
| Stop | Conversation ends | Save learning data |
| UserPromptSubmit | User sends message | Intelligence stats |
| PreCompact | Before compaction | Store patterns in ReasoningBank |

## Data Flow

```
User Prompt
    │
    ▼
┌───────────────┐
│ CLI Parser    │
│ (cli-proxy.ts)│
└───────┬───────┘
        │
        ▼
┌───────────────┐     ┌─────────────────┐
│ Agent Loader  │────▶│ .claude/agents/ │
│ (agentLoader) │     │ (YAML/MD files) │
└───────┬───────┘     └─────────────────┘
        │
        ▼
┌───────────────┐
│ claudeAgent   │
│               │
│ - Provider    │◀───── Environment Variables
│   Selection   │       (PROVIDER, API keys)
│               │
│ - Model       │
│   Config      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Claude SDK    │
│ query()       │
│               │◀───── MCP Servers
│ - systemPrompt│       (in-process + stdio)
│ - allowedTools│
│ - mcpServers  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Tool Execution│
│               │
│ Read, Write,  │
│ Edit, Bash,   │
│ Glob, Grep,   │
│ WebFetch,     │
│ WebSearch     │
└───────┬───────┘
        │
        ▼
┌───────────────┐     ┌─────────────────┐
│ Intelligence  │────▶│ IntelligenceStore│
│ Hooks         │     │ (SQLite)         │
│               │     └─────────────────┘
│ - PreToolUse  │
│ - PostToolUse │     ┌─────────────────┐
│ - SessionStart│────▶│ intelligence.json│
└───────────────┘     └─────────────────┘
```

## Provider Routing

```
Environment Variable          Provider          Model
───────────────────────────────────────────────────────
PROVIDER=anthropic     ──▶   Anthropic    ──▶  claude-sonnet-4-5
PROVIDER=openrouter    ──▶   OpenRouter   ──▶  deepseek/deepseek-chat
PROVIDER=gemini        ──▶   Gemini Proxy ──▶  gemini-2.0-flash-exp
PROVIDER=requesty      ──▶   Requesty     ──▶  deepseek/deepseek-chat
PROVIDER=onnx          ──▶   ONNX Local   ──▶  onnx-local

                              ▼
                    ┌─────────────────┐
                    │ ANTHROPIC_BASE_URL│
                    │ (Proxy if needed) │
                    └─────────────────┘
                              ▼
                    ┌─────────────────┐
                    │ Claude Agent SDK │
                    │     query()      │
                    └─────────────────┘
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @anthropic-ai/claude-agent-sdk | ^0.1.5 | Core agent SDK |
| @ruvector/core | ^0.1.29 | Vector operations |
| @ruvector/sona | (via core) | Micro-LoRA learning |
| ruvector | ^0.1.69 | Multi-algorithm RL |
| agentdb | ^2.0.0-alpha.2.20 | HNSW vector database |
| fastmcp | ^3.19.0 | MCP server framework |
| better-sqlite3 | ^11.10.0 | SQLite for persistence |

## Configuration Files

| File | Purpose |
|------|---------|
| `.claude/settings.json` | Claude Code settings |
| `.agentic-flow/intelligence.json` | Learning state (JSON) |
| `.agentic-flow/intelligence.db` | Learning state (SQLite) |
| `~/.agentic-flow/mcp-config.json` | User MCP server config |
| `CLAUDE.md` | Project instructions (not loaded by SDK yet) |

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | - | Anthropic API authentication |
| `PROVIDER` | anthropic | Provider selection |
| `COMPLETION_MODEL` | claude-sonnet-4-5 | Model override |
| `AGENTIC_FLOW_INTELLIGENCE` | true | Enable intelligence layer |
| `AGENTIC_FLOW_LEARNING_RATE` | 0.1 | SONA learning rate |
| `ENABLE_CLAUDE_FLOW_MCP` | true | Enable claude-flow MCP |
| `ENABLE_FLOW_NEXUS_MCP` | true | Enable flow-nexus MCP |

## SDK Integration Gap Summary

| Category | Current | SDK Capable | Gap |
|----------|---------|-------------|-----|
| Tools | 10 enabled | 17 available | 7 missing |
| Hooks | Custom only | 12 SDK events | Not connected |
| Sessions | None | Full support | Not implemented |
| Permissions | Bypass only | Full control | Not implemented |
| Subagents | MCP-based | Native Task tool | Not enabled |
| Settings | None | 3 sources | Not implemented |
| Outputs | Text only | Structured JSON | Not implemented |

See `CLAUDE_AGENT_SDK_GAP_ANALYSIS.md` for complete analysis.
