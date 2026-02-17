/**
 * SelfLearningRvfBackend - Unified Self-Learning RVF Integration (ADR-006)
 *
 * Wraps RvfBackend with: SemanticQueryRouter + SonaLearningBackend on search,
 * TemporalCompressor + IndexHealthMonitor on insert, ContrastiveTrainer for
 * feedback, FederatedSessionManager for sessions, RvfSolver for adaptive policy.
 */
import type { VectorBackendAsync, SearchResult, SearchOptions, VectorStats } from '../VectorBackend.js';
import { RvfBackend } from './RvfBackend.js';
import type { RvfConfig } from './RvfBackend.js';
import type { SonaLearningBackend } from './SonaLearningBackend.js';
import type { SemanticQueryRouter, RouteMatch } from './SemanticQueryRouter.js';
import type { TemporalCompressor } from './AdaptiveIndexTuner.js';
import { IndexHealthMonitor } from './AdaptiveIndexTuner.js';
import type { ContrastiveTrainer, ContrastiveSample } from './ContrastiveTrainer.js';
import type { FederatedSessionManager, SessionHandle } from './FederatedSessionManager.js';
import type { AgentDBSolver, SolverPolicyState, SolverAcceptanceManifest, SolverAcceptanceOptions } from './RvfSolver.js';
import type { NativeAccelerator, AcceleratorStats, WitnessVerifyResult } from './NativeAccelerator.js';

export interface SelfLearningConfig extends RvfConfig {
  learning?: boolean;
  tickIntervalMs?: number;
  learningDimension?: number;
  positiveThreshold?: number;
  negativeThreshold?: number;
  trainingBatchSize?: number;
  maxAdapters?: number;
  federated?: boolean;
  solverTrainCount?: number;
  solverMinDifficulty?: number;
  solverMaxDifficulty?: number;
  acceptanceIntervalTicks?: number;
  acceptanceHoldoutSize?: number;
}

interface ActiveTrajectory {
  id: number;
  queryEmbedding: Float32Array;
  results: SearchResult[];
  route?: string;
  startedAt: number;
}

export interface LearningStats {
  searchesEnhanced: number;
  trajectoriesRecorded: number;
  contrastiveSamples: number;
  contrastiveBatches: number;
  tickCount: number;
  solverTrainCount: number;
  useAdaptiveEf: boolean;
  activeSessionCount: number;
  compressionEntries: number;
}

const EF_ARMS = [50, 100, 200, 400];
const DEFAULT_EF = 100;
const RECENT_CAP = 200;
const MAX_SAMPLES = 1000;
const FREQ_PRUNE_INTERVAL = 50;
const FREQ_PRUNE_THRESHOLD = 0.001;

export class SelfLearningRvfBackend implements VectorBackendAsync {
  readonly name = 'rvf' as const;
  private backend: RvfBackend;
  private sona: SonaLearningBackend | null = null;
  private router: SemanticQueryRouter | null = null;
  private compressor: TemporalCompressor | null = null;
  private healthMonitor = new IndexHealthMonitor();
  private trainer: ContrastiveTrainer | null = null;
  private federated: FederatedSessionManager | null = null;
  private solver: AgentDBSolver | null = null;
  private accelerator: NativeAccelerator | null = null;
  private config: SelfLearningConfig;
  private dim: number;
  private learningEnabled: boolean;
  private useAdaptiveEf = true;
  private activeTrajectories = new Map<string, ActiveTrajectory>();
  private trajectoryCounter = 0;
  private sampleBuffer: ContrastiveSample[] = [];
  private recentSearches: Array<{ query: Float32Array; results: SearchResult[]; quality?: number }> = [];
  private accessFrequency = new Map<string, number>();
  private totalSearches = 0;
  private activeSessions = new Map<string, SessionHandle>();
  private tickMutex = false;
  private _tickCount = 0;
  private _searchesEnhanced = 0;
  private _trajectoriesRecorded = 0;
  private _contrastiveSamples = 0;
  private _contrastiveBatches = 0;
  private _solverTrainCount = 0;
  private _destroyed = false;
  private _simBuf = new Float32Array(0);

  private constructor(backend: RvfBackend, config: SelfLearningConfig) {
    this.backend = backend;
    this.config = config;
    this.dim = config.dimension ?? config.dimensions ?? 128;
    this.learningEnabled = config.learning !== false;
  }

  static async create(config: SelfLearningConfig): Promise<SelfLearningRvfBackend> {
    const backend = new RvfBackend(config);
    await backend.initialize();
    const instance = new SelfLearningRvfBackend(backend, config);
    if (instance.learningEnabled) await instance.initComponents();
    return instance;
  }

  // ─── Async VectorBackendAsync ───

  async insertAsync(id: string, embedding: Float32Array, metadata?: Record<string, unknown>): Promise<void> {
    this.ensureAlive();
    const start = performance.now();
    await this.backend.insertAsync(id, embedding, metadata);
    if (this.learningEnabled) {
      this.accessFrequency.set(id, 1.0);
      if (this.compressor) this.compressor.compress(id, embedding, 1.0);
    }
    this.healthMonitor.recordInsert(performance.now() - start);
  }

  async insertBatchAsync(items: Array<{ id: string; embedding: Float32Array; metadata?: Record<string, unknown> }>): Promise<void> {
    this.ensureAlive();
    const start = performance.now();
    await this.backend.insertBatchAsync(items);
    if (this.learningEnabled) {
      for (const item of items) {
        this.accessFrequency.set(item.id, 1.0);
        if (this.compressor) this.compressor.compress(item.id, item.embedding, 1.0);
      }
    }
    this.healthMonitor.recordInsert((performance.now() - start) / Math.max(1, items.length));
  }

  async searchAsync(query: Float32Array, k: number, options?: SearchOptions): Promise<SearchResult[]> {
    this.ensureAlive();
    const start = performance.now();
    let enhanced = query, route: string | undefined, trajId: number | undefined, ef = options?.efSearch;

    if (this.learningEnabled) {
      if (this.router) {
        const matches = this.router.route(query, 3);
        if (matches.length > 0) { route = matches[0].intent; if (!ef) ef = this.selectEf(matches); }
      }
      if (this.sona) {
        try { enhanced = this.sona.enhance(query); this._searchesEnhanced++; } catch { enhanced = query; }
        try { trajId = this.sona.beginTrajectory(enhanced); if (route) this.sona.setRoute(trajId, route); } catch { /* skip */ }
      }
    }

    const results = await this.backend.searchAsync(enhanced, k, ef ? { ...options, efSearch: ef } : options);
    this.healthMonitor.recordSearch(performance.now() - start);

    if (this.learningEnabled) {
      this.totalSearches++;
      const qCopy = new Float32Array(query), rCopy = [...results]; // single copy, shared below
      for (const r of rCopy) this.accessFrequency.set(r.id, Math.min(1, (this.accessFrequency.get(r.id) ?? 0) + 0.01));
      if (this.recentSearches.length >= RECENT_CAP) this.recentSearches.shift();
      this.recentSearches.push({ query: qCopy, results: rCopy });

      if (trajId !== undefined && this.sona && rCopy.length > 0) {
        try {
          if (this._simBuf.length < rCopy.length) this._simBuf = new Float32Array(rCopy.length);
          for (let i = 0; i < rCopy.length; i++) this._simBuf[i] = rCopy[i].similarity;
          this.sona.addStep(trajId, this._simBuf.subarray(0, rCopy.length), rCopy[0].similarity);
        } catch { /* skip */ }
      }
      if (trajId !== undefined) {
        const qid = `q_${this.trajectoryCounter++}`;
        this.activeTrajectories.set(qid, { id: trajId, queryEmbedding: qCopy, results: rCopy, route, startedAt: Date.now() });
        if (this.activeTrajectories.size > 500) this.expireTrajectories();
      }
    }
    return results;
  }

  async removeAsync(id: string): Promise<boolean> {
    this.ensureAlive();
    const ok = await this.backend.removeAsync(id);
    if (ok) { this.accessFrequency.delete(id); if (this.compressor) this.compressor.remove(id); }
    return ok;
  }

  async getStatsAsync(): Promise<VectorStats> { return this.backend.getStatsAsync(); }
  async flush(): Promise<void> { return this.backend.flush(); }

  // ─── Sync VectorBackend (delegation) ───

  insert(id: string, embedding: Float32Array, metadata?: Record<string, unknown>): void {
    this.backend.insert(id, embedding, metadata);
    if (this.learningEnabled) this.accessFrequency.set(id, 1.0);
  }
  insertBatch(items: Array<{ id: string; embedding: Float32Array; metadata?: Record<string, unknown> }>): void { this.backend.insertBatch(items); }
  search(query: Float32Array, k: number, options?: SearchOptions): SearchResult[] { return this.backend.search(query, k, options); }
  remove(id: string): boolean { return this.backend.remove(id); }
  getStats(): VectorStats { return this.backend.getStats(); }
  async save(path: string): Promise<void> { return this.backend.save(path); }
  async load(path: string): Promise<void> { return this.backend.load(path); }
  close(): void { this.destroy(); }

  // ─── Session lifecycle (Phase 4) ───

  async beginSession(agentId: string): Promise<string> {
    this.ensureAlive();
    if (!this.federated) return agentId;
    this.activeSessions.set(agentId, await this.federated.beginSession(agentId));
    return agentId;
  }

  async endSession(agentId: string, quality: number): Promise<void> {
    this.ensureAlive();
    const handle = this.activeSessions.get(agentId);
    if (!handle) return;
    handle.end();
    this.activeSessions.delete(agentId);
    if (this.federated && Math.min(Math.max(0, quality), 1) > 0.5) this.federated.activateAdapter('default');
  }

  // ─── Feedback (Phase 3) ───

  recordFeedback(queryId: string, quality: number): void {
    this.ensureAlive();
    const q = Math.min(Math.max(0, quality), 1);
    const traj = this.activeTrajectories.get(queryId);
    if (!traj) return;

    if (this.sona) try { this.sona.endTrajectory(traj.id, q); } catch { /* skip */ }
    this.activeTrajectories.delete(queryId);
    this._trajectoriesRecorded++;

    if (this.trainer && traj.results.length > 0) this.createSamples(traj, q);
    for (const h of this.activeSessions.values()) try { h.recordTrajectory(traj.queryEmbedding, q, traj.route); } catch { /* skip */ }
  }

  // ─── Learning control (Phase 5) ───

  async tick(): Promise<void> {
    this.ensureAlive();
    if (!this.learningEnabled || this.tickMutex) return;
    this.tickMutex = true;
    try {
      if (this.sona) try { this.sona.tick(); } catch { /* skip */ }
      const batchSize = this.config.trainingBatchSize ?? 32;
      if (this.trainer && this.sampleBuffer.length >= batchSize) {
        try { this.trainer.trainBatch(this.sampleBuffer.splice(0, batchSize)); this._contrastiveBatches++; } catch { /* skip */ }
      }
      if (this.solver) {
        try { this.solver.train({ count: this.config.solverTrainCount ?? 50, minDifficulty: this.config.solverMinDifficulty ?? 1, maxDifficulty: this.config.solverMaxDifficulty ?? 5 }); this._solverTrainCount++; } catch { /* skip */ }
      }
      if (this.compressor && this.totalSearches > 0) {
        for (const [id, freq] of this.accessFrequency) {
          const d = freq * 0.99;
          this.accessFrequency.set(id, d);
          try { this.compressor.updateFrequency(id, d); } catch { /* skip */ }
        }
      }
      if (this._tickCount > 0 && this._tickCount % FREQ_PRUNE_INTERVAL === 0) {
        for (const [id, f] of this.accessFrequency) { if (f < FREQ_PRUNE_THRESHOLD) this.accessFrequency.delete(id); }
      }
      try { this.healthMonitor.assess(this.backend.indexStats()); } catch { /* skip */ }
      if (this.federated) try { this.federated.consolidate(); } catch { /* skip */ }
      this._tickCount++;
      const interval = this.config.acceptanceIntervalTicks ?? 100;
      if (this.solver && this._tickCount % interval === 0 && this._tickCount > 0) this.runAcceptanceCheck();
    } finally { this.tickMutex = false; }
  }

  async forceLearn(): Promise<void> {
    this.ensureAlive();
    if (this.sona) try { this.sona.forceLearn(); } catch { /* skip */ }
    if (this.trainer && this.sampleBuffer.length > 0) { try { this.trainer.trainBatch(this.sampleBuffer.splice(0)); this._contrastiveBatches++; } catch { /* skip */ } }
    if (this.solver) { try { this.solver.train({ count: this.config.solverTrainCount ?? 50 }); this._solverTrainCount++; } catch { /* skip */ } }
  }

  // ─── Solver API ───

  getSolverPolicy(): SolverPolicyState | null { if (!this.solver) return null; try { return this.solver.policy(); } catch { return null; } }
  runAcceptance(options?: SolverAcceptanceOptions): SolverAcceptanceManifest | null { if (!this.solver) return null; try { return this.solver.acceptance(options); } catch { return null; } }
  getWitnessChain(): Uint8Array | null { if (!this.solver) return null; try { return this.solver.witnessChain(); } catch { return null; } }

  /**
   * Verify the witness chain using native WASM verification (ADR-007 Phase 1).
   * Falls back to structural check if @ruvector/rvf-wasm is unavailable.
   */
  verifyWitnessChain(): WitnessVerifyResult | null {
    const chain = this.getWitnessChain();
    if (!chain) return null;
    if (this.accelerator) return this.accelerator.verifyWitnessChain(chain);
    return { valid: chain.length > 0 && chain.length % 73 === 0, entryCount: Math.floor(chain.length / 73) };
  }

  /** Get the native accelerator (ADR-007) */
  getAccelerator(): NativeAccelerator | null { return this.accelerator; }

  /** Get accelerator stats (ADR-007) */
  getAcceleratorStats(): AcceleratorStats | null { return this.accelerator?.getStats() ?? null; }

  // ─── Stats & accessors ───

  getLearningStats(): LearningStats {
    return { searchesEnhanced: this._searchesEnhanced, trajectoriesRecorded: this._trajectoriesRecorded,
      contrastiveSamples: this._contrastiveSamples, contrastiveBatches: this._contrastiveBatches,
      tickCount: this._tickCount, solverTrainCount: this._solverTrainCount, useAdaptiveEf: this.useAdaptiveEf,
      activeSessionCount: this.activeSessions.size, compressionEntries: this.compressor?.size ?? 0 };
  }

  getBackend(): RvfBackend { return this.backend; }
  get isLearningEnabled(): boolean { return this.learningEnabled; }
  get isAdaptiveEf(): boolean { return this.useAdaptiveEf; }
  get isDestroyed(): boolean { return this._destroyed; }

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;
    for (const [id, h] of this.activeSessions) { try { h.end(); } catch { /* skip */ } this.activeSessions.delete(id); }
    for (const [, t] of this.activeTrajectories) { if (this.sona) try { this.sona.endTrajectory(t.id, 0.5); } catch { /* skip */ } }
    this.activeTrajectories.clear();
    this.accelerator = null;
    for (const c of [this.solver, this.federated, this.trainer, this.compressor, this.router, this.sona] as Array<{ destroy(): void } | null>) {
      if (c) try { c.destroy(); } catch { /* skip */ }
    }
    this.backend.close();
    this.sampleBuffer = [];
    this.recentSearches = [];
    this.accessFrequency.clear();
    this._simBuf = new Float32Array(0);
  }

  // ─── Private ───

  private async initComponents(): Promise<void> {
    const dim = this.dim;
    try { const { NativeAccelerator: N } = await import('./NativeAccelerator.js'); this.accelerator = new N(); await this.accelerator.initialize(); } catch { /* skip */ }
    try { const { SonaLearningBackend: S } = await import('./SonaLearningBackend.js'); if (await S.isAvailable()) this.sona = await S.create({ hiddenDim: this.config.learningDimension ?? dim }); } catch { /* skip */ }
    try { const { SemanticQueryRouter: R } = await import('./SemanticQueryRouter.js'); this.router = await R.create({ dimension: dim }); } catch { /* skip */ }
    try { const { TemporalCompressor: T } = await import('./AdaptiveIndexTuner.js'); this.compressor = await T.create(); } catch { /* skip */ }
    try { const { ContrastiveTrainer: C } = await import('./ContrastiveTrainer.js'); this.trainer = await C.create({ dimension: dim }); } catch { /* skip */ }
    if (this.config.federated) { try { const { FederatedSessionManager: F } = await import('./FederatedSessionManager.js'); if (await F.isAvailable()) this.federated = await F.create({ dimension: dim }); } catch { /* skip */ } }
    try { const { AgentDBSolver: A } = await import('./RvfSolver.js'); if (await A.isAvailable()) this.solver = await A.create(); } catch { /* skip */ }
  }

  private selectEf(matches: RouteMatch[]): number {
    if (this.solver && this.useAdaptiveEf) {
      try {
        const policy = this.solver.policy();
        if (policy) {
          const rk = matches[0].score > 0.7 ? 'narrow' : matches[0].score > 0.4 ? 'medium' : 'wide';
          const cs = policy.contextStats[rk];
          if (cs) {
            let best = DEFAULT_EF, bestS = -Infinity;
            for (const [k, s] of Object.entries(cs)) {
              if (s.attempts > 0) { const sc = s.successes / s.attempts - s.costEma * 0.01; if (sc > bestS) { bestS = sc; best = parseInt(k, 10) || DEFAULT_EF; } }
            }
            return this.nearestEf(best);
          }
        }
      } catch { /* heuristic fallback */ }
    }
    if (matches.length > 0) {
      const s = matches[0].score;
      if (s > 0.8) return 50; if (s > 0.5) return 100; if (s > 0.2) return 200; return 400;
    }
    return DEFAULT_EF;
  }

  private nearestEf(v: number): number {
    let best = EF_ARMS[0], bd = Math.abs(v - best);
    for (let i = 1; i < EF_ARMS.length; i++) { const d = Math.abs(v - EF_ARMS[i]); if (d < bd) { best = EF_ARMS[i]; bd = d; } }
    return best;
  }

  private createSamples(traj: ActiveTrajectory, quality: number): void {
    if (quality < (this.config.positiveThreshold ?? 0.7) || traj.results.length < 2 || this.sampleBuffer.length >= MAX_SAMPLES) return;
    const negs: Float32Array[] = [];
    for (const r of this.recentSearches) {
      if (r.quality !== undefined && r.quality < (this.config.negativeThreshold ?? 0.3) && r.results.length > 0) {
        negs.push(new Float32Array(r.query));
        if (negs.length >= 4) break;
      }
    }
    if (negs.length > 0) {
      const pos = new Float32Array(traj.queryEmbedding.length);
      for (let i = 0; i < pos.length; i++) pos[i] = traj.queryEmbedding[i] + (Math.random() - 0.5) * 0.05;
      this.sampleBuffer.push({ anchor: traj.queryEmbedding, positive: pos, negatives: negs });
      this._contrastiveSamples++;
    }
  }

  private expireTrajectories(): void {
    const now = Date.now();
    for (const [k, t] of this.activeTrajectories) {
      if (now - t.startedAt > 60_000) {
        if (this.sona) try { this.sona.endTrajectory(t.id, 0.5); } catch { /* skip */ }
        this.activeTrajectories.delete(k);
      }
    }
  }

  private runAcceptanceCheck(): void {
    if (!this.solver) return;
    try {
      const m = this.solver.acceptance({ cycles: 3, holdoutSize: this.config.acceptanceHoldoutSize ?? 30, trainingPerCycle: 100 });
      this.useAdaptiveEf = m.allPassed && m.modeC.finalAccuracy >= m.modeA.finalAccuracy;
    } catch { /* skip */ }
  }

  private ensureAlive(): void { if (this._destroyed) throw new Error('SelfLearningRvfBackend has been destroyed.'); }
}
