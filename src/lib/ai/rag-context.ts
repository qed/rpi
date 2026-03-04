import { search } from '@/lib/retrieval'
import type { SearchDependencies } from '@/lib/retrieval'
import { createAdminClient } from '@/lib/supabase/admin'
import { createVoyageClient } from '@/lib/embeddings/voyage'

export interface RAGContext {
  contextText: string
  sources: { title: string; contentType: string; similarity: number }[]
}

function getSearchDeps(): SearchDependencies {
  // The retrieval engine uses narrow DI interfaces that are structurally compatible
  // with the Supabase client at runtime. We cast to satisfy the type system.
  const supabase = createAdminClient() as unknown as SearchDependencies['supabase']
  return {
    supabase,
    voyageClient: createVoyageClient(),
  }
}

export async function buildRAGContext(query: string): Promise<RAGContext> {
  try {
    const results = await search(getSearchDeps(), query)

    if (results.length === 0) {
      return { contextText: '', sources: [] }
    }

    const contextText = results
      .map((r, i) => `[Source ${i + 1}]: ${r.content}`)
      .join('\n\n')

    const sources = results.map((r) => ({
      title: r.sourceAttribution,
      contentType: (r.metadata?.content_type as string) ?? 'unknown',
      similarity: r.score,
    }))

    return { contextText, sources }
  } catch {
    // If retrieval fails, continue without context
    return { contextText: '', sources: [] }
  }
}

export function injectContext(systemPrompt: string, context: RAGContext): string {
  if (!context.contextText) return systemPrompt

  return `${systemPrompt}

## Relevant Context from RPI Content Library
Use the following information to answer the user's question. Cite sources when referencing specific content.

${context.contextText}`
}
