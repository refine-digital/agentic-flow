/**
 * Streaming Input Mode - Stream prompts as async iterables
 *
 * Enables streaming prompts to the SDK, allowing:
 * - Multi-turn conversations without separate query calls
 * - Interactive user input during execution
 * - Pipeline-style prompt processing
 */

import { logger } from "../utils/logger.js";

/**
 * SDK User Message format
 */
export interface SDKUserMessage {
  type: 'user';
  message: {
    content: Array<{
      type: 'text';
      text: string;
    } | {
      type: 'image';
      source: {
        type: 'base64';
        media_type: string;
        data: string;
      };
    }>;
  };
}

/**
 * Streaming prompt source interface
 */
export interface PromptSource {
  next(): Promise<{ done: boolean; value?: SDKUserMessage }>;
  [Symbol.asyncIterator](): AsyncIterator<SDKUserMessage>;
}

/**
 * Create a user text message
 */
export function createTextMessage(text: string): SDKUserMessage {
  return {
    type: 'user',
    message: {
      content: [{ type: 'text', text }]
    }
  };
}

/**
 * Create an image message from base64 data
 */
export function createImageMessage(base64Data: string, mediaType: string = 'image/png'): SDKUserMessage {
  return {
    type: 'user',
    message: {
      content: [{
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data
        }
      }]
    }
  };
}

/**
 * Create a mixed content message (text + images)
 */
export function createMixedMessage(parts: Array<{ type: 'text'; text: string } | { type: 'image'; data: string; mediaType?: string }>): SDKUserMessage {
  return {
    type: 'user',
    message: {
      content: parts.map(part => {
        if (part.type === 'text') {
          return { type: 'text' as const, text: part.text };
        } else {
          return {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: part.mediaType || 'image/png',
              data: part.data
            }
          };
        }
      })
    }
  };
}

/**
 * StreamingPromptBuilder - Build streaming prompts with fluent API
 */
export class StreamingPromptBuilder {
  private messages: SDKUserMessage[] = [];
  private delayMs: number = 0;

  /**
   * Add a text message
   */
  text(content: string): this {
    this.messages.push(createTextMessage(content));
    return this;
  }

  /**
   * Add an image message
   */
  image(base64Data: string, mediaType?: string): this {
    this.messages.push(createImageMessage(base64Data, mediaType));
    return this;
  }

  /**
   * Set delay between messages (ms)
   */
  delay(ms: number): this {
    this.delayMs = ms;
    return this;
  }

  /**
   * Build async iterable for SDK
   */
  build(): AsyncIterable<SDKUserMessage> {
    const messages = this.messages;
    const delayMs = this.delayMs;

    return {
      async *[Symbol.asyncIterator]() {
        for (const message of messages) {
          if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
          yield message;
        }
      }
    };
  }
}

/**
 * Create a streaming prompt builder
 */
export function streamingPrompt(): StreamingPromptBuilder {
  return new StreamingPromptBuilder();
}

/**
 * InteractivePromptStream - Stream prompts with user input callbacks
 */
export class InteractivePromptStream implements AsyncIterable<SDKUserMessage> {
  private queue: SDKUserMessage[] = [];
  private waiting: Array<(value: { done: boolean; value?: SDKUserMessage }) => void> = [];
  private closed: boolean = false;

  /**
   * Push a message to the stream
   */
  push(message: SDKUserMessage): void {
    if (this.closed) {
      throw new Error('Stream is closed');
    }

    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      resolve({ done: false, value: message });
    } else {
      this.queue.push(message);
    }
  }

  /**
   * Push a text message
   */
  pushText(text: string): void {
    this.push(createTextMessage(text));
  }

  /**
   * Close the stream
   */
  close(): void {
    this.closed = true;
    for (const resolve of this.waiting) {
      resolve({ done: true });
    }
    this.waiting = [];
  }

  /**
   * Check if stream is closed
   */
  isClosed(): boolean {
    return this.closed;
  }

  /**
   * Get next message
   */
  private async next(): Promise<{ done: boolean; value?: SDKUserMessage }> {
    if (this.queue.length > 0) {
      return { done: false, value: this.queue.shift()! };
    }

    if (this.closed) {
      return { done: true };
    }

    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  [Symbol.asyncIterator](): AsyncIterator<SDKUserMessage> {
    const self = this;
    return {
      async next(): Promise<IteratorResult<SDKUserMessage>> {
        const result = await self.next();
        if (result.done) {
          return { done: true, value: undefined };
        }
        return { done: false, value: result.value! };
      }
    };
  }
}

/**
 * Create an interactive prompt stream
 */
export function createInteractiveStream(): InteractivePromptStream {
  return new InteractivePromptStream();
}

/**
 * Pipeline prompts from multiple sources
 */
export async function* pipelinePrompts(...sources: Array<AsyncIterable<SDKUserMessage>>): AsyncIterable<SDKUserMessage> {
  for (const source of sources) {
    for await (const message of source) {
      yield message;
    }
  }
}

/**
 * Create a prompt stream from an array
 */
export function fromArray(messages: string[]): AsyncIterable<SDKUserMessage> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const text of messages) {
        yield createTextMessage(text);
      }
    }
  };
}

/**
 * Create a prompt stream from readline (stdin)
 */
export function fromReadline(readline: any, prompt: string = '> '): InteractivePromptStream {
  const stream = createInteractiveStream();

  readline.on('line', (line: string) => {
    if (line.trim()) {
      stream.pushText(line);
    }
  });

  readline.on('close', () => {
    stream.close();
  });

  // Prompt for input
  process.stdout.write(prompt);
  readline.on('line', () => {
    if (!stream.isClosed()) {
      process.stdout.write(prompt);
    }
  });

  return stream;
}

/**
 * Transform a prompt stream
 */
export function transformPrompts(
  source: AsyncIterable<SDKUserMessage>,
  transform: (message: SDKUserMessage) => SDKUserMessage | Promise<SDKUserMessage>
): AsyncIterable<SDKUserMessage> {
  return {
    async *[Symbol.asyncIterator]() {
      for await (const message of source) {
        yield await transform(message);
      }
    }
  };
}

/**
 * Filter a prompt stream
 */
export function filterPrompts(
  source: AsyncIterable<SDKUserMessage>,
  predicate: (message: SDKUserMessage) => boolean | Promise<boolean>
): AsyncIterable<SDKUserMessage> {
  return {
    async *[Symbol.asyncIterator]() {
      for await (const message of source) {
        if (await predicate(message)) {
          yield message;
        }
      }
    }
  };
}

/**
 * Rate-limit a prompt stream
 */
export function rateLimitPrompts(
  source: AsyncIterable<SDKUserMessage>,
  minIntervalMs: number
): AsyncIterable<SDKUserMessage> {
  let lastEmit = 0;

  return {
    async *[Symbol.asyncIterator]() {
      for await (const message of source) {
        const now = Date.now();
        const elapsed = now - lastEmit;

        if (elapsed < minIntervalMs) {
          await new Promise(resolve => setTimeout(resolve, minIntervalMs - elapsed));
        }

        lastEmit = Date.now();
        yield message;
      }
    }
  };
}

/**
 * Batch prompts together
 */
export function batchPrompts(
  source: AsyncIterable<SDKUserMessage>,
  batchSize: number,
  separator: string = '\n\n'
): AsyncIterable<SDKUserMessage> {
  return {
    async *[Symbol.asyncIterator]() {
      let batch: string[] = [];

      for await (const message of source) {
        const text = message.message.content
          .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
          .map(c => c.text)
          .join(' ');

        batch.push(text);

        if (batch.length >= batchSize) {
          yield createTextMessage(batch.join(separator));
          batch = [];
        }
      }

      if (batch.length > 0) {
        yield createTextMessage(batch.join(separator));
      }
    }
  };
}

/**
 * Wrap a string or array as streaming input for SDK
 */
export function toStreamingInput(input: string | string[] | AsyncIterable<SDKUserMessage>): AsyncIterable<SDKUserMessage> {
  if (typeof input === 'string') {
    return fromArray([input]);
  }

  if (Array.isArray(input)) {
    return fromArray(input);
  }

  return input;
}

/**
 * Log streaming input for debugging
 */
export function logStreamingInput(source: AsyncIterable<SDKUserMessage>, label: string = 'StreamInput'): AsyncIterable<SDKUserMessage> {
  return {
    async *[Symbol.asyncIterator]() {
      let count = 0;
      for await (const message of source) {
        count++;
        logger.debug(`[${label}] Message ${count}`, {
          type: message.type,
          contentTypes: message.message.content.map(c => c.type)
        });
        yield message;
      }
      logger.debug(`[${label}] Stream completed`, { total: count });
    }
  };
}
