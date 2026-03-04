/**
 * Categorizes content based on its directory path within content/raw/.
 *
 * Examples:
 *   "Wealth Immersion Program Modules/Module 1/..." → "wealth-immersion-module-1"
 *   "Blog Posts/some-article.docx" → "blog-post"
 *   "Podcast Transcripts/episode-5.pdf" → "podcast-transcript"
 *   "Product Descriptions/course-a.html" → "product-description"
 */
export function categorize(sourcePath: string): string {
  // Normalize path separators and get the relative part after content/raw/
  const normalized = sourcePath.replace(/\\/g, '/')
  const rawIndex = normalized.indexOf('content/raw/')
  const relativePath =
    rawIndex >= 0 ? normalized.slice(rawIndex + 'content/raw/'.length) : normalized

  const parts = relativePath.split('/').filter((p) => p.length > 0)

  // Use directory structure to determine category
  if (parts.length === 0) {
    return 'uncategorized'
  }

  const topDir = parts[0]?.toLowerCase() ?? ''

  // Wealth Immersion Program Modules
  if (topDir.includes('wealth') && topDir.includes('immersion')) {
    const moduleMatch = relativePath.match(/module\s*(\d+)/i)
    if (moduleMatch?.[1]) {
      return `wealth-immersion-module-${moduleMatch[1]}`
    }
    return 'wealth-immersion'
  }

  // Blog Posts
  if (topDir.includes('blog')) {
    return 'blog-post'
  }

  // Podcast Transcripts
  if (topDir.includes('podcast')) {
    return 'podcast-transcript'
  }

  // Product Descriptions
  if (topDir.includes('product')) {
    return 'product-description'
  }

  // Default: slugify the top directory name
  return slugify(parts[0] ?? 'uncategorized')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'uncategorized'
}
