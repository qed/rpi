import { describe, it, expect } from 'vitest'
import {
  SITE_NAME,
  SITE_TAGLINE,
  MEMBERSHIP_TIERS,
  RATE_LIMIT,
  LEAD_SCORE_THRESHOLDS,
  EVENT_SCORES,
} from './constants'

describe('constants', () => {
  it('exports site name and tagline', () => {
    expect(SITE_NAME).toBe('RPI Education')
    expect(SITE_TAGLINE).toBe('Invest Like the Top 2%')
  })

  it('has 4 membership tiers', () => {
    expect(MEMBERSHIP_TIERS).toHaveLength(4)
  })

  it('marks wealth-immersion as recommended', () => {
    const recommended = MEMBERSHIP_TIERS.find((t) => t.recommended)
    expect(recommended?.id).toBe('wealth-immersion')
  })

  it('has correct tier ids', () => {
    const ids = MEMBERSHIP_TIERS.map((t) => t.id)
    expect(ids).toEqual(['community', 'wealth-immersion', 'coaching', 'elite'])
  })

  it('has rate limit defaults', () => {
    expect(RATE_LIMIT.messagesPerHour).toBe(20)
    expect(RATE_LIMIT.emailGateMessageCount).toBe(3)
  })

  it('has lead score thresholds', () => {
    expect(LEAD_SCORE_THRESHOLDS.cold).toBe(20)
    expect(LEAD_SCORE_THRESHOLDS.warm).toBe(50)
  })

  it('has event scores for all event types', () => {
    expect(EVENT_SCORES['page_view']).toBe(1)
    expect(EVENT_SCORES['chat_start']).toBe(5)
    expect(EVENT_SCORES['quiz_complete']).toBe(25)
    expect(EVENT_SCORES['cta_click']).toBe(20)
  })
})
