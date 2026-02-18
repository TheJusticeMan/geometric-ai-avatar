// Ollama Local LLM Provider Adapter
import type {
  LLMProviderAdapter,
  LLMMessage,
  LLMRequestOptions,
  LLMResponse,
  LLMStreamChunk,
} from './LLMProviderAdapter';

export class OllamaAdapter implements LLMProviderAdapter {
  readonly name = 'ollama';
  readonly supportsVision = true; // Some models like llava support vision
  readonly supportsStreaming = true;
  availableModels: string[] = [];

  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl = 'http://localhost:11434', defaultModel = 'llama2') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  /**
   * Fetch available models from Ollama server
   */
  async fetchAvailableModels(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        this.availableModels = data.models?.map((m: { name: string }) => m.name) || [];
      }
    } catch {
      // Server might be offline, keep empty list
      this.availableModels = [];
    }
  }

  /**
   * Check if a model supports vision
   */
  private isVisionModel(model: string): boolean {
    const visionModels = ['llava', 'bakllava', 'moondream'];
    return visionModels.some(vm => model.toLowerCase().includes(vm));
  }

  async sendMessage(messages: LLMMessage[], options: LLMRequestOptions): Promise<LLMResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages: this.convertMessages(messages),
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens,
        },
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.message?.content || '',
      model: data.model || options.model || this.defaultModel,
      usage: data.prompt_eval_count
        ? {
            promptTokens: data.prompt_eval_count || 0,
            completionTokens: data.eval_count || 0,
            totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
          }
        : undefined,
      finishReason: data.done ? 'stop' : undefined,
    };
  }

  async *sendMessageStream(
    messages: LLMMessage[],
    options: LLMRequestOptions
  ): AsyncIterable<LLMStreamChunk> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages: this.convertMessages(messages),
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens,
        },
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
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
        if (line.trim() === '') continue;

        try {
          const data = JSON.parse(line);
          const content = data.message?.content || '';

          if (content) {
            yield { content, done: false };
          }

          if (data.done) {
            yield { content: '', done: true };
          }
        } catch (e) {
          console.error('Failed to parse Ollama streaming chunk:', e);
        }
      }
    }
  }

  async sendVisionRequest(
    messages: LLMMessage[],
    options: LLMRequestOptions
  ): Promise<LLMResponse> {
    const model = options.model || this.defaultModel;

    if (!this.isVisionModel(model)) {
      throw new Error(`Model ${model} does not support vision. Try llava or bakllava.`);
    }

    return this.sendMessage(messages, options);
  }

  private convertMessages(
    messages: LLMMessage[]
  ): Array<{ role: string; content: string; images?: string[] }> {
    return messages.map(msg => {
      const ollamaMsg: { role: string; content: string; images?: string[] } = {
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: '',
      };

      if (typeof msg.content === 'string') {
        ollamaMsg.content = msg.content;
      } else {
        const textParts: string[] = [];
        const images: string[] = [];

        for (const c of msg.content) {
          if (c.type === 'text' && c.text) {
            textParts.push(c.text);
          } else if (c.type === 'image_url' && c.image_url) {
            // Extract base64 data from data URL
            const url = c.image_url.url;
            const match = url.match(/^data:image\/[^;]+;base64,(.+)$/);
            if (match) {
              images.push(match[1]);
            }
          }
        }

        ollamaMsg.content = textParts.join('\n');
        if (images.length > 0) {
          ollamaMsg.images = images;
        }
      }

      return ollamaMsg;
    });
  }

  estimateCost(): number {
    // Ollama is free/local
    return 0;
  }

  async validateApiKey(): Promise<boolean> {
    // Ollama doesn't use API keys, just check if server is reachable
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
