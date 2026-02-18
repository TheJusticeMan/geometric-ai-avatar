# The Architecture of Agency: JSON-Driven SVG Avatars

> "I think, therefore I render."

This repository contains the framework for a self-reflective, embodied AI agent. It eschews heavy raster graphics for a minimalist, mathematical approach to identity: **Polygons, Circles, and JSON.**

## Core Philosophies

- **Geometric Purity**: Only circles and polygons. Complexity is an emergent property of morphing and layering, not high-resolution textures.
- **LLM Sovereignty**: The agent is the author of its own form. It generates the JSON that defines its structure, color, and motion.
- **The Digital Mirror**: A feedback loop that allows the model to "see" its current state through textual descriptions of the DOM or vision-based feedback.

## Tech Stack

- **Rendering**: HTML5 SVG (Vanilla JS Parser).
- **Animation**: Anime.js (Tweening JSON states).
- **Logic**: JSON Schema (Structure validation).
- **Persistence**: Local Storage / JSON Flat Files.

## Quick Start

1. Define a `character.json`.
2. Map an `animation.json` timeline.
3. Initialize the `AvatarEngine.js` in your browser.
