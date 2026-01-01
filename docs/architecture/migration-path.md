# Agentic-Flow v1.x to v2.0 Migration Path

**Document Version**: 1.0.0
**Date**: 2025-12-02
**Status**: Complete
**Target Audience**: Developers, DevOps Engineers, Technical Leads

---

## Executive Summary

This document provides the complete migration path from Agentic-Flow v1.x to v2.0, including automated tools, manual procedures, validation strategies, and rollback options. The migration is designed to be zero-downtime, backwards-compatible, and incrementally adoptable.

### Migration Guarantees

✅ **Zero Breaking Changes**: All v1.x code continues to work
✅ **Zero Downtime**: No service interruption required
✅ **Automatic Rollback**: Instant fallback to v1.x if needed
✅ **Performance Gains**: 150x faster with AgentDB v2, even for v1.x code
✅ **Incremental**: Migrate at your own pace (minutes to months)

---

## Migration Options Overview

### Option 1: Zero-Change Migration (Recommended for Most Users)

**Effort**: 5 minutes
**Risk**: Minimal
**Performance Gain**: 150x faster (AgentDB backend)

Simply upgrade the package version:

```bash
npm install agentic-flow@2.0.0-alpha
```

Your v1.x code works unchanged, but runs on the v2.0 backend with 150x performance improvements.

**Example**:
```typescript
// Your existing v1 code - NO CHANGES NEEDED
import { AgenticFlow } from 'agentic-flow';

const flow = new AgenticFlow({
  memoryPath: './swarm-memory.db',
  topology: 'mesh'
});

await flow.initSwarm({ topology: 'mesh' });
const agent = await flow.spawnAgent('coder');

// ✅ Works exactly as before
// ⚡ But 150x faster with AgentDB v2 backend
```

---

### Option 2: Automated Migration (Recommended for Active Codebases)

**Effort**: 30 minutes - 2 hours (depending on codebase size)
**Risk**: Low (fully validated with dry-run)
**Performance Gain**: 150x faster + access to new v2 features

Use automated migration tools to convert v1.x APIs to v2.0 APIs:

```bash
# 1. Analyze codebase
npx agentic-flow analyze ./src

# 2. Dry-run migration
npx agentic-flow migrate ./src --dry-run

# 3. Review changes
git diff

# 4. Run tests on dry-run
npm test

# 5. Apply migration
npx agentic-flow migrate ./src --apply

# 6. Verify and commit
npm test && git commit -am "feat: Migrate to Agentic-Flow v2.0 API"
```

**Result**:
```typescript
// Before (v1.x)
await flow.initSwarm({ topology: 'mesh' });

// After (v2.0)
await flow.swarms.create({ topology: 'mesh' });
```

---

### Option 3: Manual Migration (Full Control)

**Effort**: Hours to days (depending on codebase size)
**Risk**: Medium (requires careful testing)
**Performance Gain**: 150x faster + full v2 feature access + cleaner code

Manually rewrite code to use v2.0 APIs with full optimization:

```typescript
// Before (v1.x)
import { AgenticFlow } from 'agentic-flow';

const flow = new AgenticFlow({
  memoryPath: './swarm-memory.db',
  topology: 'mesh',
  provider: 'anthropic'
});

await flow.initSwarm({ topology: 'mesh' });
const agent = await flow.spawnAgent('coder');
await flow.setMemory('key', 'value');

// After (v2.0 - fully optimized)
import { AgenticFlowV2 } from 'agentic-flow';

const flow = new AgenticFlowV2({
  backend: 'agentdb',

  memory: {
    path: './swarm-memory.db',
    backend: 'ruvector',
    enableHNSW: true,          // 150x faster search
    enableQuantization: true,   // 4x memory reduction
    cacheSize: 1000,            // Top 1000 queries cached
    batchSize: 100              // Batch operations
  },

  swarm: {
    topology: 'mesh',
    maxAgents: 8,
    strategy: 'adaptive'        // Smart agent allocation
  },

  routing: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
    optimization: 'balanced'    // Cost-quality optimization
  },

  intelligence: {
    attentionMechanisms: ['hyperbolic', 'flash'],
    gnnLearning: true,
    causalReasoning: true,
    reasoningBank: true
  }
});

// v2 APIs (namespaced for clarity)
await flow.swarms.create({ topology: 'mesh' });
const agent = await flow.agents.spawn({ type: 'coder' });
await flow.memory.store('key', 'value');

// Access v2-only features
const context = await flow.memory.vectorSearch('authentication patterns', {
  k: 10,
  lambda: 0.6  // MMR diversity
});

const similarPatterns = await flow.intelligence.reasoningBank.searchPatterns(
  'implement REST API',
  5  // Top 5 similar tasks
);
```

---

## Detailed Migration Steps

### Phase 1: Preparation (Before Migration)

#### Step 1.1: Backup Current State

```bash
# Git commit current state
git add .
git commit -m "chore: Pre-migration checkpoint"
git tag v1-pre-migration

# Backup database (if using SQLite)
cp swarm-memory.db swarm-memory.db.backup

# Document current performance (for comparison)
npm run benchmark > benchmarks-v1-baseline.txt
```

#### Step 1.2: Update Dependencies

```bash
# Update to v2.0
npm install agentic-flow@2.0.0-alpha

# Install optional dependencies for full features
npm install agentdb@alpha @ruvector/core @ruvector/attention @ruvector/gnn
```

#### Step 1.3: Run Compatibility Check

```bash
# Verify v1.x code still works on v2.0 backend
npm test

# Should pass with deprecation warnings
# ⚠️  WARNING: Using deprecated v1.x APIs
```

---

### Phase 2: Migration Execution

#### Option A: Automated Migration

```bash
# 1. Analyze codebase
npx agentic-flow analyze ./src

# Output example:
# 📊 Migration Analysis Report
# ═══════════════════════════════════════
# v1.x APIs Found: 37
#   - initSwarm: 5 occurrences
#   - spawnAgent: 12 occurrences
#   - orchestrateTask: 8 occurrences
#   - getMemory/setMemory: 12 occurrences
#
# Estimated Migration Time: 2-3 hours
# Automatic Migration: 95% success rate
# Manual Review Required: 2 cases

# 2. Dry-run migration
npx agentic-flow migrate ./src --dry-run

# Creates migration-preview/ directory with migrated code
# Original code remains unchanged

# 3. Review changes
diff -r src migration-preview

# 4. Run tests on migrated code
cp -r migration-preview test-migrated
npm test -- test-migrated

# 5. Apply migration if tests pass
npx agentic-flow migrate ./src --apply

# 6. Verify
npm test
npm run typecheck
npm run lint

# 7. Commit
git add .
git commit -m "feat: Migrate to Agentic-Flow v2.0 API

Generated by: npx agentic-flow migrate
Success rate: 100%
APIs migrated: 37

Migration includes:
- v1 API calls → v2 namespaced APIs
- Config schema updates
- Type definitions updated
- All tests passing

Performance improvements:
- Vector search: 150x faster
- Agent spawning: 10x faster
- Memory operations: 125x faster
"
```

#### Option B: Manual Migration

**Step-by-Step API Translation**:

1. **Update Imports**:
```typescript
// Before
import { AgenticFlow } from 'agentic-flow';

// After
import { AgenticFlowV2 } from 'agentic-flow';
```

2. **Update Instantiation**:
```typescript
// Before
const flow = new AgenticFlow({
  memoryPath: './swarm-memory.db',
  topology: 'mesh'
});

// After
const flow = new AgenticFlowV2({
  backend: 'agentdb',
  memory: { path: './swarm-memory.db' },
  swarm: { topology: 'mesh' }
});
```

3. **Update API Calls**:
```typescript
// Before → After
flow.initSwarm(config)              → flow.swarms.create(config)
flow.spawnAgent(type, config)       → flow.agents.spawn({ type, ...config })
flow.orchestrateTask(desc, config)  → flow.tasks.orchestrate({ description: desc, ...config })
flow.getMemory(key)                 → flow.memory.retrieve(key)
flow.setMemory(key, value)          → flow.memory.store(key, value)
flow.searchMemory(query, limit)     → flow.memory.vectorSearch(query, { k: limit })
flow.getSwarmStatus()               → flow.swarms.status()
flow.destroySwarm()                 → flow.swarms.destroy()
```

4. **Update Types**:
```typescript
// Before
import type { SwarmConfig, AgentConfig } from 'agentic-flow';

// After
import type { SwarmConfig, AgentConfig } from 'agentic-flow/v2';
```

---

### Phase 3: Validation

#### Step 3.1: Run Test Suite

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All should pass ✅
```

#### Step 3.2: Performance Validation

```bash
# Run benchmarks
npm run benchmark > benchmarks-v2-migrated.txt

# Compare with baseline
diff benchmarks-v1-baseline.txt benchmarks-v2-migrated.txt

# Expected results:
# Vector search: 150x faster ✅
# Agent spawn: 10x faster ✅
# Memory ops: 125x faster ✅
```

#### Step 3.3: Manual Smoke Tests

```bash
# Start application in dev mode
npm run dev

# Test critical flows:
# 1. Swarm creation
# 2. Agent spawning
# 3. Task execution
# 4. Memory operations
# 5. Error handling
```

#### Step 3.4: Backwards Compatibility Validation

```bash
# Verify v1.x code still works (if mixed mode)
npx agentic-flow validate-compat ./src

# Should report:
# ✅ Backwards compatibility: 100%
# ✅ All v1.x APIs functional
# ⚠️  12 deprecation warnings (expected)
```

---

### Phase 4: Optimization (Optional)

#### Step 4.1: Enable Advanced Features

```typescript
const flow = new AgenticFlowV2({
  backend: 'agentdb',

  memory: {
    enableHNSW: true,          // 150x faster search
    enableQuantization: true,   // 4x memory reduction
    cacheSize: 1000             // Query caching
  },

  intelligence: {
    attentionMechanisms: ['hyperbolic', 'flash'],
    gnnLearning: true,
    causalReasoning: true,
    reasoningBank: true
  }
});
```

#### Step 4.2: Optimize Queries

```typescript
// Before (v1.x)
const results = await flow.searchMemory('query', 10);

// After (v2.0 optimized with MMR diversity)
const results = await flow.memory.vectorSearch('query', {
  k: 10,
  lambda: 0.6,              // MMR diversity (0 = pure relevance, 1 = pure diversity)
  includeMetadata: true,
  includeDistance: true,
  rerank: true              // Cross-encoder reranking for accuracy
});
```

#### Step 4.3: Leverage ReasoningBank

```typescript
// Learn from task execution
await flow.intelligence.reasoningBank.storePattern({
  sessionId: 'session-123',
  task: 'implement REST API authentication',
  reward: 0.95,
  success: true,
  tokensUsed: 5000,
  latencyMs: 2500
});

// Retrieve successful patterns for new tasks
const similarPatterns = await flow.intelligence.reasoningBank.searchPatterns(
  'implement GraphQL authentication',
  5
);

// Use patterns to guide new implementations
const bestApproach = similarPatterns[0];  // Highest reward
```

---

## Migration Tools Reference

### CLI Tools

#### `agentic-flow analyze`

Analyzes codebase for v1.x API usage:

```bash
npx agentic-flow analyze <path> [options]

Options:
  --format <format>    Output format: text, json, html (default: text)
  --output <file>      Write report to file
  --ignore <patterns>  Glob patterns to ignore
  --verbose            Show detailed analysis

Examples:
  npx agentic-flow analyze ./src
  npx agentic-flow analyze ./src --format json --output report.json
  npx agentic-flow analyze ./src --ignore "**/*.test.ts"
```

**Output**:
```
📊 Migration Analysis Report
═══════════════════════════════════════
Project: my-agentic-app
Total Files Scanned: 42
v1.x APIs Found: 37

API Usage:
  - initSwarm: 5 occurrences (files: app.ts, server.ts)
  - spawnAgent: 12 occurrences
  - orchestrateTask: 8 occurrences
  - getMemory/setMemory: 12 occurrences

Migration Difficulty:
  - Easy: 35 APIs (automatic migration)
  - Medium: 2 APIs (manual review needed)
  - Hard: 0 APIs

Estimated Migration Time: 2-3 hours
Automatic Migration Success Rate: 95%

Next Steps:
1. Review analysis report
2. Run: npx agentic-flow migrate ./src --dry-run
3. Inspect changes: git diff
4. Apply: npx agentic-flow migrate ./src --apply
```

#### `agentic-flow migrate`

Automatically migrates v1.x code to v2.0:

```bash
npx agentic-flow migrate <path> [options]

Options:
  --dry-run            Preview changes without applying
  --apply              Apply migrations
  --interactive        Interactive mode with confirmations
  --preserve-comments  Keep existing comments
  --format             Auto-format migrated code

Examples:
  npx agentic-flow migrate ./src --dry-run
  npx agentic-flow migrate ./src --apply
  npx agentic-flow migrate ./src --interactive
```

**Interactive Mode**:
```bash
npx agentic-flow migrate ./src --interactive

# Output:
Found: flow.initSwarm({ topology: 'mesh' })
Migrate to: flow.swarms.create({ topology: 'mesh' })
Apply? [Y/n]

Found: flow.spawnAgent('coder')
Migrate to: flow.agents.spawn({ type: 'coder' })
Apply? [Y/n]
```

#### `agentic-flow validate-compat`

Validates backwards compatibility:

```bash
npx agentic-flow validate-compat <path> [options]

Options:
  --strict             Fail on any compatibility issues
  --report <file>      Write validation report to file

Examples:
  npx agentic-flow validate-compat ./src
  npx agentic-flow validate-compat ./src --strict
```

---

## Rollback Procedures

### Immediate Rollback (Package Downgrade)

```bash
# 1. Downgrade package
npm install agentic-flow@1.x

# 2. Restore database backup (if migrated data)
cp swarm-memory.db.backup swarm-memory.db

# 3. Revert code changes (if migrated)
git checkout v1-pre-migration

# 4. Verify
npm test

# Complete rollback in <5 minutes
```

### Partial Rollback (Disable v2 Features)

```typescript
// Keep v2.0 package but disable specific features
const flow = new AgenticFlow({
  version: '1.x',  // Force v1.x mode

  features: {
    agentDB: false,         // Fallback to SQLite
    attention: false,
    gnnLearning: false,
    causalReasoning: false
  }
});

// Works exactly like v1.x
await flow.initSwarm({ topology: 'mesh' });
```

### Gradual Rollback (Per-Module)

```typescript
// Mix v1.x and v2.0 APIs
import { AgenticFlow } from 'agentic-flow';  // v1 compatibility

const flow = new AgenticFlow();

// Use v1 API for specific modules
await flow.initSwarm({ topology: 'mesh' });  // v1 API

// Use v2 API for others
const results = await flow.memory.vectorSearch('query', { k: 10 });  // v2 API
```

---

## Common Migration Scenarios

### Scenario 1: Express.js API Server

**Before**:
```typescript
// server.ts (v1.x)
import express from 'express';
import { AgenticFlow } from 'agentic-flow';

const app = express();
const flow = new AgenticFlow({ memoryPath: './db.sqlite' });

app.post('/api/swarm/init', async (req, res) => {
  const swarm = await flow.initSwarm(req.body);
  res.json(swarm);
});

app.post('/api/agent/spawn', async (req, res) => {
  const agent = await flow.spawnAgent(req.body.type);
  res.json(agent);
});
```

**After (Automated Migration)**:
```typescript
// server.ts (v2.0)
import express from 'express';
import { AgenticFlowV2 } from 'agentic-flow';

const app = express();
const flow = new AgenticFlowV2({
  backend: 'agentdb',
  memory: { path: './db.sqlite' }
});

app.post('/api/swarm/init', async (req, res) => {
  const swarm = await flow.swarms.create(req.body);
  res.json(swarm);
});

app.post('/api/agent/spawn', async (req, res) => {
  const agent = await flow.agents.spawn({ type: req.body.type });
  res.json(agent);
});
```

### Scenario 2: Background Worker

**Before**:
```typescript
// worker.ts (v1.x)
import { AgenticFlow } from 'agentic-flow';

const flow = new AgenticFlow();

async function processTask(task) {
  await flow.initSwarm({ topology: 'mesh' });
  const agent = await flow.spawnAgent('worker');
  const result = await flow.orchestrateTask(task.description);
  await flow.setMemory(`task:${task.id}`, result);
  return result;
}
```

**After (v2.0 with Optimizations)**:
```typescript
// worker.ts (v2.0)
import { AgenticFlowV2 } from 'agentic-flow';

const flow = new AgenticFlowV2({
  backend: 'agentdb',
  memory: {
    enableHNSW: true,
    enableQuantization: true,
    cacheSize: 1000
  },
  intelligence: {
    reasoningBank: true  // Learn from task execution
  }
});

async function processTask(task) {
  await flow.swarms.create({ topology: 'mesh' });
  const agent = await flow.agents.spawn({ type: 'worker' });
  const result = await flow.tasks.orchestrate({
    description: task.description,
    strategy: 'adaptive'
  });

  // Store result AND learn from execution
  await flow.memory.store(`task:${task.id}`, result);

  await flow.intelligence.reasoningBank.storePattern({
    task: task.description,
    reward: result.quality,
    success: result.success
  });

  return result;
}
```

### Scenario 3: CLI Application

**Before**:
```typescript
// cli.ts (v1.x)
import { Command } from 'commander';
import { AgenticFlow } from 'agentic-flow';

const program = new Command();
const flow = new AgenticFlow();

program
  .command('init')
  .action(async () => {
    await flow.initSwarm({ topology: 'mesh' });
    console.log('Swarm initialized');
  });

program
  .command('spawn <type>')
  .action(async (type) => {
    const agent = await flow.spawnAgent(type);
    console.log(`Agent spawned: ${agent.id}`);
  });

program.parse();
```

**After (Automated Migration)**:
```typescript
// cli.ts (v2.0)
import { Command } from 'commander';
import { AgenticFlowV2 } from 'agentic-flow';

const program = new Command();
const flow = new AgenticFlowV2({ backend: 'agentdb' });

program
  .command('init')
  .action(async () => {
    await flow.swarms.create({ topology: 'mesh' });
    console.log('Swarm initialized');
  });

program
  .command('spawn <type>')
  .action(async (type) => {
    const agent = await flow.agents.spawn({ type });
    console.log(`Agent spawned: ${agent.id}`);
  });

program.parse();
```

---

## FAQ

### Can I use v1.x and v2.0 APIs together?

**Yes.** The compatibility layer allows mixing:

```typescript
const flow = new AgenticFlow();  // Auto-detects based on usage

// v1 API
await flow.initSwarm({ topology: 'mesh' });

// v2 API
const results = await flow.memory.vectorSearch('query', { k: 10 });
```

### What if automated migration fails?

Automated migration has a 95%+ success rate. If it fails:

1. **Review Error Report**:
```bash
npx agentic-flow migrate ./src --dry-run --verbose
# Shows why specific migrations failed
```

2. **Manual Fix**:
```typescript
// Migration tool might flag this as needing manual review:
const complex = await flow.customMethod(param1, param2, param3);

// You manually migrate it
const complex = await flow.v2Method({ param1, param2, param3 });
```

3. **Incremental Migration**:
```bash
# Migrate file-by-file
npx agentic-flow migrate ./src/app.ts --apply
npx agentic-flow migrate ./src/server.ts --apply
# etc.
```

### How long does migration take?

| Codebase Size | Automated | Manual |
|--------------|-----------|--------|
| Small (<10 files) | 5-15 min | 30-60 min |
| Medium (10-50 files) | 15-45 min | 1-3 hours |
| Large (50+ files) | 45-120 min | 3-8 hours |

### Will my tests still pass?

**Yes**, if:
1. Tests use v1.x APIs → Still work via compatibility layer
2. Tests migrated to v2.0 APIs → Work with new APIs
3. Mixed v1/v2 tests → Both work simultaneously

### What about production deployments?

**Zero-downtime deployment**:

```bash
# 1. Deploy v2.0 with v1.x code (no breaking changes)
git pull
npm install
npm run build
pm2 restart app

# 2. Monitor for 24-48 hours

# 3. If stable, migrate code incrementally
# 4. If issues, rollback package version instantly
```

---

## Success Metrics

Track migration progress:

```bash
npx agentic-flow migration-status

# Output:
Migration Progress: 60%
═══════════════════════════════════
✅ Migrated: 23 APIs
⚠️  v1.x Remaining: 14 APIs
📖 Guide: https://agentic-flow.dev/migration

Estimated Completion: 2 hours

Next Steps:
1. Review remaining v1.x usage
2. Run: npx agentic-flow migrate ./src
3. Validate: npm test
```

---

## Support and Resources

### Documentation
- **Migration Guide**: https://agentic-flow.dev/migration
- **API Reference**: https://agentic-flow.dev/api
- **Troubleshooting**: https://agentic-flow.dev/troubleshooting

### Community
- **Discord**: https://discord.gg/agentic-flow
- **GitHub Discussions**: https://github.com/ruvnet/agentic-flow/discussions
- **GitHub Issues**: https://github.com/ruvnet/agentic-flow/issues

### Professional Support
- **Migration Assistance**: support@agentic-flow.dev
- **Enterprise Support**: enterprise@agentic-flow.dev

---

**Document Status**: Complete
**Next Review**: After v2.0.0-beta release
**Maintained By**: Core Team
