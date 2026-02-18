// Google Gemini API Provider Adapter
import type {
  LLMProviderAdapter,
  LLMMessage,
  LLMMessageContent,
  LLMRequestOptions,
  LLMResponse,
  LLMStreamChunk,
} from './LLMProviderAdapter';

export class GoogleAdapter implements LLMProviderAdapter {
  readonly name = 'google';
  readonly supportsVision = true;
  readonly supportsStreaming = true;
  readonly availableModels = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'];

  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  /**
   * Convert OpenAI-style messages to Google Gemini format
   */
  private convertMessages(messages: LLMMessage[]): {
    systemInstruction?: { parts: Array<{ text: string }> };
    contents: Array<{ role: string; parts: GooglePart[] }>;
  } {
    let systemInstruction: { parts: Array<{ text: string }> } | undefined;
    const contents: Array<{ role: string; parts: GooglePart[] }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Extract system instruction
        const text = typeof msg.content === 'string' ? msg.content : this.contentToString(msg.content);
        systemInstruction = { parts: [{ text }] };
        continue;
      }

      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts: GooglePart[] = [];

      if (typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      } else {
        for (const c of msg.content) {
          if (c.type === 'text' && c.text) {
            parts.push({ text: c.text });
          } else if (c.type === 'image_url' && c.image_url) {
            // Extract base64 data from data URL
            const url = c.image_url.url;
            const match = url.match(/^data:image\/(png|jpeg|webp|heic|heif);base64,(.+)$/);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: `image/${match[1]}`,
                  data: match[2],
                },
              });
            }
          }
        }
      }

      contents.push({ role, parts });
    }

    return { systemInstruction, contents };
  }

  private contentToString(content: LLMMessageContent[]): string {
    return content
      .map(c => (c.type === 'text' && c.text ? c.text : ''))
      .filter(Boolean)
      .join('\n');
  }

  async sendMessage(messages: LLMMessage[], options: LLMRequestOptions): Promise<LLMResponse> {
    const model = options.model || this.defaultModel;
    const { systemInstruction, contents } = this.convertMessages(messages);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = systemInstruction;
    }

    const response = await fetch(
      `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text || '';

    return {
      content,
      model,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount || 0,
            completionTokens: data.usageMetadata.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
      finishReason: candidate?.finishReason,
    };
  }

  async *sendMessageStream(
    messages: LLMMessage[],
    options: LLMRequestOptions
  ): AsyncIterable<LLMStreamChunk> {
    const model = options.model || this.defaultModel;
    const { systemInstruction, contents } = this.convertMessages(messages);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = systemInstruction;
    }

    const response = await fetch(
      `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error: ${response.status} - ${error}`);
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
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const finishReason = data.candidates?.[0]?.finishReason;

          if (text) {
            yield { content: text, done: false };
          }

          if (finishReason && finishReason !== 'STOP') {
            yield { content: '', done: true };
          }
        } catch (e) {
          console.error('Failed to parse Google streaming chunk:', e);
        }
      }
    }

    yield { content: '', done: true };
  }

  async sendVisionRequest(
    messages: LLMMessage[],
    options: LLMRequestOptions
  ): Promise<LLMResponse> {
    // All Gemini models support vision
    return this.sendMessage(messages, options);
  }

  estimateCost(promptTokens: number, completionTokens: number, model?: string): number {
    const m = model || this.defaultModel;

    // Approximate pricing (as of 2024, prices in USD per 1M tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'gemini-1.5-pro': { input: 1.25, output: 5 },
      'gemini-1.5-flash': { input: 0.075, output: 0.3 },
      'gemini-2.0-flash': { input: 0.075, output: 0.3 },
    };

    const prices = pricing[m] || pricing['gemini-1.5-flash'];
    const inputCost = (promptTokens / 1_000_000) * prices.input;
    const outputCost = (completionTokens / 1_000_000) * prices.output;

    return inputCost + outputCost;
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${key}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Google-specific types
interface GooglePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}
