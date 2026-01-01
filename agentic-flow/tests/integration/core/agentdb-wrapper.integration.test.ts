/**
 * Integration tests for AgentDBWrapper
 *
 * Tests with real AgentDB instance (no mocks)
 * Validates end-to-end functionality
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { AgentDBWrapper } from '../../../src/core/agentdb-wrapper.js';
import type {
  VectorSearchOptions,
  MemoryInsertOptions,
} from '../../../src/types/agentdb.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB_PATH = path.join(__dirname, 'test-agentdb.db');

describe('AgentDBWrapper Integration Tests', () => {
  let wrapper: AgentDBWrapper;

  beforeAll(() => {
    // Clean up any existing test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  beforeEach(async () => {
    // Create fresh in-memory database for each test
    wrapper = new AgentDBWrapper({
      dbPath: ':memory:',
      dimension: 384,
      hnswConfig: {
        M: 16,
        efConstruction: 200,
        efSearch: 100,
      },
      autoInit: false,
    });

    await wrapper.initialize();
  });

  afterAll(async () => {
    if (wrapper) {
      await wrapper.close();
    }

    // Clean up test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getRawInstance).toBeDefined();
    });

    it('should handle multiple initialization calls', async () => {
      await wrapper.initialize();
      await wrapper.initialize();
      // Should not throw
    });
  });

  describe('vector operations', () => {
    it('should insert and retrieve a vector', async () => {
      // Create a test vector
      const vector = new Float32Array(384);
      for (let i = 0; i < 384; i++) {
        vector[i] = Math.random();
      }

      const metadata = {
        type: 'test',
        category: 'integration',
        value: 42,
      };

      // Insert
      const { id, timestamp } = await wrapper.insert({ vector, metadata });

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(timestamp).toBeGreaterThan(0);

      // Retrieve
      const result = await wrapper.get({ id, includeVector: true });

      expect(result).toBeDefined();
      expect(result!.id).toBe(id);
      expect(result!.vector).toBeInstanceOf(Float32Array);
      expect(result!.metadata).toMatchObject(metadata);
    });

    it('should search for similar vectors', async () => {
      // Insert multiple vectors
      const vectors: Float32Array[] = [];
      const ids: string[] = [];

      for (let i = 0; i < 10; i++) {
        const vector = new Float32Array(384);
        for (let j = 0; j < 384; j++) {
          vector[j] = Math.random();
        }
        vectors.push(vector);

        const { id } = await wrapper.insert({
          vector,
          metadata: { index: i, type: 'test' },
        });
        ids.push(id);
      }

      // Search with first vector as query
      const queryVector = vectors[0];
      const results = await wrapper.vectorSearch(queryVector, { k: 5 });

      expect(results).toBeDefined();
      expect(results.length).toBeLessThanOrEqual(5);
      expect(results.length).toBeGreaterThan(0);

      // First result should be the query vector itself
      expect(results[0].id).toBe(ids[0]);
      expect(results[0].score).toBeGreaterThan(0.99); // Cosine similarity ~1.0

      // Results should be sorted by score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should update vector metadata', async () => {
      const vector = new Float32Array(384).fill(0.5);
      const metadata = { status: 'draft', version: 1 };

      const { id } = await wrapper.insert({ vector, metadata });

      // Update metadata
      const newMetadata = { status: 'published', version: 2 };
      await wrapper.update({ id, metadata: newMetadata });

      // Retrieve and verify
      const result = await wrapper.get({ id });
      expect(result!.metadata).toMatchObject(newMetadata);
    });

    it('should delete a vector', async () => {
      const vector = new Float32Array(384).fill(0.5);
      const { id } = await wrapper.insert({ vector, metadata: {} });

      // Delete
      const deleted = await wrapper.delete({ id });
      expect(deleted).toBe(true);

      // Verify deletion
      const result = await wrapper.get({ id });
      expect(result).toBeNull();
    });
  });

  describe('batch operations', () => {
    it('should insert multiple vectors efficiently', async () => {
      const entries: MemoryInsertOptions[] = [];

      for (let i = 0; i < 100; i++) {
        const vector = new Float32Array(384);
        for (let j = 0; j < 384; j++) {
          vector[j] = Math.random();
        }

        entries.push({
          vector,
          metadata: { index: i, batch: 'test' },
        });
      }

      const result = await wrapper.batchInsert(entries);

      expect(result.inserted).toBe(100);
      expect(result.failed).toHaveLength(0);
      expect(result.duration).toBeGreaterThan(0);

      console.log(`Batch insert of 100 vectors took ${result.duration}ms`);
      console.log(`Average: ${(result.duration / 100).toFixed(2)}ms per vector`);
    });

    it('should handle batch insert failures gracefully', async () => {
      const entries: MemoryInsertOptions[] = [
        {
          vector: new Float32Array(384).fill(0.1),
          metadata: { index: 0 },
        },
        {
          vector: new Float32Array(128).fill(0.2), // Invalid dimension
          metadata: { index: 1 },
        },
        {
          vector: new Float32Array(384).fill(0.3),
          metadata: { index: 2 },
        },
      ];

      const result = await wrapper.batchInsert(entries);

      expect(result.inserted).toBe(2);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].index).toBe(1);
    });
  });

  describe('search with filters', () => {
    beforeEach(async () => {
      // Insert test data with different metadata
      const categories = ['A', 'B', 'C'];
      const statuses = ['active', 'inactive'];

      for (let i = 0; i < 30; i++) {
        const vector = new Float32Array(384);
        for (let j = 0; j < 384; j++) {
          vector[j] = Math.random();
        }

        await wrapper.insert({
          vector,
          metadata: {
            category: categories[i % 3],
            status: statuses[i % 2],
            value: i,
          },
        });
      }
    });

    it('should filter by metadata during search', async () => {
      const queryVector = new Float32Array(384).fill(0.5);

      const results = await wrapper.vectorSearch(queryVector, {
        k: 10,
        filter: { category: 'A', status: 'active' },
      });

      expect(results).toBeDefined();
      results.forEach((result) => {
        expect(result.metadata?.category).toBe('A');
        expect(result.metadata?.status).toBe('active');
      });
    });
  });

  describe('different distance metrics', () => {
    it('should search with cosine similarity', async () => {
      const vector = new Float32Array(384).fill(1.0);
      await wrapper.insert({ vector, metadata: { type: 'unit' } });

      const queryVector = new Float32Array(384).fill(0.9);
      const results = await wrapper.vectorSearch(queryVector, {
        k: 1,
        metric: 'cosine',
      });

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should search with euclidean distance', async () => {
      const vector = new Float32Array(384).fill(1.0);
      await wrapper.insert({ vector, metadata: { type: 'unit' } });

      const queryVector = new Float32Array(384).fill(0.9);
      const results = await wrapper.vectorSearch(queryVector, {
        k: 1,
        metric: 'euclidean',
      });

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search with dot product', async () => {
      const vector = new Float32Array(384).fill(1.0);
      await wrapper.insert({ vector, metadata: { type: 'unit' } });

      const queryVector = new Float32Array(384).fill(0.9);
      const results = await wrapper.vectorSearch(queryVector, {
        k: 1,
        metric: 'dot',
      });

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('statistics and monitoring', () => {
    it('should return accurate database statistics', async () => {
      // Insert some vectors
      for (let i = 0; i < 50; i++) {
        const vector = new Float32Array(384);
        for (let j = 0; j < 384; j++) {
          vector[j] = Math.random();
        }
        await wrapper.insert({ vector, metadata: { index: i } });
      }

      const stats = await wrapper.getStats();

      expect(stats.vectorCount).toBeGreaterThanOrEqual(50);
      expect(stats.dimension).toBe(384);
      expect(stats).toHaveProperty('databaseSize');

      if (stats.hnswStats) {
        expect(stats.hnswStats.M).toBeDefined();
        expect(stats.hnswStats.efConstruction).toBeDefined();
      }

      console.log('Database stats:', stats);
    });
  });

  describe('performance benchmarks', () => {
    it('should demonstrate HNSW performance', async () => {
      console.log('\n=== HNSW Performance Benchmark ===');

      // Insert 1000 vectors
      const insertStart = Date.now();
      for (let i = 0; i < 1000; i++) {
        const vector = new Float32Array(384);
        for (let j = 0; j < 384; j++) {
          vector[j] = Math.random();
        }
        await wrapper.insert({ vector, metadata: { index: i } });
      }
      const insertDuration = Date.now() - insertStart;
      console.log(`Insert 1000 vectors: ${insertDuration}ms`);
      console.log(`Average insert: ${(insertDuration / 1000).toFixed(2)}ms`);

      // Search benchmark
      const queryVector = new Float32Array(384);
      for (let j = 0; j < 384; j++) {
        queryVector[j] = Math.random();
      }

      const searchStart = Date.now();
      const results = await wrapper.vectorSearch(queryVector, { k: 10 });
      const searchDuration = Date.now() - searchStart;

      console.log(`Search k=10: ${searchDuration}ms`);
      console.log(`Results: ${results.length} vectors found`);
      console.log('================================\n');

      expect(results.length).toBeLessThanOrEqual(10);
      expect(searchDuration).toBeLessThan(1000); // Should be sub-second
    }, 30000); // 30 second timeout for benchmark
  });

  describe('error handling', () => {
    it('should reject invalid vector dimensions', async () => {
      const invalidVector = new Float32Array(128); // Wrong dimension

      await expect(
        wrapper.insert({ vector: invalidVector, metadata: {} })
      ).rejects.toThrow('Invalid vector dimension');
    });

    it('should handle non-existent vector retrieval', async () => {
      const result = await wrapper.get({ id: 'non-existent-id' });
      expect(result).toBeNull();
    });

    it('should handle non-existent vector update', async () => {
      await expect(
        wrapper.update({ id: 'non-existent-id', metadata: {} })
      ).rejects.toThrow();
    });

    it('should return false for non-existent deletion', async () => {
      const result = await wrapper.delete({ id: 'non-existent-id' });
      expect(result).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should persist data to disk', async () => {
      // Create wrapper with file-based storage
      const persistentWrapper = new AgentDBWrapper({
        dbPath: TEST_DB_PATH,
        dimension: 384,
        autoInit: false,
      });

      await persistentWrapper.initialize();

      // Insert data
      const vector = new Float32Array(384).fill(0.5);
      const { id } = await persistentWrapper.insert({
        vector,
        metadata: { type: 'persistent' },
      });

      await persistentWrapper.close();

      // Reopen database
      const newWrapper = new AgentDBWrapper({
        dbPath: TEST_DB_PATH,
        dimension: 384,
        autoInit: false,
      });

      await newWrapper.initialize();

      // Retrieve data
      const result = await newWrapper.get({ id, includeVector: true });

      expect(result).toBeDefined();
      expect(result!.id).toBe(id);
      expect(result!.metadata?.type).toBe('persistent');

      await newWrapper.close();
    });
  });
});
