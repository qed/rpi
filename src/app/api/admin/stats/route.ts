import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()

  const [leadsResult, conversationsResult, messagesResult, quizResult, emailEventsResult] =
    await Promise.all([
      supabase.from('leads').select('score_tier'),
      supabase.from('conversations').select('id', { count: 'exact', head: true }),
      supabase.from('messages').select('id', { count: 'exact', head: true }),
      supabase.from('quiz_results').select('id', { count: 'exact', head: true }),
      supabase.from('lead_events').select('id', { count: 'exact', head: true }).eq('event_type', 'email_capture'),
    ])

  const leads = leadsResult.data ?? []
  const hotLeads = leads.filter((l) => l.score_tier === 'hot').length
  const warmLeads = leads.filter((l) => l.score_tier === 'warm').length
  const coldLeads = leads.filter((l) => l.score_tier === 'cold').length

  return NextResponse.json({
    totalLeads: leads.length,
    hotLeads,
    warmLeads,
    coldLeads,
    totalConversations: conversationsResult.count ?? 0,
    totalMessages: messagesResult.count ?? 0,
    quizCompletions: quizResult.count ?? 0,
    emailCaptures: emailEventsResult.count ?? 0,
  })
}
