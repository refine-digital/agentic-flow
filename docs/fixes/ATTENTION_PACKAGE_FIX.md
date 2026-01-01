# @ruvector/attention - Auto-Install Fix

## Problem

Platform-specific binaries exist on npm but aren't included in `optionalDependencies`, so they don't auto-install for:
- macOS Apple Silicon (M1/M2/M3)
- ARM Linux

## Solution

Update `@ruvector/attention/package.json` to include all published platform binaries in `optionalDependencies`.

## Current package.json

```json
{
  "optionalDependencies": {
    "@ruvector/attention-win32-x64-msvc": "0.1.2",
    "@ruvector/attention-darwin-x64": "0.1.2",
    "@ruvector/attention-linux-x64-gnu": "0.1.2"
  }
}
```

## Recommended package.json

```json
{
  "optionalDependencies": {
    "@ruvector/attention-win32-x64-msvc": "0.1.2",
    "@ruvector/attention-darwin-x64": "0.1.2",
    "@ruvector/attention-darwin-arm64": "0.1.1",
    "@ruvector/attention-linux-x64-gnu": "0.1.2",
    "@ruvector/attention-linux-arm64-gnu": "0.1.1"
  }
}
```

## Verified Packages on npm

| Package | Version | Status | Platform |
|---------|---------|--------|----------|
| `@ruvector/attention-win32-x64-msvc` | 0.1.2 | ✅ Listed | Windows x64 |
| `@ruvector/attention-darwin-x64` | 0.1.2 | ✅ Listed | macOS Intel |
| `@ruvector/attention-darwin-arm64` | 0.1.1 | ✅ EXISTS | macOS Apple Silicon |
| `@ruvector/attention-linux-x64-gnu` | 0.1.2 | ✅ Listed | Linux x64 glibc |
| `@ruvector/attention-linux-arm64-gnu` | 0.1.1 | ✅ EXISTS | ARM Linux |
| `@ruvector/attention-linux-x64-musl` | - | ❌ NOT FOUND | Alpine Linux |
| `@ruvector/attention-win32-arm64-msvc` | ? | ❓ Unknown | Windows ARM |

## Steps to Implement

### 1. Update package.json in @ruvector/attention

```bash
cd /path/to/ruvector/crates/ruvector-attention-node
```

Edit `package.json`:

```diff
  "optionalDependencies": {
    "@ruvector/attention-win32-x64-msvc": "0.1.2",
    "@ruvector/attention-darwin-x64": "0.1.2",
+   "@ruvector/attention-darwin-arm64": "0.1.1",
    "@ruvector/attention-linux-x64-gnu": "0.1.2"
+   "@ruvector/attention-linux-arm64-gnu": "0.1.1"
  }
```

### 2. Bump version and publish

```bash
npm version patch  # 0.1.2 -> 0.1.3
npm publish
```

### 3. Update agentic-flow and agentdb

```bash
npm install @ruvector/attention@latest
```

## What This Achieves

✅ **Automatic installation for:**
- Windows x64
- macOS Intel
- **macOS Apple Silicon** (NEW)
- Linux x64 glibc
- **ARM Linux** (NEW)

⚠️ **Still manual for:**
- Alpine Linux (musl) - binary doesn't exist on npm yet
- Windows ARM - unknown if published

## Version Mismatch Note

The darwin-arm64 and linux-arm64-gnu packages are on version 0.1.1 while the main package is on 0.1.2. This is okay because:
1. npm optionalDependencies allow version ranges
2. The native bindings are compatible
3. They'll auto-update when you rebuild and publish

## Alternative: Use Version Ranges

For forward compatibility:

```json
{
  "optionalDependencies": {
    "@ruvector/attention-win32-x64-msvc": "^0.1.2",
    "@ruvector/attention-darwin-x64": "^0.1.2",
    "@ruvector/attention-darwin-arm64": "^0.1.1",
    "@ruvector/attention-linux-x64-gnu": "^0.1.2",
    "@ruvector/attention-linux-arm64-gnu": "^0.1.1"
  }
}
```

This allows npm to pick up patch updates automatically.

## Missing Binaries

If you want to support Alpine Linux (musl):

```bash
# Build for musl target
napi build --platform --target x86_64-unknown-linux-musl --release

# Publish
npm publish ./npm/linux-x64-musl
```

Then add to optionalDependencies:
```json
"@ruvector/attention-linux-x64-musl": "0.1.3"
```

## Testing

After publishing the updated package:

```bash
# macOS Apple Silicon
npm install @ruvector/attention@latest
node -e "console.log(require('@ruvector/attention').MultiHeadAttention)"

# ARM Linux
npm install @ruvector/attention@latest
node -e "console.log(require('@ruvector/attention').MultiHeadAttention)"
```

Both should load native bindings automatically without manual installation.

---

**Summary**: Just add 2 lines to package.json, bump version, and publish. No rebuilding needed!
