import { createAdminClient } from '@/lib/supabase/admin'
import { RATE_LIMIT } from '@/lib/constants'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
}

export async function checkRateLimit(sessionId: string): Promise<RateLimitResult> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_session_id: sessionId,
    p_max_messages: RATE_LIMIT.messagesPerHour,
    p_window_hours: 1,
  })

  if (error) {
    throw new Error(`Rate limit check failed: ${error.message}`)
  }

  const result = data as unknown as { allowed: boolean; remaining: number }
  return {
    allowed: result.allowed,
    remaining: result.remaining,
  }
}
