import { describe, it, expect, vi, beforeEach } from 'vitest'
import { captureEmail, getLeadByEmail, getLeadBySession } from './capture'

const mockUpsert = vi.fn()
const mockUpdate = vi.fn()
const mockSelectSingle = vi.fn()
const mockMaybeSingle = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'leads') {
        return {
          upsert: (data: unknown, opts: unknown) => {
            mockUpsert(data, opts)
            return {
              select: () => ({
                single: () =>
                  mockSelectSingle(),
              }),
            }
          },
          update: (data: unknown) => {
            mockUpdate(data)
            return {
              eq: () => mockUpdate(),
            }
          },
          select: () => ({
            eq: (_col: string, _val: string) => ({
              single: () => mockSelectSingle(),
              maybeSingle: () => mockMaybeSingle(),
            }),
          }),
        }
      }
      if (table === 'lead_events') {
        return {
          update: (data: unknown) => {
            mockUpdate(data)
            return {
              eq: () => ({ is: () => mockUpdate() }),
            }
          },
          insert: () => ({
            select: () => ({ single: () => ({ data: { id: 'evt-1' }, error: null }) }),
          }),
        }
      }
      return {}
    },
    rpc: () => ({ data: { total_score: 15, score_tier: 'cold' }, error: null }),
  }),
}))

describe('capture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('captureEmail', () => {
    it('creates lead and returns result', async () => {
      mockSelectSingle.mockResolvedValue({
        data: { id: 'lead-1', email: 'test@test.com', session_id: 'ses_123' },
        error: null,
      })
      mockUpdate.mockResolvedValue({ error: null })

      const result = await captureEmail({
        email: 'test@test.com',
        sessionId: 'ses_123',
      })

      expect(result.leadId).toBe('lead-1')
      expect(result.email).toBe('test@test.com')
    })

    it('throws on upsert error', async () => {
      mockSelectSingle.mockResolvedValue({
        data: null,
        error: { message: 'upsert fail' },
      })

      await expect(
        captureEmail({ email: 'test@test.com', sessionId: 'ses_123' })
      ).rejects.toThrow('Failed to capture email: upsert fail')
    })
  })

  describe('getLeadByEmail', () => {
    it('returns lead by email', async () => {
      mockSelectSingle.mockResolvedValue({
        data: { id: 'lead-1', email: 'test@test.com' },
        error: null,
      })

      const result = await getLeadByEmail('test@test.com')
      expect(result?.id).toBe('lead-1')
    })

    it('returns null when not found', async () => {
      mockSelectSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      })

      const result = await getLeadByEmail('nobody@test.com')
      expect(result).toBeNull()
    })

    it('throws on other errors', async () => {
      mockSelectSingle.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'db error' },
      })

      await expect(getLeadByEmail('test@test.com')).rejects.toThrow('Failed to get lead: db error')
    })
  })

  describe('getLeadBySession', () => {
    it('returns lead by session', async () => {
      mockMaybeSingle.mockResolvedValue({
        data: { id: 'lead-1', session_id: 'ses_123' },
        error: null,
      })

      const result = await getLeadBySession('ses_123')
      expect(result?.id).toBe('lead-1')
    })

    it('throws on error', async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'session error' },
      })

      await expect(getLeadBySession('ses_123')).rejects.toThrow(
        'Failed to get lead: session error'
      )
    })
  })
})
