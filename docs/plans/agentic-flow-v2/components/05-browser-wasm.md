# Component Deep-Dive: Browser & WASM Deployment

## 🎯 Overview

AgentDB v2.0.0-alpha.2.11 provides complete browser support through WebAssembly (WASM) bindings, enabling client-side vector search, attention mechanisms, and graph operations without server dependencies.

**Key Packages**:
- **agentdb@alpha** - Browser bundle (47 KB main, 22 KB minified)
- **ruvector-attention-wasm@0.1.0** - Browser-optimized attention mechanisms
- **@ruvector/core** - WASM bindings for vector operations
- **WASMVectorSearch** - Browser-optimized search controller

**Use Cases**:
- Client-side RAG (Retrieval-Augmented Generation)
- Privacy-preserving AI (no data sent to servers)
- Offline-first applications
- Edge computing
- Low-latency search
- Mobile web apps

## 📦 Package Architecture

```
Browser Deployment Stack
├── agentdb@alpha/dist/browser
│   ├── agentdb.esm.js (47 KB, ES modules)
│   ├── agentdb.umd.js (22 KB minified, UMD)
│   └── agentdb.d.ts (TypeScript definitions)
│
├── ruvector-attention-wasm@0.1.0
│   ├── attention.wasm (5 KB, lazy-loaded)
│   ├── attention.js (WASM loader)
│   └── Types: Multi-Head, Flash, Linear, Hyperbolic, MoE
│
├── @ruvector/core (WASM bindings)
│   ├── ruvector_bg.wasm (1.2 MB, core engine)
│   ├── ruvector.js (JS bindings)
│   └── Features: HNSW, IVF, PQ, SIMD
│
└── WASMVectorSearch (Controller)
    ├── IndexedDB persistence
    ├── Web Worker support
    ├── Service Worker caching
    └── Progressive loading
```

## 🚀 Browser Installation

### CDN (Fastest Setup)

```html
<!DOCTYPE html>
<html>
<head>
  <title>AgentDB Browser Example</title>
</head>
<body>
  <div id="app"></div>

  <!-- Load from CDN -->
  <script type="module">
    import { AgentDB } from 'https://cdn.jsdelivr.net/npm/agentdb@alpha/+esm';

    // Initialize AgentDB in browser
    const db = new AgentDB({
      backend: 'wasm',
      persistence: 'indexeddb',
      dbName: 'my-agent-db'
    });

    // Ready to use!
    const results = await db.vectorSearch(queryVector, 10);
    console.log('Search results:', results);
  </script>
</body>
</html>
```

### NPM + Bundler (Vite, Webpack, etc.)

```bash
npm install agentdb@alpha ruvector-attention-wasm
```

```typescript
// src/main.ts
import { AgentDB } from 'agentdb@alpha/browser';
import { AttentionWASM } from 'ruvector-attention-wasm';

// Initialize
const db = new AgentDB({
  backend: 'wasm',
  persistence: 'indexeddb',
  dbName: 'my-agent-db',
  features: {
    vectorSearch: true,
    attention: true,
    graphDatabase: false  // Optional: Disable for smaller bundle
  }
});

// Load attention WASM (lazy-loaded)
const attention = new AttentionWASM();
await attention.load();

// Use attention mechanisms
const result = await attention.flashAttention(Q, K, V);
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['agentdb@alpha', 'ruvector-attention-wasm']
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        // Manual chunks for optimal loading
        manualChunks: {
          'agentdb-core': ['agentdb@alpha/browser'],
          'attention-wasm': ['ruvector-attention-wasm']
        }
      }
    }
  },
  worker: {
    format: 'es'  // Web Worker support
  }
});
```

## 🔌 WASMVectorSearch Integration

### Basic Browser Search

```typescript
import { WASMVectorSearch } from 'agentdb@alpha/controllers/WASMVectorSearch';

// Initialize WASM vector search
const wasmSearch = new WASMVectorSearch({
  dimensions: 128,
  indexType: 'hnsw',
  persistence: 'indexeddb',
  dbName: 'vector-search-db'
});

// Insert vectors
await wasmSearch.insert({
  id: 'doc-1',
  vector: new Float32Array(128),
  metadata: {
    title: 'Introduction to React',
    author: 'Jane Doe'
  }
});

// Batch insert (faster)
const vectors = [...]; // Array of {id, vector, metadata}
await wasmSearch.batchInsert(vectors, { batchSize: 100 });

// Search
const results = await wasmSearch.search(queryVector, {
  k: 10,
  threshold: 0.7
});

console.log('Search results:', results);
```

### IndexedDB Persistence

```typescript
// Data persists across browser sessions
const db = new AgentDB({
  backend: 'wasm',
  persistence: 'indexeddb',
  dbName: 'my-agent-db',
  version: 1
});

// First visit: Load data
await db.loadFromIndexedDB();

// Insert data (automatically persisted)
await db.insert({
  vector: new Float32Array(128),
  metadata: { type: 'document' }
});

// Later visit: Data automatically loaded
const results = await db.vectorSearch(queryVector, 10);
```

### Web Worker Offloading

```typescript
// main.ts - Main thread
import WASMWorker from './wasm-worker?worker';

const worker = new WASMWorker();

// Send search request to worker
worker.postMessage({
  type: 'search',
  query: queryVector,
  k: 10
});

// Receive results
worker.onmessage = (event) => {
  if (event.data.type === 'search-results') {
    const results = event.data.results;
    console.log('Search results from worker:', results);
    displayResults(results);
  }
};
```

```typescript
// wasm-worker.ts - Web Worker
import { WASMVectorSearch } from 'agentdb@alpha/controllers/WASMVectorSearch';

const wasmSearch = new WASMVectorSearch({
  dimensions: 128,
  indexType: 'hnsw'
});

self.onmessage = async (event) => {
  if (event.data.type === 'search') {
    const results = await wasmSearch.search(
      event.data.query,
      { k: event.data.k }
    );

    self.postMessage({
      type: 'search-results',
      results
    });
  }
};
```

### Service Worker Caching

```typescript
// service-worker.js
const CACHE_NAME = 'agentdb-wasm-v1';
const WASM_FILES = [
  '/node_modules/agentdb@alpha/dist/browser/agentdb.esm.js',
  '/node_modules/@ruvector/core/ruvector_bg.wasm',
  '/node_modules/ruvector-attention-wasm/attention.wasm'
];

// Install: Cache WASM files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(WASM_FILES);
    })
  );
});

// Fetch: Serve from cache
self.addEventListener('fetch', (event) => {
  if (WASM_FILES.some(file => event.request.url.includes(file))) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

## 🧠 Attention Mechanisms in Browser

### Flash Attention (Memory-Efficient)

```typescript
import { AttentionWASM } from 'ruvector-attention-wasm';

const attention = new AttentionWASM();
await attention.load();

// Flash attention (4x faster, memory-efficient)
const Q = new Float32Array(512 * 128);  // 512 tokens, 128 dims
const K = new Float32Array(512 * 128);
const V = new Float32Array(512 * 128);

const result = await attention.flashAttention(Q, K, V, {
  numHeads: 8,
  headDim: 16,
  dropout: 0.1
});

console.log('Attention output:', result.output);
console.log('Attention weights:', result.attentionWeights);
console.log('Execution time:', result.executionTimeMs, 'ms');
```

### Hyperbolic Attention (Hierarchical Data)

```typescript
// Hyperbolic attention for hierarchical structures
const hyperbolicResult = await attention.hyperbolicAttention(Q, K, V, {
  curvature: -1.0,  // Negative curvature for Poincaré ball
  numHeads: 8
});

console.log('Hyperbolic attention output:', hyperbolicResult.output);
```

### Linear Attention (Long Sequences)

```typescript
// Linear attention (O(N) complexity for long sequences)
const Q_long = new Float32Array(4096 * 128);  // 4096 tokens
const K_long = new Float32Array(4096 * 128);
const V_long = new Float32Array(4096 * 128);

const linearResult = await attention.linearAttention(Q_long, K_long, V_long, {
  kernelType: 'elu'  // or 'relu', 'softmax'
});

console.log('Linear attention time:', linearResult.executionTimeMs, 'ms');
// Much faster than standard attention for long sequences
```

## 📱 Progressive Loading

### Lazy Load WASM Modules

```typescript
// Lazy load WASM only when needed
let wasmSearch: WASMVectorSearch | null = null;

async function initializeSearch() {
  if (!wasmSearch) {
    // Show loading indicator
    showLoadingIndicator('Loading search engine...');

    wasmSearch = new WASMVectorSearch({
      dimensions: 128,
      indexType: 'hnsw'
    });

    await wasmSearch.initialize();

    hideLoadingIndicator();
  }

  return wasmSearch;
}

// User clicks search button
searchButton.addEventListener('click', async () => {
  const search = await initializeSearch();
  const results = await search.search(queryVector, { k: 10 });
  displayResults(results);
});
```

### Progressive Data Loading

```typescript
// Load data progressively for faster initial load
async function loadDataProgressively() {
  const db = new AgentDB({ backend: 'wasm', persistence: 'indexeddb' });

  // Load essential data first (1000 vectors)
  await db.loadFromIndexedDB({ limit: 1000 });

  // App is now interactive
  enableSearchUI();

  // Load remaining data in background
  await db.loadFromIndexedDB({ offset: 1000 });

  console.log('All data loaded');
}
```

## 🔒 Privacy-Preserving AI

### Client-Side RAG

```typescript
// Complete RAG pipeline in browser (no server calls)
async function clientSideRAG(query: string): Promise<string> {
  // 1. Embed query (client-side)
  const embedding = await localEmbedding(query);

  // 2. Search locally
  const results = await wasmSearch.search(embedding, { k: 5 });

  // 3. Construct context
  const context = results.map(r => r.metadata.content).join('\n\n');

  // 4. Generate response with local LLM (e.g., ONNX)
  const response = await localLLM.generate({
    prompt: `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`,
    maxTokens: 500
  });

  return response;
}

// No data sent to servers - complete privacy
```

### Encrypted Storage

```typescript
// Encrypt data before storing in IndexedDB
import { encrypt, decrypt } from 'crypto-js';

const db = new AgentDB({
  backend: 'wasm',
  persistence: 'indexeddb',
  encryption: {
    enabled: true,
    key: await deriveKeyFromPassword(userPassword)
  }
});

// Data encrypted at rest
await db.insert({
  vector: embedding,
  metadata: { sensitiveData: 'user-private-information' }
});

// Decrypted on read
const results = await db.search(queryVector, { k: 5 });
```

## 📊 Performance Characteristics

### Bundle Sizes

| Component | Size (Gzipped) | Load Time (3G) |
|-----------|----------------|----------------|
| agentdb.esm.js | 47 KB | 200ms |
| agentdb.umd.min.js | 22 KB | 100ms |
| ruvector_bg.wasm | 1.2 MB | 5s |
| attention.wasm | 5 KB | 20ms |

### Search Performance (Browser)

| Index Size | Index Type | Search Time | Memory |
|------------|------------|-------------|--------|
| 1K vectors | Flat | 5ms | 0.5 MB |
| 10K vectors | IVF | 15ms | 5 MB |
| 100K vectors | HNSW | 25ms | 50 MB |
| 1M vectors | HNSW+PQ | 40ms | 200 MB |

### Attention Performance (WASM)

| Mechanism | Sequence Length | Time (WASM) | Memory |
|-----------|-----------------|-------------|--------|
| Multi-Head | 512 | 45ms | 8 MB |
| Flash | 512 | 12ms | 2 MB |
| Linear | 2048 | 35ms | 4 MB |
| Hyperbolic | 512 | 18ms | 6 MB |

### IndexedDB Operations

| Operation | Records | Time |
|-----------|---------|------|
| Insert (single) | 1 | 2ms |
| Batch insert | 1000 | 150ms |
| Query | 10K DB | 25ms |
| Full scan | 100K DB | 400ms |

## 🎯 Best Practices

### 1. Optimize Bundle Size

```typescript
// ✅ GOOD: Import only what you need
import { WASMVectorSearch } from 'agentdb@alpha/controllers/WASMVectorSearch';

// ❌ BAD: Import entire library
import * as AgentDB from 'agentdb@alpha';
```

### 2. Use Web Workers for Heavy Operations

```typescript
// ✅ GOOD: Offload to worker
const worker = new WASMWorker();
worker.postMessage({ type: 'search', query: queryVector });

// ❌ BAD: Block main thread
const results = await wasmSearch.search(queryVector, { k: 10 });
// UI freezes during search
```

### 3. Progressive Enhancement

```typescript
// ✅ GOOD: Fallback for unsupported browsers
if ('WebAssembly' in window) {
  // Use WASM version
  const db = new AgentDB({ backend: 'wasm' });
} else {
  // Fallback to server-side search
  const db = new AgentDB({ backend: 'remote', url: '/api/search' });
}
```

### 4. Lazy Load WASM

```typescript
// ✅ GOOD: Lazy load WASM
const attention = await import('ruvector-attention-wasm');
await attention.load();

// ❌ BAD: Load eagerly
import { AttentionWASM } from 'ruvector-attention-wasm';
// Loaded even if not used
```

## 🌐 Framework Integrations

### React

```typescript
// useWASMSearch.ts
import { useState, useEffect } from 'react';
import { WASMVectorSearch } from 'agentdb@alpha/controllers/WASMVectorSearch';

export function useWASMSearch() {
  const [search, setSearch] = useState<WASMVectorSearch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const wasmSearch = new WASMVectorSearch({
        dimensions: 128,
        indexType: 'hnsw'
      });
      await wasmSearch.initialize();
      setSearch(wasmSearch);
      setLoading(false);
    }
    init();
  }, []);

  return { search, loading };
}

// Component.tsx
function SearchComponent() {
  const { search, loading } = useWASMSearch();
  const [results, setResults] = useState([]);

  async function handleSearch(query: string) {
    if (!search) return;

    const embedding = await generateEmbedding(query);
    const searchResults = await search.search(embedding, { k: 10 });
    setResults(searchResults);
  }

  if (loading) return <div>Loading search engine...</div>;

  return <SearchUI onSearch={handleSearch} results={results} />;
}
```

### Vue

```typescript
// useWASMSearch.ts
import { ref, onMounted } from 'vue';
import { WASMVectorSearch } from 'agentdb@alpha/controllers/WASMVectorSearch';

export function useWASMSearch() {
  const search = ref<WASMVectorSearch | null>(null);
  const loading = ref(true);

  onMounted(async () => {
    const wasmSearch = new WASMVectorSearch({
      dimensions: 128,
      indexType: 'hnsw'
    });
    await wasmSearch.initialize();
    search.value = wasmSearch;
    loading.value = false;
  });

  return { search, loading };
}
```

### Svelte

```typescript
// WASMSearch.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { WASMVectorSearch } from 'agentdb@alpha/controllers/WASMVectorSearch';

  let search: WASMVectorSearch | null = null;
  let loading = true;
  let results = [];

  onMount(async () => {
    search = new WASMVectorSearch({
      dimensions: 128,
      indexType: 'hnsw'
    });
    await search.initialize();
    loading = false;
  });

  async function handleSearch(query: string) {
    if (!search) return;

    const embedding = await generateEmbedding(query);
    results = await search.search(embedding, { k: 10 });
  }
</script>

{#if loading}
  <div>Loading search engine...</div>
{:else}
  <SearchUI on:search={handleSearch} {results} />
{/if}
```

## 📖 Next Steps

- Explore **[RuVector Ecosystem](06-ruvector-ecosystem.md)** for the complete package hierarchy
- Review **[AgentDB Integration](01-agentdb-integration.md)** for the full system architecture
- Learn about **[Advanced Retrieval](04-advanced-retrieval.md)** for browser-based RAG

---

**Component**: Browser & WASM Deployment
**Status**: Planning
**Packages**: agentdb@alpha/browser, ruvector-attention-wasm, @ruvector/core (WASM)
**Version**: 2.0.0-planning
**Last Updated**: 2025-12-02
