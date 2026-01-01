/**
 * Jest Test Setup - London School TDD
 *
 * This file configures the testing environment following London School principles:
 * - Mock-first approach for isolation
 * - Behavior verification over state testing
 * - Clear test boundaries and contracts
 */

import { jest } from '@jest/globals';

// Configure Jest matchers for better assertions
expect.extend({
  toHaveBeenCalledBefore(received: jest.Mock, expected: jest.Mock) {
    const receivedCalls = received.mock.invocationCallOrder;
    const expectedCalls = expected.mock.invocationCallOrder;

    if (!receivedCalls.length) {
      return {
        pass: false,
        message: () => `Expected ${received.getMockName()} to have been called before ${expected.getMockName()}, but it was never called`
      };
    }

    if (!expectedCalls.length) {
      return {
        pass: false,
        message: () => `Expected ${expected.getMockName()} to have been called after ${received.getMockName()}, but it was never called`
      };
    }

    const receivedFirstCall = Math.min(...receivedCalls);
    const expectedFirstCall = Math.min(...expectedCalls);

    const pass = receivedFirstCall < expectedFirstCall;

    return {
      pass,
      message: () => pass
        ? `Expected ${received.getMockName()} NOT to have been called before ${expected.getMockName()}`
        : `Expected ${received.getMockName()} to have been called before ${expected.getMockName()}`
    };
  },

  toSatisfyContract(received: any, expectedContract: object) {
    const missingMethods: string[] = [];
    const extraMethods: string[] = [];

    // Check for missing methods
    Object.keys(expectedContract).forEach(method => {
      if (typeof received[method] !== 'function') {
        missingMethods.push(method);
      }
    });

    // Optional: Check for extra methods (can be disabled for flexibility)
    Object.keys(received).forEach(method => {
      if (typeof received[method] === 'function' && !expectedContract.hasOwnProperty(method)) {
        extraMethods.push(method);
      }
    });

    const pass = missingMethods.length === 0;

    return {
      pass,
      message: () => {
        if (!pass) {
          return `Object does not satisfy contract. Missing methods: ${missingMethods.join(', ')}`;
        }
        if (extraMethods.length > 0) {
          return `Object has extra methods not in contract: ${extraMethods.join(', ')}`;
        }
        return 'Object satisfies contract';
      }
    };
  }
});

// Global test configuration
beforeAll(() => {
  // Suppress console output in tests unless DEBUG is set
  if (!process.env.DEBUG) {
    global.console = {
      ...console,
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      // Keep error for debugging test failures
      error: console.error
    };
  }
});

// Reset mocks between tests for isolation
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

// Cleanup after each test
afterEach(() => {
  jest.restoreAllMocks();
});

// Global test utilities
global.testUtils = {
  // Wait for async operations to complete
  waitFor: async (condition: () => boolean, timeout = 5000): Promise<void> => {
    const startTime = Date.now();
    while (!condition()) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Timeout waiting for condition after ${timeout}ms`);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  },

  // Create a mock timer
  createMockTimer: () => {
    let time = 0;
    return {
      now: () => time,
      advance: (ms: number) => { time += ms; },
      reset: () => { time = 0; }
    };
  }
};

// TypeScript declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledBefore(expected: jest.Mock): R;
      toSatisfyContract(expectedContract: object): R;
    }
  }

  var testUtils: {
    waitFor: (condition: () => boolean, timeout?: number) => Promise<void>;
    createMockTimer: () => {
      now: () => number;
      advance: (ms: number) => void;
      reset: () => void;
    };
  };
}

export {};
