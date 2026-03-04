import { describe, it, expect, vi } from 'vitest'
import { vectorSearch } from './vector-search'
import type { VectorSearchClient } from './vector-search'

function createMockSupabase(rpcResult: {
  data: Array<{
    id: string
    document_id: string
    content: string
    similarity: number
    metadata: Record<string, unknown> | null
  }> | null
  error: { message: string } | null
}): VectorSearchClient & { rpc: ReturnType<typeof vi.fn> } {
  return {
    rpc: vi.fn().mockResolvedValue(rpcResult),
  }
}

describe('vectorSearch', () => {
  const queryEmbedding = [0.1, 0.2, 0.3]

  it('should call match_chunks RPC with correct parameters', async () => {
    const mockSupabase = createMockSupabase({ data: [], error: null })

    await vectorSearch(mockSupabase, queryEmbedding, {
      matchThreshold: 0.6,
      matchCount: 10,
    })

    expect(mockSupabase.rpc).toHaveBeenCalledWith('match_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6,
      match_count: 10,
    })
  })

  it('should use default threshold and count when options not provided', async () => {
    const mockSupabase = createMockSupabase({ data: [], error: null })

    await vectorSearch(mockSupabase, queryEmbedding)

    expect(mockSupabase.rpc).toHaveBeenCalledWith('match_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 20,
    })
  })

  it('should map results to VectorSearchResult format', async () => {
    const mockData = [
      {
        id: 'chunk-1',
        document_id: 'doc-1',
        content: 'Test content',
        similarity: 0.95,
        metadata: { title: 'Test' },
      },
      {
        id: 'chunk-2',
        document_id: 'doc-2',
        content: 'Another content',
        similarity: 0.8,
        metadata: null,
      },
    ]

    const mockSupabase = createMockSupabase({ data: mockData, error: null })
    const results = await vectorSearch(mockSupabase, queryEmbedding)

    expect(results).toEqual([
      {
        id: 'chunk-1',
        documentId: 'doc-1',
        content: 'Test content',
        similarity: 0.95,
        metadata: { title: 'Test' },
      },
      {
        id: 'chunk-2',
        documentId: 'doc-2',
        content: 'Another content',
        similarity: 0.8,
        metadata: null,
      },
    ])
  })

  it('should return empty array when data is null', async () => {
    const mockSupabase = createMockSupabase({ data: null, error: null })
    const results = await vectorSearch(mockSupabase, queryEmbedding)
    expect(results).toEqual([])
  })

  it('should throw when RPC returns an error', async () => {
    const mockSupabase = createMockSupabase({
      data: null,
      error: { message: 'RPC failed' },
    })

    await expect(vectorSearch(mockSupabase, queryEmbedding)).rejects.toThrow(
      'Vector search failed: RPC failed'
    )
  })
})
