import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LLMBridge } from '../src/LLMBridge';
import { ProviderRegistry } from '../src/llm/ProviderRegistry';
import { OpenAIAdapter } from '../src/llm/OpenAIAdapter';
import type { CharacterSchema } from '../src/types';
import type { LLMMessage } from '../src/llm/LLMProviderAdapter';

describe('LLMBridge', () => {
  let bridge: LLMBridge;

  beforeEach(() => {
    bridge = new LLMBridge();
    vi.clearAllMocks();
  });

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

  describe('setProviderRegistry', () => {
    it('should set the provider registry', () => {
      const registry = new ProviderRegistry();
      expect(() => bridge.setProviderRegistry(registry)).not.toThrow();
    });
  });

  describe('sendToLLM', () => {
    it('should send messages to LLM via provider', async () => {
      const registry = new ProviderRegistry();
      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendMessage = vi.fn().mockResolvedValue({
        content: 'Response from LLM',
        model: 'gpt-4o-mini',
      });

      registry.register('openai', mockAdapter);
      bridge.setProviderRegistry(registry);

      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      const response = await bridge.sendToLLM(messages, 'openai');

      expect(response.content).toBe('Response from LLM');
      expect(mockAdapter.sendMessage).toHaveBeenCalled();
    });

    it('should throw error if registry not set', async () => {
      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];

      await expect(bridge.sendToLLM(messages, 'openai')).rejects.toThrow(
        'Provider registry not set'
      );
    });

    it('should throw error if provider not found', async () => {
      const registry = new ProviderRegistry();
      bridge.setProviderRegistry(registry);

      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];

      await expect(bridge.sendToLLM(messages, 'nonexistent')).rejects.toThrow(
        'Provider nonexistent not found'
      );
    });

    it('should add messages to conversation history', async () => {
      const registry = new ProviderRegistry();
      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendMessage = vi.fn().mockResolvedValue({
        content: 'Response',
        model: 'gpt-4o-mini',
      });

      registry.register('openai', mockAdapter);
      bridge.setProviderRegistry(registry);

      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      await bridge.sendToLLM(messages, 'openai');

      const history = bridge.getConversationHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history.some(m => m.content === 'Hello')).toBe(true);
      expect(history.some(m => m.content === 'Response')).toBe(true);
    });
  });

  describe('modifyCharacterViaLLM', () => {
    it('should modify character using LLM', async () => {
      const registry = new ProviderRegistry();
      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendMessage = vi.fn().mockResolvedValue({
        content: `\`\`\`json
{
  "id": "test-avatar",
  "version": "1.0",
  "elements": [
    {
      "type": "circle",
      "id": "head",
      "z-index": 1,
      "coordinates": { "cx": 200, "cy": 200, "r": 60 },
      "style": { "fill": "#FF0000", "stroke": "#000000", "opacity": 1 }
    }
  ]
}
\`\`\``,
        model: 'gpt-4o-mini',
      });

      registry.register('openai', mockAdapter);
      bridge.setProviderRegistry(registry);

      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: [],
      };

      const result = await bridge.modifyCharacterViaLLM(
        character,
        'Make the head bigger',
        'openai',
        'Current state'
      );

      expect(result.character).not.toBeNull();
      expect(result.character?.elements).toHaveLength(1);
      expect(result.message).toContain('successfully');
    });

    it('should handle LLM errors', async () => {
      const registry = new ProviderRegistry();
      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendMessage = vi.fn().mockRejectedValue(new Error('API error'));

      registry.register('openai', mockAdapter);
      bridge.setProviderRegistry(registry);

      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: [],
      };

      const result = await bridge.modifyCharacterViaLLM(
        character,
        'Make changes',
        'openai',
        'State'
      );

      expect(result.character).toBeNull();
      expect(result.message).toContain('LLM request failed');
    });
  });

  describe('conversation history', () => {
    it('should get and clear conversation history', async () => {
      const registry = new ProviderRegistry();
      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendMessage = vi.fn().mockResolvedValue({
        content: 'Response',
        model: 'gpt-4o-mini',
      });

      registry.register('openai', mockAdapter);
      bridge.setProviderRegistry(registry);

      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      await bridge.sendToLLM(messages, 'openai');

      expect(bridge.getConversationHistory().length).toBeGreaterThan(0);

      bridge.clearHistory();
      expect(bridge.getConversationHistory()).toHaveLength(0);
    });
  });
});
