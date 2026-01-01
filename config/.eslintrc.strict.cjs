/**
 * Strict ESLint Configuration for Agentic-Flow v2.0.0-alpha
 * Enforces code quality, TypeScript best practices, and security standards
 */

module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: [
      './tsconfig.json',
      './agentic-flow/config/tsconfig.json',
      './agentic-flow/config/tsconfig.strict.json',
    ],
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier', // Must be last to override other configs
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript Specific Rules - STRICT MODE
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/strict-boolean-expressions': [
      'warn',
      {
        allowString: true,
        allowNumber: false,
        allowNullableObject: true,
      },
    ],
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      },
    ],

    // Code Quality Rules
    complexity: ['error', { max: 15 }],
    'max-depth': ['error', 4],
    'max-lines-per-function': [
      'error',
      {
        max: 150,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-nested-callbacks': ['error', 3],
    'max-params': ['error', 5],
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error', 'info'],
      },
    ],
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-return-await': 'off', // Handled by @typescript-eslint/return-await
    '@typescript-eslint/return-await': ['error', 'always'],

    // Security Rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // Best Practices
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',
    'object-shorthand': ['warn', 'always'],
    'no-throw-literal': 'error',
    '@typescript-eslint/no-throw-literal': 'error',

    // Error Prevention
    'no-unreachable': 'error',
    'no-unreachable-loop': 'error',
    'no-promise-executor-return': 'error',
    'require-atomic-updates': 'error',
  },
  overrides: [
    // Relaxed rules for test files
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        'max-lines-per-function': 'off',
      },
    },
    // Relaxed rules for CLI and scripts
    {
      files: ['**/cli/**/*.ts', '**/scripts/**/*.ts', '**/cli-*.ts'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
      },
    },
    // JavaScript files
    {
      files: ['**/*.js'],
      extends: ['eslint:recommended'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.min.js',
    'coverage/',
    '**/*.d.ts',
    'wasm/',
    'pkg/',
    'agentic-flow-*.tgz',
    'open-lovable/',
    '.husky/',
    'certs/',
    '*.config.js',
    '*.config.ts',
  ],
};
