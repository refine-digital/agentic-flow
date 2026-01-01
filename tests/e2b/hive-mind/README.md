# Hive Mind E2B Sandbox Tests

Comprehensive E2B testing suite for Hive Mind collective intelligence agents.

## Overview

This test suite validates the following Hive Mind components:
- **Queen Coordinators**: Strategic decision-making with 1.5x influence weight
- **Worker Specialists**: Tactical execution with 1.0x influence weight
- **Collective Intelligence**: Distributed cognitive processes and consensus
- **Scout Explorers**: Information reconnaissance and threat detection
- **Hyperbolic Attention**: Hierarchy modeling with curvature=-1.0

## Test Files

### 1. `queen-worker-hierarchy.test.ts`
Tests queen-worker hierarchy with hyperbolic attention:

**Key Tests:**
- Hierarchy initialization (2 queens, 8 workers)
- Hyperbolic attention configuration (curvature=-1.0)
- Distributed memory coordination
- Cross-agent knowledge sharing
- Consensus building with attention-weighted voting
- Scout exploration integration
- Performance metrics collection

**Expected Results:**
- Queens have 1.5x influence over workers
- Hyperbolic attention naturally models hierarchy
- Queens dominate strategic decisions despite being minority
- Memory coordination < 100ms average
- Collective sync < 50ms average

### 2. `collective-intelligence.test.ts`
Tests advanced collective intelligence features:

**Key Tests:**
- Knowledge graph integration (multi-agent knowledge)
- Cognitive load balancing (task redistribution)
- Emergent consensus mechanisms (weighted voting)
- Neural pattern learning (from successful decisions)
- Cross-session persistence (state restoration)

**Expected Results:**
- Knowledge graph depth: 3+ levels
- Cognitive load distribution: balanced
- Consensus threshold: >0.75 confidence
- Pattern learning: successful patterns guide decisions
- Session persistence: full state restoration

## Running Tests

### Run All Hive Mind Tests
```bash
cd /workspaces/agentic-flow
bash tests/e2b/hive-mind/run-hive-tests.sh
```

### Run Individual Test Suites
```bash
# Queen-Worker Hierarchy
npx jest tests/e2b/hive-mind/queen-worker-hierarchy.test.ts --verbose

# Collective Intelligence
npx jest tests/e2b/hive-mind/collective-intelligence.test.ts --verbose
```

### Run in E2B Sandbox
```bash
# Set E2B environment variables
export E2B_SANDBOX_ID="your-sandbox-id"
export E2B_API_KEY="your-api-key"

# Run tests
bash tests/e2b/hive-mind/run-hive-tests.sh
```

## Test Configuration

Environment variables:
```bash
HIVE_TEST_SESSION="hive-mind-e2b-<timestamp>"
HIVE_QUEENS=2                    # Number of queen coordinators
HIVE_WORKERS=8                   # Number of worker specialists
HIVE_HYPERBOLIC_CURVATURE=-1.0   # Hyperbolic attention curvature
HIVE_QUEEN_INFLUENCE=1.5         # Queen influence weight
HIVE_WORKER_INFLUENCE=1.0        # Worker influence weight
```

## Test Metrics

### Performance Targets
- **Memory Coordination**: < 100ms average latency
- **Collective Sync**: < 50ms average latency
- **Knowledge Graph Build**: < 50ms average latency
- **Consensus Building**: < 10ms average latency
- **Pattern Learning**: < 50ms average latency

### Quality Targets
- **Hierarchy Modeling**: Queens naturally dominate via hyperbolic attention
- **Influence Ratio**: Queen/worker ~1.5:1 (measured in consensus)
- **Consensus Confidence**: > 0.75 threshold
- **Knowledge Coverage**: 3+ graph depth levels
- **Agent Compliance**: 100% (all agents responsive)

## Architecture

### Hierarchy Model
```
┌─────────────────────────────────────────┐
│         Collective Intelligence         │
│           (Neural Nexus)                │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│  Queen Alpha  │       │  Queen Beta   │
│ (Strategic)   │       │ (Strategic)   │
│ 1.5x Influence│       │ 1.5x Influence│
└───────────────┘       └───────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
    ┌───────────────────────────────┐
    │         8 Workers             │
    │  (Tactical Execution)         │
    │   1.0x Influence Each         │
    └───────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│ Scout: Security│      │Scout: Perf    │
│ (Reconnaissance)│      │(Reconnaissance)│
└───────────────┘       └───────────────┘
```

### Hyperbolic Attention
- **Curvature**: -1.0 (hyperbolic space)
- **Distance Metric**: Poincaré distance
- **Hierarchy Property**: Higher influence = closer in hyperbolic space
- **Natural Clustering**: Queens cluster together, separate from workers

### Memory Coordination
```javascript
// Queens issue directives
swarm/shared/royal-directives

// Workers acknowledge
swarm/worker-{id}/task-received

// Collective state
swarm/shared/collective-state

// Knowledge graph
swarm/shared/knowledge-graph

// Discoveries
swarm/shared/discovery-{timestamp}
```

## Expected Output

```
🐝 Hive Mind E2B Test Suite
==============================

Test Configuration:
  Session ID: hive-mind-e2b-1234567890
  Queens: 2 (influence: 1.5x)
  Workers: 8 (influence: 1.0x)
  Hyperbolic Curvature: -1.0

✓ Running in E2B sandbox: e2b-xyz123

═══════════════════════════════════════
TEST 1: Queen-Worker Hierarchy
═══════════════════════════════════════

Running: Queen-Worker Hierarchy
----------------------------------------
  ✓ should initialize 2 queens with 1.5x influence weight
  ✓ should initialize 8 workers with 1.0x influence weight
  ✓ should establish queen/worker hierarchy ratio of 1.5:1
  ✓ should configure hyperbolic attention with curvature=-1.0
  ✓ should calculate Poincaré distances correctly
  ✓ should apply higher attention weights to queens
  ✓ should coordinate queen directives via memory
  ✓ should synchronize collective state across agents
  ✓ should enable queens to share strategic insights
  ✓ should enable workers to share execution details
  ✓ should build consensus favoring queens (1.5x influence)
  ✓ should validate queen/worker influence ratio close to 1.5:1
  ✓ should deploy scouts for reconnaissance
  ✓ should measure hierarchy modeling quality
  ✓ should verify coordination time is acceptable
  ✓ should verify memory sync speed is efficient
  ✓ should maintain high coherence score across swarm

✓ Queen-Worker Hierarchy PASSED (1234ms)

═══════════════════════════════════════
TEST 2: Collective Intelligence
═══════════════════════════════════════

Running: Collective Intelligence
----------------------------------------
  ✓ should build collective knowledge graph
  ✓ should traverse knowledge graph with depth limit
  ✓ should aggregate knowledge from multiple sources
  ✓ should track agent cognitive loads
  ✓ should identify overloaded agents
  ✓ should find least loaded agents for task assignment
  ✓ should collect weighted votes from agents
  ✓ should reach consensus when threshold is met
  ✓ should return no consensus when threshold is not met
  ✓ should learn patterns from successful decisions
  ✓ should apply learned patterns to new decisions
  ✓ should persist collective state across sessions
  ✓ should restore collective state from previous session
  ✓ should report collective intelligence metrics
  ✓ should verify efficient knowledge operations
  ✓ should verify low-latency consensus building

✓ Collective Intelligence PASSED (987ms)

═══════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════

Total Tests: 2
Passed: 2
Failed: 0

Pass Rate: 100%

Expected Metrics:
  • Hierarchy modeling quality: High (hyperbolic attention)
  • Queen/worker influence ratio: ~1.5:1
  • Coordination time: <100ms average
  • Memory sync speed: <50ms average
  • Consensus confidence: >0.75
  • Knowledge graph depth: 3 levels

🎉 All Hive Mind tests PASSED!
```

## Integration with AgentDB

These tests use AgentDB's hyperbolic attention features:
- `@ruvector/attention` package
- Hyperbolic attention mechanism (curvature=-1.0)
- Poincaré distance calculations
- Attention-weighted consensus

## Next Steps

1. **Run Tests**: Execute the test suite
2. **Analyze Metrics**: Review performance metrics output
3. **Validate Hierarchy**: Confirm queen/worker influence ratio
4. **Check Consensus**: Verify consensus confidence > 0.75
5. **Review Knowledge Graph**: Inspect collective knowledge depth

## Troubleshooting

**If tests fail:**
1. Check hyperbolic attention configuration
2. Verify memory coordination setup
3. Ensure proper agent initialization
4. Review consensus threshold settings
5. Check E2B sandbox connectivity

**Performance Issues:**
- Reduce number of agents
- Adjust hyperbolic curvature
- Optimize memory operations
- Check cognitive load distribution

## References

- [Hive Mind Agents](../../../.claude/agents/hive-mind/)
- [Hyperbolic Attention](../../../packages/agentdb/src/types/attention.ts)
- [AgentDB Documentation](../../../packages/agentdb/README.md)
- [E2B Sandboxes](https://e2b.dev/docs)
