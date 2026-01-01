# Security Test Execution Guide

## Quick Reference

**Total Test Coverage**: 170 test cases across 4 security components

## Test Suite Overview

### 1. Input Validator Tests
**File**: `/workspaces/agentic-flow/tests/security/input-validator.test.ts`
- **Test Cases**: 68
- **Focus**: XSS prevention, injection attacks, validation
- **Runtime**: ~500ms

### 2. Rate Limiter Tests
**File**: `/workspaces/agentic-flow/tests/security/rate-limiter.test.ts`
- **Test Cases**: 31
- **Focus**: Token bucket algorithm, abuse prevention
- **Runtime**: ~2000ms (includes async tests)

### 3. Auth Middleware Tests
**File**: `/workspaces/agentic-flow/tests/security/auth-middleware.test.ts`
- **Test Cases**: 39
- **Focus**: API keys, JWT tokens, RBAC
- **Runtime**: ~800ms

### 4. Audit Logger Tests
**File**: `/workspaces/agentic-flow/tests/security/audit-logger.test.ts`
- **Test Cases**: 32
- **Focus**: Event logging, querying, statistics
- **Runtime**: ~1200ms

## Running Tests

### All Security Tests
```bash
# Using npm
npm test tests/security

# With coverage
npm test tests/security -- --coverage

# Verbose output
npm test tests/security -- --verbose
```

### Individual Test Suites
```bash
# Input Validator
npm test tests/security/input-validator.test.ts

# Rate Limiter
npm test tests/security/rate-limiter.test.ts

# Auth Middleware
npm test tests/security/auth-middleware.test.ts

# Audit Logger
npm test tests/security/audit-logger.test.ts
```

### Watch Mode (Development)
```bash
npm test tests/security -- --watch
```

### Coverage Report
```bash
# Generate coverage
npm test tests/security -- --coverage

# Open HTML report
open coverage/lcov-report/index.html
```

## Test Categories

### 1. Security Attack Prevention (78 tests)

#### XSS Prevention (8 tests)
- Script tag injection
- JavaScript protocol
- Data URI attacks
- Event handler injection
- eval() attempts
- Function constructor
- Prototype pollution
- Path traversal

#### Injection Attacks (2 tests)
- SQL injection
- Control characters

#### Input Validation (68 tests)
- Task descriptions
- Agent names
- Confidence scores
- Timeouts
- String arrays
- Configuration objects
- HTML sanitization
- Email validation

### 2. Authentication & Authorization (39 tests)

#### API Key Tests (8 tests)
- Valid key validation
- Invalid key rejection
- Bearer prefix handling
- Missing key detection
- Multiple key support

#### JWT Token Tests (7 tests)
- Valid token parsing
- Expired token rejection
- Signature validation
- Tampered token detection
- Format validation

#### RBAC Tests (4 tests)
- Role requirements
- Permission checks
- Privilege escalation prevention
- Unauthorized access blocking

### 3. Rate Limiting (31 tests)

#### Normal Flow (13 tests)
- Request tracking
- Limit enforcement
- Window reset
- Block duration
- User isolation

#### Performance (2 tests)
- 1000+ users
- Rapid requests

#### Edge Cases (6 tests)
- Empty identifiers
- Different ID types
- Concurrent requests

### 4. Audit Logging (32 tests)

#### Event Management (12 tests)
- Event logging
- Timestamp handling
- Metadata support
- Query capabilities

#### Statistics (6 tests)
- Event counting
- Success/failure tracking
- Type aggregation

#### Performance (3 tests)
- 10,000 event handling
- Query performance
- Statistics generation

## Expected Test Results

### Success Criteria
✅ All 170 tests pass
✅ No security vulnerabilities detected
✅ Performance benchmarks met
✅ Coverage thresholds achieved

### Coverage Targets
- **Statements**: ≥90%
- **Branches**: ≥85%
- **Functions**: ≥90%
- **Lines**: ≥90%

## Performance Benchmarks

### Input Validator
- **Validation**: <1ms per operation
- **Throughput**: >10,000 validations/second

### Rate Limiter
- **Check**: <1ms per operation
- **1000 users**: <100ms
- **Cleanup**: Background, non-blocking

### Auth Middleware
- **API Key**: <1ms per validation
- **JWT**: <5ms per validation
- **1000 validations**: <100ms

### Audit Logger
- **Logging**: <1ms per event
- **10,000 events**: <1000ms
- **Query**: <10ms per query
- **Statistics**: <50ms

## Troubleshooting

### Module Resolution Errors
```bash
# Error: Cannot find module
# Fix: Update import paths
```

Solution:
```typescript
// Before
import { SecurityManager } from '../federation/SecurityManager.js';

// After
import { SecurityManager } from '../../agentic-flow/src/federation/SecurityManager.js';
```

### Test Runner Issues
```bash
# Error: describe is not defined
# Fix: Use proper test runner (Jest)
```

Solution:
```bash
# Install dependencies
npm install --save-dev jest @types/jest ts-jest

# Run with Jest
npx jest tests/security
```

### Timeout Issues
```bash
# Error: Test timeout exceeded
# Fix: Increase timeout for async tests
```

Solution:
```typescript
// In test file
describe('Rate Limiter', () => {
  test('should unblock after duration', async () => {
    // ... test code
  }, 10000); // 10 second timeout
});
```

## Test Data

### Sample API Keys
```typescript
const validApiKey = 'test-api-key-123';
const invalidApiKey = 'invalid-key';
```

### Sample JWT Tokens
```typescript
// Generated via SecurityManager
const token = await securityManager.createAgentToken({
  agentId: 'agent1',
  tenantId: 'tenant1',
  expiresAt: Date.now() + 60000,
});
```

### Attack Vectors Tested
```typescript
const xssAttempts = [
  '<script>alert("XSS")</script>',
  'javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  '<img onerror="alert(1)" src="x">',
  'eval("malicious code")',
  '__proto__.isAdmin = true',
  '../../etc/passwd',
  "'; DROP TABLE users; --",
];
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm ci

      - name: Run Security Tests
        run: npm test tests/security -- --coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: security

      - name: Check Coverage Thresholds
        run: |
          if [ $(jq '.total.lines.pct' coverage/coverage-summary.json) -lt 90 ]; then
            echo "Coverage below threshold"
            exit 1
          fi
```

### GitLab CI
```yaml
security-tests:
  stage: test
  script:
    - npm ci
    - npm test tests/security -- --coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

## Security Checklist

Before deployment, verify:
- [ ] All 170 tests pass
- [ ] Coverage ≥90% for all metrics
- [ ] No security warnings in dependencies
- [ ] Rate limiting configured correctly
- [ ] API keys rotated and secured
- [ ] JWT secret properly configured
- [ ] Audit logging enabled
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Security headers set

## Test Maintenance

### Adding New Tests
1. Create test file in `/tests/security/`
2. Follow existing naming convention: `*.test.ts`
3. Include test categories: positive, negative, edge cases, performance
4. Update this guide with new test counts

### Updating Existing Tests
1. Maintain backward compatibility
2. Update coverage targets if needed
3. Document breaking changes
4. Update test counts in documentation

## Resources

- [Jest Documentation](https://jestjs.io/)
- [TypeScript Testing Best Practices](https://typescript-eslint.io/docs/testing/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Security Test Coverage Report](./SECURITY_TEST_COVERAGE_REPORT.md)
