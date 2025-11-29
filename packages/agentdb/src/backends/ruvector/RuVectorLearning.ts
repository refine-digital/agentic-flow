/**
 * RuVectorLearning - GNN-Enhanced Vector Search
 *
 * Integrates Graph Neural Networks for query enhancement and self-learning.
 * Requires optional @ruvector/gnn package.
 *
 * Features:
 * - Query enhancement using neighbor context
 * - Training from success/failure feedback
 * - Persistent model storage
 * - Graceful degradation when GNN not available
 */

export interface LearningConfig {
  inputDim: number;
  outputDim: number;
  heads: number;
  learningRate: number;
}

export interface TrainingSample {
  embedding: Float32Array;
  label: number;
}

export interface TrainingResult {
  epochs: number;
  finalLoss: number;
  samples: number;
}

export class RuVectorLearning {
  private gnnLayer: any;
  private config: LearningConfig;
  private trainingBuffer: Array<{ embedding: number[]; label: number }> = [];
  private trained = false;
  private initialized = false;

  constructor(config: LearningConfig) {
    this.config = config;
  }

  /**
   * Initialize GNN layer with optional dependency handling
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const { GNNLayer } = await import('@ruvector/gnn');

      this.gnnLayer = new GNNLayer(
        this.config.inputDim,
        this.config.outputDim,
        this.config.heads
      );

      this.initialized = true;
    } catch (error) {
      throw new Error(
        `GNN initialization failed. Please install: npm install @ruvector/gnn\n` +
        `Error: ${(error as Error).message}`
      );
    }
  }

  /**
   * Enhance query embedding using neighbor context
   *
   * Uses Graph Attention Network to aggregate information from
   * nearest neighbors, weighted by their relevance scores.
   */
  enhance(
    query: Float32Array,
    neighbors: Float32Array[],
    weights: number[]
  ): Float32Array {
    this.ensureInitialized();

    if (!this.trained) {
      // Return unchanged if model not trained yet
      return query;
    }

    if (neighbors.length === 0) {
      return query;
    }

    try {
      const result = this.gnnLayer.forward(
        Array.from(query),
        neighbors.map(n => Array.from(n)),
        weights
      );

      return new Float32Array(result);
    } catch (error) {
      console.warn(`[RuVectorLearning] Enhancement failed: ${(error as Error).message}`);
      return query;
    }
  }

  /**
   * Add training sample for later batch training
   */
  addSample(embedding: Float32Array, success: boolean): void {
    this.trainingBuffer.push({
      embedding: Array.from(embedding),
      label: success ? 1 : 0
    });
  }

  /**
   * Train GNN model on accumulated samples
   */
  async train(options: {
    epochs?: number;
    batchSize?: number;
  } = {}): Promise<TrainingResult> {
    this.ensureInitialized();

    if (this.trainingBuffer.length < 10) {
      throw new Error(
        `Insufficient training samples: ${this.trainingBuffer.length}/10 minimum required`
      );
    }

    const epochs = options.epochs || 100;
    const batchSize = options.batchSize || 32;

    try {
      const result = await this.gnnLayer.train(this.trainingBuffer, {
        epochs,
        learningRate: this.config.learningRate,
        batchSize
      });

      this.trained = true;
      const sampleCount = this.trainingBuffer.length;
      this.trainingBuffer = []; // Clear buffer after training

      return {
        epochs,
        finalLoss: result.finalLoss || 0,
        samples: sampleCount
      };
    } catch (error) {
      throw new Error(`Training failed: ${(error as Error).message}`);
    }
  }

  /**
   * Save trained model to disk
   */
  async save(path: string): Promise<void> {
    this.ensureInitialized();

    if (!this.trained) {
      throw new Error('Cannot save untrained model');
    }

    try {
      this.gnnLayer.save(path);
    } catch (error) {
      throw new Error(`Model save failed: ${(error as Error).message}`);
    }
  }

  /**
   * Load trained model from disk
   */
  async load(path: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.gnnLayer.load(path);
      this.trained = true;
    } catch (error) {
      throw new Error(`Model load failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get training statistics
   */
  getStats(): {
    initialized: boolean;
    trained: boolean;
    bufferSize: number;
    config: LearningConfig;
  } {
    return {
      initialized: this.initialized,
      trained: this.trained,
      bufferSize: this.trainingBuffer.length,
      config: this.config
    };
  }

  /**
   * Clear training buffer without training
   */
  clearBuffer(): void {
    this.trainingBuffer = [];
  }

  /**
   * Ensure GNN is initialized before operations
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('RuVectorLearning not initialized. Call initialize() first.');
    }
  }
}
