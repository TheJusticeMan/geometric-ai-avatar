# Schema Documentation

This document provides comprehensive documentation for the character and animation schemas used in the Geometric AI Avatar project.

## Table of Contents

- [Character Schema](#character-schema)
- [Animation Schema](#animation-schema)
- [Validation](#validation)
- [Complete Examples](#complete-examples)
- [Creating Custom Characters](#creating-custom-characters)

---

## Character Schema

The Character Schema defines the structure for geometric avatar characters. All characters are validated using JSON Schema via the Ajv library.

### Full JSON Schema Definition

```json
{
  "type": "object",
  "required": ["id", "version", "elements"],
  "properties": {
    "id": { "type": "string" },
    "version": { "type": "string" },
    "elements": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type", "id", "z-index", "coordinates", "style"],
        "properties": {
          "type": { "enum": ["circle", "polygon"] },
          "id": { "type": "string" },
          "z-index": { "type": "number" },
          "coordinates": { ... },
          "style": { ... }
        }
      }
    }
  }
}
```

### Field Documentation

#### Root Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier for the character (e.g., "default-avatar", "scholar-avatar") |
| `version` | string | ✓ | Schema version (currently "1.0") |
| `elements` | array | ✓ | Array of geometric elements that compose the character |

#### Element Fields

Each element in the `elements` array must contain:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | ✓ | Element type: `"circle"` or `"polygon"` |
| `id` | string | ✓ | Unique identifier for the element (e.g., "head", "eye-left", "torso") |
| `z-index` | number | ✓ | Stacking order (higher values appear in front). Typically 1-3 for avatars |
| `coordinates` | object | ✓ | Position and shape data (varies by type) |
| `style` | object | ✓ | Visual styling properties |

#### Circle Coordinates

For elements with `type: "circle"`:

```json
{
  "coordinates": {
    "cx": number,  // Center X position (0-400)
    "cy": number,  // Center Y position (0-400)
    "r": number    // Radius in pixels
  }
}
```

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `cx` | number | ✓ | 0-400 | X-coordinate of circle center |
| `cy` | number | ✓ | 0-400 | Y-coordinate of circle center |
| `r` | number | ✓ | > 0 | Radius of the circle |

#### Polygon Coordinates

For elements with `type: "polygon"`:

```json
{
  "coordinates": {
    "points": [[x1, y1], [x2, y2], [x3, y3], ...]
  }
}
```

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `points` | array | ✓ | Min 3 points | Array of [x, y] coordinate pairs defining polygon vertices |
| Each point | [number, number] | ✓ | Each coordinate 0-400 | [x, y] pair representing a vertex |

#### Style Object

All elements require a `style` object:

```json
{
  "style": {
    "fill": string,     // Color value (hex, rgb, or named color)
    "stroke": string,   // Border color
    "opacity": number   // Transparency (0.0 - 1.0)
  }
}
```

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `fill` | string | ✓ | Valid CSS color | Fill color (e.g., "#E0E0E0", "rgb(224,224,224)", "blue") |
| `stroke` | string | ✓ | Valid CSS color | Stroke/border color |
| `opacity` | number | ✓ | 0.0 - 1.0 | Transparency level (0 = fully transparent, 1 = fully opaque) |

### Z-Index Layering

The `z-index` property controls element stacking order:

- **z-index: 1** - Background elements (torso, arms, legs)
- **z-index: 2** - Mid-layer elements (head, clothing, accessories)
- **z-index: 3** - Foreground elements (eyes, details)

Elements with higher z-index values are rendered on top of lower values.

---

## Animation Schema

The Animation Schema defines how character elements can be animated over time.

### Full JSON Schema Definition

```json
{
  "type": "object",
  "required": ["targetId", "property", "timeline", "easing", "loop"],
  "properties": {
    "targetId": { "type": "string" },
    "property": { "enum": ["points", "radius", "transform", "color"] },
    "timeline": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["offset", "value"],
        "properties": {
          "offset": { "type": "string" },
          "value": { "oneOf": [{ "type": "string" }, { "type": "number" }] }
        }
      }
    },
    "easing": { "type": "string" },
    "loop": { "type": "boolean" }
  }
}
```

### Field Documentation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetId` | string | ✓ | ID of the element to animate (must match an element's `id` field) |
| `property` | enum | ✓ | Which property to animate: `"points"`, `"radius"`, `"transform"`, or `"color"` |
| `timeline` | array | ✓ | Array of keyframes defining the animation sequence |
| `easing` | string | ✓ | Easing function name (e.g., "easeInOutQuad", "easeInOutSine", "linear") |
| `loop` | boolean | ✓ | Whether the animation should loop continuously |

### Animation Properties

- **`radius`** - Animates the radius of circle elements (numeric values)
- **`points`** - Animates polygon vertices (array of coordinate pairs)
- **`transform`** - Applies CSS transforms like `translateY()`, `scale()`, `rotate()`
- **`color`** - Animates fill or stroke colors

### Keyframe Format

Each keyframe in the `timeline` array:

```json
{
  "offset": "0%",      // Timeline position (0% to 100%)
  "value": 5           // Value at this point (type varies by property)
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `offset` | string | ✓ | Position in timeline as percentage (e.g., "0%", "50%", "100%") |
| `value` | string \| number | ✓ | Target value at this keyframe (number for radius, string for transform/color) |

### Easing Options

Common easing functions supported:

- `linear` - No easing, constant speed
- `easeInOutQuad` - Quadratic ease in and out
- `easeInOutSine` - Sine wave ease in and out
- `easeInOutCubic` - Cubic ease in and out
- `easeInQuad` - Quadratic ease in
- `easeOutQuad` - Quadratic ease out

### Loop and Direction

- **`loop: true`** - Animation repeats indefinitely
- **`loop: false`** - Animation plays once and stops
- Direction can be controlled via the AnimationParams interface (not in schema, but in code):
  - `"normal"` - Forward only
  - `"reverse"` - Backward only
  - `"alternate"` - Forward then backward repeatedly

---

## Validation

The project uses `SchemaValidator.ts` to enforce schema compliance using the [Ajv](https://ajv.js.org/) JSON Schema validator.

### SchemaValidator Class

Located in `src/SchemaValidator.ts`, this class provides validation methods:

```typescript
class SchemaValidator {
  validateCharacterSchema(data: unknown): { valid: boolean; errors: string[] }
  validateAnimationSchema(data: unknown): { valid: boolean; errors: string[] }
  isValidCharacter(data: unknown): data is CharacterSchema
  isValidAnimation(data: unknown): data is AnimationSchema
}
```

### How Validation Works

1. **Schema Compilation**: Ajv compiles the JSON Schema definitions at initialization
2. **Validation**: Data is validated against the compiled schema
3. **Error Reporting**: Invalid data returns detailed error messages with paths to problematic fields
4. **Type Guards**: TypeScript type guards ensure type safety after validation

### Example Validation Usage

```typescript
const validator = new SchemaValidator();

// Validate character
const result = validator.validateCharacterSchema(characterData);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
  // Example error: "/elements/0/coordinates must have required property 'cx'"
}

// Type-safe validation
if (validator.isValidCharacter(data)) {
  // TypeScript now knows 'data' is CharacterSchema
  const elementCount = data.elements.length;
}
```

### Common Validation Errors

- Missing required fields: `"must have required property 'id'"`
- Invalid type: `"must be string"` or `"must be number"`
- Out of range: `"must be >= 0"` or `"must be <= 1"`
- Invalid enum: `"must be equal to one of the allowed values"`
- Invalid structure: `"must match exactly one schema in oneOf"`

---

## Complete Examples

### Example 1: Circle-Only Character (Simple)

A minimalist character composed entirely of circles:

```json
{
  "id": "simple-circle-avatar",
  "version": "1.0",
  "elements": [
    {
      "type": "circle",
      "id": "head",
      "z-index": 2,
      "coordinates": {
        "cx": 200,
        "cy": 100,
        "r": 40
      },
      "style": {
        "fill": "#FFC107",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "circle",
      "id": "eye-left",
      "z-index": 3,
      "coordinates": {
        "cx": 185,
        "cy": 95,
        "r": 6
      },
      "style": {
        "fill": "#212121",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "circle",
      "id": "eye-right",
      "z-index": 3,
      "coordinates": {
        "cx": 215,
        "cy": 95,
        "r": 6
      },
      "style": {
        "fill": "#212121",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "circle",
      "id": "body",
      "z-index": 1,
      "coordinates": {
        "cx": 200,
        "cy": 180,
        "r": 50
      },
      "style": {
        "fill": "#2196F3",
        "stroke": "#000000",
        "opacity": 1
      }
    }
  ]
}
```

### Example 2: Polygon-Only Character

An angular character built with polygons:

```json
{
  "id": "angular-polygon-avatar",
  "version": "1.0",
  "elements": [
    {
      "type": "polygon",
      "id": "head",
      "z-index": 2,
      "coordinates": {
        "points": [
          [170, 70],
          [230, 70],
          [230, 120],
          [200, 130],
          [170, 120]
        ]
      },
      "style": {
        "fill": "#9C27B0",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "polygon",
      "id": "eye-left",
      "z-index": 3,
      "coordinates": {
        "points": [
          [185, 90],
          [195, 90],
          [195, 100],
          [185, 100]
        ]
      },
      "style": {
        "fill": "#FFFFFF",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "polygon",
      "id": "eye-right",
      "z-index": 3,
      "coordinates": {
        "points": [
          [205, 90],
          [215, 90],
          [215, 100],
          [205, 100]
        ]
      },
      "style": {
        "fill": "#FFFFFF",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "polygon",
      "id": "torso",
      "z-index": 1,
      "coordinates": {
        "points": [
          [160, 140],
          [240, 140],
          [250, 250],
          [150, 250]
        ]
      },
      "style": {
        "fill": "#673AB7",
        "stroke": "#000000",
        "opacity": 1
      }
    }
  ]
}
```

### Example 3: Mixed Circle + Polygon Character (Complex)

A detailed character combining both circles and polygons:

```json
{
  "id": "hybrid-complex-avatar",
  "version": "1.0",
  "elements": [
    {
      "type": "circle",
      "id": "head",
      "z-index": 2,
      "coordinates": {
        "cx": 200,
        "cy": 100,
        "r": 35
      },
      "style": {
        "fill": "#FFE0B2",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "polygon",
      "id": "hat",
      "z-index": 3,
      "coordinates": {
        "points": [
          [200, 55],
          [225, 65],
          [225, 75],
          [175, 75],
          [175, 65]
        ]
      },
      "style": {
        "fill": "#E91E63",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "circle",
      "id": "eye-left",
      "z-index": 4,
      "coordinates": {
        "cx": 188,
        "cy": 95,
        "r": 4
      },
      "style": {
        "fill": "#1976D2",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "circle",
      "id": "eye-right",
      "z-index": 4,
      "coordinates": {
        "cx": 212,
        "cy": 95,
        "r": 4
      },
      "style": {
        "fill": "#1976D2",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "polygon",
      "id": "torso",
      "z-index": 1,
      "coordinates": {
        "points": [
          [170, 140],
          [230, 140],
          [240, 240],
          [160, 240]
        ]
      },
      "style": {
        "fill": "#4CAF50",
        "stroke": "#000000",
        "opacity": 0.9
      }
    },
    {
      "type": "polygon",
      "id": "arm-left",
      "z-index": 1,
      "coordinates": {
        "points": [
          [160, 150],
          [145, 150],
          [140, 200],
          [155, 200]
        ]
      },
      "style": {
        "fill": "#66BB6A",
        "stroke": "#000000",
        "opacity": 0.9
      }
    },
    {
      "type": "polygon",
      "id": "arm-right",
      "z-index": 1,
      "coordinates": {
        "points": [
          [240, 150],
          [255, 150],
          [260, 200],
          [245, 200]
        ]
      },
      "style": {
        "fill": "#66BB6A",
        "stroke": "#000000",
        "opacity": 0.9
      }
    },
    {
      "type": "circle",
      "id": "button-1",
      "z-index": 2,
      "coordinates": {
        "cx": 200,
        "cy": 170,
        "r": 3
      },
      "style": {
        "fill": "#FFEB3B",
        "stroke": "#000000",
        "opacity": 1
      }
    },
    {
      "type": "circle",
      "id": "button-2",
      "z-index": 2,
      "coordinates": {
        "cx": 200,
        "cy": 190,
        "r": 3
      },
      "style": {
        "fill": "#FFEB3B",
        "stroke": "#000000",
        "opacity": 1
      }
    }
  ]
}
```

---

## Creating Custom Characters

### Coordinate System

Characters are rendered on a **400×400 pixel canvas**:

```
(0,0) ─────────────────────────── (400,0)
  │                                   │
  │                                   │
  │           Canvas Center           │
  │              (200,200)            │
  │                                   │
  │                                   │
(0,400) ─────────────────────── (400,400)
```

**Key Points:**
- Origin (0,0) is at the top-left corner
- X-axis increases from left to right (0 → 400)
- Y-axis increases from top to bottom (0 → 400)
- Typical avatar center: around (200, 100-150) for head

### Step-by-Step Character Creation

#### 1. Plan Your Design

Sketch out your character and identify components:
- Head (circle or polygon)
- Eyes (usually circles)
- Body/torso (usually polygon)
- Arms, legs, accessories (polygons or circles)

#### 2. Create the Base Structure

Start with the minimal required fields:

```json
{
  "id": "my-custom-avatar",
  "version": "1.0",
  "elements": []
}
```

#### 3. Add Elements from Back to Front

**Rule:** Add elements in z-index order (background first, foreground last)

**Example order:**
1. Background elements (z-index: 1): torso, arms, legs
2. Mid-layer (z-index: 2): head, hats, clothing
3. Foreground (z-index: 3+): eyes, facial features

#### 4. Position Elements

**Head positioning:**
- Place head at y=80-120 for upper positioning
- Typical head radius: 30-40 pixels
- Center x around 200

**Body positioning:**
- Torso typically starts at y=130-150
- Extends down to y=200-250

**Eyes positioning:**
- Space eyes 20-30 pixels apart
- Position 5-10 pixels above head center
- Typical eye radius: 3-6 pixels

#### 5. Layer with Z-Index

**Z-Index Guidelines:**
- **1**: Base body parts (torso, limbs)
- **2**: Head, major features
- **3**: Eyes, important details
- **4+**: Special foreground elements

Lower z-index elements appear behind higher ones.

#### 6. Apply Colors and Opacity

**Color Tips:**
- Use hex colors for consistency (#RRGGBB)
- Black stroke (#000000) provides clear outlines
- Keep opacity at 1.0 for solid shapes
- Use opacity 0.7-0.9 for translucent effects

**Color Harmony:**
- Use complementary colors for contrast
- Limit palette to 3-5 main colors
- Consider the character's personality:
  - Blues/grays: calm, analytical
  - Warm colors: energetic, friendly
  - Dark colors: serious, mysterious

#### 7. Validate Your Character

Always validate using the SchemaValidator:

```typescript
import { SchemaValidator } from './src/SchemaValidator';

const validator = new SchemaValidator();
const result = validator.validateCharacterSchema(myCharacter);

if (!result.valid) {
  console.error('Validation failed:', result.errors);
}
```

### Common Patterns

**Creating a head with eyes:**
```json
[
  {
    "type": "circle",
    "id": "head",
    "z-index": 2,
    "coordinates": { "cx": 200, "cy": 100, "r": 30 },
    "style": { "fill": "#E0E0E0", "stroke": "#000000", "opacity": 1 }
  },
  {
    "type": "circle",
    "id": "eye-left",
    "z-index": 3,
    "coordinates": { "cx": 190, "cy": 95, "r": 5 },
    "style": { "fill": "#1ABC9C", "stroke": "#000000", "opacity": 1 }
  },
  {
    "type": "circle",
    "id": "eye-right",
    "z-index": 3,
    "coordinates": { "cx": 210, "cy": 95, "r": 5 },
    "style": { "fill": "#1ABC9C", "stroke": "#000000", "opacity": 1 }
  }
]
```

**Creating a simple torso:**
```json
{
  "type": "polygon",
  "id": "torso",
  "z-index": 1,
  "coordinates": {
    "points": [
      [180, 140],  // Top-left
      [220, 140],  // Top-right
      [230, 200],  // Bottom-right
      [170, 200]   // Bottom-left
    ]
  },
  "style": { "fill": "#2C3E50", "stroke": "#000000", "opacity": 1 }
}
```

### Best Practices

1. **Naming**: Use descriptive IDs (e.g., "eye-left", "arm-right", "hat")
2. **Consistency**: Keep similar elements aligned and sized proportionally
3. **Simplicity**: Start simple, add complexity gradually
4. **Testing**: Test your character at different sizes and contexts
5. **Documentation**: Comment your design decisions for future reference

---

## Additional Resources

- **TypeScript Types**: See `src/types.ts` for full TypeScript interfaces
- **Validator Implementation**: See `src/SchemaValidator.ts` for validation logic
- **Example Characters**: Browse `public/data/characters/` for more examples
- **Animation Examples**: See `public/data/animations/` for animation definitions
