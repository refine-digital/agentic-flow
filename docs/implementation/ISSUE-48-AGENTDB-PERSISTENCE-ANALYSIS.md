# Issue #48: AgentDB Persistence Problem - Root Cause Analysis

## Issue Summary

**Problem**: AgentDB runs as an MCP server and only stores the database temporarily in memory or in a temp directory. All data is lost each time Claude Code is restarted.

**Reported By**: User with `.mcp.json` configuration:
```json
"agentdb": {
  "command": "npx",
  "args": ["agentdb@latest", "mcp", "start"],
  "env": {
    "AGENTDB_PATH": "./agentdb/agentdb.db"
  }
}
```

**Additional Comment**: "According to the code in the whole mcp flow the save() is never called." - @stenebenau

## Root Cause Analysis

### 1. Database Implementation (sql.js WASM)

**File**: `/packages/agentdb/src/db-fallback.ts`

The database uses sql.js (WASM SQLite) which runs entirely in memory by default. The implementation DOES include a `save()` method:

```typescript
save() {
  // Save to file if needed
  if (this.filename !== ':memory:') {
    try {
      // Create parent directories if they don't exist
      const dir = path.dirname(this.filename);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = this.db.export();
      fs.writeFileSync(this.filename, Buffer.from(data));
    } catch (error) {
      console.error('❌ Could not save database to file:', (error as Error).message);
      throw error;
    }
  }
}
```

The `save()` method is called in two places:
1. **Line 234**: In the `close()` method (called on graceful shutdown)
2. **Line 216**: In the `close()` method before cleanup

### 2. MCP Server Shutdown Handler

**File**: `/packages/agentdb/src/mcp/agentdb-mcp-server.ts`

**Lines 2302-2309**:
```typescript
// Handle graceful shutdown
const shutdown = () => {
  clearInterval(keepAlive);
  process.exit(0);  // ❌ PROBLEM: No db.close() or db.save() called!
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

**THE ROOT CAUSE**: The shutdown handler clears the keepAlive interval and exits the process, but **NEVER calls `db.close()` or `db.save()`**. This means:

1. The database remains in memory only
2. When Claude Code restarts, the MCP server process is killed
3. The SIGINT/SIGTERM handlers trigger `process.exit(0)` immediately
4. **No persistence occurs** - all data is lost

### 3. Database Path Configuration

**Line 226** in `agentdb-mcp-server.ts`:
```typescript
const dbPath = process.env.AGENTDB_PATH || './agentdb.db';
const db = await createDatabase(dbPath);
```

The path IS correctly read from the environment variable, but persistence never happens because:
- `db.save()` is only called in `db.close()`
- `db.close()` is NEVER called during shutdown
- Data stays in sql.js memory buffer and is lost on process exit

### 4. No Periodic Persistence

There is NO interval-based auto-save mechanism. The database is only saved when:
1. `db.close()` is explicitly called (which never happens)
2. Manual `db.save()` is called (which never happens in the MCP server)

## Why the Environment Variable Doesn't Work

The user correctly set `AGENTDB_PATH`:
```json
"env": {
  "AGENTDB_PATH": "./agentdb/agentdb.db"
}
```

However, this ONLY tells sql.js WHERE to save - it doesn't make it actually save. The path is used:
1. To LOAD existing data on startup (if file exists)
2. To SAVE data when `db.close()` is called

Since `db.close()` is never called, the save never happens despite the correct path.

## Proposed Solutions

### Solution 1: Add Database Persistence to Shutdown Handler (RECOMMENDED)

**Modify** `agentdb-mcp-server.ts` shutdown handler:

```typescript
// Handle graceful shutdown
const shutdown = async () => {
  try {
    console.error('🔄 Saving database before shutdown...');
    await db.save(); // Explicitly save the database
    console.error('✅ Database saved successfully');
  } catch (error) {
    console.error('❌ Error saving database:', error);
  } finally {
    clearInterval(keepAlive);
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Also handle uncaughtException and unhandledRejection
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  shutdown();
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  shutdown();
});
```

### Solution 2: Add Periodic Auto-Save

Add an interval to periodically save the database:

```typescript
// Auto-save every 5 minutes
const autoSaveInterval = setInterval(() => {
  try {
    db.save();
    console.error('💾 Auto-saved database');
  } catch (error) {
    console.error('❌ Auto-save failed:', error);
  }
}, 5 * 60 * 1000); // 5 minutes

// Clean up in shutdown
const shutdown = async () => {
  clearInterval(autoSaveInterval);
  clearInterval(keepAlive);
  try {
    await db.save();
    console.error('✅ Database saved on shutdown');
  } catch (error) {
    console.error('❌ Error saving database:', error);
  }
  process.exit(0);
};
```

### Solution 3: Save After Each Tool Call

Add a save call after each MCP tool operation:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // ... existing tool handling logic ...

    // Save database after any modifying operation
    if (['agentdb_reflexion_store', 'agentdb_skill_store', 'agentdb_causal_add',
         'agentdb_pattern_store', 'agentdb_learning_submit'].includes(name)) {
      await db.save();
      console.error(`💾 Database persisted after ${name}`);
    }

    return result;
  } catch (error) {
    // ... error handling ...
  }
});
```

## Recommended Fix Priority

1. **CRITICAL**: Solution 1 - Add `db.save()` to shutdown handler
2. **HIGH**: Solution 2 - Add periodic auto-save (every 5 minutes)
3. **OPTIONAL**: Solution 3 - Save after each operation (performance trade-off)

## Implementation Steps

1. Update `agentdb-mcp-server.ts` shutdown handler
2. Add periodic auto-save with configurable interval
3. Add proper error handling for save operations
4. Test with Claude Code restart scenarios
5. Document the persistence behavior in README

## Testing Verification

After fix, verify:
1. ✅ Database file is created at `AGENTDB_PATH` location
2. ✅ Data persists after Claude Code restart
3. ✅ Data persists after process kill (SIGINT/SIGTERM)
4. ✅ Periodic auto-save works (check timestamps)
5. ✅ Shutdown logs show "Database saved successfully"

## Related Files

- `/packages/agentdb/src/mcp/agentdb-mcp-server.ts:2302-2309` - Shutdown handler (FIX NEEDED)
- `/packages/agentdb/src/db-fallback.ts:197-214` - save() method (WORKS CORRECTLY)
- `/packages/agentdb/src/db-fallback.ts:216-236` - close() method (NEVER CALLED)

## Conclusion

The persistence mechanism EXISTS and works correctly - it's just NEVER TRIGGERED. The fix is straightforward: call `db.save()` in the shutdown handler and optionally add periodic auto-save for better reliability.

---

**Status**: Root cause identified ✅
**Fix Priority**: CRITICAL
**Estimated Fix Time**: 30 minutes
**Testing Time**: 15 minutes
**Total Resolution Time**: ~1 hour
