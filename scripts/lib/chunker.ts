/**
 * Document chunker for embedding generation.
 *
 * Splits documents into ~500-token chunks with ~50-token overlap.
 * Preserves paragraph boundaries where possible.
 * Uses a simple whitespace tokenizer (1 token ~ 0.75 words as approximation).
 */

export interface Chunk {
  content: string
  chunkIndex: number
  tokenCount: number
  metadata: Record<string, unknown>
}

export interface ChunkOptions {
  /** Target chunk size in tokens (default: 500) */
  targetTokens?: number
  /** Overlap in tokens between consecutive chunks (default: 50) */
  overlapTokens?: number
}

const DEFAULT_TARGET_TOKENS = 500
const DEFAULT_OVERLAP_TOKENS = 50

/**
 * Rough token count estimate: ~1.33 tokens per word (GPT-style tokenization).
 * Good enough for chunking purposes.
 */
export function estimateTokens(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0)
  return Math.ceil(words.length * 1.33)
}

/**
 * Chunks a document's content into overlapping segments.
 */
export function chunkDocument(
  content: string,
  documentMetadata: Record<string, unknown>,
  options?: ChunkOptions
): Chunk[] {
  const targetTokens = options?.targetTokens ?? DEFAULT_TARGET_TOKENS
  const overlapTokens = options?.overlapTokens ?? DEFAULT_OVERLAP_TOKENS

  // Split into paragraphs first (preserve natural boundaries)
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0)

  if (paragraphs.length === 0) {
    return []
  }

  const chunks: Chunk[] = []
  let currentParagraphs: string[] = []
  let currentTokenCount = 0
  let chunkIndex = 0

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph)

    // If single paragraph exceeds target, split by sentences
    if (paragraphTokens > targetTokens && currentParagraphs.length === 0) {
      const subChunks = splitLargeParagraph(
        paragraph,
        targetTokens,
        overlapTokens,
        chunkIndex,
        documentMetadata
      )
      chunks.push(...subChunks)
      chunkIndex += subChunks.length
      continue
    }

    // If adding this paragraph would exceed the target, finalize current chunk
    if (currentTokenCount + paragraphTokens > targetTokens && currentParagraphs.length > 0) {
      const chunkContent = currentParagraphs.join('\n\n')
      chunks.push({
        content: chunkContent,
        chunkIndex,
        tokenCount: estimateTokens(chunkContent),
        metadata: { ...documentMetadata },
      })
      chunkIndex++

      // Overlap: keep the last paragraph(s) that fit within overlapTokens
      const overlapParagraphs: string[] = []
      let overlapCount = 0
      for (let i = currentParagraphs.length - 1; i >= 0; i--) {
        const pTokens = estimateTokens(currentParagraphs[i] ?? '')
        if (overlapCount + pTokens > overlapTokens) break
        overlapParagraphs.unshift(currentParagraphs[i] ?? '')
        overlapCount += pTokens
      }

      currentParagraphs = overlapParagraphs
      currentTokenCount = overlapCount
    }

    currentParagraphs.push(paragraph)
    currentTokenCount += paragraphTokens
  }

  // Finalize last chunk
  if (currentParagraphs.length > 0) {
    const chunkContent = currentParagraphs.join('\n\n')
    chunks.push({
      content: chunkContent,
      chunkIndex,
      tokenCount: estimateTokens(chunkContent),
      metadata: { ...documentMetadata },
    })
  }

  return chunks
}

function splitLargeParagraph(
  paragraph: string,
  targetTokens: number,
  overlapTokens: number,
  startIndex: number,
  metadata: Record<string, unknown>
): Chunk[] {
  // Split by sentences
  const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [paragraph]
  const chunks: Chunk[] = []
  let currentSentences: string[] = []
  let currentTokenCount = 0
  let chunkIndex = startIndex

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence)

    if (currentTokenCount + sentenceTokens > targetTokens && currentSentences.length > 0) {
      const chunkContent = currentSentences.join(' ').trim()
      chunks.push({
        content: chunkContent,
        chunkIndex,
        tokenCount: estimateTokens(chunkContent),
        metadata: { ...metadata },
      })
      chunkIndex++

      // Overlap: keep last sentence(s) within overlapTokens
      const overlapSentences: string[] = []
      let overlapCount = 0
      for (let i = currentSentences.length - 1; i >= 0; i--) {
        const sTokens = estimateTokens(currentSentences[i] ?? '')
        if (overlapCount + sTokens > overlapTokens) break
        overlapSentences.unshift(currentSentences[i] ?? '')
        overlapCount += sTokens
      }

      currentSentences = overlapSentences
      currentTokenCount = overlapCount
    }

    currentSentences.push(sentence)
    currentTokenCount += sentenceTokens
  }

  if (currentSentences.length > 0) {
    const chunkContent = currentSentences.join(' ').trim()
    chunks.push({
      content: chunkContent,
      chunkIndex,
      tokenCount: estimateTokens(chunkContent),
      metadata: { ...metadata },
    })
  }

  return chunks
}
