import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { scoreAnswers } from '@/lib/quiz/scoring'
import { recommendTier } from '@/lib/quiz/recommender'
import { captureEmail } from '@/lib/leads/capture'
import { trackEvent } from '@/lib/leads/events'

const quizSubmissionSchema = z.object({
  sessionId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: z.union([z.string(), z.array(z.string())]),
    })
  ),
  email: z.string().email().optional(),
  name: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = quizSubmissionSchema.parse(body)

    // Score the answers
    const scores = scoreAnswers(parsed.answers)
    const recommendation = recommendTier(scores)

    // Store quiz result
    const supabase = createAdminClient()
    const { error: quizError } = await supabase.from('quiz_results').insert({
      session_id: parsed.sessionId,
      answers: parsed.answers as unknown as Record<string, unknown>,
      scores: scores as unknown as Record<string, number>,
      recommended_tier: recommendation.tierId,
    })

    if (quizError) {
      throw new Error(`Failed to store quiz result: ${quizError.message}`)
    }

    // Track quiz completion event
    await trackEvent({
      sessionId: parsed.sessionId,
      eventType: 'quiz_complete',
      metadata: { recommended_tier: recommendation.tierId },
    })

    // Capture email if provided
    if (parsed.email) {
      await captureEmail({
        email: parsed.email,
        name: parsed.name,
        sessionId: parsed.sessionId,
        source: 'quiz',
      })
    }

    return NextResponse.json({
      success: true,
      recommendation,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
