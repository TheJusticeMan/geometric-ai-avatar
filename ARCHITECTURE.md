# System Architecture

The Avatar System operates as a closed-loop cycle between the LLM and the Rendering Engine.

## 1. The Parser/Renderer

The core module takes a `CharacterSchema` and dynamically generates SVG elements.

- **Circle Handling**: Maps `(cx, cy, r)` to `<circle>`.
- **Polygon Handling**: Interpolates `[[x,y], [x,y]]` arrays into a `<polygon points="...">` string.

## 2. The Animation Runtime

Instead of hard-coded CSS, animations are stored as "Keyframe Objects."

- **State A (Neutral)** -> **State B (Pondering)**.
- The runtime uses `lerp` or `Anime.js` to morph coordinate sets over time.

## 3. The Self-Reflection Mechanism (The Mirror)

To prevent hallucinations of identity, the system provides the LLM with a **Snapshot Description**:

- **Semantic Mapping**: Translates raw coordinates into human-readable positions (e.g., "Eyes are narrowed," "Torso is tilted 5 degrees left").
- **Vision Integration**: Optional base64 capture for multi-modal models to verify their "body language."

## 4. State Management

- `activeCharacter`: The current visual config.
- `currentMood`: A set of reactive animation triggers (e.g., `onMessageReceived`, `isProcessing`).
