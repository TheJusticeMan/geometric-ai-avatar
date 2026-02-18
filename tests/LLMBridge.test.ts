import { describe, it, expect } from 'vitest';
import { LLMBridge } from '../src/LLMBridge';
import type { CharacterSchema } from '../src/types';

describe('LLMBridge', () => {
  const bridge = new LLMBridge();

  describe('parseResponse', () => {
    it('should parse valid JSON from markdown code fence', () => {
      const validResponse = `Here's the updated character:

\`\`\`json
{
  "id": "avatar-001",
  "version": "1.0",
  "elements": [
    {
      "type": "circle",
      "id": "head",
      "z-index": 1,
      "coordinates": { "cx": 200, "cy": 200, "r": 50 },
      "style": { "fill": "#FF0000", "stroke": "#000000", "opacity": 1 }
    }
  ]
}
\`\`\`

I made the head red!`;

      const result = bridge.parseResponse(validResponse);
      expect(result.character).not.toBeNull();
      expect(result.character?.id).toBe('avatar-001');
      expect(result.character?.elements).toHaveLength(1);
      expect(result.message).toContain('successfully');
    });

    it('should handle invalid JSON syntax', () => {
      const invalidResponse = `\`\`\`json
{
  "id": "avatar-001",
  "version": "1.0",
  "elements": [
    // Invalid JSON with comments
  ]
}
\`\`\``;

      const result = bridge.parseResponse(invalidResponse);
      expect(result.character).toBeNull();
      expect(result.message).toContain('Failed to parse JSON');
    });

    it('should handle missing code fence', () => {
      const noFenceResponse = `I updated the character but forgot to wrap it in a code fence!
      
      {"id": "avatar-001", "version": "1.0", "elements": []}`;

      const result = bridge.parseResponse(noFenceResponse);
      expect(result.character).toBeNull();
      expect(result.message).toContain('No JSON code fence found');
    });

    it('should reject valid JSON that fails schema validation', () => {
      const invalidSchemaResponse = `\`\`\`json
{
  "id": "avatar-001",
  "version": "1.0"
}
\`\`\``;

      const result = bridge.parseResponse(invalidSchemaResponse);
      expect(result.character).toBeNull();
      expect(result.message).toContain('Invalid character schema');
    });
  });

  describe('generateSystemPrompt', () => {
    it('should generate a comprehensive system prompt', () => {
      const currentState = 'Test state';
      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: []
      };

      const prompt = bridge.generateSystemPrompt(currentState, character);
      
      expect(prompt).toContain('Geometric AI Avatar System');
      expect(prompt).toContain(currentState);
      expect(prompt).toContain('test-avatar');
      expect(prompt).toContain('Character Schema Format');
    });
  });

  describe('generateUserPrompt', () => {
    it('should generate a user prompt with mirror output', () => {
      const mirrorOutput = 'Avatar is neutral';
      const userMessage = 'Make the eyes bigger';

      const prompt = bridge.generateUserPrompt(mirrorOutput, userMessage);
      
      expect(prompt).toContain(userMessage);
      expect(prompt).toContain(mirrorOutput);
      expect(prompt).toContain('```json');
    });
  });
});
