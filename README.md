# Geometric AI Avatar

**JSON-Driven SVG Avatars with Self-Reflective AI Agency**

![CI](https://github.com/TheJusticeMan/geometric-ai-avatar/workflows/CI/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Visual Pipeline

```
JSON → Parser → SVG → Mirror → LLM → JSON
```

A self-reflective avatar system where AI agents modify their own geometric form through a tight feedback loop.

## Features

- **JSON-driven geometric avatar rendering** – Define avatars purely through structured data
- **Mood-based visual modifications** – Emotions translate to geometric properties
- **LLM integration for self-modification** – AI agents rewrite their own appearance
- **Physics-enabled drag-and-drop** – Interactive SVG elements with spring-back physics
- **Multi-character preset gallery** – Switch between distinct geometric personalities
- **Persistent sessions** – Auto-save state with localStorage
- **Comprehensive test suite** – 52 tests covering all modules

## Quick Start

```bash
npm install
npm run dev
# Open browser at http://localhost:3000
```

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
│   ├── PersistenceManager.ts # localStorage save/load
│   ├── LLMBridge.ts          # LLM prompt generation
│   ├── PhysicsEngine.ts      # Drag-and-drop physics
│   ├── CharacterGallery.ts   # Multi-agent presets
│   └── main.ts               # Application entry point
├── public/
│   └── data/
│       ├── characters/       # Character presets
│       └── animations/       # Animation definitions
├── tests/                    # Comprehensive test suite
├── docs/                     # Full documentation
└── index.html                # Browser UI
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [Anime.js](https://animejs.com/) | SVG animations |
| [Ajv](https://ajv.js.org/) | JSON schema validation |
| [Vitest](https://vitest.dev/) | Unit testing |

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint code quality checks |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |

## Architecture Overview

The system is built around a **self-reflective feedback loop**: JSON defines geometric avatars, which are rendered as SVG, described through a "Mirror" module, and modified by LLMs that generate new JSON. This creates a closed loop where AI agents can perceive and modify their own form.

The architecture separates concerns into distinct modules: validation (Ajv schemas), rendering (SVG parser), state management (reactive updates), personality mapping (mood-to-geometry translation), persistence (localStorage), LLM integration (prompt generation), and physics (interactive drag-and-drop). Each module is independently testable and composable.

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE](docs/ARCHITECTURE.md) | System architecture and module reference |
| [SCHEMAS](docs/SCHEMAS.md) | JSON schema documentation |
| [PERSONALITY_MAPPING](docs/PERSONALITY_MAPPING.md) | Mood-to-geometry mappings |
| [VISION](docs/VISION.md) | Project vision and roadmap |
| [VISION_TECHNICAL](docs/VISION_TECHNICAL.md) | Technical implementation details |
| [API_REFERENCE](docs/API_REFERENCE.md) | Complete API documentation |
| [LLM_INTEGRATION_GUIDE](docs/LLM_INTEGRATION_GUIDE.md) | LLM workflow guide |
| [CONTRIBUTING](docs/CONTRIBUTING.md) | Contribution guidelines |
| [TESTING](docs/TESTING.md) | Testing guide |
| [IMPLEMENTATION_PLAN](IMPLEMENTATION_PLAN.md) | Development roadmap |

## Contributing

Contributions are welcome! Please read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines on code style, testing requirements, and the pull request process.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
