# TDD Quick Start Guide - London School

## 🚀 Getting Started in 5 Minutes

### 1. Run Example Tests

```bash
# Run the example test to see London School in action
npm test -- tests/unit/example-service.test.ts

# Run with coverage
npm test -- tests/unit/example-service.test.ts --coverage
```

### 2. Create Your First Test

```bash
# Copy the unit test template
cp tests/templates/unit-test.template.ts tests/unit/my-service.test.ts

# Edit and customize for your service
# The template includes all London School patterns
```

### 3. Use Mock Factories

```typescript
import { createMockAgentDB } from '@mocks/MockAgentDB';
import { createMockAttentionService } from '@mocks/MockAttentionService';

describe('MyService', () => {
  let mockDB: ReturnType<typeof createMockAgentDB>;
  let service: MyService;

  beforeEach(() => {
    mockDB = createMockAgentDB();
    service = new MyService(mockDB);
  });

  it('should coordinate with database', async () => {
    // Arrange
    mockDB.query.mockResolvedValue([{ id: 1 }]);

    // Act
    await service.execute();

    // Assert - London School: verify interactions
    expect(mockDB.query).toHaveBeenCalledWith(expectedSQL);
  });
});
```

### 4. Run All Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific suite
npm test -- --testPathPattern=unit

# Watch mode
npm test -- --watch
```

### 5. Check Coverage

```bash
# Generate coverage report
npm test -- --coverage

# Open HTML report
open coverage/lcov-report/index.html
```

## 📚 Available Mock Factories

```typescript
// Database
import { createMockAgentDB } from '@mocks/MockAgentDB';

// Vector Search
import { createMockRuVectorCore } from '@mocks/MockRuVectorCore';

// Attention
import { createMockAttentionService } from '@mocks/MockAttentionService';

// Neural Networks
import { createMockGNNLayer } from '@mocks/MockGNNLayer';

// Memory Systems
import { createMockReasoningBank } from '@mocks/MockReasoningBank';
import { createMockReflexionMemory } from '@mocks/MockReflexionMemory';
import { createMockSkillLibrary } from '@mocks/MockSkillLibrary';

// Graphs
import { createMockCausalGraph } from '@mocks/MockCausalGraph';
import { createMockSemanticRouter } from '@mocks/MockSemanticRouter';
```

## 🎯 Test Templates

- **Unit Test**: `tests/templates/unit-test.template.ts`
- **Integration Test**: `tests/templates/integration-test.template.ts`
- **E2E Test**: `tests/templates/e2e-test.template.ts`

## 💡 Quick Tips

### London School Principles

1. **Mock Everything** - Isolate the unit completely
2. **Verify Interactions** - Focus on how objects collaborate
3. **Test Behavior** - Not internal state

### Common Patterns

```typescript
// Verify call order
expect(mockA).toHaveBeenCalledBefore(mockB);

// Verify contract
expect(mockService).toSatisfyContract({ method: 'function' });

// Use presets
const emptyDB = MockAgentDBPresets.empty();
const errorDB = MockAgentDBPresets.error();
```

## 📖 Full Documentation

- **Comprehensive Guide**: `/docs/TDD-LONDON-SCHOOL.md`
- **Implementation Summary**: `/docs/TDD-IMPLEMENTATION-SUMMARY.md`
- **Test README**: `/tests/README.md`

## 🎓 Example Test

See `/tests/unit/example-service.test.ts` for a complete example demonstrating:
- Mock factory usage
- Interaction testing
- Call order verification
- Contract verification
- Error handling
- London School patterns

## ✅ Coverage Goals

- Global: **95%+**
- Critical modules: **98%+**

Run `npm test -- --coverage` to check current coverage.

---

**Happy Testing! 🧪**
