/**
 * MockCausalGraph - London School Mock Factory
 *
 * Mock implementation for Causal Memory Graph
 */

import { jest } from '@jest/globals';

export interface CausalGraphInterface {
  initialize(): Promise<void>;
  addNode(id: string, data: any): Promise<void>;
  addEdge(from: string, to: string, weight?: number, metadata?: any): Promise<void>;
  removeNode(id: string): Promise<void>;
  removeEdge(from: string, to: string): Promise<void>;
  findPath(from: string, to: string): Promise<CausalPath | null>;
  explainInfluence(source: string, target: string): Promise<Explanation>;
  getPredecessors(nodeId: string): Promise<string[]>;
  getSuccessors(nodeId: string): Promise<string[]>;
  computePageRank(): Promise<Map<string, number>>;
  detectCycles(): Promise<string[][]>;
}

export interface CausalPath {
  nodes: string[];
  edges: CausalEdge[];
  totalWeight: number;
  confidence: number;
}

export interface CausalEdge {
  from: string;
  to: string;
  weight: number;
  metadata?: any;
}

export interface Explanation {
  directInfluence: number;
  indirectInfluence: number;
  paths: CausalPath[];
  topFactors: string[];
}

/**
 * Creates a mock CausalGraph instance
 */
export function createMockCausalGraph(config: Partial<CausalGraphInterface> = {}): jest.Mocked<CausalGraphInterface> {
  const mock: jest.Mocked<CausalGraphInterface> = {
    initialize: jest.fn().mockResolvedValue(undefined),
    addNode: jest.fn().mockResolvedValue(undefined),
    addEdge: jest.fn().mockResolvedValue(undefined),
    removeNode: jest.fn().mockResolvedValue(undefined),
    removeEdge: jest.fn().mockResolvedValue(undefined),
    findPath: jest.fn().mockResolvedValue(null),
    explainInfluence: jest.fn().mockResolvedValue({
      directInfluence: 0,
      indirectInfluence: 0,
      paths: [],
      topFactors: []
    }),
    getPredecessors: jest.fn().mockResolvedValue([]),
    getSuccessors: jest.fn().mockResolvedValue([]),
    computePageRank: jest.fn().mockResolvedValue(new Map()),
    detectCycles: jest.fn().mockResolvedValue([])
  };

  Object.assign(mock, config);
  return mock;
}

export const MockCausalGraphPresets = {
  success: () => createMockCausalGraph(),

  withPath: (path: CausalPath) => createMockCausalGraph({
    findPath: jest.fn().mockResolvedValue(path)
  }),

  withExplanation: (explanation: Explanation) => createMockCausalGraph({
    explainInfluence: jest.fn().mockResolvedValue(explanation)
  }),

  error: (error = new Error('CausalGraph error')) => createMockCausalGraph({
    addNode: jest.fn().mockRejectedValue(error),
    addEdge: jest.fn().mockRejectedValue(error),
    findPath: jest.fn().mockRejectedValue(error)
  })
};

export const CausalGraphContract = {
  initialize: 'function',
  addNode: 'function',
  addEdge: 'function',
  removeNode: 'function',
  removeEdge: 'function',
  findPath: 'function',
  explainInfluence: 'function',
  getPredecessors: 'function',
  getSuccessors: 'function',
  computePageRank: 'function',
  detectCycles: 'function'
};
