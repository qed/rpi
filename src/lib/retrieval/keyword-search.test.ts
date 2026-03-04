import { describe, it, expect, vi } from 'vitest'
import { keywordSearch, buildTsQuery } from './keyword-search'
import type { KeywordSearchClient } from './keyword-search'

function createMockChainedSupabase(result: {
  data: Array<{
    id: string
    document_id: string
    content: string
    metadata: Record<string, unknown> | null
  }> | null
  error: { message: string } | null
}): KeywordSearchClient & {
  from: ReturnType<typeof vi.fn>
  select: ReturnType<typeof vi.fn>
  textSearch: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
} {
  const chain = {
    from: vi.fn(),
    select: vi.fn(),
    textSearch: vi.fn(),
    limit: vi.fn().mockResolvedValue(result),
  }
  chain.from.mockReturnValue(chain)
  chain.select.mockReturnValue(chain)
  chain.textSearch.mockReturnValue(chain)
  return chain
}

describe('buildTsQuery', () => {
  it('should join terms with &', () => {
    expect(buildTsQuery('wealth immersion program')).toBe('wealth & immersion & program')
  })

  it('should strip non-alphanumeric characters', () => {
    expect(buildTsQuery('what\'s the best module?')).toBe('whats & the & best & module')
  })

  it('should handle multiple spaces', () => {
    expect(buildTsQuery('  wealth   immersion  ')).toBe('wealth & immersion')
  })

  it('should return empty string for empty query', () => {
    expect(buildTsQuery('')).toBe('')
  })

  it('should return empty string for query with only special chars', () => {
    expect(buildTsQuery('!@# $%^')).toBe('')
  })

  it('should lowercase terms', () => {
    expect(buildTsQuery('Wealth IMMERSION')).toBe('wealth & immersion')
  })
})

describe('keywordSearch', () => {
  it('should call Supabase with correct chain for a valid query', async () => {
    const mockData = [
      {
        id: 'chunk-1',
        document_id: 'doc-1',
        content: 'Wealth building strategies',
        metadata: { title: 'Module 1' },
      },
    ]
    const mockSupabase = createMockChainedSupabase({ data: mockData, error: null })

    const results = await keywordSearch(mockSupabase, 'wealth building')

    expect(mockSupabase.from).toHaveBeenCalledWith('content_chunks')
    expect(mockSupabase.select).toHaveBeenCalledWith('id, document_id, content, metadata')
    expect(mockSupabase.textSearch).toHaveBeenCalledWith('content', 'wealth & building')
    expect(mockSupabase.limit).toHaveBeenCalledWith(20)

    expect(results).toEqual([
      {
        id: 'chunk-1',
        documentId: 'doc-1',
        content: 'Wealth building strategies',
        metadata: { title: 'Module 1' },
      },
    ])
  })

  it('should use custom matchCount when provided', async () => {
    const mockSupabase = createMockChainedSupabase({ data: [], error: null })
    await keywordSearch(mockSupabase, 'test query', { matchCount: 10 })
    expect(mockSupabase.limit).toHaveBeenCalledWith(10)
  })

  it('should return empty array for empty query', async () => {
    const mockSupabase = createMockChainedSupabase({ data: [], error: null })
    const results = await keywordSearch(mockSupabase, '')
    expect(results).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('should return empty array when data is null', async () => {
    const mockSupabase = createMockChainedSupabase({ data: null, error: null })
    const results = await keywordSearch(mockSupabase, 'test')
    expect(results).toEqual([])
  })

  it('should throw when Supabase returns an error', async () => {
    const mockSupabase = createMockChainedSupabase({
      data: null,
      error: { message: 'Search failed' },
    })

    await expect(keywordSearch(mockSupabase, 'test')).rejects.toThrow(
      'Keyword search failed: Search failed'
    )
  })
})
