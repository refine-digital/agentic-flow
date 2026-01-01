# RuVector Hooks - Quick Reference Card

**Version:** ruvector@latest
**Purpose:** Self-learning intelligence hooks for Claude Code
**Documentation:** [Full Guide](./RUVECTOR_HOOKS_CLI.md)

---

## 🚀 Quick Start

```bash
# Initialize in project
npx ruvector hooks init

# Basic workflow
npx ruvector hooks session-start
npx ruvector hooks pre-edit src/file.ts
# ... make changes ...
npx ruvector hooks post-edit src/file.ts
npx ruvector hooks session-end
```

---

## 📋 Command Reference

### Setup & Info
```bash
npx ruvector hooks init [--force]      # Initialize hooks
npx ruvector hooks stats                # Show statistics
npx ruvector hooks help <command>       # Get help
```

### Session Management
```bash
npx ruvector hooks session-start        # Start session
npx ruvector hooks session-end          # End session + export metrics
```

### File Intelligence
```bash
npx ruvector hooks pre-edit <file>      # Before editing
npx ruvector hooks post-edit <file>     # After editing (learns)
```

### Command Intelligence
```bash
npx ruvector hooks pre-command <cmd>    # Before command
npx ruvector hooks post-command <cmd>   # After command (learns)
```

### Agent Routing
```bash
npx ruvector hooks route <task>         # Route to best agent
npx ruvector hooks route <task> --file <file>    # With file context
npx ruvector hooks swarm-recommend <type>        # Multi-agent suggestion
```

### Memory System
```bash
npx ruvector hooks remember <content>   # Store in memory
npx ruvector hooks recall <query>       # Search memory
npx ruvector hooks suggest-context      # Get relevant context
```

### Advanced Hooks
```bash
npx ruvector hooks pre-compact          # Before DB compaction
npx ruvector hooks async-agent          # Background agents
npx ruvector hooks lsp-diagnostic       # LSP integration
npx ruvector hooks track-notification   # System notifications
```

---

## 💡 Common Workflows

### Development Session
```bash
#!/bin/bash
# Intelligent dev session

npx ruvector hooks session-start

# Get context
npx ruvector hooks suggest-context

# Route task
AGENT=$(npx ruvector hooks route "implement user login")
echo "Using agent: $AGENT"

# Edit with intelligence
npx ruvector hooks pre-edit src/auth/login.ts
# ... code changes ...
npx ruvector hooks post-edit src/auth/login.ts

# Store knowledge
npx ruvector hooks remember "Login uses JWT with 24h expiry"

# End session
npx ruvector hooks stats
npx ruvector hooks session-end
```

### Multi-File Refactoring
```bash
#!/bin/bash
FILES=("src/api.ts" "src/auth.ts" "src/db.ts")

npx ruvector hooks session-start

for file in "${FILES[@]}"; do
  npx ruvector hooks pre-edit "$file"
  # ... refactor ...
  npx ruvector hooks post-edit "$file"
done

npx ruvector hooks session-end
```

### Agent Coordination
```bash
# Get swarm recommendation
npx ruvector hooks swarm-recommend "feature-implementation"

# Route subtasks
npx ruvector hooks route "design API" --file api.ts
npx ruvector hooks route "implement backend" --crate core
npx ruvector hooks route "write tests"
```

---

## 🔬 Example Outputs

### `stats` output
```
RuVector Intelligence Statistics
================================
Sessions: 42
Files edited: 156
Commands executed: 1,203
Memory entries: 89
Agent routings: 312
Average routing accuracy: 87%
Learning rate: 0.023
```

### `route` output
```bash
$ npx ruvector hooks route "implement REST API"
> backend-dev

$ npx ruvector hooks route "review security" --file auth.ts
> reviewer
```

### `recall` output
```bash
$ npx ruvector hooks recall "authentication"
> User authentication uses JWT tokens with 24h expiry
> Auth middleware checks token on protected routes
```

---

## ⚙️ Integration Examples

### Git Hook Integration
```bash
# .git/hooks/post-commit
#!/bin/bash
npx ruvector hooks post-command git commit -m "$@"
```

### VSCode Task Integration
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Smart Build",
      "type": "shell",
      "command": "npx ruvector hooks pre-command npm run build && npm run build && npx ruvector hooks post-command npm run build"
    }
  ]
}
```

### CI/CD Integration
```yaml
# .github/workflows/build.yml
- name: Intelligent Build
  run: |
    npx ruvector hooks session-start
    npx ruvector hooks pre-command npm test
    npm test
    npx ruvector hooks post-command npm test
    npx ruvector hooks session-end
```

---

## 🎯 Best Practices

1. **Always start/end sessions**
   ```bash
   npx ruvector hooks session-start
   # ... work ...
   npx ruvector hooks session-end
   ```

2. **Wrap file edits with pre/post hooks**
   ```bash
   npx ruvector hooks pre-edit file.ts
   # ... edit ...
   npx ruvector hooks post-edit file.ts
   ```

3. **Store important decisions**
   ```bash
   npx ruvector hooks remember "Why: Chose PostgreSQL for ACID guarantees"
   ```

4. **Use route for agent selection**
   ```bash
   AGENT=$(npx ruvector hooks route "$TASK")
   # Use $AGENT in workflow
   ```

5. **Check stats regularly**
   ```bash
   npx ruvector hooks stats
   ```

---

## 🔗 Related Documentation

- [Full Hooks Guide](./RUVECTOR_HOOKS_CLI.md) - Complete documentation
- [RuVector Ecosystem](./README.md) - All packages
- [Integration Guide](./FINAL_RUVECTOR_ECOSYSTEM_COMPLETE.md) - Phase 1-4

---

## 🆘 Troubleshooting

**Hooks not working?**
```bash
npx ruvector hooks init --force  # Re-initialize
```

**No routing suggestions?**
```bash
npx ruvector hooks stats  # Check if learning
# May need more training data
```

**Memory not persisting?**
```bash
# Check database location
ls -la .ruvector/
# Should contain vector database
```

---

**Quick Reference Version:** 1.0
**Last Updated:** 2025-12-30
**Source:** `npx ruvector@latest hooks --help`
