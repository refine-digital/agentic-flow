# London School TDD for Agentic-Flow v2.0.0-alpha

## Overview

This document describes the comprehensive Test-Driven Development infrastructure using **London School (Mockist) TDD** methodology for Agentic-Flow v2 with AgentDB, RuVector integration, and distributed swarm coordination.

### Coverage Goals
- **Global Coverage**: 95%+ (branches, functions, lines, statements)
- **Critical Modules**: 98%+ (controllers, core services)
- **Mock-Based Testing**: Isolation and behavior verification
- **Swarm Coordination**: Multi-agent interaction testing

## Table of Contents

1. [London School Principles](#london-school-principles)
2. [Test Structure](#test-structure)
3. [Mock Factories](#mock-factories)
4. [Writing Tests](#writing-tests)
5. [Running Tests](#running-tests)
6. [Coverage Reports](#coverage-reports)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)

## London School Principles

### Core Philosophy

The London School (mockist) approach emphasizes:

1. **Mock All Dependencies**: Isolate the unit under test completely
2. **Behavior Verification**: Focus on HOW objects collaborate, not WHAT they contain
3. **Outside-In Development**: Start with user behavior, work down to implementation
4. **Contract-First**: Define interfaces through mock expectations
5. **Test Isolation**: Each test is completely independent

### Differences from Classical (Detroit) School

| Aspect | London School | Classical School |
|--------|--------------|------------------|
| **Dependencies** | Mock everything | Use real objects when possible |
| **Focus** | Interactions between objects | State of object under test |
| **Test Doubles** | Mocks (verify calls) | Stubs (return values) |
| **Granularity** | Very fine-grained | Coarser units |
| **Refactoring** | Tests may break | Tests more stable |

### When to Use London School

✅ **Good for:**
- Complex distributed systems (like Agentic-Flow)
- Testing object collaborations
- Defining interfaces before implementation
- Systems with many dependencies
- Parallel development teams

⚠️ **Consider Classical for:**
- Pure functions without dependencies
- Simple data transformations
- Mathematical algorithms

## Test Structure

```
tests/
├── unit/                    # London School unit tests with full mocking
├── integration/            # Integration tests with partial mocking
├── e2e/                    # End-to-end tests with minimal mocking
├── performance/            # Performance and benchmark tests
├── backwards/              # v1.x compatibility tests
├── mocks/                  # Mock factories (London School core)
├── templates/              # Test templates for consistency
├── fixtures/               # Test data and fixtures
├── helpers/                # Test utilities
├── jest.config.ts          # Jest configuration
├── jest.setup.ts           # Jest setup and custom matchers
└── setup.ts                # Global test setup
```

## Mock Factories

All mock factories in `/tests/mocks/` follow London School principles. See full documentation in `/tests/README.md`.

## Running Tests

```bash
# Run all tests with coverage
npm test -- --coverage

# Run specific test suite
npm test -- --testPathPattern=unit

# View coverage report
open coverage/lcov-report/index.html
```

## Files Created

### Configuration
- `/tests/jest.config.ts` - Jest configuration with 95% coverage threshold
- `/tests/jest.setup.ts` - Custom matchers and test setup
- `/tests/setup.ts` - Global test environment setup

### Mock Factories
- `/tests/mocks/MockAgentDB.ts` - AgentDB mock factory
- `/tests/mocks/MockRuVectorCore.ts` - RuVector WASM mock
- `/tests/mocks/MockAttentionService.ts` - Attention mechanism mock
- `/tests/mocks/MockGNNLayer.ts` - Graph Neural Network mock
- `/tests/mocks/MockReasoningBank.ts` - ReasoningBank memory mock
- `/tests/mocks/MockReflexionMemory.ts` - Reflexion episodic memory mock
- `/tests/mocks/MockSkillLibrary.ts` - Skill library mock
- `/tests/mocks/MockCausalGraph.ts` - Causal memory graph mock
- `/tests/mocks/MockSemanticRouter.ts` - Semantic routing mock
- `/tests/mocks/MockFactory.ts` - Universal mock factory utilities
- `/tests/mocks/SwarmMockCoordinator.ts` - Swarm coordination mocks
- `/tests/mocks/index.ts` - Mock factory exports

### Test Templates
- `/tests/templates/unit-test.template.ts` - Unit test template
- `/tests/templates/integration-test.template.ts` - Integration test template
- `/tests/templates/e2e-test.template.ts` - E2E test template

### Example Tests
- `/tests/unit/example-service.test.ts` - Complete London School example

## Key Features

### Custom Jest Matchers

```typescript
// Verify call order
expect(mockA).toHaveBeenCalledBefore(mockB);

// Verify contract satisfaction
expect(mockService).toSatisfyContract(expectedContract);
```

### Swarm Mock Coordination

```typescript
import { createSwarmMock, MockCollaborationPattern } from '@mocks/SwarmMockCoordinator';

// Create coordinated mocks for multi-agent testing
const mockAgent = createSwarmMock('agent-1', createMockAgentDB);
```

### Preset Configurations

```typescript
import { MockAgentDBPresets } from '@mocks/MockAgentDB';

const emptyDB = MockAgentDBPresets.empty();
const errorDB = MockAgentDBPresets.error();
const withData = MockAgentDBPresets.withData([...]);
```

## Next Steps

1. **Add CI/CD Workflow**: Create `.github/workflows/test.yml`
2. **Write Tests**: Use templates to create comprehensive test suite
3. **Achieve 95% Coverage**: Focus on critical paths first
4. **Document Patterns**: Add project-specific patterns as they emerge

## Resources

- Full documentation: `/tests/README.md`
- Test templates: `/tests/templates/`
- Example tests: `/tests/unit/example-service.test.ts`
- Mock factories: `/tests/mocks/`

---

**Testing Philosophy**: London School (Mockist) TDD
**Framework**: Jest with TypeScript
**Target Coverage**: 95%+ globally, 98%+ for critical modules
