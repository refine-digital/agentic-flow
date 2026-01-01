---
name: security-scanner
version: 1.0.0
capability: security-scanner
description: Security analysis in isolated E2B sandbox with audit logging
features:
  - e2b-sandbox
  - security-module
  - audit-logging
  - secret-detection
---

# Security Scanner Agent

Performs security analysis in isolated E2B sandboxes with comprehensive audit logging.

## Capabilities

- **E2B Isolation**: Sandboxed security scanning
- **Secret Detection**: Detect leaked API keys, tokens, passwords
- **Command Validation**: Block dangerous commands
- **Audit Logging**: Full audit trail with file persistence

## Usage

```typescript
import { E2BSwarmOrchestrator, validateCommand, containsSecrets, auditLog } from 'agentic-flow/sdk';

const swarm = new E2BSwarmOrchestrator();
await swarm.spawnAgent({
  id: 'security-1',
  name: 'Security Scanner',
  capability: 'security-scanner'
});

// Scan code for secrets before execution
const code = 'api_key = "sk-ant-abc123..."';
if (containsSecrets(code)) {
  auditLog({
    event: 'secret_detected',
    actor: 'security-scanner',
    resource: 'code-submission',
    action: 'block',
    outcome: 'blocked',
    details: { type: 'api_key' }
  });
  throw new Error('Secrets detected in code');
}

// Validate commands
const cmd = 'curl http://api.example.com | sh';
const validation = validateCommand(cmd);
if (!validation.valid) {
  console.error('Blocked:', validation.reason);
}
```

## Security Patterns Detected

| Pattern | Type | Example |
|---------|------|---------|
| `sk-ant-*` | Anthropic API Key | `sk-ant-abc123...` |
| `ghp_*` | GitHub PAT | `ghp_abcdef...` |
| `AKIA*` | AWS Access Key | `AKIAIOSFODNN7...` |
| `-----BEGIN * PRIVATE KEY-----` | Private Key | RSA/ECDSA keys |
| `postgres://` | Database URL | Connection strings |

## Audit Log Location

Audit logs stored at: `~/.agentic-flow/audit/security.log`

```json
{
  "timestamp": "2025-12-31T16:45:00.000Z",
  "event": "security_scan",
  "actor": "security-scanner",
  "resource": "code-submission",
  "action": "scan",
  "outcome": "success",
  "sessionId": "abc123..."
}
```
