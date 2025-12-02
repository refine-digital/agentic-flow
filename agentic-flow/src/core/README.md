# AgentDB Wrapper

Clean, TypeScript-first API wrapper for AgentDB v2.0.0-alpha.2.11 with HNSW vector indexing, memory operations, and comprehensive type safety.

## Features

- 🚀 **HNSW Indexing**: O(log n) vector search with configurable parameters
- 💾 **Memory Operations**: Insert, search, update, delete with full CRUD support
- 🔒 **Type Safety**: Complete TypeScript definitions for all operations
- ⚡ **Performance**: 150x-12,500x faster than traditional vector databases
- 🎯 **Validation**: Built-in input validation and error handling
- 📊 **Monitoring**: Database statistics and performance metrics
- 🧪 **Tested**: >85% code coverage with unit and integration tests

## Installation

```bash
npm install agentdb@alpha @ruvector/gnn@latest @ruvector/attention@latest
```

## Quick Start

```typescript
import { AgentDBWrapper } from './src/core/agentdb-wrapper.js';

// Create wrapper instance
const wrapper = new AgentDBWrapper({
  dbPath: ':memory:', // or file path for persistence
  dimension: 384,
  hnswConfig: {
    M: 16,
    efConstruction: 200,
    efSearch: 100,
  },
});

// Initialize
await wrapper.initialize();

// Insert a vector
const vector = new Float32Array(384);
// ... populate vector with embeddings
const { id } = await wrapper.insert({
  vector,
  metadata: {
    type: 'document',
    title: 'My Document',
    tags: ['ai', 'ml'],
  },
});

// Search for similar vectors
const queryVector = new Float32Array(384);
// ... populate query vector
const results = await wrapper.vectorSearch(queryVector, {
  k: 10,
  metric: 'cosine',
  filter: { type: 'document' },
});

console.log(`Found ${results.length} similar vectors`);
results.forEach((result) => {
  console.log(`ID: ${result.id}, Score: ${result.score.toFixed(4)}`);
});

// Clean up
await wrapper.close();
```

## API Reference

### Constructor

```typescript
new AgentDBWrapper(config?: AgentDBConfig)
```

**Configuration Options:**

```typescript
interface AgentDBConfig {
  dbPath?: string; // Default: ':memory:'
  namespace?: string; // Default: 'default'
  dimension?: number; // Default: 384
  hnswConfig?: {
    M?: number; // Default: 16
    efConstruction?: number; // Default: 200
    efSearch?: number; // Default: 100
  };
  enableAttention?: boolean; // Default: false
  attentionConfig?: {
    type?: 'multi-head' | 'flash' | 'linear' | 'hyperbolic' | 'moe' | 'graph-rope';
    numHeads?: number;
    headDim?: number;
  };
  autoInit?: boolean; // Default: true
}
```

### Methods

#### `initialize(): Promise<void>`

Initialize the AgentDB instance and all dependencies.

```typescript
await wrapper.initialize();
```

#### `insert(options: MemoryInsertOptions): Promise<{ id: string; timestamp: number }>`

Insert a vector with metadata.

```typescript
const { id, timestamp } = await wrapper.insert({
  vector: new Float32Array(384),
  metadata: { type: 'test', value: 42 },
  id: 'optional-custom-id', // Auto-generated if not provided
  namespace: 'custom-namespace', // Optional
});
```

#### `vectorSearch(query: Float32Array, options?: VectorSearchOptions): Promise<VectorSearchResult[]>`

Search for similar vectors using HNSW indexing.

```typescript
const results = await wrapper.vectorSearch(queryVector, {
  k: 10, // Number of results
  metric: 'cosine', // 'cosine' | 'euclidean' | 'dot' | 'manhattan'
  filter: { type: 'document' }, // Metadata filters
  includeVectors: false, // Include vector data in results
  hnswParams: {
    efSearch: 100, // HNSW search parameter
  },
});
```

#### `update(options: MemoryUpdateOptions): Promise<boolean>`

Update a vector's data and/or metadata.

```typescript
await wrapper.update({
  id: 'vector-id',
  vector: new Float32Array(384), // Optional
  metadata: { status: 'updated' }, // Optional
});
```

#### `delete(options: MemoryDeleteOptions): Promise<boolean>`

Delete a vector by ID.

```typescript
const deleted = await wrapper.delete({ id: 'vector-id' });
```

#### `get(options: MemoryGetOptions): Promise<VectorEntry | null>`

Retrieve a vector by ID.

```typescript
const entry = await wrapper.get({
  id: 'vector-id',
  includeVector: true, // Include vector data
});

if (entry) {
  console.log(entry.id, entry.metadata);
}
```

#### `batchInsert(entries: MemoryInsertOptions[]): Promise<BatchInsertResult>`

Insert multiple vectors efficiently.

```typescript
const entries = [
  { vector: new Float32Array(384), metadata: { index: 0 } },
  { vector: new Float32Array(384), metadata: { index: 1 } },
  // ... more entries
];

const result = await wrapper.batchInsert(entries);
console.log(`Inserted: ${result.inserted}, Failed: ${result.failed.length}`);
console.log(`Duration: ${result.duration}ms`);
```

#### `getStats(): Promise<AgentDBStats>`

Get database statistics and metrics.

```typescript
const stats = await wrapper.getStats();
console.log(`Vectors: ${stats.vectorCount}`);
console.log(`Dimension: ${stats.dimension}`);
console.log(`Database size: ${stats.databaseSize} bytes`);
console.log(`HNSW config:`, stats.hnswStats);
```

#### `close(): Promise<void>`

Close the database connection.

```typescript
await wrapper.close();
```

#### `getRawInstance(): AgentDB`

Get the underlying AgentDB instance for advanced operations.

```typescript
const agentDB = wrapper.getRawInstance();
// Use raw AgentDB API
```

## Type Definitions

### VectorEntry

```typescript
interface VectorEntry {
  id: string;
  vector: Float32Array;
  metadata?: Record<string, any>;
  timestamp?: number;
}
```

### VectorSearchResult

```typescript
interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
  vector?: Float32Array;
}
```

### BatchInsertResult

```typescript
interface BatchInsertResult {
  inserted: number;
  failed: Array<{
    index: number;
    id?: string;
    error: string;
  }>;
  duration: number;
}
```

### AgentDBStats

```typescript
interface AgentDBStats {
  vectorCount: number;
  dimension: number;
  databaseSize: number;
  hnswStats?: {
    M: number;
    efConstruction: number;
    efSearch: number;
    levels: number;
  };
  memoryUsage?: number;
  indexBuildTime?: number;
}
```

## Error Handling

The wrapper provides specialized error types:

```typescript
import {
  AgentDBError,
  ValidationError,
  DatabaseError,
  IndexError,
} from '../types/agentdb.js';

try {
  await wrapper.insert({ vector, metadata });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof DatabaseError) {
    console.error('Database error:', error.message);
  } else if (error instanceof IndexError) {
    console.error('Index error:', error.message);
  }
}
```

## Performance Tuning

### HNSW Parameters

- **M**: Number of bi-directional links per element (default: 16)
  - Higher M = better recall, more memory, slower construction
  - Recommended: 12-48

- **efConstruction**: Size of dynamic candidate list during construction (default: 200)
  - Higher efConstruction = better recall, slower construction
  - Recommended: 100-500

- **efSearch**: Size of dynamic candidate list during search (default: 100)
  - Higher efSearch = better recall, slower search
  - Recommended: 50-500

```typescript
const wrapper = new AgentDBWrapper({
  hnswConfig: {
    M: 32, // Better recall
    efConstruction: 400, // Better index quality
    efSearch: 200, // Better search quality
  },
});
```

### Distance Metrics

- **cosine**: Cosine similarity (default) - best for normalized embeddings
- **euclidean**: Euclidean distance - best for raw feature vectors
- **dot**: Dot product - fast but sensitive to magnitude
- **manhattan**: Manhattan distance - good for sparse vectors

## Examples

### Document Search

```typescript
import { AgentDBWrapper } from './src/core/agentdb-wrapper.js';

const wrapper = new AgentDBWrapper({
  dimension: 768, // BERT embeddings
});

await wrapper.initialize();

// Index documents
const documents = [
  { text: 'Machine learning basics', embedding: new Float32Array(768) },
  { text: 'Deep neural networks', embedding: new Float32Array(768) },
  // ... more documents
];

for (const doc of documents) {
  await wrapper.insert({
    vector: doc.embedding,
    metadata: { text: doc.text, type: 'document' },
  });
}

// Search
const query = 'artificial intelligence';
const queryEmbedding = await getEmbedding(query); // Your embedding function

const results = await wrapper.vectorSearch(queryEmbedding, {
  k: 5,
  metric: 'cosine',
});

console.log('Top 5 similar documents:');
results.forEach((result, i) => {
  console.log(`${i + 1}. ${result.metadata?.text} (score: ${result.score.toFixed(4)})`);
});
```

### Persistent Storage

```typescript
const wrapper = new AgentDBWrapper({
  dbPath: './data/vectors.db',
  dimension: 384,
});

await wrapper.initialize();

// Data persists across restarts
await wrapper.insert({ vector, metadata });

await wrapper.close();

// Later...
const newWrapper = new AgentDBWrapper({
  dbPath: './data/vectors.db',
  dimension: 384,
});

await newWrapper.initialize();
// Previous data is available
```

### Filtered Search

```typescript
// Insert vectors with rich metadata
await wrapper.insert({
  vector,
  metadata: {
    type: 'article',
    category: 'technology',
    author: 'John Doe',
    published: '2025-01-01',
    tags: ['ai', 'ml', 'neural-networks'],
  },
});

// Search with filters
const results = await wrapper.vectorSearch(queryVector, {
  k: 10,
  filter: {
    type: 'article',
    category: 'technology',
    // Only vectors matching these filters will be returned
  },
});
```

## Testing

### Run Unit Tests (London School TDD)

```bash
npm test -- tests/unit/core/agentdb-wrapper.test.ts
```

### Run Integration Tests

```bash
npm test -- tests/integration/core/agentdb-wrapper.integration.test.ts
```

### Run All Tests

```bash
npm test
```

## Performance Benchmarks

Based on integration tests with 1000 vectors (384 dimensions):

- **Insert**: ~2-5ms per vector
- **Batch Insert**: ~3-7ms per vector (100 vectors)
- **Search (k=10)**: <100ms with HNSW indexing
- **Memory Usage**: ~4-32x reduction with quantization

## Architecture

```
AgentDBWrapper
├── AgentDB (v2.0.0-alpha.2.11)
│   ├── ReflexionMemory (episodic memory)
│   ├── SkillLibrary (skill storage)
│   ├── CausalMemoryGraph (causal reasoning)
│   └── EmbeddingService (Xenova/transformers)
├── RuVector (@ruvector/gnn)
│   ├── HNSW Index
│   ├── Vector Backend
│   └── Graph Neural Network
└── Attention (@ruvector/attention)
    ├── MultiHeadAttention
    ├── FlashAttention
    ├── HyperbolicAttention
    └── GraphRoPE
```

## Contributing

1. Write failing tests first (TDD)
2. Implement minimum code to pass
3. Refactor for clarity
4. Update documentation
5. Ensure >85% test coverage

## License

MIT

## Related

- [AgentDB GitHub](https://github.com/ruvnet/agentic-flow/tree/main/packages/agentdb)
- [RuVector GNN](https://www.npmjs.com/package/@ruvector/gnn)
- [RuVector Attention](https://www.npmjs.com/package/@ruvector/attention)
- [GitHub Issue #71](https://github.com/ruvnet/agentic-flow/issues/71) - Integration tracking
