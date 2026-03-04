/**
 * Embedding Generation Script -- One-time script
 *
 * Reads all content_documents from Supabase, chunks them, generates
 * embeddings via Voyage AI, and inserts into the content_chunks table.
 *
 * Usage: npx tsx scripts/generate-embeddings.ts
 */

import { createAdminClient } from '../src/lib/supabase/admin'
import type { Database } from '../src/types/database'
import { chunkDocument } from './lib/chunker'
import { generateEmbeddings } from './lib/embedder'
import type { EmbeddedChunk } from './lib/embedder'

type ContentDocumentRow = Database['public']['Tables']['content_documents']['Row']
type ContentChunkInsert = Database['public']['Tables']['content_chunks']['Insert']

const UPSERT_BATCH_SIZE = 50

async function main(): Promise<void> {
  console.log('=== RPI Embedding Generation ===\n')

  const supabase = createAdminClient()

  // Fetch all documents
  console.log('Fetching documents...')
  const { data: rawDocuments, error: fetchError } = await supabase
    .from('content_documents')
    .select('*')
    .order('created_at', { ascending: true })

  if (fetchError) {
    console.error(`Failed to fetch documents: ${fetchError.message}`)
    process.exit(1)
  }

  // Cast to the known row type since Supabase generics don't resolve in scripts
  const documents = (rawDocuments ?? []) as ContentDocumentRow[]

  if (documents.length === 0) {
    console.log('No documents found. Run extract-content.ts first.')
    return
  }

  console.log(`Found ${documents.length} documents\n`)

  let totalChunks = 0
  let totalEmbedded = 0

  for (const doc of documents) {
    console.log(`\nProcessing: "${doc.title}" (${doc.content_type})`)

    // Check if chunks already exist for this document
    const { count } = await supabase
      .from('content_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', doc.id)

    if (count && count > 0) {
      console.log(`  SKIP: ${count} chunks already exist`)
      continue
    }

    // Chunk the document
    const chunks = chunkDocument(doc.content, {
      document_id: doc.id,
      content_type: doc.content_type,
      title: doc.title,
      source_path: doc.source_path,
    })

    if (chunks.length === 0) {
      console.log(`  SKIP: no chunks generated (content too short?)`)
      continue
    }

    console.log(`  Chunked into ${chunks.length} segments`)
    totalChunks += chunks.length

    // Generate embeddings
    let embeddedChunks: EmbeddedChunk[]
    try {
      embeddedChunks = await generateEmbeddings(chunks)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`  ERROR generating embeddings: ${message}`)
      continue
    }

    // Insert into content_chunks in batches
    for (let i = 0; i < embeddedChunks.length; i += UPSERT_BATCH_SIZE) {
      const batch = embeddedChunks.slice(i, i + UPSERT_BATCH_SIZE)
      const rows: ContentChunkInsert[] = batch.map((chunk) => ({
        document_id: doc.id,
        content: chunk.content,
        embedding: chunk.embedding,
        chunk_index: chunk.chunkIndex,
        token_count: chunk.tokenCount,
        metadata: chunk.metadata,
      }))

      // SAFETY: Supabase v2.98 generic resolution fails for typed Database schemas
      // in scripts. The row shape is validated by ContentChunkInsert above.
      const { error: insertError } = await (supabase.from('content_chunks') as unknown as {
        insert(values: ContentChunkInsert[]): Promise<{ error: { message: string } | null }>
      }).insert(rows)

      if (insertError) {
        console.error(`  ERROR inserting batch: ${insertError.message}`)
      } else {
        totalEmbedded += batch.length
        console.log(`  Inserted chunks ${i + 1}-${i + batch.length}`)
      }
    }
  }

  console.log(`\n=== Embedding Summary ===`)
  console.log(`  Total chunks created: ${totalChunks}`)
  console.log(`  Total chunks embedded & stored: ${totalEmbedded}`)
  console.log('\nDone!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
