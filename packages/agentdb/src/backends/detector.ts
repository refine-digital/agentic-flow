/**
 * Backend Detection - Auto-detect available vector backends
 *
 * Detection priority:
 * 1. RuVector (@ruvector/core) - preferred for performance
 * 2. RVF (@ruvector/rvf) - single-file format with crash safety
 * 3. HNSWLib (hnswlib-node) - stable fallback
 *
 * Additional features detected:
 * - @ruvector/gnn - GNN learning capabilities
 * - @ruvector/graph-node - Graph database capabilities
 * - @ruvector/rvf-node - Native N-API RVF backend
 * - @ruvector/rvf-wasm - WASM RVF backend
 */

/**
 * Backend type identifier
 */
export type BackendType = 'ruvector' | 'rvf' | 'hnswlib' | 'auto';

/**
 * Platform information
 */
export interface PlatformInfo {
  /** Operating system */
  platform: NodeJS.Platform;

  /** CPU architecture */
  arch: string;

  /** Combined platform identifier (e.g., 'linux-x64', 'darwin-arm64') */
  combined: string;
}

/**
 * RVF availability check result
 */
export interface RvfAvailability {
  available: boolean;
  node: boolean;
  wasm: boolean;
  solver: boolean;
  version?: string;
}

/**
 * Backend detection result
 */
export interface DetectionResult {
  /** Detected backend type */
  backend: 'ruvector' | 'rvf' | 'hnswlib';

  /** Available feature flags */
  features: {
    /** GNN learning available */
    gnn: boolean;

    /** Graph database available */
    graph: boolean;

    /** Compression available */
    compression: boolean;

    /** RVF single-file format available */
    rvf: boolean;

    /** RVF lineage tracking */
    lineage: boolean;

    /** RVF COW branching */
    branching: boolean;
  };

  /** Platform information */
  platform: PlatformInfo;

  /** Whether native bindings are available (vs WASM fallback) */
  native: boolean;

  /** RVF-specific availability details */
  rvf?: RvfAvailability;

  /** Version information */
  versions?: {
    core?: string;
    gnn?: string;
    graph?: string;
    rvf?: string;
  };
}

/**
 * RuVector availability check result
 */
interface RuVectorAvailability {
  available: boolean;
  native: boolean;
  gnn: boolean;
  graph: boolean;
  version?: string;
}

/**
 * Detect available vector backend and features
 *
 * @returns Detection result with backend type and available features
 */
export async function detectBackend(): Promise<DetectionResult> {
  // Get platform information
  const platform = getPlatformInfo();

  // Check for RuVector (preferred)
  const ruvectorAvailable = await checkRuVector();

  // Check for RVF (second priority)
  const rvfAvailable = await checkRvf();

  if (ruvectorAvailable.available) {
    return {
      backend: 'ruvector',
      features: {
        gnn: ruvectorAvailable.gnn,
        graph: ruvectorAvailable.graph,
        compression: true,
        rvf: rvfAvailable.available,
        lineage: rvfAvailable.available,
        branching: rvfAvailable.available,
      },
      platform,
      native: ruvectorAvailable.native,
      rvf: rvfAvailable,
      versions: {
        core: ruvectorAvailable.version,
        rvf: rvfAvailable.version,
      },
    };
  }

  if (rvfAvailable.available) {
    return {
      backend: 'rvf',
      features: {
        gnn: false,
        graph: false,
        compression: false,
        rvf: true,
        lineage: true,
        branching: true,
      },
      platform,
      native: rvfAvailable.node,
      rvf: rvfAvailable,
      versions: {
        rvf: rvfAvailable.version,
      },
    };
  }

  // Fallback to HNSWLib
  const hnswlibNative = await checkHnswlib();

  return {
    backend: 'hnswlib',
    features: {
      gnn: false,
      graph: false,
      compression: false,
      rvf: false,
      lineage: false,
      branching: false,
    },
    platform,
    native: hnswlibNative,
  };
}

/**
 * Check RuVector availability and features
 */
async function checkRuVector(): Promise<RuVectorAvailability> {
  try {
    // Try to import @ruvector/core
    const core = await import('@ruvector/core');

    // Check if native bindings are available
    const native = core.isNative?.() ?? false;

    // Get version (if available)
    const version = String((core as Record<string, unknown>).version ?? 'unknown');

    // Check for GNN support
    let gnn = false;
    try {
      await import('@ruvector/gnn');
      gnn = true;
    } catch {
      // GNN not available
    }

    // Check for Graph support
    let graph = false;
    try {
      await import('@ruvector/graph-node');
      graph = true;
    } catch {
      // Graph not available
    }

    return {
      available: true,
      native,
      gnn,
      graph,
      version,
    };
  } catch (error) {
    // RuVector not available
    return {
      available: false,
      native: false,
      gnn: false,
      graph: false,
    };
  }
}

/**
 * Check RVF SDK availability and sub-backends
 */
async function checkRvf(): Promise<RvfAvailability> {
  try {
    const rvf = await import('@ruvector/rvf');
    const version = String((rvf as Record<string, unknown>).version ?? 'unknown');

    // Check for N-API native backend
    let node = false;
    try {
      await import('@ruvector/rvf-node');
      node = true;
    } catch {
      // N-API backend not available
    }

    // Check for WASM backend
    let wasm = false;
    try {
      await import('@ruvector/rvf-wasm');
      wasm = true;
    } catch {
      // WASM backend not available
    }

    // Check for solver
    let solver = false;
    try {
      await import('@ruvector/rvf-solver');
      solver = true;
    } catch {
      // Solver not available
    }

    return { available: true, node, wasm, solver, version: String(version) };
  } catch {
    return { available: false, node: false, wasm: false, solver: false };
  }
}

/**
 * Check HNSWLib availability
 */
async function checkHnswlib(): Promise<boolean> {
  try {
    // Try to import hnswlib-node
    await import('hnswlib-node');
    return true;
  } catch {
    // HNSWLib not available
    return false;
  }
}

/**
 * Get platform information
 */
function getPlatformInfo(): PlatformInfo {
  return {
    platform: process.platform,
    arch: process.arch,
    combined: `${process.platform}-${process.arch}`,
  };
}

/**
 * Validate requested backend is available
 *
 * @param requested - Requested backend type
 * @param detected - Detected backend from auto-detection
 * @throws Error if requested backend is not available
 */
export function validateBackend(
  requested: BackendType,
  detected: DetectionResult
): void {
  if (requested === 'auto') {
    return;
  }

  if (requested === 'ruvector' && detected.backend !== 'ruvector') {
    throw new Error(
      'RuVector backend requested but not available.\n' +
        'Install with: npm install @ruvector/core\n' +
        'See: https://github.com/ruvnet/ruvector'
    );
  }

  if (requested === 'rvf' && !detected.features.rvf) {
    throw new Error(
      'RVF backend requested but not available.\n' +
        'Install with: npm install @ruvector/rvf\n' +
        'Native backend: npm install @ruvector/rvf-node\n' +
        'WASM backend: npm install @ruvector/rvf-wasm'
    );
  }

  if (requested === 'hnswlib' && detected.backend !== 'hnswlib') {
    throw new Error(
      'HNSWLib backend requested but not available.\n' +
        'Install with: npm install hnswlib-node'
    );
  }
}

/**
 * Get recommended backend for a given use case
 *
 * @param useCase - Use case identifier
 * @returns Recommended backend type
 */
export function getRecommendedBackend(useCase: string): BackendType {
  const useCaseLower = useCase.toLowerCase();

  // RuVector recommended for advanced GNN/graph features
  if (
    useCaseLower.includes('learning') ||
    useCaseLower.includes('gnn') ||
    useCaseLower.includes('graph') ||
    useCaseLower.includes('compression')
  ) {
    return 'ruvector';
  }

  // RVF recommended for single-file, portable, or lineage use cases
  if (
    useCaseLower.includes('lineage') ||
    useCaseLower.includes('branch') ||
    useCaseLower.includes('portable') ||
    useCaseLower.includes('single-file') ||
    useCaseLower.includes('rvf')
  ) {
    return 'rvf';
  }

  return 'auto';
}

/**
 * Format detection result for display
 *
 * @param result - Detection result
 * @returns Formatted string for console output
 */
export function formatDetectionResult(result: DetectionResult): string {
  const lines: string[] = [];

  lines.push('Backend Detection Results:');
  lines.push('');
  lines.push(`  Backend:     ${result.backend}`);
  lines.push(`  Platform:    ${result.platform.combined}`);
  lines.push(`  Native:      ${result.native ? 'Yes' : 'No (using WASM)'}`);
  lines.push(`  GNN:         ${result.features.gnn ? 'Yes' : 'No'}`);
  lines.push(`  Graph:       ${result.features.graph ? 'Yes' : 'No'}`);
  lines.push(`  Compression: ${result.features.compression ? 'Yes' : 'No'}`);
  lines.push(`  RVF:         ${result.features.rvf ? 'Yes' : 'No'}`);

  if (result.rvf?.available) {
    lines.push(`  RVF N-API:   ${result.rvf.node ? 'Yes' : 'No'}`);
    lines.push(`  RVF WASM:    ${result.rvf.wasm ? 'Yes' : 'No'}`);
    lines.push(`  Lineage:     ${result.features.lineage ? 'Yes' : 'No'}`);
    lines.push(`  Branching:   ${result.features.branching ? 'Yes' : 'No'}`);
  }

  if (result.versions?.core) {
    lines.push(`  Version:     ${result.versions.core}`);
  }
  if (result.versions?.rvf) {
    lines.push(`  RVF Version: ${result.versions.rvf}`);
  }

  lines.push('');

  // Add recommendations
  if (result.backend === 'hnswlib') {
    lines.push('Tip: Install @ruvector/core for 150x faster performance');
    lines.push('   npm install @ruvector/core');
    lines.push('Tip: Install @ruvector/rvf for single-file portable storage');
    lines.push('   npm install @ruvector/rvf @ruvector/rvf-node');
  } else if (result.backend === 'rvf' && !result.features.gnn) {
    lines.push('Tip: Install @ruvector/core for GNN learning capabilities');
    lines.push('   npm install @ruvector/core @ruvector/gnn');
  } else if (!result.features.rvf) {
    lines.push('Tip: Install @ruvector/rvf for single-file portable storage');
    lines.push('   npm install @ruvector/rvf @ruvector/rvf-node');
  } else if (!result.features.gnn) {
    lines.push('Tip: Install @ruvector/gnn for adaptive learning');
    lines.push('   npm install @ruvector/gnn');
  }

  return lines.join('\n');
}
