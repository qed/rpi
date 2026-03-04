'use client'

import { useState, useEffect } from 'react'

const SESSION_KEY = 'rpi_session_id'

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Try to get from localStorage first (client-side persistence)
    let stored = localStorage.getItem(SESSION_KEY)
    if (!stored) {
      // Try to read from cookie
      const cookies = document.cookie.split(';')
      const sessionCookie = cookies.find((c) => c.trim().startsWith('rpi_session_id='))
      if (sessionCookie) {
        stored = sessionCookie.split('=')[1] ?? null
      }
    }
    if (!stored) {
      // Generate a new session ID
      stored = `ses_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`
    }
    localStorage.setItem(SESSION_KEY, stored)
    setSessionId(stored)
  }, [])

  return sessionId
}
