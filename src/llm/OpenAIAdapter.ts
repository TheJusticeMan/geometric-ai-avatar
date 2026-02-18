// OpenAI API Provider Adapter
import type {
  LLMProviderAdapter,
  LLMMessage,
  LLMRequestOptions,
  LLMResponse,
  LLMStreamChunk,
} from './LLMProviderAdapter';

export class OpenAIAdapter implements LLMProviderAdapter {
  readonly name = 'openai';
  readonly supportsVision = true;
  readonly supportsStreaming = true;
  readonly availableModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async sendMessage(messages: LLMMessage[], options: LLMRequestOptions): Promise<LLMResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages: messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      finishReason: data.choices[0]?.finish_reason,
    };
  }

  async *sendMessageStream(
    messages: LLMMessage[],
    options: LLMRequestOptions
  ): AsyncIterable<LLMStreamChunk> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages: messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
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
        if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
        if (!line.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(line.slice(6));
          const content = data.choices[0]?.delta?.content || '';
          const finished = data.choices[0]?.finish_reason !== null;

          if (content) {
            yield { content, done: false };
          }

          if (finished) {
            yield { content: '', done: true };
          }
        } catch (e) {
          console.error('Failed to parse streaming chunk:', e);
        }
      }
    }
  }

  async sendVisionRequest(
    messages: LLMMessage[],
    options: LLMRequestOptions
  ): Promise<LLMResponse> {
    // OpenAI vision uses the same endpoint as regular chat
    // Just ensure model supports vision (gpt-4o, gpt-4-turbo)
    const visionModel = this.getVisionCapableModel(options.model);
    return this.sendMessage(messages, { ...options, model: visionModel });
  }

  private getVisionCapableModel(requestedModel?: string): string {
    const visionModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];
    if (requestedModel && visionModels.includes(requestedModel)) {
      return requestedModel;
    }
    return 'gpt-4o';
  }

  estimateCost(promptTokens: number, completionTokens: number, model?: string): number {
    const m = model || this.defaultModel;

    // Approximate pricing (as of 2024, prices in USD per 1M tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 2.5, output: 10 },
      'gpt-4o-mini': { input: 0.15, output: 0.6 },
      'gpt-4-turbo': { input: 10, output: 30 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    };

    const prices = pricing[m] || pricing['gpt-4o-mini'];
    const inputCost = (promptTokens / 1_000_000) * prices.input;
    const outputCost = (completionTokens / 1_000_000) * prices.output;

    return inputCost + outputCost;
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
