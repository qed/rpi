import type { SourceAttribution as SourceType } from '@/types'

interface SourceAttributionProps {
  sources: SourceType[]
}

export function SourceAttribution({ sources }: SourceAttributionProps) {
  return (
    <div className="mt-2 border-t border-gray-200 pt-2">
      <p className="text-xs font-medium text-gray-500">Sources:</p>
      <ul className="mt-1 space-y-0.5">
        {sources.map((source, idx) => (
          <li key={idx} className="text-xs text-gray-400">
            {source.title} ({source.contentType})
          </li>
        ))}
      </ul>
    </div>
  )
}
