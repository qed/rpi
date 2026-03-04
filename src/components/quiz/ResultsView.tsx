import type { QuizRecommendation } from '@/lib/quiz/types'
import { MEMBERSHIP_TIERS } from '@/lib/constants'
import { TierComparison } from './TierComparison'
import { QuizCTA } from './QuizCTA'

interface ResultsViewProps {
  recommendation: QuizRecommendation
}

export function ResultsView({ recommendation }: ResultsViewProps) {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === recommendation.tierId)
  if (!tier) return null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-3xl text-rpiNavy">Your Recommended Program</h2>
        <p className="mt-2 text-lg text-rpiSlate">{recommendation.reason}</p>
      </div>

      <div className="mb-8 rounded-2xl border-2 border-rpiGold bg-white p-6 shadow-lg">
        <h3 className="font-heading text-2xl text-rpiNavy">{tier.name}</h3>
        <p className="mt-1 text-2xl font-bold text-rpiGold">{tier.price}</p>
        <p className="mt-2 text-rpiSlate">{tier.description}</p>
        <ul className="mt-4 space-y-2">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-center text-sm text-rpiCharcoal">
              <span className="mr-2 text-rpiGold">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        <QuizCTA tierId={tier.id} teachableUrl={tier.teachableUrl} />
      </div>

      <TierComparison highlightedTierId={recommendation.tierId} />
    </div>
  )
}
