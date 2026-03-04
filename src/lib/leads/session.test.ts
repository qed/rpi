import { describe, it, expect, vi } from 'vitest'
import { getSessionId, getRequiredSessionId } from './session'

const mockGet = vi.fn()

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => mockGet(name),
  }),
}))

describe('session', () => {
  describe('getSessionId', () => {
    it('returns session id from cookie', () => {
      mockGet.mockReturnValue({ value: 'ses_abc123' })
      expect(getSessionId()).toBe('ses_abc123')
      expect(mockGet).toHaveBeenCalledWith('rpi_session_id')
    })

    it('returns undefined when no cookie', () => {
      mockGet.mockReturnValue(undefined)
      expect(getSessionId()).toBeUndefined()
    })
  })

  describe('getRequiredSessionId', () => {
    it('returns session id when present', () => {
      mockGet.mockReturnValue({ value: 'ses_xyz' })
      expect(getRequiredSessionId()).toBe('ses_xyz')
    })

    it('throws when no session', () => {
      mockGet.mockReturnValue(undefined)
      expect(() => getRequiredSessionId()).toThrow('Session ID not found')
    })
  })
})
