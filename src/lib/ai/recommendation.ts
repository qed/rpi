import { MEMBERSHIP_TIERS } from '@/lib/constants'
import type { ProductRecommendation } from '@/types'

const RECOMMENDATION_KEYWORDS = [
  'recommend',
  'suggestion',
  'which program',
  'which plan',
  'best for me',
  'should I join',
  'get started',
  'sign up',
  'pricing',
  'how much',
  'cost',
] as const

export function detectRecommendation(message: string): boolean {
  const lower = message.toLowerCase()
  return RECOMMENDATION_KEYWORDS.some((kw) => lower.includes(kw))
}

export function getRecommendationForResponse(responseText: string): ProductRecommendation | null {
  const lower = responseText.toLowerCase()

  for (const tier of MEMBERSHIP_TIERS) {
    if (lower.includes(tier.name.toLowerCase())) {
      return {
        tierId: tier.id,
        tierName: tier.name,
        reason: `Based on our conversation, the ${tier.name} might be a great fit for you.`,
        ctaUrl: tier.teachableUrl,
      }
    }
  }

  return null
}
