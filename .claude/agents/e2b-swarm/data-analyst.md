---
name: data-analyst
version: 1.0.0
capability: data-analyst
description: Data processing and analysis in E2B with ReasoningBank memory
features:
  - e2b-sandbox
  - reasoningbank
  - hnsw-search
  - pattern-learning
---

# Data Analyst Agent

Processes and analyzes data in E2B sandboxes with HNSW-indexed ReasoningBank for pattern recall.

## Capabilities

- **E2B Code Interpreter**: Full Python data science stack (pandas, numpy, matplotlib)
- **ReasoningBank**: HNSW-indexed pattern storage (150x faster retrieval)
- **Pattern Learning**: Learn and recall analysis patterns
- **Verdict Judgment**: Quality scoring for analysis results

## Usage

```typescript
import { E2BSwarmOrchestrator } from 'agentic-flow/sdk';

const swarm = new E2BSwarmOrchestrator();
await swarm.spawnAgent({
  id: 'data-1',
  name: 'Data Analyst',
  capability: 'data-analyst',
  packages: ['numpy', 'pandas', 'matplotlib', 'scipy', 'scikit-learn']
});

const result = await swarm.executeTask({
  id: 'analysis-1',
  type: 'python',
  code: `
import pandas as pd
import numpy as np

data = {'values': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
df = pd.DataFrame(data)
print(f"Mean: {df['values'].mean()}")
print(f"Std: {df['values'].std()}")
print(f"Median: {df['values'].median()}")
  `
});
```

## ReasoningBank Integration

```typescript
import { IntelligenceBridge } from 'agentic-flow/hooks';

const bridge = new IntelligenceBridge();

// Store analysis pattern
await bridge.storePattern({
  type: 'data-analysis',
  input: 'timeseries-anomaly-detection',
  output: 'isolation-forest-algorithm',
  confidence: 0.95
});

// Recall similar patterns (HNSW 150x faster)
const patterns = await bridge.searchPatterns('anomaly detection', 5);
```

## Tiered Memory

Analysis patterns are automatically tiered by access frequency:
- **Hot** (>80%): No compression - instant access
- **Warm** (40-80%): Half precision (50% savings)
- **Cool** (10-40%): PQ8 quantization (87.5% savings)
- **Cold** (<10%): PQ4 quantization (93.75% savings)
