/**
 * Embedding orchestrator for content chunks.
 *
 * Generates embeddings using Voyage AI (primary) with OpenAI fallback.
 * Batches requests (up to 128 per batch for Voyage AI).
 */

import type { Chunk } from './chunker'

const VOYAGE_BATCH_SIZE = 128
const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings'
const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings'

export interface EmbeddedChunk extends Chunk {
  embedding: number[]
}

interface VoyageResponse {
  data: Array<{ embedding: number[] }>
}

interface OpenAIResponse {
  data: Array<{ embedding: number[] }>
}

async function callVoyageAI(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY
  if (!apiKey) {
    throw new Error('VOYAGE_API_KEY is not set')
  }

  const response = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'voyage-3',
      input: texts,
      input_type: 'document',
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Voyage AI error (${response.status}): ${body}`)
  }

  const data = (await response.json()) as VoyageResponse
  return data.data.map((d) => d.embedding)
}

async function callOpenAI(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
      dimensions: 1024,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI error (${response.status}): ${body}`)
  }

  const data = (await response.json()) as OpenAIResponse
  return data.data.map((d) => d.embedding)
}

/**
 * Generates embeddings for an array of chunks.
 * Uses Voyage AI as primary provider, falls back to OpenAI.
 */
export async function generateEmbeddings(chunks: Chunk[]): Promise<EmbeddedChunk[]> {
  if (chunks.length === 0) return []

  const texts = chunks.map((c) => c.content)
  const allEmbeddings: number[][] = []

  // Process in batches
  for (let i = 0; i < texts.length; i += VOYAGE_BATCH_SIZE) {
    const batch = texts.slice(i, i + VOYAGE_BATCH_SIZE)
    console.log(`  Embedding batch ${i + 1}-${i + batch.length} of ${texts.length}...`)

    let embeddings: number[][]
    try {
      embeddings = await callVoyageAI(batch)
    } catch (voyageError) {
      const message = voyageError instanceof Error ? voyageError.message : String(voyageError)
      console.warn(`  Voyage AI failed: ${message}. Falling back to OpenAI...`)
      try {
        embeddings = await callOpenAI(batch)
      } catch (openaiError) {
        const oaiMessage = openaiError instanceof Error ? openaiError.message : String(openaiError)
        throw new Error(`Both embedding providers failed. OpenAI: ${oaiMessage}`)
      }
    }

    allEmbeddings.push(...embeddings)
  }

  return chunks.map((chunk, i) => ({
    ...chunk,
    embedding: allEmbeddings[i] ?? [],
  }))
}
