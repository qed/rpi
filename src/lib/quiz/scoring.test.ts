import { describe, it, expect } from 'vitest'
import { scoreAnswers } from './scoring'

describe('scoreAnswers', () => {
  it('scores beginner single answers', () => {
    const scores = scoreAnswers([
      { questionId: 'experience_level', value: 'beginner' },
      { questionId: 'current_portfolio', value: 'under_50k' },
    ])
    expect(scores.experience).toBe(1)
    expect(scores.budget).toBe(1)
  })

  it('scores experienced answers higher', () => {
    const scores = scoreAnswers([
      { questionId: 'experience_level', value: 'advanced' },
      { questionId: 'current_portfolio', value: 'over_1m' },
    ])
    expect(scores.experience).toBe(4)
    expect(scores.budget).toBe(4)
  })

  it('scores multi-select answers (accumulates)', () => {
    const scores = scoreAnswers([
      { questionId: 'goals', value: ['passive_income', 'quit_job', 'scale'] },
    ])
    // passive_income: urgency 1, quit_job: urgency 3, scale: urgency 2 + experience 1
    expect(scores.urgency).toBe(6)
    expect(scores.experience).toBe(1)
  })

  it('handles unknown questionId gracefully', () => {
    const scores = scoreAnswers([
      { questionId: 'nonexistent', value: 'whatever' },
    ])
    expect(scores.experience).toBe(0)
    expect(scores.budget).toBe(0)
    expect(scores.urgency).toBe(0)
    expect(scores.learningStyle).toBe(0)
  })

  it('handles unknown option value gracefully', () => {
    const scores = scoreAnswers([
      { questionId: 'experience_level', value: 'unknown_value' },
    ])
    expect(scores.experience).toBe(0)
  })

  it('scores learning style', () => {
    const scores = scoreAnswers([
      { questionId: 'learning_preference', value: 'intensive' },
    ])
    expect(scores.learningStyle).toBe(4)
  })

  it('scores budget range', () => {
    const scores = scoreAnswers([
      { questionId: 'budget_range', value: '300_1000' },
    ])
    expect(scores.budget).toBe(3)
  })

  it('scores timeline urgency', () => {
    const scores = scoreAnswers([
      { questionId: 'timeline', value: 'now' },
    ])
    expect(scores.urgency).toBe(4)
  })

  it('returns zeros for empty answers', () => {
    const scores = scoreAnswers([])
    expect(scores).toEqual({ experience: 0, budget: 0, urgency: 0, learningStyle: 0 })
  })

  it('handles text question (email) — no options, no scores', () => {
    const scores = scoreAnswers([
      { questionId: 'email', value: 'test@test.com' },
    ])
    expect(scores).toEqual({ experience: 0, budget: 0, urgency: 0, learningStyle: 0 })
  })
})
