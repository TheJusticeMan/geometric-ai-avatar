import type { CharacterSchema } from './types';
import { SchemaValidator } from './SchemaValidator';

export class LLMBridge {
  private validator: SchemaValidator;

  constructor() {
    this.validator = new SchemaValidator();
  }

  // Generate the system prompt that teaches the LLM about the avatar system
  generateSystemPrompt(currentState: string, characterSchema: CharacterSchema): string {
    return `# Geometric AI Avatar System

You are helping to modify a JSON-driven SVG avatar system. The avatar is composed entirely of geometric primitives: circles and polygons.

## Current Avatar State

\`\`\`
${currentState}
\`\`\`

## Current Character JSON

\`\`\`json
${JSON.stringify(characterSchema, null, 2)}
\`\`\`

## Character Schema Format

The avatar is defined by a JSON schema with the following structure:

\`\`\`json
{
  "id": "string",
  "version": "1.0",
  "elements": [
    {
      "type": "circle" | "polygon",
      "id": "unique-id",
      "z-index": number,
      "coordinates": { "cx": number, "cy": number, "r": number } | { "points": [[x,y], [x,y], ...] },
      "style": { "fill": "hex-color", "stroke": "hex-color", "opacity": 0-1 }
    }
  ]
}
\`\`\`

## Geometric Primitives

**Circle Elements:**
- Type: "circle"
- Coordinates: { cx, cy, r } where cx/cy is center position and r is radius
- Common uses: head, eyes, nose

**Polygon Elements:**
- Type: "polygon"
- Coordinates: { points: [[x1,y1], [x2,y2], ...] } array of vertex coordinates
- Common uses: torso, mouth, limbs

## Coordinate System

- Canvas size: 400x400 pixels
- Origin: top-left (0, 0)
- Center: (200, 200)
- Valid range: 0-400 for both x and y

## Modification Guidelines

1. **Preserve Structure:** Keep the same id, version, and element IDs
2. **Maintain Proportions:** Ensure elements remain visually cohesive
3. **Valid Colors:** Use hex format (#RRGGBB) for fill and stroke
4. **Opacity Range:** Keep opacity between 0 and 1
5. **Z-Index:** Higher z-index appears in front

## Example Modifications

**Make eyes larger:**
\`\`\`json
{
  "id": "avatar-001",
  "version": "1.0",
  "elements": [
    {
      "type": "circle",
      "id": "left-eye",
      "z-index": 3,
      "coordinates": { "cx": 170, "cy": 180, "r": 8 },  // increased radius from 5 to 8
      "style": { "fill": "#2C3E50", "stroke": "#34495E", "opacity": 1 }
    }
  ]
}
\`\`\`

**Change color scheme:**
\`\`\`json
{
  "type": "circle",
  "id": "head",
  "coordinates": { "cx": 200, "cy": 200, "r": 80 },
  "style": { 
    "fill": "#3498DB",      // changed from original color
    "stroke": "#2980B9",    // changed from original color
    "opacity": 1 
  }
}
\`\`\`

## Response Format

When responding with a character modification, wrap your JSON in a markdown code fence:

\`\`\`json
{
  "id": "avatar-001",
  "version": "1.0",
  "elements": [ ... ]
}
\`\`\`

Include a brief explanation of what you changed and why.`;
  }

  // Generate a user prompt that includes the mirror state and a user request
  generateUserPrompt(mirrorOutput: string, userMessage: string): string {
    return `${userMessage}

Current avatar state for reference:
\`\`\`
${mirrorOutput}
\`\`\`

Please provide the complete modified character JSON wrapped in \`\`\`json code fence.`;
  }

  // Parse an LLM response to extract a CharacterSchema JSON update
  parseResponse(response: string): { character: CharacterSchema | null; message: string } {
    try {
      // Extract JSON from markdown code fences
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      
      if (!jsonMatch) {
        return {
          character: null,
          message: 'No JSON code fence found in response. Please ensure the response contains ```json ... ```'
        };
      }

      const jsonString = jsonMatch[1].trim();
      const parsedJSON = JSON.parse(jsonString);

      // Validate against character schema
      const validation = this.validator.validateCharacterSchema(parsedJSON);
      
      if (!validation.valid) {
        return {
          character: null,
          message: `Invalid character schema:\n${validation.errors.join('\n')}`
        };
      }

      return {
        character: parsedJSON as CharacterSchema,
        message: 'Character JSON successfully parsed and validated!'
      };
    } catch (error) {
      return {
        character: null,
        message: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Get the full system prompt as copyable text (for manual LLM use)
  getFullPromptForCopy(mirrorOutput: string, userMessage: string): string {
    const systemPrompt = this.generateSystemPrompt(mirrorOutput, JSON.parse(mirrorOutput) as CharacterSchema);
    const userPrompt = this.generateUserPrompt(mirrorOutput, userMessage);
    
    return `${systemPrompt}\n\n---\n\n${userPrompt}`;
  }
}
