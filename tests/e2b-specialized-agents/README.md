# E2B Specialized Agents Testing Suite

Comprehensive testing suite for specialized development agents with domain-specific optimizations.

## Agents Under Test

1. **Backend-dev** - API development with pattern learning
2. **API-docs** - Documentation generation with templates
3. **ML-developer** - Machine learning with Flash Attention
4. **Base-template-generator** - Project scaffolding with GNN search

## Test Scenarios

### Backend-dev
- REST API Creation (medium complexity)
- GraphQL Schema Design (high complexity)
- Microservices Architecture (extreme complexity)

**Optimizations:**
- ReasoningBank for API pattern storage
- GNN Search for similar endpoint discovery
- Flash Attention for large schema processing

### API-docs
- OpenAPI Generation (medium complexity)
- Interactive Documentation (high complexity)
- Multi-Version API Docs (high complexity)

**Optimizations:**
- Documentation template library
- GNN Search for similar API patterns
- Pattern reuse for faster generation

### ML-developer
- Neural Network Training (high complexity)
- Hyperparameter Optimization (extreme complexity)
- Large Dataset Processing (extreme complexity)

**Optimizations:**
- ReasoningBank for model training patterns
- GNN Search for hyperparameter optimization
- Flash Attention for 100K+ sample processing

### Base-template-generator
- React App Template (medium complexity)
- Microservices Boilerplate (high complexity)
- Enterprise System Template (extreme complexity)

**Optimizations:**
- Template pattern library
- GNN Search for similar project structures
- Flash Attention for multi-file generation

## Running Tests

```bash
# Install dependencies
cd tests/e2b-specialized-agents
npm install

# Run all tests
npm test

# Run specific agent tests
npm run test:backend
npm run test:api-docs
npm run test:ml
npm run test:template

# Analyze results
npm run analyze

# Generate visualizations
npm run visualize
```

## Metrics Measured

1. **Execution Time** - Task completion speed
2. **Patterns Learned** - Pattern library growth
3. **GNN Search Time** - Pattern retrieval speed
4. **Flash Attention Gain** - Speedup from Flash Attention
5. **Memory Usage** - Resource efficiency
6. **Accuracy** - Task completion quality

## Expected Improvements

### Backend-dev
- Speed: 3.5x faster by iteration 5
- Pattern Accuracy: 92%+
- Memory Efficiency: 85%+

### API-docs
- Speed: 4.2x faster by iteration 5
- Pattern Accuracy: 94%+
- Template Reuse: 90%+

### ML-developer
- Speed: 5.8x faster with Flash Attention
- Pattern Learning: 89%+ accuracy
- Memory Efficiency: 92%+

### Base-template-generator
- Speed: 4.5x faster by iteration 5
- Pattern Accuracy: 93%+
- GNN Search: <50ms average

## Output Files

### Results Directory
- `backend-dev-results.json` - Backend agent test results
- `api-docs-results.json` - API docs agent test results
- `ml-developer-results.json` - ML agent test results
- `base-template-generator-results.json` - Template generator results
- `specialized-agents-report.json` - Comprehensive JSON report
- `specialized-agents-report.md` - Human-readable markdown report
- `deep-analysis-report.json` - Advanced analysis results
- `deep-analysis-report.md` - Deep analysis markdown

### Patterns Directory
- `backend-dev-patterns.json` - Learned API patterns
- `api-docs-patterns.json` - Documentation templates
- `ml-developer-patterns.json` - ML training patterns
- `base-template-generator-patterns.json` - Project templates

## Analysis Features

### Pattern Learning Effectiveness
Measures how effectively each agent learns and reuses patterns over iterations.

### Optimization Impact
Quantifies the impact of:
- GNN Search on pattern retrieval
- Flash Attention on processing speed
- Pattern reuse on overall efficiency

### Learning Curves
Analyzes performance improvement trajectories and projects optimal iteration counts.

### Cross-Agent Insights
Identifies:
- Pattern sharing opportunities between agents
- Complementary optimizations
- Universal best practices

## Architecture

```
tests/e2b-specialized-agents/
├── specialized-agents-test-suite.ts  # Main test runner
├── analyze-results.ts                # Deep analysis tools
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── README.md                         # This file
├── backend-dev/
│   ├── scenarios/                    # Test scenarios
│   ├── results/                      # Test results
│   └── patterns/                     # Learned patterns
├── api-docs/
│   └── ...
├── ml-developer/
│   └── ...
├── template-generator/
│   └── ...
├── results/                          # Aggregated results
└── patterns/                         # Pattern libraries
```

## Integration with Main Suite

This test suite is part of the larger agentic-flow testing infrastructure:
- Hooks into main benchmark system
- Shares pattern libraries with production agents
- Feeds results to neural training system
- Integrates with continuous optimization pipeline

## Best Practices

1. **Run iteratively** - Pattern learning improves over multiple runs
2. **Monitor memory** - Ensure pattern libraries don't grow unbounded
3. **Analyze trends** - Look for learning curve plateaus
4. **Share patterns** - Cross-pollinate successful patterns between agents
5. **Tune thresholds** - Adjust GNN search and pattern matching thresholds based on results

## Troubleshooting

### Tests running slowly
- Reduce iteration counts for extreme complexity scenarios
- Check Flash Attention is properly enabled
- Verify pattern library isn't causing overhead

### Low pattern reuse
- Lower GNN search threshold (try 0.80 instead of 0.85)
- Increase pattern learning iterations
- Check pattern categorization is working

### Memory issues
- Enable pattern compression
- Limit pattern library size per scenario
- Clear old patterns periodically

## Future Enhancements

- [ ] Real-time visualization dashboard
- [ ] Automated threshold tuning
- [ ] Cross-agent pattern transfer
- [ ] Distributed testing across multiple E2B sandboxes
- [ ] Integration with CI/CD pipeline
- [ ] A/B testing for optimization strategies

---

**Note**: This is a testing suite for development agents. Results inform production optimizations but tests run in isolated E2B sandboxes to ensure reproducibility.
