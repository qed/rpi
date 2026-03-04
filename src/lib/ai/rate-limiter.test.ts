import { describe, it, expect, vi } from 'vitest'
import { checkRateLimit } from './rate-limiter'

const mockRpc = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: (fn: string, args: unknown) => {
      mockRpc(fn, args)
      return mockRpc()
    },
  }),
}))

describe('checkRateLimit', () => {
  it('returns allowed true when within limit', async () => {
    mockRpc.mockReturnValue({ data: { allowed: true, remaining: 15 }, error: null })

    const result = await checkRateLimit('ses_123')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(15)
  })

  it('returns allowed false when exceeded', async () => {
    mockRpc.mockReturnValue({ data: { allowed: false, remaining: 0 }, error: null })

    const result = await checkRateLimit('ses_123')
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('throws on error', async () => {
    mockRpc.mockReturnValue({ data: null, error: { message: 'rpc error' } })

    await expect(checkRateLimit('ses_123')).rejects.toThrow('Rate limit check failed: rpc error')
  })
})
