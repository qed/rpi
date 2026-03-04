import { describe, it, expect, vi } from 'vitest'
import { streamChat } from './claude'

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      stream: () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: 'Hello' },
          }
          yield {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: ' world' },
          }
          yield {
            type: 'message_start',
            message: {},
          }
        },
      }),
    }
  },
}))

describe('streamChat', () => {
  it('yields text chunks from stream', async () => {
    const chunks: string[] = []

    for await (const chunk of streamChat({
      systemPrompt: 'You are helpful.',
      messages: [{ role: 'user', content: 'Hi' }],
    })) {
      chunks.push(chunk)
    }

    expect(chunks).toEqual(['Hello', ' world'])
  })

  it('skips non-text events', async () => {
    const chunks: string[] = []

    for await (const chunk of streamChat({
      systemPrompt: 'Test',
      messages: [{ role: 'user', content: 'Test' }],
    })) {
      chunks.push(chunk)
    }

    // Should only have the 2 text deltas, not the message_start
    expect(chunks).toHaveLength(2)
  })
})
