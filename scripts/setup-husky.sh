#!/bin/bash
# Setup Husky Git Hooks for Agentic-Flow v2.0.0-alpha

set -e

echo "🔧 Setting up Husky Git hooks..."

# Install husky
npx husky install

# Create hooks directory
mkdir -p .husky

# Pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged
npx lint-staged --config config/lint-staged.config.js

echo "✅ Pre-commit checks passed!"
EOF

# Commit-msg hook
cat > .husky/commit-msg << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validating commit message..."

# Validate commit message format
node scripts/validate-commit-msg.js "$1"

echo "✅ Commit message is valid!"
EOF

# Pre-push hook
cat > .husky/pre-push << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-push checks..."

# Run tests
npm run test

# Run type checking
npm run typecheck

echo "✅ Pre-push checks passed!"
EOF

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push

echo "✅ Husky Git hooks configured successfully!"
echo ""
echo "The following hooks are now active:"
echo "  - pre-commit: Runs lint-staged (ESLint + Prettier + TypeScript)"
echo "  - commit-msg: Validates commit message format"
echo "  - pre-push: Runs tests and type checking"
