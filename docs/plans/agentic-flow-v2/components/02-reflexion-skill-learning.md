# Component Deep-Dive: Reflexion & Skill Learning

## 🎯 Overview

The Reflexion & Skill Learning system enables agents to learn from their mistakes, improve over time, and build a library of reusable skills. This is a critical component for creating truly adaptive, self-improving AI agents.

**Controllers**:
- `ReflexionMemory` - Self-reflection and learning from failures
- `SkillLibrary` - Skill storage, evolution, and retrieval
- `NightlyLearner` - Background learning and consolidation

**Performance**: Enables continuous improvement with measurable skill progression
**Use Cases**: Error recovery, skill acquisition, curriculum learning, meta-learning

## 📦 Component Architecture

```typescript
┌──────────────────────────────────────────────────────────────┐
│            Reflexion & Skill Learning System                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              ReflexionMemory                            │ │
│  │  • Store failed attempts with critiques                │ │
│  │  • Learn from mistakes                                 │ │
│  │  • Self-correction strategies                          │ │
│  │  • Error pattern recognition                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              SkillLibrary                               │ │
│  │  • Skill storage and versioning                        │ │
│  │  • Skill evolution tracking                            │ │
│  │  • Skill composition (combine skills)                  │ │
│  │  • Success rate tracking                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              NightlyLearner                             │ │
│  │  • Background model updates                            │ │
│  │  • Pattern consolidation                               │ │
│  │  • Periodic skill optimization                         │ │
│  │  • Memory compression                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## 🔌 ReflexionMemory Integration

### Core Concept

**Reflexion** is inspired by the research paper ["Reflexion: Language Agents with Verbal Reinforcement Learning"](https://arxiv.org/abs/2303.11366). Agents reflect on their failures, generate self-critiques, and improve on subsequent attempts.

### Basic Usage

```typescript
import { ReflexionMemory } from 'agentdb@alpha/controllers/ReflexionMemory';
import { AgentDB } from 'agentdb@alpha';

const db = new AgentDB({ backend: 'ruvector' });
const reflexion = new ReflexionMemory(db);

// Store a failed attempt with self-critique
await reflexion.storeReflexion({
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

// Retrieve reflexions for similar tasks
const pastReflexions = await reflexion.getReflexionsForTask('auth-implementation');

// Use reflexions to improve next attempt
await reflexion.storeReflexion({
  taskId: 'auth-implementation',
  attempt: 2,
  action: 'Implemented JWT with expiration and refresh tokens',
  observation: 'All security tests passing, tokens expire correctly',
  reflection: `
    Success! By learning from my previous mistake, I remembered to:
    1. Set appropriate expiration times (15 min for access, 7 days for refresh)
    2. Implement token refresh endpoint
    3. Test full token lifecycle

    This pattern of "always consider lifecycle" should be applied to
    other security-sensitive features.
  `,
  success: true,
  reward: 1.0
});
```

### Advanced Features

#### 1. Error Pattern Recognition

```typescript
// Identify recurring error patterns
const errorPatterns = await reflexion.findErrorPatterns({
  minOccurrences: 3, // Seen at least 3 times
  timeWindow: '30d',  // In last 30 days
  category: 'security'
});

// Example output:
// [
//   {
//     pattern: 'Forgot to validate user input',
//     occurrences: 7,
//     avgReward: 0.2,
//     commonTasks: ['form-handling', 'api-endpoints', 'data-processing']
//   },
//   {
//     pattern: 'Missing error handling for network requests',
//     occurrences: 5,
//     avgReward: 0.3,
//     commonTasks: ['api-calls', 'database-queries']
//   }
// ]

// Create preventive strategies
for (const pattern of errorPatterns) {
  await reflexion.createPreventiveStrategy({
    pattern: pattern.pattern,
    strategy: `
      Before implementing similar tasks, always:
      1. Review past failures related to "${pattern.pattern}"
      2. Add explicit checks/validations
      3. Test edge cases specific to this pattern
    `,
    applicableTo: pattern.commonTasks
  });
}
```

#### 2. Self-Correction Chains

```typescript
// Track improvement over multiple attempts
const improvementChain = await reflexion.getImprovementChain('auth-implementation');

// Example output:
// [
//   { attempt: 1, reward: 0.3, issue: 'No token expiration' },
//   { attempt: 2, reward: 1.0, issue: 'None - all tests passed' },
//   { totalImprovement: 0.7, attemptsNeeded: 2 }
// ]

// Visualize learning curve
const learningCurve = await reflexion.getLearningCurve({
  taskCategory: 'authentication',
  groupBy: 'week'
});

// Example output:
// [
//   { week: 1, avgReward: 0.4, successRate: 0.3 },
//   { week: 2, avgReward: 0.7, successRate: 0.6 },
//   { week: 3, avgReward: 0.9, successRate: 0.9 }
// ]
```

#### 3. Multi-Agent Reflexion Sharing

```typescript
// Share successful reflexions across agent swarm
await reflexion.shareReflexion({
  reflexionId: 'auth-impl-success-123',
  targetAgents: ['agent-2', 'agent-3', 'agent-4'],
  shareLevel: 'successful-only' // Only share successes
});

// Agents can query shared reflexions
const sharedLearnings = await reflexion.getSharedReflexions({
  taskCategory: 'authentication',
  minReward: 0.8, // Only high-quality learnings
  fromAgents: ['experienced-agent-1', 'experienced-agent-2']
});
```

## 🛠️ SkillLibrary Integration

### Core Concept

The **SkillLibrary** stores reusable agent skills, tracks their evolution, and enables skill composition. Skills are versioned, tested, and improved over time.

### Basic Usage

```typescript
import { SkillLibrary } from 'agentdb@alpha/controllers/SkillLibrary';

const skillLibrary = new SkillLibrary(db);

// Define a new skill
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

      // Sanitize
      const sanitized = input.trim().replace(/<[^>]*>/g, '');

      // Validate
      return patterns[type].test(sanitized);
    }
  `,
  testCases: [
    { input: 'test@example.com', type: 'email', expected: true },
    { input: 'invalid-email', type: 'email', expected: false },
    { input: '<script>alert("xss")</script>', type: 'text', expected: false }
  ],
  version: '1.0.0',
  dependencies: [],
  tags: ['validation', 'security', 'input-sanitization']
});

// Retrieve and use a skill
const skill = await skillLibrary.getSkill('input-validation');

// Execute skill
const isValid = await skillLibrary.executeSkill('input-validation', {
  input: 'user@example.com',
  type: 'email'
});
```

### Skill Evolution

```typescript
// Track skill usage and success
await skillLibrary.recordSkillUsage({
  skillId: 'input-validation',
  taskId: 'form-submission',
  success: true,
  executionTimeMs: 2,
  feedback: 'Correctly validated email format'
});

// Skill improves over time based on feedback
await skillLibrary.evolveSkill({
  skillId: 'input-validation',
  version: '1.1.0',
  changes: 'Added support for international characters in email',
  code: `
    function validateInput(input: string, type: 'email' | 'text' | 'number'): boolean {
      const patterns = {
        email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/u, // Added 'u' flag for Unicode
        text: /^[\\p{L}\\p{N}\\s\\-_.]+$/u,        // Support Unicode letters/numbers
        number: /^\\d+$/
      };

      const sanitized = input.trim().replace(/<[^>]*>/g, '');
      return patterns[type].test(sanitized);
    }
  `,
  testCases: [
    // ... previous tests ...
    { input: 'user@übung.de', type: 'email', expected: true }, // New test
    { input: 'François Müller', type: 'text', expected: true }  // New test
  ]
});

// View skill evolution history
const history = await skillLibrary.getSkillHistory('input-validation');

// Example output:
// [
//   {
//     version: '1.0.0',
//     date: '2025-01-01',
//     usageCount: 47,
//     successRate: 0.94,
//     changes: 'Initial implementation'
//   },
//   {
//     version: '1.1.0',
//     date: '2025-01-15',
//     usageCount: 23,
//     successRate: 0.98,
//     changes: 'Added Unicode support'
//   }
// ]
```

### Skill Composition

```typescript
// Combine multiple skills into a composite skill
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
  compositionLogic: 'sequential', // Run skills in order
  failureHandling: 'rollback' // Rollback if any skill fails
});

// Execute composite skill
const result = await skillLibrary.executeSkill('secure-form-handler', {
  formData: { email: 'user@example.com', name: 'John Doe' },
  csrfToken: 'abc123',
  ipAddress: '192.168.1.1'
});

// Result includes execution trace
// {
//   success: true,
//   executionTrace: [
//     { skill: 'input-validation', success: true, timeMs: 2 },
//     { skill: 'csrf-protection', success: true, timeMs: 1 },
//     { skill: 'rate-limiting', success: true, timeMs: 3 },
//     { skill: 'database-insert', success: true, timeMs: 15 }
//   ],
//   totalTimeMs: 21
// }
```

### Skill Discovery and Recommendation

```typescript
// Find skills relevant to a task
const recommendations = await skillLibrary.recommendSkills({
  taskDescription: 'Build a user registration form',
  context: {
    currentSkills: ['basic-validation'],
    requiredCapabilities: ['email-validation', 'password-hashing', 'database-storage']
  }
});

// Example output:
// [
//   {
//     skillId: 'input-validation',
//     relevance: 0.95,
//     reason: 'Handles email validation (required capability)'
//   },
//   {
//     skillId: 'password-hashing',
//     relevance: 0.92,
//     reason: 'Implements bcrypt hashing (required capability)'
//   },
//   {
//     skillId: 'secure-form-handler',
//     relevance: 0.88,
//     reason: 'Composite skill combining multiple required capabilities'
//   }
// ]

// Search skills by tag
const securitySkills = await skillLibrary.searchSkills({
  tags: ['security', 'validation'],
  minSuccessRate: 0.8,
  orderBy: 'usageCount'
});
```

## 📚 NightlyLearner Integration

### Core Concept

**NightlyLearner** runs periodic background jobs to consolidate learning, update models, and optimize skills. Think of it as "sleep" for AI agents - consolidating memories and improving performance.

### Basic Usage

```typescript
import { NightlyLearner } from 'agentdb@alpha/controllers/NightlyLearner';

const nightlyLearner = new NightlyLearner(db, {
  schedule: '0 2 * * *', // Run at 2 AM every day (cron syntax)
  tasks: [
    'consolidate-reflexions',
    'optimize-skills',
    'compress-memories',
    'update-patterns',
    'generate-reports'
  ]
});

// Start background learning
await nightlyLearner.start();

// Learning runs automatically every night:
// 1. Consolidate reflexions into general learnings
// 2. Identify and optimize frequently-used skills
// 3. Compress old memories to save space
// 4. Update success/failure patterns
// 5. Generate performance reports
```

### Learning Tasks

#### 1. Reflexion Consolidation

```typescript
// Automatically run by NightlyLearner
async function consolidateReflexions() {
  // Find reflexions from last 24 hours
  const recentReflexions = await reflexion.getReflexions({
    since: Date.now() - 24 * 60 * 60 * 1000
  });

  // Group by task category
  const byCategory = groupBy(recentReflexions, 'category');

  // Extract common patterns
  for (const [category, reflexions] of Object.entries(byCategory)) {
    const patterns = extractPatterns(reflexions);

    // Create general learning
    await reflexion.createGeneralLearning({
      category: category,
      patterns: patterns,
      confidence: calculateConfidence(reflexions),
      evidence: reflexions.map(r => r.id)
    });
  }
}
```

#### 2. Skill Optimization

```typescript
// Automatically run by NightlyLearner
async function optimizeSkills() {
  // Find frequently-used skills
  const topSkills = await skillLibrary.getTopSkills({
    by: 'usageCount',
    limit: 20,
    period: '7d'
  });

  for (const skill of topSkills) {
    // Analyze performance bottlenecks
    const profile = await skillLibrary.profileSkill(skill.id);

    if (profile.avgExecutionTime > 100) { // >100ms
      // Suggest optimization
      await skillLibrary.suggestOptimization({
        skillId: skill.id,
        bottleneck: profile.bottleneck,
        suggestion: generateOptimizationSuggestion(profile)
      });
    }

    // Check for better alternatives
    const alternatives = await skillLibrary.findAlternatives(skill.id);
    const betterAlternative = alternatives.find(alt =>
      alt.successRate > skill.successRate && alt.avgExecutionTime < skill.avgExecutionTime
    );

    if (betterAlternative) {
      await skillLibrary.recommendMigration({
        from: skill.id,
        to: betterAlternative.id,
        reason: `Better success rate (${betterAlternative.successRate} vs ${skill.successRate}) and faster (${betterAlternative.avgExecutionTime}ms vs ${skill.avgExecutionTime}ms)`
      });
    }
  }
}
```

#### 3. Memory Compression

```typescript
// Automatically run by NightlyLearner
async function compressMemories() {
  // Find old, infrequently accessed memories
  const oldMemories = await db.findMemories({
    lastAccessed: { before: Date.now() - 30 * 24 * 60 * 60 * 1000 }, // >30 days
    accessCount: { lessThan: 5 }
  });

  // Compress using GNN tensor compression
  for (const memory of oldMemories) {
    const compressed = await db.gnnCompress(memory.embedding, {
      compressionRatio: 0.25 // 4x compression
    });

    await db.updateMemory(memory.id, {
      embedding: compressed,
      compressed: true,
      compressionRatio: 4.0
    });
  }

  // Archive very old memories to cold storage
  const veryOldMemories = await db.findMemories({
    lastAccessed: { before: Date.now() - 365 * 24 * 60 * 60 * 1000 } // >1 year
  });

  await db.archiveMemories(veryOldMemories.map(m => m.id), {
    storage: 'cold',
    keepIndex: true // Keep index for search, but move data to slow storage
  });
}
```

#### 4. Pattern Updates

```typescript
// Automatically run by NightlyLearner
async function updatePatterns() {
  // Recalculate success rates
  const allSkills = await skillLibrary.getAllSkills();

  for (const skill of allSkills) {
    const usage = await skillLibrary.getSkillUsage(skill.id, {
      period: '30d'
    });

    const newSuccessRate = usage.successes / usage.total;

    // Update if significantly changed
    if (Math.abs(newSuccessRate - skill.successRate) > 0.1) {
      await skillLibrary.updateSkill(skill.id, {
        successRate: newSuccessRate,
        lastUpdated: Date.now()
      });
    }
  }

  // Update reflexion patterns
  await reflexion.recalculatePatterns({
    period: '30d',
    minConfidence: 0.7
  });
}
```

#### 5. Report Generation

```typescript
// Automatically run by NightlyLearner
async function generateReports() {
  const report = {
    date: new Date().toISOString(),

    reflexions: {
      total: await reflexion.count({ period: '24h' }),
      successes: await reflexion.count({ period: '24h', success: true }),
      failures: await reflexion.count({ period: '24h', success: false }),
      avgReward: await reflexion.avgReward({ period: '24h' })
    },

    skills: {
      total: await skillLibrary.count(),
      newSkills: await skillLibrary.count({ period: '24h', new: true }),
      evolvedSkills: await skillLibrary.count({ period: '24h', evolved: true }),
      topSkills: await skillLibrary.getTopSkills({ limit: 10 })
    },

    learning: {
      improvementRate: calculateImprovementRate(),
      newPatterns: await reflexion.count({ period: '24h', type: 'pattern' }),
      memoryUsage: await db.getMemoryUsage(),
      compressionSavings: await db.getCompressionStats()
    }
  };

  // Store report
  await db.storeReport('nightly-learning', report);

  // Send notification if significant changes
  if (report.learning.improvementRate > 0.2) {
    await notify({
      type: 'learning-progress',
      message: `Significant improvement: ${report.learning.improvementRate * 100}% increase in success rate`,
      report: report
    });
  }
}
```

## 🔄 Integration with Meta-Learning

### Combining with ReasoningBank

```typescript
// ReflexionMemory feeds into ReasoningBank
import { ReasoningBank } from 'agentdb@alpha/controllers/ReasoningBank';

const reasoningBank = new ReasoningBank(db);

// When storing a reflexion, also update ReasoningBank
await reflexion.storeReflexion(reflexionData);

// Convert reflexion to reasoning pattern
await reasoningBank.storePattern({
  sessionId: reflexionData.taskId,
  task: reflexionData.taskDescription,
  input: reflexionData.action,
  output: reflexionData.observation,
  reward: reflexionData.reward,
  success: reflexionData.success,
  critique: reflexionData.reflection
});

// ReasoningBank can retrieve reflexion-based patterns
const patterns = await reasoningBank.searchPatterns(taskDescription, 5);

// Patterns include reflexions and other reasoning traces
```

### Skill-Based Task Decomposition

```typescript
// Use SkillLibrary to decompose tasks
async function decomposeTaskWithSkills(
  task: Task
): Promise<TaskDecomposition> {
  // Find relevant skills
  const skills = await skillLibrary.recommendSkills({
    taskDescription: task.description,
    context: task.context
  });

  // Decompose based on available skills
  const subtasks = skills.map(skill => ({
    description: `Execute skill: ${skill.name}`,
    skillId: skill.skillId,
    estimatedDifficulty: 1.0 - skill.successRate,
    estimatedTime: skill.avgExecutionTime
  }));

  // Check for missing capabilities
  const missingCapabilities = task.requiredCapabilities.filter(cap =>
    !skills.some(skill => skill.capabilities.includes(cap))
  );

  if (missingCapabilities.length > 0) {
    // Need to learn new skills
    subtasks.push({
      description: `Learn skills for: ${missingCapabilities.join(', ')}`,
      type: 'learning',
      estimatedDifficulty: 0.8,
      estimatedTime: 300000 // 5 minutes
    });
  }

  return {
    subtasks,
    totalEstimatedTime: subtasks.reduce((sum, st) => sum + st.estimatedTime, 0),
    complexity: calculateComplexity(subtasks)
  };
}
```

## 📊 Performance Metrics

### Reflexion Effectiveness

```typescript
// Measure improvement from reflexion
const effectiveness = await reflexion.measureEffectiveness({
  taskCategory: 'authentication',
  period: '30d'
});

// Example output:
// {
//   tasksAttempted: 45,
//   avgAttemptsPerTask: 1.3,
//   successRateFirstAttempt: 0.67,
//   successRateWithReflexion: 0.94,
//   improvementRate: 0.27,
//   avgRewardIncrease: 0.31
// }
```

### Skill Library ROI

```typescript
// Calculate return on investment for skill library
const roi = await skillLibrary.calculateROI({
  period: '90d'
});

// Example output:
// {
//   skillsCreated: 47,
//   skillsReused: 234,
//   avgDevelopmentTime: 1800000, // 30 min per skill
//   avgExecutionTime: 50, // 50ms
//   timeSaved: 141000000, // 39 hours saved by reuse
//   roi: 78.3 // 78x return
// }
```

## 🎯 Best Practices

### 1. Always Reflect on Failures

```typescript
// Good: Reflect after every failed attempt
try {
  const result = await agent.executeTask(task);
} catch (error) {
  await reflexion.storeReflexion({
    taskId: task.id,
    action: task.action,
    observation: error.message,
    reflection: analyzeFailure(error, task),
    success: false,
    reward: 0.0
  });

  // Use reflexion to improve next attempt
  const pastFailures = await reflexion.getReflexionsForTask(task.category);
  const improvedStrategy = generateImprovedStrategy(pastFailures);

  // Retry with improved strategy
  const result = await agent.executeTask(task, { strategy: improvedStrategy });
}
```

### 2. Evolve Skills Based on Usage

```typescript
// Track every skill execution
await skillLibrary.recordSkillUsage({
  skillId: skill.id,
  success: result.success,
  executionTimeMs: result.timeMs,
  feedback: generateFeedback(result)
});

// Periodically review and evolve
if (skill.usageCount > 100 && skill.successRate < 0.9) {
  // Needs improvement
  await skillLibrary.flagForEvolution(skill.id, {
    reason: 'Low success rate despite high usage',
    priority: 'high'
  });
}
```

### 3. Leverage NightlyLearner

```typescript
// Let NightlyLearner handle background optimization
await nightlyLearner.configure({
  enabled: true,
  schedule: '0 2 * * *',
  tasks: {
    consolidateReflexions: { enabled: true, priority: 'high' },
    optimizeSkills: { enabled: true, priority: 'high' },
    compressMemories: { enabled: true, priority: 'medium' },
    updatePatterns: { enabled: true, priority: 'medium' },
    generateReports: { enabled: true, priority: 'low' }
  },
  notifications: {
    onSignificantImprovement: true,
    onErrors: true,
    dailySummary: true
  }
});
```

## 📖 Next Steps

- Explore **[Causal Reasoning System](03-causal-reasoning.md)** for explainable AI
- Learn about **[Advanced Retrieval Strategies](04-advanced-retrieval.md)** for better context
- Understand **[Browser & WASM Deployment](05-browser-wasm.md)** for edge computing

---

**Component**: Reflexion & Skill Learning
**Status**: Planning
**Controllers**: ReflexionMemory, SkillLibrary, NightlyLearner
**Version**: 2.0.0-planning
**Last Updated**: 2025-12-02
