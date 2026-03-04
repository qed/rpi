import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrCreateConversation, loadHistory, saveMessage } from './conversation'

const mockSingle = vi.fn()
const mockInsert = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'conversations') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  single: () => mockSingle(),
                }),
              }),
              single: () => mockSingle(),
            }),
          }),
          insert: (data: unknown) => {
            mockInsert(data)
            return {
              select: () => ({
                single: () => mockSingle(),
              }),
            }
          },
          update: () => ({
            eq: () => ({ error: null }),
          }),
        }
      }
      if (table === 'messages') {
        return {
          select: () => ({
            eq: () => ({
              order: () => mockSingle(),
            }),
          }),
          insert: () => {
            mockInsert()
            return { error: null }
          },
        }
      }
      return {}
    },
    rpc: () => ({ then: (cb: (v: unknown) => void) => cb(undefined) }),
  }),
}))

describe('conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrCreateConversation', () => {
    it('returns existing conversation', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'conv-1', session_id: 'ses_123' }, error: null })

      const result = await getOrCreateConversation('ses_123')
      expect(result.id).toBe('conv-1')
    })

    it('creates new when none exists', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: { id: 'conv-new', session_id: 'ses_123' }, error: null })

      const result = await getOrCreateConversation('ses_123')
      expect(result.id).toBe('conv-new')
    })

    it('throws on create error', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: null, error: { message: 'create fail' } })

      await expect(getOrCreateConversation('ses_123')).rejects.toThrow(
        'Failed to create conversation: create fail'
      )
    })
  })

  describe('loadHistory', () => {
    it('returns messages in order', async () => {
      mockSingle.mockResolvedValue({
        data: [
          { role: 'user', content: 'hello' },
          { role: 'assistant', content: 'hi there' },
        ],
        error: null,
      })

      const result = await loadHistory('conv-1')
      expect(result).toHaveLength(2)
      expect(result[0]!.role).toBe('user')
      expect(result[1]!.role).toBe('assistant')
    })

    it('returns empty array when no messages', async () => {
      mockSingle.mockResolvedValue({ data: [], error: null })

      const result = await loadHistory('conv-1')
      expect(result).toEqual([])
    })

    it('throws on error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'load fail' } })

      await expect(loadHistory('conv-1')).rejects.toThrow('Failed to load history: load fail')
    })
  })

  describe('saveMessage', () => {
    it('saves message successfully', async () => {
      mockSingle.mockResolvedValue({ data: { message_count: 5 }, error: null })

      await expect(saveMessage('conv-1', 'user', 'hello')).resolves.not.toThrow()
    })
  })
})
