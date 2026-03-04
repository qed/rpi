import { describe, it, expect, vi, beforeEach } from 'vitest'
import { trackEvent, getSessionEvents } from './events'

const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'lead_events') {
        return {
          insert: (data: unknown) => {
            mockInsert(data)
            return {
              select: (cols: string) => {
                mockSelect(cols)
                return { single: () => mockSingle() }
              },
            }
          },
          select: () => ({
            eq: (_col: string, val: string) => {
              mockEq(val)
              return { order: (_c: string, _o: unknown) => { mockOrder(); return mockSingle() } }
            },
          }),
        }
      }
      return {}
    },
  }),
}))

describe('events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackEvent', () => {
    it('inserts event with correct points', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'evt-1' }, error: null })

      const result = await trackEvent({
        sessionId: 'ses_123',
        eventType: 'page_view',
      })

      expect(result.id).toBe('evt-1')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'ses_123',
          event_type: 'page_view',
          points: 1,
        })
      )
    })

    it('uses 0 points for unknown event type', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'evt-2' }, error: null })

      await trackEvent({
        sessionId: 'ses_123',
        eventType: 'unknown_type',
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ points: 0 })
      )
    })

    it('throws on insert error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'db error' } })

      await expect(
        trackEvent({ sessionId: 'ses_123', eventType: 'page_view' })
      ).rejects.toThrow('Failed to track event: db error')
    })

    it('passes metadata and leadId', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'evt-3' }, error: null })

      await trackEvent({
        sessionId: 'ses_123',
        eventType: 'chat_start',
        metadata: { page: '/home' },
        leadId: 'lead-1',
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { page: '/home' },
          lead_id: 'lead-1',
          points: 5,
        })
      )
    })
  })

  describe('getSessionEvents', () => {
    it('returns events for session', async () => {
      mockSingle.mockResolvedValue({ data: [{ id: 'evt-1' }], error: null })

      const result = await getSessionEvents('ses_123')
      expect(result).toEqual([{ id: 'evt-1' }])
      expect(mockEq).toHaveBeenCalledWith('ses_123')
    })

    it('throws on error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'fail' } })

      await expect(getSessionEvents('ses_123')).rejects.toThrow('Failed to get events: fail')
    })
  })
})
