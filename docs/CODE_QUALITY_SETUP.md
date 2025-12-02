# Code Quality Setup Guide

This document describes the comprehensive code quality infrastructure for Agentic-Flow v2.0.0-alpha.

## Overview

Agentic-Flow employs a multi-layered code quality strategy:

1. **Static Analysis** - ESLint with strict TypeScript rules
2. **Code Formatting** - Prettier for consistent style
3. **Type Safety** - TypeScript strict mode
4. **Git Hooks** - Husky for pre-commit quality checks
5. **CI/CD** - Automated quality gates
6. **Testing** - Jest with coverage requirements

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will automatically:
- Install all dev dependencies (ESLint, Prettier, Husky, etc.)
- Set up Husky Git hooks via the `prepare` script

### 2. Verify Installation

```bash
# Check if hooks are installed
ls -la .husky/

# You should see:
# - pre-commit
# - commit-msg
# - pre-push
```

## Tools Configuration

### ESLint

**Configuration:** `config/.eslintrc.strict.js`

Strict linting rules for TypeScript:
- Explicit function return types required
- No `any` type allowed
- Async/await best practices enforced
- Complexity limits (max 15)
- Function size limits (max 150 lines)
- Parameter limits (max 5)

**Usage:**

```bash
# Lint all files
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Generate JSON report
npm run lint:report
```

### Prettier

**Configuration:** `config/.prettierrc.js`

Formatting rules:
- 2 space indentation
- Single quotes
- 100 character line width
- Trailing commas (ES5)
- Semicolons required

**Usage:**

```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check
```

### TypeScript

**Configurations:**
- Standard: `agentic-flow/config/tsconfig.json`
- Strict: `agentic-flow/config/tsconfig.strict.json`

Strict mode enables:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noImplicitReturns: true`

**Usage:**

```bash
# Standard type checking
npm run typecheck

# Strict type checking
npm run typecheck:strict
```

### Jest

**Configuration:** `config/jest.config.js`

Test coverage requirements:
- 80% minimum coverage for all metrics
- Separate unit and integration tests
- Coverage reports in multiple formats

**Usage:**

```bash
# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Check coverage threshold
npm run coverage:check
```

### Husky Git Hooks

**Configuration:** Scripts in `.husky/` directory

#### Pre-commit Hook

Runs on every commit:
1. Lint-staged (ESLint + Prettier on staged files)
2. TypeScript type checking
3. Auto-fix formatting issues

#### Commit-msg Hook

Validates commit messages:
- Enforces Conventional Commits format
- Checks for breaking change indicators
- Provides helpful error messages

Examples:
```bash
# Valid
git commit -m "feat(agent): Add Byzantine consensus"
git commit -m "fix(memory): Resolve memory leak"

# Invalid
git commit -m "fixed bug"  # Missing type/scope format
git commit -m "WIP"        # Not descriptive enough
```

#### Pre-push Hook

Runs before pushing to remote:
1. All tests must pass
2. Type checking must succeed
3. Build must complete

**Setup:**

```bash
# Run setup script manually
bash scripts/setup-husky.sh

# Or install via npm
npm run prepare
```

### Lint-staged

**Configuration:** `config/lint-staged.config.js`

Runs quality checks only on staged files:
- TypeScript files: ESLint + Prettier + Type check
- JavaScript files: ESLint + Prettier
- JSON files: Prettier
- Markdown files: Prettier

## CI/CD Integration

### GitHub Actions Workflow

**File:** `config/.github/workflows/code-quality.yml`

Move this file to `.github/workflows/` to activate:

```bash
mkdir -p .github/workflows
cp config/.github/workflows/code-quality.yml .github/workflows/
```

The workflow runs:
1. **Lint Job** - ESLint on multiple Node versions
2. **TypeCheck Job** - Standard and strict mode
3. **Security Job** - npm audit
4. **Complexity Job** - Code complexity analysis
5. **Test Job** - Tests with coverage
6. **Quality Gate** - All checks must pass

### Triggering Conditions

- Push to main, develop, or feature/fix branches
- Pull requests to main or develop
- Manual trigger via workflow_dispatch

## EditorConfig

**File:** `config/.editorconfig`

Ensures consistent editor settings:
- UTF-8 encoding
- LF line endings
- 2 space indentation
- Trim trailing whitespace

**Copy to root:**

```bash
cp config/.editorconfig .editorconfig
```

**VS Code Integration:**

Install the EditorConfig extension:
```bash
code --install-extension EditorConfig.EditorConfig
```

## Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Make changes
# ... edit code ...

# 4. Run quality checks before committing
npm run quality:check

# 5. Fix any issues
npm run quality:fix

# 6. Commit (pre-commit hook runs automatically)
git add .
git commit -m "feat(scope): Your feature description"

# 7. Push (pre-push hook runs automatically)
git push origin feature/your-feature
```

### Before Pull Request

```bash
# Full quality check
npm run quality:check

# This runs:
# - ESLint strict mode
# - Prettier format check
# - TypeScript strict type checking
# - Tests with coverage (80% minimum)
```

### Quick Fixes

```bash
# Auto-fix common issues
npm run quality:fix

# This runs:
# - ESLint --fix
# - Prettier --write
```

## Quality Metrics

### Code Coverage

Target: 80% minimum for all metrics

Check coverage:
```bash
npm run test:coverage
```

View detailed report:
```bash
open coverage/lcov-report/index.html
```

### Code Complexity

Maximum cyclomatic complexity: 15

Check complexity:
```bash
npm run complexity
```

View report:
```bash
cat complexity-report.json
```

### Type Safety

All code must pass strict TypeScript checks:
```bash
npm run typecheck:strict
```

## Troubleshooting

### Husky hooks not running

```bash
# Reinstall hooks
rm -rf .husky
npm run prepare
```

### ESLint errors on valid code

Check if you're using the strict config:
```bash
npm run lint -- --config config/.eslintrc.strict.js
```

### Tests failing only in CI

Ensure your local environment matches CI:
```bash
# Use same Node version as CI
nvm use 20

# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

### Type errors in strict mode

Strict mode is more rigorous. Common fixes:
1. Add explicit return types
2. Handle null/undefined cases
3. Remove `any` types
4. Add type guards

## Best Practices

### Writing Quality Code

1. **Keep functions small** (< 150 lines)
2. **Limit complexity** (< 15 cyclomatic)
3. **Explicit types** (no `any`)
4. **Handle errors** (try-catch for async)
5. **Write tests** (80% coverage)
6. **Document complex logic** (JSDoc for public APIs)

### Code Review

Use the checklist:
- `docs/CODE_REVIEW_CHECKLIST.md`

### Quality Reports

Use the template:
- `docs/CODE_QUALITY_REPORT_TEMPLATE.md`

## Integration with Editors

### VS Code

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.options": {
    "configFile": "config/.eslintrc.strict.js"
  },
  "prettier.configPath": "config/.prettierrc.js",
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.ts": "typescript"
  }
}
```

### WebStorm/IntelliJ

1. Preferences → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Enable ESLint
   - Configuration file: `config/.eslintrc.strict.js`

2. Preferences → Languages & Frameworks → JavaScript → Prettier
   - Enable Prettier
   - Configuration file: `config/.prettierrc.js`

## Continuous Improvement

### Monthly Tasks

- [ ] Review and update ESLint rules
- [ ] Check for new Prettier options
- [ ] Update TypeScript version
- [ ] Review security audit results
- [ ] Analyze complexity trends

### Quarterly Tasks

- [ ] Increase coverage target (if at 80%)
- [ ] Review and reduce complexity limits
- [ ] Update dependencies
- [ ] Audit technical debt

## Resources

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Support

For questions or issues with code quality setup:
1. Check this documentation
2. Review `docs/CONTRIBUTING.md`
3. Create an issue with the `code-quality` tag
