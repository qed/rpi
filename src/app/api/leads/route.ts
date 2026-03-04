import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const leadSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  source: z.string().optional().default('website'),
})

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Validation failed' },
        { status: 400 }
      )
    }

    const { email, name, source } = parsed.data

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('leads')
      .upsert(
        {
          email,
          name: name ?? null,
          source,
          session_id: crypto.randomUUID(),
          score: 0,
          score_tier: 'cold',
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, leadId: data.id })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
