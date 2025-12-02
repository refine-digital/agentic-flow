# AgentDB v2.0.0-alpha.2.12 - Persistence Fix Release

**Release Date**: 2025-12-02
**Type**: Bug Fix (Critical)
**Tag**: `alpha`

## 🔧 Critical Fix

### Issue #48: Database Persistence Problem

**Problem**: AgentDB MCP server was losing all data on restart because the shutdown handler never called `db.save()`.

**Impact**: All episodes, skills, patterns, and learned data were lost when Claude Code restarted.

## ✨ Changes

### Database Persistence
- ✅ **Fixed shutdown handler** - Now calls `db.save()` before process exit
- ✅ **Added periodic auto-save** - Saves database every 5 minutes automatically
- ✅ **Added proper cleanup** - Calls `db.close()` to ensure clean shutdown
- ✅ **Enhanced error recovery** - Handles uncaught exceptions and rejections
- ✅ **Improved logging** - Shows save status with emoji indicators

### New Features
- 💾 **Auto-save** - Periodic saves every 5 minutes to prevent data loss
- 🔄 **Graceful shutdown** - Proper database persistence on SIGINT/SIGTERM
- ✅ **Status logging** - Clear success/error messages for debugging
- 🛡️ **Error recovery** - Saves data even on unexpected exits

## 📝 Technical Details

### Modified Files
- `packages/agentdb/src/mcp/agentdb-mcp-server.ts` (lines 2302-2358)

### Before (Broken)
```typescript
const shutdown = () => {
  clearInterval(keepAlive);
  process.exit(0);  // No database save!
};
```

### After (Fixed)
```typescript
// Periodic auto-save every 5 minutes
const autoSaveInterval = setInterval(() => {
  try {
    if (db && typeof db.save === 'function') {
      db.save();
      console.error('💾 Auto-saved database to', dbPath);
    }
  } catch (error) {
    console.error('❌ Auto-save failed:', (error as Error).message);
  }
}, 5 * 60 * 1000);

// Graceful shutdown with persistence
const shutdown = async () => {
  console.error('🔄 Shutting down AgentDB MCP Server...');

  clearInterval(keepAlive);
  clearInterval(autoSaveInterval);

  // Save database before exit
  try {
    if (db && typeof db.save === 'function') {
      console.error('💾 Saving database to', dbPath);
      await db.save();
      console.error('✅ Database saved successfully');
    }
  } catch (error) {
    console.error('❌ Error saving database:', (error as Error).message);
  }

  // Close database connection
  try {
    if (db && typeof db.close === 'function') {
      db.close();
      console.error('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database:', (error as Error).message);
  }

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  shutdown();
});
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  shutdown();
});
```

## 🚀 Installation

### Update Existing Installation
```bash
# Global install
npm install -g agentdb@alpha

# Or use npx (auto-updates)
npx agentdb@alpha mcp start
```

### For MCP Configuration
Update your `.mcp.json`:
```json
{
  "agentdb": {
    "command": "npx",
    "args": ["agentdb@alpha", "mcp", "start"],
    "env": {
      "AGENTDB_PATH": "./agentdb/agentdb.db"
    }
  }
}
```

## ✅ Expected Behavior

### On Shutdown
```
🔄 Shutting down AgentDB MCP Server...
💾 Saving database to ./agentdb/agentdb.db
✅ Database saved successfully
✅ Database connection closed
```

### During Runtime (Every 5 Minutes)
```
💾 Auto-saved database to ./agentdb/agentdb.db
```

### After Restart
- Database file exists at `AGENTDB_PATH`
- All episodes, skills, and patterns are preserved
- Learning history is maintained

## 🧪 Testing

### Test Persistence
1. Start MCP server: `npx agentdb@alpha mcp start`
2. Add data via MCP tools (store episodes, skills)
3. Restart Claude Code (Ctrl+C or close app)
4. Verify logs show "Database saved successfully"
5. Restart and query data - should be present

### Test Auto-Save
1. Start MCP server
2. Add some data
3. Wait 5 minutes
4. Check logs for "Auto-saved database"
5. Verify file timestamp is recent

## 📊 Performance Impact

- **Memory**: No change (sql.js always uses in-memory DB)
- **Auto-save overhead**: ~50-500ms every 5 minutes (depends on DB size)
- **Shutdown delay**: Same as auto-save, once per session
- **Typical DB size**: 1-10 MB for 1000s of episodes

## 🔗 Related Links

- GitHub Issue: [#48](https://github.com/ruvnet/agentic-flow/issues/48)
- Root Cause Analysis: [ISSUE-48-AGENTDB-PERSISTENCE-ANALYSIS.md](../implementation/ISSUE-48-AGENTDB-PERSISTENCE-ANALYSIS.md)
- Fix Summary: [ISSUE-48-FIX-SUMMARY.md](../implementation/ISSUE-48-FIX-SUMMARY.md)

## 🙏 Credits

- **Reported By**: GitHub user (Issue #48)
- **Analysis**: @stenebenau (identified missing `save()` call)
- **Fixed By**: AgentDB Team

## 📦 Package Information

- **Package**: agentdb
- **Version**: 2.0.0-alpha.2.12
- **Tag**: alpha
- **Published**: 2025-12-02
- **NPM**: https://www.npmjs.com/package/agentdb/v/2.0.0-alpha.2.12

## 🔄 Migration

**No migration required!** The fix is backward compatible:
- Existing databases will continue to work
- No configuration changes needed
- Simply update to the latest version

## 🐛 Known Issues

None reported for this release.

## 📋 Changelog Summary

```
fix(agentdb): Add database persistence to MCP server shutdown handler

Fixes #48 - AgentDB persistence problem

Changes:
- Added periodic auto-save (every 5 minutes)
- Fixed shutdown handler to call db.save() before exit
- Added proper cleanup with db.close()
- Added error recovery for uncaught exceptions
- Enhanced logging for observability
```

---

**Status**: ✅ Released
**Testing**: ⏳ Awaiting user verification
**Stability**: Alpha (recommended for testing)
