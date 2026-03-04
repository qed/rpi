import type { DimensionScores, QuizRecommendation } from './types'
import type { MembershipTierId } from '@/types'

interface TierRule {
  tierId: MembershipTierId
  tierName: string
  match: (scores: DimensionScores) => boolean
  reason: string
}

const TIER_RULES: TierRule[] = [
  {
    tierId: 'elite',
    tierName: 'Elite Investor',
    match: (s) => s.budget >= 7 && s.experience >= 3,
    reason:
      'Your significant experience and investment capacity make you an ideal fit for our premium, hands-on Elite program with direct access to Monika.',
  },
  {
    tierId: 'coaching',
    tierName: 'Personal Coaching',
    match: (s) => s.learningStyle >= 3 && s.budget >= 4,
    reason:
      'Your preference for personalized guidance and your budget range make our 1:1 coaching program the perfect fit for accelerating your results.',
  },
  {
    tierId: 'wealth-immersion',
    tierName: 'Wealth Immersion Program',
    match: (s) => s.experience >= 1 && s.budget >= 2,
    reason:
      "Our flagship 7-module program will give you the comprehensive foundation and tools you need to build real estate wealth, matched to your goals and budget.",
  },
  {
    tierId: 'community',
    tierName: 'Community Access',
    match: () => true, // Default fallback
    reason:
      "Our Community is the perfect place to start your journey — connect with like-minded investors, join monthly calls, and access our resource library.",
  },
]

export function recommendTier(scores: DimensionScores): QuizRecommendation {
  for (const rule of TIER_RULES) {
    if (rule.match(scores)) {
      return {
        tierId: rule.tierId,
        tierName: rule.tierName,
        reason: rule.reason,
        scores,
      }
    }
  }

  // Should never reach here due to default rule, but TypeScript needs it
  return {
    tierId: 'community',
    tierName: 'Community Access',
    reason: 'Start your journey with our Community.',
    scores,
  }
}
