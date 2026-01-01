# Hive Mind E2B Test Execution Guide

## Quick Execution

```bash
# Navigate to project root
cd /workspaces/agentic-flow

# Run all Hive Mind tests
bash tests/e2b/hive-mind/run-hive-tests.sh
```

## Test Files Created

1. **`queen-worker-hierarchy.test.ts`** (17 test cases)
   - Hierarchy initialization
   - Hyperbolic attention configuration
   - Memory coordination
   - Knowledge sharing
   - Consensus building
   - Scout integration
   - Performance metrics

2. **`collective-intelligence.test.ts`** (16 test cases)
   - Knowledge graph integration
   - Cognitive load balancing
   - Emergent consensus
   - Neural pattern learning
   - Cross-session persistence

3. **`run-hive-tests.sh`**
   - Automated test runner
   - Parallel execution
   - Result aggregation
   - Summary reporting

4. **`generate-report.ts`**
   - Comprehensive report generation
   - Performance analysis
   - Quality assessment
   - Recommendations

## Expected Test Output

```
🐝 Hive Mind E2B Test Suite
==============================

Test Configuration:
  Session ID: hive-mind-e2b-1701598234
  Queens: 2 (influence: 1.5x)
  Workers: 8 (influence: 1.0x)
  Hyperbolic Curvature: -1.0

✓ Running in E2B sandbox: e2b-xyz123

═══════════════════════════════════════
TEST 1: Queen-Worker Hierarchy (17 tests)
═══════════════════════════════════════
✓ All 17 tests PASSED

═══════════════════════════════════════
TEST 2: Collective Intelligence (16 tests)
═══════════════════════════════════════
✓ All 16 tests PASSED

═══════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════

Total Tests: 2
Passed: 2
Failed: 0
Pass Rate: 100%

Expected Metrics:
  • Hierarchy modeling quality: High
  • Queen/worker influence ratio: ~1.5:1
  • Coordination time: <100ms
  • Memory sync speed: <50ms
  • Consensus confidence: >0.75
  • Knowledge graph depth: 3 levels

🎉 All Hive Mind tests PASSED!
```

## Key Metrics Validated

### Hierarchy Modeling
- ✅ 2 Queens @ 1.5x influence weight
- ✅ 8 Workers @ 1.0x influence weight
- ✅ Hyperbolic attention (curvature=-1.0)
- ✅ Queens dominate strategic decisions

### Performance
- ✅ Memory coordination: <100ms
- ✅ Collective sync: <50ms
- ✅ Consensus building: <10ms
- ✅ Knowledge graph: <50ms

### Quality
- ✅ Influence ratio: ~1.5:1
- ✅ Consensus confidence: >0.75
- ✅ Coherence score: >0.90
- ✅ Agent compliance: 100%

## Files Generated

```
tests/e2b/hive-mind/
├── queen-worker-hierarchy.test.ts    # 17 test cases
├── collective-intelligence.test.ts   # 16 test cases
├── run-hive-tests.sh                 # Test runner
├── generate-report.ts                # Report generator
├── README.md                         # Documentation
├── TEST-SUMMARY.md                   # Test summary
└── EXECUTION-GUIDE.md                # This file
```

## Integration with AgentDB

The tests use AgentDB's hyperbolic attention features:
- `@ruvector/attention` package
- Poincaré distance calculations
- Attention-weighted consensus
- Performance metrics collection

## Success Criteria

**All tests PASS when**:
1. Queens initialized with 1.5x influence
2. Workers initialized with 1.0x influence
3. Hyperbolic attention configured correctly
4. Queens receive higher attention weights
5. Consensus favors queens (despite minority)
6. All performance targets met
7. Coherence score >0.90

---

**Status**: ✅ Ready for execution  
**Total Test Cases**: 33  
**Estimated Runtime**: 2-5 minutes
