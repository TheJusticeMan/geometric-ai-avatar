# Vision Technical Documentation

## Overview

This document provides a comprehensive technical deep-dive into the implementation architecture for the geometric-ai-avatar project. It covers the extended character schema design, LLM provider adapters, vision mirror pipeline, rendering systems, and optimization strategies.

## Table of Contents

1. [Extended Character Schema Design](#extended-character-schema-design)
2. [LLM Provider Adapter Interface](#llm-provider-adapter-interface)
3. [Vision Mirror Pipeline](#vision-mirror-pipeline)
4. [SVG Path-Based Anime Rendering](#svg-path-based-anime-rendering)
5. [Expression System Architecture](#expression-system-architecture)
6. [Hair Physics Simulation](#hair-physics-simulation)
7. [Provider Adapter Implementation](#provider-adapter-implementation)
8. [Vision Capture and Encoding](#vision-capture-and-encoding)
9. [Iterative Refinement Algorithm](#iterative-refinement-algorithm)
10. [Cost Optimization Strategies](#cost-optimization-strategies)

---

## Extended Character Schema Design

The new schema format provides a complete, layered approach to avatar construction with full customization support.

### Complete Schema Example

```json
{
  "id": "anime-avatar-001",
  "version": "2.0",
  "style": "standard-anime",
  "metadata": {
    "created": "2024-01-15T10:30:00Z",
    "lastModified": "2024-01-15T14:45:00Z",
    "author": "system",
    "tags": ["anime", "female", "casual"]
  },
  "layers": {
    "base": {
      "body": {
        "torso": {
          "path": "M150,200 Q145,180 150,160 Q155,180 150,200",
          "fill": "#FFE0BD",
          "stroke": "#333",
          "strokeWidth": 2
        },
        "neck": {
          "path": "M145,160 L155,160 L153,140 L147,140 Z",
          "fill": "#FFE0BD",
          "stroke": "#333",
          "strokeWidth": 1.5
        }
      },
      "head": {
        "shape": "oval",
        "center": { "x": 150, "y": 100 },
        "width": 60,
        "height": 70,
        "fill": "#FFE0BD",
        "stroke": "#333",
        "strokeWidth": 2,
        "chin": {
          "path": "M120,115 Q150,135 180,115",
          "style": "pointed"
        }
      },
      "limbs": [
        {
          "type": "arm",
          "side": "left",
          "segments": [
            { "name": "upperArm", "path": "M130,180 L120,220", "width": 8 },
            { "name": "forearm", "path": "M120,220 L115,260", "width": 6 },
            { "name": "hand", "path": "M115,260 L112,275", "width": 8 }
          ],
          "fill": "#FFE0BD",
          "stroke": "#333",
          "strokeWidth": 2
        },
        {
          "type": "arm",
          "side": "right",
          "segments": [
            { "name": "upperArm", "path": "M170,180 L180,220", "width": 8 },
            { "name": "forearm", "path": "M180,220 L185,260", "width": 6 },
            { "name": "hand", "path": "M185,260 L188,275", "width": 8 }
          ],
          "fill": "#FFE0BD",
          "stroke": "#333",
          "strokeWidth": 2
        }
      ]
    },
    "face": {
      "eyes": {
        "left": {
          "type": "anime-large",
          "center": { "x": 135, "y": 95 },
          "width": 18,
          "height": 22,
          "iris": {
            "color": "#4A90E2",
            "radius": 8,
            "highlights": [
              { "x": 3, "y": -3, "radius": 3, "opacity": 0.9 },
              { "x": -2, "y": 4, "radius": 2, "opacity": 0.6 }
            ]
          },
          "pupil": {
            "color": "#000",
            "radius": 4
          },
          "eyelashes": {
            "upper": [
              { "path": "M125,85 Q128,80 131,85", "strokeWidth": 1.5 },
              { "path": "M131,84 Q134,79 137,84", "strokeWidth": 1.5 },
              { "path": "M137,85 Q140,81 143,85", "strokeWidth": 1.5 }
            ],
            "lower": []
          }
        },
        "right": {
          "type": "anime-large",
          "center": { "x": 165, "y": 95 },
          "width": 18,
          "height": 22,
          "iris": {
            "color": "#4A90E2",
            "radius": 8,
            "highlights": [
              { "x": -3, "y": -3, "radius": 3, "opacity": 0.9 },
              { "x": 2, "y": 4, "radius": 2, "opacity": 0.6 }
            ]
          },
          "pupil": {
            "color": "#000",
            "radius": 4
          },
          "eyelashes": {
            "upper": [
              { "path": "M157,85 Q160,80 163,85", "strokeWidth": 1.5 },
              { "path": "M163,84 Q166,79 169,84", "strokeWidth": 1.5 },
              { "path": "M169,85 Q172,81 175,85", "strokeWidth": 1.5 }
            ],
            "lower": []
          }
        }
      },
      "mouth": {
        "type": "closed-smile",
        "center": { "x": 150, "y": 120 },
        "width": 20,
        "path": "M140,120 Q150,125 160,120",
        "fill": "none",
        "stroke": "#D4776E",
        "strokeWidth": 2,
        "teeth": null,
        "tongue": null
      },
      "eyebrows": {
        "left": {
          "path": "M125,82 Q135,80 145,82",
          "stroke": "#4A3428",
          "strokeWidth": 2.5,
          "style": "curved"
        },
        "right": {
          "path": "M155,82 Q165,80 175,82",
          "stroke": "#4A3428",
          "strokeWidth": 2.5,
          "style": "curved"
        }
      },
      "nose": {
        "type": "minimal-anime",
        "path": "M150,105 L152,110",
        "stroke": "#CCA68F",
        "strokeWidth": 1.5
      }
    },
    "hair": {
      "front": [
        {
          "name": "bangs-center",
          "path": "M150,70 Q145,85 140,95 L145,95 Q148,80 150,70",
          "fill": "#8B4513",
          "stroke": "#5C2E0A",
          "strokeWidth": 1.5,
          "zIndex": 10
        },
        {
          "name": "bangs-left",
          "path": "M140,75 Q130,90 125,100 L130,100 Q135,88 140,75",
          "fill": "#8B4513",
          "stroke": "#5C2E0A",
          "strokeWidth": 1.5,
          "zIndex": 9
        },
        {
          "name": "bangs-right",
          "path": "M160,75 Q170,90 175,100 L170,100 Q165,88 160,75",
          "fill": "#8B4513",
          "stroke": "#5C2E0A",
          "strokeWidth": 1.5,
          "zIndex": 9
        }
      ],
      "back": [
        {
          "name": "hair-volume",
          "path": "M120,80 Q115,70 120,60 Q150,55 180,60 Q185,70 180,80 Q150,75 120,80",
          "fill": "#8B4513",
          "stroke": "#5C2E0A",
          "strokeWidth": 2,
          "zIndex": 1
        },
        {
          "name": "hair-tail",
          "path": "M175,100 Q180,130 178,160 Q176,180 175,200",
          "fill": "#8B4513",
          "stroke": "#5C2E0A",
          "strokeWidth": 8,
          "zIndex": 0
        }
      ],
      "physics": {
        "enabled": true,
        "gravity": 0.3,
        "damping": 0.85,
        "stiffness": 0.15,
        "segments": [
          {
            "id": "hair-tail",
            "nodes": [
              { "x": 175, "y": 100, "mass": 1, "fixed": true },
              { "x": 177, "y": 130, "mass": 0.8, "fixed": false },
              { "x": 178, "y": 160, "mass": 0.6, "fixed": false },
              { "x": 176, "y": 180, "mass": 0.4, "fixed": false },
              { "x": 175, "y": 200, "mass": 0.2, "fixed": false }
            ]
          }
        ]
      }
    },
    "clothing": {
      "top": {
        "type": "casual-shirt",
        "path": "M130,180 L120,220 L115,260 L135,260 L140,240 L150,240 L160,240 L165,260 L185,260 L180,220 L170,180 Z",
        "fill": "#FF6B9D",
        "stroke": "#CC5680",
        "strokeWidth": 2,
        "pattern": null,
        "collar": {
          "path": "M140,180 L145,170 L155,170 L160,180",
          "fill": "#FFFFFF",
          "stroke": "#CC5680",
          "strokeWidth": 1.5
        }
      },
      "bottom": {
        "type": "skirt",
        "path": "M135,260 Q150,280 165,260 L165,310 L135,310 Z",
        "fill": "#4A4A4A",
        "stroke": "#2A2A2A",
        "strokeWidth": 2,
        "pleats": [
          { "path": "M140,260 L138,310" },
          { "path": "M145,260 L145,310" },
          { "path": "M155,260 L155,310" },
          { "path": "M160,260 L162,310" }
        ]
      },
      "accessories": [
        {
          "type": "hair-ribbon",
          "position": { "x": 175, "y": 95 },
          "path": "M170,92 Q175,88 180,92 Q175,96 170,92",
          "fill": "#FF6B9D",
          "stroke": "#CC5680",
          "strokeWidth": 1
        }
      ]
    },
    "effects": {
      "blush": {
        "enabled": true,
        "left": {
          "center": { "x": 130, "y": 110 },
          "radius": 8,
          "fill": "#FFB6C1",
          "opacity": 0.5
        },
        "right": {
          "center": { "x": 170, "y": 110 },
          "radius": 8,
          "fill": "#FFB6C1",
          "opacity": 0.5
        }
      },
      "sparkles": {
        "enabled": false,
        "particles": []
      },
      "aura": {
        "enabled": false,
        "color": "#FFD700",
        "intensity": 0
      }
    }
  },
  "expressions": {
    "current": "neutral",
    "presets": {
      "happy": {
        "eyes": {
          "left": { "height": 18, "verticalOffset": -2 },
          "right": { "height": 18, "verticalOffset": -2 }
        },
        "mouth": {
          "type": "open-smile",
          "path": "M140,120 Q150,130 160,120 L160,125 Q150,132 140,125 Z"
        },
        "eyebrows": {
          "left": { "path": "M125,80 Q135,78 145,80" },
          "right": { "path": "M155,80 Q165,78 175,80" }
        },
        "effects": {
          "blush": { "opacity": 0.7 },
          "sparkles": { "enabled": true, "count": 5 }
        }
      },
      "sad": {
        "eyes": {
          "left": { "height": 16, "verticalOffset": 2 },
          "right": { "height": 16, "verticalOffset": 2 }
        },
        "mouth": {
          "type": "frown",
          "path": "M140,125 Q150,120 160,125"
        },
        "eyebrows": {
          "left": { "path": "M125,85 Q135,83 145,85" },
          "right": { "path": "M155,85 Q165,83 175,85" }
        },
        "effects": {
          "blush": { "opacity": 0.3 }
        }
      },
      "angry": {
        "eyes": {
          "left": { "height": 14, "verticalOffset": 0 },
          "right": { "height": 14, "verticalOffset": 0 }
        },
        "mouth": {
          "type": "straight",
          "path": "M140,122 L160,122"
        },
        "eyebrows": {
          "left": { "path": "M125,88 L145,84" },
          "right": { "path": "M175,88 L155,84" }
        },
        "effects": {
          "blush": { "opacity": 0.6, "fill": "#FF6B6B" },
          "aura": { "enabled": true, "color": "#FF0000", "intensity": 0.3 }
        }
      },
      "surprised": {
        "eyes": {
          "left": { "height": 28, "verticalOffset": -3, "width": 22 },
          "right": { "height": 28, "verticalOffset": -3, "width": 22 }
        },
        "mouth": {
          "type": "open-o",
          "path": "M145,120 Q150,128 155,120 Q150,112 145,120"
        },
        "eyebrows": {
          "left": { "path": "M125,75 Q135,72 145,75" },
          "right": { "path": "M155,75 Q165,72 175,75" }
        },
        "effects": {
          "blush": { "opacity": 0.4 }
        }
      }
    }
  },
  "animations": {
    "idle": {
      "duration": 3000,
      "loop": true,
      "keyframes": [
        { "time": 0, "properties": { "body.y": 0 } },
        { "time": 1500, "properties": { "body.y": -5 } },
        { "time": 3000, "properties": { "body.y": 0 } }
      ]
    },
    "blink": {
      "duration": 200,
      "loop": false,
      "keyframes": [
        { "time": 0, "properties": { "eyes.height": 22 } },
        { "time": 100, "properties": { "eyes.height": 2 } },
        { "time": 200, "properties": { "eyes.height": 22 } }
      ]
    }
  }
}
```

### Schema Components

**Layers**: Organized into distinct rendering layers (base, face, hair, clothing, effects) with proper z-index management.

**Expressions**: Preset system allowing quick emotion switching with granular control over facial features.

**Physics**: Integrated physics properties for dynamic hair and clothing movement.

**Metadata**: Versioning and attribution support for schema evolution.

---

## LLM Provider Adapter Interface

The provider adapter system enables seamless integration with multiple LLM backends while maintaining consistent behavior.

### Core Interface Definition

```typescript
interface LLMProviderAdapter {
  name: string;
  supportsVision: boolean;
  supportsStreaming: boolean;
  
  sendMessage(messages: Message[], options: RequestOptions): Promise<Response>;
  sendMessageStream(messages: Message[], options: RequestOptions): AsyncIterable<StreamChunk>;
  sendVisionRequest(image: string, prompt: string, options: RequestOptions): Promise<Response>;
  
  estimateCost(tokens: number): number;
  validateApiKey(key: string): Promise<boolean>;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | MultimodalContent[];
}

interface MultimodalContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

interface RequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

interface Response {
  content: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, unknown>;
}

interface StreamChunk {
  delta: string;
  finishReason?: 'stop' | 'length' | 'content_filter';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

### Provider-Specific Implementations

**OpenAI Adapter**:
- Uses `/v1/chat/completions` endpoint
- Supports GPT-4 Vision via `image_url` content type
- Streaming via Server-Sent Events
- Token counting via tiktoken library

**Anthropic Adapter**:
- Uses Claude Messages API
- Vision support via base64 image content
- Streaming with event-stream responses
- Custom token estimation based on character count

**Google Gemini Adapter**:
- Uses Gemini API with inline data
- Native multimodal support
- Streaming via generateContentStream
- Token counting via countTokens endpoint

---

## Vision Mirror Pipeline

The vision mirror system creates a feedback loop between the avatar rendering and LLM vision capabilities.

### Pipeline Flow

```
┌──────────┐    ┌───────────┐    ┌──────────────┐    ┌───────────┐    ┌──────────┐
│ SVG DOM  │───▶│ Capture   │───▶│ Base64 PNG   │───▶│ Vision    │───▶│ Feedback │
│ (avatar) │    │ (canvas)  │    │ (screenshot) │    │ LLM API   │    │ (JSON)   │
└──────────┘    └───────────┘    └──────────────┘    └───────────┘    └──────────┘
                                                                            │
                                                                            ▼
                                                                     ┌──────────┐
                                                                     │ Apply    │
                                                                     │ Changes  │──▶ (loop)
                                                                     └──────────┘
```

### Stage Descriptions

1. **SVG DOM**: Current avatar state rendered as SVG in the browser
2. **Capture**: Convert SVG to raster image using HTML Canvas API
3. **Base64 PNG**: Encode image for LLM API transmission
4. **Vision LLM API**: Send image with prompt to vision-capable model
5. **Feedback**: Receive structured JSON with suggested modifications
6. **Apply Changes**: Update avatar schema based on feedback
7. **Loop**: Repeat until convergence or iteration limit

### Implementation Details

**Capture Process**:
```typescript
async function captureSVGAsImage(svgElement: SVGElement): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const img = new Image();
  
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      const base64 = canvas.toDataURL('image/png').split(',')[1];
      resolve(base64);
    };
    img.onerror = reject;
    img.src = url;
  });
}
```

---

## SVG Path-Based Anime Rendering

The rendering engine uses SVG paths and shapes to create stylized anime-style avatars with clean vector graphics.

### Path Construction

**Bezier Curves for Organic Shapes**:
```typescript
// Eye shape with quadratic bezier curves
const eyePath = `
  M ${cx - width/2},${cy}
  Q ${cx - width/2},${cy - height/2} ${cx},${cy - height/2}
  Q ${cx + width/2},${cy - height/2} ${cx + width/2},${cy}
  Q ${cx + width/2},${cy + height/2} ${cx},${cy + height/2}
  Q ${cx - width/2},${cy + height/2} ${cx - width/2},${cy}
  Z
`;

// Hair strand with cubic bezier
const hairStrand = `
  M ${startX},${startY}
  C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}
`;
```

### Layering and Z-Index

Rendering order (back to front):
1. Background effects (aura, glow)
2. Back hair
3. Body (neck, torso)
4. Arms (back arm)
5. Clothing (back layer)
6. Head base
7. Face features (nose, mouth, eyes)
8. Eyebrows
9. Front hair (bangs)
10. Clothing (front layer)
11. Accessories
12. Foreground effects (sparkles, particles)

### Stroke and Fill Management

**Anime-style outlines**:
- Consistent stroke width (1.5-2.5px) for uniform appearance
- Darker strokes on lighter fills for contrast
- Strategic stroke removal for softer features (blush, highlights)

**Color Palette**:
- Skin tones: #FFE0BD to #8D5524
- Hair: Wide spectrum with darker strokes
- Eyes: Vibrant colors with gradient overlays
- Clothing: Complementary color schemes

---

## Expression System Architecture

Expressions are applied as delta transformations on the base avatar schema, enabling smooth transitions and blending.

### Expression Application Algorithm

```typescript
function applyExpression(
  baseAvatar: AvatarSchema,
  expression: Expression
): AvatarSchema {
  const result = deepClone(baseAvatar);
  
  // Morph eyes
  if (expression.eyes) {
    result.layers.face.eyes.left = {
      ...result.layers.face.eyes.left,
      ...expression.eyes.left,
      center: {
        x: result.layers.face.eyes.left.center.x,
        y: result.layers.face.eyes.left.center.y + 
           (expression.eyes.left.verticalOffset || 0)
      }
    };
    // Similar for right eye
  }
  
  // Morph mouth
  if (expression.mouth) {
    result.layers.face.mouth = {
      ...result.layers.face.mouth,
      ...expression.mouth
    };
  }
  
  // Update eyebrows
  if (expression.eyebrows) {
    result.layers.face.eyebrows = {
      ...result.layers.face.eyebrows,
      ...expression.eyebrows
    };
  }
  
  // Apply effects
  if (expression.effects) {
    result.layers.effects = mergeEffects(
      result.layers.effects,
      expression.effects
    );
  }
  
  return result;
}
```

### Expression Blending

Support for interpolating between expressions:

```typescript
function blendExpressions(
  expr1: Expression,
  expr2: Expression,
  t: number // 0 to 1
): Expression {
  return {
    eyes: {
      left: {
        height: lerp(expr1.eyes.left.height, expr2.eyes.left.height, t),
        verticalOffset: lerp(
          expr1.eyes.left.verticalOffset,
          expr2.eyes.left.verticalOffset,
          t
        )
      },
      right: { /* similar */ }
    },
    mouth: {
      path: interpolatePath(expr1.mouth.path, expr2.mouth.path, t)
    },
    // ... other features
  };
}
```

---

## Hair Physics Simulation

Dynamic hair movement using spring-based physics with Verlet integration.

### Physics Model

**Node-Based System**:
Each hair strand is a chain of connected nodes with mass and constraints.

```typescript
interface PhysicsNode {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  mass: number;
  fixed: boolean;
}

interface Constraint {
  nodeA: number;
  nodeB: number;
  restLength: number;
  stiffness: number;
}
```

### Simulation Loop

```typescript
function updateHairPhysics(
  nodes: PhysicsNode[],
  constraints: Constraint[],
  deltaTime: number,
  params: PhysicsParams
): void {
  // Apply forces (gravity, wind)
  for (const node of nodes) {
    if (node.fixed) continue;
    
    const velocityX = (node.x - node.prevX) * params.damping;
    const velocityY = (node.y - node.prevY) * params.damping;
    
    node.prevX = node.x;
    node.prevY = node.y;
    
    node.x += velocityX;
    node.y += velocityY + params.gravity * deltaTime;
  }
  
  // Satisfy constraints (multiple iterations for stability)
  for (let iter = 0; iter < 3; iter++) {
    for (const constraint of constraints) {
      const nodeA = nodes[constraint.nodeA];
      const nodeB = nodes[constraint.nodeB];
      
      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const diff = (constraint.restLength - dist) / dist;
      
      const offsetX = dx * diff * constraint.stiffness;
      const offsetY = dy * diff * constraint.stiffness;
      
      if (!nodeA.fixed) {
        nodeA.x -= offsetX * 0.5;
        nodeA.y -= offsetY * 0.5;
      }
      if (!nodeB.fixed) {
        nodeB.x += offsetX * 0.5;
        nodeB.y += offsetY * 0.5;
      }
    }
  }
}
```

### Path Reconstruction

Convert physics nodes back to SVG paths:

```typescript
function nodesToPath(nodes: PhysicsNode[]): string {
  if (nodes.length < 2) return '';
  
  let path = `M ${nodes[0].x},${nodes[0].y}`;
  
  for (let i = 1; i < nodes.length; i++) {
    if (i === nodes.length - 1) {
      path += ` L ${nodes[i].x},${nodes[i].y}`;
    } else {
      // Smooth with quadratic bezier
      const midX = (nodes[i].x + nodes[i + 1].x) / 2;
      const midY = (nodes[i].y + nodes[i + 1].y) / 2;
      path += ` Q ${nodes[i].x},${nodes[i].y} ${midX},${midY}`;
    }
  }
  
  return path;
}
```

---

## Provider Adapter Implementation

### Factory Pattern

```typescript
class LLMProviderFactory {
  private static adapters = new Map<string, typeof LLMProviderAdapter>();
  
  static register(name: string, adapter: typeof LLMProviderAdapter): void {
    this.adapters.set(name, adapter);
  }
  
  static create(name: string, apiKey: string): LLMProviderAdapter {
    const AdapterClass = this.adapters.get(name);
    if (!AdapterClass) {
      throw new Error(`Unknown provider: ${name}`);
    }
    return new AdapterClass(apiKey);
  }
  
  static listProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
}

// Register providers
LLMProviderFactory.register('openai', OpenAIAdapter);
LLMProviderFactory.register('anthropic', AnthropicAdapter);
LLMProviderFactory.register('gemini', GeminiAdapter);
```

### Error Handling and Retry Logic

```typescript
abstract class BaseLLMAdapter implements LLMProviderAdapter {
  protected async requestWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }
}
```

---

## Vision Capture and Encoding

### Optimization Strategies

**Resolution Control**:
- Reduce resolution for preliminary iterations (512x512)
- Use high resolution (1024x1024) for final validation
- Balance between image quality and API costs

**Compression**:
```typescript
async function captureOptimized(
  svgElement: SVGElement,
  quality: 'low' | 'medium' | 'high'
): Promise<string> {
  const resolutions = { low: 512, medium: 768, high: 1024 };
  const jpegQuality = { low: 0.7, medium: 0.85, high: 0.95 };
  
  const size = resolutions[quality];
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  // ... render SVG to canvas ...
  
  return canvas.toDataURL('image/jpeg', jpegQuality[quality]).split(',')[1];
}
```

**Caching**:
- Cache rendered images with schema hash as key
- Skip re-capture if schema unchanged
- Invalidate cache on manual edits

---

## Iterative Refinement Algorithm

### Convergence Strategy

```typescript
interface RefinementConfig {
  maxIterations: number;
  convergenceThreshold: number;
  initialQuality: 'low' | 'medium' | 'high';
  finalQuality: 'high';
}

async function refineAvatar(
  initialAvatar: AvatarSchema,
  targetDescription: string,
  config: RefinementConfig
): Promise<AvatarSchema> {
  let currentAvatar = initialAvatar;
  let previousScore = 0;
  
  for (let iteration = 0; iteration < config.maxIterations; iteration++) {
    // Capture current state
    const quality = iteration === config.maxIterations - 1 
      ? config.finalQuality 
      : config.initialQuality;
    const image = await captureAvatar(currentAvatar, quality);
    
    // Get vision feedback
    const feedback = await getVisionFeedback(image, targetDescription);
    
    // Check convergence
    if (Math.abs(feedback.score - previousScore) < config.convergenceThreshold) {
      console.log(`Converged after ${iteration + 1} iterations`);
      break;
    }
    
    // Apply modifications
    currentAvatar = applyModifications(currentAvatar, feedback.modifications);
    previousScore = feedback.score;
    
    // Progress callback
    onProgress?.(iteration + 1, config.maxIterations, feedback.score);
  }
  
  return currentAvatar;
}
```

### Modification Application

```typescript
interface Modification {
  path: string; // JSON path to property (e.g., "layers.face.eyes.left.iris.color")
  value: unknown;
  reason: string;
}

function applyModifications(
  avatar: AvatarSchema,
  modifications: Modification[]
): AvatarSchema {
  const result = deepClone(avatar);
  
  for (const mod of modifications) {
    try {
      setValueAtPath(result, mod.path, mod.value);
      console.log(`Applied: ${mod.reason}`);
    } catch (error) {
      console.warn(`Failed to apply modification at ${mod.path}:`, error);
    }
  }
  
  return result;
}
```

---

## Cost Optimization Strategies

### Token Usage Minimization

**Prompt Engineering**:
- Use concise system prompts
- Request structured JSON output to reduce verbosity
- Implement prompt caching for repeated instructions

**Image Optimization**:
- Start with low-detail images (`detail: 'low'`)
- Progressive enhancement only when needed
- Crop to relevant regions (face focus vs. full body)

### Cost Estimation

```typescript
interface CostEstimate {
  promptTokens: number;
  imageTokens: number;
  completionTokens: number;
  totalCost: number;
  breakdown: {
    text: number;
    vision: number;
  };
}

function estimateIterationCost(
  provider: LLMProviderAdapter,
  imageSize: number,
  promptLength: number,
  iterations: number
): CostEstimate {
  const imageTokens = calculateImageTokens(imageSize);
  const promptTokens = estimateTokens(promptLength);
  const completionTokens = 500; // Average response size
  
  const perIterationCost = 
    provider.estimateCost(promptTokens + completionTokens) +
    provider.estimateCost(imageTokens);
  
  return {
    promptTokens: promptTokens * iterations,
    imageTokens: imageTokens * iterations,
    completionTokens: completionTokens * iterations,
    totalCost: perIterationCost * iterations,
    breakdown: {
      text: provider.estimateCost(promptTokens + completionTokens) * iterations,
      vision: provider.estimateCost(imageTokens) * iterations
    }
  };
}
```

### Batching and Parallelization

**Multi-aspect Analysis**:
Send single image with multiple questions to reduce API calls:

```typescript
const prompt = `Analyze this avatar and provide feedback on:
1. Face proportions and symmetry
2. Color palette harmony
3. Hair style accuracy
4. Clothing fit and style
5. Overall aesthetic quality

Return JSON with separate sections for each aspect.`;
```

**Parallel Processing**:
- Generate multiple variants simultaneously
- Use different providers in parallel for comparison
- A/B test modifications before applying

### Caching Strategy

```typescript
class VisionCache {
  private cache = new Map<string, CachedResponse>();
  
  async getOrFetch(
    imageHash: string,
    prompt: string,
    fetcher: () => Promise<Response>
  ): Promise<Response> {
    const key = `${imageHash}:${hashPrompt(prompt)}`;
    
    if (this.cache.has(key)) {
      const cached = this.cache.get(key)!;
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour
        return cached.response;
      }
    }
    
    const response = await fetcher();
    this.cache.set(key, { response, timestamp: Date.now() });
    return response;
  }
}
```

---

## Performance Considerations

### Rendering Optimization

**Virtual DOM for Avatar Updates**:
- Only re-render changed components
- Batch DOM updates using requestAnimationFrame
- Use CSS transforms for animations instead of attribute changes

**Web Workers for Physics**:
- Offload physics calculations to worker threads
- Parallel processing for multiple hair strands
- Transfer results back for rendering

### Memory Management

**Schema Versioning**:
- Track schema changes with structural sharing
- Avoid deep clones when possible
- Use immutable data structures for undo/redo

**Garbage Collection**:
- Release canvas contexts after capture
- Revoke object URLs promptly
- Clear animation frames when expressions change

---

## Testing Strategy

### Unit Tests
- Schema validation and transformation
- Expression blending algorithms
- Physics simulation accuracy
- Provider adapter contracts

### Integration Tests
- End-to-end vision mirror pipeline
- Multi-provider compatibility
- Cost estimation accuracy
- Refinement convergence

### Visual Regression Tests
- Screenshot comparison for expressions
- Animation frame validation
- Cross-browser rendering consistency

---

## Future Enhancements

1. **Real-time Collaboration**: Multiple users editing same avatar with conflict resolution
2. **3D Avatar Support**: Extend schema for Three.js/WebGL rendering
3. **Voice-Driven Expressions**: Lip-sync and emotion detection from audio
4. **Style Transfer**: Apply artistic styles to existing avatars
5. **Accessibility**: Screen reader support, keyboard navigation, high-contrast modes
6. **Export Formats**: SVG, PNG, GIF, video animations, VRM for VR/AR

---

## Conclusion

This technical architecture provides a comprehensive foundation for building an advanced AI-powered avatar system. The modular design allows for incremental implementation, with clear interfaces between components enabling parallel development and future extensibility.

Key technical innovations:
- **Layered schema design** for maximum flexibility
- **Provider-agnostic LLM integration** for vendor independence
- **Vision-driven refinement** for unprecedented customization
- **Physics-based animations** for lifelike movement
- **Cost-optimized API usage** for sustainable operation

The system balances technical sophistication with practical implementation concerns, ensuring both powerful capabilities and maintainable code.
