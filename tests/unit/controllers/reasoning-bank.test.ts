/**
 * ReasoningBankController - Unit Tests (TDD London School)
 *
 * Tests the pattern storage and retrieval with AgentDB v2 integration
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ReasoningBankController } from '../../../src/controllers/reasoning-bank';
import type { AgentDBWrapper } from '../../../src/types/agentdb';

// Mock AgentDB
const createMockAgentDB = (): AgentDBWrapper => ({
  insert: vi.fn().mockResolvedValue({ id: 'pattern-1', success: true }),
  vectorSearch: vi.fn().mockResolvedValue([]),
  update: vi.fn().mockResolvedValue({ success: true }),
  delete: vi.fn().mockResolvedValue({ success: true }),
  query: vi.fn().mockResolvedValue([]),
  embed: vi.fn().mockResolvedValue(new Float32Array(384)),
  stats: vi.fn().mockResolvedValue({
    totalVectors: 0,
    dimensions: 384,
    indexType: 'hnsw'
  }),
  clearCache: vi.fn()
});

describe('ReasoningBankController', () => {
  let mockAgentDB: AgentDBWrapper;
  let controller: ReasoningBankController;

  beforeEach(() => {
    mockAgentDB = createMockAgentDB();
    controller = new ReasoningBankController(mockAgentDB);
  });

  describe('storePattern', () => {
    it('should store pattern with vector embedding', async () => {
      const pattern = {
        sessionId: 'session-1',
        task: 'Build REST API with authentication',
        input: 'Design API endpoints',
        output: 'Created 5 endpoints with JWT auth',
        reward: 0.95,
        success: true,
        critique: 'Good implementation, consider rate limiting'
      };

      await controller.storePattern(pattern);

      expect(mockAgentDB.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('Build REST API'),
          metadata: expect.objectContaining({
            sessionId: 'session-1',
            task: 'Build REST API with authentication',
            reward: 0.95,
            success: true,
            type: 'reasoning_pattern'
          }),
          embedding: expect.any(Float32Array)
        })
      );
    });

    it('should generate embedding from task description', async () => {
      const pattern = {
        sessionId: 'session-2',
        task: 'Implement caching layer',
        reward: 0.88,
        success: true
      };

      (mockAgentDB.embed as Mock).mockResolvedValue(new Float32Array(384).fill(0.5));

      await controller.storePattern(pattern);

      expect(mockAgentDB.embed).toHaveBeenCalledWith(
        expect.stringContaining('Implement caching layer')
      );
    });

    it('should handle pattern with failed attempt', async () => {
      const pattern = {
        sessionId: 'session-3',
        task: 'Database migration',
        reward: 0.2,
        success: false,
        critique: 'Failed due to missing rollback logic'
      };

      await controller.storePattern(pattern);

      expect(mockAgentDB.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            success: false,
            reward: 0.2
          })
        })
      );
    });

    it('should include optional fields when provided', async () => {
      const pattern = {
        sessionId: 'session-4',
        task: 'API optimization',
        input: 'Slow response times',
        output: 'Reduced latency by 60%',
        reward: 0.92,
        success: true,
        tokensUsed: 1500,
        latencyMs: 2300,
        critique: 'Excellent optimization with caching'
      };

      await controller.storePattern(pattern);

      expect(mockAgentDB.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            tokensUsed: 1500,
            latencyMs: 2300,
            critique: 'Excellent optimization with caching'
          })
        })
      );
    });
  });

  describe('searchPatterns', () => {
    it('should retrieve similar successful patterns', async () => {
      const mockResults = [
        {
          id: 'pattern-1',
          content: 'Build REST API',
          similarity: 0.95,
          metadata: {
            task: 'Build REST API with JWT',
            reward: 0.95,
            success: true,
            sessionId: 'session-1'
          }
        },
        {
          id: 'pattern-2',
          content: 'Create API endpoints',
          similarity: 0.89,
          metadata: {
            task: 'Create REST endpoints',
            reward: 0.89,
            success: true,
            sessionId: 'session-2'
          }
        }
      ];

      (mockAgentDB.vectorSearch as Mock).mockResolvedValue(mockResults);
      (mockAgentDB.embed as Mock).mockResolvedValue(new Float32Array(384));

      const patterns = await controller.searchPatterns('Build REST API', 5);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].reward).toBeGreaterThan(0.8);
      expect(patterns[0].success).toBe(true);
    });

    it('should filter by minimum reward threshold', async () => {
      const mockResults = [
        {
          id: 'pattern-1',
          similarity: 0.95,
          metadata: { task: 'Task A', reward: 0.95, success: true }
        },
        {
          id: 'pattern-2',
          similarity: 0.90,
          metadata: { task: 'Task B', reward: 0.60, success: true }
        }
      ];

      (mockAgentDB.vectorSearch as Mock).mockResolvedValue(mockResults);

      const patterns = await controller.searchPatterns('Test task', 5, { minReward: 0.8 });

      expect(patterns.every(p => p.reward >= 0.8)).toBe(true);
    });

    it('should retrieve only successful patterns when requested', async () => {
      const mockResults = [
        {
          id: 'pattern-1',
          similarity: 0.95,
          metadata: { task: 'Task A', reward: 0.95, success: true }
        },
        {
          id: 'pattern-2',
          similarity: 0.90,
          metadata: { task: 'Task B', reward: 0.30, success: false }
        }
      ];

      (mockAgentDB.vectorSearch as Mock).mockResolvedValue(mockResults);

      const patterns = await controller.searchPatterns('Test task', 5, { onlySuccesses: true });

      expect(patterns.every(p => p.success)).toBe(true);
    });

    it('should retrieve only failures when requested for learning', async () => {
      const mockResults = [
        {
          id: 'pattern-1',
          similarity: 0.85,
          metadata: { task: 'Task A', reward: 0.20, success: false, critique: 'Missing validation' }
        },
        {
          id: 'pattern-2',
          similarity: 0.80,
          metadata: { task: 'Task B', reward: 0.15, success: false, critique: 'No error handling' }
        }
      ];

      (mockAgentDB.vectorSearch as Mock).mockResolvedValue(mockResults);

      const patterns = await controller.searchPatterns('Test task', 5, { onlyFailures: true });

      expect(patterns.every(p => !p.success)).toBe(true);
      expect(patterns.every(p => p.critique)).toBeTruthy();
    });

    it('should use custom k value for result limit', async () => {
      (mockAgentDB.embed as Mock).mockResolvedValue(new Float32Array(384));

      await controller.searchPatterns('Test task', 3);

      expect(mockAgentDB.vectorSearch).toHaveBeenCalledWith(
        expect.any(Float32Array),
        3,
        expect.any(Object)
      );
    });
  });

  describe('getPatternStats', () => {
    it('should return aggregated statistics for task patterns', async () => {
      const mockResults = [
        {
          id: 'pattern-1',
          similarity: 0.95,
          metadata: { task: 'API implementation', reward: 0.95, success: true }
        },
        {
          id: 'pattern-2',
          similarity: 0.90,
          metadata: { task: 'API testing', reward: 0.88, success: true }
        },
        {
          id: 'pattern-3',
          similarity: 0.85,
          metadata: { task: 'API deployment', reward: 0.30, success: false }
        }
      ];

      (mockAgentDB.vectorSearch as Mock).mockResolvedValue(mockResults);

      const stats = await controller.getPatternStats('API development', 5);

      expect(stats).toEqual(
        expect.objectContaining({
          totalAttempts: expect.any(Number),
          successRate: expect.any(Number),
          avgReward: expect.any(Number),
          recentPatterns: expect.any(Array)
        })
      );

      expect(stats.successRate).toBeGreaterThan(0);
      expect(stats.avgReward).toBeGreaterThan(0);
    });

    it('should include critique summary from patterns', async () => {
      const mockResults = [
        {
          id: 'pattern-1',
          metadata: {
            task: 'Test',
            reward: 0.95,
            success: true,
            critique: 'Great implementation'
          }
        }
      ];

      (mockAgentDB.vectorSearch as Mock).mockResolvedValue(mockResults);

      const stats = await controller.getPatternStats('Test task', 5);

      expect(stats.critiques).toBeDefined();
      expect(stats.critiques.length).toBeGreaterThan(0);
    });
  });

  describe('clearCache', () => {
    it('should clear AgentDB query cache', async () => {
      await controller.clearCache();

      expect(mockAgentDB.clearCache).toHaveBeenCalled();
    });
  });

  describe('integration with AgentDB v2', () => {
    it('should leverage vector search for pattern matching', async () => {
      const task = 'Implement authentication system';
      (mockAgentDB.embed as Mock).mockResolvedValue(new Float32Array(384).fill(0.5));

      await controller.searchPatterns(task, 10);

      expect(mockAgentDB.embed).toHaveBeenCalled();
      expect(mockAgentDB.vectorSearch).toHaveBeenCalled();
    });

    it('should store patterns with proper metadata structure', async () => {
      const pattern = {
        sessionId: 'session-test',
        task: 'Test task',
        reward: 0.9,
        success: true
      };

      await controller.storePattern(pattern);

      const insertCall = (mockAgentDB.insert as Mock).mock.calls[0][0];

      expect(insertCall.metadata).toHaveProperty('sessionId');
      expect(insertCall.metadata).toHaveProperty('task');
      expect(insertCall.metadata).toHaveProperty('reward');
      expect(insertCall.metadata).toHaveProperty('success');
      expect(insertCall.metadata).toHaveProperty('type', 'reasoning_pattern');
    });
  });
});
