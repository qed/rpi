import { createAdminClient } from '@/lib/supabase/admin'
import { createOrUpdateContact } from './contacts'
import { applyScoreTierTag, applyTag } from './tags'

export async function syncLeadToKeap(leadId: string): Promise<{ keapContactId: number }> {
  const supabase = createAdminClient()

  // Get lead data
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (error || !lead) {
    throw new Error(`Lead not found: ${error?.message ?? 'unknown'}`)
  }

  // Create or update contact in Keap
  const contact = await createOrUpdateContact({
    email: lead.email,
    name: lead.name ?? undefined,
    score: lead.score,
    scoreTier: lead.score_tier,
  })

  // Apply score tier tag
  await applyScoreTierTag(contact.id, lead.score_tier)

  // Apply hot lead tag if applicable
  if (lead.score_tier === 'hot') {
    await applyTag(contact.id, 'hot_lead')
  }

  // Update lead with Keap contact ID
  await supabase
    .from('leads')
    .update({
      keap_contact_id: String(contact.id),
      keap_synced_at: new Date().toISOString(),
    })
    .eq('id', leadId)

  return { keapContactId: contact.id }
}
