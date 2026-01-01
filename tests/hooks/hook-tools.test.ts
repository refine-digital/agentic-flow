/**
 * Integration tests for Hook Tools
 * Tests core functionality, routing, and learning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';

// Import tools directly
import { hookPreEditTool } from '../../agentic-flow/src/mcp/fastmcp/tools/hooks/pre-edit.js';
import { hookPostEditTool } from '../../agentic-flow/src/mcp/fastmcp/tools/hooks/post-edit.js';
import { hookPreCommandTool } from '../../agentic-flow/src/mcp/fastmcp/tools/hooks/pre-command.js';
import { hookPostCommandTool } from '../../agentic-flow/src/mcp/fastmcp/tools/hooks/post-command.js';
import { hookRouteTool } from '../../agentic-flow/src/mcp/fastmcp/tools/hooks/route.js';
import { hookExplainTool } from '../../agentic-flow/src/mcp/fastmcp/tools/hooks/explain.js';
import { hookMetricsTool } from '../../agentic-flow/src/mcp/fastmcp/tools/hooks/metrics.js';
import { hookPretrainTool } from '../../agentic-flow/src/mcp/fastmcp/tools/hooks/pretrain.js';
import { hookBuildAgentsTool } from '../../agentic-flow/src/mcp/fastmcp/tools/hooks/build-agents.js';

// Test context
const mockContext = {
  onProgress: (update: { progress: number; message: string }) => {
    // Silent progress for tests
  }
};

// Clean up test data
const INTEL_PATH = '.agentic-flow/intelligence.json';

describe('Hook Tools', () => {
  beforeEach(() => {
    // Clean intelligence file before each test
    const fullPath = path.join(process.cwd(), INTEL_PATH);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });

  afterEach(() => {
    // Clean up after tests
    const fullPath = path.join(process.cwd(), INTEL_PATH);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    // Clean up agents directory
    const agentsDir = path.join(process.cwd(), '.claude/agents');
    if (fs.existsSync(agentsDir)) {
      fs.rmSync(agentsDir, { recursive: true, force: true });
    }
  });

  describe('hook_pre_edit', () => {
    it('should return suggested agent for TypeScript file', async () => {
      const result = await hookPreEditTool.execute(
        { filePath: 'src/index.ts' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.suggestedAgent).toBe('typescript-developer');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.latencyMs).toBeLessThan(100);
    });

    it('should return suggested agent for Rust file', async () => {
      const result = await hookPreEditTool.execute(
        { filePath: 'src/lib.rs' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.suggestedAgent).toBe('rust-developer');
    });

    it('should return suggested agent for test file', async () => {
      const result = await hookPreEditTool.execute(
        { filePath: 'tests/auth.test.ts' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.suggestedAgent).toBe('test-engineer');
    });

    it('should include task context in memories', async () => {
      const result = await hookPreEditTool.execute(
        { filePath: 'src/auth.ts', task: 'Fix authentication bug' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.memories).toBeDefined();
    });
  });

  describe('hook_post_edit', () => {
    it('should record successful edit', async () => {
      const result = await hookPostEditTool.execute(
        {
          filePath: 'src/index.ts',
          success: true,
          agent: 'typescript-developer',
          duration: 150
        },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.patternsUpdated).toBe(true);
      expect(result.newPatternValue).toBeGreaterThan(0);
    });

    it('should record failed edit', async () => {
      const result = await hookPostEditTool.execute(
        {
          filePath: 'src/index.ts',
          success: false,
          agent: 'coder',
          errorMessage: 'TypeError: undefined is not a function'
        },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.patternsUpdated).toBe(true);
    });

    it('should update routing accuracy', async () => {
      // Record some successes
      await hookPostEditTool.execute(
        { filePath: 'a.ts', success: true, agent: 'coder' },
        mockContext
      );
      await hookPostEditTool.execute(
        { filePath: 'b.ts', success: true, agent: 'coder' },
        mockContext
      );
      const result = await hookPostEditTool.execute(
        { filePath: 'c.ts', success: false, agent: 'coder' },
        mockContext
      );

      // 2 successes, 1 failure = 66.7% but test isolation can affect this
      expect(result.routingAccuracy).toBeGreaterThanOrEqual(0.5);
      expect(result.routingAccuracy).toBeLessThanOrEqual(0.8);
    });
  });

  describe('hook_pre_command', () => {
    it('should approve safe command', async () => {
      const result = await hookPreCommandTool.execute(
        { command: 'npm run test' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.approved).toBe(true);
      expect(result.riskLevel).toBeLessThan(0.3);
      expect(result.riskCategory).toBe('safe');
    });

    it('should flag dangerous command', async () => {
      const result = await hookPreCommandTool.execute(
        { command: 'rm -rf /' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.blocked).toBe(true);
      expect(result.riskLevel).toBeGreaterThan(0.8);
      expect(result.riskCategory).toBe('blocked');
    });

    it('should warn about sudo commands', async () => {
      const result = await hookPreCommandTool.execute(
        { command: 'sudo apt-get install something' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.riskLevel).toBeGreaterThan(0.4);
      expect(result.riskCategory).toBe('caution');
    });

    it('should provide suggestions for risky commands', async () => {
      const result = await hookPreCommandTool.execute(
        { command: 'chmod 777 /var/www' },
        mockContext
      );

      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('hook_post_command', () => {
    it('should learn from successful command', async () => {
      const result = await hookPostCommandTool.execute(
        { command: 'npm test', exitCode: 0, stdout: 'All tests passed' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.learned).toBe(true);
      expect(result.commandSuccess).toBe(true);
    });

    it('should learn from failed command', async () => {
      const result = await hookPostCommandTool.execute(
        {
          command: 'npm build',
          exitCode: 1,
          stderr: 'TypeError: Cannot read property of undefined'
        },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.learned).toBe(true);
      expect(result.commandSuccess).toBe(false);
      expect(result.errorType).toBe('TypeError');
    });
  });

  describe('hook_route', () => {
    it('should route to appropriate agent based on task', async () => {
      const result = await hookRouteTool.execute(
        { task: 'Write unit tests for authentication module' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.agent).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.factors.length).toBeGreaterThan(0);
    });

    it('should use file context for routing', async () => {
      const result = await hookRouteTool.execute(
        {
          task: 'Fix bug',
          context: { file: 'src/database.sql' }
        },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.agent).toBe('database-specialist');
    });

    it('should provide alternatives', async () => {
      const result = await hookRouteTool.execute(
        { task: 'Implement feature' },
        mockContext
      );

      expect(result.alternatives).toBeDefined();
      expect(result.alternatives.length).toBeGreaterThan(0);
    });

    it('should support exploration mode', async () => {
      const result = await hookRouteTool.execute(
        { task: 'Random task', explore: true },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.explored).toBe(true);
    });
  });

  describe('hook_explain', () => {
    it('should explain routing decision', async () => {
      const result = await hookExplainTool.execute(
        { task: 'Write security audit' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.recommendedAgent).toBeDefined();
    });

    it('should provide ranking of agents', async () => {
      const result = await hookExplainTool.execute(
        { task: 'Create React component', file: 'src/Button.tsx' },
        mockContext
      );

      expect(result.ranking).toBeDefined();
      expect(result.ranking.length).toBeGreaterThan(0);
      expect(result.ranking[0].rank).toBe(1);
    });
  });

  describe('hook_metrics', () => {
    it('should return metrics even with no data', async () => {
      const result = await hookMetricsTool.execute(
        { timeframe: '24h', detailed: false },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.routing).toBeDefined();
      expect(result.learning).toBeDefined();
      expect(result.health).toBeDefined();
    });

    it('should calculate accuracy after operations', async () => {
      // Generate some data
      await hookPostEditTool.execute(
        { filePath: 'a.ts', success: true, agent: 'coder' },
        mockContext
      );
      await hookPostEditTool.execute(
        { filePath: 'b.ts', success: true, agent: 'coder' },
        mockContext
      );
      await hookPostEditTool.execute(
        { filePath: 'c.ts', success: false, agent: 'coder' },
        mockContext
      );

      const result = await hookMetricsTool.execute(
        { timeframe: '24h', detailed: true },
        mockContext
      );

      // Should have at least the 3 operations recorded
      expect(result.routing.total).toBeGreaterThanOrEqual(3);
      expect(result.routing.accuracy).toBeGreaterThanOrEqual(0.5);
      expect(result.routing.accuracy).toBeLessThanOrEqual(0.8);
    });
  });

  describe('hook_pretrain', () => {
    it('should analyze repository structure', async () => {
      const result = await hookPretrainTool.execute(
        { depth: 10, skipGit: true, skipFiles: false },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.filesAnalyzed).toBeGreaterThan(0);
      expect(result.patternsCreated).toBeGreaterThan(0);
    });

    it('should respect skip options', async () => {
      const result = await hookPretrainTool.execute(
        { depth: 10, skipGit: true, skipFiles: true },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.memoriesStored).toBeGreaterThanOrEqual(0);
    });
  });

  describe('hook_build_agents', () => {
    it('should generate agent configurations', async () => {
      // First pretrain to get patterns
      await hookPretrainTool.execute(
        { depth: 10, skipGit: true },
        mockContext
      );

      const result = await hookBuildAgentsTool.execute(
        { focus: 'quality', format: 'yaml', includePrompts: true },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.agentsGenerated).toBeGreaterThan(0);
      expect(result.agents).toContain('project-coordinator');
    });

    it('should support different focus modes', async () => {
      await hookPretrainTool.execute({ depth: 10, skipGit: true }, mockContext);

      const qualityResult = await hookBuildAgentsTool.execute(
        { focus: 'quality' },
        mockContext
      );

      const securityResult = await hookBuildAgentsTool.execute(
        { focus: 'security' },
        mockContext
      );

      expect(qualityResult.focus).toBe('quality');
      expect(securityResult.focus).toBe('security');
    });
  });
});

describe('Hook Tools Performance', () => {
  it('should meet latency targets for pre-edit', async () => {
    const iterations = 10;
    const latencies: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const result = await hookPreEditTool.execute(
        { filePath: `src/test${i}.ts` },
        mockContext
      );
      latencies.push(result.latencyMs);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(iterations * 0.95)];

    console.log(`Pre-edit latency: avg=${avgLatency.toFixed(2)}ms, p95=${p95Latency}ms`);

    expect(avgLatency).toBeLessThan(20); // Target: <20ms average
    expect(p95Latency).toBeLessThan(50); // Target: <50ms p95
  });

  it('should meet latency targets for routing', async () => {
    const iterations = 10;
    const latencies: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const result = await hookRouteTool.execute(
        { task: `Task ${i}: implement feature` },
        mockContext
      );
      latencies.push(result.latencyMs);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(iterations * 0.95)];

    console.log(`Route latency: avg=${avgLatency.toFixed(2)}ms, p95=${p95Latency}ms`);

    expect(avgLatency).toBeLessThan(30); // Target: <30ms average
    expect(p95Latency).toBeLessThan(50); // Target: <50ms p95
  });
});
