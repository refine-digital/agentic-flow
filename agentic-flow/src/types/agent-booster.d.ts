/**
 * Type declarations for agent-booster module
 * Stub types for compatibility - actual implementation uses EnhancedAgentBooster
 */

declare module 'agent-booster' {
  export interface MorphApplyRequest {
    target_filepath: string;
    instructions: string;
    code_edit: string;
    code?: string;
    edit?: string;
    language?: string;
  }

  export interface MorphApplyResponse {
    success: boolean;
    result?: string;
    output?: string;
    error?: string;
    latency?: number;
    latency_ms?: number;
    confidence?: number;
    strategy?: string;
  }

  export interface AgentBoosterConfig {
    confidenceThreshold?: number;
    maxChunks?: number;
  }

  export class AgentBooster {
    constructor(config?: AgentBoosterConfig);
    apply(request: MorphApplyRequest): Promise<MorphApplyResponse>;
    batchApply(requests: MorphApplyRequest[]): Promise<MorphApplyResponse[]>;
    getStats(): { totalOperations: number; avgLatency: number };
  }
}
