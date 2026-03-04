/**
 * Keyword search using PostgreSQL full-text search via Supabase.
 *
 * Performs a text search on the content_chunks table using
 * PostgreSQL's built-in tsvector/tsquery capabilities.
 */

export interface KeywordSearchResult {
  id: string
  documentId: string
  content: string
  metadata: Record<string, unknown> | null
}

export interface KeywordSearchOptions {
  matchCount?: number
}

/** Row shape returned by Supabase select on content_chunks. */
interface ChunkRow {
  id: string
  document_id: string
  content: string
  metadata: Record<string, unknown> | null
}

/** Narrow interface for the Supabase query chain used by keyword search. */
export interface KeywordSearchClient {
  from(table: string): {
    select(columns: string): {
      textSearch(column: string, query: string): {
        limit(count: number): Promise<{
          data: ChunkRow[] | null
          error: { message: string } | null
        }>
      }
    }
  }
}

const DEFAULT_COUNT = 20

/**
 * Converts a user query into a PostgreSQL tsquery-compatible string.
 * Splits on whitespace, strips non-alphanumeric chars, joins with ' & '.
 */
export function buildTsQuery(query: string): string {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^a-z0-9]/g, ''))
    .filter((term) => term.length > 0)

  if (terms.length === 0) {
    return ''
  }

  return terms.join(' & ')
}

export async function keywordSearch(
  supabase: KeywordSearchClient,
  query: string,
  options?: KeywordSearchOptions
): Promise<KeywordSearchResult[]> {
  const count = options?.matchCount ?? DEFAULT_COUNT
  const tsQuery = buildTsQuery(query)

  if (tsQuery.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('content_chunks')
    .select('id, document_id, content, metadata')
    .textSearch('content', tsQuery)
    .limit(count)

  if (error) {
    throw new Error(`Keyword search failed: ${error.message}`)
  }

  if (!data) {
    return []
  }

  return data.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    metadata: row.metadata,
  }))
}
