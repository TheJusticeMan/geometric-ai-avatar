// Anthropic API Provider Adapter (Claude)
// Note: Direct browser calls may face CORS issues. Consider using a proxy or local server.
import type {
  LLMProviderAdapter,
  LLMMessage,
  LLMMessageContent,
  LLMRequestOptions,
  LLMResponse,
  LLMStreamChunk,
} from './LLMProviderAdapter';

export class AnthropicAdapter implements LLMProviderAdapter {
  readonly name = 'anthropic';
  readonly supportsVision = true;
  readonly supportsStreaming = true;
  readonly availableModels = [
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-haiku-20240307',
  ];

  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  /**
   * Convert OpenAI-style messages to Anthropic format
   * Anthropic handles system messages separately
   */
  private convertMessages(messages: LLMMessage[]): {
    system?: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string | AnthropicContent[] }>;
  } {
    let system: string | undefined;
    const anthropicMessages: Array<{
      role: 'user' | 'assistant';
      content: string | AnthropicContent[];
    }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Extract system message
        system = typeof msg.content === 'string' ? msg.content : this.contentToString(msg.content);
        continue;
      }

      if (msg.role === 'user' || msg.role === 'assistant') {
        if (typeof msg.content === 'string') {
          anthropicMessages.push({ role: msg.role, content: msg.content });
        } else {
          // Convert multimodal content
          const anthropicContent: AnthropicContent[] = msg.content.map(c => {
            if (c.type === 'text' && c.text) {
              return { type: 'text', text: c.text };
            } else if (c.type === 'image_url' && c.image_url) {
              // Extract base64 data from data URL
              const url = c.image_url.url;
              const match = url.match(/^data:image\/(png|jpeg|webp|gif);base64,(.+)$/);
              if (match) {
                return {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: `image/${match[1]}` as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
                    data: match[2],
                  },
                };
              }
            }
            return { type: 'text', text: '' };
          });
          anthropicMessages.push({ role: msg.role, content: anthropicContent });
        }
      }
    }

    return { system, messages: anthropicMessages };
  }

  private contentToString(content: LLMMessageContent[]): string {
    return content
      .map(c => (c.type === 'text' && c.text ? c.text : ''))
      .filter(Boolean)
      .join('\n');
  }

  async sendMessage(messages: LLMMessage[], options: LLMRequestOptions): Promise<LLMResponse> {
    const { system, messages: anthropicMessages } = this.convertMessages(messages);

    const body: Record<string, unknown> = {
      model: options.model || this.defaultModel,
      messages: anthropicMessages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
    };

    if (system) {
      body.system = system;
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.content[0]?.text || '',
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
      finishReason: data.stop_reason,
    };
  }

  async *sendMessageStream(
    messages: LLMMessage[],
    options: LLMRequestOptions
  ): AsyncIterable<LLMStreamChunk> {
    const { system, messages: anthropicMessages } = this.convertMessages(messages);

    const body: Record<string, unknown> = {
      model: options.model || this.defaultModel,
      messages: anthropicMessages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      stream: true,
    };

    if (system) {
      body.system = system;
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '' || !line.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'content_block_delta' && data.delta?.text) {
            yield { content: data.delta.text, done: false };
          } else if (data.type === 'message_stop') {
            yield { content: '', done: true };
          }
        } catch (e) {
          console.error('Failed to parse Anthropic streaming chunk:', e);
        }
      }
    }
  }

  async sendVisionRequest(
    messages: LLMMessage[],
    options: LLMRequestOptions
  ): Promise<LLMResponse> {
    // All Claude 3+ models support vision
    return this.sendMessage(messages, options);
  }

  estimateCost(promptTokens: number, completionTokens: number, model?: string): number {
    const m = model || this.defaultModel;

    // Approximate pricing (as of 2024, prices in USD per 1M tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-sonnet-4-20250514': { input: 3, output: 15 },
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    };

    const prices = pricing[m] || pricing['claude-3-5-sonnet-20241022'];
    const inputCost = (promptTokens / 1_000_000) * prices.input;
    const outputCost = (completionTokens / 1_000_000) * prices.output;

    return inputCost + outputCost;
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      // Make a minimal test request
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });
      return response.ok || response.status === 400; // 400 is ok, means auth worked
    } catch {
      return false;
    }
  }
}

// Anthropic-specific types
interface AnthropicContent {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
    data: string;
  };
}
