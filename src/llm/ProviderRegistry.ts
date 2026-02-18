// Provider Registry for managing LLM provider adapters
import type { LLMProviderAdapter, ProviderConfig } from './LLMProviderAdapter';
import { OpenAIAdapter } from './OpenAIAdapter';
import { AnthropicAdapter } from './AnthropicAdapter';
import { GoogleAdapter } from './GoogleAdapter';
import { OllamaAdapter } from './OllamaAdapter';
import { GenericOpenAIAdapter } from './GenericOpenAIAdapter';

export class ProviderRegistry {
  private adapters: Map<string, LLMProviderAdapter> = new Map();

  /**
   * Register a provider adapter
   */
  register(name: string, adapter: LLMProviderAdapter): void {
    this.adapters.set(name, adapter);
  }

  /**
   * Get a provider adapter by name
   */
  get(name: string): LLMProviderAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Get all registered adapters
   */
  getAll(): Map<string, LLMProviderAdapter> {
    return new Map(this.adapters);
  }

  /**
   * Get all provider names
   */
  getNames(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Factory method to create adapter from config
   */
  static createAdapter(config: ProviderConfig): LLMProviderAdapter {
    switch (config.provider) {
      case 'openai':
        return new OpenAIAdapter(config.apiKey || '', config.defaultModel);
      case 'anthropic':
        return new AnthropicAdapter(config.apiKey || '', config.defaultModel);
      case 'google':
        return new GoogleAdapter(config.apiKey || '', config.defaultModel);
      case 'ollama':
        return new OllamaAdapter(config.baseUrl, config.defaultModel);
      case 'generic':
        return new GenericOpenAIAdapter(
          config.apiKey || '',
          config.baseUrl || 'https://api.openai.com/v1',
          config.defaultModel
        );
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }
}
