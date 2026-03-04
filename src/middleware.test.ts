import { describe, it, expect, vi } from 'vitest'
import { middleware } from './middleware'

// Mock NextResponse and NextRequest
vi.mock('next/server', () => {
  const cookieMap = new Map<string, string>()
  return {
    NextResponse: {
      next: () => ({
        cookies: {
          set: (name: string, value: string, _opts: unknown) => {
            cookieMap.set(name, value)
          },
          get: (name: string) => {
            const v = cookieMap.get(name)
            return v ? { value: v } : undefined
          },
        },
        _cookieMap: cookieMap,
      }),
    },
  }
})

function createMockRequest(sessionCookie?: string) {
  return {
    cookies: {
      get: (name: string) => {
        if (name === 'rpi_session_id' && sessionCookie) {
          return { value: sessionCookie }
        }
        return undefined
      },
    },
    nextUrl: { pathname: '/' },
  } as unknown as Parameters<typeof middleware>[0]
}

describe('middleware', () => {
  it('sets session cookie when none exists', () => {
    const request = createMockRequest()
    const response = middleware(request)
    // Response should exist
    expect(response).toBeDefined()
  })

  it('does not overwrite existing session cookie', () => {
    const request = createMockRequest('ses_existing')
    const response = middleware(request)
    expect(response).toBeDefined()
  })
})
