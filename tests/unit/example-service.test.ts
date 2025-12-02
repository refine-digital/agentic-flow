/**
 * Example Unit Test - London School TDD Demonstration
 *
 * This test demonstrates London School principles applied to AgentDB v2
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createMockAgentDB } from '@mocks/MockAgentDB';
import { createMockRuVectorCore } from '@mocks/MockRuVectorCore';
import { createMockAttentionService } from '@mocks/MockAttentionService';

/**
 * Example service that we're testing
 * This would normally be imported from the actual source
 */
class MemoryService {
  constructor(
    private agentDB: any,
    private vectorCore: any,
    private attention: any
  ) {}

  async storeWithAttention(
    sessionId: string,
    content: string,
    context: string[]
  ): Promise<{ memoryId: string; attentionScore: number }> {
    // Generate embedding
    const embedding = await this.generateEmbedding(content);

    // Compute attention over context
    const contextEmbeddings = await Promise.all(
      context.map(c => this.generateEmbedding(c))
    );

    const attentionResult = await this.attention.computeAttention(
      embedding,
      contextEmbeddings,
      contextEmbeddings
    );

    // Store in AgentDB
    const memoryId = `mem-${Date.now()}`;
    await this.agentDB.storeMemory(sessionId, content, {
      embedding,
      attentionScore: attentionResult.weights[0] || 0
    });

    return {
      memoryId,
      attentionScore: attentionResult.weights[0] || 0
    };
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Simplified for example
    return Array(384).fill(0).map(() => Math.random());
  }
}

describe('MemoryService (London School Example)', () => {
  let mockAgentDB: ReturnType<typeof createMockAgentDB>;
  let mockVectorCore: ReturnType<typeof createMockRuVectorCore>;
  let mockAttention: ReturnType<typeof createMockAttentionService>;
  let memoryService: MemoryService;

  beforeEach(() => {
    // Create fresh mocks for each test
    mockAgentDB = createMockAgentDB();
    mockVectorCore = createMockRuVectorCore();
    mockAttention = createMockAttentionService();

    // Initialize system under test with mocks
    memoryService = new MemoryService(mockAgentDB, mockVectorCore, mockAttention);
  });

  describe('when storing memory with attention', () => {
    it('should coordinate dependencies in correct order', async () => {
      // Arrange
      const sessionId = 'session-001';
      const content = 'Important memory to store';
      const context = ['context 1', 'context 2'];

      mockAttention.computeAttention.mockResolvedValue({
        output: [],
        weights: [0.85, 0.15],
        scores: [0.85, 0.15]
      });

      // Act
      const result = await memoryService.storeWithAttention(
        sessionId,
        content,
        context
      );

      // Assert - London School: Focus on interactions
      expect(mockAttention.computeAttention).toHaveBeenCalledWith(
        expect.any(Array), // query embedding
        expect.arrayContaining([
          expect.any(Array), // context embeddings
          expect.any(Array)
        ]),
        expect.arrayContaining([
          expect.any(Array),
          expect.any(Array)
        ])
      );

      expect(mockAgentDB.storeMemory).toHaveBeenCalledWith(
        sessionId,
        content,
        expect.objectContaining({
          embedding: expect.any(Array),
          attentionScore: 0.85
        })
      );

      // Verify call order - attention before storage
      expect(mockAttention.computeAttention).toHaveBeenCalledBefore(
        mockAgentDB.storeMemory
      );

      // Verify result
      expect(result.attentionScore).toBe(0.85);
      expect(result.memoryId).toMatch(/^mem-\d+$/);
    });

    it('should handle attention computation errors', async () => {
      // Arrange
      const error = new Error('Attention computation failed');
      mockAttention.computeAttention.mockRejectedValue(error);

      // Act & Assert
      await expect(
        memoryService.storeWithAttention('session-001', 'content', ['context'])
      ).rejects.toThrow('Attention computation failed');

      // Verify error handling behavior
      expect(mockAttention.computeAttention).toHaveBeenCalled();
      expect(mockAgentDB.storeMemory).not.toHaveBeenCalled();
    });

    it('should handle missing attention weights gracefully', async () => {
      // Arrange
      mockAttention.computeAttention.mockResolvedValue({
        output: [],
        weights: [], // No weights returned
        scores: []
      });

      // Act
      const result = await memoryService.storeWithAttention(
        'session-001',
        'content',
        ['context']
      );

      // Assert
      expect(result.attentionScore).toBe(0); // Default value
      expect(mockAgentDB.storeMemory).toHaveBeenCalledWith(
        'session-001',
        'content',
        expect.objectContaining({
          attentionScore: 0
        })
      );
    });
  });

  describe('collaboration patterns', () => {
    it('should demonstrate proper mock usage for complex workflows', async () => {
      // Arrange - Set up multiple mock behaviors
      mockAttention.computeAttention
        .mockResolvedValueOnce({
          output: [],
          weights: [0.9, 0.1],
          scores: [0.9, 0.1]
        })
        .mockResolvedValueOnce({
          output: [],
          weights: [0.7, 0.3],
          scores: [0.7, 0.3]
        });

      // Act - Multiple operations
      const result1 = await memoryService.storeWithAttention(
        'session-001',
        'first memory',
        ['context 1']
      );

      const result2 = await memoryService.storeWithAttention(
        'session-001',
        'second memory',
        ['context 2']
      );

      // Assert - Verify both operations
      expect(mockAttention.computeAttention).toHaveBeenCalledTimes(2);
      expect(mockAgentDB.storeMemory).toHaveBeenCalledTimes(2);

      expect(result1.attentionScore).toBe(0.9);
      expect(result2.attentionScore).toBe(0.7);

      // Verify each call had correct parameters
      const storeMemoryCalls = mockAgentDB.storeMemory.mock.calls;
      expect(storeMemoryCalls[0][1]).toBe('first memory');
      expect(storeMemoryCalls[1][1]).toBe('second memory');
    });
  });

  describe('contract verification', () => {
    it('should satisfy expected service interface', () => {
      // Verify the service has required methods
      expect(typeof memoryService.storeWithAttention).toBe('function');
    });

    it('should verify mock contracts are satisfied', () => {
      // London School: Verify mocks implement expected contracts
      expect(mockAgentDB).toSatisfyContract({
        storeMemory: 'function',
        recallMemory: 'function'
      });

      expect(mockAttention).toSatisfyContract({
        computeAttention: 'function',
        initialize: 'function'
      });
    });
  });
});
