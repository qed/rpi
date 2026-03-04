import * as cheerio from 'cheerio'
import * as fs from 'fs/promises'
import type { ExtractionResult } from './docx'

export async function extractHtml(filePath: string): Promise<ExtractionResult> {
  const rawHtml = await fs.readFile(filePath, 'utf-8')
  const $ = cheerio.load(rawHtml)

  // Remove script and style tags
  $('script, style, nav, footer, header').remove()

  const content = $('body').text().trim()
  const metaTitle = $('title').text().trim()

  const title = deriveTitle(filePath, metaTitle, content)

  return {
    title,
    content,
    metadata: {
      format: 'html',
      metaDescription: $('meta[name="description"]').attr('content') ?? null,
    },
  }
}

function deriveTitle(
  filePath: string,
  metaTitle: string,
  content: string
): string {
  if (metaTitle.length > 0) {
    return metaTitle
  }
  const filename = filePath.split(/[/\\]/).pop() ?? 'untitled'
  const nameWithoutExt = filename.replace(/\.html?$/i, '')
  if (nameWithoutExt.length < 3 && content.length > 0) {
    const firstLine = content.split('\n')[0]?.trim() ?? 'Untitled'
    return firstLine.slice(0, 200)
  }
  return nameWithoutExt
}
