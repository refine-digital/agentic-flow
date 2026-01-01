import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config.InitialOptions = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test file locations - London School emphasizes comprehensive coverage
  roots: [
    '<rootDir>/tests',
    '<rootDir>/packages/agentdb/src',
    '<rootDir>/agentic-flow/src'
  ],

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  // TypeScript transformation
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        moduleResolution: 'node',
        skipLibCheck: true,
        strict: true
      }
    }]
  },

  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@agentdb/(.*)$': '<rootDir>/packages/agentdb/src/$1',
    '^@agentic-flow/(.*)$': '<rootDir>/agentic-flow/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@mocks/(.*)$': '<rootDir>/tests/mocks/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1',
    '^@helpers/(.*)$': '<rootDir>/tests/helpers/$1'
  },

  // Coverage configuration - 95% threshold for production quality
  collectCoverageFrom: [
    'packages/agentdb/src/**/*.{ts,tsx}',
    'agentic-flow/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/tests/**',
    '!**/test-*.ts',
    '!**/index.ts',
    '!**/types.ts',
    '!**/cli/**',
    '!**/scripts/**'
  ],

  // London School: High coverage thresholds with focus on interaction testing
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    // Critical modules require even higher coverage
    './packages/agentdb/src/controllers/**/*.ts': {
      branches: 98,
      functions: 98,
      lines: 98,
      statements: 98
    }
  },

  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json', 'cobertura'],

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts',
    '<rootDir>/tests/jest.setup.ts'
  ],

  // Performance configuration
  testTimeout: 30000,
  maxWorkers: '50%',

  // Mock configuration - London School uses mocks extensively
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  mockReset: true,

  // Verbose output for better debugging
  verbose: true,

  // Fail fast on first error in CI
  bail: process.env.CI ? 1 : 0,

  // Error handling
  errorOnDeprecated: true,

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/examples/',
    '/.next/'
  ],

  // Watch mode configuration
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // Globals configuration
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: {
        warnOnly: false
      }
    }
  },

  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/coverage',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],

  // Collect coverage on all tests by default
  collectCoverage: false, // Enable with --coverage flag

  // Force exit after tests complete
  forceExit: false,
  detectOpenHandles: true
};

export default config;
