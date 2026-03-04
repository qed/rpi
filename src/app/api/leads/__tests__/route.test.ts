import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234',
})

const mockSingle = vi.fn()
const mockSelect = vi.fn(() => ({ single: mockSingle }))
const mockUpsert = vi.fn(() => ({ select: mockSelect }))
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}))

function createRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    mockFrom.mockClear()
    mockUpsert.mockClear()
    mockSelect.mockClear()
    mockSingle.mockClear()
  })

  it('creates a lead with valid email', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'lead-123' },
      error: null,
    })

    const response = await POST(createRequest({ email: 'test@example.com' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true, leadId: 'lead-123' })
    expect(mockFrom).toHaveBeenCalledWith('leads')
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        name: null,
        source: 'website',
        session_id: 'test-uuid-1234',
        score: 0,
        score_tier: 'cold',
      },
      { onConflict: 'email' }
    )
  })

  it('creates a lead with name and source', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'lead-456' },
      error: null,
    })

    const response = await POST(
      createRequest({ email: 'test@example.com', name: 'John', source: 'quiz' })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true, leadId: 'lead-456' })
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John',
        source: 'quiz',
      }),
      { onConflict: 'email' }
    )
  })

  it('returns 400 for invalid email', async () => {
    const response = await POST(createRequest({ email: 'not-an-email' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('returns 400 for missing email', async () => {
    const response = await POST(createRequest({}))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('returns 500 on database error', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'DB error' },
    })

    const response = await POST(createRequest({ email: 'test@example.com' }))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to save lead')
  })

  it('returns 400 for invalid JSON body', async () => {
    const request = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json{{{',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
  })

  it('defaults source to website when not provided', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'lead-789' },
      error: null,
    })

    await POST(createRequest({ email: 'test@example.com' }))

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'website' }),
      { onConflict: 'email' }
    )
  })
})
