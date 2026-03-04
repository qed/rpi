import type { ProductRecommendation as RecommendationType } from '@/types'

interface ProductRecommendationProps {
  recommendation: RecommendationType
}

export function ProductRecommendation({ recommendation }: ProductRecommendationProps) {
  return (
    <div className="mt-3 rounded-lg border border-rpiGold bg-rpiCream p-3">
      <p className="text-sm font-semibold text-rpiNavy">{recommendation.tierName}</p>
      <p className="mt-1 text-xs text-rpiSlate">{recommendation.reason}</p>
      <a
        href={recommendation.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block rounded-lg bg-rpiGold px-4 py-1.5 text-xs font-medium text-white hover:bg-rpiNavy"
      >
        Learn More
      </a>
    </div>
  )
}
