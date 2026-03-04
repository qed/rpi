import pdfParse from 'pdf-parse'
import * as fs from 'fs/promises'
import type { ExtractionResult } from './docx'

export async function extractPdf(filePath: string): Promise<ExtractionResult> {
  const buffer = await fs.readFile(filePath)
  const data = await pdfParse(buffer)

  const content = data.text.trim()
  const title = deriveTitle(filePath, content, data.info)

  return {
    title,
    content,
    metadata: {
      format: 'pdf',
      pages: data.numpages,
      info: data.info as Record<string, unknown>,
    },
  }
}

function deriveTitle(
  filePath: string,
  content: string,
  info: Record<string, unknown>
): string {
  // Prefer PDF metadata title
  if (typeof info?.['Title'] === 'string' && info['Title'].length > 0) {
    return info['Title']
  }
  // Fall back to filename
  const filename = filePath.split(/[/\\]/).pop() ?? 'untitled'
  const nameWithoutExt = filename.replace(/\.pdf$/i, '')
  if (nameWithoutExt.length < 3 && content.length > 0) {
    const firstLine = content.split('\n')[0]?.trim() ?? 'Untitled'
    return firstLine.slice(0, 200)
  }
  return nameWithoutExt
}
