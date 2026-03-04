import { describe, it, expect } from 'vitest'
import { QUIZ_QUESTIONS, getStepQuestions, TOTAL_STEPS } from './schema'

describe('quiz schema', () => {
  it('has questions for all 4 steps', () => {
    for (let step = 1; step <= TOTAL_STEPS; step++) {
      const questions = getStepQuestions(step)
      expect(questions.length).toBeGreaterThan(0)
    }
  })

  it('has 7 questions total', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(7)
  })

  it('step 1 has experience and portfolio questions', () => {
    const q = getStepQuestions(1)
    expect(q.map((q) => q.id)).toContain('experience_level')
    expect(q.map((q) => q.id)).toContain('current_portfolio')
  })

  it('step 2 has goals and timeline', () => {
    const q = getStepQuestions(2)
    expect(q.map((q) => q.id)).toContain('goals')
    expect(q.map((q) => q.id)).toContain('timeline')
  })

  it('step 3 has learning preference and budget', () => {
    const q = getStepQuestions(3)
    expect(q.map((q) => q.id)).toContain('learning_preference')
    expect(q.map((q) => q.id)).toContain('budget_range')
  })

  it('step 4 has email capture', () => {
    const q = getStepQuestions(4)
    expect(q.map((q) => q.id)).toContain('email')
  })

  it('all questions have required ids and text', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.id).toBeTruthy()
      expect(q.text).toBeTruthy()
      expect(q.required).toBe(true)
    }
  })

  it('options questions have options with values and labels', () => {
    const optionQuestions = QUIZ_QUESTIONS.filter((q) => q.type !== 'text')
    for (const q of optionQuestions) {
      expect(q.options).toBeDefined()
      expect(q.options!.length).toBeGreaterThan(0)
      for (const opt of q.options!) {
        expect(opt.value).toBeTruthy()
        expect(opt.label).toBeTruthy()
        expect(opt.scores).toBeDefined()
      }
    }
  })

  it('TOTAL_STEPS is 4', () => {
    expect(TOTAL_STEPS).toBe(4)
  })

  it('goals question is multi-select', () => {
    const goals = QUIZ_QUESTIONS.find((q) => q.id === 'goals')
    expect(goals?.type).toBe('multi')
  })
})
