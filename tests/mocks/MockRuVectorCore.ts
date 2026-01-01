/**
 * MockRuVectorCore - London School Mock Factory
 *
 * Mock implementation for RuVector WASM vector operations
 */

import { jest } from '@jest/globals';

export interface RuVectorCoreInterface {
  initialize(): Promise<void>;
  createIndex(dimension: number, metric?: string): Promise<string>;
  addVectors(indexId: string, vectors: number[][], ids: string[]): Promise<void>;
  search(indexId: string, query: number[], k: number): Promise<SearchResult[]>;
  removeVector(indexId: string, id: string): Promise<void>;
  getVector(indexId: string, id: string): Promise<number[] | null>;
  optimizeIndex(indexId: string): Promise<void>;
  getIndexStats(indexId: string): Promise<IndexStats>;
  destroy(indexId: string): Promise<void>;
}

export interface SearchResult {
  id: string;
  distance: number;
  score: number;
}

export interface IndexStats {
  vectorCount: number;
  dimension: number;
  metric: string;
  memoryUsage: number;
}

/**
 * Creates a mock RuVector core instance
 */
export function createMockRuVectorCore(config: Partial<RuVectorCoreInterface> = {}): jest.Mocked<RuVectorCoreInterface> {
  const mock: jest.Mocked<RuVectorCoreInterface> = {
    initialize: jest.fn().mockResolvedValue(undefined),
    createIndex: jest.fn().mockResolvedValue('index-001'),
    addVectors: jest.fn().mockResolvedValue(undefined),
    search: jest.fn().mockResolvedValue([]),
    removeVector: jest.fn().mockResolvedValue(undefined),
    getVector: jest.fn().mockResolvedValue(null),
    optimizeIndex: jest.fn().mockResolvedValue(undefined),
    getIndexStats: jest.fn().mockResolvedValue({
      vectorCount: 0,
      dimension: 384,
      metric: 'cosine',
      memoryUsage: 0
    }),
    destroy: jest.fn().mockResolvedValue(undefined)
  };

  Object.assign(mock, config);
  return mock;
}

/**
 * Preset configurations
 */
export const MockRuVectorCorePresets = {
  success: () => createMockRuVectorCore(),

  withResults: (results: SearchResult[]) => createMockRuVectorCore({
    search: jest.fn().mockResolvedValue(results)
  }),

  withStats: (stats: Partial<IndexStats>) => createMockRuVectorCore({
    getIndexStats: jest.fn().mockResolvedValue({
      vectorCount: stats.vectorCount || 100,
      dimension: stats.dimension || 384,
      metric: stats.metric || 'cosine',
      memoryUsage: stats.memoryUsage || 1024 * 1024
    })
  }),

  error: (error = new Error('RuVector error')) => createMockRuVectorCore({
    initialize: jest.fn().mockRejectedValue(error),
    search: jest.fn().mockRejectedValue(error),
    addVectors: jest.fn().mockRejectedValue(error)
  })
};

export const RuVectorCoreContract = {
  initialize: 'function',
  createIndex: 'function',
  addVectors: 'function',
  search: 'function',
  removeVector: 'function',
  getVector: 'function',
  optimizeIndex: 'function',
  getIndexStats: 'function',
  destroy: 'function'
};
