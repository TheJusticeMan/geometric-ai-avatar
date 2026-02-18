# Contributing to Geometric AI Avatar

Thank you for your interest in contributing to the Geometric AI Avatar project! This guide will help you get started with development, understand our code conventions, and submit high-quality contributions.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Running Tests](#running-tests)
- [Adding New Features](#adding-new-features)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Issue Templates](#issue-templates)

## Development Environment Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** (LTS recommended)
- **npm** (comes with Node.js)
- **Git** for version control
- A modern code editor (VS Code recommended for TypeScript support)

### Clone and Install

1. **Fork the repository** on GitHub (click the "Fork" button)

2. **Clone your fork** to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/geometric-ai-avatar.git
   cd geometric-ai-avatar
   ```

3. **Add the upstream remote** to stay synchronized:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/geometric-ai-avatar.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   This will start Vite's development server (usually on `http://localhost:5173`). The page will automatically reload when you make changes.

6. **Verify the build works**:
   ```bash
   npm run build
   ```

## Code Style Guidelines

We maintain high code quality standards to ensure consistency and maintainability.

### ESLint Configuration

The project uses ESLint with TypeScript support. Configuration is in `eslint.config.js`:

- **TypeScript parser**: `@typescript-eslint/parser`
- **Key rules**:
  - `@typescript-eslint/no-explicit-any`: Error - Avoid `any` types
  - `@typescript-eslint/explicit-function-return-type`: Warning - Prefer explicit return types
  - `@typescript-eslint/no-unused-vars`: Error - No unused variables (prefix with `_` if intentional)
  - `no-console`: Warning - Only `console.warn` and `console.error` allowed

**Run the linter**:
```bash
npm run lint
```

### TypeScript Strict Mode

The project enforces TypeScript strict mode (`tsconfig.json`):

- `strict: true` - All strict type-checking options enabled
- `noUnusedLocals: true` - Report unused local variables
- `noUnusedParameters: true` - Report unused function parameters
- `noFallthroughCasesInSwitch: true` - Prevent switch statement fallthrough
- `forceConsistentCasingInFileNames: true` - Enforce consistent file naming

### File Organization Conventions

- **Source code**: `src/` directory
  - Core modules: `AnimationEngine.ts`, `AvatarParser.ts`, `PersonalityMapper.ts`, etc.
  - Type definitions: `types.ts`
  - Entry point: `main.ts`

- **Public assets**: `public/` directory
  - Character data: `public/data/characters/` (JSON files)
  - Animation presets: `public/data/animations/` (JSON files)

- **Tests**: `tests/` directory
  - Test files should mirror `src/` structure
  - Use `.test.ts` suffix

- **Documentation**: `docs/` directory
  - Architecture docs, schemas, implementation plans

### Naming Conventions

- **Files**: PascalCase for classes/modules (e.g., `AnimationEngine.ts`)
- **Variables/Functions**: camelCase (e.g., `calculateMoodScore`)
- **Types/Interfaces**: PascalCase (e.g., `MoodState`, `CharacterData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_ANIMATION_DURATION`)

## Running Tests

We use Vitest for testing with jsdom for DOM simulation.

### Run Tests Once

```bash
npm test
```

This runs all tests and exits. Used in CI/CD pipelines.

### Watch Mode (Development)

```bash
npm run test:watch
```

Tests automatically re-run when you save changes. Great for TDD.

### Test Coverage

To generate coverage reports:

```bash
npm test -- --coverage
```

Coverage reports help identify untested code paths.

### Writing Tests

- Place tests in the `tests/` directory
- Mirror the structure of `src/`
- Test file naming: `ComponentName.test.ts`
- Focus on testing public APIs and critical logic
- Mock external dependencies (like LLM calls)

## Adding New Features

### 1. How to Add a New Character Preset

Character presets define avatar appearances and personalities.

**Steps**:

1. **Create a JSON file** in `public/data/characters/`:
   ```json
   {
     "name": "MyCharacter",
     "personality": {
       "traits": ["curious", "analytical"],
       "baseEmotion": "neutral"
     },
     "geometry": {
       "shapes": [
         {
           "type": "circle",
           "cx": 50,
           "cy": 50,
           "r": 30,
           "fill": "#4A90E2"
         }
       ]
     }
   }
   ```

2. **Reference the schema** in [SCHEMAS.md](./SCHEMAS.md) to ensure validity

3. **Add to CharacterGallery.ts**:
   - Import and register your character
   - Add to the available characters list

4. **Test with schema validator**:
   - The `SchemaValidator.ts` will validate your JSON
   - Ensure all required fields are present
   - Test loading in the UI

5. **Test rendering**:
   - Load your character in the dev server
   - Verify geometry renders correctly
   - Test mood transitions

### 2. How to Add a New Mood State

Mood states control avatar emotional expressions and animations.

**Steps**:

1. **Update the `MoodState` type** in `src/types.ts`:
   ```typescript
   export type MoodState = 
     | 'neutral'
     | 'happy'
     | 'sad'
     | 'excited'
     | 'yourNewMood';  // Add here
   ```

2. **Add mapping in `PersonalityMapper.ts`**:
   - Define how traits influence this mood
   - Add emotion calculation logic
   - Map mood to visual parameters (colors, transforms)

3. **Create an animation preset** in `public/data/animations/`:
   ```json
   {
     "name": "yourNewMood",
     "targets": ".avatar-shape",
     "keyframes": [
       { "scale": 1.0 },
       { "scale": 1.1 }
     ],
     "duration": 800,
     "easing": "easeInOutQuad"
   }
   ```

4. **Update UI controls** in `main.ts` or relevant components:
   - Add button/control for the new mood
   - Wire up event handlers

5. **Test thoroughly**:
   - Verify mood transitions are smooth
   - Check that animations play correctly
   - Ensure state persists if needed

### 3. How to Add a New Animation Preset

Animation presets define reusable animation behaviors.

**Steps**:

1. **Add to `AnimationEngine.ts` presets**:
   ```typescript
   private presets = {
     // ... existing presets
     yourAnimation: {
       duration: 1000,
       easing: 'easeInOutCubic',
       loop: false,
       keyframes: [
         { scale: 1, rotate: 0 },
         { scale: 1.2, rotate: 360 }
       ]
     }
   };
   ```

2. **Define animation parameters**:
   - **duration**: Animation length in milliseconds
   - **easing**: Timing function (`linear`, `easeInOut`, `spring`, etc.)
   - **loop**: Boolean or loop count
   - **keyframes**: Array of property states

3. **Test with existing characters**:
   - Apply to multiple character types
   - Verify performance (animations should be 60fps)
   - Test on different screen sizes

4. **Document the preset**:
   - Add description in code comments
   - Update relevant documentation

## Pull Request Guidelines

### Branch Naming

Use descriptive branch names following this pattern:

- `feature/description` - New features (e.g., `feature/add-angry-mood`)
- `fix/description` - Bug fixes (e.g., `fix/animation-timing-issue`)
- `docs/description` - Documentation updates (e.g., `docs/update-contributing`)
- `refactor/description` - Code refactoring (e.g., `refactor/simplify-parser`)
- `test/description` - Test additions/updates (e.g., `test/add-animation-tests`)

### Commit Message Format

Follow the Conventional Commits specification:

```
<type>(<scope>): <short description>

<optional longer description>

<optional footer>
```

**Examples**:
- `feat(animations): add bounce animation preset`
- `fix(parser): correct SVG attribute parsing`
- `docs(contributing): add animation preset guide`
- `test(validator): add schema validation tests`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### PR Description Template

When opening a PR, include:

```markdown
## Description
Brief summary of what this PR does and why.

## Changes Made
- Bullet point list of specific changes
- Be specific about modified files/modules

## Testing Done
- [ ] Ran `npm run lint` (no errors)
- [ ] Ran `npm run build` (successful)
- [ ] Ran `npm test` (all tests pass)
- [ ] Tested manually in browser
- [ ] Added new tests for new features

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #123
Relates to #456
```

### Required Checks

Before your PR can be merged, it must pass:

1. **Linting**: `npm run lint` must pass with no errors
2. **Build**: `npm run build` must complete successfully
3. **Tests**: `npm test` must pass all tests
4. **CI Pipeline**: GitHub Actions workflow must pass (see `.github/workflows/ci.yml`)

The CI pipeline runs on:
- Every push to `main`
- Every pull request targeting `main`

CI Steps:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Run linter
5. Run build
6. Run tests

## Issue Templates

### Bug Report Format

When reporting bugs, include:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14]
- Node version: [e.g., 20.10.0]

**Additional context**
Any other relevant information.
```

### Feature Request Format

```markdown
**Is your feature request related to a problem?**
A clear description of the problem. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Mockups, examples, or references to similar features.
```

### Documentation Improvement

```markdown
**What documentation needs improvement?**
Specify the file or section.

**What is unclear or missing?**
Describe the problem with current docs.

**Suggested improvement**
How would you improve it? (optional)
```

---

## Questions?

If you have questions about contributing:

1. Check existing documentation in `docs/`
2. Search existing issues and pull requests
3. Open a new issue with your question

Thank you for contributing! 🎨✨
