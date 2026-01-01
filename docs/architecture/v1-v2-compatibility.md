# v1.x to v2.0 API Compatibility Layer Design

**Document Version**: 1.0.0
**Date**: 2025-12-02
**Status**: Design Complete

---

## Overview

This document defines the complete API compatibility layer that enables v1.x code to run unchanged on the v2.0 backend while maintaining full functionality and performance.

---

## Type Definitions

### Core Types

```typescript
// src/compatibility/types.ts

export type APIVersion = '1.x' | '2.0';

export interface CompatibilityConfig {
  // Version control
  version?: APIVersion;
  preferV2?: boolean;

  // Warning configuration
  deprecationWarnings?: boolean;
  strictMode?: boolean;
  logDeprecations?: string;  // File path

  // Feature flags
  features?: {
    agentDB?: boolean;
    attention?: boolean;
    gnnLearning?: boolean;
    causalReasoning?: boolean;
    reasoningBank?: boolean;
  };

  // Performance
  enableOptimizations?: boolean;
  preserveV1Behavior?: boolean;
}

export interface V1Config {
  // Memory
  memoryPath?: string;
  optimizeMemory?: boolean;

  // Swarm
  topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
  maxAgents?: number;
  strategy?: string;

  // LLM
  provider?: string;
  model?: string;

  // Compatibility
  deprecationWarnings?: boolean;
  strictMode?: boolean;
}

export interface V2Config {
  backend: 'agentdb';
  version: '2.0';

  memory: {
    path: string;
    backend: 'ruvector' | 'sqlite';
    enableHNSW?: boolean;
    enableQuantization?: boolean;
    cacheSize?: number;
    batchSize?: number;
  };

  swarm: {
    topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
    maxAgents: number;
    strategy: 'auto' | 'balanced' | 'specialized';
  };

  routing: {
    provider: string;
    model: string;
    optimization: 'quality' | 'balanced' | 'cost' | 'speed';
  };

  intelligence?: {
    attentionMechanisms?: string[];
    gnnLearning?: boolean;
    causalReasoning?: boolean;
    reasoningBank?: boolean;
  };

  compatibility?: {
    v1Mode: boolean;
    preserveV1Behavior: boolean;
    emitWarnings: boolean;
  };
}
```

---

## Main Compatibility Class

```typescript
// src/compatibility/AgenticFlowCompat.ts

import { AgenticFlowV2 } from '../v2/core/AgenticFlowV2';
import { VersionDetector } from './VersionDetector';
import { V1toV2Adapter } from './V1toV2Adapter';
import { DeprecationWarnings } from './DeprecationWarnings';
import type { V1Config, V2Config, CompatibilityConfig } from './types';

/**
 * Unified AgenticFlow class that supports both v1.x and v2.0 APIs
 *
 * This class automatically detects the intended version and routes
 * calls to the appropriate implementation with full backwards compatibility.
 */
export class AgenticFlow {
  private version: '1.x' | '2.0';
  private adapter?: V1toV2Adapter;
  private v2Instance?: AgenticFlowV2;
  private warnings: DeprecationWarnings;

  constructor(config?: V1Config | V2Config | CompatibilityConfig) {
    // Detect intended API version
    const versionInfo = VersionDetector.detect(config, 'AgenticFlow');

    this.version = versionInfo.version;

    // Initialize warning system
    this.warnings = new DeprecationWarnings({
      emitWarnings: config?.deprecationWarnings !== false,
      throwOnDeprecated: (config as CompatibilityConfig)?.strictMode === true,
      logToFile: (config as CompatibilityConfig)?.logDeprecations
    });

    // Initialize appropriate backend
    if (this.version === '1.x') {
      // v1.x mode: use adapter
      this.adapter = new V1toV2Adapter(config as V1Config);
    } else {
      // v2.0 mode: direct instantiation
      this.v2Instance = new AgenticFlowV2(config as V2Config);
    }
  }

  // ==================== v1.x APIs ====================

  /**
   * Initialize swarm (v1.x API)
   * @deprecated Use flow.swarms.create() in v2.0
   */
  async initSwarm(config: {
    topology?: string;
    maxAgents?: number;
    strategy?: string;
  }): Promise<any> {
    if (this.adapter) {
      return await this.adapter.initSwarm(config);
    }

    if (this.v2Instance) {
      this.warnings.warn('initSwarm', {
        message: 'initSwarm() is deprecated. Use swarms.create() in v2.0',
        migration: 'const swarm = await flow.swarms.create({ topology: "mesh" });',
        documentation: 'https://agentic-flow.dev/migration#init-swarm'
      });

      return await this.v2Instance.swarms.create({
        topology: config.topology as any || 'mesh',
        maxAgents: config.maxAgents || 8,
        strategy: config.strategy as any || 'auto'
      });
    }

    throw new Error('Invalid state: No backend initialized');
  }

  /**
   * Spawn an agent (v1.x API)
   * @deprecated Use flow.agents.spawn() in v2.0
   */
  async spawnAgent(type: string, config?: any): Promise<any> {
    if (this.adapter) {
      return await this.adapter.spawnAgent(type, config);
    }

    if (this.v2Instance) {
      this.warnings.warn('spawnAgent', {
        message: 'spawnAgent() is deprecated. Use agents.spawn() in v2.0',
        migration: 'const agent = await flow.agents.spawn({ type: "coder", ...config });',
        documentation: 'https://agentic-flow.dev/migration#spawn-agent'
      });

      return await this.v2Instance.agents.spawn({
        type,
        ...config
      });
    }

    throw new Error('Invalid state: No backend initialized');
  }

  /**
   * Orchestrate a task (v1.x API)
   * @deprecated Use flow.tasks.orchestrate() in v2.0
   */
  async orchestrateTask(
    description: string,
    config?: {
      strategy?: string;
      priority?: string;
      maxAgents?: number;
    }
  ): Promise<any> {
    if (this.adapter) {
      return await this.adapter.orchestrateTask(description, config);
    }

    if (this.v2Instance) {
      this.warnings.warn('orchestrateTask', {
        message: 'orchestrateTask() is deprecated. Use tasks.orchestrate() in v2.0',
        migration: 'const result = await flow.tasks.orchestrate({ description, ...config });',
        documentation: 'https://agentic-flow.dev/migration#orchestrate-task'
      });

      return await this.v2Instance.tasks.orchestrate({
        description,
        strategy: config?.strategy as any || 'adaptive',
        priority: config?.priority as any || 'medium'
      });
    }

    throw new Error('Invalid state: No backend initialized');
  }

  /**
   * Get memory value (v1.x API)
   * @deprecated Use flow.memory.retrieve() in v2.0
   */
  async getMemory(key: string): Promise<any> {
    if (this.adapter) {
      return await this.adapter.getMemory(key);
    }

    if (this.v2Instance) {
      this.warnings.warn('getMemory', {
        message: 'getMemory() is deprecated. Use memory.retrieve() in v2.0',
        migration: 'const data = await flow.memory.retrieve(key);',
        documentation: 'https://agentic-flow.dev/migration#memory'
      });

      return await this.v2Instance.memory.retrieve(key);
    }

    throw new Error('Invalid state: No backend initialized');
  }

  /**
   * Set memory value (v1.x API)
   * @deprecated Use flow.memory.store() in v2.0
   */
  async setMemory(key: string, value: any): Promise<void> {
    if (this.adapter) {
      return await this.adapter.setMemory(key, value);
    }

    if (this.v2Instance) {
      this.warnings.warn('setMemory', {
        message: 'setMemory() is deprecated. Use memory.store() in v2.0',
        migration: 'await flow.memory.store(key, value);',
        documentation: 'https://agentic-flow.dev/migration#memory'
      });

      return await this.v2Instance.memory.store(key, value);
    }

    throw new Error('Invalid state: No backend initialized');
  }

  /**
   * Search memory (v1.x API)
   * @deprecated Use flow.memory.search() or flow.memory.vectorSearch() in v2.0
   */
  async searchMemory(query: string, limit?: number): Promise<any[]> {
    if (this.adapter) {
      return await this.adapter.searchMemory(query, limit);
    }

    if (this.v2Instance) {
      this.warnings.warn('searchMemory', {
        message: 'searchMemory() is deprecated. Use memory.vectorSearch() for semantic search',
        migration: 'const results = await flow.memory.vectorSearch(query, { k: limit });',
        documentation: 'https://agentic-flow.dev/migration#memory-search'
      });

      const results = await this.v2Instance.memory.vectorSearch(query, {
        k: limit || 10
      });

      // Format results to match v1 structure
      return results.map(r => ({
        key: r.id,
        value: r.metadata,
        score: r.score
      }));
    }

    throw new Error('Invalid state: No backend initialized');
  }

  /**
   * Get swarm status (v1.x API)
   * @deprecated Use flow.swarms.status() in v2.0
   */
  async getSwarmStatus(): Promise<any> {
    if (this.adapter) {
      return await this.adapter.getSwarmStatus();
    }

    if (this.v2Instance) {
      this.warnings.warn('getSwarmStatus', {
        message: 'getSwarmStatus() is deprecated. Use swarms.status() in v2.0',
        migration: 'const status = await flow.swarms.status();',
        documentation: 'https://agentic-flow.dev/migration#swarm-status'
      });

      return await this.v2Instance.swarms.status();
    }

    throw new Error('Invalid state: No backend initialized');
  }

  /**
   * Destroy swarm (v1.x API)
   * @deprecated Use flow.swarms.destroy() in v2.0
   */
  async destroySwarm(): Promise<void> {
    if (this.adapter) {
      return await this.adapter.destroySwarm();
    }

    if (this.v2Instance) {
      this.warnings.warn('destroySwarm', {
        message: 'destroySwarm() is deprecated. Use swarms.destroy() in v2.0',
        migration: 'await flow.swarms.destroy();',
        documentation: 'https://agentic-flow.dev/migration#destroy-swarm'
      });

      return await this.v2Instance.swarms.destroy();
    }

    throw new Error('Invalid state: No backend initialized');
  }

  // ==================== v2.0 APIs ====================

  /**
   * Swarm management (v2.0 API)
   */
  get swarms() {
    if (this.v2Instance) {
      return this.v2Instance.swarms;
    }

    if (this.adapter) {
      // Return wrapper that translates to v1 APIs
      return {
        create: async (config: any) => this.initSwarm(config),
        status: async () => this.getSwarmStatus(),
        destroy: async () => this.destroySwarm()
      };
    }

    throw new Error('Invalid state: No backend initialized');
  }

  /**
   * Agent management (v2.0 API)
   */
  get agents() {
    if (this.v2Instance) {
      return this.v2Instance.agents;
    }

    if (this.adapter) {
      return {
        spawn: async (config: any) => this.spawnAgent(config.type, config)
      };
    }

    throw new Error('Invalid state: No backend initialized');
  }

  /**
   * Task management (v2.0 API)
   */
  get tasks() {
    if (this.v2Instance) {
      return this.v2Instance.tasks;
    }

    if (this.adapter) {
      return {
        orchestrate: async (config: any) =>
          this.orchestrateTask(config.description, config)
      };
    }

    throw new Error('Invalid state: No backend initialized');
  }

  /**
   * Memory management (v2.0 API)
   */
  get memory() {
    if (this.v2Instance) {
      return this.v2Instance.memory;
    }

    if (this.adapter) {
      return {
        store: async (key: string, value: any) => this.setMemory(key, value),
        retrieve: async (key: string) => this.getMemory(key),
        vectorSearch: async (query: string, options: any) =>
          this.searchMemory(query, options.k)
      };
    }

    throw new Error('Invalid state: No backend initialized');
  }

  // ==================== Utility Methods ====================

  /**
   * Get API version being used
   */
  getVersion(): '1.x' | '2.0' {
    return this.version;
  }

  /**
   * Check if running in compatibility mode
   */
  isCompatibilityMode(): boolean {
    return this.version === '1.x';
  }

  /**
   * Get deprecation warnings emitted
   */
  getDeprecationWarnings(): string[] {
    return this.warnings.getWarnings();
  }

  /**
   * Clear deprecation warning history
   */
  clearDeprecationWarnings(): void {
    this.warnings.clearWarnings();
  }

  /**
   * Access underlying v2 instance (for gradual migration)
   */
  getV2Instance(): AgenticFlowV2 | undefined {
    if (this.adapter) {
      this.warnings.warn('getV2Instance', {
        message: 'Accessing v2 instance while in v1 mode',
        migration: 'Consider migrating to v2.0 API',
        documentation: 'https://agentic-flow.dev/migration'
      });
      return this.adapter.getV2Instance();
    }

    return this.v2Instance;
  }
}
```

---

## Extended Adapter Methods

```typescript
// src/compatibility/V1toV2Adapter.ts (extended)

export class V1toV2Adapter {
  // ... (previous methods)

  /**
   * Search memory (v1 API)
   */
  async searchMemory(query: string, limit?: number): Promise<any[]> {
    this.warnings.warn('searchMemory', {
      message: 'searchMemory() is deprecated. Use memory.vectorSearch() in v2.0',
      migration: 'const results = await flow.memory.vectorSearch(query, { k: limit });',
      documentation: 'https://agentic-flow.dev/migration#memory-search'
    });

    const results = await this.v2Instance.memory.vectorSearch(query, {
      k: limit || 10,
      includeMetadata: true,
      includeDistance: true
    });

    // Translate v2 format to v1 format
    return results.map(result => ({
      key: result.id,
      value: result.metadata,
      score: result.score,
      distance: result.distance
    }));
  }

  /**
   * Get swarm status (v1 API)
   */
  async getSwarmStatus(): Promise<any> {
    this.warnings.warn('getSwarmStatus', {
      message: 'getSwarmStatus() is deprecated. Use swarms.status() in v2.0',
      migration: 'const status = await flow.swarms.status();',
      documentation: 'https://agentic-flow.dev/migration#swarm-status'
    });

    const v2Status = await this.v2Instance.swarms.status();

    // Translate v2 status format to v1 format
    return {
      swarmId: v2Status.id,
      topology: v2Status.topology,
      agentCount: v2Status.agents.length,
      agents: v2Status.agents.map(agent => ({
        id: agent.id,
        type: agent.type,
        status: agent.status,
        tasksCompleted: agent.metrics?.tasksCompleted || 0
      })),
      status: v2Status.health.status,
      uptime: v2Status.health.uptime
    };
  }

  /**
   * Destroy swarm (v1 API)
   */
  async destroySwarm(): Promise<void> {
    this.warnings.warn('destroySwarm', {
      message: 'destroySwarm() is deprecated. Use swarms.destroy() in v2.0',
      migration: 'await flow.swarms.destroy();',
      documentation: 'https://agentic-flow.dev/migration#destroy-swarm'
    });

    return await this.v2Instance.swarms.destroy();
  }

  /**
   * Get task status (v1 API)
   */
  async getTaskStatus(taskId: string): Promise<any> {
    this.warnings.warn('getTaskStatus', {
      message: 'getTaskStatus() is deprecated. Use tasks.status() in v2.0',
      migration: 'const status = await flow.tasks.status(taskId);',
      documentation: 'https://agentic-flow.dev/migration#task-status'
    });

    return await this.v2Instance.tasks.status(taskId);
  }

  /**
   * Wait for task completion (v1 API)
   */
  async waitForTask(taskId: string, timeout?: number): Promise<any> {
    this.warnings.warn('waitForTask', {
      message: 'waitForTask() is deprecated. Use tasks.wait() in v2.0',
      migration: 'const result = await flow.tasks.wait(taskId, { timeout });',
      documentation: 'https://agentic-flow.dev/migration#wait-task'
    });

    return await this.v2Instance.tasks.wait(taskId, { timeout });
  }
}
```

---

## Migration Helper Utilities

```typescript
// src/compatibility/MigrationHelpers.ts

export class MigrationHelpers {
  /**
   * Analyze v1 code for migration opportunities
   */
  static analyzeCode(code: string): MigrationReport {
    const report: MigrationReport = {
      v1APIsFound: [],
      suggestedMigrations: [],
      estimatedEffort: 'low'
    };

    // Detect v1 API usage patterns
    const v1Patterns = [
      { pattern: /\.initSwarm\(/g, api: 'initSwarm', replacement: 'swarms.create' },
      { pattern: /\.spawnAgent\(/g, api: 'spawnAgent', replacement: 'agents.spawn' },
      { pattern: /\.orchestrateTask\(/g, api: 'orchestrateTask', replacement: 'tasks.orchestrate' },
      { pattern: /\.getMemory\(/g, api: 'getMemory', replacement: 'memory.retrieve' },
      { pattern: /\.setMemory\(/g, api: 'setMemory', replacement: 'memory.store' }
    ];

    for (const { pattern, api, replacement } of v1Patterns) {
      const matches = code.match(pattern);
      if (matches) {
        report.v1APIsFound.push({
          api,
          occurrences: matches.length,
          replacement
        });

        report.suggestedMigrations.push({
          from: api,
          to: replacement,
          difficulty: 'easy',
          automatic: true
        });
      }
    }

    // Estimate effort
    const totalAPIs = report.v1APIsFound.reduce((sum, api) => sum + api.occurrences, 0);
    if (totalAPIs === 0) {
      report.estimatedEffort = 'none';
    } else if (totalAPIs < 10) {
      report.estimatedEffort = 'low';
    } else if (totalAPIs < 50) {
      report.estimatedEffort = 'medium';
    } else {
      report.estimatedEffort = 'high';
    }

    return report;
  }

  /**
   * Generate migration script
   */
  static generateMigrationScript(code: string): string {
    let migratedCode = code;

    // Replace v1 imports
    migratedCode = migratedCode.replace(
      /import\s+{\s*AgenticFlow\s*}\s+from\s+['"]agentic-flow['"]/g,
      'import { AgenticFlowV2 } from "agentic-flow"'
    );

    migratedCode = migratedCode.replace(
      /new\s+AgenticFlow\(/g,
      'new AgenticFlowV2('
    );

    // Replace method calls
    const replacements = [
      { from: '.initSwarm(', to: '.swarms.create(' },
      { from: '.spawnAgent(', to: '.agents.spawn({ type: ' },
      { from: '.orchestrateTask(', to: '.tasks.orchestrate({ description: ' },
      { from: '.getMemory(', to: '.memory.retrieve(' },
      { from: '.setMemory(', to: '.memory.store(' },
      { from: '.searchMemory(', to: '.memory.vectorSearch(' }
    ];

    for (const { from, to } of replacements) {
      migratedCode = migratedCode.split(from).join(to);
    }

    return migratedCode;
  }

  /**
   * Validate migrated config
   */
  static validateMigratedConfig(v2Config: V2Config): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!v2Config.backend) {
      errors.push('backend is required in v2.0 config');
    }

    if (!v2Config.memory?.path) {
      errors.push('memory.path is required in v2.0 config');
    }

    // Warnings for missing optimizations
    if (!v2Config.memory?.enableHNSW) {
      warnings.push('Consider enabling HNSW indexing for 150x faster search');
    }

    if (!v2Config.memory?.enableQuantization) {
      warnings.push('Consider enabling quantization for 4x memory reduction');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

interface MigrationReport {
  v1APIsFound: Array<{
    api: string;
    occurrences: number;
    replacement: string;
  }>;
  suggestedMigrations: Array<{
    from: string;
    to: string;
    difficulty: 'easy' | 'medium' | 'hard';
    automatic: boolean;
  }>;
  estimatedEffort: 'none' | 'low' | 'medium' | 'high';
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

---

## Export Structure

```typescript
// src/index.ts (Main entry point)

// v1.x compatibility export (default)
export { AgenticFlow } from './compatibility/AgenticFlowCompat';

// v2.0 explicit export
export { AgenticFlowV2 } from './v2/core/AgenticFlowV2';

// Compatibility utilities
export { VersionDetector } from './compatibility/VersionDetector';
export { MigrationHelpers } from './compatibility/MigrationHelpers';

// Types
export type {
  V1Config,
  V2Config,
  CompatibilityConfig,
  APIVersion
} from './compatibility/types';

// Re-export v2 types for TypeScript users
export type * from './v2/types';
```

---

## Usage Examples

### v1.x Code (Still Works)

```typescript
import { AgenticFlow } from 'agentic-flow';

const flow = new AgenticFlow({
  memoryPath: './swarm-memory.db',
  topology: 'mesh',
  provider: 'anthropic'
});

await flow.initSwarm({ topology: 'mesh' });
const agent = await flow.spawnAgent('coder');
await flow.setMemory('key', 'value');
```

### Gradual Migration

```typescript
import { AgenticFlow } from 'agentic-flow';

const flow = new AgenticFlow({
  version: '2.0',  // Opt into v2.0
  backend: 'agentdb'
});

// Use v2 APIs
await flow.swarms.create({ topology: 'mesh' });
const agent = await flow.agents.spawn({ type: 'coder' });
await flow.memory.store('key', 'value');
```

### Full v2.0 Migration

```typescript
import { AgenticFlowV2 } from 'agentic-flow';

const flow = new AgenticFlowV2({
  backend: 'agentdb',
  memory: {
    path: './swarm-memory.db',
    backend: 'ruvector',
    enableHNSW: true,
    enableQuantization: true
  },
  swarm: {
    topology: 'mesh',
    maxAgents: 8
  }
});

await flow.swarms.create({ topology: 'mesh' });
const agent = await flow.agents.spawn({ type: 'coder' });
await flow.memory.store('key', 'value');
```

---

## Next Steps

1. Implement compatibility layer classes
2. Write comprehensive test suite
3. Add automated migration tooling
4. Document all API mappings
5. Benchmark performance impact

---

**Document Status**: Complete
**Implementation Priority**: Phase 1 (Critical Path)
**Estimated Effort**: 2 weeks
**Dependencies**: AgentDB v2.0.0-alpha.2.11 integration
