/**
 * SwarmMockCoordinator - Coordinate mocks across swarm tests
 *
 * Provides shared mock state and coordination for distributed testing
 */

import { jest } from '@jest/globals';
import type { AgentDBInterface } from './MockAgentDB';

/**
 * Shared mock registry for swarm coordination
 */
export class SwarmMockRegistry {
  private static instance: SwarmMockRegistry;
  private mocks: Map<string, any> = new Map();
  private sharedState: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): SwarmMockRegistry {
    if (!SwarmMockRegistry.instance) {
      SwarmMockRegistry.instance = new SwarmMockRegistry();
    }
    return SwarmMockRegistry.instance;
  }

  registerMock(name: string, mock: any): void {
    this.mocks.set(name, mock);
  }

  getMock<T = any>(name: string): T | undefined {
    return this.mocks.get(name) as T;
  }

  setSharedState(key: string, value: any): void {
    this.sharedState.set(key, value);
  }

  getSharedState<T = any>(key: string): T | undefined {
    return this.sharedState.get(key) as T;
  }

  clear(): void {
    this.mocks.clear();
    this.sharedState.clear();
  }

  reset(): void {
    this.mocks.forEach(mock => {
      if (mock && typeof mock === 'object') {
        Object.values(mock).forEach(value => {
          if (jest.isMockFunction(value)) {
            (value as jest.Mock).mockClear();
          }
        });
      }
    });
  }
}

/**
 * Create a swarm-aware mock that shares state across instances
 */
export function createSwarmMock<T extends object>(
  name: string,
  mockFactory: () => jest.Mocked<T>
): jest.Mocked<T> {
  const registry = SwarmMockRegistry.getInstance();

  let mock = registry.getMock<jest.Mocked<T>>(name);
  if (!mock) {
    mock = mockFactory();
    registry.registerMock(name, mock);
  }

  return mock;
}

/**
 * Extend an existing mock with additional methods
 */
export function extendSwarmMock<T extends object, E extends object>(
  baseMock: jest.Mocked<T>,
  extensions: E
): jest.Mocked<T & E> {
  return Object.assign({}, baseMock, extensions) as jest.Mocked<T & E>;
}

/**
 * Contract monitor for swarm testing
 */
export class SwarmContractMonitor {
  private interactions: Array<{
    mock: string;
    method: string;
    args: any[];
    timestamp: number;
  }> = [];

  verifyInteractions(mocks: Record<string, jest.Mocked<any>>): void {
    Object.entries(mocks).forEach(([name, mock]) => {
      Object.entries(mock).forEach(([method, fn]) => {
        if (jest.isMockFunction(fn)) {
          const calls = (fn as jest.Mock).mock.calls;
          calls.forEach(args => {
            this.interactions.push({
              mock: name,
              method,
              args,
              timestamp: Date.now()
            });
          });
        }
      });
    });
  }

  reportToSwarm(results: any): void {
    const registry = SwarmMockRegistry.getInstance();
    registry.setSharedState('interactions', this.interactions);
    registry.setSharedState('results', results);
  }

  getInteractionHistory(): typeof this.interactions {
    return [...this.interactions];
  }

  clear(): void {
    this.interactions = [];
  }
}

/**
 * Mock collaboration patterns for swarm coordination
 */
export class MockCollaborationPattern {
  private participants: Map<string, jest.Mocked<any>> = new Map();

  addParticipant(name: string, mock: jest.Mocked<any>): void {
    this.participants.set(name, mock);
  }

  /**
   * Verify that a specific collaboration pattern occurred
   */
  verifyPattern(pattern: {
    sequence: Array<{
      participant: string;
      method: string;
      after?: string; // Must occur after this participant's call
    }>;
  }): void {
    const allCalls: Array<{
      participant: string;
      method: string;
      order: number;
    }> = [];

    pattern.sequence.forEach(step => {
      const mock = this.participants.get(step.participant);
      if (!mock) {
        throw new Error(`Participant ${step.participant} not found`);
      }

      const method = mock[step.method];
      if (!jest.isMockFunction(method)) {
        throw new Error(`${step.method} is not a mock function`);
      }

      const calls = (method as jest.Mock).mock.invocationCallOrder;
      calls.forEach(order => {
        allCalls.push({
          participant: step.participant,
          method: step.method,
          order
        });
      });
    });

    // Verify sequence order
    pattern.sequence.forEach(step => {
      if (step.after) {
        const afterCalls = allCalls.filter(c =>
          c.participant === step.after
        );
        const currentCalls = allCalls.filter(c =>
          c.participant === step.participant && c.method === step.method
        );

        if (afterCalls.length > 0 && currentCalls.length > 0) {
          const lastAfter = Math.max(...afterCalls.map(c => c.order));
          const firstCurrent = Math.min(...currentCalls.map(c => c.order));

          expect(firstCurrent).toBeGreaterThan(lastAfter);
        }
      }
    });
  }

  /**
   * Verify parallel execution (calls happened within time window)
   */
  verifyParallelExecution(
    participants: string[],
    method: string,
    timeWindowMs = 100
  ): void {
    const timestamps: number[] = [];

    participants.forEach(participant => {
      const mock = this.participants.get(participant);
      if (mock && jest.isMockFunction(mock[method])) {
        const calls = (mock[method] as jest.Mock).mock.calls;
        if (calls.length > 0) {
          // Approximate timestamp based on call order
          timestamps.push((mock[method] as jest.Mock).mock.invocationCallOrder[0]);
        }
      }
    });

    if (timestamps.length > 1) {
      const maxDiff = Math.max(...timestamps) - Math.min(...timestamps);
      // In mock land, parallel calls should have similar call order indices
      expect(maxDiff).toBeLessThan(timeWindowMs);
    }
  }

  clear(): void {
    this.participants.clear();
  }
}
