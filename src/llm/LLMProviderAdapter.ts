// Universal LLM Provider Adapter Interface
// Defines standard contract for all LLM provider implementations

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | LLMMessageContent[];
}

export interface LLMMessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string; detail?: 'low' | 'high' | 'auto' };
}

export interface LLMRequestOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  finishReason?: string;
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
}

export interface LLMProviderAdapter {
  readonly name: string;
  readonly supportsVision: boolean;
  readonly supportsStreaming: boolean;
  readonly availableModels: string[];

  sendMessage(messages: LLMMessage[], options: LLMRequestOptions): Promise<LLMResponse>;
  sendMessageStream(
    messages: LLMMessage[],
    options: LLMRequestOptions
  ): AsyncIterable<LLMStreamChunk>;
  sendVisionRequest(messages: LLMMessage[], options: LLMRequestOptions): Promise<LLMResponse>;

  estimateCost(promptTokens: number, completionTokens: number, model?: string): number;
  validateApiKey(key: string): Promise<boolean>;
}

// Provider configuration
export interface ProviderConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'generic';
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}
