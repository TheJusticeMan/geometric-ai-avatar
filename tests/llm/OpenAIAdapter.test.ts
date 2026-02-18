import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenAIAdapter } from '../../src/llm/OpenAIAdapter';
import type { LLMMessage } from '../../src/llm/LLMProviderAdapter';

describe('OpenAIAdapter', () => {
  let adapter: OpenAIAdapter;

  beforeEach(() => {
    adapter = new OpenAIAdapter('test-api-key', 'gpt-4o-mini');
    vi.clearAllMocks();
  });

  describe('basic properties', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('openai');
    });

    it('should support vision', () => {
      expect(adapter.supportsVision).toBe(true);
    });

    it('should support streaming', () => {
      expect(adapter.supportsStreaming).toBe(true);
    });

    it('should have available models', () => {
      expect(adapter.availableModels).toContain('gpt-4o');
      expect(adapter.availableModels).toContain('gpt-4o-mini');
      expect(adapter.availableModels).toContain('gpt-4-turbo');
      expect(adapter.availableModels).toContain('gpt-3.5-turbo');
    });
  });

  describe('sendMessage', () => {
    it('should send a basic message', async () => {
      const mockResponse = {
        choices: [
          {
            message: { content: 'Hello, world!' },
            finish_reason: 'stop',
          },
        ],
        model: 'gpt-4o-mini',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      const response = await adapter.sendMessage(messages, { model: 'gpt-4o-mini' });

      expect(response.content).toBe('Hello, world!');
      expect(response.model).toBe('gpt-4o-mini');
      expect(response.usage?.promptTokens).toBe(10);
      expect(response.usage?.completionTokens).toBe(5);
      expect(response.finishReason).toBe('stop');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          },
        })
      );
    });

    it('should handle API errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      } as Response);

      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];

      await expect(adapter.sendMessage(messages, { model: 'gpt-4o-mini' })).rejects.toThrow(
        'OpenAI API error: 401 - Unauthorized'
      );
    });

    it('should use default temperature if not specified', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        model: 'gpt-4o-mini',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      await adapter.sendMessage(messages, { model: 'gpt-4o-mini' });

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.temperature).toBe(0.7);
    });
  });

  describe('sendVisionRequest', () => {
    it('should handle multimodal messages', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'I see an image' }, finish_reason: 'stop' }],
        model: 'gpt-4o',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const messages: LLMMessage[] = [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What is this?' },
            { type: 'image_url', image_url: { url: 'data:image/png;base64,abc123' } },
          ],
        },
      ];

      const response = await adapter.sendVisionRequest(messages, { model: 'gpt-4o' });
      expect(response.content).toBe('I see an image');
    });

    it('should use vision-capable model', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        model: 'gpt-4o',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      await adapter.sendVisionRequest(messages, { model: 'gpt-3.5-turbo' });

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      // Should upgrade to vision-capable model
      expect(body.model).toBe('gpt-4o');
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost for gpt-4o-mini', () => {
      const cost = adapter.estimateCost(1000, 500, 'gpt-4o-mini');
      // 1000 tokens * $0.15/1M + 500 tokens * $0.6/1M = $0.00015 + $0.0003 = $0.00045
      expect(cost).toBeCloseTo(0.00045, 6);
    });

    it('should estimate cost for gpt-4o', () => {
      const cost = adapter.estimateCost(1000, 500, 'gpt-4o');
      // 1000 * $2.5/1M + 500 * $10/1M = $0.0025 + $0.005 = $0.0075
      expect(cost).toBeCloseTo(0.0075, 6);
    });

    it('should use default model if not specified', () => {
      const cost = adapter.estimateCost(1000, 500);
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('validateApiKey', () => {
    it('should return true for valid API key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      } as Response);

      const result = await adapter.validateApiKey('valid-key');
      expect(result).toBe(true);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/models',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer valid-key',
          },
        })
      );
    });

    it('should return false for invalid API key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      } as Response);

      const result = await adapter.validateApiKey('invalid-key');
      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await adapter.validateApiKey('test-key');
      expect(result).toBe(false);
    });
  });
});
