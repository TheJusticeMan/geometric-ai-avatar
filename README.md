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

## Quick Start

1. `npm install`
2. `npm run dev`
3. Open the browser preview (automatically opens at http://localhost:3000)

## Development Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check code quality

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
│   └── main.ts               # Application entry point
├── data/
│   ├── characters/
│   │   └── default.json      # Default avatar character
│   └── animations/
│       └── idle.json         # Default idle animations
├── index.html                # Browser UI
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── .eslintrc.json            # ESLint configuration

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

Place your animation JSON in `data/animations/` and integrate it through the AnimationEngine.
