/**
 * RuVector Edge WASM Integration
 *
 * Provides WASM-accelerated primitives for:
 * - Ed25519 identity generation (P2P Swarm)
 * - HNSW vector indexing (150x faster search)
 * - Semantic task matching (agent routing)
 *
 * Falls back to pure JS implementations when WASM unavailable.
 */

import { logger } from '../utils/logger.js';

// WASM module state
let wasmInitialized = false;
let wasmModule: any = null;
let WasmIdentity: any = null;
let WasmHnswIndex: any = null;
let WasmSemanticMatcher: any = null;

/**
 * Check if WASM is supported in current environment
 */
export function isWasmSupported(): boolean {
  try {
    if (typeof WebAssembly === 'object' &&
        typeof WebAssembly.instantiate === 'function') {
      // Test with minimal WASM module
      const module = new WebAssembly.Module(
        new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
      );
      return module instanceof WebAssembly.Module;
    }
  } catch {
    // WASM not supported
  }
  return false;
}

/**
 * Initialize RuVector Edge WASM module
 */
export async function initRuVectorWasm(): Promise<boolean> {
  if (wasmInitialized) return true;

  if (!isWasmSupported()) {
    logger.debug('WASM not supported, using JS fallbacks');
    return false;
  }

  try {
    // Dynamic import of @ruvector/edge-full/edge (replaces @ruvector/edge)
    const ruvectorEdge = await import('@ruvector/edge-full/edge');

    // Initialize WASM
    if (ruvectorEdge.default) {
      await ruvectorEdge.default();
    }

    // Export WASM classes
    WasmIdentity = ruvectorEdge.WasmIdentity;
    WasmHnswIndex = ruvectorEdge.WasmHnswIndex;
    WasmSemanticMatcher = ruvectorEdge.WasmSemanticMatcher;
    wasmModule = ruvectorEdge;
    wasmInitialized = true;

    logger.info('RuVector Edge WASM initialized', {
      features: ['WasmIdentity', 'WasmHnswIndex', 'WasmSemanticMatcher'],
    });

    return true;
  } catch (error) {
    logger.debug('Failed to initialize RuVector WASM', { error });
    return false;
  }
}

/**
 * Check if WASM module is initialized
 */
export function isWasmInitialized(): boolean {
  return wasmInitialized;
}

//=============================================================================
// WASM Identity - Ed25519 Key Generation
//=============================================================================

export interface WasmIdentityKeys {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  publicKeyHex: string;
}

/**
 * Generate Ed25519 identity using WASM (or fallback to Node crypto)
 */
export async function generateIdentity(): Promise<WasmIdentityKeys> {
  if (wasmInitialized && WasmIdentity) {
    try {
      const identity = WasmIdentity.generate();
      return {
        publicKey: identity.public_key(),
        secretKey: identity.secret_key(),
        publicKeyHex: Buffer.from(identity.public_key()).toString('hex'),
      };
    } catch (error) {
      logger.warn('WASM identity generation failed, using fallback', { error });
    }
  }

  // Fallback to Node.js crypto
  const crypto = await import('crypto');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

  const pubKeyDer = publicKey.export({ type: 'spki', format: 'der' });
  const privKeyDer = privateKey.export({ type: 'pkcs8', format: 'der' });

  // Extract raw keys from DER format (last 32 bytes for ed25519)
  const pubKeyRaw = pubKeyDer.slice(-32);
  const privKeyRaw = privKeyDer.slice(-32);

  return {
    publicKey: new Uint8Array(pubKeyRaw),
    secretKey: new Uint8Array(privKeyRaw),
    publicKeyHex: pubKeyRaw.toString('hex'),
  };
}

/**
 * Sign data using WASM identity (or fallback)
 */
export async function signData(
  data: Uint8Array,
  secretKey: Uint8Array
): Promise<Uint8Array> {
  if (wasmInitialized && WasmIdentity) {
    try {
      const identity = WasmIdentity.from_secret_key(secretKey);
      return identity.sign(data);
    } catch (error) {
      logger.warn('WASM signing failed, using fallback', { error });
    }
  }

  // Fallback to Node.js crypto
  const crypto = await import('crypto');
  const privateKey = crypto.createPrivateKey({
    key: Buffer.concat([
      // PKCS8 header for ed25519
      Buffer.from('302e020100300506032b657004220420', 'hex'),
      Buffer.from(secretKey),
    ]),
    format: 'der',
    type: 'pkcs8',
  });

  const signature = crypto.sign(null, Buffer.from(data), privateKey);
  return new Uint8Array(signature);
}

/**
 * Verify signature using WASM (or fallback)
 */
export async function verifySignature(
  data: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  if (wasmInitialized && WasmIdentity) {
    try {
      return WasmIdentity.verify(publicKey, data, signature);
    } catch (error) {
      logger.warn('WASM verification failed, using fallback', { error });
    }
  }

  // Fallback to Node.js crypto
  const crypto = await import('crypto');
  const pubKey = crypto.createPublicKey({
    key: Buffer.concat([
      // SPKI header for ed25519
      Buffer.from('302a300506032b6570032100', 'hex'),
      Buffer.from(publicKey),
    ]),
    format: 'der',
    type: 'spki',
  });

  return crypto.verify(null, Buffer.from(data), pubKey, Buffer.from(signature));
}

//=============================================================================
// WASM HNSW Index - Fast Vector Search
//=============================================================================

export interface HnswSearchResult {
  index: number;
  distance: number;
}

/**
 * HNSW Index wrapper with WASM acceleration
 */
export class RuVectorHnswIndex {
  private wasmIndex: any = null;
  private jsVectors: Float32Array[] = [];
  private dimensions: number;
  private m: number;
  private efConstruction: number;

  constructor(dimensions: number, m: number = 16, efConstruction: number = 200) {
    this.dimensions = dimensions;
    this.m = m;
    this.efConstruction = efConstruction;

    if (wasmInitialized && WasmHnswIndex) {
      try {
        this.wasmIndex = new WasmHnswIndex(dimensions, m, efConstruction);
        logger.debug('Created WASM HNSW index', { dimensions, m, efConstruction });
      } catch (error) {
        logger.warn('Failed to create WASM HNSW index', { error });
      }
    }
  }

  /**
   * Add vector to index
   */
  add(vector: Float32Array | number[]): number {
    const vec = vector instanceof Float32Array ? vector : new Float32Array(vector);

    if (this.wasmIndex) {
      try {
        return this.wasmIndex.add(vec);
      } catch (error) {
        logger.warn('WASM add failed, using JS fallback', { error });
      }
    }

    // JS fallback - simple linear storage
    const idx = this.jsVectors.length;
    this.jsVectors.push(vec);
    return idx;
  }

  /**
   * Search for k nearest neighbors
   */
  search(query: Float32Array | number[], k: number = 10): HnswSearchResult[] {
    const vec = query instanceof Float32Array ? query : new Float32Array(query);

    if (this.wasmIndex) {
      try {
        const results = this.wasmIndex.search(vec, k);
        return results.map((r: any) => ({
          index: r.index,
          distance: r.distance,
        }));
      } catch (error) {
        logger.warn('WASM search failed, using JS fallback', { error });
      }
    }

    // JS fallback - brute force search
    const distances: HnswSearchResult[] = this.jsVectors.map((v, idx) => ({
      index: idx,
      distance: this.euclideanDistance(vec, v),
    }));

    return distances.sort((a, b) => a.distance - b.distance).slice(0, k);
  }

  /**
   * Get index size
   */
  size(): number {
    if (this.wasmIndex) {
      try {
        return this.wasmIndex.len();
      } catch {
        // Fall through
      }
    }
    return this.jsVectors.length;
  }

  /**
   * Check if using WASM acceleration
   */
  isWasmAccelerated(): boolean {
    return this.wasmIndex !== null;
  }

  private euclideanDistance(a: Float32Array, b: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }
}

//=============================================================================
// WASM Semantic Matcher - Agent Routing
//=============================================================================

export interface SemanticMatch {
  agent: string;
  score: number;
  capabilities: string[];
}

/**
 * Semantic matcher for intelligent agent routing
 */
export class RuVectorSemanticMatcher {
  private wasmMatcher: any = null;
  private jsAgents: Map<string, { embedding: Float32Array; capabilities: string[] }> = new Map();

  constructor() {
    if (wasmInitialized && WasmSemanticMatcher) {
      try {
        this.wasmMatcher = new WasmSemanticMatcher();
        logger.debug('Created WASM semantic matcher');
      } catch (error) {
        logger.warn('Failed to create WASM semantic matcher', { error });
      }
    }
  }

  /**
   * Register agent with capabilities
   */
  registerAgent(agentId: string, embedding: Float32Array | number[], capabilities: string[]): void {
    const vec = embedding instanceof Float32Array ? embedding : new Float32Array(embedding);

    if (this.wasmMatcher) {
      try {
        this.wasmMatcher.register_agent(agentId, vec, capabilities);
        return;
      } catch (error) {
        logger.warn('WASM register failed, using JS fallback', { error });
      }
    }

    // JS fallback
    this.jsAgents.set(agentId, { embedding: vec, capabilities });
  }

  /**
   * Find best matching agents for task
   */
  matchTask(taskEmbedding: Float32Array | number[], topK: number = 5): SemanticMatch[] {
    const vec = taskEmbedding instanceof Float32Array ? taskEmbedding : new Float32Array(taskEmbedding);

    if (this.wasmMatcher) {
      try {
        const matches = this.wasmMatcher.match_task(vec, topK);
        return matches.map((m: any) => ({
          agent: m.agent_id,
          score: m.score,
          capabilities: m.capabilities,
        }));
      } catch (error) {
        logger.warn('WASM match failed, using JS fallback', { error });
      }
    }

    // JS fallback - cosine similarity
    const scores: SemanticMatch[] = [];
    for (const [agentId, data] of this.jsAgents) {
      const score = this.cosineSimilarity(vec, data.embedding);
      scores.push({
        agent: agentId,
        score,
        capabilities: data.capabilities,
      });
    }

    return scores.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * Check if using WASM acceleration
   */
  isWasmAccelerated(): boolean {
    return this.wasmMatcher !== null;
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

//=============================================================================
// Auto-initialization
//=============================================================================

// Try to initialize on module load (non-blocking)
if (typeof process !== 'undefined' && process.env?.AGENTIC_FLOW_WASM !== 'false') {
  initRuVectorWasm().catch(() => {
    // Silent fail - will use JS fallbacks
  });
}

export default {
  isWasmSupported,
  initRuVectorWasm,
  isWasmInitialized,
  generateIdentity,
  signData,
  verifySignature,
  RuVectorHnswIndex,
  RuVectorSemanticMatcher,
};
