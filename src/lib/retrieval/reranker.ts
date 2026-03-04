/**
 * Re-ranker module.
 *
 * Takes top-N hybrid search results and re-ranks them to top-K
 * with source attribution. Uses a lightweight scoring heuristic
 * based on content relevance signals.
 */

import type { HybridSearchResult } from './hybrid-search'

export interface RerankedResult {
  id: string
  documentId: string
  content: string
  score: number
  metadata: Record<string, unknown> | null
  source: 'vector' | 'keyword' | 'both'
  sourceAttribution: string
}

export interface RerankerOptions {
  /** Maximum number of results to return (default: 5) */
  topK?: number
  /** Boost factor for results found by both vector and keyword search (default: 1.2) */
  bothSourceBoost?: number
}

const DEFAULT_TOP_K = 5
const DEFAULT_BOTH_BOOST = 1.2

/**
 * Re-ranks hybrid search results by applying additional scoring signals:
 * - Boost results found by both vector and keyword search
 * - Penalize very short content (likely fragments)
 * - Reward content with moderate length (substantive but focused)
 * - Add source attribution from metadata
 */
export function rerank(
  results: HybridSearchResult[],
  queryText: string,
  options?: RerankerOptions
): RerankedResult[] {
  const topK = options?.topK ?? DEFAULT_TOP_K
  const bothBoost = options?.bothSourceBoost ?? DEFAULT_BOTH_BOOST

  if (results.length === 0) {
    return []
  }

  const scored = results.map((result) => {
    let adjustedScore = result.score

    // Boost results found by both strategies
    if (result.source === 'both') {
      adjustedScore *= bothBoost
    }

    // Content length signal: penalize very short chunks, reward moderate length
    const contentLength = result.content.length
    if (contentLength < 50) {
      adjustedScore *= 0.5
    } else if (contentLength >= 200 && contentLength <= 2000) {
      adjustedScore *= 1.1
    }

    // Query term overlap signal
    const overlapBoost = computeTermOverlap(result.content, queryText)
    adjustedScore *= 1 + overlapBoost * 0.2

    // Build source attribution
    const sourceAttribution = buildAttribution(result.metadata)

    return {
      id: result.id,
      documentId: result.documentId,
      content: result.content,
      score: adjustedScore,
      metadata: result.metadata,
      source: result.source,
      sourceAttribution,
    }
  })

  // Sort by adjusted score descending and take top-K
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

/**
 * Computes the fraction of query terms that appear in the content.
 * Returns a value between 0 and 1.
 */
export function computeTermOverlap(content: string, query: string): number {
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)

  if (queryTerms.length === 0) {
    return 0
  }

  const contentLower = content.toLowerCase()
  const matchCount = queryTerms.filter((term) => contentLower.includes(term)).length

  return matchCount / queryTerms.length
}

function buildAttribution(metadata: Record<string, unknown> | null): string {
  if (!metadata) {
    return 'Unknown source'
  }

  const parts: string[] = []

  if (typeof metadata['title'] === 'string' && metadata['title'].length > 0) {
    parts.push(metadata['title'])
  }

  if (typeof metadata['content_type'] === 'string') {
    parts.push(`(${metadata['content_type']})`)
  }

  if (typeof metadata['source_path'] === 'string') {
    parts.push(`- ${metadata['source_path']}`)
  }

  return parts.length > 0 ? parts.join(' ') : 'Unknown source'
}
