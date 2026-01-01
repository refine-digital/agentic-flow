/**
 * MockSkillLibrary - London School Mock Factory
 *
 * Mock implementation for Skill Library with semantic search
 */

import { jest } from '@jest/globals';

export interface SkillLibraryInterface {
  initialize(): Promise<void>;
  registerSkill(name: string, code: string, metadata: SkillMetadata): Promise<void>;
  searchSkills(query: string, k?: number, filters?: SkillFilters): Promise<Skill[]>;
  getSkill(name: string): Promise<Skill | null>;
  updateSkill(name: string, updates: Partial<Skill>): Promise<void>;
  deleteSkill(name: string): Promise<void>;
  analyzeSkillUsage(name: string): Promise<SkillUsageStats>;
  suggestSkills(context: string, k?: number): Promise<Skill[]>;
}

export interface SkillMetadata {
  description: string;
  tags: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  dependencies?: string[];
  version?: string;
}

export interface Skill {
  name: string;
  code: string;
  metadata: SkillMetadata;
  usageCount: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillFilters {
  tags?: string[];
  complexity?: string[];
  minSuccessRate?: number;
}

export interface SkillUsageStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageExecutionTime: number;
  lastUsed: Date;
}

/**
 * Creates a mock SkillLibrary instance
 */
export function createMockSkillLibrary(config: Partial<SkillLibraryInterface> = {}): jest.Mocked<SkillLibraryInterface> {
  const mock: jest.Mocked<SkillLibraryInterface> = {
    initialize: jest.fn().mockResolvedValue(undefined),
    registerSkill: jest.fn().mockResolvedValue(undefined),
    searchSkills: jest.fn().mockResolvedValue([]),
    getSkill: jest.fn().mockResolvedValue(null),
    updateSkill: jest.fn().mockResolvedValue(undefined),
    deleteSkill: jest.fn().mockResolvedValue(undefined),
    analyzeSkillUsage: jest.fn().mockResolvedValue({
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageExecutionTime: 0,
      lastUsed: new Date()
    }),
    suggestSkills: jest.fn().mockResolvedValue([])
  };

  Object.assign(mock, config);
  return mock;
}

export const MockSkillLibraryPresets = {
  success: () => createMockSkillLibrary(),

  withSkills: (skills: Skill[]) => createMockSkillLibrary({
    searchSkills: jest.fn().mockResolvedValue(skills),
    suggestSkills: jest.fn().mockResolvedValue(skills)
  }),

  withSkill: (skill: Skill) => createMockSkillLibrary({
    getSkill: jest.fn().mockResolvedValue(skill)
  }),

  error: (error = new Error('SkillLibrary error')) => createMockSkillLibrary({
    registerSkill: jest.fn().mockRejectedValue(error),
    searchSkills: jest.fn().mockRejectedValue(error)
  })
};

export const SkillLibraryContract = {
  initialize: 'function',
  registerSkill: 'function',
  searchSkills: 'function',
  getSkill: 'function',
  updateSkill: 'function',
  deleteSkill: 'function',
  analyzeSkillUsage: 'function',
  suggestSkills: 'function'
};
