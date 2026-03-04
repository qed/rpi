import { createAdminClient } from '@/lib/supabase/admin'
import { updateLeadScore } from './scoring'
import { trackEvent } from './events'

export interface CaptureEmailParams {
  email: string
  name?: string
  sessionId: string
  source?: string
}

export async function captureEmail({ email, name, sessionId, source = 'website' }: CaptureEmailParams) {
  const supabase = createAdminClient()

  // Upsert lead — create or update if email exists
  const { data: lead, error } = await supabase
    .from('leads')
    .upsert(
      {
        email,
        name: name ?? null,
        session_id: sessionId,
        source,
      },
      { onConflict: 'email' }
    )
    .select('id, email, session_id')
    .single()

  if (error) {
    throw new Error(`Failed to capture email: ${error.message}`)
  }

  // Link existing session events to this lead
  await supabase
    .from('lead_events')
    .update({ lead_id: lead.id })
    .eq('session_id', sessionId)
    .is('lead_id', null)

  // Track email capture event
  await trackEvent({
    sessionId,
    eventType: 'email_capture',
    leadId: lead.id,
    metadata: { source },
  })

  // Recalculate score
  const score = await updateLeadScore(lead.id, sessionId)

  return {
    leadId: lead.id,
    email: lead.email,
    score: score.totalScore,
    scoreTier: score.scoreTier,
  }
}

export async function getLeadByEmail(email: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get lead: ${error.message}`)
  }

  return data
}

export async function getLeadBySession(sessionId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to get lead: ${error.message}`)
  }

  return data
}
