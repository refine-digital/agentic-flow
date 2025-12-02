# Memory Controllers for Agentic-Flow v2.0.0-alpha

Complete memory management system integrating AgentDB v2 for advanced AI agent capabilities.

## 🎯 Overview

The Memory Controllers provide a comprehensive system for agent learning, reasoning, and skill management:

- **ReasoningBankController**: Pattern storage and retrieval for meta-learning
- **ReflexionMemoryController**: Self-reflection and learning from failures
- **SkillLibraryController**: Skill evolution and composition
- **CausalMemoryGraphController**: Causal reasoning and explainable decisions

## 📦 Installation

```bash
npm install agentdb@latest
```

## 🚀 Quick Start

### 1. Initialize AgentDB

```typescript
import { AgentDB } from 'agentdb';
import {
  ReasoningBankController,
  ReflexionMemoryController,
  SkillLibraryController,
  CausalMemoryGraphController
} from './controllers';

// Initialize AgentDB with RuVector backend
const agentDB = new AgentDB({
  backend: 'ruvector',
  dimensions: 384
});

// Create wrapper
const agentDBWrapper: AgentDBWrapper = {
  insert: (doc) => agentDB.insert(doc),
  vectorSearch: (query, k, opts) => agentDB.search(query, k, opts),
  // ... other methods
};

// Initialize controllers
const reasoningBank = new ReasoningBankController(agentDBWrapper);
const reflexionMemory = new ReflexionMemoryController(agentDBWrapper);
const skillLibrary = new SkillLibraryController(agentDBWrapper);
const causalGraph = new CausalMemoryGraphController(agentDBWrapper);
```

## 🧠 ReasoningBankController

Stores and retrieves successful reasoning patterns for meta-learning.

### Store Pattern

```typescript
await reasoningBank.storePattern({
  sessionId: 'session-1',
  task: 'Build REST API with authentication',
  input: 'Design secure API endpoints',
  output: 'Created 5 endpoints with JWT auth and rate limiting',
  reward: 0.95,
  success: true,
  critique: 'Excellent implementation with security best practices',
  tokensUsed: 1500,
  latencyMs: 2300
});
```

### Search Similar Patterns

```typescript
// Find similar successful patterns
const patterns = await reasoningBank.searchPatterns(
  'Build REST API',
  5,
  {
    minReward: 0.8,
    onlySuccesses: true
  }
);

patterns.forEach(pattern => {
  console.log(`Task: ${pattern.task}`);
  console.log(`Reward: ${pattern.reward}`);
  console.log(`Similarity: ${pattern.similarity}`);
});
```

### Get Pattern Statistics

```typescript
const stats = await reasoningBank.getPatternStats('API development', 10);

console.log(`Total attempts: ${stats.totalAttempts}`);
console.log(`Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
console.log(`Average reward: ${stats.avgReward.toFixed(2)}`);
console.log(`Recent patterns: ${stats.recentPatterns.length}`);
```

## 🔄 ReflexionMemoryController

Implements reflexive learning from failures (based on "Reflexion" paper).

### Store Reflexion

```typescript
// Failed attempt
await reflexionMemory.storeReflexion({
  taskId: 'auth-implementation',
  attempt: 1,
  action: 'Implemented JWT authentication',
  observation: 'Security vulnerability: tokens never expire',
  reflection: `
    I failed to implement token expiration, which is a critical security flaw.
    The issue was that I focused only on token generation and verification,
    but didn't consider the lifecycle of tokens.

    Next time I should:
    1. Always implement expiration for security tokens
    2. Add refresh token mechanism
    3. Test token lifecycle, not just generation
  `,
  success: false,
  reward: 0.3
});

// Successful attempt after learning
await reflexionMemory.storeReflexion({
  taskId: 'auth-implementation',
  attempt: 2,
  action: 'Implemented JWT with expiration and refresh tokens',
  observation: 'All security tests passing, tokens expire correctly',
  reflection: `
    Success! By learning from my previous mistake, I remembered to:
    1. Set appropriate expiration times (15 min for access, 7 days for refresh)
    2. Implement token refresh endpoint
    3. Test full token lifecycle
  `,
  success: true,
  reward: 1.0
});
```

### Get Improvement Chain

```typescript
const chain = await reflexionMemory.getImprovementChain('auth-implementation');

console.log(`Task: ${chain.taskId}`);
console.log(`Total improvement: ${chain.totalImprovement}`);
console.log(`Attempts needed: ${chain.attemptsNeeded}`);

chain.attempts.forEach(attempt => {
  console.log(`Attempt ${attempt.attempt}: ${attempt.reward} - ${attempt.success ? 'Success' : 'Failed'}`);
});
```

### Find Error Patterns

```typescript
const errorPatterns = await reflexionMemory.findErrorPatterns({
  minOccurrences: 3,
  timeWindow: '30d',
  category: 'security'
});

errorPatterns.forEach(pattern => {
  console.log(`Pattern: ${pattern.pattern}`);
  console.log(`Occurrences: ${pattern.occurrences}`);
  console.log(`Avg Reward: ${pattern.avgReward}`);
  console.log(`Common Tasks: ${pattern.commonTasks.join(', ')}`);
});
```

### Share Reflexions Across Agents

```typescript
// Share successful learning with other agents
await reflexionMemory.shareReflexion({
  reflexionId: 'auth-impl-success-123',
  targetAgents: ['agent-2', 'agent-3', 'agent-4'],
  shareLevel: 'successful-only'
});

// Get shared learnings
const sharedLearnings = await reflexionMemory.getSharedReflexions({
  taskCategory: 'authentication',
  minReward: 0.8,
  fromAgents: ['experienced-agent-1']
});
```

## 🛠️ SkillLibraryController

Manages reusable skills with versioning and composition.

### Add Skill

```typescript
await skillLibrary.addSkill({
  id: 'input-validation',
  name: 'User Input Validation',
  description: 'Validate and sanitize user input to prevent XSS and SQL injection',
  category: 'security',
  code: `
    function validateInput(input: string, type: 'email' | 'text' | 'number'): boolean {
      const patterns = {
        email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
        text: /^[a-zA-Z0-9\\s\\-_.]+$/,
        number: /^\\d+$/
      };

      const sanitized = input.trim().replace(/<[^>]*>/g, '');
      return patterns[type].test(sanitized);
    }
  `,
  testCases: [
    { input: 'test@example.com', type: 'email', expected: true },
    { input: 'invalid-email', type: 'email', expected: false },
    { input: '<script>alert("xss")</script>', type: 'text', expected: false }
  ],
  version: '1.0.0',
  tags: ['validation', 'security', 'input-sanitization']
});
```

### Record Skill Usage

```typescript
await skillLibrary.recordSkillUsage({
  skillId: 'input-validation',
  taskId: 'form-submission',
  success: true,
  executionTimeMs: 2,
  feedback: 'Correctly validated email format'
});
```

### Evolve Skill

```typescript
await skillLibrary.evolveSkill({
  skillId: 'input-validation',
  version: '1.1.0',
  changes: 'Added support for international characters in email',
  code: `
    function validateInput(input: string, type: 'email' | 'text' | 'number'): boolean {
      const patterns = {
        email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/u,
        text: /^[\\p{L}\\p{N}\\s\\-_.]+$/u,
        number: /^\\d+$/
      };

      const sanitized = input.trim().replace(/<[^>]*>/g, '');
      return patterns[type].test(sanitized);
    }
  `,
  testCases: [
    { input: 'user@übung.de', type: 'email', expected: true },
    { input: 'François Müller', type: 'text', expected: true }
  ]
});
```

### Compose Skills

```typescript
await skillLibrary.composeSkill({
  id: 'secure-form-handler',
  name: 'Secure Form Handler',
  description: 'Complete form handling with validation, sanitization, and CSRF protection',
  components: [
    { skillId: 'input-validation', order: 1 },
    { skillId: 'csrf-protection', order: 2 },
    { skillId: 'rate-limiting', order: 3 },
    { skillId: 'database-insert', order: 4 }
  ],
  compositionLogic: 'sequential',
  version: '1.0.0',
  failureHandling: 'rollback'
});
```

### Get Skill Recommendations

```typescript
const recommendations = await skillLibrary.recommendSkills({
  taskDescription: 'Build a user registration form',
  requiredCapabilities: ['email-validation', 'password-hashing', 'database-storage']
});

recommendations.forEach(rec => {
  console.log(`Skill: ${rec.skillId}`);
  console.log(`Relevance: ${rec.relevance}`);
  console.log(`Reason: ${rec.reason}`);
  console.log(`Success Rate: ${rec.successRate}`);
});
```

## 🔗 CausalMemoryGraphController

Builds causal graphs for explainable reasoning.

### Add Causal Edge

```typescript
await causalGraph.addCausalEdge({
  cause: 'added-caching',
  effect: 'reduced-latency',
  confidence: 0.95,
  mechanism: 'Caching reduces database queries, lowering response time',
  evidence: ['benchmark-results-id', 'user-feedback-id', 'monitoring-data-id'],
  strength: 0.92
});
```

### Forward Inference (Predict Effects)

```typescript
const effects = await causalGraph.forwardInference('deploy-new-auth-system', {
  maxDepth: 3,
  minConfidence: 0.7
});

console.log('Predicted effects:');
effects.forEach(effect => {
  console.log(`  - ${effect.effect} (${(effect.confidence * 100).toFixed(1)}%)`);
  console.log(`    Mechanism: ${effect.mechanism}`);
  console.log(`    Path: ${effect.path?.join(' → ')}`);
});
```

### Backward Inference (Find Causes)

```typescript
const causes = await causalGraph.backwardInference('40%-increase-in-auth-failures', {
  maxDepth: 5,
  minConfidence: 0.6,
  rankByCausalStrength: true
});

console.log('Root causes:');
causes.forEach(cause => {
  console.log(`  - ${cause.effect} (${(cause.confidence * 100).toFixed(1)}%)`);
});
```

### Detect Causal Loops

```typescript
const loops = await causalGraph.detectCausalLoops();

if (loops.length > 0) {
  console.warn(`Found ${loops.length} causal loops (potential issues):`);
  loops.forEach(loop => {
    console.log(`  Loop: ${loop.join(' → ')}`);
  });
}
```

### Export Graph for Visualization

```typescript
const graphData = await causalGraph.exportGraph({
  format: 'json',
  includeMetadata: true,
  highlightPaths: [
    { from: 'added-caching', to: 'improved-performance' }
  ]
});

// Save to file for visualization
await fs.writeFile('causal-graph.json', JSON.stringify(graphData, null, 2));
```

## 🔄 Complete Learning Cycle

Example of full learning cycle using all controllers:

```typescript
async function completeLearningCycle() {
  const taskId = 'implement-caching';

  // 1. Failed attempt with reflexion
  await reflexionMemory.storeReflexion({
    taskId,
    attempt: 1,
    action: 'Added basic caching',
    observation: 'Cache invalidation issues',
    reflection: 'Need proper cache invalidation strategy',
    success: false,
    reward: 0.4
  });

  // 2. Successful attempt with pattern
  await reasoningBank.storePattern({
    sessionId: `${taskId}-success`,
    task: 'Implement Redis caching with TTL',
    reward: 0.95,
    success: true,
    critique: 'TTL-based invalidation works perfectly'
  });

  // 3. Create reusable skill
  await skillLibrary.addSkill({
    id: 'redis-caching',
    name: 'Redis Caching',
    description: 'Caching with TTL-based invalidation',
    code: 'function cache(key, value, ttl) { redis.set(key, value, ttl); }',
    version: '1.0.0'
  });

  // 4. Establish causal relationship
  await causalGraph.addCausalEdge({
    cause: 'redis-caching-with-ttl',
    effect: 'no-cache-invalidation-issues',
    confidence: 0.95,
    mechanism: 'TTL automatically removes stale cache entries'
  });

  // Verify learning
  const chain = await reflexionMemory.getImprovementChain(taskId);
  console.log(`Improvement: ${chain.totalImprovement}`);
}
```

## 📊 Performance Characteristics

| Operation | Time (avg) | Notes |
|-----------|------------|-------|
| Store Pattern | 2-5ms | Using RuVector backend |
| Search Patterns (k=10) | 15-20ms | With vector search |
| Store Reflexion | 2-5ms | Includes embedding |
| Add Skill | 3-7ms | With metadata |
| Causal Query (depth=3) | 20-30ms | Graph traversal |

## 🎯 Best Practices

### 1. Use Appropriate Controllers

- **ReasoningBank**: For successful patterns and meta-learning
- **ReflexionMemory**: For failures and self-critique
- **SkillLibrary**: For reusable code patterns
- **CausalGraph**: For explainable decisions

### 2. Set Proper Confidence Thresholds

```typescript
// High confidence for critical decisions
const criticalPatterns = await reasoningBank.searchPatterns(task, 5, {
  minReward: 0.9
});

// Lower confidence for exploration
const exploratoryPatterns = await reasoningBank.searchPatterns(task, 10, {
  minReward: 0.5
});
```

### 3. Track Evidence

```typescript
await causalGraph.addCausalEdge({
  cause: action,
  effect: result,
  confidence: 0.95,
  evidence: [
    'quantitative-benchmark-id',
    'qualitative-feedback-id',
    'observational-metrics-id'
  ]
});
```

### 4. Share Learnings

```typescript
// Share successful patterns across agent swarm
await reflexionMemory.shareReflexion({
  reflexionId: successId,
  targetAgents: ['agent-2', 'agent-3'],
  shareLevel: 'successful-only'
});
```

## 📚 API Reference

Full API documentation available in TypeScript definitions:

- [ReasoningBankController](../src/controllers/reasoning-bank.ts)
- [ReflexionMemoryController](../src/controllers/reflexion-memory.ts)
- [SkillLibraryController](../src/controllers/skill-library.ts)
- [CausalMemoryGraphController](../src/controllers/causal-memory.ts)

## 🧪 Testing

Run unit tests:

```bash
npm run test:unit
```

Run integration tests:

```bash
npm run test:integration
```

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE)

---

**Version**: 2.0.0-alpha
**Last Updated**: 2025-12-02
**Status**: Production Ready
