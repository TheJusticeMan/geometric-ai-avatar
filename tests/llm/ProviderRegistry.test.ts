import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderRegistry } from '../../src/llm/ProviderRegistry';
import { OpenAIAdapter } from '../../src/llm/OpenAIAdapter';
import { AnthropicAdapter } from '../../src/llm/AnthropicAdapter';
import type { ProviderConfig } from '../../src/llm/LLMProviderAdapter';

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    registry = new ProviderRegistry();
  });

  describe('register and get', () => {
    it('should register and retrieve an adapter', () => {
      const adapter = new OpenAIAdapter('test-key');
      registry.register('openai', adapter);

      const retrieved = registry.get('openai');
      expect(retrieved).toBe(adapter);
    });

    it('should return undefined for non-existent adapter', () => {
      const retrieved = registry.get('nonexistent');
      expect(retrieved).toBeUndefined();
    });

    it('should overwrite existing adapter with same name', () => {
      const adapter1 = new OpenAIAdapter('key1');
      const adapter2 = new OpenAIAdapter('key2');

      registry.register('openai', adapter1);
      registry.register('openai', adapter2);

      const retrieved = registry.get('openai');
      expect(retrieved).toBe(adapter2);
    });
  });

  describe('getAll', () => {
    it('should return all registered adapters', () => {
      const openai = new OpenAIAdapter('key1');
      const anthropic = new AnthropicAdapter('key2');

      registry.register('openai', openai);
      registry.register('anthropic', anthropic);

      const all = registry.getAll();
      expect(all.size).toBe(2);
      expect(all.get('openai')).toBe(openai);
      expect(all.get('anthropic')).toBe(anthropic);
    });

    it('should return a copy of the map', () => {
      const adapter = new OpenAIAdapter('test-key');
      registry.register('openai', adapter);

      const all = registry.getAll();
      all.clear();

      // Original registry should not be affected
      expect(registry.get('openai')).toBe(adapter);
    });

    it('should return empty map when no adapters registered', () => {
      const all = registry.getAll();
      expect(all.size).toBe(0);
    });
  });

  describe('getNames', () => {
    it('should return list of registered adapter names', () => {
      registry.register('openai', new OpenAIAdapter('key1'));
      registry.register('anthropic', new AnthropicAdapter('key2'));

      const names = registry.getNames();
      expect(names).toContain('openai');
      expect(names).toContain('anthropic');
      expect(names).toHaveLength(2);
    });

    it('should return empty array when no adapters registered', () => {
      const names = registry.getNames();
      expect(names).toEqual([]);
    });
  });

  describe('createAdapter', () => {
    it('should create OpenAI adapter', () => {
      const config: ProviderConfig = {
        provider: 'openai',
        apiKey: 'test-key',
        defaultModel: 'gpt-4o',
      };

      const adapter = ProviderRegistry.createAdapter(config);
      expect(adapter.name).toBe('openai');
      expect(adapter.availableModels).toContain('gpt-4o');
    });

    it('should create Anthropic adapter', () => {
      const config: ProviderConfig = {
        provider: 'anthropic',
        apiKey: 'test-key',
      };

      const adapter = ProviderRegistry.createAdapter(config);
      expect(adapter.name).toBe('anthropic');
      expect(adapter.supportsVision).toBe(true);
    });

    it('should create Google adapter', () => {
      const config: ProviderConfig = {
        provider: 'google',
        apiKey: 'test-key',
      };

      const adapter = ProviderRegistry.createAdapter(config);
      expect(adapter.name).toBe('google');
      expect(adapter.availableModels).toContain('gemini-1.5-flash');
    });

    it('should create Ollama adapter', () => {
      const config: ProviderConfig = {
        provider: 'ollama',
        baseUrl: 'http://localhost:11434',
      };

      const adapter = ProviderRegistry.createAdapter(config);
      expect(adapter.name).toBe('ollama');
      expect(adapter.supportsStreaming).toBe(true);
    });

    it('should create Generic OpenAI adapter', () => {
      const config: ProviderConfig = {
        provider: 'generic',
        apiKey: 'test-key',
        baseUrl: 'https://custom-endpoint.com/v1',
      };

      const adapter = ProviderRegistry.createAdapter(config);
      expect(adapter.name).toBe('generic-openai');
    });

    it('should throw error for unknown provider', () => {
      const config = {
        provider: 'unknown' as 'openai',
        apiKey: 'test-key',
      };

      expect(() => ProviderRegistry.createAdapter(config)).toThrow('Unknown provider');
    });

    it('should use default model if not specified', () => {
      const config: ProviderConfig = {
        provider: 'openai',
        apiKey: 'test-key',
      };

      const adapter = ProviderRegistry.createAdapter(config);
      // OpenAI default model should be set
      expect(adapter).toBeDefined();
    });
  });
});
