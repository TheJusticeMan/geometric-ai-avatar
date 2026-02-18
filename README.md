# The Architecture of Agency: JSON-Driven SVG Avatars

> "I think, therefore I render."

This repository contains the framework for a self-reflective, embodied AI agent. It eschews heavy raster graphics for a minimalist, mathematical approach to identity: **Polygons, Circles, and JSON.**

## Core Philosophies

- **Geometric Purity**: Only circles and polygons. Complexity is an emergent property of morphing and layering, not high-resolution textures.
- **LLM Sovereignty**: The agent is the author of its own form. It generates the JSON that defines its structure, color, and motion.
- **The Digital Mirror**: A feedback loop that allows the model to "see" its current state through textual descriptions of the DOM or vision-based feedback.

## Tech Stack

- **Language**: TypeScript
- **Rendering**: HTML5 SVG (TypeScript Parser)
- **Animation**: Anime.js (Tweening JSON states)
- **Validation**: Ajv (JSON Schema validation)
- **Build Tool**: Vite
- **Code Quality**: ESLint with TypeScript support
- **Testing**: Vitest with jsdom for unit testing
- **CI/CD**: GitHub Actions

## Quick Start

1. `npm install`
2. `npm run dev`
3. Open the browser preview (automatically opens at http://localhost:3000)

## Development Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check code quality
- `npm test` - Run the test suite with Vitest
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
geometric-ai-avatar/
├── src/
│   ├── types.ts              # TypeScript type definitions
│   ├── SchemaValidator.ts    # JSON schema validation with Ajv
│   ├── AvatarParser.ts       # JSON to SVG rendering engine
│   ├── AnimationEngine.ts    # Anime.js animation integration
│   ├── StateManager.ts       # Reactive state management
│   ├── PersonalityMapper.ts  # Mood to geometry mapping
│   ├── Mirror.ts             # Self-reflection text generation
│   ├── PersistenceManager.ts # localStorage save/load (Phase 3)
│   ├── LLMBridge.ts          # LLM prompt generation (Phase 3)
│   ├── PhysicsEngine.ts      # Drag-and-drop physics (Phase 4)
│   ├── CharacterGallery.ts   # Multi-agent presets (Phase 4)
│   └── main.ts               # Application entry point
├── public/
│   └── data/
│       ├── characters/
│       │   ├── default.json  # Default avatar character
│       │   ├── scholar.json  # Academic avatar preset
│       │   ├── guardian.json # Warrior avatar preset
│       │   └── trickster.json# Playful avatar preset
│       └── animations/
│           └── idle.json     # Default idle animations
├── tests/
│   ├── SchemaValidator.test.ts    # Validation tests
│   ├── PersonalityMapper.test.ts  # Mood mapping tests
│   ├── PersistenceManager.test.ts # Storage tests
│   ├── LLMBridge.test.ts          # LLM integration tests
│   ├── Mirror.test.ts             # Self-reflection tests
│   ├── PhysicsEngine.test.ts      # Physics tests
│   └── CharacterGallery.test.ts   # Multi-agent tests
├── index.html                # Browser UI
├── package.json              # Dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── eslint.config.js          # ESLint configuration (flat config)
```

## Phase 3: The Reflective Loop (Self-Modification)

Phase 3 introduces the self-reflective loop that allows the LLM to perceive, update, and evolve its avatar through a tight feedback cycle.

### Features

#### 1. Live JSON Editor
- **Direct Character Editing**: Edit the character JSON directly in the browser
- **Real-time Validation**: Schema validation with error messages
- **Apply Changes**: Instantly apply JSON modifications to the avatar
- **Reset**: Restore to the default character with one click

#### 2. localStorage Persistence
- **Session Auto-Save**: Character and mood state automatically persists to browser storage
- **Session Restoration**: Automatically loads saved sessions on page reload
- **Manual Save**: Explicitly save current state with "Save Session" button
- **Clear Saved**: Reset to default by clearing saved session data
- **Session Indicator**: Visual feedback showing whether you're using a saved or default session

#### 3. LLM Integration Bridge
- **System Prompt Generation**: Automatically generates comprehensive prompts for LLMs
- **Copy to Clipboard**: One-click copy of full prompt including current avatar state
- **Response Parsing**: Extracts and validates JSON from LLM responses (supports markdown code fences)
- **Apply LLM Changes**: Parse and apply character modifications from ChatGPT, Claude, etc.
- **Error Handling**: Clear feedback for invalid responses or parsing failures

#### 4. Character Import/Export
- **Export**: Download current character as timestamped JSON file
- **Import**: Upload and validate custom character files
- **Schema Validation**: Automatic validation on import with detailed error messages

#### 5. Enhanced Mirror
- **Human-Readable Output**: Detailed textual description of avatar state
- **LLM-Optimized Context**: Compact, structured format for LLM prompts
- **Semantic Interpretation**: High-level description of avatar appearance and mood

### Using the Reflective Loop

1. **Modify via JSON Editor**:
   - Edit the JSON directly in the "JSON Editor" section
   - Click "Apply JSON" to render changes
   - Invalid JSON shows validation errors

2. **Modify via LLM**:
   - Click "📋 Copy LLM Prompt" to copy the system prompt
   - Paste into ChatGPT/Claude with your modification request (e.g., "Make the eyes bigger")
   - Copy the LLM's response
   - Paste into "Paste LLM response here..." textarea
   - Click "Apply LLM Response"

3. **Save Your Work**:
   - Changes auto-save on every modification
   - Click "Save Session" to explicitly save
   - Session persists across browser reloads
   - Click "Clear Saved" to reset to default

4. **Export/Import**:
   - Click "💾 Export Character" to download as JSON
   - Click "📂 Import Character" to upload a saved file
   - Share character files with others

### Example LLM Interaction

```
User: Make the avatar's eyes much larger and change the head to blue

LLM Response:
Here's the modified character with larger eyes and a blue head:

```json
{
  "id": "default-avatar",
  "version": "1.0",
  "elements": [
    {
      "type": "circle",
      "id": "head",
      "z-index": 2,
      "coordinates": { "cx": 200, "cy": 100, "r": 30 },
      "style": { "fill": "#3498DB", "stroke": "#000000", "opacity": 1 }
    },
    {
      "type": "circle",
      "id": "eye-left",
      "z-index": 3,
      "coordinates": { "cx": 190, "cy": 95, "r": 10 },
      "style": { "fill": "#1ABC9C", "stroke": "#000000", "opacity": 1 }
    },
    ...
  ]
}
```

I've increased the eye radius from 5 to 10 and changed the head fill color from #E0E0E0 to #3498DB (blue).
```

Simply paste this entire response into the application, and it will extract and apply the JSON automatically.

## Defining Custom Characters

Create a JSON file following the Character Schema (see SCHEMAS.md):

```json
{
  "id": "my-avatar",
  "version": "1.0",
  "elements": [
    {
      "type": "circle",
      "id": "head",
      "z-index": 1,
      "coordinates": { "cx": 200, "cy": 100, "r": 30 },
      "style": { "fill": "#E0E0E0", "stroke": "#000000", "opacity": 1 }
    }
  ]
}
```

Place your character JSON in `data/characters/` and load it through the application.

## Defining Custom Animations

Create a JSON file following the Animation Schema (see SCHEMAS.md):

```json
{
  "targetId": "element-id",
  "property": "radius",
  "timeline": [
    { "offset": "0%", "value": 10 },
    { "offset": "100%", "value": 20 }
  ],
  "easing": "easeInOutSine",
  "loop": true
}
```

Place your animation JSON in `public/data/animations/` and integrate it through the AnimationEngine.

## Phase 4: Advanced Interaction (Presence)

Phase 4 introduces interactive physics and multi-agent character support, bringing the avatar to life with tangible presence.

### Features

#### 1. Physics-Lite Drag & Drop
- **Interactive Elements**: All SVG elements (head, torso, arms, eyes) are draggable
- **Spring-Back Animation**: Elements snap back to their original position with elastic easing
- **Touch Support**: Works on both desktop (mouse) and mobile (touch) devices
- **SVG Coordinate Mapping**: Precise coordinate conversion for accurate dragging
- **Visual Feedback**: Cursor changes to indicate draggable state
- **Toggle Control**: Enable/disable drag mode with the "🖐️ Toggle Drag" button

#### 2. Multi-Agent Character Presets
- **Character Gallery**: 4 distinct avatar personalities
  - **Default**: The standard geometric avatar
  - **Scholar**: Academic with hexagonal cap and focused eyes
  - **Guardian**: Broad, powerful protector with strong presence
  - **Trickster**: Asymmetric, playful spirit with vibrant colors
- **One-Click Switching**: Select any preset from the Character Presets panel
- **Persistent State**: Mood modifiers apply to all character presets
- **Seamless Transitions**: Instant character swapping with state preservation

### Using Phase 4 Features

#### Interactive Physics
1. **Enable Drag Mode**: The drag mode is enabled by default
2. **Drag Elements**: Click and drag any part of the avatar (head, eyes, torso, arms)
3. **Watch Spring-Back**: Release to see the element bounce back elastically
4. **Toggle**: Click "🖐️ Toggle Drag" to enable/disable interaction

#### Character Presets
1. **Select Preset**: Click any character button in the "Character Presets" section
2. **Instant Switch**: The avatar immediately transforms to the selected preset
3. **Maintain Mood**: Current mood modifiers persist across character changes
4. **Explore Personalities**: Try different presets to see unique geometric designs

### Testing

The project includes a comprehensive test suite with **52 tests** covering:
- Schema validation (character and animation JSON)
- Personality mapping (mood states and geometric modifiers)
- Persistence (localStorage save/load)
- LLM integration (prompt generation and response parsing)
- Mirror self-reflection (state description)
- Physics engine (drag-and-drop mechanics)
- Character gallery (preset management)

Run tests with:
```bash
npm test           # Run all tests once
npm run test:watch # Run tests in watch mode
```

### Continuous Integration

The repository includes GitHub Actions CI workflow that automatically:
- Runs ESLint for code quality
- Builds the TypeScript project
- Executes the full test suite
- Runs on every push and pull request to main branch

## Creating Custom Character Presets

Add new character presets to `public/data/characters/`:

```json
{
  "id": "my-custom-avatar",
  "version": "1.0",
  "elements": [
    {
      "type": "circle",
      "id": "head",
      "z-index": 2,
      "coordinates": { "cx": 200, "cy": 100, "r": 35 },
      "style": { "fill": "#9B59B6", "stroke": "#000000", "opacity": 1 }
    },
    ...
  ]
}
```

Then add the preset to `CharacterGallery.ts`:
```typescript
{ 
  id: 'my-custom-avatar', 
  name: 'My Avatar', 
  description: 'A custom personality', 
  path: '/data/characters/my-custom.json' 
}
```
