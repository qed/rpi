import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateLeadScore, updateLeadScore } from './scoring'

const mockRpc = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: (fn: string, args: unknown) => {
      mockRpc(fn, args)
      return mockRpc()
    },
    from: () => ({
      update: (data: unknown) => {
        mockUpdate(data)
        return { eq: (_col: string, _val: string) => { mockEq(); return mockEq() } }
      },
    }),
  }),
}))

describe('scoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateLeadScore', () => {
    it('returns score from DB function', async () => {
      mockRpc.mockReturnValue({ data: { total_score: 45, score_tier: 'warm' }, error: null })

      const result = await calculateLeadScore('ses_123')
      expect(result).toEqual({ totalScore: 45, scoreTier: 'warm' })
    })

    it('throws on error', async () => {
      mockRpc.mockReturnValue({ data: null, error: { message: 'rpc fail' } })

      await expect(calculateLeadScore('ses_123')).rejects.toThrow(
        'Failed to calculate lead score: rpc fail'
      )
    })
  })

  describe('updateLeadScore', () => {
    it('updates lead with calculated score', async () => {
      mockRpc.mockReturnValue({ data: { total_score: 60, score_tier: 'hot' }, error: null })
      mockEq.mockReturnValue({ error: null })

      const result = await updateLeadScore('lead-1', 'ses_123')
      expect(result).toEqual({ totalScore: 60, scoreTier: 'hot' })
      expect(mockUpdate).toHaveBeenCalledWith({ score: 60, score_tier: 'hot' })
    })

    it('throws on update error', async () => {
      mockRpc.mockReturnValue({ data: { total_score: 10, score_tier: 'cold' }, error: null })
      mockEq.mockReturnValue({ error: { message: 'update fail' } })

      await expect(updateLeadScore('lead-1', 'ses_123')).rejects.toThrow(
        'Failed to update lead score: update fail'
      )
    })
  })
})
