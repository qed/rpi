import { createAdminClient } from '@/lib/supabase/admin'
import { EVENT_SCORES } from '@/lib/constants'

export interface TrackEventParams {
  sessionId: string
  eventType: string
  metadata?: Record<string, unknown>
  leadId?: string
}

export async function trackEvent({ sessionId, eventType, metadata, leadId }: TrackEventParams) {
  const supabase = createAdminClient()
  const points = EVENT_SCORES[eventType] ?? 0

  const { data, error } = await supabase
    .from('lead_events')
    .insert({
      session_id: sessionId,
      event_type: eventType,
      metadata: metadata ?? {},
      points,
      lead_id: leadId,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to track event: ${error.message}`)
  }

  return data
}

export async function getSessionEvents(sessionId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('lead_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to get events: ${error.message}`)
  }

  return data
}
