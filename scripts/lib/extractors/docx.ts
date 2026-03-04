import mammoth from 'mammoth'
import * as fs from 'fs/promises'

export interface ExtractionResult {
  title: string
  content: string
  metadata: Record<string, unknown>
}

export async function extractDocx(filePath: string): Promise<ExtractionResult> {
  const buffer = await fs.readFile(filePath)
  const result = await mammoth.extractRawText({ buffer })

  const content = result.value.trim()
  const title = deriveTitle(filePath, content)

  return {
    title,
    content,
    metadata: {
      format: 'docx',
      warnings: result.messages.map((m) => m.message),
    },
  }
}

function deriveTitle(filePath: string, content: string): string {
  // Use filename without extension as title
  const filename = filePath.split(/[/\\]/).pop() ?? 'untitled'
  const nameWithoutExt = filename.replace(/\.docx$/i, '')
  // If filename is generic, use first line of content
  if (nameWithoutExt.length < 3 && content.length > 0) {
    const firstLine = content.split('\n')[0]?.trim() ?? 'Untitled'
    return firstLine.slice(0, 200)
  }
  return nameWithoutExt
}
