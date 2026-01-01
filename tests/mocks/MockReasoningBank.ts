/**
 * MockReasoningBank - London School Mock Factory
 *
 * Mock implementation for ReasoningBank learning memory system
 */

import { jest } from '@jest/globals';

export interface ReasoningBankInterface {
  initialize(): Promise<void>;
  storePattern(sessionId: string, task: string, reward: number, success: boolean, metadata?: any): Promise<void>;
  searchPatterns(task: string, k?: number, filters?: PatternFilters): Promise<Pattern[]>;
  getPatternStats(task: string, k?: number): Promise<PatternStats>;
  learnFromFeedback(patternId: string, feedback: Feedback): Promise<void>;
  distillMemory(threshold: number): Promise<number>;
  exportPatterns(sessionId?: string): Promise<Pattern[]>;
  importPatterns(patterns: Pattern[]): Promise<void>;
}

export interface Pattern {
  id: string;
  sessionId: string;
  task: string;
  input?: string;
  output?: string;
  reward: number;
  success: boolean;
  critique?: string;
  timestamp: Date;
  metadata?: any;
}

export interface PatternFilters {
  minReward?: number;
  onlySuccesses?: boolean;
  onlyFailures?: boolean;
  sessionId?: string;
}

export interface PatternStats {
  totalPatterns: number;
  successRate: number;
  averageReward: number;
  topCritiques: string[];
}

export interface Feedback {
  rating: number;
  comment?: string;
  corrections?: any;
}

/**
 * Creates a mock ReasoningBank instance
 */
export function createMockReasoningBank(config: Partial<ReasoningBankInterface> = {}): jest.Mocked<ReasoningBankInterface> {
  const mock: jest.Mocked<ReasoningBankInterface> = {
    initialize: jest.fn().mockResolvedValue(undefined),
    storePattern: jest.fn().mockResolvedValue(undefined),
    searchPatterns: jest.fn().mockResolvedValue([]),
    getPatternStats: jest.fn().mockResolvedValue({
      totalPatterns: 0,
      successRate: 0,
      averageReward: 0,
      topCritiques: []
    }),
    learnFromFeedback: jest.fn().mockResolvedValue(undefined),
    distillMemory: jest.fn().mockResolvedValue(0),
    exportPatterns: jest.fn().mockResolvedValue([]),
    importPatterns: jest.fn().mockResolvedValue(undefined)
  };

  Object.assign(mock, config);
  return mock;
}

export const MockReasoningBankPresets = {
  success: () => createMockReasoningBank(),

  withPatterns: (patterns: Pattern[]) => createMockReasoningBank({
    searchPatterns: jest.fn().mockResolvedValue(patterns),
    exportPatterns: jest.fn().mockResolvedValue(patterns)
  }),

  withStats: (stats: PatternStats) => createMockReasoningBank({
    getPatternStats: jest.fn().mockResolvedValue(stats)
  }),

  error: (error = new Error('ReasoningBank error')) => createMockReasoningBank({
    initialize: jest.fn().mockRejectedValue(error),
    storePattern: jest.fn().mockRejectedValue(error),
    searchPatterns: jest.fn().mockRejectedValue(error)
  })
};

export const ReasoningBankContract = {
  initialize: 'function',
  storePattern: 'function',
  searchPatterns: 'function',
  getPatternStats: 'function',
  learnFromFeedback: 'function',
  distillMemory: 'function',
  exportPatterns: 'function',
  importPatterns: 'function'
};
