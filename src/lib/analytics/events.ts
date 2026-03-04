import { captureEvent, identifyUser } from './posthog'

export function trackChatOpened() {
  captureEvent('chat_opened')
}

export function trackMessageSent() {
  captureEvent('message_sent')
}

export function trackQuizStarted() {
  captureEvent('quiz_started')
}

export function trackQuizCompleted(tier: string) {
  captureEvent('quiz_completed', { recommended_tier: tier })
}

export function trackEmailCaptured(email: string, source: string) {
  identifyUser(email, { source })
  captureEvent('email_captured', { source })
}

export function trackCTAClicked(tierId: string, destination: string) {
  captureEvent('cta_clicked', { tier_id: tierId, destination })
}
