import { z } from 'zod'
import { SYSTEM_PROMPT } from './system-prompt'
import { streamChat } from '@/lib/ai/claude'
import { buildRAGContext, injectContext } from '@/lib/ai/rag-context'
import {
  getOrCreateConversation,
  loadHistory,
  saveMessage,
} from '@/lib/ai/conversation'
import { checkRateLimit } from '@/lib/ai/rate-limiter'
import { checkEmailGate } from '@/lib/ai/email-gate'
import { getRecommendationForResponse } from '@/lib/ai/recommendation'
import { trackEvent } from '@/lib/leads/events'

const chatRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const { sessionId, message } = chatRequestSchema.parse(body)

    // Check rate limit
    const rateLimit = await checkRateLimit(sessionId)
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
          remaining: 0,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(sessionId)

    // Check email gate
    const emailGate = checkEmailGate(conversation.message_count, conversation.has_email)
    if (emailGate.requiresEmail) {
      return new Response(
        JSON.stringify({
          requiresEmail: true,
          messageCount: emailGate.messageCount,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Load conversation history
    const history = await loadHistory(conversation.id)

    // Build RAG context
    const ragContext = await buildRAGContext(message)

    // Inject context into system prompt
    const enrichedPrompt = injectContext(SYSTEM_PROMPT, ragContext)

    // Save user message
    await saveMessage(conversation.id, 'user', message)

    // Track chat event
    if (history.length === 0) {
      await trackEvent({ sessionId, eventType: 'chat_start' })
    }
    await trackEvent({ sessionId, eventType: 'chat_message' })

    // Stream response via SSE
    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messages = [...history, { role: 'user' as const, content: message }]

          for await (const chunk of streamChat({
            systemPrompt: enrichedPrompt,
            messages,
          })) {
            fullResponse += chunk
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
            )
          }

          // Check for product recommendation in response
          const recommendation = getRecommendationForResponse(fullResponse)

          // Save assistant message
          await saveMessage(
            conversation.id,
            'assistant',
            fullResponse,
            ragContext.sources.length > 0
              ? ragContext.sources.map((s) => s as unknown as Record<string, unknown>)
              : undefined
          )

          // Send metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                sources: ragContext.sources,
                recommendation,
                remaining: rateLimit.remaining,
              })}\n\n`
            )
          )

          controller.close()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Stream error'
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
