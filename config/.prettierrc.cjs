/**
 * Prettier Configuration for Agentic-Flow v2.0.0-alpha
 * Ensures consistent code formatting across the project
 */

module.exports = {
  // Formatting Rules
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  arrowParens: 'always',
  endOfLine: 'lf',
  bracketSpacing: true,
  bracketSameLine: false,

  // TypeScript Specific
  parser: 'typescript',

  // Overrides for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json',
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yaml',
      options: {
        parser: 'yaml',
        tabWidth: 2,
      },
    },
    {
      files: '*.yml',
      options: {
        parser: 'yaml',
        tabWidth: 2,
      },
    },
    {
      files: 'package.json',
      options: {
        printWidth: 120,
      },
    },
  ],
};
