import { cookies } from 'next/headers'

const SESSION_COOKIE = 'rpi_session_id'

export function getSessionId(): string | undefined {
  const cookieStore = cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export function getRequiredSessionId(): string {
  const sessionId = getSessionId()
  if (!sessionId) {
    throw new Error('Session ID not found')
  }
  return sessionId
}
