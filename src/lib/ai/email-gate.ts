import { RATE_LIMIT } from '@/lib/constants'

export interface EmailGateResult {
  requiresEmail: boolean
  messageCount: number
}

export function checkEmailGate(messageCount: number, hasEmail: boolean): EmailGateResult {
  if (hasEmail) {
    return { requiresEmail: false, messageCount }
  }

  return {
    requiresEmail: messageCount >= RATE_LIMIT.emailGateMessageCount,
    messageCount,
  }
}
