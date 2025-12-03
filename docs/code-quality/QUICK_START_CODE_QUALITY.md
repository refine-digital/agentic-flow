# Quick Start: Code Quality

Get up and running with Agentic-Flow's code quality tools in 5 minutes.

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

This automatically sets up:
- ESLint with strict TypeScript rules
- Prettier for code formatting
- Husky Git hooks
- Jest for testing
- All necessary dev dependencies

## Step 2: Verify Setup (30 seconds)

```bash
# Check if Git hooks are installed
ls -la .husky/

# Expected output:
# pre-commit   - Runs linting and formatting
# commit-msg   - Validates commit messages
# pre-push     - Runs tests and type checking
```

## Step 3: Run Quality Checks (1 minute)

```bash
# Full quality check (runs all checks)
npm run quality:check

# Or run individual checks:
npm run lint              # ESLint
npm run format:check      # Prettier
npm run typecheck:strict  # TypeScript strict mode
npm run test:coverage     # Tests with coverage
```

## Step 4: Make Your First Commit (2 minutes)

```bash
# 1. Create a feature branch
git checkout -b feature/my-feature

# 2. Make some changes
echo "console.log('Hello World');" > test-file.js

# 3. Stage changes
git add test-file.js

# 4. Commit (hooks run automatically)
git commit -m "feat(core): Add test file"

# The pre-commit hook will:
# ✓ Run ESLint and auto-fix issues
# ✓ Format code with Prettier
# ✓ Check TypeScript types

# 5. Push (hooks run automatically)
git push origin feature/my-feature

# The pre-push hook will:
# ✓ Run all tests
# ✓ Check type safety
```

## Common Commands

### Development

```bash
# Fix linting issues automatically
npm run lint:fix

# Format all files
npm run format

# Auto-fix most issues
npm run quality:fix
```

### Testing

```bash
# Run tests with coverage
npm run test:coverage

# Watch mode for TDD
npm run test:watch
```

### Type Checking

```bash
# Standard mode
npm run typecheck

# Strict mode (recommended)
npm run typecheck:strict
```

## Expected Results

### Successful Commit

```bash
$ git commit -m "feat(agent): Add new feature"
🔍 Running pre-commit checks...
✓ ESLint passed
✓ Prettier formatted
✓ TypeScript types valid
✅ Pre-commit checks passed!
[feature/my-feature abc1234] feat(agent): Add new feature
```

### Failed Commit (Example)

```bash
$ git commit -m "fix something"
🔍 Validating commit message...
❌ Invalid commit message format!

Commit message must follow Conventional Commits specification:
  <type>(<scope>): <subject>

Examples:
  feat(agent): Add Byzantine consensus coordination
  fix(memory): Resolve memory leak in session manager

Your commit message:
  fix something
```

## Configuration Files

All configuration files are in the `config/` directory:

```
config/
├── .eslintrc.strict.js      # ESLint rules
├── .prettierrc.js           # Prettier formatting
├── .prettierignore          # Files to skip formatting
├── .editorconfig            # Editor settings
├── jest.config.js           # Test configuration
├── lint-staged.config.js    # Pre-commit hook config
└── tsconfig.strict.json     # Strict TypeScript config
```

## Quality Standards

Your code must meet these standards:

- ✅ **ESLint**: No errors or warnings
- ✅ **Prettier**: Consistent formatting
- ✅ **TypeScript**: Strict mode passes
- ✅ **Tests**: 80% minimum coverage
- ✅ **Complexity**: Max 15 cyclomatic complexity
- ✅ **Function Size**: Max 150 lines per function
- ✅ **Commit Format**: Conventional Commits specification

## Troubleshooting

### Hooks not running?

```bash
# Reinstall hooks
npm run prepare
```

### Linting errors?

```bash
# Auto-fix most issues
npm run lint:fix
npm run format
```

### Type errors?

```bash
# Check what's wrong
npm run typecheck:strict

# Common fixes:
# 1. Add explicit return types
# 2. Handle null/undefined cases
# 3. Remove 'any' types
```

### Tests failing?

```bash
# Run tests in watch mode to debug
npm run test:watch
```

## Next Steps

1. Read `docs/CONTRIBUTING.md` for detailed guidelines
2. Review `docs/CODE_QUALITY_SETUP.md` for full documentation
3. Check `docs/CODE_REVIEW_CHECKLIST.md` before creating PRs

## Help

If you encounter issues:
1. Check documentation in `docs/`
2. Review error messages carefully
3. Ask for help in issues with `code-quality` tag

---

**Ready to code!** All quality checks will run automatically when you commit and push. 🚀
