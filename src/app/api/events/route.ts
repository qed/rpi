import { NextResponse } from 'next/server'
import { z } from 'zod'
import { trackEvent } from '@/lib/leads/events'
import { EVENT_SCORES } from '@/lib/constants'

const eventSchema = z.object({
  sessionId: z.string().min(1),
  eventType: z.string().refine((val) => val in EVENT_SCORES, {
    message: 'Invalid event type',
  }),
  metadata: z.record(z.unknown()).optional(),
})

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = eventSchema.parse(body)

    const result = await trackEvent({
      sessionId: parsed.sessionId,
      eventType: parsed.eventType,
      metadata: parsed.metadata,
    })

    return NextResponse.json({ success: true, eventId: result.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
