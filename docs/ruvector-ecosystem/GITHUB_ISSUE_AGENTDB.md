# GitHub Issue: AgentDB RuVector Ecosystem Integration

**Title:** `[Enhancement] Integrate RuVector Ecosystem - Database Infrastructure (7 packages)`

**Labels:** `enhancement`, `agentdb`, `database`, `ruvector`, `priority: high`

**Assignees:** `@ruvnet`

---

## 📋 Summary

Integrate 7 RuVector packages into agentdb to provide enterprise-grade database infrastructure including PostgreSQL backend, distributed clustering, hypergraph storage, and enhanced learning capabilities.

**Impact:**
- 1000x database scale (SQLite → PostgreSQL)
- 10x faster graph operations (native hypergraph)
- 100x scale increase (distributed clustering)
- Production-grade persistence and learning

---

## 🎯 Objectives

### Core Updates (3 packages)
- [ ] Update `ruvector` from 0.1.30 → 0.1.38 (+8 versions)
- [ ] Update `@ruvector/attention` from 0.1.2 → 0.1.3
- [ ] Update `@ruvector/sona` from 0.1.3 → 0.1.4

### New Infrastructure (4 packages)
- [ ] Add `@ruvector/postgres-cli@0.2.6` - Enterprise PostgreSQL backend
- [ ] Add `@ruvector/graph-node@0.1.25` - Hypergraph storage
- [ ] Add `@ruvector/cluster@0.1.0` - Distributed clustering
- [ ] Add `@ruvector/server@0.1.0` - HTTP/gRPC API server

---

## 📦 Package Details

### 1. ruvector@0.1.38 (UPDATE)

**Current:** 0.1.30
**Target:** 0.1.38 (+8 versions)
**Priority:** HIGH

**Changes:**
```bash
npm install ruvector@^0.1.38
```

**Integration Points:**
- `src/backends/ruvector/RuVectorBackend.ts` - Core backend
- `src/backends/ruvector/RuVectorLearning.ts` - Learning integration

**Testing:**
```bash
cd packages/agentdb
npm test
npm run benchmark
```

**Expected Impact:**
- Bug fixes from 8 version updates
- Performance improvements
- New features in core API

---

### 2. @ruvector/attention@0.1.3 (UPDATE)

**Current:** 0.1.2
**Target:** 0.1.3
**Priority:** MEDIUM

**Changes:**
```bash
npm install @ruvector/attention@^0.1.3
```

**Integration Points:**
- `src/controllers/AttentionService.ts`
- `src/wrappers/attention-native.ts`
- `src/wrappers/attention-fallbacks.js`

**New Features:**
- NAPI binding improvements
- WASM fallback enhancements
- Performance optimizations

**Testing:**
```bash
npm run benchmark:attention
```

---

### 3. @ruvector/sona@0.1.4 (UPDATE)

**Current:** 0.1.3
**Target:** 0.1.4
**Priority:** MEDIUM

**Changes:**
```bash
npm install @ruvector/sona@^0.1.4
```

**Integration Points:**
- `src/services/federated-learning.ts:7`
- EphemeralLearningAgent
- FederatedLearningCoordinator

**New Features:**
- Enhanced LoRA (Low-Rank Adaptation)
- Improved EWC++ (Elastic Weight Consolidation)
- Sub-millisecond learning overhead
- Better ReasoningBank integration

**Testing:**
```bash
npm run test:unit
# Verify federated learning still works
```

---

### 4. @ruvector/postgres-cli@0.2.6 (NEW)

**Priority:** CRITICAL
**Impact:** Enterprise-grade persistence

**Installation:**
```bash
npm install @ruvector/postgres-cli@^0.2.6 pg@^8.11.0
```

**Implementation:**

**Step 1: Create PostgreSQL Backend**

```typescript
// File: packages/agentdb/src/backends/postgres/PostgresBackend.ts
import { Client } from 'pg';
import type { VectorBackend, SearchResult, SearchOptions } from '../VectorBackend.js';

export class PostgresRuVectorBackend implements VectorBackend {
  readonly name = 'postgres-ruvector' as const;
  private client: Client;
  private initialized = false;

  constructor(private connectionString: string) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Connect to PostgreSQL
    this.client = new Client({
      connectionString: this.connectionString
    });
    await this.client.connect();

    // Create RuVector extension
    await this.client.query(`
      CREATE EXTENSION IF NOT EXISTS ruvector;

      CREATE TABLE IF NOT EXISTS reasoning_patterns (
        id BIGSERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        task TEXT NOT NULL,
        embedding vector(384),
        reward FLOAT NOT NULL,
        success BOOLEAN NOT NULL,
        input TEXT,
        output TEXT,
        critique TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- HNSW index for fast similarity search
      CREATE INDEX IF NOT EXISTS patterns_embedding_idx
      ON reasoning_patterns
      USING hnsw (embedding vector_cosine_ops)
      WITH (m = 16, ef_construction = 200);

      -- Additional indexes
      CREATE INDEX IF NOT EXISTS patterns_session_idx ON reasoning_patterns(session_id);
      CREATE INDEX IF NOT EXISTS patterns_task_idx ON reasoning_patterns(task);
      CREATE INDEX IF NOT EXISTS patterns_created_idx ON reasoning_patterns(created_at);
    `);

    this.initialized = true;
  }

  async insert(id: string, embedding: Float32Array, metadata?: Record<string, any>): Promise<void> {
    await this.client.query(`
      INSERT INTO reasoning_patterns (session_id, task, embedding, reward, success, input, output, critique, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      metadata?.sessionId || id,
      metadata?.task || '',
      `[${Array.from(embedding).join(',')}]`,
      metadata?.reward || 0.0,
      metadata?.success || false,
      metadata?.input || null,
      metadata?.output || null,
      metadata?.critique || null,
      metadata ? JSON.stringify(metadata) : null
    ]);
  }

  async search(query: Float32Array, k: number, options?: SearchOptions): Promise<SearchResult[]> {
    const threshold = options?.threshold || 0.0;

    const result = await this.client.query(`
      SELECT
        session_id,
        task,
        reward,
        success,
        metadata,
        1 - (embedding <=> $1::vector) AS similarity
      FROM reasoning_patterns
      WHERE 1 - (embedding <=> $1::vector) >= $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
    `, [
      `[${Array.from(query).join(',')}]`,
      threshold,
      k
    ]);

    return result.rows.map(row => ({
      id: row.session_id,
      distance: 1 - row.similarity,
      similarity: row.similarity,
      metadata: {
        task: row.task,
        reward: row.reward,
        success: row.success,
        ...(row.metadata || {})
      }
    }));
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.client.query(
      'DELETE FROM reasoning_patterns WHERE session_id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  getStats() {
    return {
      count: 0, // TODO: Query count
      dimension: 384,
      metric: 'cosine' as const,
      backend: 'postgres-ruvector' as const
    };
  }

  async close(): Promise<void> {
    await this.client.end();
  }
}
```

**Step 2: Add Backend Selector**

```typescript
// File: packages/agentdb/src/backends/BackendSelector.ts
import { PostgresRuVectorBackend } from './postgres/PostgresBackend.js';

export function createBackend(config: BackendConfig): VectorBackend {
  switch (config.type) {
    case 'postgres':
      return new PostgresRuVectorBackend(config.connectionString);
    // ... existing backends
  }
}
```

**Step 3: CLI Installation Command**

```bash
# Add to package.json scripts
"scripts": {
  "postgres:install": "npx @ruvector/postgres-cli install",
  "postgres:start": "npx @ruvector/postgres-cli start",
  "postgres:stop": "npx @ruvector/postgres-cli stop",
  "postgres:status": "npx @ruvector/postgres-cli status"
}
```

**Configuration:**
```bash
# .env
AGENTDB_BACKEND=postgres
AGENTDB_POSTGRES_URL=postgresql://localhost:5432/agentdb
```

**Testing:**
```bash
# Install PostgreSQL with RuVector
npx @ruvector/postgres-cli install

# Start server
npx @ruvector/postgres-cli start

# Test backend
AGENTDB_BACKEND=postgres npm test

# Benchmark
npm run benchmark:backends
```

**Expected Impact:**
- ✅ 1000x scale (millions → billions of vectors)
- ✅ 53+ SQL vector functions
- ✅ ACID transactions
- ✅ Production-grade persistence

---

### 5. @ruvector/graph-node@0.1.25 (NEW)

**Priority:** HIGH
**Impact:** 10x faster graph operations

**Installation:**
```bash
npm install @ruvector/graph-node@^0.1.25
```

**Implementation:**

```typescript
// File: packages/agentdb/src/controllers/CausalMemoryGraph.ts (ENHANCE)
import { HyperGraph } from '@ruvector/graph-node';

export class CausalMemoryGraph {
  private graph: HyperGraph;

  async initialize(path: string = './data/causal-graph.db') {
    this.graph = new HyperGraph({
      persistent: true,
      path,
      indexes: ['Event.timestamp', 'Event.type', 'Event.agentId']
    });
  }

  async addCausalChain(events: Event[]): Promise<void> {
    // Add events as nodes
    for (const event of events) {
      await this.graph.addNode(event.id, {
        type: event.type,
        timestamp: event.timestamp,
        agentId: event.agentId,
        data: event.data
      });
    }

    // Create hyperedge connecting all events
    await this.graph.addHyperEdge({
      nodes: events.map(e => e.id),
      label: 'CAUSED_BY',
      properties: {
        confidence: this.calculateConfidence(events),
        timestamp: Date.now(),
        chain_length: events.length
      }
    });
  }

  async queryCausalPath(outcomeId: string): Promise<Event[]> {
    // Use Cypher query for complex graph traversal
    const result = await this.graph.cypher(`
      MATCH path = (root:Event)-[:CAUSED_BY*1..5]->(outcome:Event {id: $outcomeId})
      WHERE root.type = 'root_cause'
      RETURN path,
             length(path) as depth,
             reduce(conf = 1.0, r in relationships(path) | conf * r.confidence) as chain_confidence
      ORDER BY chain_confidence DESC
      LIMIT 10
    `, { outcomeId });

    return result.map(r => this.extractEvents(r.path));
  }

  async findSimilarPatterns(pattern: CausalPattern): Promise<CausalPattern[]> {
    // Subgraph matching
    const result = await this.graph.cypher(`
      MATCH (a:Event)-[:CAUSED_BY]->(b:Event)-[:CAUSED_BY]->(c:Event)
      WHERE a.type = $type1 AND b.type = $type2
      RETURN a, b, c
    `, { type1: pattern.start, type2: pattern.middle });

    return this.patternsFromResult(result);
  }
}
```

**Testing:**
```bash
npm run test:graph
npm run benchmark:graph
```

**Expected Impact:**
- ✅ 10x faster than in-memory JS graphs
- ✅ Hyperedge support (N-way relationships)
- ✅ Persistent storage
- ✅ Cypher query language

---

### 6. @ruvector/cluster@0.1.0 (NEW)

**Priority:** MEDIUM (Enterprise feature)
**Impact:** 100x scale increase

**Installation:**
```bash
npm install @ruvector/cluster@^0.1.0
```

**Implementation:**

```typescript
// File: packages/agentdb/src/distributed/cluster-manager.ts
import { ClusterManager } from '@ruvector/cluster';
import type { VectorBackend } from '../backends/VectorBackend.js';

export class DistributedAgentDB {
  private cluster: ClusterManager;
  private localShard: VectorBackend;

  async initialize(config: ClusterConfig) {
    this.cluster = new ClusterManager({
      nodeId: config.nodeId,
      nodes: config.nodes, // ['node1:5000', 'node2:5000', 'node3:5000']
      raft: {
        electionTimeout: 1000,
        heartbeatInterval: 100,
        snapshotInterval: 3600000
      },
      sharding: {
        strategy: 'consistent-hash',
        virtualNodes: 150,
        replicas: 3
      }
    });

    await this.cluster.join();
    this.localShard = await this.createLocalShard();
  }

  async insert(pattern: ReasoningPattern): Promise<void> {
    const shardId = this.cluster.getShard(pattern.sessionId);

    if (shardId === this.cluster.nodeId) {
      // Local insert
      await this.localShard.insert(pattern.sessionId, pattern.embedding, pattern);
    } else {
      // Forward to remote node
      await this.cluster.forward(shardId, 'insert', pattern);
    }

    // Replicate via Raft
    await this.cluster.replicate(pattern);
  }

  async search(query: Float32Array, k: number): Promise<ReasoningPattern[]> {
    // Scatter-gather across all shards
    const shards = this.cluster.getAllShards();

    const results = await Promise.all(
      shards.map(shard =>
        this.cluster.forward(shard, 'search', { query, k })
      )
    );

    // Merge and re-rank globally
    return this.mergeResults(results, k);
  }
}
```

**Docker Compose Setup:**

```yaml
# File: docker/docker-compose.cluster.yml
version: '3.8'

services:
  agentdb-node1:
    image: ruvnet/agentdb:latest
    environment:
      - NODE_ID=node1
      - CLUSTER_NODES=node1:5000,node2:5000,node3:5000
      - RAFT_ELECTION_TIMEOUT=1000
    ports:
      - "5001:5000"
    volumes:
      - node1-data:/app/data

  agentdb-node2:
    image: ruvnet/agentdb:latest
    environment:
      - NODE_ID=node2
      - CLUSTER_NODES=node1:5000,node2:5000,node3:5000
    ports:
      - "5002:5000"
    volumes:
      - node2-data:/app/data

  agentdb-node3:
    image: ruvnet/agentdb:latest
    environment:
      - NODE_ID=node3
      - CLUSTER_NODES=node1:5000,node2:5000,node3:5000
    ports:
      - "5003:5000"
    volumes:
      - node3-data:/app/data

volumes:
  node1-data:
  node2-data:
  node3-data:
```

**Testing:**
```bash
# Start cluster
docker-compose -f docker/docker-compose.cluster.yml up -d

# Test cluster
npm run test:cluster

# Benchmark distributed search
npm run benchmark:cluster
```

**Expected Impact:**
- ✅ 100x scale (distributed across nodes)
- ✅ Fault tolerance (Raft consensus)
- ✅ Automatic sharding
- ✅ Data replication

---

### 7. @ruvector/server@0.1.0 (NEW)

**Priority:** MEDIUM
**Impact:** Language-agnostic access

**Installation:**
```bash
npm install @ruvector/server@^0.1.0
```

**Implementation:**

```typescript
// File: packages/agentdb/src/server/agentdb-server.ts
import { RuVectorServer } from '@ruvector/server';
import type { AgentDB } from '../AgentDB.js';

export class AgentDBServer {
  private server: RuVectorServer;
  private agentDB: AgentDB;

  async start(port: number = 5432) {
    this.server = new RuVectorServer({
      port,
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
      },
      auth: {
        type: 'api-key',
        keys: process.env.API_KEYS?.split(',') || []
      },
      rateLimit: {
        max: 100,
        windowMs: 60000
      }
    });

    // Vector search endpoint
    this.server.post('/vectors/search', async (req, res) => {
      const { query, k = 5, threshold } = req.body;
      const results = await this.agentDB.search(query, k, { threshold });
      res.json({ results });
    });

    // Pattern search endpoint
    this.server.post('/patterns/search', async (req, res) => {
      const { task, k = 5, minReward } = req.body;
      const patterns = await this.agentDB.searchPatterns(task, k, minReward);
      res.json({ patterns });
    });

    // Pattern storage endpoint
    this.server.post('/patterns/store', async (req, res) => {
      const pattern = req.body;
      await this.agentDB.storePattern(pattern);
      res.json({ success: true });
    });

    // Server-Sent Events for real-time updates
    this.server.get('/patterns/stream', (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');

      this.agentDB.on('pattern:stored', (pattern) => {
        res.write(`data: ${JSON.stringify(pattern)}\n\n`);
      });
    });

    await this.server.listen();
    console.log(`✅ AgentDB Server running on port ${port}`);
  }
}
```

**CLI Integration:**

```bash
# Add to package.json
"scripts": {
  "server:start": "node dist/server/agentdb-server.js",
  "server:dev": "tsx src/server/agentdb-server.ts"
}
```

**Client Example (Python):**

```python
import requests

# Search patterns
response = requests.post('http://localhost:5432/patterns/search', json={
    'task': 'implement authentication',
    'k': 5,
    'minReward': 0.8
})

patterns = response.json()['patterns']
for pattern in patterns:
    print(f"Task: {pattern['task']}, Reward: {pattern['reward']}")
```

**Testing:**
```bash
npm run server:start &
sleep 2

# Test endpoints
curl -X POST http://localhost:5432/patterns/search \
  -H "Content-Type: application/json" \
  -d '{"task": "test", "k": 5}'
```

**Expected Impact:**
- ✅ HTTP/gRPC API access
- ✅ Language-agnostic clients
- ✅ Real-time streaming (SSE)
- ✅ Production-ready (auth + rate limiting)

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// File: packages/agentdb/tests/backends/postgres.test.ts
describe('PostgresRuVectorBackend', () => {
  test('should insert and search vectors', async () => {
    const backend = new PostgresRuVectorBackend(process.env.POSTGRES_URL);
    await backend.initialize();

    const embedding = new Float32Array(384).fill(0.5);
    await backend.insert('test-1', embedding, { task: 'test' });

    const results = await backend.search(embedding, 1);
    expect(results[0].id).toBe('test-1');
  });
});
```

### Integration Tests

```bash
# File: packages/agentdb/tests/integration/cluster.test.ts
describe('Distributed Cluster', () => {
  test('should replicate data across nodes', async () => {
    // Start 3-node cluster
    // Insert on node1
    // Read from node2 and node3
    // Verify data replication
  });
});
```

### Benchmarks

```bash
npm run benchmark:postgres     # PostgreSQL vs SQLite
npm run benchmark:graph        # Hypergraph vs in-memory
npm run benchmark:cluster      # Single vs distributed
npm run benchmark:all          # Complete suite
```

---

## 📊 Success Criteria

### Performance

- [ ] PostgreSQL backend: 1000x capacity increase
- [ ] Hypergraph: 10x faster than current implementation
- [ ] Cluster: Successfully replicates across 3 nodes
- [ ] Server: <10ms API response time

### Testing

- [ ] All existing tests pass
- [ ] New backend tests added
- [ ] Integration tests for clustering
- [ ] Benchmark comparisons documented

### Documentation

- [ ] Migration guide (SQLite → PostgreSQL)
- [ ] Cluster deployment guide
- [ ] API documentation for server
- [ ] Updated README with new capabilities

---

## 📅 Implementation Timeline

### Week 1: Core Updates
- [ ] Update ruvector, attention, sona (Day 1)
- [ ] Run full test suite (Day 1)
- [ ] Verify no regressions (Day 2)

### Week 2: PostgreSQL Backend
- [ ] Implement PostgresBackend class (Day 3-4)
- [ ] Create migration scripts (Day 5)
- [ ] Test and benchmark (Day 6)

### Week 3: Hypergraph Integration
- [ ] Enhance CausalMemoryGraph (Day 7-8)
- [ ] Add Cypher query support (Day 9)
- [ ] Test and benchmark (Day 10)

### Week 4: Advanced Features
- [ ] Implement clustering (Day 11-12)
- [ ] Add HTTP server (Day 13)
- [ ] Integration testing (Day 14)
- [ ] Documentation (Day 15)

**Total:** ~15 days (3 weeks)

---

## 🔗 Related Documentation

- [RuVector Ecosystem Overview](../docs/ruvector-ecosystem/README.md)
- [Package Allocation Strategy](../docs/ruvector-ecosystem/PACKAGE_ALLOCATION_STRATEGY.md)
- [Complete Analysis](../docs/ruvector-ecosystem/FINAL_RUVECTOR_ECOSYSTEM_COMPLETE.md)

---

## 💬 Notes

- PostgreSQL backend is optional - SQLite remains default
- Clustering is enterprise feature - single-node by default
- Server can be run separately or embedded
- All changes are backward compatible

---

**Priority:** High
**Effort:** 3 weeks
**Impact:** Enterprise-grade database infrastructure
**Version:** agentdb@2.0.0-alpha.2.21
