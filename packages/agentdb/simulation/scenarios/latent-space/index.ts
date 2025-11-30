/**
 * Latent Space Exploration Simulations - Entry Point
 *
 * Comprehensive GNN latent space analysis for AgentDB v2 with RuVector backend.
 * Validates the unique positioning as the first vector database with native GNN attention.
 */

import hnswExplorationScenario from './hnsw-exploration';
import attentionAnalysisScenario from './attention-analysis';

export { hnswExplorationScenario, attentionAnalysisScenario };

export const latentSpaceScenarios = {
  'hnsw-exploration': hnswExplorationScenario,
  'attention-analysis': attentionAnalysisScenario,
};

export default latentSpaceScenarios;
