/**
 * MockReflexionMemory - London School Mock Factory
 *
 * Mock implementation for Reflexion episodic memory
 */

import { jest } from '@jest/globals';

export interface ReflexionMemoryInterface {
  initialize(): Promise<void>;
  storeEpisode(episodeId: string, trajectory: Action[], verdict: boolean, critique: string): Promise<void>;
  recallSimilarEpisodes(currentTrajectory: Action[], k?: number): Promise<Episode[]>;
  getSuccessfulStrategies(task: string, k?: number): Promise<Strategy[]>;
  getFailurePatterns(task: string, k?: number): Promise<FailurePattern[]>;
  updateVerdict(episodeId: string, newVerdict: boolean, reason: string): Promise<void>;
  pruneEpisodes(strategy: PruneStrategy): Promise<number>;
}

export interface Action {
  step: number;
  action: string;
  observation: string;
  thought?: string;
}

export interface Episode {
  id: string;
  trajectory: Action[];
  verdict: boolean;
  critique: string;
  similarity: number;
  timestamp: Date;
}

export interface Strategy {
  pattern: string;
  successRate: number;
  examples: Episode[];
}

export interface FailurePattern {
  pattern: string;
  frequency: number;
  critiques: string[];
}

export type PruneStrategy = 'keep-successes' | 'keep-recent' | 'keep-diverse';

/**
 * Creates a mock ReflexionMemory instance
 */
export function createMockReflexionMemory(config: Partial<ReflexionMemoryInterface> = {}): jest.Mocked<ReflexionMemoryInterface> {
  const mock: jest.Mocked<ReflexionMemoryInterface> = {
    initialize: jest.fn().mockResolvedValue(undefined),
    storeEpisode: jest.fn().mockResolvedValue(undefined),
    recallSimilarEpisodes: jest.fn().mockResolvedValue([]),
    getSuccessfulStrategies: jest.fn().mockResolvedValue([]),
    getFailurePatterns: jest.fn().mockResolvedValue([]),
    updateVerdict: jest.fn().mockResolvedValue(undefined),
    pruneEpisodes: jest.fn().mockResolvedValue(0)
  };

  Object.assign(mock, config);
  return mock;
}

export const MockReflexionMemoryPresets = {
  success: () => createMockReflexionMemory(),

  withEpisodes: (episodes: Episode[]) => createMockReflexionMemory({
    recallSimilarEpisodes: jest.fn().mockResolvedValue(episodes)
  }),

  withStrategies: (strategies: Strategy[]) => createMockReflexionMemory({
    getSuccessfulStrategies: jest.fn().mockResolvedValue(strategies)
  }),

  error: (error = new Error('ReflexionMemory error')) => createMockReflexionMemory({
    storeEpisode: jest.fn().mockRejectedValue(error),
    recallSimilarEpisodes: jest.fn().mockRejectedValue(error)
  })
};

export const ReflexionMemoryContract = {
  initialize: 'function',
  storeEpisode: 'function',
  recallSimilarEpisodes: 'function',
  getSuccessfulStrategies: 'function',
  getFailurePatterns: 'function',
  updateVerdict: 'function',
  pruneEpisodes: 'function'
};
