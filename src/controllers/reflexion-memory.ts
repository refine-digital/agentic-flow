/**
 * ReflexionMemoryController - Self-Reflection and Learning from Failures
 *
 * Implements the Reflexion approach from "Reflexion: Language Agents with Verbal Reinforcement Learning"
 * https://arxiv.org/abs/2303.11366
 *
 * Enables agents to:
 * - Reflect on failures with self-critique
 * - Learn from mistakes through reflexive feedback
 * - Improve on subsequent attempts
 * - Share learnings across agent swarm
 *
 * @example
 * ```typescript
 * const controller = new ReflexionMemoryController(agentDB);
 *
 * // Store failed attempt
 * await controller.storeReflexion({
 *   taskId: 'auth-implementation',
 *   attempt: 1,
 *   action: 'Implemented JWT authentication',
 *   observation: 'Security vulnerability: tokens never expire',
 *   reflection: 'I need to add token expiration and refresh mechanism',
 *   success: false,
 *   reward: 0.3
 * });
 *
 * // Retrieve reflexions for learning
 * const past = await controller.getReflexionsForTask('auth-implementation');
 * ```
 */

import type { AgentDBWrapper } from '../types/agentdb';

export interface Reflexion {
  taskId: string;
  attempt: number;
  action: string;
  observation?: string;
  reflection: string;
  success: boolean;
  reward: number;
  timestamp?: number;
  category?: string;
}

export interface ErrorPattern {
  pattern: string;
  occurrences: number;
  avgReward: number;
  commonTasks: string[];
}

export interface ImprovementChain {
  taskId: string;
  attempts: Array<{
    attempt: number;
    reward: number;
    success: boolean;
    observation?: string;
  }>;
  totalImprovement: number;
  attemptsNeeded: number;
}

export interface ShareReflexionRequest {
  reflexionId: string;
  targetAgents: string[];
  shareLevel: 'all' | 'successful-only' | 'failures-only';
}

export interface GetSharedReflexionsOptions {
  taskCategory?: string;
  minReward?: number;
  fromAgents?: string[];
}

/**
 * ReflexionMemoryController
 *
 * Manages reflexive learning and self-improvement for AI agents
 */
export class ReflexionMemoryController {
  constructor(private agentDB: AgentDBWrapper) {}

  /**
   * Store a reflexion (self-critique) from a task attempt
   *
   * @param reflexion - The reflexion data
   */
  async storeReflexion(reflexion: Reflexion): Promise<void> {
    // Build content for embedding
    const content = this.buildReflexionContent(reflexion);

    // Generate embeddings
    const embedding = await this.agentDB.embed(content);

    // Store in AgentDB
    await this.agentDB.insert({
      content,
      embedding,
      metadata: {
        taskId: reflexion.taskId,
        attempt: reflexion.attempt,
        action: reflexion.action,
        observation: reflexion.observation,
        reflection: reflexion.reflection,
        success: reflexion.success,
        reward: reflexion.reward,
        timestamp: reflexion.timestamp || Date.now(),
        category: reflexion.category,
        type: 'reflexion'
      }
    });
  }

  /**
   * Get reflexions for a specific task to learn from past attempts
   *
   * @param taskId - The task identifier
   * @param k - Number of reflexions to retrieve (default: 10)
   * @returns Array of reflexions ordered by relevance
   */
  async getReflexionsForTask(taskId: string, k: number = 10): Promise<Reflexion[]> {
    // Generate embedding for task
    const queryEmbedding = await this.agentDB.embed(taskId);

    // Search for similar reflexions
    const results = await this.agentDB.vectorSearch(queryEmbedding, k, {
      filter: (metadata: any) => metadata.type === 'reflexion'
    });

    // Map to Reflexion interface
    return results.map(result => ({
      taskId: result.metadata.taskId,
      attempt: result.metadata.attempt,
      action: result.metadata.action,
      observation: result.metadata.observation,
      reflection: result.metadata.reflection,
      success: result.metadata.success,
      reward: result.metadata.reward,
      timestamp: result.metadata.timestamp,
      category: result.metadata.category
    }));
  }

  /**
   * Find recurring error patterns across tasks
   *
   * @param options - Search options
   * @returns Array of identified error patterns
   */
  async findErrorPatterns(options: {
    minOccurrences?: number;
    timeWindow?: string;
    category?: string;
  }): Promise<ErrorPattern[]> {
    const minOccurrences = options.minOccurrences || 3;
    const timeWindowMs = this.parseTimeWindow(options.timeWindow);

    // Query all failed reflexions
    const results = await this.agentDB.query({
      filter: (metadata: any) => {
        if (metadata.type !== 'reflexion') return false;
        if (metadata.success) return false;
        if (options.category && metadata.category !== options.category) return false;
        if (timeWindowMs && Date.now() - metadata.timestamp > timeWindowMs) return false;
        return true;
      }
    });

    // Group by reflection content to find patterns
    const patternMap = new Map<string, {
      count: number;
      rewards: number[];
      tasks: Set<string>;
    }>();

    results.forEach((result: any) => {
      const reflection = result.metadata.reflection;
      if (!reflection) return;

      // Normalize reflection for pattern matching
      const normalizedPattern = this.normalizePattern(reflection);

      if (!patternMap.has(normalizedPattern)) {
        patternMap.set(normalizedPattern, {
          count: 0,
          rewards: [],
          tasks: new Set()
        });
      }

      const pattern = patternMap.get(normalizedPattern)!;
      pattern.count++;
      pattern.rewards.push(result.metadata.reward);
      pattern.tasks.add(result.metadata.taskId);
    });

    // Filter and format results
    const patterns: ErrorPattern[] = [];
    patternMap.forEach((data, pattern) => {
      if (data.count >= minOccurrences) {
        patterns.push({
          pattern,
          occurrences: data.count,
          avgReward: data.rewards.reduce((a, b) => a + b, 0) / data.rewards.length,
          commonTasks: Array.from(data.tasks)
        });
      }
    });

    // Sort by occurrences
    return patterns.sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Get improvement chain showing progress across attempts
   *
   * @param taskId - The task identifier
   * @returns Improvement metrics and attempt history
   */
  async getImprovementChain(taskId: string): Promise<ImprovementChain> {
    // Query all attempts for this task
    const results = await this.agentDB.query({
      filter: (metadata: any) =>
        metadata.type === 'reflexion' && metadata.taskId === taskId
    });

    // Sort by attempt number
    const attempts = results
      .map((result: any) => ({
        attempt: result.metadata.attempt,
        reward: result.metadata.reward,
        success: result.metadata.success,
        observation: result.metadata.observation
      }))
      .sort((a, b) => a.attempt - b.attempt);

    // Calculate improvement
    const totalImprovement = attempts.length > 0
      ? attempts[attempts.length - 1].reward - attempts[0].reward
      : 0;

    return {
      taskId,
      attempts,
      totalImprovement,
      attemptsNeeded: attempts.length
    };
  }

  /**
   * Share a reflexion with other agents in the swarm
   *
   * @param request - Share request details
   */
  async shareReflexion(request: ShareReflexionRequest): Promise<void> {
    // Get the reflexion to share
    const reflexions = await this.agentDB.query({
      filter: (metadata: any) =>
        metadata.type === 'reflexion' && metadata.id === request.reflexionId
    });

    if (reflexions.length === 0) return;

    const reflexion = reflexions[0];

    // Check share level
    if (request.shareLevel === 'successful-only' && !reflexion.metadata.success) {
      return;
    }
    if (request.shareLevel === 'failures-only' && reflexion.metadata.success) {
      return;
    }

    // Share to target agents
    for (const agentId of request.targetAgents) {
      await this.agentDB.insert({
        content: reflexion.content,
        embedding: reflexion.embedding,
        metadata: {
          ...reflexion.metadata,
          sharedFrom: request.reflexionId,
          targetAgent: agentId,
          sharedAt: Date.now()
        }
      });
    }
  }

  /**
   * Get shared reflexions from experienced agents
   *
   * @param options - Query options
   * @returns Array of shared reflexions
   */
  async getSharedReflexions(options: GetSharedReflexionsOptions): Promise<Reflexion[]> {
    const results = await this.agentDB.query({
      filter: (metadata: any) => {
        if (metadata.type !== 'reflexion') return false;
        if (!metadata.sharedFrom) return false;

        if (options.taskCategory && metadata.category !== options.taskCategory) {
          return false;
        }

        if (options.minReward && metadata.reward < options.minReward) {
          return false;
        }

        if (options.fromAgents && options.fromAgents.length > 0) {
          if (!options.fromAgents.includes(metadata.sharedFrom)) {
            return false;
          }
        }

        return true;
      }
    });

    return results.map((result: any) => ({
      taskId: result.metadata.taskId,
      attempt: result.metadata.attempt,
      action: result.metadata.action,
      observation: result.metadata.observation,
      reflection: result.metadata.reflection,
      success: result.metadata.success,
      reward: result.metadata.reward,
      timestamp: result.metadata.timestamp,
      category: result.metadata.category
    }));
  }

  /**
   * Build content string from reflexion for embedding
   */
  private buildReflexionContent(reflexion: Reflexion): string {
    const parts = [
      `Task: ${reflexion.taskId}`,
      `Action: ${reflexion.action}`,
      reflexion.observation ? `Observation: ${reflexion.observation}` : null,
      `Reflection: ${reflexion.reflection}`,
      `Outcome: ${reflexion.success ? 'Success' : 'Failure'}`,
      `Reward: ${reflexion.reward}`
    ];

    return parts.filter(Boolean).join('\n');
  }

  /**
   * Normalize pattern for matching
   */
  private normalizePattern(text: string): string {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Parse time window string to milliseconds
   */
  private parseTimeWindow(window?: string): number | null {
    if (!window) return null;

    const match = window.match(/^(\d+)([dhm])$/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'm': return value * 60 * 1000;
      default: return null;
    }
  }
}
