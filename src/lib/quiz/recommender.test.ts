import { describe, it, expect } from 'vitest'
import { recommendTier } from './recommender'

describe('recommendTier', () => {
  it('recommends Elite for high budget + high experience', () => {
    const result = recommendTier({
      experience: 4,
      budget: 8,
      urgency: 3,
      learningStyle: 4,
    })
    expect(result.tierId).toBe('elite')
    expect(result.tierName).toBe('Elite Investor')
  })

  it('recommends Coaching for high learning style + medium budget', () => {
    const result = recommendTier({
      experience: 2,
      budget: 4,
      urgency: 3,
      learningStyle: 3,
    })
    expect(result.tierId).toBe('coaching')
  })

  it('recommends Wealth Immersion for moderate scores', () => {
    const result = recommendTier({
      experience: 2,
      budget: 2,
      urgency: 2,
      learningStyle: 2,
    })
    expect(result.tierId).toBe('wealth-immersion')
  })

  it('recommends Community for low scores', () => {
    const result = recommendTier({
      experience: 0,
      budget: 1,
      urgency: 1,
      learningStyle: 1,
    })
    expect(result.tierId).toBe('community')
  })

  it('includes reason in recommendation', () => {
    const result = recommendTier({
      experience: 1,
      budget: 2,
      urgency: 1,
      learningStyle: 1,
    })
    expect(result.reason).toBeTruthy()
    expect(result.reason.length).toBeGreaterThan(10)
  })

  it('includes scores in recommendation', () => {
    const input = { experience: 3, budget: 5, urgency: 2, learningStyle: 2 }
    const result = recommendTier(input)
    expect(result.scores).toEqual(input)
  })

  it('elite requires both budget >= 7 AND experience >= 3', () => {
    // High budget but low experience should NOT get elite
    const result = recommendTier({
      experience: 1,
      budget: 8,
      urgency: 1,
      learningStyle: 1,
    })
    expect(result.tierId).not.toBe('elite')
  })

  it('coaching requires learning style >= 3 AND budget >= 4', () => {
    // High learning style but low budget — not coaching
    const result = recommendTier({
      experience: 1,
      budget: 2,
      urgency: 1,
      learningStyle: 4,
    })
    expect(result.tierId).not.toBe('coaching')
  })
})
