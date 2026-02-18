# Geometric AI Avatar - Architecture Documentation

## Table of Contents
- [System Overview](#system-overview)
- [Module Reference](#module-reference)
- [Data Flow](#data-flow)
- [State Management](#state-management)

---

## System Overview

The Geometric AI Avatar system is a modular, event-driven application that renders SVG-based geometric characters with personality-driven animations and LLM integration capabilities.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Main Application                         │
│                      (GeometricAvatarApp)                       │
└────────┬────────────────────────────────────────────────┬───────┘
         │                                                │
         │ Orchestrates All Modules                      │ Event Loop
         │                                                │
    ┌────▼─────────────────────────────────────────────────▼────┐
    │                                                           │
    │  Core State & Rendering Layer                            │
    │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │
    │  │ StateManager│──│ AvatarParser │──│AnimationEngine│   │
    │  │ (Observer)  │  │ (JSON→SVG)   │  │ (Anime.js)    │   │
    │  └─────────────┘  └──────────────┘  └───────────────┘   │
    │                                                           │
    └───────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼──────┐   ┌─────▼──────┐
    │  types  │      │Personality │   │   Schema   │
    │Interface│      │   Mapper   │   │ Validator  │
    │Definitions│    │(Mood→Geo)  │   │   (Ajv)    │
    └─────────┘      └────────────┘   └────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼──────┐   ┌─────▼──────┐
    │  Mirror │      │ LLMBridge  │   │Persistence │
    │(Reflect)│      │ (Prompts)  │   │  Manager   │
    └─────────┘      └────────────┘   │(localStorage)│
                                      └────────────┘
         │                 │                 │
    ┌────▼────┐      ┌─────▼──────┐   ┌─────▼──────┐
    │ Physics │      │ Character  │   │   Browser  │
    │ Engine  │      │  Gallery   │   │  Storage   │
    │(Drag/Drop)│    │ (Presets)  │   │            │
    └─────────┘      └────────────┘   └────────────┘
```

### Module Dependencies

- **Core Layer**: types, StateManager, AvatarParser, AnimationEngine
- **Validation Layer**: SchemaValidator
- **Personality Layer**: PersonalityMapper
- **Reflection Layer**: Mirror
- **Integration Layer**: LLMBridge
- **Persistence Layer**: PersistenceManager
- **Interaction Layer**: PhysicsEngine, CharacterGallery

---

## Module Reference

### 1. types.ts

**Purpose**: Defines all TypeScript interfaces and type aliases for the entire system, providing type safety and data structure contracts.

**Public API** (Type Definitions):

```typescript
interface CircleCoordinates { cx: number; cy: number; r: number }
interface PolygonCoordinates { points: [number, number][] }
interface ElementStyle { fill: string; stroke: string; opacity: number }

type GeometricElement = CircleElement | PolygonElement

interface CharacterSchema {
  id: string
  version: string
  elements: GeometricElement[]
}

interface AnimationSchema {
  targetId: string
  property: 'points' | 'radius' | 'transform' | 'color'
  timeline: TimelineKeyframe[]
  easing: string
  loop: boolean
}

type MoodState = 'neutral' | 'analytical' | 'energetic' | 'pensive' | 'erroneous'

interface AvatarState {
  activeCharacter: CharacterSchema | null
  currentMood: MoodState
}

interface GeometricModifiers {
  eyeRadiusMultiplier?: number
  colorBrightness?: number
  asymmetryFactor?: number
  jitterAmount?: number
}

interface AnimationParams {
  duration: number
  easing: string
  loop: boolean
  direction?: 'normal' | 'reverse' | 'alternate'
}

interface SessionData {
  character: CharacterSchema
  mood: MoodState
  timestamp: number
}
```

**Dependencies**: None (foundational module)

**Example Usage**:
```typescript
import type { CharacterSchema, MoodState } from './types'

const character: CharacterSchema = {
  id: 'avatar-001',
  version: '1.0',
  elements: [...]
}

const mood: MoodState = 'analytical'
```

---

### 2. AvatarParser.ts

**Purpose**: Converts CharacterSchema JSON into live SVG DOM elements and manages the rendering lifecycle.

**Public API**:

```typescript
class AvatarParser {
  constructor(container: SVGSVGElement)
  
  // Render complete character schema to SVG
  render(schema: CharacterSchema): void
  
  // Update a single element by ID
  updateElement(elementId: string, element: GeometricElement): void
  
  // Get reference to rendered SVG element
  getElement(elementId: string): SVGElement | undefined
  
  // Clear all rendered elements
  clear(): void
}
```

**Dependencies**: types (CharacterSchema, GeometricElement)

**Example Usage**:
```typescript
const svgContainer = document.getElementById('avatar-svg') as SVGSVGElement
const parser = new AvatarParser(svgContainer)

// Render character
parser.render(characterSchema)

// Update single element
parser.updateElement('left-eye', {
  type: 'circle',
  id: 'left-eye',
  'z-index': 3,
  coordinates: { cx: 170, cy: 180, r: 8 },
  style: { fill: '#2C3E50', stroke: '#34495E', opacity: 1 }
})

// Get reference to rendered element
const eyeElement = parser.getElement('left-eye')
```

---

### 3. AnimationEngine.ts

**Purpose**: Wrapper around Anime.js providing 7 preset animations and custom animation playback.

**Public API**:

```typescript
class AnimationEngine {
  constructor()
  
  // Play predefined animation preset by name
  playPreset(presetName: string): void
  
  // Play custom animation from schema
  playAnimation(schema: AnimationSchema): void
  
  // Trigger animations based on system events
  triggerAnimation(trigger: AnimationTrigger): void
  
  // Trigger mood-specific animations
  triggerMoodAnimation(mood: MoodState): void
  
  // Stop all active animations
  stopAll(): void
}
```

**Animation Presets**:
1. **blink**: Eye radius scales to 0 and back (3s interval)
2. **float**: Vertical oscillation -5 to +5 pixels (2s, alternate)
3. **breathe**: Torso scale pulse 1.0 to 1.05 (1.5s, alternate)
4. **ponder**: Slow 360° torso rotation (8s, linear)
5. **pulse**: High-frequency arm scale 1.0 to 1.15 (500ms, alternate)
6. **tilt**: Head side-to-side -10 to +10 pixels (3s, alternate)
7. **jitter**: Rapid position resets with random offsets (200ms, linear)

**Dependencies**: types (AnimationSchema, MoodState), animejs

**Example Usage**:
```typescript
const engine = new AnimationEngine()

// Play preset
engine.playPreset('blink')

// Trigger on event
engine.triggerAnimation('onLoad')        // Starts float + breathe
engine.triggerMoodAnimation('analytical') // Starts ponder animation

// Stop all
engine.stopAll()
```

---

### 4. StateManager.ts

**Purpose**: Central state container using observer pattern to manage character and mood state with reactive listeners.

**Public API**:

```typescript
class StateManager {
  constructor()
  
  // Get current state snapshot
  getState(): AvatarState
  
  // Set active character (triggers listeners)
  setCharacter(character: CharacterSchema): void
  
  // Get current character
  getCharacter(): CharacterSchema | null
  
  // Update single element in character (triggers listeners)
  updateElement(elementId: string, element: GeometricElement): void
  
  // Set mood state (triggers listeners)
  setMood(mood: MoodState): void
  
  // Get current mood
  getMood(): MoodState
  
  // Subscribe to state changes (returns unsubscribe function)
  onStateChange(listener: StateChangeListener): () => void
}
```

**Dependencies**: types (AvatarState, CharacterSchema, GeometricElement, MoodState)

**Example Usage**:
```typescript
const state = new StateManager()

// Subscribe to changes
const unsubscribe = state.onStateChange((newState) => {
  console.log('State updated:', newState)
  renderer.render(newState.activeCharacter)
})

// Update state
state.setCharacter(loadedCharacter)
state.setMood('energetic')

// Unsubscribe when done
unsubscribe()
```

---

### 5. PersonalityMapper.ts

**Purpose**: Maps MoodState values to geometric modifiers and animation parameters, creating personality-driven visual transformations.

**Public API**:

```typescript
class PersonalityMapper {
  // Get geometry modifiers for mood
  getGeometricModifiers(mood: MoodState): GeometricModifiers
  
  // Get animation timing parameters for mood
  getAnimationParams(mood: MoodState): AnimationParams
  
  // Get human-readable animation description
  getAnimationBehavior(mood: MoodState): string
}
```

**Mood Mappings**:
- **neutral**: eyeRadius=1.0x, brightness=1.0x
- **analytical**: eyeRadius=0.7x (narrowed), duration=8000ms, linear easing
- **energetic**: eyeRadius=1.3x (wide), brightness=1.2x, duration=500ms
- **pensive**: asymmetry=5px, brightness=0.9x, duration=3000ms
- **erroneous**: jitter=3px, brightness=0.7x, duration=200ms

**Dependencies**: types (MoodState, GeometricModifiers, AnimationParams)

**Example Usage**:
```typescript
const mapper = new PersonalityMapper()

const modifiers = mapper.getGeometricModifiers('analytical')
// { eyeRadiusMultiplier: 0.7, colorBrightness: 1.0 }

const params = mapper.getAnimationParams('energetic')
// { duration: 500, easing: 'easeInOutQuad', loop: true, direction: 'alternate' }

const description = mapper.getAnimationBehavior('pensive')
// "Slow easeInOutSine tilt of the head circle"
```

---

### 6. SchemaValidator.ts

**Purpose**: Ajv-based JSON schema validation for CharacterSchema and AnimationSchema with detailed error reporting.

**Public API**:

```typescript
class SchemaValidator {
  constructor()
  
  // Validate character schema with error details
  validateCharacterSchema(data: unknown): { valid: boolean; errors: string[] }
  
  // Validate animation schema with error details
  validateAnimationSchema(data: unknown): { valid: boolean; errors: string[] }
  
  // Type guard for CharacterSchema
  isValidCharacter(data: unknown): data is CharacterSchema
  
  // Type guard for AnimationSchema
  isValidAnimation(data: unknown): data is AnimationSchema
}
```

**Validation Rules**:
- Character: Required fields (id, version, elements), element types, coordinate formats
- Animation: Required fields (targetId, property, timeline), valid property enums
- Style: Hex color validation, opacity range 0-1
- Coordinates: Numeric validation for circle (cx, cy, r) and polygon points

**Dependencies**: types (CharacterSchema, AnimationSchema), ajv

**Example Usage**:
```typescript
const validator = new SchemaValidator()

// Validate with error details
const result = validator.validateCharacterSchema(jsonData)
if (!result.valid) {
  console.error('Validation errors:', result.errors)
  // ["/elements/0/coordinates must have required property 'cx'"]
}

// Type guard usage
if (validator.isValidCharacter(data)) {
  // TypeScript knows data is CharacterSchema
  console.log(data.elements.length)
}
```

---

### 7. Mirror.ts

**Purpose**: Generates self-reflective descriptions of the avatar's current state for human readability and LLM context.

**Public API**:

```typescript
class Mirror {
  constructor()
  
  // Generate human-readable state description
  describeCurrentState(
    character: CharacterSchema | null,
    mood: MoodState,
    svgContainer: SVGSVGElement
  ): string
  
  // Generate base64 snapshot of SVG
  generateBase64Snapshot(svgContainer: SVGSVGElement): string
  
  // Generate LLM-optimized context string
  generateLLMContext(
    character: CharacterSchema | null,
    mood: MoodState,
    svgContainer: SVGSVGElement
  ): string
}
```

**Dependencies**: types (CharacterSchema, MoodState), PersonalityMapper

**Example Usage**:
```typescript
const mirror = new Mirror()

// Get human-readable description
const description = mirror.describeCurrentState(character, 'analytical', svg)
console.log(description)
// "Avatar State Report (ID: avatar-001, Version: 1.0)
//  === Geometric Configuration ===
//  • head: Circle at position (200, 200) with radius 80
//  ..."

// Get LLM context
const context = mirror.generateLLMContext(character, 'analytical', svg)
// Compact JSON + semantic summary for LLM prompts

// Get base64 snapshot
const snapshot = mirror.generateBase64Snapshot(svg)
// "data:image/svg+xml;base64,PHN2ZyB4bWxucz0..."
```

---

### 8. PersistenceManager.ts

**Purpose**: localStorage-based session management for characters, moods, and full session state.

**Public API**:

```typescript
class PersistenceManager {
  constructor(storageKey: string = 'geometric-avatar')
  
  // Save character to localStorage
  saveCharacter(character: CharacterSchema): void
  
  // Load saved character (returns null if none)
  loadCharacter(): CharacterSchema | null
  
  // Check if saved character exists
  hasSavedCharacter(): boolean
  
  // Save mood state
  saveMood(mood: MoodState): void
  
  // Load saved mood
  loadMood(): MoodState | null
  
  // Save full session (character + mood + timestamp)
  saveSession(character: CharacterSchema, mood: MoodState): void
  
  // Load full session
  loadSession(): SessionData | null
  
  // Clear all saved data
  clearSaved(): void
}
```

**Storage Keys**:
- `geometric-avatar-character`: Character JSON
- `geometric-avatar-mood`: Mood string
- `geometric-avatar-session`: Full session with timestamp

**Dependencies**: types (CharacterSchema, MoodState, SessionData)

**Example Usage**:
```typescript
const persistence = new PersistenceManager()

// Save session
persistence.saveSession(character, 'analytical')

// Load session
const session = persistence.loadSession()
if (session) {
  console.log('Loaded character from', new Date(session.timestamp))
  state.setCharacter(session.character)
  state.setMood(session.mood)
}

// Check for saved data
if (persistence.hasSavedCharacter()) {
  const character = persistence.loadCharacter()
}

// Clear storage
persistence.clearSaved()
```

---

### 9. LLMBridge.ts

**Purpose**: Generate system/user prompts for LLM interactions and parse LLM responses to extract CharacterSchema JSON.

**Public API**:

```typescript
class LLMBridge {
  constructor()
  
  // Generate system prompt with schema instructions
  generateSystemPrompt(
    currentState: string,
    characterSchema: CharacterSchema
  ): string
  
  // Generate user prompt with mirror context
  generateUserPrompt(mirrorOutput: string, userMessage: string): string
  
  // Parse LLM response and extract CharacterSchema JSON
  parseResponse(response: string): {
    character: CharacterSchema | null
    message: string
  }
  
  // Get full prompt as copyable text
  getFullPromptForCopy(
    mirrorOutput: string,
    character: CharacterSchema,
    userMessage?: string
  ): string
}
```

**Features**:
- Markdown code fence extraction (```json ... ```)
- Automatic schema validation via SchemaValidator
- Detailed error messages for invalid responses
- Complete prompt generation for manual LLM use

**Dependencies**: types (CharacterSchema), SchemaValidator

**Example Usage**:
```typescript
const bridge = new LLMBridge()

// Generate prompt for copy
const prompt = bridge.getFullPromptForCopy(
  mirrorContext,
  currentCharacter,
  'Make the eyes larger and more expressive'
)
navigator.clipboard.writeText(prompt)

// Parse LLM response
const llmResponse = `Here's the modified character:
\`\`\`json
{ "id": "avatar-001", "version": "1.0", "elements": [...] }
\`\`\``

const result = bridge.parseResponse(llmResponse)
if (result.character) {
  state.setCharacter(result.character)
  console.log(result.message) // "Character JSON successfully parsed and validated!"
} else {
  console.error(result.message) // Error details
}
```

---

### 10. PhysicsEngine.ts

**Purpose**: SVG drag-and-drop interaction with elastic snap-back animation using Anime.js springs.

**Public API**:

```typescript
class PhysicsEngine {
  constructor(svgContainer: SVGSVGElement)
  
  // Enable drag interactions on avatar elements
  enable(): void
  
  // Disable drag interactions
  disable(): void
  
  // Get enabled state
  get isEnabled(): boolean
}
```

**Features**:
- Mouse and touch event support
- SVG coordinate transformation
- Elastic snap-back with `easeOutElastic(1, .6)`
- Cursor states (grab/grabbing)
- Event cleanup on disable

**Dependencies**: animejs

**Example Usage**:
```typescript
const physics = new PhysicsEngine(svgContainer)

// Enable dragging
physics.enable()

// User drags avatar element → snaps back on release

// Disable dragging
physics.disable()

// Check state
if (physics.isEnabled) {
  console.log('Drag enabled')
}
```

---

### 11. CharacterGallery.ts

**Purpose**: Registry of preset character configurations with async loading from JSON files.

**Public API**:

```typescript
interface CharacterPreset {
  id: string
  name: string
  description: string
  path: string
}

class CharacterGallery {
  // Get all available presets
  getPresets(): CharacterPreset[]
  
  // Load preset character by ID
  async loadPreset(presetId: string): Promise<unknown>
}
```

**Presets**:
1. **default-avatar**: "The standard geometric avatar"
2. **scholar-avatar**: "A focused academic with a hexagonal cap"
3. **guardian-avatar**: "A broad, powerful protector"
4. **trickster-avatar**: "An asymmetric, playful spirit"

**Dependencies**: None (data loader)

**Example Usage**:
```typescript
const gallery = new CharacterGallery()

// Get all presets
const presets = gallery.getPresets()
presets.forEach(p => console.log(`${p.name}: ${p.description}`))

// Load specific preset
const scholarData = await gallery.loadPreset('scholar-avatar')
const validation = validator.validateCharacterSchema(scholarData)
if (validation.valid) {
  state.setCharacter(scholarData as CharacterSchema)
}
```

---

## Data Flow

### App Initialization Flow

```
1. DOM Ready Event
   │
   ├─▶ GeometricAvatarApp.initialize()
   │
   ├─▶ Get SVG container element
   │
   ├─▶ Initialize AvatarParser(svgContainer)
   │
   ├─▶ Initialize PhysicsEngine(svgContainer)
   │   └─▶ physicsEngine.enable()
   │
   ├─▶ Load Saved Session?
   │   ├─ YES ▶ PersistenceManager.loadSession()
   │   │         └─▶ SchemaValidator.validateCharacterSchema()
   │   │              ├─ Valid ▶ StateManager.setCharacter()
   │   │              │          └─▶ StateManager.setMood()
   │   │              └─ Invalid ▶ Load Default
   │   │
   │   └─ NO ▶ Load Default Character
   │            └─▶ fetch('/data/characters/default.json')
   │                 └─▶ SchemaValidator.validateCharacterSchema()
   │                      └─▶ StateManager.setCharacter()
   │
   ├─▶ Setup Event Listeners
   │   ├─ Mood buttons → handleMoodChange()
   │   ├─ Message input → handleMessage()
   │   ├─ JSON editor → handleApplyJSON()
   │   ├─ LLM controls → handleCopyPrompt() / handleApplyLLMResponse()
   │   └─ Character gallery → handleCharacterPresetChange()
   │
   ├─▶ StateManager.onStateChange((state) => {
   │     ├─▶ Mirror.describeCurrentState() → Update UI
   │     ├─▶ Update JSON editor display
   │     ├─▶ PersistenceManager.saveSession()
   │     └─▶ AvatarParser.render(state.activeCharacter)
   │   })
   │
   ├─▶ Load Default Animations
   │   └─▶ fetch('/data/animations/idle.json')
   │        └─▶ AnimationEngine.playAnimation() (for each)
   │
   └─▶ Initial UI Updates
       ├─▶ updateMirror()
       ├─▶ updateJSONEditor()
       └─▶ updateSessionIndicator()
```

---

### Mood Change Flow

```
User clicks mood button (e.g., "Analytical")
   │
   ├─▶ handleMoodChange(mood: 'analytical')
   │
   ├─▶ StateManager.setMood('analytical')
   │   └─▶ Triggers all state change listeners
   │
   ├─▶ AnimationEngine.stopAll()
   │   └─▶ Pause all active Anime.js animations
   │
   ├─▶ applyMoodModifiers('analytical')
   │   ├─▶ PersonalityMapper.getGeometricModifiers('analytical')
   │   │   └─▶ Returns { eyeRadiusMultiplier: 0.7, colorBrightness: 1.0 }
   │   │
   │   ├─▶ Clone originalCharacter
   │   │
   │   ├─▶ Apply modifiers to elements
   │   │   └─▶ element.coordinates.r *= 0.7 (for eyes)
   │   │
   │   └─▶ StateManager.setCharacter(modifiedCharacter)
   │       └─▶ Triggers render via state change listener
   │            └─▶ AvatarParser.render(modifiedCharacter)
   │
   ├─▶ AnimationEngine.triggerMoodAnimation('analytical')
   │   └─▶ playPreset('ponder') // 360° rotation
   │
   ├─▶ AnimationEngine.triggerAnimation('onLoad')
   │   └─▶ Restart idle animations (float + breathe)
   │
   └─▶ Update UI
       └─▶ Highlight active mood button
```

---

### LLM Modification Flow

```
User requests avatar modification via LLM
   │
   ├─▶ Click "Copy LLM Prompt"
   │
   ├─▶ handleCopyPrompt()
   │   ├─▶ Mirror.generateLLMContext(character, mood, svg)
   │   │   └─▶ Returns compact JSON + semantic summary
   │   │
   │   ├─▶ LLMBridge.getFullPromptForCopy(context, character)
   │   │   ├─▶ generateSystemPrompt() // Schema instructions
   │   │   └─▶ generateUserPrompt()   // User request + context
   │   │
   │   └─▶ navigator.clipboard.writeText(fullPrompt)
   │
   ├─▶ User pastes prompt to external LLM (Claude, GPT, etc.)
   │
   ├─▶ LLM returns response with ```json ... ``` code fence
   │
   ├─▶ User pastes response into app textarea
   │
   ├─▶ Click "Apply LLM Response"
   │
   ├─▶ handleApplyLLMResponse()
   │   ├─▶ LLMBridge.parseResponse(llmResponseText)
   │   │   ├─▶ Extract JSON from markdown code fence
   │   │   │   └─▶ Regex: /```json\s*([\s\S]*?)\s*```/
   │   │   │
   │   │   ├─▶ JSON.parse(extractedJSON)
   │   │   │
   │   │   └─▶ SchemaValidator.validateCharacterSchema(parsed)
   │   │       ├─ Valid ▶ Return { character, message: 'Success' }
   │   │       └─ Invalid ▶ Return { null, message: errors }
   │   │
   │   ├─▶ If valid:
   │   │   ├─▶ StateManager.setCharacter(result.character)
   │   │   │   └─▶ Triggers render via state change
   │   │   │
   │   │   ├─▶ originalCharacter = clone(result.character)
   │   │   │
   │   │   └─▶ applyMoodModifiers(currentMood)
   │   │       └─▶ Reapply mood geometry changes
   │   │
   │   └─▶ Show success/error message
   │
   └─▶ Avatar updates live in SVG canvas
```

---

### Character Preset Switch Flow

```
User clicks character preset button (e.g., "Scholar")
   │
   ├─▶ handleCharacterPresetChange('scholar-avatar')
   │
   ├─▶ CharacterGallery.loadPreset('scholar-avatar')
   │   └─▶ fetch('/data/characters/scholar.json')
   │        └─▶ Returns character JSON data
   │
   ├─▶ SchemaValidator.validateCharacterSchema(characterData)
   │   ├─ Valid ▶ Continue
   │   └─ Invalid ▶ Show error, abort
   │
   ├─▶ StateManager.setCharacter(character)
   │   └─▶ Triggers state change listeners
   │        ├─▶ AvatarParser.render(character)
   │        │   ├─▶ Clear existing SVG elements
   │        │   ├─▶ Sort elements by z-index
   │        │   ├─▶ Create SVG elements (circles/polygons)
   │        │   └─▶ Append to #avatar-root group
   │        │
   │        ├─▶ Mirror.describeCurrentState() → Update UI
   │        ├─▶ Update JSON editor
   │        └─▶ PersistenceManager.saveSession()
   │
   ├─▶ originalCharacter = clone(character)
   │   └─▶ Store unmodified version for mood modifiers
   │
   ├─▶ applyMoodModifiers(currentMood)
   │   └─▶ Apply current mood geometry changes to new character
   │
   ├─▶ PhysicsEngine.enable()
   │   └─▶ Attach drag listeners to new SVG elements
   │
   └─▶ Update UI
       └─▶ Highlight active preset button
```

---

## State Management

### Observer Pattern Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     StateManager                        │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │  private state: AvatarState                   │     │
│  │  {                                             │     │
│  │    activeCharacter: CharacterSchema | null     │     │
│  │    currentMood: MoodState                      │     │
│  │  }                                             │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │  private listeners: StateChangeListener[]      │     │
│  │  [                                             │     │
│  │    listener1(state) => { ... },                │     │
│  │    listener2(state) => { ... },                │     │
│  │    listener3(state) => { ... }                 │     │
│  │  ]                                             │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  Public Methods:                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ setCharacter(character) ──▶ notifyListeners()   │   │
│  │ setMood(mood)           ──▶ notifyListeners()   │   │
│  │ updateElement(id, el)   ──▶ notifyListeners()   │   │
│  │ onStateChange(listener) ──▶ listeners.push()    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ notifyListeners()
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌──────────┐
   │Listener1│  │Listener2│  │Listener3 │
   │ (Render)│  │ (Mirror)│  │(Persist) │
   └─────────┘  └─────────┘  └──────────┘
         │            │            │
         ▼            ▼            ▼
   AvatarParser  Mirror.     PersistenceManager
   .render()     describeCurrentState()  .saveSession()
```

### State Change Lifecycle

```
1. State Mutation Triggered
   ├─ setCharacter()
   ├─ setMood()
   └─ updateElement()
        │
        ▼
2. Internal State Updated
   state.activeCharacter = ...
   state.currentMood = ...
        │
        ▼
3. notifyListeners() Called
        │
        ├──▶ listener1(getState())
        │     └─▶ AvatarParser.render(state.activeCharacter)
        │          └─▶ Update SVG DOM
        │
        ├──▶ listener2(getState())
        │     └─▶ Mirror.describeCurrentState()
        │          └─▶ Update text display
        │
        └──▶ listener3(getState())
              └─▶ PersistenceManager.saveSession()
                   └─▶ localStorage.setItem()
```

### Listener Registration Example

```typescript
// In main.ts initialization:

this.stateManager.onStateChange((state) => {
  // Listener 1: Update mirror display
  this.updateMirror()
  
  // Listener 2: Update JSON editor
  this.updateJSONEditor()
  
  // Listener 3: Auto-save to localStorage
  this.persistence.saveSession(
    state.activeCharacter || this.originalCharacter!,
    state.currentMood
  )
  
  // Listener 4: Re-render avatar
  if (state.activeCharacter && this.parser) {
    this.parser.render(state.activeCharacter)
  }
})
```

### Unsubscribe Pattern

```typescript
// onStateChange returns cleanup function
const unsubscribe = stateManager.onStateChange((state) => {
  console.log('State changed:', state)
})

// Later, remove listener
unsubscribe()
```

---

## Architecture Principles

### 1. Separation of Concerns
- **Rendering**: AvatarParser (JSON → SVG)
- **Animation**: AnimationEngine (preset coordination)
- **State**: StateManager (centralized state + observers)
- **Validation**: SchemaValidator (Ajv schemas)
- **Integration**: LLMBridge (prompt generation + parsing)

### 2. Single Source of Truth
- StateManager holds canonical `AvatarState`
- All UI updates triggered by state changes
- No direct DOM manipulation outside AvatarParser

### 3. Type Safety
- All interfaces defined in `types.ts`
- Strict TypeScript throughout
- Runtime validation via SchemaValidator

### 4. Event-Driven Architecture
- Observer pattern for state changes
- Animation triggers for mood/events
- DOM event handlers for user interactions

### 5. Persistence Strategy
- Auto-save on state changes
- Session restoration on page load
- Export/import for portability

### 6. LLM Integration Design
- Copy-paste workflow (no API keys required)
- Structured prompt generation
- Robust JSON extraction and validation

---

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Animation**: Anime.js
- **Validation**: Ajv (JSON Schema)
- **Storage**: localStorage API
- **Rendering**: Native SVG DOM APIs
- **Bundler**: Vite
- **Testing**: Vitest

---

## File Structure

```
src/
├── types.ts              # Type definitions
├── StateManager.ts       # Observable state container
├── AvatarParser.ts       # JSON → SVG renderer
├── AnimationEngine.ts    # Anime.js wrapper
├── PersonalityMapper.ts  # Mood → geometry mapping
├── SchemaValidator.ts    # Ajv validation
├── Mirror.ts             # State reflection
├── PersistenceManager.ts # localStorage manager
├── LLMBridge.ts          # Prompt generation/parsing
├── PhysicsEngine.ts      # Drag-and-drop physics
├── CharacterGallery.ts   # Preset registry
└── main.ts               # Application orchestrator

public/data/
├── characters/
│   ├── default.json
│   ├── scholar.json
│   ├── guardian.json
│   └── trickster.json
└── animations/
    └── idle.json
```

---

## Extension Points

### Adding New Moods
1. Add mood to `MoodState` type in `types.ts`
2. Add mapping in `PersonalityMapper.getGeometricModifiers()`
3. Add mapping in `PersonalityMapper.getAnimationParams()`
4. Add case in `AnimationEngine.triggerMoodAnimation()`
5. Add UI button with `data-mood` attribute

### Adding New Animation Presets
1. Define preset in `AnimationEngine.initializePresets()`
2. Call `playPreset()` from trigger methods
3. Update documentation

### Adding New Character Presets
1. Create JSON file in `public/data/characters/`
2. Add entry to `CharacterGallery.presets` array
3. UI button auto-generated from registry

### Adding New Geometric Primitives
1. Define coordinates interface in `types.ts`
2. Add to `GeometricElement` union type
3. Implement in `AvatarParser.createElement()`
4. Update schema in `SchemaValidator`

---

*Last Updated: 2025*
*Version: 1.0*
