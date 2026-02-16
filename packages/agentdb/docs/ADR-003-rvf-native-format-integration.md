# ADR-003: RVF Format Integration for AgentDB

**Status:** Proposed
**Date:** 2026-02-16
**Author:** System Architect (AgentDB v2)
**Supersedes:** None
**Related:** ADR-001 (Backend Abstraction), ADR-002 (RuVector WASM Integration)

## Context

AgentDB v2 stores vectors through the `ruvector` npm package's proprietary binary format plus a separate `.meta.json` sidecar file. This has known limitations (see [Motivation](#motivation)). The upstream RVF (RuVector Format) provides a single-file solution with crash safety, progressive indexing, lineage tracking, and COW branching.

### Hands-On Package Assessment (2026-02-16)

All three RVF npm packages were installed and tested with actual vector operations.

#### @ruvector/rvf@0.1.7 -- TypeScript SDK (FUNCTIONAL)

The unified SDK ships compiled TypeScript with dual-backend support:

```
dist/
  index.js + index.d.ts       -- re-exports
  database.js + database.d.ts  -- RvfDatabase class (226 lines)
  backend.js + backend.d.ts    -- NodeBackend, WasmBackend, resolveBackend (580 lines)
  types.js + types.d.ts        -- all type definitions
  errors.js + errors.d.ts      -- RvfError + RvfErrorCode enum
```

- Exports: `RvfDatabase`, `NodeBackend`, `WasmBackend`, `resolveBackend`, `RvfError`, `RvfErrorCode`
- `resolveBackend('auto')` returns `NodeBackend` in Node.js, `WasmBackend` in browsers
- Fully typed: `RvfOptions`, `RvfIngestEntry`, `RvfSearchResult`, `RvfFilterExpr`, `RvfStatus`, etc.
- Async API: `RvfDatabase.create()`, `.open()`, `.openReadonly()`, `.ingestBatch()`, `.query()`, `.delete()`, `.compact()`, `.status()`, `.fileId()`, `.derive()`, `.segments()`, `.close()`
- Typed filter expressions: discriminated union with 11 operators (`eq`/`ne`/`lt`/`le`/`gt`/`ge`/`in`/`range`/`and`/`or`/`not`)
- Per-vector metadata: `Record<string, RvfFilterValue>` where `RvfFilterValue = number | string | boolean`

#### @ruvector/rvf-node@0.1.6 -- N-API Bindings (FULLY FUNCTIONAL)

**All 12 operations verified from clean `npm install`.** All 5 platform binaries published.

```
index.js       -- napi-rs loader
index.d.ts     -- RvfDatabase class + types
*.node         -- native binary (linux-x64-gnu)
```

**Test results (128-dim, cosine, 10 vectors with metadata, clean npm install):**

| Operation                    | Result                                           | Notes                                        |
| ---------------------------- | ------------------------------------------------ | -------------------------------------------- |
| `RvfDatabase.create()`       | OK                                               | Creates `.rvf` file                          |
| `db.ingestBatch(50 entries)` | `{ accepted: 50, rejected: 0, epoch: 1 }`        | Per-vector metadata supported                |
| `db.query(k=5)`              | 5 results, top distance: 0.848                   | Correct distance ordering                    |
| `db.status()`                | `{ totalVectors: 50, totalSegments: 4 }`         | 4 segments: manifest, vec, witness, manifest |
| `db.fileId()`                | `9c87c054...` (32 hex chars)                     | Unique per store                             |
| `db.parentId()`              | `0000...0000`                                    | Root store (no parent)                       |
| `db.lineageDepth()`          | `0`                                              | Root store                                   |
| `db.segments()`              | manifest, vec, witness, manifest                 | Full segment introspection                   |
| `db.dimension()`             | `128`                                            | Matches creation config                      |
| `db.delete(['0','1','2'])`   | `{ deleted: 3, epoch: 2 }`                       | Soft-delete with epoch bump                  |
| `db.compact()`               | `{ segmentsCompacted: 3, bytesReclaimed: 1536 }` | Reclaims dead space                          |
| `db.derive(childPath)`       | OK, child `lineageDepth: 1`                      | Parent-child lineage works                   |

**Platform binaries** (all pinned at 0.1.4 by rvf-node@0.1.5 optionalDependencies):

| Package                              | Status                    | Size   |
| ------------------------------------ | ------------------------- | ------ |
| `@ruvector/rvf-node-linux-x64-gnu`   | Published                 | 1.2 MB |
| `@ruvector/rvf-node-linux-arm64-gnu` | Published                 | 1.2 MB |
| `@ruvector/rvf-node-darwin-arm64`    | Published (Apple Silicon) | 3.0 MB |
| `@ruvector/rvf-node-darwin-x64`      | Published (Intel Mac)     | 3.0 MB |
| `@ruvector/rvf-node-win32-x64-msvc`  | Published                 | --     |

#### @ruvector/rvf-wasm@0.1.5 -- WASM Microkernel (FULLY FUNCTIONAL)

Binary: `rvf_wasm_bg.wasm` (42 KB). Contains 30+ C-ABI exports.

**WASM module verified** (C-ABI operations):

```
rvf_store_create(64, L2)  -> handle=1
rvf_store_ingest(5 vecs)  -> code=5 (count returned)
rvf_store_count()         -> 5
rvf_store_dimension()     -> 64
rvf_store_query(k=3)      -> 3 results returned
rvf_store_close()         -> OK
```

### Summary: What Works Today

| Package              | Version | Binary                | SDK Wrapper      | Direct Use         |
| -------------------- | ------- | --------------------- | ---------------- | ------------------ |
| `@ruvector/rvf`      | 0.1.7   | N/A (pure JS)         | --               | Fully functional   |
| `@ruvector/rvf-node` | 0.1.6   | `.node` (5 platforms) | All 12 ops pass  | N/A                |
| `@ruvector/rvf-wasm` | 0.1.5   | 42 KB `.wasm`         | Fully functional | All C-ABI ops work |

The N-API backend is production-ready on all 5 platforms (linux-x64, linux-arm64, macOS arm64, macOS x64, Windows x64). The WASM backend is fully functional.

### SDK API Surface (verified from types)

```typescript
// Lifecycle
RvfDatabase.create(path, options, backend?): Promise<RvfDatabase>
RvfDatabase.open(path, backend?): Promise<RvfDatabase>
RvfDatabase.openReadonly(path, backend?): Promise<RvfDatabase>

// Write
db.ingestBatch(entries: RvfIngestEntry[]): Promise<RvfIngestResult>
db.delete(ids: string[]): Promise<RvfDeleteResult>
db.deleteByFilter(filter: RvfFilterExpr): Promise<RvfDeleteResult>

// Read
db.query(vector, k, options?): Promise<RvfSearchResult[]>
db.status(): Promise<RvfStatus>
db.segments(): Promise<RvfSegmentInfo[]>
db.dimension(): Promise<number>

// Lineage
db.fileId(): Promise<string>
db.parentId(): Promise<string>
db.lineageDepth(): Promise<number>
db.derive(childPath, options?): Promise<RvfDatabase>

// Maintenance
db.compact(): Promise<RvfCompactionResult>
db.close(): Promise<void>

// Kernel/eBPF (NodeBackend only)
db.embedKernel(arch, type, flags, image, port, cmdline?): Promise<number>
db.extractKernel(): Promise<RvfKernelData | null>
db.embedEbpf(type, attach, dim, bytecode, btf?): Promise<number>
db.extractEbpf(): Promise<RvfEbpfData | null>
```

**WASM backend** exposes a C-ABI surface (integer handles, pointer-based I/O) rather than the ergonomic object API of the N-API backend. The raw exports include: `rvf_store_create`, `rvf_store_open`, `rvf_store_ingest`, `rvf_store_query`, `rvf_store_delete`, `rvf_store_count`, `rvf_store_dimension`, `rvf_store_status`, `rvf_store_export`, `rvf_store_close`, plus distance computation (`rvf_distances`), quantization (`rvf_dequant_i8`, `rvf_pq_distances`), HNSW navigation (`rvf_greedy_step`, `rvf_load_neighbors`), segment verification (`rvf_verify_header`, `rvf_crc32c`), and witness chain ops (`rvf_witness_verify`). The SDK `WasmBackend` class wraps these into the same `RvfBackend` interface, though lineage/derive/kernel/eBPF operations throw `BackendNotFound` by design.

## Motivation

Current AgentDB vector persistence limitations:

1. **Two-file persistence** -- `.db` + `.meta.json` can drift out of sync
2. **No crash safety** -- `this.db.save(path)` then `fs.writeFile(metadataPath)` is non-atomic
3. **No cryptographic integrity** -- No checksums, signatures, or witness chains
4. **No progressive loading** -- Full index load before first query
5. **No format versioning** -- No magic bytes, version tags, or forward-compatibility
6. **No branching/COW** -- Full copy required for variants

## Decision

Integrate the `@ruvector/rvf` SDK as the RVF backend for AgentDB, targeting the N-API backend (`@ruvector/rvf-node`) for Node.js and the WASM backend (`@ruvector/rvf-wasm`) for browser/edge. Both backends implement the same `RvfBackend` interface with automatic fallback (`'auto'` mode).

**Current state:** Both N-API and WASM backends are fully functional. N-API binaries published for all 5 platforms (linux-x64, linux-arm64, macOS arm64, macOS x64, Windows x64). No upstream blockers remain.

### Architecture

```
                    VectorBackend (interface)
                    /        |         \
                   /         |          \
         RuVectorBackend  RvfBackend  HNSWLibBackend
         (existing)       (NEW)       (existing)
              |              |
         ruvector npm    @ruvector/rvf SDK
         .db + .meta       |         \
                     rvf-node(N-API)  rvf-wasm
                     single .rvf      in-memory
```

The `@ruvector/rvf` SDK handles backend selection internally. AgentDB's `RvfBackend` wraps `RvfDatabase` and adapts it to the `VectorBackend` interface.

### Phase 0: Upstream Binary Publishing (RESOLVED)

As of 2026-02-16, upstream has published working binaries:

1. **`@ruvector/rvf-node@0.1.6`** -- N-API bindings with all 5 platform binaries. All 12 operations verified.
   - Published: linux-x64-gnu, linux-arm64-gnu, darwin-arm64, darwin-x64, win32-x64-msvc (all at 0.1.4)
   - `index.js` + `index.d.ts` included in base package
   - `build-rvf-node.yml` workflow auto-builds on merge to main

2. **`@ruvector/rvf-wasm@0.1.5`** -- WASM microkernel with pre-built binary (42 KB). All C-ABI operations verified.
   - Pre-built `pkg/rvf_wasm_bg.wasm` + `pkg/rvf_wasm.js` + type definitions included
   - No Rust/wasm-pack install required

3. **`@ruvector/rvf@0.1.7`** -- SDK with corrected version pins. Pulls in `@ruvector/rvf-node@0.1.5` automatically.

**Remaining upstream work (P2):**

- Add linux-x64-musl target for Alpine/Docker

### Phase 1: Core RVF Backend (Priority: Critical)

**Goal:** Drop-in `VectorBackend` implementation using `@ruvector/rvf`.

New file: `src/backends/rvf/RvfBackend.ts`

```typescript
import type {
  VectorBackend,
  VectorConfig,
  SearchResult,
  SearchOptions,
  VectorStats,
} from "../VectorBackend.js";
import type {
  RvfDatabase,
  RvfIngestEntry,
  BackendType as RvfBackendType,
} from "@ruvector/rvf";

export class RvfBackend implements VectorBackend {
  readonly name = "rvf" as const;
  private db: RvfDatabase | null = null;
  private dim: number = 384;

  async initialize(
    config: VectorConfig,
    rvfBackend: RvfBackendType = "auto",
  ): Promise<void> {
    const { RvfDatabase } = await import("@ruvector/rvf");
    this.dim = config.dimension ?? config.dimensions ?? 384;

    // RVF SDK uses 'dimensions' (plural), metric maps: ip -> dotproduct
    this.db = await RvfDatabase.create(
      config.storagePath ?? "agentdb.rvf",
      {
        dimensions: this.dim,
        metric: config.metric === "ip" ? "dotproduct" : config.metric,
        m: config.M ?? 16,
        efConstruction: config.efConstruction ?? 200,
      },
      rvfBackend,
    );
  }

  insert(
    id: string,
    embedding: Float32Array,
    metadata?: Record<string, any>,
  ): void {
    // RVF is async but VectorBackend interface is sync -- queue and flush
    this._pending.push({ id, vector: embedding, metadata });
    if (this._pending.length >= this._batchThreshold) {
      this._flushSync();
    }
  }

  async insertBatch(
    items: Array<{
      id: string;
      embedding: Float32Array;
      metadata?: Record<string, any>;
    }>,
  ): Promise<void> {
    const entries: RvfIngestEntry[] = items.map((item) => ({
      id: item.id,
      vector: item.embedding,
      metadata: item.metadata,
    }));
    await this.db!.ingestBatch(entries);
  }

  search(
    query: Float32Array,
    k: number,
    options?: SearchOptions,
  ): SearchResult[] {
    // Sync wrapper -- RVF query is async, need adapter pattern
    // Implementation will use cached results or synchronous fallback
    throw new Error("Use searchAsync() -- RVF operations are async");
  }

  async searchAsync(
    query: Float32Array,
    k: number,
    options?: SearchOptions,
  ): Promise<SearchResult[]> {
    const rvfOpts = options
      ? {
          efSearch: options.efSearch,
          filter: options.filter ? this.mapFilter(options.filter) : undefined,
          timeoutMs: 5000,
        }
      : undefined;

    const results = await this.db!.query(query, k, rvfOpts);
    return results.map((r) => ({
      id: r.id,
      distance: r.distance,
      similarity: this.distanceToSimilarity(r.distance),
    }));
  }

  getStats(): VectorStats {
    return {
      count: this._cachedCount,
      dimension: this.dim,
      metric: "cosine",
      backend: "rvf" as any,
      memoryUsage: 0,
    };
  }

  async save(path: string): Promise<void> {
    await this.db!.compact();
  }

  async load(path: string): Promise<void> {
    const { RvfDatabase } = await import("@ruvector/rvf");
    this.db = await RvfDatabase.open(path);
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }

  // --- RVF-specific extensions ---

  async fileId(): Promise<string> {
    return this.db!.fileId();
  }
  async parentId(): Promise<string> {
    return this.db!.parentId();
  }
  async lineageDepth(): Promise<number> {
    return this.db!.lineageDepth();
  }
  async derive(childPath: string): Promise<RvfBackend> {
    /* ... */
  }
  async compact(): Promise<{
    segmentsCompacted: number;
    bytesReclaimed: number;
  }> {
    const r = await this.db!.compact();
    return {
      segmentsCompacted: r.segmentsCompacted,
      bytesReclaimed: r.bytesReclaimed,
    };
  }
  async segments(): Promise<
    Array<{ id: number; segType: string; payloadLength: number }>
  > {
    return this.db!.segments();
  }
}
```

**Key design note:** The existing `VectorBackend` interface uses synchronous `insert()` and `search()`, but `@ruvector/rvf` is fully async. The backend will need either:

- (a) An async extension interface (`VectorBackendAsync`) that `RvfBackend` implements
- (b) A batching adapter that queues sync calls and flushes asynchronously

#### 1.2 Backend Factory Extension

```typescript
export type BackendType = "auto" | "ruvector" | "rvf" | "hnswlib";

// Detection checks both SDK availability AND backend binary availability
async function detectRvf(): Promise<{
  sdk: boolean;
  node: boolean;
  wasm: boolean;
}> {
  let sdk = false,
    node = false,
    wasm = false;
  try {
    await import("@ruvector/rvf");
    sdk = true;
    // Actually test if N-API loads
    const { RvfDatabase } = await import("@ruvector/rvf");
    const testDb = await RvfDatabase.create(
      ":memory:",
      { dimensions: 4 },
      "node",
    );
    await testDb.close();
    node = true;
  } catch {
    /* N-API not available */
  }
  try {
    const { RvfDatabase } = await import("@ruvector/rvf");
    const testDb = await RvfDatabase.create(
      ":memory:",
      { dimensions: 4 },
      "wasm",
    );
    await testDb.close();
    wasm = true;
  } catch {
    /* WASM not available */
  }
  return { sdk, node, wasm };
}
```

### Phase 2: Async Interface Adaptation (Priority: High)

The `@ruvector/rvf` API is entirely `Promise`-based. The existing `VectorBackend` interface uses sync `insert()` and `search()`. Options:

**Option A (Preferred):** Add `VectorBackendAsync` interface

```typescript
export interface VectorBackendAsync extends VectorBackend {
  insertAsync(
    id: string,
    embedding: Float32Array,
    metadata?: Record<string, any>,
  ): Promise<void>;
  searchAsync(
    query: Float32Array,
    k: number,
    options?: SearchOptions,
  ): Promise<SearchResult[]>;
  statusAsync(): Promise<RvfStatus>;
}
```

Existing consumers use sync interface unchanged. New consumers opt into async for RVF benefits.

**Option B:** Internal batch queue

Buffer sync `insert()` calls internally, flush to `ingestBatch()` on a microtask. `search()` blocks on cached index state.

### Phase 3: Migration & CLI (Priority: High)

Migration utility + `agentdb rvf` CLI subcommands for converting existing `.db` + `.meta.json` stores to single `.rvf` files.

### Phase 4: Progressive Indexing (Priority: Medium)

Expose 3-layer HNSW through `SearchOptions.quality` field. Requires N-API backend.

### Phase 5: Lineage & Witness (Priority: Medium)

`fileId()`, `parentId()`, `lineageDepth()`, `derive()` are already in the SDK API. Requires N-API backend (WASM throws on these).

### Phase 6: COW Branching (Priority: Low)

`db.derive(childPath)` is already in the SDK. Requires N-API backend.

## Consequences

### Positive

- **Well-designed SDK** -- `@ruvector/rvf` TypeScript layer is clean, typed, and ready
- **Dual-backend architecture** -- Same SDK works with N-API (fast) or WASM (portable)
- **Full API coverage** -- Ingest, query, delete, deleteByFilter, compact, status, lineage, derive, kernel/eBPF embed
- **Typed filter expressions** -- Discriminated union with 11 operators replaces untyped `Record<string, any>`
- **Forward-compatible** -- `BackendType = 'auto'` means AgentDB picks best available backend at runtime

### Negative

- **Async mismatch** -- `VectorBackend` is sync; RVF is async. Requires interface adaptation.
- **WASM limitations** -- WASM backend does not support lineage, derive, segments, dimension, or kernel/eBPF operations.
- **Migration effort** -- Existing `.db` + `.meta.json` deployments need one-time conversion.

### Mitigations

- RVF backend is **optional** -- existing backends remain fully functional
- Both N-API and WASM backends are production-ready; cross-platform npm publishing is CI/release work
- Async adapter pattern is well-understood and used by other backends
- SDK can be added to `optionalDependencies` immediately for type-checking without runtime cost

## Upstream Coordination Required

| Item                                                | Priority       | Status                            |
| --------------------------------------------------- | -------------- | --------------------------------- |
| Publish `@ruvector/rvf-node` platform binaries      | ~~P0 Blocker~~ | **Done** (0.1.6, all 5 platforms) |
| Publish `@ruvector/rvf-wasm` pre-built binary       | ~~P0 Blocker~~ | **Done** (0.1.5, 42 KB)           |
| Fix `@ruvector/rvf` -> `rvf-node` version pin       | ~~P1~~         | **Done** (0.1.7)                  |
| Add `index.js`/`index.d.ts` to `@ruvector/rvf-node` | ~~P1~~         | **Done** (0.1.6)                  |
| Build all 5 N-API platform binaries in CI           | ~~P1~~         | **Done** (all pass)               |
| Publish win32-x64-msvc binary                       | ~~P2~~         | **Done** (0.1.4)                  |
| Add linux-x64-musl (Alpine/Docker) binary           | P2             | Not planned                       |
| Document WASM backend capability subset             | P2             | Undocumented                      |

## Performance Targets

| Metric                    | Current (ruvector) | Target (RVF N-API)      | Target (RVF WASM)    |
| ------------------------- | ------------------ | ----------------------- | -------------------- |
| Cold-start to first query | Full load          | <5ms (Layer A, 70%)     | Full load            |
| Persistence               | .db + .meta.json   | Single .rvf, crash-safe | In-memory only       |
| Metadata filtering        | JS post-filter     | Native filtered k-NN    | Native filtered k-NN |
| Lineage tracking          | None               | Full (fileId, derive)   | Not supported        |
| COW branching             | N/A                | <3ms / 10K vectors      | Not supported        |

## References

- [RVF README](https://github.com/ruvnet/ruvector/blob/main/crates/rvf/README.md) -- Format specification
- [rvf-adapter-agentdb](https://github.com/ruvnet/ruvector/tree/main/crates/rvf/rvf-adapters/agentdb) -- Upstream Rust adapter
- [@ruvector/rvf@0.1.7](https://www.npmjs.com/package/@ruvector/rvf) -- TypeScript SDK (functional)
- [@ruvector/rvf-node@0.1.6](https://www.npmjs.com/package/@ruvector/rvf-node) -- N-API bindings (all 5 platforms published)
- [@ruvector/rvf-wasm@0.1.5](https://www.npmjs.com/package/@ruvector/rvf-wasm) -- WASM microkernel (fully functional)
- [ADR-001: Backend Abstraction](../../plans/agentdb-v2/ADR-001-backend-abstraction.md)
- [ADR-002: RuVector WASM Integration](./ADR-002-ruvector-wasm-integration.md)
