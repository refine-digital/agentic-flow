/**
 * Lint-staged Configuration for Agentic-Flow v2.0.0-alpha
 * Runs quality checks on staged files before commit
 */

module.exports = {
  // TypeScript files
  '**/*.ts': [
    'prettier --config config/.prettierrc.js --write',
  ],

  // JavaScript files
  '**/*.js': [
    'prettier --config config/.prettierrc.js --write'
  ],

  // JSON files
  '**/*.json': ['prettier --config config/.prettierrc.js --write'],

  // YAML files
  '**/*.{yml,yaml}': ['prettier --config config/.prettierrc.js --write'],

  // Markdown files
  '**/*.md': ['prettier --config config/.prettierrc.js --write'],
};
