/**
 * Content Extraction Pipeline -- One-time script
 *
 * Extracts text content from files in content/raw/, categorizes them,
 * cleans the text, deduplicates by SHA-256 hash, and upserts into
 * the content_documents table in Supabase.
 *
 * Usage: npx tsx scripts/extract-content.ts
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import * as crypto from 'crypto'
import { extractDocx, extractPdf, extractHtml } from './lib/extractors'
import type { ExtractionResult } from './lib/extractors'
import { categorize } from './lib/categorizer'
import { cleanText } from './lib/cleaner'
import { createAdminClient } from '../src/lib/supabase/admin'
import type { Database } from '../src/types/database'

type ContentDocumentInsert = Database['public']['Tables']['content_documents']['Insert']

const CONTENT_DIR = path.resolve(__dirname, '../content/raw')
const SUPPORTED_EXTENSIONS = new Set(['.docx', '.pdf', '.html', '.htm'])
const SKIPPED_EXTENSIONS = new Set(['.xlsx', '.xls', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'])

interface ProcessedDocument {
  title: string
  content: string
  content_type: string
  source_path: string
  metadata: Record<string, unknown>
  content_hash: string
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const subFiles = await collectFiles(fullPath)
      files.push(...subFiles)
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }

  return files
}

async function extractFile(filePath: string): Promise<ExtractionResult | null> {
  const ext = path.extname(filePath).toLowerCase()

  if (SKIPPED_EXTENSIONS.has(ext)) {
    console.log(`  SKIP (unsupported format): ${path.basename(filePath)}`)
    return null
  }

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    console.log(`  SKIP (unknown format): ${path.basename(filePath)}`)
    return null
  }

  switch (ext) {
    case '.docx':
      return extractDocx(filePath)
    case '.pdf':
      return extractPdf(filePath)
    case '.html':
    case '.htm':
      return extractHtml(filePath)
    default:
      return null
  }
}

function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf-8').digest('hex')
}

async function main(): Promise<void> {
  console.log('=== RPI Content Extraction Pipeline ===')
  console.log(`Content directory: ${CONTENT_DIR}`)

  // Check if content directory exists
  try {
    await fs.access(CONTENT_DIR)
  } catch {
    console.error(`Content directory not found: ${CONTENT_DIR}`)
    process.exit(1)
  }

  // Collect all files
  const allFiles = await collectFiles(CONTENT_DIR)
  console.log(`Found ${allFiles.length} total files\n`)

  const documents: ProcessedDocument[] = []
  const seenHashes = new Set<string>()
  let extracted = 0
  let skipped = 0
  let duplicates = 0

  for (const filePath of allFiles) {
    const relativePath = path.relative(CONTENT_DIR, filePath)
    console.log(`Processing: ${relativePath}`)

    try {
      const result = await extractFile(filePath)

      if (result === null) {
        skipped++
        continue
      }

      // Clean the extracted text
      const cleaned = cleanText(result.content)

      if (cleaned.length === 0) {
        console.log(`  SKIP (empty content after cleaning): ${relativePath}`)
        skipped++
        continue
      }

      // Deduplicate by content hash
      const hash = computeHash(cleaned)
      if (seenHashes.has(hash)) {
        console.log(`  SKIP (duplicate content): ${relativePath}`)
        duplicates++
        continue
      }
      seenHashes.add(hash)

      // Categorize
      const contentType = categorize(filePath)

      documents.push({
        title: result.title,
        content: cleaned,
        content_type: contentType,
        source_path: relativePath,
        metadata: result.metadata,
        content_hash: hash,
      })

      extracted++
      console.log(`  OK: "${result.title}" [${contentType}] (${cleaned.length} chars)`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`  ERROR: ${relativePath} -- ${message}`)
      skipped++
    }
  }

  console.log(`\n=== Extraction Summary ===`)
  console.log(`  Extracted: ${extracted}`)
  console.log(`  Skipped:   ${skipped}`)
  console.log(`  Duplicates: ${duplicates}`)
  console.log(`  Total docs: ${documents.length}`)

  if (documents.length === 0) {
    console.log('\nNo documents to insert. Exiting.')
    return
  }

  // Upload to Supabase
  console.log('\nUploading to Supabase...')
  const supabase = createAdminClient()

  // Upsert in batches of 50
  const BATCH_SIZE = 50
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE)
    const rows: ContentDocumentInsert[] = batch.map((doc) => ({
      title: doc.title,
      content: doc.content,
      content_type: doc.content_type,
      source_path: doc.source_path,
      metadata: doc.metadata,
      content_hash: doc.content_hash,
    }))

    // SAFETY: Supabase v2.98 generic resolution fails for typed Database schemas
    // in scripts. The row shape is validated by ContentDocumentInsert above.
    const { error } = await (supabase.from('content_documents') as unknown as {
      upsert(values: ContentDocumentInsert[], options: { onConflict: string }): Promise<{ error: { message: string } | null }>
    }).upsert(rows, { onConflict: 'content_hash' })

    if (error) {
      console.error(`  Batch error (${i}-${i + batch.length}): ${error.message}`)
    } else {
      console.log(`  Uploaded batch ${i + 1}-${i + batch.length} of ${documents.length}`)
    }
  }

  console.log('\nDone!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
