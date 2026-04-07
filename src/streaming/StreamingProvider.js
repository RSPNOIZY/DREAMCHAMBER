const EventEmitter = require("events");
const { Transform } = require("stream");

class StreamingProvider extends EventEmitter {
  constructor() {
    super();
    this.providers = new Map();
  }

  // Register streaming-capable providers
  registerProvider(name, handler) {
    this.providers.set(name, handler);
  }

  // Create SSE stream for real-time responses
  async *streamChat(provider, messages, options = {}) {
    const handler = this.providers.get(provider);
    if (!handler) {
      throw new Error(`No streaming handler for ${provider}`);
    }

    const stream = await handler.createStream(messages, options);
    const startTime = Date.now();
    let buffer = "";
    let inputTokens = 0;
    let tokenCount = 0;

    try {
      for await (const chunk of stream) {
        if (!chunk) continue;

        // Capture input tokens from Anthropic message_start event
        if (
          provider === "anthropic" &&
          chunk.type === "message_start" &&
          chunk.message?.usage
        ) {
          inputTokens = chunk.message.usage.input_tokens;
        }

        // Capture output tokens from Anthropic message_delta event
        if (
          provider === "anthropic" &&
          chunk.type === "message_delta" &&
          chunk.usage
        ) {
          tokenCount = chunk.usage.output_tokens;
        }

        // Parse streaming format based on provider
        const parsed = this.parseChunk(provider, chunk);

        if (parsed.content) {
          buffer += parsed.content;
          if (provider !== "anthropic") {
            tokenCount += parsed.tokens || 0;
          }

          yield {
            type: "content",
            content: parsed.content,
            buffer,
            tokenCount,
            metadata: {
              provider,
              model: options.model,
              timestamp: Date.now(),
            },
          };
        }

        // Emit progress events
        this.emit("progress", {
          provider,
          tokens: tokenCount,
          characters: buffer.length,
        });
      }

      // Final response
      yield {
        type: "complete",
        content: buffer,
        tokenCount,
        metadata: {
          provider,
          model: options.model,
          latency: Date.now() - startTime,
          cost: this.calculateStreamCost(
            provider,
            inputTokens,
            tokenCount,
            options.model,
          ),
        },
      };
    } catch (error) {
      yield {
        type: "error",
        error: error.message,
        partial: buffer,
      };
    }
  }

  // Parse provider-specific chunk formats
  parseChunk(provider, chunk) {
    switch (provider) {
      case "anthropic":
        return this.parseAnthropicChunk(chunk);
      case "openai":
        return this.parseOpenAIChunk(chunk);
      case "google":
        return this.parseGoogleChunk(chunk);
      default:
        return { content: chunk.toString() };
    }
  }

  parseAnthropicChunk(chunk) {
    if (!chunk || !chunk.type) return { content: "" };
    // Claude streaming format
    if (chunk.type === "content_block_delta") {
      return {
        content: chunk.delta?.text || "",
        tokens: 0,
      };
    }
    return { content: "" };
  }

  parseOpenAIChunk(chunk) {
    if (!chunk) return { content: "" };
    // OpenAI SDK returns parsed ChatCompletionChunk objects
    return {
      content: chunk.choices?.[0]?.delta?.content || "",
      tokens: chunk.usage?.completion_tokens || 0,
    };
  }

  parseGoogleChunk(chunk) {
    if (!chunk) return { content: "" };
    // Gemini streaming format
    if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        content: chunk.candidates[0].content.parts[0].text,
        tokens: chunk.usageMetadata?.candidatesTokenCount || 0,
      };
    }
    return { content: "" };
  }

  calculateStreamCost(provider, inputTokens, outputTokens, model) {
    // Per-1M rates matching actual provider pricing (input / output)
    const modelRates = {
      "claude-3-opus-20240229": { input: 15, output: 75 },
      "claude-opus-4": { input: 15, output: 75 },
      "claude-3-sonnet-20240229": { input: 3, output: 15 },
      "claude-sonnet-4": { input: 3, output: 15 },
      "gpt-4o": { input: 2.5, output: 10 },
      "gpt-4": { input: 30, output: 30 },
      "gpt-4-turbo": { input: 10, output: 30 },
      "gemini-2.0-flash": { input: 0.075, output: 0.3 },
      "gemini-pro": { input: 0.125, output: 0.375 },
    };
    const providerDefaults = {
      anthropic: { input: 3, output: 15 },
      openai: { input: 2.5, output: 10 },
      google: { input: 0.075, output: 0.3 },
    };
    const rates = modelRates[model] ||
      providerDefaults[provider] || { input: 10, output: 10 };
    const inputCost = (inputTokens / 1000000) * rates.input;
    const outputCost = (outputTokens / 1000000) * rates.output;
    return Number((inputCost + outputCost).toFixed(6));
  }

  // Create transform stream for Express SSE
  createSSEStream() {
    return new Transform({
      writableObjectMode: true,
      transform(chunk, encoding, callback) {
        const data = `data: ${JSON.stringify(chunk)}\n\n`;
        callback(null, data);
      },
    });
  }
}

// Provider-specific handlers
class AnthropicStreamHandler {
  createStream(messages, options) {
    // Implementation for Claude streaming
    const Anthropic = require("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: options.apiKey });

    return client.messages.create({
      model: options.model || "claude-3-sonnet-20240229",
      messages,
      max_tokens: options.maxTokens || 4096,
      stream: true,
    });
  }
}

class OpenAIStreamHandler {
  createStream(messages, options) {
    // Implementation for GPT streaming
    const OpenAI = require("openai");
    const client = new OpenAI({ apiKey: options.apiKey });

    return client.chat.completions.create({
      model: options.model || "gpt-4",
      messages,
      max_tokens: options.maxTokens || 4096,
      stream: true,
    });
  }
}

// Export configured streaming provider
const streamingProvider = new StreamingProvider();
streamingProvider.registerProvider("anthropic", new AnthropicStreamHandler());
streamingProvider.registerProvider("openai", new OpenAIStreamHandler());

module.exports = streamingProvider;
