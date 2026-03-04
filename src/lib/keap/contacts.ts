import { keapRequest } from './client'

interface KeapContact {
  id: number
  email_addresses: { email: string; field: string }[]
  given_name?: string
  custom_fields?: { id: number; content: string }[]
}

interface CreateContactParams {
  email: string
  name?: string
  score?: number
  scoreTier?: string
}

export async function createOrUpdateContact({
  email,
  name,
  score,
  scoreTier,
}: CreateContactParams): Promise<KeapContact> {
  const nameParts = name?.split(' ') ?? []
  const givenName = nameParts[0] ?? ''
  const familyName = nameParts.slice(1).join(' ')

  const contact = await keapRequest<KeapContact>({
    method: 'PUT',
    path: '/contacts',
    body: {
      email_addresses: [{ email, field: 'EMAIL1' }],
      given_name: givenName || undefined,
      family_name: familyName || undefined,
      duplicate_option: 'Email',
      custom_fields: [
        ...(score !== undefined ? [{ id: 1, content: String(score) }] : []),
        ...(scoreTier ? [{ id: 2, content: scoreTier }] : []),
      ],
    },
  })

  return contact
}
