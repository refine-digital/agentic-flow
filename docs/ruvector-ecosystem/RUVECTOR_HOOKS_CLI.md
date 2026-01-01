# RuVector Hooks CLI - Intelligence Integration

**Package:** `ruvector` core package
**Feature:** Built-in hooks system for intelligent workflow automation
**Status:** ⚠️ Discovered but not yet integrated

---

## 🎯 Overview

The `ruvector` package includes a **built-in hooks system** for intelligence integration into development workflows. This provides:

- **Session management** - Track workflow sessions
- **Pre/post-edit intelligence** - Learn from code changes
- **Command intelligence** - Route and optimize commands
- **Memory system** - Store and recall context
- **Agent routing** - Suggest optimal agents for tasks
- **Swarm recommendations** - Multi-agent coordination

---

## 📋 Available Commands

```bash
npx ruvector hooks [command]
```

### Command Reference

**Complete command list from `npx ruvector@latest hooks --help`:**

| Command | Description | Use Case |
|---------|-------------|----------|
| **init [options]** | Initialize hooks in current project | One-time project setup |
| **stats** | Show intelligence statistics | Monitor learning progress |
| **session-start [options]** | Session start hook | Track workflow beginning |
| **session-end [options]** | Session end hook | Export metrics, save state |
| **pre-edit `<file>`** | Pre-edit intelligence | Analyze before editing |
| **post-edit [options] `<file>`** | Post-edit learning | Learn from changes |
| **pre-command `<command...>`** | Pre-command intelligence | Validate/optimize commands |
| **post-command [options] `<command...>`** | Post-command learning | Learn from results |
| **route [options] `<task...>`** | Route task to agent | Find optimal agent |
| **suggest-context** | Suggest relevant context | Context-aware assistance |
| **remember [options] `<content...>`** | Store in memory | Save important information |
| **recall [options] `<query...>`** | Search memory | Retrieve past context |
| **pre-compact [options]** | Pre-compact hook | Before database compaction |
| **swarm-recommend `<task-type>`** | Recommend agent for task | Multi-agent coordination |
| **async-agent [options]** | Async agent hook | Background agent operations |
| **lsp-diagnostic [options]** | LSP diagnostic hook | Language server integration |
| **track-notification** | Track notification | Monitor system notifications |
| **help [command]** | Display help for command | Get command-specific help |

### NEW Commands Discovered

**Advanced hooks not previously documented:**

1. **`pre-compact [options]`** - Pre-database compaction hook
   - Runs before vector database compaction
   - Optimize memory before cleanup
   - Useful for production systems

2. **`async-agent [options]`** - Async agent operations
   - Background agent execution
   - Non-blocking workflow support
   - Enable parallel agent tasks

3. **`lsp-diagnostic [options]`** - Language Server Protocol integration
   - IDE/editor integration
   - Real-time code intelligence
   - Diagnostic feedback from LSP

4. **`track-notification`** - System notification tracking
   - Monitor system-level notifications
   - Learn from notification patterns
   - Context from external events

### Command Options Examples

**`init` command:**
```bash
npx ruvector hooks init              # Standard initialization
npx ruvector hooks init --force      # Force overwrite existing
```

**`route` command:**
```bash
npx ruvector hooks route "implement auth"           # Basic routing
npx ruvector hooks route "fix bug" --file auth.ts   # File context
npx ruvector hooks route "optimize" --crate core    # Rust crate context
```

---

## 🔧 Integration with agentic-flow

### Current Status

**NOT INTEGRATED** - This hooks system is discovered in ruvector core but not currently used by agentic-flow.

### Integration Opportunity

The ruvector hooks CLI could replace or complement the existing claude-flow hooks system:

**Current (claude-flow hooks):**
```bash
npx claude-flow@alpha hooks pre-task --description "task"
npx claude-flow@alpha hooks post-task --task-id "id"
npx claude-flow@alpha hooks session-restore --session-id "id"
```

**Potential (ruvector hooks):**
```bash
npx ruvector hooks session-start
npx ruvector hooks pre-edit src/file.ts
npx ruvector hooks post-edit src/file.ts
npx ruvector hooks route "implement authentication"
npx ruvector hooks session-end
```

### Advantages of RuVector Hooks

1. **Native integration** - Built into ruvector core (already a dependency)
2. **Memory-backed** - Uses vector database for context storage
3. **Agent routing** - Built-in agent recommendation
4. **Swarm coordination** - Multi-agent suggestions
5. **Intelligence stats** - Track learning progress
6. **Lighter weight** - No separate claude-flow@alpha dependency needed

---

## 🚀 Recommended Integration

### Phase 1: Evaluate Hooks System

1. **Initialize in agentic-flow**
   ```bash
   cd /workspaces/agentic-flow
   npx ruvector hooks init
   ```

2. **Test basic workflow**
   ```bash
   npx ruvector hooks session-start
   npx ruvector hooks pre-edit src/index.ts
   # Make changes
   npx ruvector hooks post-edit src/index.ts
   npx ruvector hooks stats
   npx ruvector hooks session-end
   ```

3. **Test agent routing**
   ```bash
   npx ruvector hooks route "Write a React component"
   npx ruvector hooks swarm-recommend
   ```

### Phase 2: Compare with Claude-Flow Hooks

**Feature Comparison:**

| Feature | claude-flow hooks | ruvector hooks | Winner |
|---------|------------------|----------------|--------|
| Session management | ✅ | ✅ | Tie |
| Pre/post editing | ✅ | ✅ | Tie |
| Memory system | ✅ (ReasoningBank) | ✅ (Vector DB) | Tie |
| Agent routing | ❌ | ✅ | **ruvector** |
| Swarm recommendations | ❌ | ✅ | **ruvector** |
| Context suggestions | ❌ | ✅ | **ruvector** |
| Neural training | ✅ | ⚠️ Unknown | claude-flow |
| Installation | Separate package | Built-in | **ruvector** |

### Phase 3: Integration Strategy

**Option A: Replace claude-flow hooks**
- Use ruvector hooks exclusively
- Remove claude-flow@alpha dependency
- Simpler architecture

**Option B: Hybrid approach**
- Use ruvector hooks for agent routing + memory
- Use claude-flow hooks for neural training
- Best of both worlds

**Option C: Wrapper layer**
- Create unified hooks API
- Backend switches between ruvector/claude-flow
- Flexible but more complex

**Recommendation:** **Option B (Hybrid)** for maximum capability

---

## 💡 Usage Examples

### Session Workflow

```bash
#!/bin/bash
# Intelligent development session

# Start session
npx ruvector hooks session-start

# Before editing
npx ruvector hooks pre-edit src/components/Login.tsx
npx ruvector hooks suggest-context

# Make changes...
# git diff src/components/Login.tsx

# After editing
npx ruvector hooks post-edit src/components/Login.tsx

# Route next task
NEXT_AGENT=$(npx ruvector hooks route "Write tests for Login component")
echo "Recommended agent: $NEXT_AGENT"

# End session with stats
npx ruvector hooks stats
npx ruvector hooks session-end
```

### Memory System

```bash
# Store important context
npx ruvector hooks remember "User authentication uses JWT tokens with 24h expiry"
npx ruvector hooks remember "Database schema uses PostgreSQL with RuVector extension"

# Recall when needed
npx ruvector hooks recall "authentication"
# Returns: "User authentication uses JWT tokens with 24h expiry"

npx ruvector hooks recall "database"
# Returns: "Database schema uses PostgreSQL with RuVector extension"
```

### Agent Routing

```bash
# Get agent recommendation
npx ruvector hooks route "Implement user registration endpoint"
# Output: backend-dev

npx ruvector hooks route "Review code for security vulnerabilities"
# Output: reviewer

npx ruvector hooks route "Write unit tests with 90% coverage"
# Output: tester

# Get swarm recommendation for complex task
npx ruvector hooks swarm-recommend
# Output: {
#   "agents": ["researcher", "backend-dev", "tester", "reviewer"],
#   "topology": "pipeline",
#   "estimated_time": "2h 30m"
# }
```

---

## 🔬 Intelligence Statistics

```bash
# View learning progress
npx ruvector hooks stats

# Example output:
# RuVector Intelligence Statistics
# ================================
# Sessions: 42
# Files edited: 156
# Commands executed: 1,203
# Memory entries: 89
# Agent routings: 312
# Average routing accuracy: 87%
# Learning rate: 0.023
# Vector database size: 45.2 MB
```

---

## 🎯 Integration with Existing Systems

### With AgentDB

```typescript
// packages/agentdb/src/hooks/ruvector-hooks.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class RuVectorHooks {
  async preEdit(file: string): Promise<void> {
    await execAsync(`npx ruvector hooks pre-edit ${file}`);
  }

  async postEdit(file: string): Promise<void> {
    await execAsync(`npx ruvector hooks post-edit ${file}`);
  }

  async routeTask(task: string): Promise<string> {
    const { stdout } = await execAsync(`npx ruvector hooks route "${task}"`);
    return stdout.trim();
  }

  async remember(content: string): Promise<void> {
    await execAsync(`npx ruvector hooks remember "${content}"`);
  }

  async recall(query: string): Promise<string> {
    const { stdout } = await execAsync(`npx ruvector hooks recall "${query}"`);
    return stdout.trim();
  }
}
```

### With agentic-flow CLI

```typescript
// agentic-flow/src/cli/hooks-integration.ts
import { RuVectorHooks } from './ruvector-hooks';

export class IntelligentCLI {
  private hooks = new RuVectorHooks();

  async executeTask(userQuery: string) {
    // Route to optimal agent
    const agent = await this.hooks.routeTask(userQuery);
    console.log(`🎯 Routing to: ${agent}`);

    // Get relevant context
    const context = await this.hooks.recall(userQuery);
    if (context) {
      console.log(`📚 Relevant context: ${context}`);
    }

    // Execute task...
    const result = await this.executeAgent(agent, userQuery, context);

    // Store outcome in memory
    if (result.success) {
      await this.hooks.remember(
        `Successfully ${userQuery} using ${agent}`
      );
    }

    return result;
  }
}
```

---

## 📊 Expected Benefits

### Workflow Intelligence
- ✅ **Automatic agent routing** - No manual selection
- ✅ **Context awareness** - Recall similar past tasks
- ✅ **Learning from edits** - Improve over time
- ✅ **Swarm optimization** - Multi-agent coordination

### Developer Experience
- ✅ **Seamless integration** - Git-like workflow
- ✅ **No explicit training** - Learn from usage
- ✅ **Built-in memory** - Vector-backed context
- ✅ **Statistics tracking** - Monitor improvement

### Performance
- ✅ **Native integration** - Already in dependencies
- ✅ **Lightweight** - No additional packages
- ✅ **Fast routing** - Vector similarity search
- ✅ **Scalable** - Grows with usage

---

## 🚨 Next Steps

### Immediate (Testing)
1. ✅ Initialize hooks in agentic-flow
2. ✅ Test basic workflow (session, edit, routing)
3. ✅ Compare with claude-flow hooks
4. ✅ Evaluate integration options

### Short-term (Integration)
5. 🎯 Implement hybrid hooks system (Phase 2)
6. 🎯 Integrate with AgentDB memory
7. 🎯 Add to CLI workflow
8. 🎯 Document in CLAUDE.md

### Long-term (Optimization)
9. 📈 Train routing model with usage data
10. 📈 Optimize memory recall accuracy
11. 📈 Add custom swarm topologies
12. 📈 Integrate with @ruvector/tiny-dancer for circuit breaker

---

## 📝 Documentation Status

- ✅ CLI commands documented
- ✅ Integration opportunities identified
- ⚠️ Testing needed
- ⚠️ Integration guide needed
- ⚠️ Migration path from claude-flow hooks needed

---

**Related Documentation:**
- [RuVector Ecosystem](./README.md)
- [RUVLLM Integration](./RUVLLM_INTEGRATION.md)
- [Claude Code Configuration](../configuration/CLAUDE.md)

---

**Last Updated:** 2025-12-30
**Status:** 🔬 Discovery phase - Testing recommended
