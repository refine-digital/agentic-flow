/**
 * Unit tests for AgentDBWrapper
 *
 * Following London School TDD:
 * - Test interactions between objects
 * - Mock all dependencies
 * - Focus on behavior verification
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { AgentDB } from 'agentdb';
import type { RuVectorCore } from '@ruvector/gnn';
import type { AttentionService } from '@ruvector/attention';

// Import types
import type {
  AgentDBConfig,
  VectorEntry,
  VectorSearchOptions,
  VectorSearchResult,
  MemoryInsertOptions,
  MemoryUpdateOptions,
  MemoryDeleteOptions,
  MemoryGetOptions,
  AgentDBStats,
  BatchInsertResult,
  ValidationError,
  DatabaseError,
  IndexError,
} from '../../../src/types/agentdb.js';

// Mock types for AgentDB and dependencies
interface MockAgentDB {
  initialize: ReturnType<typeof vi.fn>;
  getController: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  database: any;
}

interface MockReflexionMemory {
  store: ReturnType<typeof vi.fn>;
  retrieve: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
}

interface MockEmbedder {
  embed: ReturnType<typeof vi.fn>;
  initialize: ReturnType<typeof vi.fn>;
}

interface MockVectorBackend {
  insert: ReturnType<typeof vi.fn>;
  search: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  getStats: ReturnType<typeof vi.fn>;
}

// Helper to create mock AgentDB
function createMockAgentDB(): MockAgentDB {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    getController: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
    database: {
      prepare: vi.fn(),
      exec: vi.fn(),
    },
  };
}

// Helper to create mock ReflexionMemory
function createMockReflexionMemory(): MockReflexionMemory {
  return {
    store: vi.fn().mockResolvedValue({ id: 'test-id' }),
    retrieve: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(true),
    delete: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockResolvedValue(null),
  };
}

// Helper to create mock Embedder
function createMockEmbedder(): MockEmbedder {
  return {
    embed: vi.fn().mockResolvedValue(new Float32Array(384)),
    initialize: vi.fn().mockResolvedValue(undefined),
  };
}

// Helper to create mock VectorBackend
function createMockVectorBackend(): MockVectorBackend {
  return {
    insert: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(undefined),
    getStats: vi.fn().mockResolvedValue({
      vectorCount: 0,
      dimension: 384,
    }),
  };
}

// Import the class to test (will be implemented later)
let AgentDBWrapper: any;

describe('AgentDBWrapper', () => {
  let wrapper: any;
  let mockAgentDB: MockAgentDB;
  let mockReflexion: MockReflexionMemory;
  let mockEmbedder: MockEmbedder;
  let mockVectorBackend: MockVectorBackend;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mocks
    mockAgentDB = createMockAgentDB();
    mockReflexion = createMockReflexionMemory();
    mockEmbedder = createMockEmbedder();
    mockVectorBackend = createMockVectorBackend();

    // Configure AgentDB to return reflexion controller
    mockAgentDB.getController.mockReturnValue(mockReflexion);

    // Dynamically import wrapper (will fail initially - TDD)
    try {
      const module = await import('../../../src/core/agentdb-wrapper.js');
      AgentDBWrapper = module.AgentDBWrapper;

      // Inject mocks
      wrapper = new AgentDBWrapper({
        dbPath: ':memory:',
        dimension: 384,
        autoInit: false,
      });
      wrapper._agentDB = mockAgentDB;
      wrapper._embedder = mockEmbedder;
      wrapper._vectorBackend = mockVectorBackend;
    } catch (error) {
      // Expected to fail in TDD - tests written first
      console.log('AgentDBWrapper not yet implemented');
    }
  });

  afterEach(async () => {
    if (wrapper && wrapper.close) {
      await wrapper.close();
    }
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      expect(() => {
        new AgentDBWrapper();
      }).not.toThrow();
    });

    it('should create instance with custom config', () => {
      const config: AgentDBConfig = {
        dbPath: '/tmp/test.db',
        namespace: 'test',
        dimension: 768,
        hnswConfig: {
          M: 32,
          efConstruction: 400,
        },
      };

      expect(() => {
        new AgentDBWrapper(config);
      }).not.toThrow();
    });

    it('should not auto-initialize if autoInit is false', () => {
      const wrapper = new AgentDBWrapper({ autoInit: false });
      expect(mockAgentDB.initialize).not.toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('should initialize AgentDB instance', async () => {
      await wrapper.initialize();
      expect(mockAgentDB.initialize).toHaveBeenCalledTimes(1);
    });

    it('should initialize embedder', async () => {
      await wrapper.initialize();
      expect(mockEmbedder.initialize).toHaveBeenCalledTimes(1);
    });

    it('should only initialize once', async () => {
      await wrapper.initialize();
      await wrapper.initialize();
      expect(mockAgentDB.initialize).toHaveBeenCalledTimes(1);
    });

    it('should throw error if initialization fails', async () => {
      mockAgentDB.initialize.mockRejectedValueOnce(new Error('Init failed'));
      await expect(wrapper.initialize()).rejects.toThrow('Init failed');
    });
  });

  describe('insert', () => {
    beforeEach(async () => {
      await wrapper.initialize();
    });

    it('should insert vector with metadata', async () => {
      const vector = new Float32Array(384);
      const metadata = { key: 'value', type: 'test' };

      await wrapper.insert({ vector, metadata });

      expect(mockReflexion.store).toHaveBeenCalledWith(
        expect.objectContaining({
          vector,
          metadata,
        })
      );
    });

    it('should generate ID if not provided', async () => {
      const vector = new Float32Array(384);

      const result = await wrapper.insert({ vector, metadata: {} });

      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    it('should use provided ID', async () => {
      const vector = new Float32Array(384);
      const customId = 'custom-123';

      await wrapper.insert({ vector, metadata: {}, id: customId });

      expect(mockReflexion.store).toHaveBeenCalledWith(
        expect.objectContaining({
          id: customId,
        })
      );
    });

    it('should validate vector dimension', async () => {
      const invalidVector = new Float32Array(128); // Wrong dimension

      await expect(
        wrapper.insert({ vector: invalidVector, metadata: {} })
      ).rejects.toThrow('Invalid vector dimension');
    });

    it('should add timestamp if not provided', async () => {
      const vector = new Float32Array(384);

      await wrapper.insert({ vector, metadata: {} });

      expect(mockReflexion.store).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            timestamp: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('vectorSearch', () => {
    beforeEach(async () => {
      await wrapper.initialize();
    });

    it('should search with cosine similarity by default', async () => {
      const query = new Float32Array(384);
      mockReflexion.retrieve.mockResolvedValueOnce([
        { id: '1', score: 0.95, metadata: {} },
        { id: '2', score: 0.87, metadata: {} },
      ]);

      const results = await wrapper.vectorSearch(query, { k: 2 });

      expect(mockReflexion.retrieve).toHaveBeenCalledWith(
        query,
        expect.objectContaining({
          metric: 'cosine',
          k: 2,
        })
      );
      expect(results).toHaveLength(2);
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it('should support different distance metrics', async () => {
      const query = new Float32Array(384);
      const metrics: Array<'cosine' | 'euclidean' | 'dot'> = [
        'cosine',
        'euclidean',
        'dot',
      ];

      for (const metric of metrics) {
        await wrapper.vectorSearch(query, { k: 5, metric });

        expect(mockReflexion.retrieve).toHaveBeenCalledWith(
          query,
          expect.objectContaining({
            metric,
          })
        );
      }
    });

    it('should apply metadata filters', async () => {
      const query = new Float32Array(384);
      const filter = { type: 'test', status: 'active' };

      await wrapper.vectorSearch(query, { k: 10, filter });

      expect(mockReflexion.retrieve).toHaveBeenCalledWith(
        query,
        expect.objectContaining({
          filter,
        })
      );
    });

    it('should include vectors if requested', async () => {
      const query = new Float32Array(384);
      mockReflexion.retrieve.mockResolvedValueOnce([
        {
          id: '1',
          score: 0.95,
          metadata: {},
          vector: new Float32Array(384),
        },
      ]);

      const results = await wrapper.vectorSearch(query, {
        k: 1,
        includeVectors: true,
      });

      expect(results[0]).toHaveProperty('vector');
      expect(results[0].vector).toBeInstanceOf(Float32Array);
    });

    it('should validate query vector dimension', async () => {
      const invalidQuery = new Float32Array(128);

      await expect(
        wrapper.vectorSearch(invalidQuery, { k: 10 })
      ).rejects.toThrow('Invalid query vector dimension');
    });

    it('should return empty array if no matches', async () => {
      const query = new Float32Array(384);
      mockReflexion.retrieve.mockResolvedValueOnce([]);

      const results = await wrapper.vectorSearch(query, { k: 10 });

      expect(results).toEqual([]);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await wrapper.initialize();
    });

    it('should update vector and metadata', async () => {
      const id = 'test-123';
      const newVector = new Float32Array(384);
      const newMetadata = { updated: true };

      await wrapper.update({ id, vector: newVector, metadata: newMetadata });

      expect(mockReflexion.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          vector: newVector,
          metadata: newMetadata,
        })
      );
    });

    it('should update metadata only', async () => {
      const id = 'test-123';
      const newMetadata = { key: 'newValue' };

      await wrapper.update({ id, metadata: newMetadata });

      expect(mockReflexion.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          metadata: newMetadata,
        })
      );
      expect(mockReflexion.update).toHaveBeenCalledWith(
        id,
        expect.not.objectContaining({
          vector: expect.anything(),
        })
      );
    });

    it('should throw error if ID not found', async () => {
      mockReflexion.update.mockResolvedValueOnce(false);

      await expect(
        wrapper.update({ id: 'nonexistent', metadata: {} })
      ).rejects.toThrow('Vector not found');
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await wrapper.initialize();
    });

    it('should delete vector by ID', async () => {
      const id = 'test-123';
      mockReflexion.delete.mockResolvedValueOnce(true);

      const result = await wrapper.delete({ id });

      expect(mockReflexion.delete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('should return false if ID not found', async () => {
      mockReflexion.delete.mockResolvedValueOnce(false);

      const result = await wrapper.delete({ id: 'nonexistent' });

      expect(result).toBe(false);
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      await wrapper.initialize();
    });

    it('should retrieve vector by ID', async () => {
      const id = 'test-123';
      const mockEntry = {
        id,
        vector: new Float32Array(384),
        metadata: { key: 'value' },
      };
      mockReflexion.get.mockResolvedValueOnce(mockEntry);

      const result = await wrapper.get({ id, includeVector: true });

      expect(mockReflexion.get).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockEntry);
    });

    it('should exclude vector if not requested', async () => {
      const id = 'test-123';
      mockReflexion.get.mockResolvedValueOnce({
        id,
        metadata: { key: 'value' },
      });

      const result = await wrapper.get({ id, includeVector: false });

      expect(result).not.toHaveProperty('vector');
    });

    it('should return null if ID not found', async () => {
      mockReflexion.get.mockResolvedValueOnce(null);

      const result = await wrapper.get({ id: 'nonexistent' });

      expect(result).toBeNull();
    });
  });

  describe('batchInsert', () => {
    beforeEach(async () => {
      await wrapper.initialize();
    });

    it('should insert multiple vectors', async () => {
      const entries = [
        { vector: new Float32Array(384), metadata: { index: 0 } },
        { vector: new Float32Array(384), metadata: { index: 1 } },
        { vector: new Float32Array(384), metadata: { index: 2 } },
      ];

      const result = await wrapper.batchInsert(entries);

      expect(result.inserted).toBe(3);
      expect(result.failed).toHaveLength(0);
      expect(mockReflexion.store).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      const entries = [
        { vector: new Float32Array(384), metadata: { index: 0 } },
        { vector: new Float32Array(128), metadata: { index: 1 } }, // Invalid
        { vector: new Float32Array(384), metadata: { index: 2 } },
      ];

      mockReflexion.store
        .mockResolvedValueOnce({ id: 'id-0' })
        .mockRejectedValueOnce(new Error('Invalid dimension'))
        .mockResolvedValueOnce({ id: 'id-2' });

      const result = await wrapper.batchInsert(entries);

      expect(result.inserted).toBe(2);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].index).toBe(1);
    });

    it('should measure batch duration', async () => {
      const entries = [
        { vector: new Float32Array(384), metadata: {} },
        { vector: new Float32Array(384), metadata: {} },
      ];

      const result = await wrapper.batchInsert(entries);

      expect(result).toHaveProperty('duration');
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      await wrapper.initialize();
    });

    it('should return database statistics', async () => {
      mockVectorBackend.getStats.mockResolvedValueOnce({
        vectorCount: 1000,
        dimension: 384,
        databaseSize: 1024000,
        hnswStats: {
          M: 16,
          efConstruction: 200,
          efSearch: 100,
          levels: 5,
        },
      });

      const stats = await wrapper.getStats();

      expect(stats.vectorCount).toBe(1000);
      expect(stats.dimension).toBe(384);
      expect(stats).toHaveProperty('hnswStats');
    });
  });

  describe('close', () => {
    it('should close AgentDB connection', async () => {
      await wrapper.initialize();
      await wrapper.close();

      expect(mockAgentDB.close).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple close calls gracefully', async () => {
      await wrapper.initialize();
      await wrapper.close();
      await wrapper.close();

      expect(mockAgentDB.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await wrapper.initialize();
    });

    it('should throw ValidationError for invalid inputs', async () => {
      const invalidVector = new Float32Array(100);

      await expect(
        wrapper.insert({ vector: invalidVector, metadata: {} })
      ).rejects.toThrow('ValidationError');
    });

    it('should throw DatabaseError for storage failures', async () => {
      mockReflexion.store.mockRejectedValueOnce(new Error('DB write failed'));

      await expect(
        wrapper.insert({ vector: new Float32Array(384), metadata: {} })
      ).rejects.toThrow();
    });
  });
});
