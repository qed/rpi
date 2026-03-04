import { describe, it, expect } from 'vitest'
import { detectRecommendation, getRecommendationForResponse } from './recommendation'

describe('detectRecommendation', () => {
  it('detects recommendation keywords', () => {
    expect(detectRecommendation('Can you recommend a program?')).toBe(true)
    expect(detectRecommendation('Which program is best for me?')).toBe(true)
    expect(detectRecommendation('How much does it cost?')).toBe(true)
    expect(detectRecommendation('I want to sign up')).toBe(true)
  })

  it('returns false for non-recommendation messages', () => {
    expect(detectRecommendation('Tell me about real estate')).toBe(false)
    expect(detectRecommendation('What is a REIT?')).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(detectRecommendation('RECOMMEND something')).toBe(true)
    expect(detectRecommendation('WHICH PROGRAM should I pick')).toBe(true)
  })
})

describe('getRecommendationForResponse', () => {
  it('returns recommendation when tier name mentioned', () => {
    const result = getRecommendationForResponse(
      'I think the Wealth Immersion Program would be great for you.'
    )
    expect(result).not.toBeNull()
    expect(result!.tierId).toBe('wealth-immersion')
  })

  it('returns first matching tier', () => {
    const result = getRecommendationForResponse(
      'Community Access is our entry level program.'
    )
    expect(result!.tierId).toBe('community')
  })

  it('returns null when no tier mentioned', () => {
    const result = getRecommendationForResponse(
      'Real estate investing is a great way to build wealth.'
    )
    expect(result).toBeNull()
  })

  it('detects coaching tier', () => {
    const result = getRecommendationForResponse(
      'Personal Coaching gives you direct access.'
    )
    expect(result!.tierId).toBe('coaching')
  })

  it('detects elite tier', () => {
    const result = getRecommendationForResponse(
      'Our Elite Investor program is for serious investors.'
    )
    expect(result!.tierId).toBe('elite')
  })

  it('includes ctaUrl', () => {
    const result = getRecommendationForResponse(
      'The Wealth Immersion Program covers all 7 keys.'
    )
    expect(result!.ctaUrl).toContain('teachable.com')
  })
})
