import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleAdapter } from '../../src/llm/GoogleAdapter';
import type { LLMMessage } from '../../src/llm/LLMProviderAdapter';

describe('GoogleAdapter', () => {
  let adapter: GoogleAdapter;

  beforeEach(() => {
    adapter = new GoogleAdapter('test-api-key');
    vi.clearAllMocks();
  });

  describe('basic properties', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('google');
    });

    it('should support vision', () => {
      expect(adapter.supportsVision).toBe(true);
    });

    it('should support streaming', () => {
      expect(adapter.supportsStreaming).toBe(true);
    });

    it('should have Gemini models', () => {
      expect(adapter.availableModels).toContain('gemini-1.5-pro');
      expect(adapter.availableModels).toContain('gemini-1.5-flash');
      expect(adapter.availableModels).toContain('gemini-2.0-flash');
    });
  });

  describe('sendMessage', () => {
    it('should send a message with system instruction', async () => {
      const mockResponse = {
        candidates: [
          {
            content: { parts: [{ text: 'Hello from Gemini!' }] },
            finishReason: 'STOP',
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const messages: LLMMessage[] = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
      ];

      const response = await adapter.sendMessage(messages, { model: 'gemini-1.5-flash' });

      expect(response.content).toBe('Hello from Gemini!');
      expect(response.usage?.promptTokens).toBe(10);
      expect(response.usage?.completionTokens).toBe(5);

      const url =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-api-key';
      expect(global.fetch).toHaveBeenCalledWith(url, expect.any(Object));

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.systemInstruction).toBeDefined();
      expect(body.systemInstruction.parts[0].text).toBe('You are a helpful assistant');
      expect(body.contents).toHaveLength(1);
      expect(body.contents[0].role).toBe('user');
    });

    it('should handle API errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      } as Response);

      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];

      await expect(adapter.sendMessage(messages, { model: 'gemini-1.5-flash' })).rejects.toThrow(
        'Google API error: 400'
      );
    });

    it('should convert assistant role to model', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'Response' }] } }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const messages: LLMMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
        { role: 'user', content: 'How are you?' },
      ];

      await adapter.sendMessage(messages, { model: 'gemini-1.5-flash' });

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.contents[0].role).toBe('user');
      expect(body.contents[1].role).toBe('model');
      expect(body.contents[2].role).toBe('user');
    });
  });

  describe('sendVisionRequest', () => {
    it('should handle image content in Google format', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'I see an image' }] } }],
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
            {
              type: 'image_url',
              image_url: { url: 'data:image/png;base64,abc123def456' },
            },
          ],
        },
      ];

      const response = await adapter.sendVisionRequest(messages, { model: 'gemini-1.5-flash' });

      expect(response.content).toBe('I see an image');

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.contents[0].parts).toHaveLength(2);
      expect(body.contents[0].parts[0].text).toBe('What is this?');
      expect(body.contents[0].parts[1].inlineData).toBeDefined();
      expect(body.contents[0].parts[1].inlineData.mimeType).toBe('image/png');
      expect(body.contents[0].parts[1].inlineData.data).toBe('abc123def456');
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost for Gemini Pro', () => {
      const cost = adapter.estimateCost(1000, 500, 'gemini-1.5-pro');
      // 1000 * $1.25/1M + 500 * $5/1M = $0.00125 + $0.0025 = $0.00375
      expect(cost).toBeCloseTo(0.00375, 6);
    });

    it('should estimate cost for Gemini Flash', () => {
      const cost = adapter.estimateCost(1000, 500, 'gemini-1.5-flash');
      // 1000 * $0.075/1M + 500 * $0.3/1M = $0.000075 + $0.00015 = $0.000225
      expect(cost).toBeCloseTo(0.000225, 6);
    });
  });

  describe('validateApiKey', () => {
    it('should return true for valid API key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      } as Response);

      const result = await adapter.validateApiKey('valid-key');
      expect(result).toBe(true);

      const url =
        'https://generativelanguage.googleapis.com/v1beta/models?key=valid-key';
      expect(global.fetch).toHaveBeenCalledWith(url);
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
