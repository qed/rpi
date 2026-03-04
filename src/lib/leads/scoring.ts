import { createAdminClient } from '@/lib/supabase/admin'

export interface LeadScore {
  totalScore: number
  scoreTier: 'cold' | 'warm' | 'hot'
}

export async function calculateLeadScore(sessionId: string): Promise<LeadScore> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('calculate_lead_score', {
    p_session_id: sessionId,
  })

  if (error) {
    throw new Error(`Failed to calculate lead score: ${error.message}`)
  }

  const result = data as unknown as { total_score: number; score_tier: string }
  return {
    totalScore: result.total_score,
    scoreTier: result.score_tier as LeadScore['scoreTier'],
  }
}

export async function updateLeadScore(leadId: string, sessionId: string): Promise<LeadScore> {
  const supabase = createAdminClient()
  const score = await calculateLeadScore(sessionId)

  const { error } = await supabase
    .from('leads')
    .update({
      score: score.totalScore,
      score_tier: score.scoreTier,
    })
    .eq('id', leadId)

  if (error) {
    throw new Error(`Failed to update lead score: ${error.message}`)
  }

  return score
}
