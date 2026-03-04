import { describe, it, expect } from 'vitest'
import { getStarterQuestions } from './starter-questions'

describe('getStarterQuestions', () => {
  it('returns an array of questions', () => {
    const questions = getStarterQuestions()
    expect(Array.isArray(questions)).toBe(true)
    expect(questions.length).toBeGreaterThan(0)
  })

  it('returns strings', () => {
    const questions = getStarterQuestions()
    for (const q of questions) {
      expect(typeof q).toBe('string')
    }
  })

  it('returns a new array each time (not reference)', () => {
    const a = getStarterQuestions()
    const b = getStarterQuestions()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})
