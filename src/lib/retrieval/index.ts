/**
 * Retrieval Engine -- Main entry point.
 *
 * Provides a unified search() function that:
 * 1. Embeds the user query via Voyage AI
 * 2. Runs hybrid search (vector + keyword)
 * 3. Re-ranks results to top-5 with source attribution
 */

import type { VoyageClient } from '@/lib/embeddings/voyage'
import { hybridSearch } from './hybrid-search'
import type { HybridSearchClient, HybridSearchOptions } from './hybrid-search'
import { rerank } from './reranker'
import type { RerankedResult, RerankerOptions } from './reranker'

export type { VectorSearchResult, VectorSearchClient } from './vector-search'
export type { KeywordSearchResult, KeywordSearchClient } from './keyword-search'
export type { HybridSearchResult, HybridSearchOptions, HybridSearchClient } from './hybrid-search'
export type { RerankedResult, RerankerOptions } from './reranker'

export { vectorSearch } from './vector-search'
export { keywordSearch, buildTsQuery } from './keyword-search'
export { hybridSearch, mergeResults } from './hybrid-search'
export { rerank, computeTermOverlap } from './reranker'

export interface SearchOptions {
  hybrid?: HybridSearchOptions
  reranker?: RerankerOptions
}

export interface SearchDependencies {
  supabase: HybridSearchClient
  voyageClient: VoyageClient
}

/**
 * Main search function: embed query, hybrid search, re-rank.
 */
export async function search(
  deps: SearchDependencies,
  query: string,
  options?: SearchOptions
): Promise<RerankedResult[]> {
  if (query.trim().length === 0) {
    return []
  }

  // 1. Embed the query
  const queryEmbedding = await deps.voyageClient.embedQuery(query)

  // 2. Hybrid search
  const hybridResults = await hybridSearch(
    deps.supabase,
    queryEmbedding,
    query,
    options?.hybrid
  )

  // 3. Re-rank
  return rerank(hybridResults, query, options?.reranker)
}
