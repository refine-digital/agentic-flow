/**
 * MockFactory - Universal Mock Factory for London School TDD
 *
 * Provides utilities for creating and managing mocks across the test suite
 */

import { jest } from '@jest/globals';

/**
 * Create a mock from an interface definition
 */
export function createMockFromInterface<T extends object>(
  methods: (keyof T)[],
  defaultImplementations?: Partial<T>
): jest.Mocked<T> {
  const mock = {} as jest.Mocked<T>;

  methods.forEach(method => {
    if (defaultImplementations && defaultImplementations[method]) {
      mock[method] = defaultImplementations[method] as any;
    } else {
      mock[method] = jest.fn() as any;
    }
  });

  return mock;
}

/**
 * Create a mock with call order tracking
 */
export class CallOrderTracker {
  private calls: Array<{ mock: jest.Mock; args: any[] }> = [];

  track(mock: jest.Mock): jest.Mock {
    const trackedMock = jest.fn((...args: any[]) => {
      this.calls.push({ mock, args });
      return mock(...args);
    });
    return trackedMock;
  }

  verifyOrder(mocks: jest.Mock[]): boolean {
    const callOrder = this.calls.map(call => mocks.indexOf(call.mock));
    for (let i = 1; i < callOrder.length; i++) {
      if (callOrder[i] < callOrder[i - 1]) {
        return false;
      }
    }
    return true;
  }

  getCalls(): Array<{ mock: jest.Mock; args: any[] }> {
    return [...this.calls];
  }

  reset(): void {
    this.calls = [];
  }
}

/**
 * Create a mock with state tracking
 */
export function createStatefulMock<T extends object, S = any>(
  initialState: S,
  stateTransitions: Map<keyof T, (state: S, ...args: any[]) => S>
): jest.Mocked<T> & { getState: () => S } {
  let currentState = initialState;
  const mock = {} as jest.Mocked<T> & { getState: () => S };

  stateTransitions.forEach((transition, method) => {
    mock[method] = jest.fn((...args: any[]) => {
      currentState = transition(currentState, ...args);
      return currentState;
    }) as any;
  });

  mock.getState = () => currentState;

  return mock;
}

/**
 * Create a mock with automatic contract validation
 */
export function createContractMock<T extends object>(
  contract: Record<keyof T, 'function' | 'property'>,
  implementations?: Partial<T>
): jest.Mocked<T> {
  const mock = {} as jest.Mocked<T>;

  Object.entries(contract).forEach(([key, type]) => {
    if (type === 'function') {
      const typedKey = key as keyof T;
      if (implementations && implementations[typedKey]) {
        mock[typedKey] = implementations[typedKey] as any;
      } else {
        mock[typedKey] = jest.fn() as any;
      }
    } else {
      // For properties, use a simple value or getter
      Object.defineProperty(mock, key, {
        value: implementations?.[key as keyof T] ?? null,
        writable: true,
        enumerable: true
      });
    }
  });

  return mock;
}

/**
 * Mock builder pattern for fluent mock creation
 */
export class MockBuilder<T extends object> {
  private mock: Partial<jest.Mocked<T>> = {};

  method<K extends keyof T>(
    name: K,
    implementation: T[K]
  ): this {
    this.mock[name] = implementation as any;
    return this;
  }

  spy<K extends keyof T>(
    name: K,
    implementation: T[K]
  ): this {
    this.mock[name] = jest.fn(implementation as any) as any;
    return this;
  }

  asyncMethod<K extends keyof T>(
    name: K,
    resolvedValue: any
  ): this {
    this.mock[name] = jest.fn().mockResolvedValue(resolvedValue) as any;
    return this;
  }

  asyncError<K extends keyof T>(
    name: K,
    error: Error
  ): this {
    this.mock[name] = jest.fn().mockRejectedValue(error) as any;
    return this;
  }

  build(): jest.Mocked<T> {
    return this.mock as jest.Mocked<T>;
  }
}

/**
 * Helper to verify mock call sequences
 */
export function verifyCallSequence(
  ...calls: Array<{ mock: jest.Mock; expectedArgs?: any[] }>
): void {
  const allCalls = calls.flatMap((call, index) =>
    call.mock.mock.calls.map(args => ({ index, args }))
  );

  // Verify calls happened in order
  for (let i = 1; i < allCalls.length; i++) {
    expect(allCalls[i].index).toBeGreaterThanOrEqual(allCalls[i - 1].index);
  }

  // Verify arguments if provided
  calls.forEach(call => {
    if (call.expectedArgs) {
      expect(call.mock).toHaveBeenCalledWith(...call.expectedArgs);
    }
  });
}

/**
 * Create a mock that records all interactions for replay
 */
export class RecordingMock<T extends object> {
  private mock: jest.Mocked<T>;
  private recordings: Array<{ method: keyof T; args: any[]; result: any }> = [];

  constructor(methods: (keyof T)[]) {
    this.mock = {} as jest.Mocked<T>;

    methods.forEach(method => {
      this.mock[method] = jest.fn((...args: any[]) => {
        const result = undefined;
        this.recordings.push({ method, args, result });
        return result;
      }) as any;
    });
  }

  getMock(): jest.Mocked<T> {
    return this.mock;
  }

  getRecordings(): Array<{ method: keyof T; args: any[]; result: any }> {
    return [...this.recordings];
  }

  replay(targetMock: jest.Mocked<T>): void {
    this.recordings.forEach(recording => {
      (targetMock[recording.method] as any)(...recording.args);
    });
  }

  clear(): void {
    this.recordings = [];
  }
}

/**
 * Helper to create preset mock configurations
 */
export function createMockPresets<T extends object>(
  presets: Record<string, () => jest.Mocked<T>>
): Record<string, () => jest.Mocked<T>> {
  return presets;
}
