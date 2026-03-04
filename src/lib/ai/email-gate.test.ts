import { describe, it, expect } from 'vitest'
import { checkEmailGate } from './email-gate'

describe('checkEmailGate', () => {
  it('does not require email when count is below threshold', () => {
    const result = checkEmailGate(2, false)
    expect(result.requiresEmail).toBe(false)
    expect(result.messageCount).toBe(2)
  })

  it('requires email when count reaches threshold', () => {
    const result = checkEmailGate(3, false)
    expect(result.requiresEmail).toBe(true)
  })

  it('requires email when count exceeds threshold', () => {
    const result = checkEmailGate(5, false)
    expect(result.requiresEmail).toBe(true)
  })

  it('does not require email when user already has email', () => {
    const result = checkEmailGate(10, true)
    expect(result.requiresEmail).toBe(false)
  })

  it('does not require email at count 0', () => {
    const result = checkEmailGate(0, false)
    expect(result.requiresEmail).toBe(false)
  })
})
