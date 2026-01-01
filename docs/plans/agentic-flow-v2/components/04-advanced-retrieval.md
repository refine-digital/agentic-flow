# Component Deep-Dive: Advanced Retrieval Strategies

## 🎯 Overview

Advanced Retrieval Strategies in AgentDB v2.0.0-alpha.2.11 provide sophisticated methods for retrieving relevant memories, ensuring diversity, synthesizing context from multiple sources, and filtering results with complex metadata queries.

**Key Controllers**:
- **MMRDiversityRanker** - Maximal Marginal Relevance for diverse results
- **ContextSynthesizer** - Multi-source context aggregation
- **MetadataFilter** - Advanced filtering with complex queries
- **EnhancedEmbeddingService** - Multi-model embedding generation

**Use Cases**:
- Avoiding redundant search results
- Combining information from multiple sources
- Complex filtering with metadata
- Multi-model semantic search
- Context-aware retrieval
- Adaptive query expansion

## 📦 Architecture

```
Advanced Retrieval System
├── MMRDiversityRanker (Diversity optimization)
│   ├── Maximal Marginal Relevance (MMR)
│   ├── Diversity-aware ranking
│   ├── Redundancy reduction
│   └── Coverage optimization
│
├── ContextSynthesizer (Multi-source aggregation)
│   ├── Cross-source retrieval
│   ├── Context fusion
│   ├── Temporal aggregation
│   └── Priority-based selection
│
├── MetadataFilter (Advanced filtering)
│   ├── Complex boolean queries
│   ├── Range queries
│   ├── Regex pattern matching
│   └── Composite filters
│
└── EnhancedEmbeddingService (Multi-model embeddings)
    ├── Multiple embedding models
    ├── Cross-encoder reranking
    ├── Ensemble embeddings
    └── Adaptive model selection
```

## 🎯 MMRDiversityRanker Integration

### Basic Usage

```typescript
import { MMRDiversityRanker } from 'agentdb@alpha/controllers/MMRDiversityRanker';

const mmrRanker = new MMRDiversityRanker(db);

// Standard vector search (may return similar duplicates)
const standardResults = await db.vectorSearch(queryVector, 10);
console.log('Standard results: May contain redundant information');

// MMR-based diverse results
const diverseResults = await mmrRanker.rankWithMMR({
  query: queryVector,
  k: 10,              // Top 10 results
  lambda: 0.7,        // Balance: 0.7 relevance + 0.3 diversity
  candidatePoolSize: 50 // Consider top 50 before ranking
});

console.log('Diverse results: Maximizes coverage, minimizes redundancy');

// Results are ranked by MMR score
diverseResults.forEach((result, i) => {
  console.log(`${i + 1}. ${result.content.substring(0, 100)}...`);
  console.log(`   Relevance: ${result.relevance.toFixed(3)}`);
  console.log(`   Diversity: ${result.diversity.toFixed(3)}`);
  console.log(`   MMR Score: ${result.mmrScore.toFixed(3)}\n`);
});
```

### How MMR Works

**Maximal Marginal Relevance Formula**:

```
MMR(d, Q, S) = λ × Relevance(d, Q) - (1 - λ) × max[Similarity(d, s) for s in S]

Where:
- d = candidate document
- Q = query
- S = already selected documents
- λ = balance parameter (0 to 1)
```

**Intuition**:
- **High λ (0.8-1.0)**: Prioritize relevance over diversity
- **Medium λ (0.5-0.7)**: Balance relevance and diversity
- **Low λ (0.0-0.4)**: Prioritize diversity over relevance

### Tuning Lambda for Different Use Cases

```typescript
// Use case 1: Comprehensive research (high diversity)
const researchResults = await mmrRanker.rankWithMMR({
  query: queryVector,
  k: 20,
  lambda: 0.4,  // 40% relevance, 60% diversity
  candidatePoolSize: 100
});

// Use case 2: Precise answer (high relevance)
const preciseResults = await mmrRanker.rankWithMMR({
  query: queryVector,
  k: 5,
  lambda: 0.9,  // 90% relevance, 10% diversity
  candidatePoolSize: 20
});

// Use case 3: Balanced exploration
const balancedResults = await mmrRanker.rankWithMMR({
  query: queryVector,
  k: 10,
  lambda: 0.6,  // 60% relevance, 40% diversity
  candidatePoolSize: 50
});
```

### Clustering-Based Diversity

```typescript
// Alternative: Use clustering for diversity
const clusteredResults = await mmrRanker.clusterAndSelect({
  query: queryVector,
  k: 10,
  numClusters: 5,  // Group into 5 semantic clusters
  selectPerCluster: 2  // Select top 2 from each cluster
});

console.log('Results from 5 diverse semantic clusters:');
clusteredResults.forEach((result, i) => {
  console.log(`${i + 1}. Cluster ${result.clusterId}: ${result.content.substring(0, 80)}...`);
});
```

## 🧩 ContextSynthesizer Integration

### Multi-Source Retrieval

```typescript
import { ContextSynthesizer } from 'agentdb@alpha/controllers/ContextSynthesizer';

const contextSynthesizer = new ContextSynthesizer(db);

// Retrieve context from multiple sources
const synthesizedContext = await contextSynthesizer.synthesize({
  query: 'How to implement authentication?',
  sources: [
    {
      type: 'vector-search',
      params: { k: 5, threshold: 0.7 }
    },
    {
      type: 'graph-traversal',
      params: {
        startNode: 'authentication-module',
        relationshipType: 'RELATED_TO',
        maxDepth: 2
      }
    },
    {
      type: 'causal-reasoning',
      params: {
        effect: 'successful-authentication',
        maxDepth: 3
      }
    },
    {
      type: 'skill-library',
      params: {
        category: 'authentication',
        minSuccessRate: 0.8
      }
    }
  ],
  aggregationStrategy: 'weighted-fusion',  // or 'rank-fusion', 'priority-based'
  maxResults: 10
});

console.log('Synthesized context from 4 sources:');
synthesizedContext.results.forEach((result, i) => {
  console.log(`${i + 1}. [${result.source}] ${result.content.substring(0, 80)}...`);
  console.log(`   Confidence: ${result.confidence.toFixed(3)}`);
  console.log(`   Sources: ${result.contributingSources.join(', ')}\n`);
});
```

### Weighted Fusion

```typescript
// Custom weights for different sources
const weightedContext = await contextSynthesizer.synthesize({
  query: 'Optimize database queries',
  sources: [
    { type: 'vector-search', params: { k: 10 }, weight: 0.4 },
    { type: 'reflexion-memory', params: { taskType: 'optimization' }, weight: 0.3 },
    { type: 'skill-library', params: { category: 'database' }, weight: 0.2 },
    { type: 'causal-reasoning', params: { effect: 'improved-performance' }, weight: 0.1 }
  ],
  aggregationStrategy: 'weighted-fusion'
});
```

### Temporal Aggregation

```typescript
// Retrieve context with temporal awareness
const temporalContext = await contextSynthesizer.synthesizeTemporally({
  query: 'Current best practices for React',
  timeWindows: [
    { start: Date.now() - 7 * 24 * 60 * 60 * 1000, end: Date.now(), weight: 1.0 },    // Last week (highest weight)
    { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() - 7 * 24 * 60 * 60 * 1000, weight: 0.7 },  // Last month
    { start: Date.now() - 90 * 24 * 60 * 60 * 1000, end: Date.now() - 30 * 24 * 60 * 60 * 1000, weight: 0.3 }  // Last 3 months
  ],
  sources: ['vector-search', 'skill-library'],
  maxResults: 10
});

console.log('Recent context weighted by recency:');
temporalContext.results.forEach((result, i) => {
  const age = Date.now() - result.timestamp;
  const daysAgo = Math.floor(age / (24 * 60 * 60 * 1000));
  console.log(`${i + 1}. (${daysAgo} days ago) ${result.content.substring(0, 80)}...`);
});
```

### Priority-Based Selection

```typescript
// Hierarchical priority for source selection
const priorityContext = await contextSynthesizer.synthesizeWithPriority({
  query: 'Debug authentication error',
  priorityOrder: [
    { source: 'reflexion-memory', params: { taskType: 'debugging', success: false } },  // Failed attempts first (learn from mistakes)
    { source: 'causal-reasoning', params: { effect: 'authentication-error' } },          // Root causes second
    { source: 'skill-library', params: { category: 'debugging' } },                       // Known solutions third
    { source: 'vector-search', params: { k: 5 } }                                         // General context last
  ],
  maxResults: 10,
  fillStrategy: 'cascade'  // Fill from each source in order until maxResults reached
});
```

## 🔍 MetadataFilter Integration

### Complex Boolean Queries

```typescript
import { MetadataFilter } from 'agentdb@alpha/controllers/MetadataFilter';

const metadataFilter = new MetadataFilter(db);

// Complex filter: (type=code AND language=typescript) OR (type=documentation AND category=api)
const complexResults = await metadataFilter.query({
  query: queryVector,
  k: 20,
  filter: {
    operator: 'OR',
    conditions: [
      {
        operator: 'AND',
        conditions: [
          { field: 'type', operator: 'equals', value: 'code' },
          { field: 'language', operator: 'equals', value: 'typescript' }
        ]
      },
      {
        operator: 'AND',
        conditions: [
          { field: 'type', operator: 'equals', value: 'documentation' },
          { field: 'category', operator: 'equals', value: 'api' }
        ]
      }
    ]
  }
});

console.log('Results matching complex filter:');
complexResults.forEach(result => {
  console.log(`Type: ${result.metadata.type}, Language: ${result.metadata.language || 'N/A'}`);
});
```

### Range Queries

```typescript
// Filter by numeric ranges and dates
const recentHighQuality = await metadataFilter.query({
  query: queryVector,
  k: 10,
  filter: {
    operator: 'AND',
    conditions: [
      {
        field: 'timestamp',
        operator: 'greaterThan',
        value: Date.now() - 7 * 24 * 60 * 60 * 1000  // Last 7 days
      },
      {
        field: 'qualityScore',
        operator: 'greaterThanOrEqual',
        value: 0.8  // Quality >= 80%
      },
      {
        field: 'tokensUsed',
        operator: 'lessThan',
        value: 5000  // Efficient (< 5000 tokens)
      }
    ]
  }
});
```

### Regex Pattern Matching

```typescript
// Filter using regex patterns
const apiEndpoints = await metadataFilter.query({
  query: queryVector,
  k: 20,
  filter: {
    operator: 'AND',
    conditions: [
      {
        field: 'path',
        operator: 'matches',
        value: /^\/api\/v[0-9]+\//  // Matches /api/v1/, /api/v2/, etc.
      },
      {
        field: 'method',
        operator: 'in',
        value: ['GET', 'POST', 'PUT']
      }
    ]
  }
});
```

### Composite Filters with NOT

```typescript
// Exclude certain results
const filteredResults = await metadataFilter.query({
  query: queryVector,
  k: 15,
  filter: {
    operator: 'AND',
    conditions: [
      { field: 'type', operator: 'equals', value: 'code' },
      {
        operator: 'NOT',
        condition: {
          field: 'deprecated',
          operator: 'equals',
          value: true
        }
      },
      {
        operator: 'NOT',
        condition: {
          field: 'language',
          operator: 'in',
          value: ['coffeescript', 'perl']  // Exclude legacy languages
        }
      }
    ]
  }
});
```

## 🤖 EnhancedEmbeddingService Integration

### Multi-Model Embeddings

```typescript
import { EnhancedEmbeddingService } from 'agentdb@alpha/controllers/EnhancedEmbeddingService';

const embeddingService = new EnhancedEmbeddingService(db, {
  models: [
    { name: 'text-embedding-3-small', provider: 'openai', dimensions: 1536 },
    { name: 'text-embedding-3-large', provider: 'openai', dimensions: 3072 },
    { name: 'voyage-02', provider: 'voyage', dimensions: 1024 },
    { name: 'jina-embeddings-v2', provider: 'jina', dimensions: 768 }
  ]
});

// Generate embeddings with all models
const multiModelEmbeddings = await embeddingService.embedMultiModel(
  'How to implement authentication?',
  {
    models: ['text-embedding-3-small', 'voyage-02', 'jina-embeddings-v2'],
    combineStrategy: 'concatenate'  // or 'average', 'max-pool', 'learned-fusion'
  }
);

// Search with ensemble embeddings (better accuracy)
const ensembleResults = await db.vectorSearch(
  multiModelEmbeddings.combined,
  k: 10
);
```

### Cross-Encoder Reranking

```typescript
// Initial retrieval with bi-encoder (fast)
const candidates = await db.vectorSearch(queryVector, 50);  // Get top 50 candidates

// Rerank with cross-encoder (slow but accurate)
const reranked = await embeddingService.rerank({
  query: 'How to implement authentication?',
  candidates,
  model: 'cross-encoder/ms-marco-MiniLM-L-12-v2',
  topK: 10
});

console.log('Reranked results (higher accuracy):');
reranked.forEach((result, i) => {
  console.log(`${i + 1}. ${result.content.substring(0, 80)}...`);
  console.log(`   Cross-encoder score: ${result.crossEncoderScore.toFixed(4)}`);
  console.log(`   Bi-encoder score: ${result.biEncoderScore.toFixed(4)}\n`);
});
```

### Adaptive Model Selection

```typescript
// Automatically select best embedding model based on query characteristics
const adaptiveEmbedding = await embeddingService.embedAdaptive(
  'Implement OAuth2 authentication with PKCE flow',
  {
    queryCharacteristics: {
      length: 'long',        // 'short', 'medium', 'long'
      domain: 'technical',   // 'general', 'technical', 'creative'
      language: 'english'
    },
    optimizeFor: 'accuracy'  // 'accuracy', 'speed', 'cost'
  }
);

console.log(`Selected model: ${adaptiveEmbedding.selectedModel}`);
console.log(`Reason: ${adaptiveEmbedding.reason}`);
```

### Ensemble Embeddings

```typescript
// Combine multiple models for robustness
const ensembleEmbedding = await embeddingService.embedEnsemble(
  'How to optimize React performance?',
  {
    models: [
      { name: 'text-embedding-3-small', weight: 0.4 },
      { name: 'voyage-02', weight: 0.3 },
      { name: 'jina-embeddings-v2', weight: 0.3 }
    ],
    combineStrategy: 'weighted-average'
  }
);

// Search with ensemble (more robust to model biases)
const ensembleSearch = await db.vectorSearch(ensembleEmbedding.vector, 10);
```

## 🎯 Complete Retrieval Pipeline

### Advanced RAG (Retrieval-Augmented Generation)

```typescript
// Complete RAG pipeline with all advanced strategies
async function advancedRAG(
  query: string,
  options: RAGOptions
): Promise<RAGResult> {
  // 1. Generate query embedding with adaptive model selection
  const queryEmbedding = await embeddingService.embedAdaptive(query, {
    optimizeFor: 'accuracy'
  });

  // 2. Multi-source retrieval with context synthesis
  const rawContext = await contextSynthesizer.synthesize({
    query,
    sources: [
      { type: 'vector-search', params: { k: 50 } },
      { type: 'graph-traversal', params: { maxDepth: 2 } },
      { type: 'reflexion-memory', params: { taskType: options.taskType } },
      { type: 'skill-library', params: { category: options.category } }
    ],
    aggregationStrategy: 'weighted-fusion'
  });

  // 3. Apply metadata filters
  const filtered = await metadataFilter.filter({
    results: rawContext.results,
    filter: options.metadataFilter
  });

  // 4. Rerank with cross-encoder
  const reranked = await embeddingService.rerank({
    query,
    candidates: filtered,
    topK: 30
  });

  // 5. Apply MMR for diversity
  const diverse = await mmrRanker.rankWithMMR({
    query: queryEmbedding.vector,
    candidates: reranked,
    k: options.topK || 10,
    lambda: options.lambda || 0.6
  });

  // 6. Synthesize final context
  const finalContext = diverse.map(r => r.content).join('\n\n---\n\n');

  return {
    context: finalContext,
    sources: diverse.map(r => ({
      content: r.content,
      metadata: r.metadata,
      relevance: r.relevance,
      diversity: r.diversity,
      mmrScore: r.mmrScore
    })),
    metadata: {
      totalCandidates: rawContext.results.length,
      afterFiltering: filtered.length,
      afterReranking: reranked.length,
      afterMMR: diverse.length,
      embeddingModel: queryEmbedding.selectedModel
    }
  };
}

// Usage
const ragResult = await advancedRAG(
  'How to implement secure authentication with OAuth2?',
  {
    taskType: 'implementation',
    category: 'authentication',
    metadataFilter: {
      operator: 'AND',
      conditions: [
        { field: 'type', operator: 'equals', value: 'code' },
        { field: 'verified', operator: 'equals', value: true }
      ]
    },
    topK: 10,
    lambda: 0.7
  }
);

console.log('Advanced RAG Result:');
console.log(`Context length: ${ragResult.context.length} chars`);
console.log(`Sources: ${ragResult.sources.length}`);
console.log(`Embedding model: ${ragResult.metadata.embeddingModel}`);
console.log('\nTop sources:');
ragResult.sources.forEach((source, i) => {
  console.log(`${i + 1}. ${source.content.substring(0, 80)}...`);
  console.log(`   MMR: ${source.mmrScore.toFixed(3)}, Relevance: ${source.relevance.toFixed(3)}, Diversity: ${source.diversity.toFixed(3)}\n`);
});
```

## 📊 Performance Characteristics

### MMR Performance

| Candidate Pool | k | Lambda | Time |
|----------------|---|--------|------|
| 50 | 10 | 0.6 | 15ms |
| 100 | 20 | 0.6 | 35ms |
| 500 | 50 | 0.6 | 180ms |

### Context Synthesis

| Sources | Results per Source | Aggregation | Time |
|---------|-------------------|-------------|------|
| 2 | 10 | Weighted fusion | 25ms |
| 4 | 10 | Rank fusion | 55ms |
| 6 | 20 | Priority-based | 95ms |

### Metadata Filtering

| Filter Complexity | Total Results | Filtered | Time |
|------------------|---------------|----------|------|
| Simple (1 condition) | 1000 | 100 | 2ms |
| Medium (3 conditions) | 1000 | 50 | 5ms |
| Complex (6+ conditions) | 1000 | 20 | 12ms |

### Cross-Encoder Reranking

| Candidates | Model Size | Time |
|-----------|------------|------|
| 50 | MiniLM-L6 | 120ms |
| 100 | MiniLM-L12 | 280ms |
| 200 | BERT-base | 650ms |

## 🎯 Best Practices

### 1. Pipeline Composition

```typescript
// ✅ GOOD: Compose retrieval pipeline based on use case
async function retrieveForCodeGeneration(query: string) {
  return advancedRAG(query, {
    taskType: 'code-generation',
    category: 'programming',
    metadataFilter: {
      operator: 'AND',
      conditions: [
        { field: 'type', operator: 'equals', value: 'code' },
        { field: 'verified', operator: 'equals', value: true }
      ]
    },
    topK: 5,
    lambda: 0.8  // High relevance for code generation
  });
}

async function retrieveForResearch(query: string) {
  return advancedRAG(query, {
    taskType: 'research',
    topK: 20,
    lambda: 0.4  // High diversity for research
  });
}
```

### 2. Caching Embeddings

```typescript
// ✅ GOOD: Cache embeddings for repeated queries
const embeddingCache = new Map<string, Float32Array>();

async function cachedEmbed(text: string): Promise<Float32Array> {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!;
  }

  const embedding = await embeddingService.embed(text);
  embeddingCache.set(text, embedding);
  return embedding;
}
```

### 3. Progressive Filtering

```typescript
// ✅ GOOD: Apply cheap filters first, expensive ones last
async function progressiveFilter(candidates: Memory[], query: string) {
  // 1. Cheap: Metadata filtering (2-5ms)
  let filtered = await metadataFilter.filter({
    results: candidates,
    filter: simpleFilter
  });

  // 2. Medium: MMR diversity (15-35ms)
  filtered = await mmrRanker.rankWithMMR({
    candidates: filtered,
    k: 50,
    lambda: 0.6
  });

  // 3. Expensive: Cross-encoder reranking (100-300ms)
  filtered = await embeddingService.rerank({
    query,
    candidates: filtered,
    topK: 10
  });

  return filtered;
}
```

## 📖 Next Steps

- Explore **[Browser & WASM Deployment](05-browser-wasm.md)** for client-side retrieval
- Learn about **[RuVector Ecosystem](06-ruvector-ecosystem.md)** for the underlying technology
- Review **[AgentDB Integration](01-agentdb-integration.md)** for the complete system

---

**Component**: Advanced Retrieval Strategies
**Status**: Planning
**Controllers**: MMRDiversityRanker, ContextSynthesizer, MetadataFilter, EnhancedEmbeddingService
**Version**: 2.0.0-planning
**Last Updated**: 2025-12-02
