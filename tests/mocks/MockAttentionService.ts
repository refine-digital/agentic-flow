/**
 * MockAttentionService - London School Mock Factory
 *
 * Mock implementation for RuVector Attention mechanisms
 */

import { jest } from '@jest/globals';

export interface AttentionServiceInterface {
  initialize(): Promise<void>;
  computeAttention(query: number[], keys: number[][], values: number[][]): Promise<AttentionOutput>;
  computeMultiHeadAttention(query: number[], keys: number[][], values: number[][], heads: number): Promise<AttentionOutput>;
  computeCrossAttention(queries: number[][], keys: number[][], values: number[][]): Promise<number[][]>;
  applyMask(attention: number[][], mask: boolean[][]): number[][];
  getAttentionWeights(query: number[], keys: number[][]): Promise<number[]>;
}

export interface AttentionOutput {
  output: number[];
  weights: number[];
  scores: number[];
}

/**
 * Creates a mock Attention service instance
 */
export function createMockAttentionService(config: Partial<AttentionServiceInterface> = {}): jest.Mocked<AttentionServiceInterface> {
  const mock: jest.Mocked<AttentionServiceInterface> = {
    initialize: jest.fn().mockResolvedValue(undefined),
    computeAttention: jest.fn().mockResolvedValue({
      output: [],
      weights: [],
      scores: []
    }),
    computeMultiHeadAttention: jest.fn().mockResolvedValue({
      output: [],
      weights: [],
      scores: []
    }),
    computeCrossAttention: jest.fn().mockResolvedValue([]),
    applyMask: jest.fn().mockReturnValue([]),
    getAttentionWeights: jest.fn().mockResolvedValue([])
  };

  Object.assign(mock, config);
  return mock;
}

/**
 * Preset configurations
 */
export const MockAttentionServicePresets = {
  success: () => createMockAttentionService(),

  withOutput: (output: AttentionOutput) => createMockAttentionService({
    computeAttention: jest.fn().mockResolvedValue(output),
    computeMultiHeadAttention: jest.fn().mockResolvedValue(output)
  }),

  withWeights: (weights: number[]) => createMockAttentionService({
    getAttentionWeights: jest.fn().mockResolvedValue(weights)
  }),

  error: (error = new Error('Attention computation error')) => createMockAttentionService({
    computeAttention: jest.fn().mockRejectedValue(error),
    computeMultiHeadAttention: jest.fn().mockRejectedValue(error)
  })
};

export const AttentionServiceContract = {
  initialize: 'function',
  computeAttention: 'function',
  computeMultiHeadAttention: 'function',
  computeCrossAttention: 'function',
  applyMask: 'function',
  getAttentionWeights: 'function'
};
