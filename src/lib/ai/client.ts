import { useSettingsStore } from '../../stores/settings.store';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
}

export interface ChatCompletionResponse {
  content: string;
  finishReason: string;
}

/**
 * Universal AI client that supports WebLLM, OpenRouter, and Ollama
 */
export class AIClient {
  private webllmWorker: Worker | null = null;

  /**
   * Initialize the AI client based on current settings
   */
  async initialize(): Promise<void> {
    const { aiProvider } = useSettingsStore.getState();

    if (aiProvider === 'webllm') {
      await this.initializeWebLLM();
    }
    // OpenRouter and Ollama don't need initialization
  }

  /**
   * Initialize WebLLM worker
   */
  private async initializeWebLLM(): Promise<void> {
    if (this.webllmWorker) return;

    // WebLLM worker will be created in Phase 3
    console.log('WebLLM initialization placeholder');
  }

  /**
   * Send chat completion request
   */
  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const { aiProvider } = useSettingsStore.getState();

    switch (aiProvider) {
      case 'webllm':
        return this.webllmCompletion(options);
      case 'openrouter':
        return this.openRouterCompletion(options);
      case 'ollama':
        return this.ollamaCompletion(options);
      default:
        throw new Error(`Unknown AI provider: ${aiProvider}`);
    }
  }

  /**
   * WebLLM completion (browser-native)
   */
  private async webllmCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    // Placeholder - will be implemented in Phase 3
    console.log('WebLLM completion:', options);
    
    return {
      content: 'WebLLM response (placeholder)',
      finishReason: 'stop',
    };
  }

  /**
   * OpenRouter completion (cloud API)
   */
  private async openRouterCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const { openRouterApiKey, openRouterModel } = useSettingsStore.getState();

    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured. Please add it in Settings.');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'BOB IDE',
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: options.stream ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    if (options.stream && options.onChunk) {
      return this.handleOpenRouterStream(response, options.onChunk);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      finishReason: data.choices[0].finish_reason,
    };
  }

  /**
   * Handle OpenRouter streaming response
   */
  private async handleOpenRouterStream(
    response: Response,
    onChunk: (chunk: string) => void
  ): Promise<ChatCompletionResponse> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent,
      finishReason: 'stop',
    };
  }

  /**
   * Ollama completion (local API)
   */
  private async ollamaCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const { ollamaBaseUrl, ollamaModel } = useSettingsStore.getState();

    const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        messages: options.messages,
        stream: options.stream ?? false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    if (options.stream && options.onChunk) {
      return this.handleOllamaStream(response, options.onChunk);
    }

    const data = await response.json();
    return {
      content: data.message.content,
      finishReason: 'stop',
    };
  }

  /**
   * Handle Ollama streaming response
   */
  private async handleOllamaStream(
    response: Response,
    onChunk: (chunk: string) => void
  ): Promise<ChatCompletionResponse> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const content = parsed.message?.content;
            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent,
      finishReason: 'stop',
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.webllmWorker) {
      this.webllmWorker.terminate();
      this.webllmWorker = null;
    }
  }
}

// Singleton instance
export const aiClient = new AIClient();

// Made with Bob
