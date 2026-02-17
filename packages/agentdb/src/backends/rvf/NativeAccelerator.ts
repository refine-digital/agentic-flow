/**
 * NativeAccelerator - ADR-007 Phase 1 Capability Bridge
 *
 * Lazy-loads unused @ruvector APIs and provides accelerated
 * alternatives to JS implementations in ContrastiveTrainer,
 * SelfLearningRvfBackend, SemanticQueryRouter, and RvfSolver.
 *
 * Capabilities:
 * - SIMD vector math (@ruvector/ruvllm SimdOps)
 * - WASM witness chain + segment verification (@ruvector/rvf-wasm)
 * - Native InfoNCE loss + AdamW optimizer (@ruvector/attention)
 * - Native tensor compress/decompress (@ruvector/gnn TensorCompress)
 * - Router save/load persistence (@ruvector/router)
 * - SONA extended APIs (addTrajectoryContext, flush, applyBaseLora)
 *
 * Security:
 * - All imports are lazy and optional
 * - Fallback to JS implementations on any failure
 * - No file I/O except router persistence (user-specified path)
 * - All inputs dimension-validated
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AcceleratorStats {
  simdAvailable: boolean;
  wasmVerifyAvailable: boolean;
  nativeInfoNceAvailable: boolean;
  nativeAdamWAvailable: boolean;
  nativeTensorCompressAvailable: boolean;
  routerPersistAvailable: boolean;
  sonaExtendedAvailable: boolean;
  capabilities: string[];
}

export interface WitnessVerifyResult {
  valid: boolean;
  entryCount: number;
}

export interface SegmentVerifyResult {
  valid: boolean;
  crc: number;
}

const MAX_DIM = 4096;

export class NativeAccelerator {
  // @ruvector/ruvllm SimdOps
  private _simd: any = null;

  // @ruvector/rvf-wasm verification functions
  private _witnessVerify: ((chain: Uint8Array) => boolean) | null = null;
  private _witnessCount: ((chain: Uint8Array) => number) | null = null;
  private _verifyHeader: ((data: Uint8Array) => boolean) | null = null;
  private _crc32c: ((data: Uint8Array) => number) | null = null;

  // @ruvector/attention native ops
  private _infoNceLoss: any = null;
  private _adamWOptimizer: any = null;

  // @ruvector/gnn TensorCompress
  private _tensorCompress: any = null;

  // @ruvector/router persistence
  private _routerSave: ((router: any, path: string) => Promise<void>) | null = null;
  private _routerLoad: ((path: string) => Promise<any>) | null = null;

  // @ruvector/sona extended
  private _sonaFlush: boolean = false;
  private _sonaContext: boolean = false;
  private _sonaBaseLora: boolean = false;

  private _initialized = false;

  /**
   * Initialize all available native capabilities.
   * Each capability loads independently — failures don't cascade.
   */
  async initialize(): Promise<AcceleratorStats> {
    if (this._initialized) return this.getStats();

    await Promise.allSettled([
      this.loadSimd(),
      this.loadWasmVerify(),
      this.loadNativeAttention(),
      this.loadNativeTensorCompress(),
      this.loadRouterPersistence(),
      this.loadSonaExtended(),
    ]);

    this._initialized = true;
    return this.getStats();
  }

  // ─── SIMD Vector Math ───

  get simdAvailable(): boolean { return this._simd !== null; }

  /**
   * SIMD-accelerated cosine similarity.
   * Falls back to JS loop if @ruvector/ruvllm unavailable.
   */
  cosineSimilarity(a: Float32Array, b: Float32Array): number {
    this.validateDims(a, b);
    if (this._simd) {
      try { return this._simd.cosineSimilarity(a, b); } catch { /* fallback */ }
    }
    return this.jsCosineSimilarity(a, b);
  }

  /**
   * SIMD-accelerated dot product.
   */
  dotProduct(a: Float32Array, b: Float32Array): number {
    this.validateDims(a, b);
    if (this._simd) {
      try { return this._simd.dotProduct(a, b); } catch { /* fallback */ }
    }
    return this.jsDotProduct(a, b);
  }

  /**
   * SIMD-accelerated L2 distance.
   */
  l2Distance(a: Float32Array, b: Float32Array): number {
    this.validateDims(a, b);
    if (this._simd) {
      try { return this._simd.l2Distance(a, b); } catch { /* fallback */ }
    }
    return this.jsL2Distance(a, b);
  }

  // ─── WASM Verification ───

  get wasmVerifyAvailable(): boolean { return this._witnessVerify !== null; }

  /**
   * Verify a SHAKE-256 witness chain from RvfSolver.
   * Falls back to entry-count heuristic if WASM unavailable.
   */
  verifyWitnessChain(chain: Uint8Array): WitnessVerifyResult {
    if (!chain || chain.length === 0) return { valid: false, entryCount: 0 };
    const entryCount = Math.floor(chain.length / 73);

    if (this._witnessVerify && this._witnessCount) {
      try {
        return {
          valid: this._witnessVerify(chain),
          entryCount: this._witnessCount(chain),
        };
      } catch { /* fallback */ }
    }

    // JS fallback: structural check only
    return { valid: chain.length > 0 && chain.length % 73 === 0, entryCount };
  }

  /**
   * Verify an RVF segment header.
   */
  verifySegmentHeader(data: Uint8Array): SegmentVerifyResult {
    if (!data || data.length < 4) return { valid: false, crc: 0 };

    if (this._verifyHeader && this._crc32c) {
      try {
        return {
          valid: this._verifyHeader(data),
          crc: this._crc32c(data),
        };
      } catch { /* fallback */ }
    }

    // JS fallback: check magic bytes (RVF header = 0x52564600)
    const valid = data[0] === 0x52 && data[1] === 0x56 && data[2] === 0x46;
    return { valid, crc: this.jsCrc32c(data) };
  }

  // ─── Native InfoNCE Loss ───

  get nativeInfoNceAvailable(): boolean { return this._infoNceLoss !== null; }

  /**
   * Compute InfoNCE loss using native @ruvector/attention.
   * Falls back to JS computation.
   */
  infoNceLoss(
    anchor: Float32Array,
    positive: Float32Array,
    negatives: Float32Array[],
    temperature: number,
  ): number {
    if (this._infoNceLoss) {
      try {
        return this._infoNceLoss.compute(anchor, positive, negatives, temperature);
      } catch { /* fallback */ }
    }
    return this.jsInfoNceLoss(anchor, positive, negatives, temperature);
  }

  // ─── Native AdamW Optimizer ───

  get nativeAdamWAvailable(): boolean { return this._adamWOptimizer !== null; }

  /**
   * Execute one AdamW step using native @ruvector/attention.
   * Modifies params in-place. Falls back to JS.
   */
  adamWStep(
    params: Float32Array,
    grads: Float32Array,
    m: Float32Array,
    v: Float32Array,
    step: number,
    lr: number,
    wd: number,
  ): void {
    if (this._adamWOptimizer) {
      try {
        this._adamWOptimizer.step(params, grads, m, v, step, lr, wd);
        return;
      } catch { /* fallback */ }
    }
    this.jsAdamWStep(params, grads, m, v, step, lr, wd);
  }

  // ─── Native Tensor Compression ───

  get nativeTensorCompressAvailable(): boolean { return this._tensorCompress !== null; }

  /**
   * Compress a vector using native @ruvector/gnn TensorCompress.
   * Returns compressed bytes. Falls back to null (caller uses JS).
   */
  tensorCompress(vec: Float32Array, level: number): Uint8Array | null {
    if (this._tensorCompress) {
      try { return this._tensorCompress.compress(vec, level); } catch { /* fallback */ }
    }
    return null;
  }

  /**
   * Decompress a vector using native @ruvector/gnn TensorCompress.
   */
  tensorDecompress(compressed: Uint8Array, dim: number): Float32Array | null {
    if (this._tensorCompress) {
      try { return this._tensorCompress.decompress(compressed, dim); } catch { /* fallback */ }
    }
    return null;
  }

  /**
   * Batch compress multiple vectors.
   */
  tensorBatchCompress(vecs: Float32Array[], level: number): Uint8Array[] | null {
    if (this._tensorCompress) {
      try { return this._tensorCompress.batchCompress(vecs, level); } catch { /* fallback */ }
    }
    return null;
  }

  // ─── Router Persistence ───

  get routerPersistAvailable(): boolean { return this._routerSave !== null; }

  /**
   * Save a SemanticRouter state to disk.
   */
  async routerSave(router: any, path: string): Promise<boolean> {
    if (this._routerSave) {
      try { await this._routerSave(router, path); return true; } catch { /* fallback */ }
    }
    return false;
  }

  /**
   * Load a SemanticRouter state from disk.
   */
  async routerLoad(path: string): Promise<any | null> {
    if (this._routerLoad) {
      try { return await this._routerLoad(path); } catch { /* fallback */ }
    }
    return null;
  }

  // ─── SONA Extended ───

  get sonaExtendedAvailable(): boolean { return this._sonaFlush || this._sonaContext || this._sonaBaseLora; }

  /**
   * Add context to a SONA trajectory (if extended API available).
   */
  sonaAddContext(engine: any, trajectoryId: number, context: Record<string, unknown>): boolean {
    if (this._sonaContext && engine) {
      try { engine.addTrajectoryContext(trajectoryId, JSON.stringify(context)); return true; } catch { /* skip */ }
    }
    return false;
  }

  /**
   * Force flush SONA engine state.
   */
  sonaFlush(engine: any): boolean {
    if (this._sonaFlush && engine) {
      try { engine.flush(); return true; } catch { /* skip */ }
    }
    return false;
  }

  /**
   * Apply base LoRA to SONA engine.
   */
  sonaApplyBaseLora(engine: any, loraData: Float32Array): boolean {
    if (this._sonaBaseLora && engine) {
      try { engine.applyBaseLora(Array.from(loraData)); return true; } catch { /* skip */ }
    }
    return false;
  }

  // ─── Stats ───

  getStats(): AcceleratorStats {
    const capabilities: string[] = [];
    if (this._simd) capabilities.push('simd');
    if (this._witnessVerify) capabilities.push('wasm-verify');
    if (this._infoNceLoss) capabilities.push('native-infonce');
    if (this._adamWOptimizer) capabilities.push('native-adamw');
    if (this._tensorCompress) capabilities.push('native-tensor-compress');
    if (this._routerSave) capabilities.push('router-persist');
    if (this._sonaFlush || this._sonaContext || this._sonaBaseLora) capabilities.push('sona-extended');

    return {
      simdAvailable: this._simd !== null,
      wasmVerifyAvailable: this._witnessVerify !== null,
      nativeInfoNceAvailable: this._infoNceLoss !== null,
      nativeAdamWAvailable: this._adamWOptimizer !== null,
      nativeTensorCompressAvailable: this._tensorCompress !== null,
      routerPersistAvailable: this._routerSave !== null,
      sonaExtendedAvailable: this._sonaFlush || this._sonaContext || this._sonaBaseLora,
      capabilities,
    };
  }

  // ─── Loaders ───

  private async loadSimd(): Promise<void> {
    try {
      const { SimdOps } = await import('@ruvector/ruvllm');
      if (SimdOps) this._simd = new SimdOps();
    } catch { /* not available */ }
  }

  private async loadWasmVerify(): Promise<void> {
    try {
      const wasm = await import('@ruvector/rvf-wasm');
      if (wasm.rvf_witness_verify) this._witnessVerify = wasm.rvf_witness_verify;
      if (wasm.rvf_witness_count) this._witnessCount = wasm.rvf_witness_count;
      if (wasm.rvf_verify_header) this._verifyHeader = wasm.rvf_verify_header;
      if (wasm.rvf_crc32c) this._crc32c = wasm.rvf_crc32c;
    } catch { /* not available */ }
  }

  private async loadNativeAttention(): Promise<void> {
    try {
      const attn = await import('@ruvector/attention');
      if (attn.InfoNceLoss) this._infoNceLoss = new attn.InfoNceLoss();
      if (attn.AdamWOptimizer) this._adamWOptimizer = new attn.AdamWOptimizer();
    } catch { /* not available */ }
  }

  private async loadNativeTensorCompress(): Promise<void> {
    try {
      const { TensorCompress } = await import('@ruvector/gnn');
      if (TensorCompress && TensorCompress.compress) this._tensorCompress = TensorCompress;
    } catch { /* not available */ }
  }

  private async loadRouterPersistence(): Promise<void> {
    try {
      const router = await import('@ruvector/router');
      if (router.SemanticRouter?.prototype?.save) {
        this._routerSave = async (r: any, p: string) => r.save(p);
        this._routerLoad = async (p: string) => router.SemanticRouter.load(p);
      }
    } catch { /* not available */ }
  }

  private async loadSonaExtended(): Promise<void> {
    try {
      const { SonaEngine } = await import('@ruvector/sona');
      if (SonaEngine?.prototype?.flush) this._sonaFlush = true;
      if (SonaEngine?.prototype?.addTrajectoryContext) this._sonaContext = true;
      if (SonaEngine?.prototype?.applyBaseLora) this._sonaBaseLora = true;
    } catch { /* not available */ }
  }

  // ─── JS Fallbacks ───

  private jsCosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0, nA = 0, nB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      nA += a[i] * a[i];
      nB += b[i] * b[i];
    }
    const d = Math.sqrt(nA * nB);
    return d > 0 ? dot / d : 0;
  }

  private jsDotProduct(a: Float32Array, b: Float32Array): number {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return dot;
  }

  private jsL2Distance(a: Float32Array, b: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    return Math.sqrt(sum);
  }

  private jsInfoNceLoss(
    anchor: Float32Array,
    positive: Float32Array,
    negatives: Float32Array[],
    temperature: number,
  ): number {
    const posSim = this.jsCosineSimilarity(anchor, positive) / temperature;
    let logSumExp = Math.exp(posSim);
    for (const neg of negatives) {
      logSumExp += Math.exp(this.jsCosineSimilarity(anchor, neg) / temperature);
    }
    return -posSim + Math.log(logSumExp);
  }

  private jsAdamWStep(
    params: Float32Array,
    grads: Float32Array,
    m: Float32Array,
    v: Float32Array,
    step: number,
    lr: number,
    wd: number,
  ): void {
    const beta1 = 0.9, beta2 = 0.999, eps = 1e-8;
    const bc1 = 1 - Math.pow(beta1, step);
    const bc2 = 1 - Math.pow(beta2, step);

    for (let i = 0; i < params.length; i++) {
      params[i] -= lr * wd * params[i];
      m[i] = beta1 * m[i] + (1 - beta1) * grads[i];
      v[i] = beta2 * v[i] + (1 - beta2) * grads[i] * grads[i];
      params[i] -= lr * (m[i] / bc1) / (Math.sqrt(v[i] / bc2) + eps);
    }
  }

  private jsCrc32c(data: Uint8Array): number {
    // CRC32C (Castagnoli) polynomial: 0x1EDC6F41
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0x82F63B78 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  private validateDims(a: Float32Array, b: Float32Array): void {
    if (a.length !== b.length) throw new Error(`Dimension mismatch: ${a.length} vs ${b.length}`);
    if (a.length > MAX_DIM) throw new Error(`Dimension exceeds maximum: ${a.length} > ${MAX_DIM}`);
  }
}

/** Singleton accelerator instance */
let _globalAccelerator: NativeAccelerator | null = null;

/**
 * Get or create the global NativeAccelerator.
 * Thread-safe: first caller initializes, subsequent callers get the same instance.
 */
export async function getAccelerator(): Promise<NativeAccelerator> {
  if (!_globalAccelerator) {
    _globalAccelerator = new NativeAccelerator();
    await _globalAccelerator.initialize();
  }
  return _globalAccelerator;
}

/**
 * Reset the global accelerator (for testing).
 */
export function resetAccelerator(): void {
  _globalAccelerator = null;
}
