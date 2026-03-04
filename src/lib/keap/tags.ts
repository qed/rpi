import { keapRequest } from './client'

const TAG_MAP: Record<string, number> = {
  hot_lead: 1,
  warm_lead: 2,
  cold_lead: 3,
  quiz_completed: 4,
  chat_engaged: 5,
}

export async function applyTag(contactId: number, tagName: string): Promise<void> {
  const tagId = TAG_MAP[tagName]
  if (!tagId) return

  await keapRequest({
    method: 'POST',
    path: `/contacts/${contactId}/tags`,
    body: { tagIds: [tagId] },
  })
}

export async function applyScoreTierTag(contactId: number, scoreTier: string): Promise<void> {
  const tagName = `${scoreTier}_lead`
  await applyTag(contactId, tagName)
}
