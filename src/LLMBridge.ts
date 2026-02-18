import type { CharacterSchema, AnyCharacterSchema } from './types';
import { SchemaValidator } from './SchemaValidator';
import type { ProviderRegistry } from './llm/ProviderRegistry';
import type {
  LLMMessage,
  LLMRequestOptions,
  LLMResponse,
  LLMStreamChunk,
} from './llm/LLMProviderAdapter';

export class LLMBridge {
  private validator: SchemaValidator;
  private registry?: ProviderRegistry;
  private conversationHistory: LLMMessage[] = [];

  constructor() {
    this.validator = new SchemaValidator();
  }

  /**
   * Set the provider registry for direct API calls
   */
  setProviderRegistry(registry: ProviderRegistry): void {
    this.registry = registry;
  }

  // Generate the system prompt that teaches the LLM about the avatar system
  generateSystemPrompt(currentState: string, characterSchema: AnyCharacterSchema): string {
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
      "coordinates": { "cx": 170, "cy": 180, "r": 8 },
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
    "fill": "#3498DB",
    "stroke": "#2980B9",
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
  getFullPromptForCopy(mirrorOutput: string, character: AnyCharacterSchema, userMessage: string = ''): string {
    const systemPrompt = this.generateSystemPrompt(mirrorOutput, character);
    
    if (userMessage) {
      const userPrompt = this.generateUserPrompt(mirrorOutput, userMessage);
      return `${systemPrompt}\n\n---\n\n${userPrompt}`;
    }
    
    return `${systemPrompt}\n\n---\n\nPlease modify this avatar as requested by the user.`;
  }

  /**
   * Send messages directly to an LLM via API
   */
  async sendToLLM(
    messages: LLMMessage[],
    providerName: string,
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    if (!this.registry) {
      throw new Error('Provider registry not set. Call setProviderRegistry() first.');
    }

    const provider = this.registry.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found in registry`);
    }

    const requestOptions: LLMRequestOptions = {
      model: options?.model || provider.availableModels[0],
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      stream: false,
    };

    const response = await provider.sendMessage(messages, requestOptions);

    // Store in conversation history
    this.conversationHistory.push(...messages);
    this.conversationHistory.push({
      role: 'assistant',
      content: response.content,
    });

    return response;
  }

  /**
   * Send messages directly to an LLM via API with streaming
   */
  async *sendToLLMStream(
    messages: LLMMessage[],
    providerName: string,
    options?: LLMRequestOptions
  ): AsyncIterable<LLMStreamChunk> {
    if (!this.registry) {
      throw new Error('Provider registry not set. Call setProviderRegistry() first.');
    }

    const provider = this.registry.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found in registry`);
    }

    if (!provider.supportsStreaming) {
      throw new Error(`Provider ${providerName} does not support streaming`);
    }

    const requestOptions: LLMRequestOptions = {
      model: options?.model || provider.availableModels[0],
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      stream: true,
    };

    let fullResponse = '';

    for await (const chunk of provider.sendMessageStream(messages, requestOptions)) {
      fullResponse += chunk.content;
      yield chunk;
    }

    // Store in conversation history
    this.conversationHistory.push(...messages);
    this.conversationHistory.push({
      role: 'assistant',
      content: fullResponse,
    });
  }

  /**
   * High-level method to modify character via LLM
   */
  async modifyCharacterViaLLM(
    character: AnyCharacterSchema,
    instruction: string,
    providerName: string,
    mirrorOutput: string,
    options?: LLMRequestOptions
  ): Promise<{ character: AnyCharacterSchema | null; message: string }> {
    const systemPrompt = this.generateSystemPrompt(mirrorOutput, character);
    const userPrompt = this.generateUserPrompt(mirrorOutput, instruction);

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const response = await this.sendToLLM(messages, providerName, options);
      return this.parseResponse(response.content);
    } catch (error) {
      return {
        character: null,
        message: `LLM request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): LLMMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }
}
