/**
 * MockGNNLayer - London School Mock Factory
 *
 * Mock implementation for Graph Neural Network operations
 */

import { jest } from '@jest/globals';

export interface GNNLayerInterface {
  initialize(config: GNNConfig): Promise<void>;
  forward(nodeFeatures: number[][], adjacencyMatrix: number[][]): Promise<number[][]>;
  backward(gradients: number[][]): Promise<void>;
  updateWeights(learningRate: number): Promise<void>;
  getWeights(): number[][];
  setWeights(weights: number[][]): void;
  aggregate(nodeFeatures: number[][], neighbors: number[][]): Promise<number[][]>;
  combine(aggregated: number[][], self: number[][]): Promise<number[][]>;
}

export interface GNNConfig {
  inputDim: number;
  outputDim: number;
  aggregation: 'mean' | 'sum' | 'max';
  activation: 'relu' | 'sigmoid' | 'tanh';
}

/**
 * Creates a mock GNN layer instance
 */
export function createMockGNNLayer(config: Partial<GNNLayerInterface> = {}): jest.Mocked<GNNLayerInterface> {
  const mock: jest.Mocked<GNNLayerInterface> = {
    initialize: jest.fn().mockResolvedValue(undefined),
    forward: jest.fn().mockResolvedValue([]),
    backward: jest.fn().mockResolvedValue(undefined),
    updateWeights: jest.fn().mockResolvedValue(undefined),
    getWeights: jest.fn().mockReturnValue([]),
    setWeights: jest.fn(),
    aggregate: jest.fn().mockResolvedValue([]),
    combine: jest.fn().mockResolvedValue([])
  };

  Object.assign(mock, config);
  return mock;
}

export const MockGNNLayerPresets = {
  success: () => createMockGNNLayer(),

  withOutput: (output: number[][]) => createMockGNNLayer({
    forward: jest.fn().mockResolvedValue(output),
    aggregate: jest.fn().mockResolvedValue(output),
    combine: jest.fn().mockResolvedValue(output)
  }),

  error: (error = new Error('GNN computation error')) => createMockGNNLayer({
    forward: jest.fn().mockRejectedValue(error),
    backward: jest.fn().mockRejectedValue(error)
  })
};

export const GNNLayerContract = {
  initialize: 'function',
  forward: 'function',
  backward: 'function',
  updateWeights: 'function',
  getWeights: 'function',
  setWeights: 'function',
  aggregate: 'function',
  combine: 'function'
};
