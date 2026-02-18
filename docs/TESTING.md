# Testing Guide

## Table of Contents
- [Test Architecture Overview](#test-architecture-overview)
- [How to Run Tests](#how-to-run-tests)
- [Test File Mapping](#test-file-mapping)
- [How to Write New Tests](#how-to-write-new-tests)
- [Mocking Patterns Used](#mocking-patterns-used)
- [CI Pipeline Description](#ci-pipeline-description)

---

## Test Architecture Overview

The geometric-ai-avatar project uses a modern, lightweight testing stack designed for TypeScript and browser environments.

### Testing Framework: Vitest

**Vitest** is our test runner of choice. Key features:
- Fast, Vite-native test execution
- Out-of-the-box TypeScript support
- Jest-compatible API (describe, it, expect)
- Watch mode for development

Configuration is defined in `vitest.config.ts`:
```typescript
{
  test: {
    environment: 'jsdom',
    globals: true
  }
}
```

### Test Environment: jsdom

**jsdom** provides a browser-like environment for Node.js, allowing us to:
- Create and manipulate DOM elements (SVG, HTML)
- Test browser APIs like `localStorage`
- Simulate user interactions
- Render SVG graphics in tests

This is essential for our SVG-based avatar system.

### Unit Testing Approach

Our tests follow these principles:
- **Isolation**: Each test is independent and can run in any order
- **Determinism**: Tests produce consistent results
- **Fast execution**: Unit tests run quickly without external dependencies
- **Clear assertions**: Each test validates specific behavior

We test modules in isolation by:
- Mocking browser APIs (localStorage, fetch)
- Creating minimal test fixtures
- Avoiding integration with actual LLM services

---

## How to Run Tests

### Single Run (CI Mode)
```bash
npm test
```
Executes all tests once and exits. This is the command used in CI pipelines.

**Output interpretation:**
- ✓ Green checkmarks = passing tests
- ✗ Red crosses = failing tests
- Summary includes: test count, pass/fail stats, duration
- Exit code 0 = all tests passed, non-zero = failures

### Watch Mode (Development)
```bash
npm run test:watch
```
Starts Vitest in watch mode. Features:
- Automatically re-runs tests when files change
- Interactive mode with filtering options
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `q` to quit

**Best for:**
- Active development
- TDD (Test-Driven Development)
- Debugging failing tests

### Run Specific Test Files
```bash
npx vitest run tests/SchemaValidator.test.ts
```

### Coverage Reports
```bash
npx vitest run --coverage
```
(Note: Coverage tools must be configured separately)

---

## Test File Mapping

Each source module has a corresponding test file in the `tests/` directory:

| Test File | Source Module | Purpose |
|-----------|---------------|---------|
| `tests/SchemaValidator.test.ts` | `src/SchemaValidator.ts` | Validates JSON schemas for characters and animations using Ajv |
| `tests/PersonalityMapper.test.ts` | `src/PersonalityMapper.ts` | Maps mood states to geometric modifiers and animation behaviors |
| `tests/PersistenceManager.test.ts` | `src/PersistenceManager.ts` | Manages localStorage persistence for character sessions |
| `tests/LLMBridge.test.ts` | `src/LLMBridge.ts` | Parses LLM responses and generates prompts |
| `tests/Mirror.test.ts` | `src/Mirror.ts` | Generates self-reflective descriptions of avatar state |
| `tests/PhysicsEngine.test.ts` | `src/PhysicsEngine.ts` | Handles drag-and-drop interactions with SVG elements |
| `tests/CharacterGallery.test.ts` | `src/CharacterGallery.ts` | Manages preset character gallery and loading |

### Test Coverage Summary

**SchemaValidator** (147 lines)
- Character schema validation (required fields, types, ranges)
- Animation schema validation
- Polygon element validation
- Error message generation

**PersonalityMapper** (83 lines)
- Geometric modifiers for all 5 mood states
- Animation behavior descriptions
- Animation parameter mapping (duration, easing, loop, direction)

**PersistenceManager** (101 lines)
- Session save/load with timestamp
- Character and mood persistence
- Clear saved data functionality
- Null handling for missing data

**LLMBridge** (107 lines)
- JSON code fence extraction from markdown
- Schema validation of parsed responses
- System and user prompt generation
- Error handling for malformed responses

**Mirror** (117 lines)
- State description with no character loaded
- Geometric configuration descriptions
- Mood state reporting
- Semantic interpretation
- Polygon and circle element descriptions

**PhysicsEngine** (137 lines)
- Enable/disable drag listeners
- SVG coordinate conversion
- Cursor style management
- Edge case handling (missing avatar-root, double enable/disable)

**CharacterGallery** (61 lines)
- Preset count and uniqueness validation
- Path format validation
- Preset metadata (name, description)
- Non-existent preset handling

---

## How to Write New Tests

### Test File Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { YourModule } from '../src/YourModule';
import type { YourType } from '../src/types';

describe('YourModule', () => {
  let instance: YourModule;

  beforeEach(() => {
    // Setup runs before each test
    instance = new YourModule();
  });

  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test-input';
      
      // Act
      const result = instance.methodName(input);
      
      // Assert
      expect(result).toBe('expected-output');
    });
    
    it('should handle edge case', () => {
      // Test error conditions, null values, etc.
      expect(() => instance.methodName(null)).toThrow();
    });
  });
});
```

### Using describe/it/expect

**`describe(name, fn)`**: Groups related tests
- Nest `describe` blocks for better organization
- Use descriptive names: describe module, then methods

**`it(name, fn)`**: Defines a single test case
- Name should complete the sentence "it should..."
- Keep tests focused on one behavior

**`expect(value)`**: Assertion API
- `.toBe(value)` - strict equality (===)
- `.toEqual(value)` - deep equality (objects/arrays)
- `.toBeNull()`, `.toBeDefined()`, `.toBeTruthy()`
- `.toHaveLength(n)` - array/string length
- `.toContain(item)` - array/string contains
- `.toThrow()` - function throws error
- `.toBeGreaterThan(n)`, `.toBeLessThan(n)`

### Setup and Teardown

```typescript
beforeEach(() => {
  // Runs before each test in this describe block
  localStorage.clear();
  instance = new YourModule();
});

afterEach(() => {
  // Runs after each test (cleanup)
  // Usually not needed with proper beforeEach
});

beforeAll(() => {
  // Runs once before all tests
});

afterAll(() => {
  // Runs once after all tests
});
```

### Assertion Patterns

**Valid input testing:**
```typescript
it('should validate correct schema', () => {
  const validData = { /* ... */ };
  const result = validator.validate(validData);
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});
```

**Invalid input testing:**
```typescript
it('should reject invalid schema', () => {
  const invalidData = { /* ... */ };
  const result = validator.validate(invalidData);
  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
});
```

**Type checking:**
```typescript
it('should return correct types', () => {
  const result = module.getData();
  expect(typeof result.name).toBe('string');
  expect(Array.isArray(result.items)).toBe(true);
});
```

---

## Mocking Patterns Used

### localStorage Mock (beforeEach setup)

**Pattern:** Clear localStorage before each test to ensure isolation.

```typescript
beforeEach(() => {
  localStorage.clear();
  manager = new PersistenceManager('test-avatar');
});
```

**Why:** Tests that write to localStorage could affect subsequent tests. Clearing ensures each test starts with a clean slate.

**Example from PersistenceManager.test.ts:**
```typescript
it('should save and load a complete session', () => {
  manager.saveSession(character, mood);
  const session = manager.loadSession();
  
  expect(session).not.toBeNull();
  expect(session?.character).toEqual(character);
});
```

### SVG DOM Mock (jsdom)

**Pattern:** Create SVG elements using `document.createElementNS()`.

```typescript
beforeEach(() => {
  // Create a mock SVG element using jsdom
  mockSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  mockSVG.setAttribute('viewBox', '0 0 400 400');
  
  // Add child elements if needed
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('id', 'avatar-root');
  mockSVG.appendChild(group);
});
```

**Why:** Our avatar system manipulates SVG DOM. jsdom provides a working SVG implementation without a real browser.

**Example from PhysicsEngine.test.ts:**
```typescript
beforeEach(() => {
  svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgContainer.setAttribute('id', 'avatar-svg');
  
  const avatarRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  avatarRoot.setAttribute('id', 'avatar-root');
  svgContainer.appendChild(avatarRoot);
  
  document.body.appendChild(svgContainer);
});
```

### Fetch API Mock (for CharacterGallery)

**Pattern:** CharacterGallery uses `fetch()` to load preset files, but tests don't mock it yet.

**Current approach:** Tests only validate preset metadata (IDs, paths, names), not actual loading.

**Example from CharacterGallery.test.ts:**
```typescript
it('should return null for non-existent preset', async () => {
  const gallery = new CharacterGallery();
  const result = await gallery.loadPreset('non-existent');
  
  expect(result).toBeNull();
});
```

**Future enhancement:** Add fetch mocking with `vi.fn()`:
```typescript
import { vi } from 'vitest';

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 'test', version: '1.0', elements: [] })
  })
) as any;
```

---

## CI Pipeline Description

### GitHub Actions Workflow

Location: `.github/workflows/ci.yml`

The CI pipeline runs automatically on:
- **Push to `main` branch** - Validates all commits to the main branch
- **Pull requests to `main`** - Validates changes before merging

### Workflow Configuration

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### Build Environment

- **Runner:** `ubuntu-latest` (Linux)
- **Node.js version:** 20 (LTS)
- **Package manager:** npm with caching enabled
- **Installation:** `npm ci` (clean install from lockfile)

### Pipeline Sequence

The CI pipeline runs four sequential steps:

```
1. npm run lint
   ↓
2. npm run build
   ↓
3. npm test
```

**Step 1: Lint** (`npm run lint`)
- Runs ESLint on all TypeScript files
- Checks code style and quality
- **Fails if:** Linting errors are found

**Step 2: Build** (`npm run build`)
- Runs TypeScript compiler (`tsc`)
- Runs Vite build to bundle the application
- **Fails if:** TypeScript errors or build errors occur

**Step 3: Test** (`npm test`)
- Runs all unit tests with Vitest
- **Fails if:** Any test fails or throws an error

### Exit Strategy

- If **any step fails**, the pipeline stops immediately
- All steps must pass for the pipeline to succeed
- Pull requests can only merge if CI passes (if required)

### Permissions

```yaml
permissions:
  contents: read
```

The workflow has read-only access to repository contents for security.

---

## Tips for Testing

### Do's ✅
- Write tests before fixing bugs (reproduce the bug first)
- Test edge cases: null, undefined, empty arrays, invalid types
- Use descriptive test names that explain the expected behavior
- Keep tests simple and focused on one assertion
- Run tests frequently during development (use watch mode)

### Don'ts ❌
- Don't test implementation details (test behavior, not internals)
- Don't write tests that depend on other tests (isolation)
- Don't mock everything (only mock external dependencies)
- Don't skip failing tests (fix them or remove them)
- Don't commit commented-out tests

### Debugging Failed Tests

1. **Read the error message carefully** - Vitest provides detailed stack traces
2. **Run the specific test file** - `npx vitest run path/to/test.ts`
3. **Add console.log** - Log values to understand what's happening
4. **Use `.only`** - Run just one test: `it.only('test name', () => {})`
5. **Check beforeEach** - Ensure setup is correct for the failing test

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [jsdom GitHub](https://github.com/jsdom/jsdom)
- [Vitest API Reference](https://vitest.dev/api/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Last Updated:** 2024
**Total Test Files:** 7
**Total Test Count:** ~50+ individual tests
