/**
 * E2B Swarm Orchestrator - Multi-agent swarm with E2B sandbox isolation
 *
 * Spawns specialized agents in isolated E2B sandboxes for:
 * - Parallel code execution
 * - Secure multi-agent coordination
 * - Resource-isolated task processing
 */

import { logger } from "../utils/logger.js";
import { E2BSandboxManager, ExecutionResult, E2BSandboxConfig } from "./e2b-sandbox.js";

/**
 * E2B Agent capabilities
 */
export type E2BAgentCapability =
  | 'python-executor'      // Execute Python code
  | 'javascript-executor'  // Execute JavaScript/Node.js
  | 'shell-executor'       // Execute shell commands
  | 'data-analyst'         // Data processing and analysis
  | 'code-reviewer'        // Static analysis and review
  | 'test-runner'          // Run tests in isolation
  | 'security-scanner'     // Security analysis
  | 'performance-profiler' // Performance testing
  | 'ml-trainer'           // Machine learning tasks
  | 'api-tester';          // API endpoint testing

/**
 * E2B Agent configuration
 */
export interface E2BAgentConfig {
  id: string;
  name: string;
  capability: E2BAgentCapability;
  template?: string;
  timeout?: number;
  envVars?: Record<string, string>;
  packages?: string[];
}

/**
 * E2B Agent instance
 */
export interface E2BAgent {
  id: string;
  name: string;
  capability: E2BAgentCapability;
  sandbox: E2BSandboxManager;
  status: 'initializing' | 'ready' | 'busy' | 'error' | 'terminated';
  tasksCompleted: number;
  totalExecutionTime: number;
  errors: number;
  createdAt: number;
}

/**
 * Task for E2B agent execution
 */
export interface E2BTask {
  id: string;
  type: 'python' | 'javascript' | 'shell' | 'file-write' | 'file-read';
  code: string;
  targetAgent?: string;
  capability?: E2BAgentCapability;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  timeout?: number;
  metadata?: Record<string, any>;
}

/**
 * Task result
 */
export interface E2BTaskResult {
  taskId: string;
  agentId: string;
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  metadata?: Record<string, any>;
}

/**
 * Swarm metrics
 */
export interface E2BSwarmMetrics {
  totalAgents: number;
  activeAgents: number;
  tasksCompleted: number;
  tasksInProgress: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  errorRate: number;
  agentUtilization: Record<string, number>;
}

/**
 * E2B Swarm Orchestrator
 */
export class E2BSwarmOrchestrator {
  private agents: Map<string, E2BAgent> = new Map();
  private taskQueue: E2BTask[] = [];
  private taskResults: Map<string, E2BTaskResult> = new Map();
  private isRunning: boolean = false;
  private config: {
    maxAgents: number;
    defaultTimeout: number;
    retryAttempts: number;
    loadBalancing: 'round-robin' | 'least-busy' | 'capability-match';
  };

  constructor(config?: Partial<E2BSwarmOrchestrator['config']>) {
    this.config = {
      maxAgents: config?.maxAgents || 10,
      defaultTimeout: config?.defaultTimeout || 300000,
      retryAttempts: config?.retryAttempts || 3,
      loadBalancing: config?.loadBalancing || 'capability-match'
    };
  }

  /**
   * Initialize the swarm
   */
  async initialize(): Promise<boolean> {
    logger.info('E2B Swarm initializing', { maxAgents: this.config.maxAgents });
    this.isRunning = true;
    return true;
  }

  /**
   * Spawn a new E2B agent with specific capability
   */
  async spawnAgent(config: E2BAgentConfig): Promise<E2BAgent | null> {
    if (this.agents.size >= this.config.maxAgents) {
      logger.warn('Max agents reached', { max: this.config.maxAgents });
      return null;
    }

    const sandbox = new E2BSandboxManager({
      apiKey: process.env.E2B_API_KEY,
      template: config.template || this.getTemplateForCapability(config.capability),
      timeout: config.timeout || this.config.defaultTimeout,
      envVars: config.envVars
    });

    const agent: E2BAgent = {
      id: config.id,
      name: config.name,
      capability: config.capability,
      sandbox,
      status: 'initializing',
      tasksCompleted: 0,
      totalExecutionTime: 0,
      errors: 0,
      createdAt: Date.now()
    };

    this.agents.set(agent.id, agent);

    try {
      const useCodeInterpreter = ['python-executor', 'data-analyst', 'ml-trainer'].includes(config.capability);
      const created = await sandbox.create(useCodeInterpreter);

      if (!created) {
        agent.status = 'error';
        logger.error('Failed to create E2B sandbox for agent', { agentId: agent.id });
        return null;
      }

      // Install required packages for capability
      if (config.packages && config.packages.length > 0) {
        const pkgManager = ['python-executor', 'data-analyst', 'ml-trainer'].includes(config.capability) ? 'pip' : 'npm';
        await sandbox.installPackages(config.packages, pkgManager);
      }

      agent.status = 'ready';
      logger.info('E2B agent spawned', { id: agent.id, name: agent.name, capability: config.capability });

      return agent;
    } catch (error) {
      agent.status = 'error';
      agent.errors++;
      logger.error('Error spawning E2B agent', { agentId: agent.id, error: (error as Error).message });
      return null;
    }
  }

  /**
   * Spawn multiple agents in parallel
   */
  async spawnAgents(configs: E2BAgentConfig[]): Promise<E2BAgent[]> {
    const results = await Promise.allSettled(
      configs.map(config => this.spawnAgent(config))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<E2BAgent | null> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter((a): a is E2BAgent => a !== null);
  }

  /**
   * Execute a task on the swarm
   */
  async executeTask(task: E2BTask): Promise<E2BTaskResult> {
    const startTime = Date.now();

    // Find best agent for task
    const agent = this.selectAgent(task);
    if (!agent) {
      return {
        taskId: task.id,
        agentId: 'none',
        success: false,
        output: '',
        error: 'No suitable agent available',
        executionTime: 0
      };
    }

    agent.status = 'busy';

    try {
      let result: ExecutionResult;

      switch (task.type) {
        case 'python':
          result = await agent.sandbox.runPython(task.code);
          break;
        case 'javascript':
          result = await agent.sandbox.runJavaScript(task.code);
          break;
        case 'shell':
          result = await agent.sandbox.runCommand('sh', ['-c', task.code]);
          break;
        case 'file-write':
          const writeResult = await agent.sandbox.writeFile(task.metadata?.path || '/tmp/output.txt', task.code);
          result = { success: writeResult.success, output: writeResult.path, error: writeResult.error, logs: [] };
          break;
        case 'file-read':
          const readResult = await agent.sandbox.readFile(task.code);
          result = { success: readResult.success, output: readResult.content || '', error: readResult.error, logs: [] };
          break;
        default:
          result = { success: false, output: '', error: `Unknown task type: ${task.type}`, logs: [] };
      }

      const executionTime = Date.now() - startTime;
      agent.tasksCompleted++;
      agent.totalExecutionTime += executionTime;
      agent.status = 'ready';

      const taskResult: E2BTaskResult = {
        taskId: task.id,
        agentId: agent.id,
        success: result.success,
        output: result.output,
        error: result.error,
        executionTime,
        metadata: task.metadata
      };

      this.taskResults.set(task.id, taskResult);
      return taskResult;

    } catch (error) {
      agent.errors++;
      agent.status = 'ready';

      const taskResult: E2BTaskResult = {
        taskId: task.id,
        agentId: agent.id,
        success: false,
        output: '',
        error: (error as Error).message,
        executionTime: Date.now() - startTime
      };

      this.taskResults.set(task.id, taskResult);
      return taskResult;
    }
  }

  /**
   * Execute multiple tasks in parallel
   */
  async executeTasks(tasks: E2BTask[]): Promise<E2BTaskResult[]> {
    // Group by priority
    const critical = tasks.filter(t => t.priority === 'critical');
    const high = tasks.filter(t => t.priority === 'high');
    const medium = tasks.filter(t => t.priority === 'medium' || !t.priority);
    const low = tasks.filter(t => t.priority === 'low');

    const orderedTasks = [...critical, ...high, ...medium, ...low];

    // Execute with concurrency based on available agents
    const concurrency = Math.min(this.getReadyAgents().length, orderedTasks.length);
    const results: E2BTaskResult[] = [];

    for (let i = 0; i < orderedTasks.length; i += concurrency) {
      const batch = orderedTasks.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(task => this.executeTask(task)));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Select best agent for a task
   */
  private selectAgent(task: E2BTask): E2BAgent | null {
    const readyAgents = this.getReadyAgents();

    if (readyAgents.length === 0) return null;

    // If specific agent requested
    if (task.targetAgent) {
      const agent = this.agents.get(task.targetAgent);
      if (agent && agent.status === 'ready') return agent;
    }

    switch (this.config.loadBalancing) {
      case 'round-robin':
        return readyAgents[0];

      case 'least-busy':
        return readyAgents.reduce((min, agent) =>
          agent.tasksCompleted < min.tasksCompleted ? agent : min
        );

      case 'capability-match':
      default:
        // Match task type to capability
        const capabilityMap: Record<string, E2BAgentCapability[]> = {
          'python': ['python-executor', 'data-analyst', 'ml-trainer'],
          'javascript': ['javascript-executor', 'api-tester'],
          'shell': ['shell-executor', 'security-scanner', 'test-runner'],
          'file-write': ['shell-executor', 'python-executor', 'javascript-executor'],
          'file-read': ['shell-executor', 'python-executor', 'javascript-executor']
        };

        const preferredCapabilities = capabilityMap[task.type] || [];
        const matchingAgents = readyAgents.filter(a =>
          task.capability ? a.capability === task.capability : preferredCapabilities.includes(a.capability)
        );

        return matchingAgents.length > 0 ? matchingAgents[0] : readyAgents[0];
    }
  }

  /**
   * Get ready agents
   */
  private getReadyAgents(): E2BAgent[] {
    return Array.from(this.agents.values()).filter(a => a.status === 'ready');
  }

  /**
   * Get template for capability
   */
  private getTemplateForCapability(capability: E2BAgentCapability): string {
    const templates: Record<E2BAgentCapability, string> = {
      'python-executor': 'base',
      'javascript-executor': 'base',
      'shell-executor': 'base',
      'data-analyst': 'base',
      'code-reviewer': 'base',
      'test-runner': 'base',
      'security-scanner': 'base',
      'performance-profiler': 'base',
      'ml-trainer': 'base',
      'api-tester': 'base'
    };
    return templates[capability] || 'base';
  }

  /**
   * Get swarm metrics
   */
  getMetrics(): E2BSwarmMetrics {
    const agents = Array.from(this.agents.values());
    const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);
    const totalErrors = agents.reduce((sum, a) => sum + a.errors, 0);
    const totalTime = agents.reduce((sum, a) => sum + a.totalExecutionTime, 0);

    const utilization: Record<string, number> = {};
    for (const agent of agents) {
      utilization[agent.id] = agent.tasksCompleted > 0
        ? agent.totalExecutionTime / (Date.now() - agent.createdAt)
        : 0;
    }

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'busy').length,
      tasksCompleted: totalTasks,
      tasksInProgress: agents.filter(a => a.status === 'busy').length,
      totalExecutionTime: totalTime,
      averageExecutionTime: totalTasks > 0 ? totalTime / totalTasks : 0,
      errorRate: totalTasks > 0 ? totalErrors / (totalTasks + totalErrors) : 0,
      agentUtilization: utilization
    };
  }

  /**
   * Get all agents
   */
  getAgents(): E2BAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by ID
   */
  getAgent(id: string): E2BAgent | undefined {
    return this.agents.get(id);
  }

  /**
   * Terminate an agent
   */
  async terminateAgent(id: string): Promise<boolean> {
    const agent = this.agents.get(id);
    if (!agent) return false;

    try {
      await agent.sandbox.close();
      agent.status = 'terminated';
      this.agents.delete(id);
      logger.info('E2B agent terminated', { id });
      return true;
    } catch (error) {
      logger.error('Error terminating agent', { id, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Shutdown the swarm
   */
  async shutdown(): Promise<void> {
    this.isRunning = false;

    const terminatePromises = Array.from(this.agents.keys()).map(id =>
      this.terminateAgent(id)
    );

    await Promise.allSettled(terminatePromises);
    this.agents.clear();
    this.taskResults.clear();

    logger.info('E2B Swarm shutdown complete');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    agents: Array<{ id: string; status: string; healthy: boolean }>;
  }> {
    const agentHealth = await Promise.all(
      Array.from(this.agents.values()).map(async (agent) => {
        let healthy = agent.status === 'ready' || agent.status === 'busy';

        // Quick ping test
        if (healthy && agent.status === 'ready') {
          try {
            const result = await agent.sandbox.runCommand('echo', ['ping']);
            healthy = result.success;
          } catch {
            healthy = false;
          }
        }

        return { id: agent.id, status: agent.status, healthy };
      })
    );

    return {
      healthy: agentHealth.every(a => a.healthy),
      agents: agentHealth
    };
  }
}

/**
 * Create default swarm with standard agent types
 */
export async function createDefaultE2BSwarm(): Promise<E2BSwarmOrchestrator> {
  const swarm = new E2BSwarmOrchestrator({
    maxAgents: 8,
    loadBalancing: 'capability-match'
  });

  await swarm.initialize();

  const defaultAgents: E2BAgentConfig[] = [
    { id: 'python-1', name: 'Python Executor', capability: 'python-executor', packages: ['numpy', 'pandas'] },
    { id: 'js-1', name: 'JavaScript Executor', capability: 'javascript-executor' },
    { id: 'shell-1', name: 'Shell Executor', capability: 'shell-executor' },
    { id: 'data-1', name: 'Data Analyst', capability: 'data-analyst', packages: ['numpy', 'pandas', 'matplotlib'] },
    { id: 'test-1', name: 'Test Runner', capability: 'test-runner' },
    { id: 'security-1', name: 'Security Scanner', capability: 'security-scanner' }
  ];

  await swarm.spawnAgents(defaultAgents);

  return swarm;
}

/**
 * Quick helper to run code in E2B swarm
 */
export async function runInSwarm(
  swarm: E2BSwarmOrchestrator,
  code: string,
  type: 'python' | 'javascript' | 'shell' = 'python'
): Promise<E2BTaskResult> {
  return swarm.executeTask({
    id: `task-${Date.now()}`,
    type,
    code
  });
}
