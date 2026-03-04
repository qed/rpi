import { describe, it, expect, vi, beforeEach } from 'vitest'
import { search } from './index'
import type { SearchDependencies } from './index'

// Mock dependency modules
vi.mock('./hybrid-search', () => ({
  hybridSearch: vi.fn(),
}))

vi.mock('./reranker', () => ({
  rerank: vi.fn(),
}))

import { hybridSearch } from './hybrid-search'
import { rerank } from './reranker'

const mockHybridSearch = vi.mocked(hybridSearch)
const mockRerank = vi.mocked(rerank)

function createMockDeps(): SearchDependencies {
  return {
    supabase: {} as never,
    voyageClient: {
      embedQuery: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
      embedBatch: vi.fn(),
    },
  }
}

describe('search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array for empty query', async () => {
    const deps = createMockDeps()
    const results = await search(deps, '')
    expect(results).toEqual([])
    expect(deps.voyageClient.embedQuery).not.toHaveBeenCalled()
  })

  it('should return empty array for whitespace-only query', async () => {
    const deps = createMockDeps()
    const results = await search(deps, '   ')
    expect(results).toEqual([])
  })

  it('should embed query, run hybrid search, and rerank', async () => {
    const deps = createMockDeps()

    const hybridResults = [
      {
        id: '1',
        documentId: 'doc-1',
        content: 'Result content',
        score: 0.8,
        metadata: null,
        source: 'vector' as const,
      },
    ]
    mockHybridSearch.mockResolvedValue(hybridResults)

    const rerankedResults = [
      {
        id: '1',
        documentId: 'doc-1',
        content: 'Result content',
        score: 0.85,
        metadata: null,
        source: 'vector' as const,
        sourceAttribution: 'Unknown source',
      },
    ]
    mockRerank.mockReturnValue(rerankedResults)

    const results = await search(deps, 'test query')

    // Verify embed was called
    expect(deps.voyageClient.embedQuery).toHaveBeenCalledWith('test query')

    // Verify hybrid search was called with embedding
    expect(mockHybridSearch).toHaveBeenCalledWith(
      deps.supabase,
      [0.1, 0.2, 0.3],
      'test query',
      undefined
    )

    // Verify rerank was called with hybrid results
    expect(mockRerank).toHaveBeenCalledWith(hybridResults, 'test query', undefined)

    expect(results).toEqual(rerankedResults)
  })

  it('should pass custom options through to hybrid search and reranker', async () => {
    const deps = createMockDeps()
    mockHybridSearch.mockResolvedValue([])
    mockRerank.mockReturnValue([])

    const options = {
      hybrid: { vectorWeight: 0.8, keywordWeight: 0.2, matchCount: 15 },
      reranker: { topK: 3 },
    }

    await search(deps, 'test', options)

    expect(mockHybridSearch).toHaveBeenCalledWith(
      deps.supabase,
      [0.1, 0.2, 0.3],
      'test',
      options.hybrid
    )
    expect(mockRerank).toHaveBeenCalledWith([], 'test', options.reranker)
  })
})
