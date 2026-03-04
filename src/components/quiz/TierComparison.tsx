import { MEMBERSHIP_TIERS } from '@/lib/constants'
import type { MembershipTierId } from '@/types'

interface TierComparisonProps {
  highlightedTierId: MembershipTierId
}

export function TierComparison({ highlightedTierId }: TierComparisonProps) {
  return (
    <div>
      <h3 className="mb-4 text-center font-heading text-xl text-rpiNavy">Compare All Programs</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {MEMBERSHIP_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`rounded-xl border-2 p-4 ${
              tier.id === highlightedTierId
                ? 'border-rpiGold bg-rpiGold/5'
                : 'border-gray-200'
            }`}
          >
            <h4 className="font-heading text-lg text-rpiNavy">{tier.name}</h4>
            <p className="text-lg font-bold text-rpiGold">{tier.price}</p>
            <ul className="mt-2 space-y-1">
              {tier.features.map((f) => (
                <li key={f} className="text-xs text-rpiSlate">• {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
