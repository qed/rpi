/**
 * Voyage AI embedding client.
 *
 * Model: voyage-3 (1024 dimensions)
 * Max batch size: 128 texts
 *
 * Used by the retrieval engine to embed user queries at search time.
 */

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings'
const VOYAGE_MODEL = 'voyage-3'
const MAX_BATCH_SIZE = 128

interface VoyageEmbeddingResponse {
  data: Array<{ embedding: number[]; index: number }>
  usage: { total_tokens: number }
}

export interface VoyageClient {
  embedQuery(text: string): Promise<number[]>
  embedBatch(texts: string[]): Promise<number[][]>
}

export function createVoyageClient(apiKey?: string): VoyageClient {
  const key = apiKey ?? process.env.VOYAGE_API_KEY

  if (!key) {
    throw new Error('VOYAGE_API_KEY is required')
  }

  async function embedTexts(
    texts: string[],
    inputType: 'query' | 'document'
  ): Promise<number[][]> {
    if (texts.length === 0) return []
    if (texts.length > MAX_BATCH_SIZE) {
      throw new Error(
        `Batch size ${texts.length} exceeds maximum of ${MAX_BATCH_SIZE}`
      )
    }

    const response = await fetch(VOYAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: VOYAGE_MODEL,
        input: texts,
        input_type: inputType,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Voyage AI API error (${response.status}): ${body}`)
    }

    const data = (await response.json()) as VoyageEmbeddingResponse
    // Sort by index to ensure correct ordering
    const sorted = [...data.data].sort((a, b) => a.index - b.index)
    return sorted.map((d) => d.embedding)
  }

  return {
    async embedQuery(text: string): Promise<number[]> {
      const results = await embedTexts([text], 'query')
      const embedding = results[0]
      if (!embedding) {
        throw new Error('No embedding returned for query')
      }
      return embedding
    },

    async embedBatch(texts: string[]): Promise<number[][]> {
      return embedTexts(texts, 'document')
    },
  }
}
