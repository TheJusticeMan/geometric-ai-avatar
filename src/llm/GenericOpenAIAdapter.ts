// Generic OpenAI-Compatible API Provider Adapter
// Works with Azure OpenAI, Together AI, Fireworks, and other OpenAI-compatible endpoints
import type {
  LLMProviderAdapter,
  LLMMessage,
  LLMRequestOptions,
  LLMResponse,
  LLMStreamChunk,
} from './LLMProviderAdapter';

export class GenericOpenAIAdapter implements LLMProviderAdapter {
  readonly name = 'generic-openai';
  readonly supportsVision: boolean;
  readonly supportsStreaming = true;
  availableModels: string[] = [];

  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(
    apiKey: string,
    baseUrl = 'https://api.openai.com/v1',
    defaultModel = 'gpt-3.5-turbo',
    supportsVision = false
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultModel = defaultModel;
    this.supportsVision = supportsVision;
  }

  /**
   * Fetch available models from the endpoint
   */
  async fetchAvailableModels(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        this.availableModels = data.data?.map((m: { id: string }) => m.id) || [];
      }
    } catch {
      // Keep empty list if fetch fails
      this.availableModels = [];
    }
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
      throw new Error(`Generic OpenAI API error: ${response.status} - ${error}`);
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
      throw new Error(`Generic OpenAI API error: ${response.status} - ${error}`);
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
    if (!this.supportsVision) {
      throw new Error('This endpoint does not support vision requests');
    }
    return this.sendMessage(messages, options);
  }

  estimateCost(): number {
    // Cannot estimate cost for generic endpoints
    return 0;
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
