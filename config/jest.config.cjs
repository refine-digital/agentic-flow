/**
 * Jest Configuration for Agentic-Flow v2.0.0-alpha
 * Comprehensive test configuration with coverage reporting
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/../agentic-flow/src', '<rootDir>/../tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/../agentic-flow/config/tsconfig.json',
    }],
  },
  collectCoverageFrom: [
    'agentic-flow/src/**/*.ts',
    '!agentic-flow/src/**/*.d.ts',
    '!agentic-flow/src/**/*.test.ts',
    '!agentic-flow/src/**/*.spec.ts',
    '!agentic-flow/src/examples/**',
    '!agentic-flow/src/agentdb/cli/**',
    '!agentic-flow/src/agentdb/benchmarks/**',
  ],
  coverageDirectory: '<rootDir>/../coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../agentic-flow/src/$1',
    '^agentdb$': '<rootDir>/__mocks__/agentdb.ts',
    '^@agentdb/alpha$': '<rootDir>/__mocks__/agentdb.ts',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
