/**
 * Hybrid search combining vector similarity and keyword search.
 *
 * Merges results from both search strategies using configurable weights
 * (default: 0.7 vector, 0.3 keyword).
 */

import { vectorSearch } from './vector-search'
import type { VectorSearchResult, VectorSearchClient } from './vector-search'
import { keywordSearch } from './keyword-search'
import type { KeywordSearchResult, KeywordSearchClient } from './keyword-search'

export interface HybridSearchResult {
  id: string
  documentId: string
  content: string
  score: number
  metadata: Record<string, unknown> | null
  source: 'vector' | 'keyword' | 'both'
}

export interface HybridSearchOptions {
  vectorWeight?: number
  keywordWeight?: number
  matchCount?: number
  matchThreshold?: number
}

/** Combined client interface for hybrid search. */
export type HybridSearchClient = VectorSearchClient & KeywordSearchClient

const DEFAULT_VECTOR_WEIGHT = 0.7
const DEFAULT_KEYWORD_WEIGHT = 0.3
const DEFAULT_COUNT = 20

export async function hybridSearch(
  supabase: HybridSearchClient,
  queryEmbedding: number[],
  queryText: string,
  options?: HybridSearchOptions
): Promise<HybridSearchResult[]> {
  const vectorWeight = options?.vectorWeight ?? DEFAULT_VECTOR_WEIGHT
  const keywordWeight = options?.keywordWeight ?? DEFAULT_KEYWORD_WEIGHT
  const matchCount = options?.matchCount ?? DEFAULT_COUNT

  // Run both searches in parallel
  const [vectorResults, keywordResults] = await Promise.all([
    vectorSearch(supabase, queryEmbedding, {
      matchThreshold: options?.matchThreshold,
      matchCount,
    }),
    keywordSearch(supabase, queryText, { matchCount }),
  ])

  // Merge results using weighted scoring
  return mergeResults(vectorResults, keywordResults, vectorWeight, keywordWeight)
}

export function mergeResults(
  vectorResults: VectorSearchResult[],
  keywordResults: KeywordSearchResult[],
  vectorWeight: number,
  keywordWeight: number
): HybridSearchResult[] {
  const resultMap = new Map<string, HybridSearchResult>()

  // Normalize vector scores (already 0-1 similarity)
  for (const result of vectorResults) {
    resultMap.set(result.id, {
      id: result.id,
      documentId: result.documentId,
      content: result.content,
      score: result.similarity * vectorWeight,
      metadata: result.metadata,
      source: 'vector',
    })
  }

  // Normalize keyword scores by rank position (1/rank)
  for (let i = 0; i < keywordResults.length; i++) {
    const result = keywordResults[i]
    if (!result) continue

    const keywordScore = (1 / (i + 1)) * keywordWeight
    const existing = resultMap.get(result.id)

    if (existing) {
      existing.score += keywordScore
      existing.source = 'both'
    } else {
      resultMap.set(result.id, {
        id: result.id,
        documentId: result.documentId,
        content: result.content,
        score: keywordScore,
        metadata: result.metadata,
        source: 'keyword',
      })
    }
  }

  // Sort by combined score descending
  return Array.from(resultMap.values()).sort((a, b) => b.score - a.score)
}
