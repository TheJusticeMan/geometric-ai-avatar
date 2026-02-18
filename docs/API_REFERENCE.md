# API Reference

Complete API documentation for the Geometric AI Avatar system. This reference covers all 11 public classes/modules with TypeScript signatures, parameters, return types, error handling, and practical examples.

---

## Table of Contents

1. [SchemaValidator](#schemavalidator)
2. [AvatarParser](#avatarparser)
3. [AnimationEngine](#animationengine)
4. [StateManager](#statemanager)
5. [PersonalityMapper](#personalitymapper)
6. [Mirror](#mirror)
7. [PersistenceManager](#persistencemanager)
8. [LLMBridge](#llmbridge)
9. [PhysicsEngine](#physicsengine)
10. [CharacterGallery](#charactergallery)
11. [Type Definitions](#type-definitions)

---

## SchemaValidator

Validates character and animation schemas against JSON schema definitions using [Ajv](https://ajv.js.org/).

### Constructor

```typescript
constructor()
```

No parameters required. Initializes the Ajv validator with JSON schemas.

**Example:**
```typescript
import { SchemaValidator } from './SchemaValidator';

const validator = new SchemaValidator();
```

### Methods

#### `validateCharacterSchema()`

Validates character data against the character schema.

```typescript
validateCharacterSchema(data: unknown): { valid: boolean; errors: string[] }
```

**Parameters:**
- `data` (unknown): The character data to validate

**Returns:**
- Object with:
  - `valid` (boolean): Whether the data is valid
  - `errors` (string[]): Array of error messages (empty if valid)

**Example:**
```typescript
const characterData = {
  id: 'avatar-001',
  version: '1.0',
  elements: [
    {
      type: 'circle',
      id: 'head',
      'z-index': 1,
      coordinates: { cx: 200, cy: 200, r: 80 },
      style: { fill: '#3498DB', stroke: '#2980B9', opacity: 1 }
    }
  ]
};

const result = validator.validateCharacterSchema(characterData);
if (result.valid) {
  console.log('Valid character schema!');
} else {
  console.error('Validation errors:', result.errors);
}
```

#### `validateAnimationSchema()`

Validates animation data against the animation schema.

```typescript
validateAnimationSchema(data: unknown): { valid: boolean; errors: string[] }
```

**Parameters:**
- `data` (unknown): The animation data to validate

**Returns:**
- Object with:
  - `valid` (boolean): Whether the data is valid
  - `errors` (string[]): Array of error messages (empty if valid)

**Example:**
```typescript
const animationData = {
  targetId: 'head',
  property: 'transform',
  timeline: [
    { offset: '0%', value: 'translateY(0)' },
    { offset: '50%', value: 'translateY(-10)' },
    { offset: '100%', value: 'translateY(0)' }
  ],
  easing: 'easeInOutSine',
  loop: true
};

const result = validator.validateAnimationSchema(animationData);
console.log('Animation valid:', result.valid);
```

#### `isValidCharacter()`

Type guard that checks if data is a valid CharacterSchema.

```typescript
isValidCharacter(data: unknown): data is CharacterSchema
```

**Parameters:**
- `data` (unknown): The data to check

**Returns:**
- `boolean`: True if data is a valid CharacterSchema

**Example:**
```typescript
const data = loadFromAPI();

if (validator.isValidCharacter(data)) {
  // TypeScript now knows data is CharacterSchema
  console.log('Character ID:', data.id);
  console.log('Elements:', data.elements.length);
}
```

#### `isValidAnimation()`

Type guard that checks if data is a valid AnimationSchema.

```typescript
isValidAnimation(data: unknown): data is AnimationSchema
```

**Parameters:**
- `data` (unknown): The data to check

**Returns:**
- `boolean`: True if data is a valid AnimationSchema

**Example:**
```typescript
const data = loadAnimationConfig();

if (validator.isValidAnimation(data)) {
  // TypeScript now knows data is AnimationSchema
  console.log('Target:', data.targetId);
  console.log('Property:', data.property);
}
```

### Error Handling

- Does not throw exceptions
- Returns validation results with error arrays
- Empty error array indicates successful validation

---

## AvatarParser

Renders character schemas as SVG elements and manages the SVG DOM.

### Constructor

```typescript
constructor(container: SVGSVGElement)
```

**Parameters:**
- `container` (SVGSVGElement): The SVG element that will contain rendered avatar elements

**Throws:**
- None (but will fail silently if container is invalid)

**Example:**
```typescript
import { AvatarParser } from './AvatarParser';

const svgElement = document.querySelector('#avatar-svg') as SVGSVGElement;
const parser = new AvatarParser(svgElement);
```

### Methods

#### `render()`

Renders a complete character schema to the SVG container.

```typescript
render(schema: CharacterSchema): void
```

**Parameters:**
- `schema` (CharacterSchema): The character to render

**Returns:**
- `void`

**Side Effects:**
- Clears existing elements in the avatar-root group
- Creates SVG elements (circles/polygons) based on schema
- Applies styles and z-index ordering
- Updates internal element cache

**Example:**
```typescript
const character: CharacterSchema = {
  id: 'avatar-001',
  version: '1.0',
  elements: [
    {
      type: 'circle',
      id: 'head',
      'z-index': 1,
      coordinates: { cx: 200, cy: 200, r: 80 },
      style: { fill: '#3498DB', stroke: '#2980B9', opacity: 1 }
    },
    {
      type: 'circle',
      id: 'left-eye',
      'z-index': 2,
      coordinates: { cx: 170, cy: 180, r: 5 },
      style: { fill: '#2C3E50', stroke: '#34495E', opacity: 1 }
    }
  ]
};

parser.render(character);
```

#### `updateElement()`

Updates a single element in the rendered avatar.

```typescript
updateElement(elementId: string, element: GeometricElement): void
```

**Parameters:**
- `elementId` (string): The ID of the element to update
- `element` (GeometricElement): The new element data

**Returns:**
- `void`

**Error Handling:**
- Logs console.error if element not found
- Creates element if it doesn't exist

**Example:**
```typescript
// Make the left eye bigger
parser.updateElement('left-eye', {
  type: 'circle',
  id: 'left-eye',
  'z-index': 2,
  coordinates: { cx: 170, cy: 180, r: 8 }, // Increased radius
  style: { fill: '#2C3E50', stroke: '#34495E', opacity: 1 }
});
```

#### `getElement()`

Retrieves a rendered SVG element by ID.

```typescript
getElement(elementId: string): SVGElement | undefined
```

**Parameters:**
- `elementId` (string): The ID of the element to retrieve

**Returns:**
- `SVGElement | undefined`: The SVG element, or undefined if not found

**Example:**
```typescript
const headElement = parser.getElement('head');
if (headElement) {
  console.log('Head element:', headElement.tagName);
  console.log('Fill color:', headElement.getAttribute('fill'));
}
```

#### `clear()`

Removes all rendered elements from the SVG container.

```typescript
clear(): void
```

**Returns:**
- `void`

**Side Effects:**
- Removes all child elements from avatar-root group
- Clears internal element cache

**Example:**
```typescript
// Clear the current avatar before loading a new one
parser.clear();
parser.render(newCharacter);
```

---

## AnimationEngine

Manages animations using [anime.js](https://animejs.com/), including presets and mood-based animations.

### Constructor

```typescript
constructor()
```

No parameters required. Initializes animation presets.

**Example:**
```typescript
import { AnimationEngine } from './AnimationEngine';

const animator = new AnimationEngine();
```

### Methods

#### `playPreset()`

Plays a predefined animation preset.

```typescript
playPreset(presetName: string): void
```

**Parameters:**
- `presetName` (string): Name of the preset ('blink', 'float', 'breathe', 'ponder', 'pulse', 'tilt', 'jitter')

**Returns:**
- `void`

**Available Presets:**
- `blink`: Eye blinking animation
- `float`: Gentle vertical floating motion
- `breathe`: Scaling animation for breathing effect
- `ponder`: Head tilting for thoughtful appearance
- `pulse`: Pulsing glow effect
- `tilt`: Rotation animation
- `jitter`: Rapid small movements

**Error Handling:**
- Logs console.error if preset not found
- Logs console.error if target elements missing

**Example:**
```typescript
// Play the float animation on the avatar
animator.playPreset('float');

// Chain multiple animations
animator.playPreset('breathe');
animator.playPreset('blink');
```

#### `playAnimation()`

Plays a custom animation defined by an AnimationSchema.

```typescript
playAnimation(schema: AnimationSchema): void
```

**Parameters:**
- `schema` (AnimationSchema): Custom animation definition

**Returns:**
- `void`

**Example:**
```typescript
const customAnimation: AnimationSchema = {
  targetId: 'head',
  property: 'transform',
  timeline: [
    { offset: '0%', value: 'rotate(0deg)' },
    { offset: '50%', value: 'rotate(10deg)' },
    { offset: '100%', value: 'rotate(0deg)' }
  ],
  easing: 'easeInOutQuad',
  loop: true
};

animator.playAnimation(customAnimation);
```

#### `triggerAnimation()`

Triggers animations based on system events.

```typescript
triggerAnimation(trigger: AnimationTrigger): void
```

**Parameters:**
- `trigger` (AnimationTrigger): Event trigger ('onLoad', 'onMessageReceived', 'isProcessing', 'onMoodChange')

**Returns:**
- `void`

**Example:**
```typescript
// Trigger animation when avatar loads
animator.triggerAnimation('onLoad');

// Trigger when processing starts
animator.triggerAnimation('isProcessing');
```

#### `triggerMoodAnimation()`

Triggers mood-specific animations.

```typescript
triggerMoodAnimation(mood: MoodState): void
```

**Parameters:**
- `mood` (MoodState): The mood state ('neutral', 'analytical', 'energetic', 'pensive', 'erroneous')

**Returns:**
- `void`

**Example:**
```typescript
// Animate for analytical mood
animator.triggerMoodAnimation('analytical');

// Animate for energetic mood
animator.triggerMoodAnimation('energetic');
```

#### `stopAll()`

Stops all active animations.

```typescript
stopAll(): void
```

**Returns:**
- `void`

**Example:**
```typescript
// Stop all running animations
animator.stopAll();

// Then start a new animation
animator.playPreset('breathe');
```

---

## StateManager

Centralized state management with pub/sub pattern for state changes.

### Constructor

```typescript
constructor()
```

No parameters required. Initializes with neutral state and no character.

**Example:**
```typescript
import { StateManager } from './StateManager';

const stateManager = new StateManager();
```

### Methods

#### `getState()`

Returns a copy of the current avatar state.

```typescript
getState(): AvatarState
```

**Returns:**
- `AvatarState`: Object containing current character and mood

**Example:**
```typescript
const state = stateManager.getState();
console.log('Current mood:', state.currentMood);
console.log('Has character:', state.activeCharacter !== null);
```

#### `setCharacter()`

Sets the active character and notifies listeners.

```typescript
setCharacter(character: CharacterSchema): void
```

**Parameters:**
- `character` (CharacterSchema): The character to set as active

**Returns:**
- `void`

**Side Effects:**
- Updates state
- Triggers state change listeners

**Example:**
```typescript
const character: CharacterSchema = {
  id: 'avatar-001',
  version: '1.0',
  elements: [/* ... */]
};

stateManager.setCharacter(character);
```

#### `getCharacter()`

Returns the currently active character.

```typescript
getCharacter(): CharacterSchema | null
```

**Returns:**
- `CharacterSchema | null`: The active character, or null if none loaded

**Example:**
```typescript
const character = stateManager.getCharacter();
if (character) {
  console.log('Character ID:', character.id);
  console.log('Element count:', character.elements.length);
} else {
  console.log('No character loaded');
}
```

#### `updateElement()`

Updates a specific element in the active character.

```typescript
updateElement(elementId: string, element: GeometricElement): void
```

**Parameters:**
- `elementId` (string): The ID of the element to update
- `element` (GeometricElement): The new element data

**Returns:**
- `void`

**Error Handling:**
- Logs console.error if no character is loaded
- Logs console.error if element not found

**Example:**
```typescript
// Update the head color
stateManager.updateElement('head', {
  type: 'circle',
  id: 'head',
  'z-index': 1,
  coordinates: { cx: 200, cy: 200, r: 80 },
  style: { fill: '#E74C3C', stroke: '#C0392B', opacity: 1 } // Red instead of blue
});
```

#### `setMood()`

Sets the current mood state and notifies listeners.

```typescript
setMood(mood: MoodState): void
```

**Parameters:**
- `mood` (MoodState): The mood to set ('neutral', 'analytical', 'energetic', 'pensive', 'erroneous')

**Returns:**
- `void`

**Side Effects:**
- Updates state
- Triggers state change listeners

**Example:**
```typescript
// Set to analytical mood
stateManager.setMood('analytical');

// Later, change to energetic
stateManager.setMood('energetic');
```

#### `getMood()`

Returns the current mood state.

```typescript
getMood(): MoodState
```

**Returns:**
- `MoodState`: The current mood

**Example:**
```typescript
const mood = stateManager.getMood();
console.log('Current mood:', mood); // 'neutral', 'analytical', etc.
```

#### `onStateChange()`

Registers a listener for state changes.

```typescript
onStateChange(listener: StateChangeListener): () => void
```

**Parameters:**
- `listener` (StateChangeListener): Callback function receiving the new state

**Returns:**
- `() => void`: Unsubscribe function

**Example:**
```typescript
// Register a listener
const unsubscribe = stateManager.onStateChange((state) => {
  console.log('State changed!');
  console.log('Character:', state.activeCharacter?.id);
  console.log('Mood:', state.currentMood);
});

// Later, unsubscribe
unsubscribe();
```

**Advanced Example:**
```typescript
// React-style usage
useEffect(() => {
  const unsubscribe = stateManager.onStateChange((state) => {
    setLocalState(state);
  });
  
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

---

## PersonalityMapper

Maps mood states to geometric modifiers and animation parameters.

### Constructor

```typescript
constructor()
```

No parameters required.

**Example:**
```typescript
import { PersonalityMapper } from './PersonalityMapper';

const mapper = new PersonalityMapper();
```

### Methods

#### `getGeometricModifiers()`

Returns geometric modifiers for a given mood.

```typescript
getGeometricModifiers(mood: MoodState): GeometricModifiers
```

**Parameters:**
- `mood` (MoodState): The mood state

**Returns:**
- `GeometricModifiers`: Object with optional modifiers (eyeRadiusMultiplier, colorBrightness, asymmetryFactor, jitterAmount)

**Example:**
```typescript
const analyticalMods = mapper.getGeometricModifiers('analytical');
console.log('Eye multiplier:', analyticalMods.eyeRadiusMultiplier); // 1.2

const energeticMods = mapper.getGeometricModifiers('energetic');
console.log('Color brightness:', energeticMods.colorBrightness); // 1.3
console.log('Jitter:', energeticMods.jitterAmount); // 2
```

#### `getAnimationParams()`

Returns animation parameters for a given mood.

```typescript
getAnimationParams(mood: MoodState): AnimationParams
```

**Parameters:**
- `mood` (MoodState): The mood state

**Returns:**
- `AnimationParams`: Object with duration, easing, loop, and optional direction

**Example:**
```typescript
const analyticalParams = mapper.getAnimationParams('analytical');
console.log('Duration:', analyticalParams.duration); // 3000
console.log('Easing:', analyticalParams.easing); // 'linear'
console.log('Loop:', analyticalParams.loop); // true

const energeticParams = mapper.getAnimationParams('energetic');
console.log('Duration:', energeticParams.duration); // 800
console.log('Direction:', energeticParams.direction); // 'alternate'
```

#### `getAnimationBehavior()`

Returns a human-readable description of the animation behavior for a mood.

```typescript
getAnimationBehavior(mood: MoodState): string
```

**Parameters:**
- `mood` (MoodState): The mood state

**Returns:**
- `string`: Description of animation behavior

**Example:**
```typescript
console.log(mapper.getAnimationBehavior('analytical'));
// "Slow, steady rotation with minimal jitter"

console.log(mapper.getAnimationBehavior('energetic'));
// "Fast, bouncy movements with high energy"

console.log(mapper.getAnimationBehavior('pensive'));
// "Slow, contemplative sway with gentle breathing"
```

---

## Mirror

Self-reflection system that generates reports about the avatar's current state.

### Constructor

```typescript
constructor()
```

No parameters required. Initializes PersonalityMapper.

**Example:**
```typescript
import { Mirror } from './Mirror';

const mirror = new Mirror();
```

### Methods

#### `describeCurrentState()`

Generates a detailed markdown report of the current avatar state.

```typescript
describeCurrentState(
  character: CharacterSchema | null,
  mood: MoodState,
  svgContainer: SVGSVGElement
): string
```

**Parameters:**
- `character` (CharacterSchema | null): The current character
- `mood` (MoodState): The current mood
- `svgContainer` (SVGSVGElement): The SVG container for animation state

**Returns:**
- `string`: Markdown-formatted report

**Example:**
```typescript
const svgElement = document.querySelector('#avatar-svg') as SVGSVGElement;
const character = stateManager.getCharacter();
const mood = stateManager.getMood();

const report = mirror.describeCurrentState(character, mood, svgElement);
console.log(report);
/* Output:
Avatar State Report (ID: avatar-001, Version: 1.0)

=== Geometric Configuration ===
• head: Circle at position (200, 200) with radius 80
  Style: fill=#3498DB, stroke=#2980B9, opacity=1
• left-eye: Circle at position (170, 180) with radius 5
  Style: fill=#2C3E50, stroke=#34495E, opacity=1
...
*/
```

#### `generateBase64Snapshot()`

Generates a base64-encoded data URI of the current SVG state.

```typescript
generateBase64Snapshot(svgContainer: SVGSVGElement): string
```

**Parameters:**
- `svgContainer` (SVGSVGElement): The SVG container to snapshot

**Returns:**
- `string`: Base64 data URI (data:image/svg+xml;base64,...)

**Example:**
```typescript
const svgElement = document.querySelector('#avatar-svg') as SVGSVGElement;
const snapshot = mirror.generateBase64Snapshot(svgElement);

// Use in an img tag
const img = document.createElement('img');
img.src = snapshot;
document.body.appendChild(img);

// Or save to localStorage
localStorage.setItem('avatar-snapshot', snapshot);
```

#### `generateLLMContext()`

Generates LLM-optimized context for use in prompts.

```typescript
generateLLMContext(
  character: CharacterSchema | null,
  mood: MoodState,
  svgContainer: SVGSVGElement
): string
```

**Parameters:**
- `character` (CharacterSchema | null): The current character
- `mood` (MoodState): The current mood
- `svgContainer` (SVGSVGElement): The SVG container (currently unused)

**Returns:**
- `string`: Compact, LLM-friendly context string

**Example:**
```typescript
const character = stateManager.getCharacter();
const mood = stateManager.getMood();
const svgElement = document.querySelector('#avatar-svg') as SVGSVGElement;

const context = mirror.generateLLMContext(character, mood, svgElement);
console.log(context);
/* Output:
Current Character (JSON):
{
  "id": "avatar-001",
  "version": "1.0",
  "elements": [...]
}

Mood: analytical
Active Modifiers: {"eyeRadiusMultiplier":1.2}
...
*/
```

---

## PersistenceManager

Handles client-side persistence using localStorage.

### Constructor

```typescript
constructor(storageKey: string = 'geometric-avatar')
```

**Parameters:**
- `storageKey` (string, optional): Prefix for localStorage keys (default: 'geometric-avatar')

**Example:**
```typescript
import { PersistenceManager } from './PersistenceManager';

// Use default key
const persistence = new PersistenceManager();

// Use custom key
const customPersistence = new PersistenceManager('my-avatar-app');
```

### Methods

#### `saveCharacter()`

Saves a character to localStorage.

```typescript
saveCharacter(character: CharacterSchema): void
```

**Parameters:**
- `character` (CharacterSchema): The character to save

**Returns:**
- `void`

**Error Handling:**
- Logs console.error on save failure
- Fails silently if localStorage is unavailable

**Example:**
```typescript
const character = stateManager.getCharacter();
if (character) {
  persistence.saveCharacter(character);
  console.log('Character saved!');
}
```

#### `loadCharacter()`

Loads a character from localStorage.

```typescript
loadCharacter(): CharacterSchema | null
```

**Returns:**
- `CharacterSchema | null`: The saved character, or null if not found or invalid

**Error Handling:**
- Returns null on parse errors
- Logs console.error on failures

**Example:**
```typescript
const savedCharacter = persistence.loadCharacter();
if (savedCharacter) {
  stateManager.setCharacter(savedCharacter);
  parser.render(savedCharacter);
} else {
  console.log('No saved character found');
}
```

#### `hasSavedCharacter()`

Checks if a character exists in localStorage.

```typescript
hasSavedCharacter(): boolean
```

**Returns:**
- `boolean`: True if a saved character exists

**Example:**
```typescript
if (persistence.hasSavedCharacter()) {
  const character = persistence.loadCharacter();
  // Load the character
} else {
  // Load default character
  const defaultChar = await gallery.loadPreset('default-avatar');
}
```

#### `saveMood()`

Saves the current mood to localStorage.

```typescript
saveMood(mood: MoodState): void
```

**Parameters:**
- `mood` (MoodState): The mood to save

**Returns:**
- `void`

**Example:**
```typescript
const currentMood = stateManager.getMood();
persistence.saveMood(currentMood);
```

#### `loadMood()`

Loads the saved mood from localStorage.

```typescript
loadMood(): MoodState | null
```

**Returns:**
- `MoodState | null`: The saved mood, or null if not found

**Example:**
```typescript
const savedMood = persistence.loadMood();
if (savedMood) {
  stateManager.setMood(savedMood);
}
```

#### `saveSession()`

Saves both character and mood as a session.

```typescript
saveSession(character: CharacterSchema, mood: MoodState): void
```

**Parameters:**
- `character` (CharacterSchema): The character to save
- `mood` (MoodState): The mood to save

**Returns:**
- `void`

**Example:**
```typescript
const character = stateManager.getCharacter();
const mood = stateManager.getMood();

if (character) {
  persistence.saveSession(character, mood);
  console.log('Session saved!');
}
```

#### `loadSession()`

Loads a complete session from localStorage.

```typescript
loadSession(): SessionData | null
```

**Returns:**
- `SessionData | null`: Object with character, mood, and timestamp, or null if not found

**Example:**
```typescript
const session = persistence.loadSession();
if (session) {
  console.log('Session from:', new Date(session.timestamp));
  stateManager.setCharacter(session.character);
  stateManager.setMood(session.mood);
  parser.render(session.character);
}
```

#### `clearSaved()`

Clears all saved data from localStorage.

```typescript
clearSaved(): void
```

**Returns:**
- `void`

**Example:**
```typescript
// Clear all saved data
persistence.clearSaved();

// Reset to defaults
stateManager.setMood('neutral');
const defaultChar = await gallery.loadPreset('default-avatar');
stateManager.setCharacter(defaultChar as CharacterSchema);
```

---

## LLMBridge

Bridges the avatar system with Large Language Models for AI-assisted modifications.

### Constructor

```typescript
constructor()
```

No parameters required. Initializes SchemaValidator.

**Example:**
```typescript
import { LLMBridge } from './LLMBridge';

const llmBridge = new LLMBridge();
```

### Methods

#### `generateSystemPrompt()`

Generates a comprehensive system prompt for the LLM.

```typescript
generateSystemPrompt(currentState: string, characterSchema: CharacterSchema): string
```

**Parameters:**
- `currentState` (string): Current state description (from Mirror)
- `characterSchema` (CharacterSchema): Current character JSON

**Returns:**
- `string`: Markdown-formatted system prompt with schema documentation

**Example:**
```typescript
const character = stateManager.getCharacter();
const svgElement = document.querySelector('#avatar-svg') as SVGSVGElement;
const currentState = mirror.describeCurrentState(character, 'neutral', svgElement);

const systemPrompt = llmBridge.generateSystemPrompt(currentState, character);
console.log(systemPrompt);
// Contains full documentation of the schema format, coordinate system, etc.
```

#### `generateUserPrompt()`

Generates a user-facing prompt with context.

```typescript
generateUserPrompt(mirrorOutput: string, userMessage: string): string
```

**Parameters:**
- `mirrorOutput` (string): Current state from Mirror
- `userMessage` (string): User's request

**Returns:**
- `string`: Combined prompt with user message and context

**Example:**
```typescript
const mirrorOutput = mirror.generateLLMContext(character, mood, svgElement);
const userMessage = "Make the avatar look surprised";

const userPrompt = llmBridge.generateUserPrompt(mirrorOutput, userMessage);
// Combines user request with current avatar state
```

#### `parseResponse()`

Parses and validates LLM response to extract character JSON.

```typescript
parseResponse(response: string): { character: CharacterSchema | null; message: string }
```

**Parameters:**
- `response` (string): Raw LLM response text

**Returns:**
- Object with:
  - `character` (CharacterSchema | null): Parsed and validated character, or null
  - `message` (string): Success or error message

**Error Handling:**
- Returns null character with error message if:
  - No JSON code fence found
  - JSON parse fails
  - Schema validation fails

**Example:**
```typescript
const llmResponse = `
Here's the modified avatar with bigger eyes:

\`\`\`json
{
  "id": "avatar-001",
  "version": "1.0",
  "elements": [
    {
      "type": "circle",
      "id": "left-eye",
      "z-index": 2,
      "coordinates": { "cx": 170, "cy": 180, "r": 10 },
      "style": { "fill": "#2C3E50", "stroke": "#34495E", "opacity": 1 }
    }
  ]
}
\`\`\`

I increased the eye radius from 5 to 10.
`;

const result = llmBridge.parseResponse(llmResponse);
if (result.character) {
  stateManager.setCharacter(result.character);
  parser.render(result.character);
  console.log(result.message); // "Character JSON successfully parsed and validated!"
} else {
  console.error(result.message);
}
```

#### `getFullPromptForCopy()`

Generates a complete prompt for manual LLM usage (copy/paste).

```typescript
getFullPromptForCopy(
  mirrorOutput: string,
  character: CharacterSchema,
  userMessage?: string
): string
```

**Parameters:**
- `mirrorOutput` (string): Current state from Mirror
- `character` (CharacterSchema): Current character
- `userMessage` (string, optional): User's request

**Returns:**
- `string`: Complete prompt ready for copy/paste

**Example:**
```typescript
const character = stateManager.getCharacter();
const svgElement = document.querySelector('#avatar-svg') as SVGSVGElement;
const mirrorOutput = mirror.generateLLMContext(character, 'neutral', svgElement);

const fullPrompt = llmBridge.getFullPromptForCopy(
  mirrorOutput,
  character,
  "Make the avatar look friendly"
);

// Copy to clipboard
navigator.clipboard.writeText(fullPrompt);
console.log('Prompt copied! Paste into ChatGPT or Claude.');
```

---

## PhysicsEngine

Enables interactive drag-and-drop physics with elastic snap-back.

### Constructor

```typescript
constructor(svgContainer: SVGSVGElement)
```

**Parameters:**
- `svgContainer` (SVGSVGElement): The SVG container element

**Example:**
```typescript
import { PhysicsEngine } from './PhysicsEngine';

const svgElement = document.querySelector('#avatar-svg') as SVGSVGElement;
const physics = new PhysicsEngine(svgElement);
```

### Properties

#### `isEnabled` (getter)

Returns whether physics interactions are enabled.

```typescript
get isEnabled(): boolean
```

**Returns:**
- `boolean`: True if physics is enabled

**Example:**
```typescript
console.log('Physics enabled:', physics.isEnabled);
```

### Methods

#### `enable()`

Enables drag-and-drop interactions on avatar elements.

```typescript
enable(): void
```

**Returns:**
- `void`

**Side Effects:**
- Attaches pointer event listeners to avatar elements
- Sets cursor styles
- Enables touch support

**Error Handling:**
- Logs console.warn if #avatar-root not found

**Example:**
```typescript
// Enable physics interactions
physics.enable();

// Now users can drag avatar elements
```

#### `disable()`

Disables drag-and-drop interactions.

```typescript
disable(): void
```

**Returns:**
- `void`

**Side Effects:**
- Removes all event listeners
- Resets cursor styles
- Cancels any active drag

**Example:**
```typescript
// Disable physics when showing an animation
physics.disable();
animator.playPreset('float');

// Re-enable after animation
setTimeout(() => {
  physics.enable();
}, 5000);
```

### Behavior

- **Drag:** Click/touch and drag any avatar element
- **Snap-back:** Released elements animate back to original position with elastic easing
- **Animation:** Uses easeOutElastic(1, 0.6) for natural bounce
- **Duration:** 800ms snap-back animation
- **Touch Support:** Works with both mouse and touch events

**Complete Example:**
```typescript
const svgElement = document.querySelector('#avatar-svg') as SVGSVGElement;
const physics = new PhysicsEngine(svgElement);

// Enable physics
physics.enable();

// Toggle physics with a button
document.querySelector('#toggle-physics')?.addEventListener('click', () => {
  if (physics.isEnabled) {
    physics.disable();
    console.log('Physics disabled');
  } else {
    physics.enable();
    console.log('Physics enabled');
  }
});
```

---

## CharacterGallery

Manages and loads preset character avatars.

### Constructor

```typescript
constructor()
```

No parameters required. Initializes with 4 built-in presets.

**Example:**
```typescript
import { CharacterGallery } from './CharacterGallery';

const gallery = new CharacterGallery();
```

### Methods

#### `getPresets()`

Returns a list of available character presets.

```typescript
getPresets(): CharacterPreset[]
```

**Returns:**
- `CharacterPreset[]`: Array of preset metadata

**CharacterPreset Structure:**
```typescript
interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  path: string;
}
```

**Example:**
```typescript
const presets = gallery.getPresets();
presets.forEach(preset => {
  console.log(`${preset.name}: ${preset.description}`);
});

/* Output:
Default: The standard geometric avatar
Scholar: A focused academic with a hexagonal cap
Guardian: A broad, powerful protector
Trickster: An asymmetric, playful spirit
*/
```

#### `loadPreset()`

Loads a character preset by ID.

```typescript
async loadPreset(presetId: string): Promise<unknown>
```

**Parameters:**
- `presetId` (string): The preset ID ('default-avatar', 'scholar-avatar', 'guardian-avatar', 'trickster-avatar')

**Returns:**
- `Promise<unknown>`: Resolves to the character JSON, or null if not found

**Error Handling:**
- Returns null if preset ID not found
- Fetch errors propagate as rejected promises

**Example:**
```typescript
// Load the default avatar
const defaultChar = await gallery.loadPreset('default-avatar');
if (defaultChar) {
  const validator = new SchemaValidator();
  if (validator.isValidCharacter(defaultChar)) {
    stateManager.setCharacter(defaultChar);
    parser.render(defaultChar);
  }
}

// Load with error handling
try {
  const scholarChar = await gallery.loadPreset('scholar-avatar');
  if (scholarChar && validator.isValidCharacter(scholarChar)) {
    stateManager.setCharacter(scholarChar);
    parser.render(scholarChar);
  } else {
    console.error('Invalid character schema');
  }
} catch (error) {
  console.error('Failed to load preset:', error);
}
```

**UI Example:**
```typescript
// Create preset selector
const presets = gallery.getPresets();
const select = document.createElement('select');

presets.forEach(preset => {
  const option = document.createElement('option');
  option.value = preset.id;
  option.textContent = preset.name;
  select.appendChild(option);
});

select.addEventListener('change', async (e) => {
  const presetId = (e.target as HTMLSelectElement).value;
  const character = await gallery.loadPreset(presetId);
  
  if (character && validator.isValidCharacter(character)) {
    stateManager.setCharacter(character);
    parser.render(character);
  }
});
```

---

## Type Definitions

### Core Types

```typescript
// Coordinate types
interface CircleCoordinates {
  cx: number;  // Center X
  cy: number;  // Center Y
  r: number;   // Radius
}

interface PolygonCoordinates {
  points: [number, number][]; // Array of [x, y] vertices
}

// Style definition
interface ElementStyle {
  fill: string;    // Hex color (#RRGGBB)
  stroke: string;  // Hex color (#RRGGBB)
  opacity: number; // 0-1
}

// Element types
interface CircleElement {
  type: 'circle';
  id: string;
  'z-index': number;
  coordinates: CircleCoordinates;
  style: ElementStyle;
}

interface PolygonElement {
  type: 'polygon';
  id: string;
  'z-index': number;
  coordinates: PolygonCoordinates;
  style: ElementStyle;
}

type GeometricElement = CircleElement | PolygonElement;
```

### Schema Types

```typescript
// Character schema
interface CharacterSchema {
  id: string;
  version: string;
  elements: GeometricElement[];
}

// Animation schema
interface TimelineKeyframe {
  offset: string;        // Percentage (e.g., '0%', '50%', '100%')
  value: string | number; // CSS value or numeric value
}

interface AnimationSchema {
  targetId: string;
  property: 'points' | 'radius' | 'transform' | 'color';
  timeline: TimelineKeyframe[];
  easing: string;
  loop: boolean;
}
```

### State Types

```typescript
// Mood states
type MoodState = 'neutral' | 'analytical' | 'energetic' | 'pensive' | 'erroneous';

// Avatar state
interface AvatarState {
  activeCharacter: CharacterSchema | null;
  currentMood: MoodState;
}

// State change listener
interface StateChangeListener {
  (state: AvatarState): void;
}
```

### Personality Types

```typescript
// Geometric modifiers
interface GeometricModifiers {
  eyeRadiusMultiplier?: number;
  colorBrightness?: number;
  asymmetryFactor?: number;
  jitterAmount?: number;
}

// Animation parameters
interface AnimationParams {
  duration: number;
  easing: string;
  loop: boolean;
  direction?: 'normal' | 'reverse' | 'alternate';
}

// Animation triggers
type AnimationTrigger = 'onLoad' | 'onMessageReceived' | 'isProcessing' | 'onMoodChange';
```

### Persistence Types

```typescript
// Session data
interface SessionData {
  character: CharacterSchema;
  mood: MoodState;
  timestamp: number;
}
```

### Gallery Types

```typescript
// Character preset
interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  path: string;
}
```

---

## Common Usage Patterns

### Complete Initialization

```typescript
import { 
  SchemaValidator, 
  AvatarParser, 
  AnimationEngine, 
  StateManager,
  PersonalityMapper,
  Mirror,
  PersistenceManager,
  LLMBridge,
  PhysicsEngine,
  CharacterGallery 
} from './geometric-ai-avatar';

// Initialize core systems
const svgElement = document.querySelector('#avatar-svg') as SVGSVGElement;
const validator = new SchemaValidator();
const parser = new AvatarParser(svgElement);
const animator = new AnimationEngine();
const stateManager = new StateManager();
const mapper = new PersonalityMapper();
const mirror = new Mirror();
const persistence = new PersistenceManager();
const llmBridge = new LLMBridge();
const physics = new PhysicsEngine(svgElement);
const gallery = new CharacterGallery();

// Load saved session or default
const session = persistence.loadSession();
if (session) {
  stateManager.setCharacter(session.character);
  stateManager.setMood(session.mood);
  parser.render(session.character);
} else {
  const defaultChar = await gallery.loadPreset('default-avatar');
  if (defaultChar && validator.isValidCharacter(defaultChar)) {
    stateManager.setCharacter(defaultChar);
    parser.render(defaultChar);
  }
}

// Enable interactions
physics.enable();
animator.playPreset('breathe');

// Listen for state changes
stateManager.onStateChange((state) => {
  if (state.activeCharacter) {
    persistence.saveSession(state.activeCharacter, state.currentMood);
  }
  animator.triggerMoodAnimation(state.currentMood);
});
```

### Mood-Based Animation

```typescript
// Set mood and trigger appropriate animations
function setMood(mood: MoodState) {
  stateManager.setMood(mood);
  animator.triggerMoodAnimation(mood);
  
  const params = mapper.getAnimationParams(mood);
  const behavior = mapper.getAnimationBehavior(mood);
  
  console.log(`Mood: ${mood}`);
  console.log(`Animation: ${behavior}`);
  console.log(`Duration: ${params.duration}ms`);
}

// Cycle through moods
const moods: MoodState[] = ['neutral', 'analytical', 'energetic', 'pensive', 'erroneous'];
let moodIndex = 0;

setInterval(() => {
  setMood(moods[moodIndex]);
  moodIndex = (moodIndex + 1) % moods.length;
}, 5000);
```

### LLM Integration Workflow

```typescript
async function modifyWithLLM(userRequest: string) {
  const character = stateManager.getCharacter();
  const mood = stateManager.getMood();
  
  if (!character) return;
  
  // Generate context
  const mirrorOutput = mirror.generateLLMContext(character, mood, svgElement);
  const systemPrompt = llmBridge.generateSystemPrompt(mirrorOutput, character);
  const userPrompt = llmBridge.generateUserPrompt(mirrorOutput, userRequest);
  
  // Send to LLM API (example)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });
  
  const data = await response.json();
  const llmResponse = data.choices[0].message.content;
  
  // Parse and apply
  const result = llmBridge.parseResponse(llmResponse);
  if (result.character) {
    stateManager.setCharacter(result.character);
    parser.render(result.character);
    console.log(result.message);
  } else {
    console.error(result.message);
  }
}

// Usage
modifyWithLLM("Make the avatar look surprised with wide eyes");
```

---

## Coordinate System Reference

- **Canvas Size:** 400×400 pixels
- **Origin:** Top-left corner (0, 0)
- **Center:** (200, 200)
- **Valid Range:** 0-400 for both X and Y coordinates
- **Z-Index:** Higher values appear in front

**Common Positions:**
- Head center: ~(200, 200)
- Left eye: ~(170, 180)
- Right eye: ~(230, 180)
- Mouth: ~(200, 240)

---

## Error Handling Summary

| Class | Error Strategy |
|-------|---------------|
| SchemaValidator | Returns error arrays, never throws |
| AvatarParser | console.error, fails silently |
| AnimationEngine | console.error on missing targets/presets |
| StateManager | console.error, defensive checks |
| PersonalityMapper | Never throws, returns defaults |
| Mirror | Handles null gracefully, never throws |
| PersistenceManager | try-catch, console.error, returns null |
| LLMBridge | Returns error messages in result object |
| PhysicsEngine | console.warn on initialization issues |
| CharacterGallery | Returns null, propagates fetch errors |

---

## Version

API Reference Version: 1.0  
Generated for: geometric-ai-avatar v1.0.0

---

*For more information, see the [Architecture Documentation](./ARCHITECTURE.md) and [Vision Document](../VISION.md).*
