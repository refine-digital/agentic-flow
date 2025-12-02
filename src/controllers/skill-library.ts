/**
 * SkillLibraryController - Skill Storage, Evolution, and Composition
 *
 * Manages a library of reusable agent skills with:
 * - Skill versioning and evolution tracking
 * - Success rate monitoring
 * - Skill composition (combining skills)
 * - Semantic skill discovery
 *
 * @example
 * ```typescript
 * const controller = new SkillLibraryController(agentDB);
 *
 * // Add a new skill
 * await controller.addSkill({
 *   id: 'input-validation',
 *   name: 'User Input Validation',
 *   description: 'Validate and sanitize user input',
 *   code: 'function validate(input) { ... }',
 *   version: '1.0.0',
 *   tags: ['validation', 'security']
 * });
 *
 * // Get skill recommendations
 * const skills = await controller.recommendSkills({
 *   taskDescription: 'Build user registration form',
 *   requiredCapabilities: ['email-validation', 'password-hashing']
 * });
 * ```
 */

import type { AgentDBWrapper } from '../types/agentdb';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category?: string;
  code: string;
  testCases?: Array<{
    input: any;
    expected: any;
  }>;
  version: string;
  dependencies?: string[];
  tags?: string[];
  capabilities?: string[];
  successRate?: number;
  usageCount?: number;
  avgExecutionTime?: number;
}

export interface SkillUsage {
  skillId: string;
  taskId?: string;
  success: boolean;
  executionTimeMs: number;
  feedback?: string;
}

export interface SkillEvolution {
  skillId: string;
  version: string;
  changes: string;
  code: string;
  testCases?: Array<{ input: any; expected: any }>;
}

export interface SkillHistory {
  version: string;
  date: number;
  usageCount: number;
  successRate: number;
  changes: string;
}

export interface CompositeSkill {
  id: string;
  name: string;
  description: string;
  components: Array<{
    skillId: string;
    order: number;
  }>;
  compositionLogic: 'sequential' | 'parallel' | 'conditional';
  version: string;
  failureHandling?: 'rollback' | 'continue' | 'abort';
}

export interface SkillRecommendation {
  skillId: string;
  relevance: number;
  reason: string;
  successRate?: number;
}

export interface SearchSkillsOptions {
  tags?: string[];
  minSuccessRate?: number;
  category?: string;
  orderBy?: 'usageCount' | 'successRate' | 'recent';
}

/**
 * SkillLibraryController
 *
 * Manages agent skills with versioning, composition, and discovery
 */
export class SkillLibraryController {
  constructor(private agentDB: AgentDBWrapper) {}

  /**
   * Add a new skill to the library
   *
   * @param skill - The skill definition
   */
  async addSkill(skill: Skill): Promise<void> {
    // Build content for embedding
    const content = this.buildSkillContent(skill);

    // Generate embedding
    const embedding = await this.agentDB.embed(content);

    // Store in AgentDB
    await this.agentDB.insert({
      content,
      embedding,
      metadata: {
        skillId: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        code: skill.code,
        testCases: skill.testCases,
        version: skill.version,
        dependencies: skill.dependencies,
        tags: skill.tags,
        capabilities: skill.capabilities,
        successRate: skill.successRate || 0,
        usageCount: skill.usageCount || 0,
        avgExecutionTime: skill.avgExecutionTime || 0,
        timestamp: Date.now(),
        type: 'skill'
      }
    });
  }

  /**
   * Get skill by ID
   *
   * @param skillId - The skill identifier
   * @returns The skill or null if not found
   */
  async getSkill(skillId: string): Promise<Skill | null> {
    const results = await this.agentDB.query({
      filter: (metadata: any) =>
        metadata.type === 'skill' && metadata.skillId === skillId
    });

    if (results.length === 0) return null;

    const result = results[0];
    return {
      id: result.metadata.skillId,
      name: result.metadata.name,
      description: result.metadata.description,
      category: result.metadata.category,
      code: result.metadata.code,
      testCases: result.metadata.testCases,
      version: result.metadata.version,
      dependencies: result.metadata.dependencies,
      tags: result.metadata.tags,
      capabilities: result.metadata.capabilities,
      successRate: result.metadata.successRate,
      usageCount: result.metadata.usageCount,
      avgExecutionTime: result.metadata.avgExecutionTime
    };
  }

  /**
   * Record skill usage and update statistics
   *
   * @param usage - Usage information
   */
  async recordSkillUsage(usage: SkillUsage): Promise<void> {
    // Get current skill data
    const skill = await this.getSkill(usage.skillId);
    if (!skill) return;

    // Calculate new statistics
    const oldCount = skill.usageCount || 0;
    const newCount = oldCount + 1;
    const oldSuccessRate = skill.successRate || 0;
    const newSuccessRate = (oldSuccessRate * oldCount + (usage.success ? 1 : 0)) / newCount;
    const oldAvgTime = skill.avgExecutionTime || 0;
    const newAvgTime = (oldAvgTime * oldCount + usage.executionTimeMs) / newCount;

    // Update in AgentDB
    await this.agentDB.update({
      filter: (metadata: any) =>
        metadata.type === 'skill' && metadata.skillId === usage.skillId,
      updates: {
        successRate: newSuccessRate,
        usageCount: newCount,
        avgExecutionTime: newAvgTime,
        lastUsed: Date.now()
      }
    });
  }

  /**
   * Evolve a skill to a new version
   *
   * @param evolution - Evolution details
   */
  async evolveSkill(evolution: SkillEvolution): Promise<void> {
    // Get current skill version
    const currentSkill = await this.getSkill(evolution.skillId);
    if (!currentSkill) {
      throw new Error(`Skill ${evolution.skillId} not found`);
    }

    // Create new version
    await this.addSkill({
      ...currentSkill,
      version: evolution.version,
      code: evolution.code,
      testCases: evolution.testCases || currentSkill.testCases,
      successRate: 0, // Reset for new version
      usageCount: 0
    });

    // Link to previous version
    await this.agentDB.update({
      filter: (metadata: any) =>
        metadata.type === 'skill' &&
        metadata.skillId === evolution.skillId &&
        metadata.version === evolution.version,
      updates: {
        parentVersion: currentSkill.version,
        changes: evolution.changes
      }
    });
  }

  /**
   * Get evolution history of a skill
   *
   * @param skillId - The skill identifier
   * @returns Array of skill versions
   */
  async getSkillHistory(skillId: string): Promise<SkillHistory[]> {
    const results = await this.agentDB.query({
      filter: (metadata: any) =>
        metadata.type === 'skill' && metadata.skillId === skillId
    });

    return results.map((result: any) => ({
      version: result.metadata.version,
      date: result.metadata.timestamp,
      usageCount: result.metadata.usageCount,
      successRate: result.metadata.successRate,
      changes: result.metadata.changes || 'Initial implementation'
    }));
  }

  /**
   * Create a composite skill from multiple components
   *
   * @param composition - Composition definition
   */
  async composeSkill(composition: CompositeSkill): Promise<void> {
    // Build content
    const content = this.buildCompositeContent(composition);

    // Generate embedding
    const embedding = await this.agentDB.embed(content);

    // Store composite skill
    await this.agentDB.insert({
      content,
      embedding,
      metadata: {
        skillId: composition.id,
        name: composition.name,
        description: composition.description,
        version: composition.version,
        isComposite: true,
        components: composition.components,
        compositionLogic: composition.compositionLogic,
        failureHandling: composition.failureHandling,
        timestamp: Date.now(),
        type: 'skill'
      }
    });
  }

  /**
   * Recommend skills for a task
   *
   * @param options - Recommendation options
   * @returns Array of recommended skills with relevance scores
   */
  async recommendSkills(options: {
    taskDescription: string;
    requiredCapabilities?: string[];
  }): Promise<SkillRecommendation[]> {
    // Generate embedding for task
    const queryEmbedding = await this.agentDB.embed(options.taskDescription);

    // Search for relevant skills
    const results = await this.agentDB.vectorSearch(queryEmbedding, 10, {
      filter: (metadata: any) => metadata.type === 'skill'
    });

    // Map to recommendations
    const recommendations: SkillRecommendation[] = results.map(result => {
      const relevance = this.calculateRelevance(
        result.similarity,
        result.metadata.successRate,
        options.requiredCapabilities,
        result.metadata.capabilities
      );

      return {
        skillId: result.metadata.skillId,
        relevance,
        reason: this.generateRecommendationReason(
          result,
          options.requiredCapabilities
        ),
        successRate: result.metadata.successRate
      };
    });

    // Sort by relevance
    return recommendations.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Search skills by criteria
   *
   * @param options - Search options
   * @returns Array of matching skills
   */
  async searchSkills(options: SearchSkillsOptions): Promise<Skill[]> {
    const results = await this.agentDB.query({
      filter: (metadata: any) => {
        if (metadata.type !== 'skill') return false;

        if (options.tags && options.tags.length > 0) {
          if (!metadata.tags || !options.tags.some(tag => metadata.tags.includes(tag))) {
            return false;
          }
        }

        if (options.minSuccessRate !== undefined) {
          if (metadata.successRate < options.minSuccessRate) {
            return false;
          }
        }

        if (options.category && metadata.category !== options.category) {
          return false;
        }

        return true;
      }
    });

    return results.map((result: any) => ({
      id: result.metadata.skillId,
      name: result.metadata.name,
      description: result.metadata.description,
      category: result.metadata.category,
      code: result.metadata.code,
      version: result.metadata.version,
      tags: result.metadata.tags,
      successRate: result.metadata.successRate,
      usageCount: result.metadata.usageCount
    }));
  }

  /**
   * Build content string from skill for embedding
   */
  private buildSkillContent(skill: Skill): string {
    const parts = [
      `Skill: ${skill.name}`,
      `Description: ${skill.description}`,
      skill.category ? `Category: ${skill.category}` : null,
      skill.tags ? `Tags: ${skill.tags.join(', ')}` : null,
      skill.capabilities ? `Capabilities: ${skill.capabilities.join(', ')}` : null
    ];

    return parts.filter(Boolean).join('\n');
  }

  /**
   * Build content for composite skill
   */
  private buildCompositeContent(composition: CompositeSkill): string {
    const componentNames = composition.components
      .map(c => c.skillId)
      .join(' → ');

    return [
      `Composite Skill: ${composition.name}`,
      `Description: ${composition.description}`,
      `Pipeline: ${componentNames}`,
      `Logic: ${composition.compositionLogic}`
    ].join('\n');
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(
    similarity: number,
    successRate: number,
    requiredCapabilities?: string[],
    skillCapabilities?: string[]
  ): number {
    let relevance = similarity * 0.6 + successRate * 0.4;

    // Boost if skill has required capabilities
    if (requiredCapabilities && skillCapabilities) {
      const matchedCapabilities = requiredCapabilities.filter(cap =>
        skillCapabilities.includes(cap)
      );
      const capabilityBonus = (matchedCapabilities.length / requiredCapabilities.length) * 0.2;
      relevance += capabilityBonus;
    }

    return Math.min(1.0, relevance);
  }

  /**
   * Generate recommendation reason
   */
  private generateRecommendationReason(
    result: any,
    requiredCapabilities?: string[]
  ): string {
    const reasons: string[] = [];

    if (result.similarity > 0.9) {
      reasons.push('Highly relevant to task');
    }

    if (result.metadata.successRate > 0.9) {
      reasons.push('Excellent success rate');
    }

    if (requiredCapabilities && result.metadata.capabilities) {
      const matched = requiredCapabilities.filter(cap =>
        result.metadata.capabilities.includes(cap)
      );
      if (matched.length > 0) {
        reasons.push(`Provides ${matched.join(', ')}`);
      }
    }

    return reasons.join('; ') || 'Relevant skill';
  }
}
