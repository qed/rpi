/**
 * Vector similarity search using Supabase RPC (match_chunks).
 *
 * Calls the match_chunks Postgres function which performs
 * cosine similarity search on the content_chunks table.
 */

export interface VectorSearchResult {
  id: string
  documentId: string
  content: string
  similarity: number
  metadata: Record<string, unknown> | null
}

export interface VectorSearchOptions {
  matchThreshold?: number
  matchCount?: number
}

/** Narrow interface for Supabase RPC calls used by vector search. */
export interface VectorSearchClient {
  rpc(
    fn: string,
    args: Record<string, unknown>
  ): Promise<{
    data: Array<{
      id: string
      document_id: string
      content: string
      similarity: number
      metadata: Record<string, unknown> | null
    }> | null
    error: { message: string } | null
  }>
}

const DEFAULT_THRESHOLD = 0.5
const DEFAULT_COUNT = 20

export async function vectorSearch(
  supabase: VectorSearchClient,
  queryEmbedding: number[],
  options?: VectorSearchOptions
): Promise<VectorSearchResult[]> {
  const threshold = options?.matchThreshold ?? DEFAULT_THRESHOLD
  const count = options?.matchCount ?? DEFAULT_COUNT

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: count,
  })

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`)
  }

  if (!data) {
    return []
  }

  return data.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    similarity: row.similarity,
    metadata: row.metadata,
  }))
}
