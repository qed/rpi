import { describe, it, expect } from 'vitest'
import { rerank, computeTermOverlap } from './reranker'
import type { HybridSearchResult } from './hybrid-search'

function createResult(overrides: Partial<HybridSearchResult> = {}): HybridSearchResult {
  return {
    id: 'chunk-1',
    documentId: 'doc-1',
    content: 'This is a test content with enough length to be substantive for scoring.',
    score: 0.5,
    metadata: null,
    source: 'vector',
    ...overrides,
  }
}

describe('computeTermOverlap', () => {
  it('should return 1.0 when all query terms appear in content', () => {
    const result = computeTermOverlap('wealth building strategies for success', 'wealth building success')
    expect(result).toBe(1)
  })

  it('should return 0 when no query terms appear in content', () => {
    const result = computeTermOverlap('completely different text', 'wealth building')
    expect(result).toBe(0)
  })

  it('should return partial overlap ratio', () => {
    const result = computeTermOverlap('wealth management tips', 'wealth building tips')
    // "wealth" and "tips" match, "building" does not: 2/3
    expect(result).toBeCloseTo(2 / 3)
  })

  it('should return 0 for empty query', () => {
    expect(computeTermOverlap('some content', '')).toBe(0)
  })

  it('should skip short query terms (length <= 2)', () => {
    // "is" and "a" are skipped, only "test" counts
    expect(computeTermOverlap('this is a test', 'is a test')).toBe(1)
  })

  it('should be case insensitive', () => {
    expect(computeTermOverlap('WEALTH Building', 'wealth building')).toBe(1)
  })
})

describe('rerank', () => {
  it('should return empty array for empty input', () => {
    expect(rerank([], 'test')).toEqual([])
  })

  it('should limit results to topK (default 5)', () => {
    const results = Array.from({ length: 10 }, (_, i) =>
      createResult({ id: `chunk-${i}`, score: 1 - i * 0.05 })
    )

    const reranked = rerank(results, 'test')
    expect(reranked).toHaveLength(5)
  })

  it('should limit results to custom topK', () => {
    const results = Array.from({ length: 10 }, (_, i) =>
      createResult({ id: `chunk-${i}`, score: 1 - i * 0.05 })
    )

    const reranked = rerank(results, 'test', { topK: 3 })
    expect(reranked).toHaveLength(3)
  })

  it('should boost results from both sources', () => {
    const vectorOnly = createResult({ id: 'vector', score: 0.7, source: 'vector' })
    const bothSources = createResult({ id: 'both', score: 0.7, source: 'both' })

    const reranked = rerank([vectorOnly, bothSources], 'test')

    const bothResult = reranked.find((r) => r.id === 'both')
    const vectorResult = reranked.find((r) => r.id === 'vector')
    expect(bothResult).toBeDefined()
    expect(vectorResult).toBeDefined()
    expect(bothResult!.score).toBeGreaterThan(vectorResult!.score)
  })

  it('should apply custom bothSourceBoost', () => {
    const result = createResult({ id: 'both', score: 1.0, source: 'both' })

    const reranked = rerank([result], 'test', { bothSourceBoost: 2.0 })

    // Score should be boosted by 2.0 for 'both' source
    expect(reranked[0]!.score).toBeGreaterThan(1.0)
  })

  it('should penalize very short content', () => {
    const shortContent = createResult({
      id: 'short',
      content: 'Short',
      score: 0.8,
    })
    const normalContent = createResult({
      id: 'normal',
      content: 'This is a normal length piece of content that has enough substance to be meaningful for search results and should not be penalized by the reranker. It contains multiple sentences and provides real value.',
      score: 0.8,
    })

    const reranked = rerank([shortContent, normalContent], 'test')

    const shortResult = reranked.find((r) => r.id === 'short')
    const normalResult = reranked.find((r) => r.id === 'normal')
    expect(normalResult!.score).toBeGreaterThan(shortResult!.score)
  })

  it('should boost results with query term overlap', () => {
    const matching = createResult({
      id: 'match',
      content: 'Wealth immersion program details and benefits for participants',
      score: 0.7,
    })
    const nonMatching = createResult({
      id: 'nomatch',
      content: 'Completely unrelated content about different things entirely for testing',
      score: 0.7,
    })

    const reranked = rerank([matching, nonMatching], 'wealth immersion program')

    const matchResult = reranked.find((r) => r.id === 'match')
    const noMatchResult = reranked.find((r) => r.id === 'nomatch')
    expect(matchResult!.score).toBeGreaterThan(noMatchResult!.score)
  })

  it('should sort by adjusted score descending', () => {
    const results = [
      createResult({ id: 'low', score: 0.3 }),
      createResult({ id: 'high', score: 0.9 }),
      createResult({ id: 'mid', score: 0.6 }),
    ]

    const reranked = rerank(results, 'test')

    expect(reranked[0]!.id).toBe('high')
    expect(reranked[1]!.id).toBe('mid')
    expect(reranked[2]!.id).toBe('low')
  })

  it('should build source attribution from metadata', () => {
    const result = createResult({
      metadata: {
        title: 'Module 1',
        content_type: 'wealth-immersion',
        source_path: 'modules/m1.docx',
      },
    })

    const reranked = rerank([result], 'test')

    expect(reranked[0]!.sourceAttribution).toBe(
      'Module 1 (wealth-immersion) - modules/m1.docx'
    )
  })

  it('should show "Unknown source" when metadata is null', () => {
    const result = createResult({ metadata: null })
    const reranked = rerank([result], 'test')
    expect(reranked[0]!.sourceAttribution).toBe('Unknown source')
  })

  it('should show "Unknown source" when metadata has no relevant fields', () => {
    const result = createResult({ metadata: { irrelevant: true } })
    const reranked = rerank([result], 'test')
    expect(reranked[0]!.sourceAttribution).toBe('Unknown source')
  })

  it('should include all fields in reranked results', () => {
    const result = createResult({
      id: 'test-id',
      documentId: 'doc-id',
      content: 'Some content here for the result that is long enough',
      score: 0.75,
      metadata: { title: 'Test' },
      source: 'keyword',
    })

    const reranked = rerank([result], 'test')

    expect(reranked[0]).toMatchObject({
      id: 'test-id',
      documentId: 'doc-id',
      content: 'Some content here for the result that is long enough',
      metadata: { title: 'Test' },
      source: 'keyword',
    })
    expect(reranked[0]!.score).toBeGreaterThan(0)
    expect(typeof reranked[0]!.sourceAttribution).toBe('string')
  })
})
