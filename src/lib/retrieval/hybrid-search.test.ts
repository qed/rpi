import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hybridSearch, mergeResults } from './hybrid-search'
import type { VectorSearchResult } from './vector-search'
import type { KeywordSearchResult } from './keyword-search'

// Mock the dependency modules
vi.mock('./vector-search', () => ({
  vectorSearch: vi.fn(),
}))

vi.mock('./keyword-search', () => ({
  keywordSearch: vi.fn(),
}))

import { vectorSearch } from './vector-search'
import { keywordSearch } from './keyword-search'

const mockVectorSearch = vi.mocked(vectorSearch)
const mockKeywordSearch = vi.mocked(keywordSearch)

describe('mergeResults', () => {
  it('should merge vector-only results with weighted scores', () => {
    const vectorResults: VectorSearchResult[] = [
      { id: '1', documentId: 'doc-1', content: 'Content 1', similarity: 0.9, metadata: null },
    ]
    const keywordResults: KeywordSearchResult[] = []

    const merged = mergeResults(vectorResults, keywordResults, 0.7, 0.3)

    expect(merged).toHaveLength(1)
    expect(merged[0]?.score).toBeCloseTo(0.63) // 0.9 * 0.7
    expect(merged[0]?.source).toBe('vector')
  })

  it('should merge keyword-only results with rank-based scores', () => {
    const vectorResults: VectorSearchResult[] = []
    const keywordResults: KeywordSearchResult[] = [
      { id: '1', documentId: 'doc-1', content: 'Content 1', metadata: null },
      { id: '2', documentId: 'doc-2', content: 'Content 2', metadata: null },
    ]

    const merged = mergeResults(vectorResults, keywordResults, 0.7, 0.3)

    expect(merged).toHaveLength(2)
    expect(merged[0]?.score).toBeCloseTo(0.3) // (1/1) * 0.3
    expect(merged[0]?.source).toBe('keyword')
    expect(merged[1]?.score).toBeCloseTo(0.15) // (1/2) * 0.3
  })

  it('should combine scores for results found by both strategies', () => {
    const vectorResults: VectorSearchResult[] = [
      { id: 'shared-1', documentId: 'doc-1', content: 'Shared content', similarity: 0.8, metadata: null },
    ]
    const keywordResults: KeywordSearchResult[] = [
      { id: 'shared-1', documentId: 'doc-1', content: 'Shared content', metadata: null },
    ]

    const merged = mergeResults(vectorResults, keywordResults, 0.7, 0.3)

    expect(merged).toHaveLength(1)
    expect(merged[0]?.score).toBeCloseTo(0.86) // (0.8 * 0.7) + (1/1 * 0.3)
    expect(merged[0]?.source).toBe('both')
  })

  it('should sort results by score descending', () => {
    const vectorResults: VectorSearchResult[] = [
      { id: '1', documentId: 'doc-1', content: 'Low score', similarity: 0.3, metadata: null },
      { id: '2', documentId: 'doc-2', content: 'High score', similarity: 0.95, metadata: null },
    ]

    const merged = mergeResults(vectorResults, [], 0.7, 0.3)

    expect(merged[0]?.id).toBe('2')
    expect(merged[1]?.id).toBe('1')
  })

  it('should return empty array when both sources empty', () => {
    const merged = mergeResults([], [], 0.7, 0.3)
    expect(merged).toEqual([])
  })
})

describe('hybridSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should run both searches in parallel with default options', async () => {
    mockVectorSearch.mockResolvedValue([
      { id: '1', documentId: 'doc-1', content: 'Vector result', similarity: 0.9, metadata: null },
    ])
    mockKeywordSearch.mockResolvedValue([
      { id: '2', documentId: 'doc-2', content: 'Keyword result', metadata: null },
    ])

    const mockSupabase = {} as never
    const results = await hybridSearch(mockSupabase, [0.1, 0.2], 'test query')

    expect(mockVectorSearch).toHaveBeenCalledWith(mockSupabase, [0.1, 0.2], {
      matchThreshold: undefined,
      matchCount: 20,
    })
    expect(mockKeywordSearch).toHaveBeenCalledWith(mockSupabase, 'test query', {
      matchCount: 20,
    })

    expect(results).toHaveLength(2)
  })

  it('should pass custom options to searches', async () => {
    mockVectorSearch.mockResolvedValue([])
    mockKeywordSearch.mockResolvedValue([])

    const mockSupabase = {} as never
    await hybridSearch(mockSupabase, [0.1], 'query', {
      vectorWeight: 0.8,
      keywordWeight: 0.2,
      matchCount: 10,
      matchThreshold: 0.7,
    })

    expect(mockVectorSearch).toHaveBeenCalledWith(mockSupabase, [0.1], {
      matchThreshold: 0.7,
      matchCount: 10,
    })
    expect(mockKeywordSearch).toHaveBeenCalledWith(mockSupabase, 'query', {
      matchCount: 10,
    })
  })
})
