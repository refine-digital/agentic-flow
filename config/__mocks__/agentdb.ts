/**
 * Mock agentdb module for testing
 */

export const mockDb = {
  insert: jest.fn().mockResolvedValue({ id: 'vec-123', status: 'inserted' }),
  search: jest.fn().mockResolvedValue([
    {
      id: 'vec-1',
      distance: 0.15,
      metadata: {
        quality: 0.92,
        context: { task: 'code-review' },
        timestamp: Date.now()
      }
    },
    {
      id: 'vec-2',
      distance: 0.22,
      metadata: {
        quality: 0.88,
        context: { task: 'refactoring' },
        timestamp: Date.now()
      }
    }
  ]),
  stats: jest.fn().mockResolvedValue({
    totalVectors: 1000,
    indexedVectors: 950,
    memoryUsage: '12.5MB'
  }),
  close: jest.fn().mockResolvedValue(undefined)
};

export default {
  open: jest.fn().mockResolvedValue(mockDb)
};
