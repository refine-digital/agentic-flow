/**
 * MockAgentDB - London School Mock Factory
 *
 * Provides a mock implementation of AgentDB for testing.
 * Focuses on behavior verification and interaction testing.
 */

import { jest } from '@jest/globals';

export interface AgentDBInterface {
  initialize(): Promise<void>;
  close(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(callback: () => Promise<T>): Promise<T>;

  // Vector operations
  insertVector(table: string, id: string, vector: number[], metadata?: any): Promise<void>;
  searchVector(table: string, query: number[], k?: number): Promise<any[]>;

  // Memory operations
  storeMemory(sessionId: string, content: string, metadata?: any): Promise<void>;
  recallMemory(sessionId: string, query: string, k?: number): Promise<any[]>;

  // Reflexion operations
  storeReflexion(episodeId: string, trajectory: any[], verdict: boolean, critique: string): Promise<void>;
  getReflexionPatterns(task: string, k?: number): Promise<any[]>;

  // Skill library operations
  registerSkill(name: string, code: string, metadata?: any): Promise<void>;
  searchSkills(query: string, k?: number): Promise<any[]>;

  // Causal graph operations
  addCausalEdge(from: string, to: string, weight?: number): Promise<void>;
  getCausalPath(from: string, to: string): Promise<string[]>;
  explainRecall(memoryId: string): Promise<any>;
}

/**
 * Creates a mock AgentDB instance with configurable behavior
 */
export function createMockAgentDB(config: Partial<AgentDBInterface> = {}): jest.Mocked<AgentDBInterface> {
  const mock: jest.Mocked<AgentDBInterface> = {
    // Lifecycle methods
    initialize: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),

    // Query methods
    query: jest.fn().mockResolvedValue([]),
    execute: jest.fn().mockResolvedValue(undefined),
    transaction: jest.fn().mockImplementation(async (callback) => await callback()),

    // Vector operations
    insertVector: jest.fn().mockResolvedValue(undefined),
    searchVector: jest.fn().mockResolvedValue([]),

    // Memory operations
    storeMemory: jest.fn().mockResolvedValue(undefined),
    recallMemory: jest.fn().mockResolvedValue([]),

    // Reflexion operations
    storeReflexion: jest.fn().mockResolvedValue(undefined),
    getReflexionPatterns: jest.fn().mockResolvedValue([]),

    // Skill library operations
    registerSkill: jest.fn().mockResolvedValue(undefined),
    searchSkills: jest.fn().mockResolvedValue([]),

    // Causal graph operations
    addCausalEdge: jest.fn().mockResolvedValue(undefined),
    getCausalPath: jest.fn().mockResolvedValue([]),
    explainRecall: jest.fn().mockResolvedValue({ path: [], weights: [] })
  };

  // Apply custom configuration
  Object.assign(mock, config);

  return mock;
}

/**
 * Creates a spy wrapper around a real AgentDB instance
 * Useful for integration tests where you want real behavior with tracking
 */
export function spyOnAgentDB(instance: AgentDBInterface): jest.Mocked<AgentDBInterface> {
  return {
    initialize: jest.fn(instance.initialize.bind(instance)),
    close: jest.fn(instance.close.bind(instance)),
    query: jest.fn(instance.query.bind(instance)),
    execute: jest.fn(instance.execute.bind(instance)),
    transaction: jest.fn(instance.transaction.bind(instance)),
    insertVector: jest.fn(instance.insertVector.bind(instance)),
    searchVector: jest.fn(instance.searchVector.bind(instance)),
    storeMemory: jest.fn(instance.storeMemory.bind(instance)),
    recallMemory: jest.fn(instance.recallMemory.bind(instance)),
    storeReflexion: jest.fn(instance.storeReflexion.bind(instance)),
    getReflexionPatterns: jest.fn(instance.getReflexionPatterns.bind(instance)),
    registerSkill: jest.fn(instance.registerSkill.bind(instance)),
    searchSkills: jest.fn(instance.searchSkills.bind(instance)),
    addCausalEdge: jest.fn(instance.addCausalEdge.bind(instance)),
    getCausalPath: jest.fn(instance.getCausalPath.bind(instance)),
    explainRecall: jest.fn(instance.explainRecall.bind(instance))
  };
}

/**
 * Preset mock configurations for common scenarios
 */
export const MockAgentDBPresets = {
  // Success scenario - all operations succeed
  success: () => createMockAgentDB(),

  // Empty database - all queries return empty results
  empty: () => createMockAgentDB({
    query: jest.fn().mockResolvedValue([]),
    searchVector: jest.fn().mockResolvedValue([]),
    recallMemory: jest.fn().mockResolvedValue([]),
    getReflexionPatterns: jest.fn().mockResolvedValue([]),
    searchSkills: jest.fn().mockResolvedValue([])
  }),

  // Error scenario - operations fail
  error: (error = new Error('Database error')) => createMockAgentDB({
    initialize: jest.fn().mockRejectedValue(error),
    query: jest.fn().mockRejectedValue(error),
    execute: jest.fn().mockRejectedValue(error),
    transaction: jest.fn().mockRejectedValue(error)
  }),

  // With data - returns predefined results
  withData: (data: any[]) => createMockAgentDB({
    query: jest.fn().mockResolvedValue(data),
    searchVector: jest.fn().mockResolvedValue(data),
    recallMemory: jest.fn().mockResolvedValue(data),
    getReflexionPatterns: jest.fn().mockResolvedValue(data),
    searchSkills: jest.fn().mockResolvedValue(data)
  })
};

/**
 * AgentDB contract definition for contract testing
 */
export const AgentDBContract = {
  initialize: 'function',
  close: 'function',
  query: 'function',
  execute: 'function',
  transaction: 'function',
  insertVector: 'function',
  searchVector: 'function',
  storeMemory: 'function',
  recallMemory: 'function',
  storeReflexion: 'function',
  getReflexionPatterns: 'function',
  registerSkill: 'function',
  searchSkills: 'function',
  addCausalEdge: 'function',
  getCausalPath: 'function',
  explainRecall: 'function'
};
