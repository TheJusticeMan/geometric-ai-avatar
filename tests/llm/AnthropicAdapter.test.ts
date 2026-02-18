import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnthropicAdapter } from '../../src/llm/AnthropicAdapter';
import type { LLMMessage } from '../../src/llm/LLMProviderAdapter';

describe('AnthropicAdapter', () => {
  let adapter: AnthropicAdapter;

  beforeEach(() => {
    adapter = new AnthropicAdapter('test-api-key');
    vi.clearAllMocks();
  });

  describe('basic properties', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('anthropic');
    });

    it('should support vision', () => {
      expect(adapter.supportsVision).toBe(true);
    });

    it('should support streaming', () => {
      expect(adapter.supportsStreaming).toBe(true);
    });

    it('should have Claude models', () => {
      expect(adapter.availableModels).toContain('claude-sonnet-4-20250514');
      expect(adapter.availableModels).toContain('claude-3-5-sonnet-20241022');
      expect(adapter.availableModels).toContain('claude-3-haiku-20240307');
    });
  });

  describe('sendMessage', () => {
    it('should send a message with system prompt', async () => {
      const mockResponse = {
        content: [{ text: 'Hello from Claude!' }],
        model: 'claude-3-5-sonnet-20241022',
        usage: {
          input_tokens: 10,
          output_tokens: 5,
        },
        stop_reason: 'end_turn',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const messages: LLMMessage[] = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
      ];

      const response = await adapter.sendMessage(messages, {
        model: 'claude-3-5-sonnet-20241022',
      });

      expect(response.content).toBe('Hello from Claude!');
      expect(response.usage?.promptTokens).toBe(10);
      expect(response.usage?.completionTokens).toBe(5);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
            'anthropic-version': '2023-06-01',
          },
        })
      );

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.system).toBe('You are a helpful assistant');
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].role).toBe('user');
    });

    it('should handle API errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Invalid API key',
      } as Response);

      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];

      await expect(
        adapter.sendMessage(messages, { model: 'claude-3-5-sonnet-20241022' })
      ).rejects.toThrow('Anthropic API error: 401');
    });
  });

  describe('sendVisionRequest', () => {
    it('should handle image content in Anthropic format', async () => {
      const mockResponse = {
        content: [{ text: 'I see a geometric shape' }],
        model: 'claude-3-5-sonnet-20241022',
        usage: { input_tokens: 100, output_tokens: 20 },
        stop_reason: 'end_turn',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const messages: LLMMessage[] = [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image' },
            {
              type: 'image_url',
              image_url: { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
            },
          ],
        },
      ];

      const response = await adapter.sendVisionRequest(messages, {
        model: 'claude-3-5-sonnet-20241022',
      });

      expect(response.content).toBe('I see a geometric shape');

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.messages[0].content).toBeInstanceOf(Array);
      expect(body.messages[0].content[1].type).toBe('image');
      expect(body.messages[0].content[1].source.type).toBe('base64');
      expect(body.messages[0].content[1].source.media_type).toBe('image/png');
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost for Claude Sonnet', () => {
      const cost = adapter.estimateCost(1000, 500, 'claude-3-5-sonnet-20241022');
      // 1000 * $3/1M + 500 * $15/1M = $0.003 + $0.0075 = $0.0105
      expect(cost).toBeCloseTo(0.0105, 6);
    });

    it('should estimate cost for Claude Haiku', () => {
      const cost = adapter.estimateCost(1000, 500, 'claude-3-haiku-20240307');
      // 1000 * $0.25/1M + 500 * $1.25/1M = $0.00025 + $0.000625 = $0.000875
      expect(cost).toBeCloseTo(0.000875, 6);
    });
  });

  describe('validateApiKey', () => {
    it('should return true for valid API key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      } as Response);

      const result = await adapter.validateApiKey('valid-key');
      expect(result).toBe(true);
    });

    it('should return true for 400 status (auth worked)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
      } as Response);

      const result = await adapter.validateApiKey('valid-key');
      expect(result).toBe(true);
    });

    it('should return false for 401 status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
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
