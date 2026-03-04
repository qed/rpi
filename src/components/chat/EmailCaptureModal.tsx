'use client'

import { useState } from 'react'
import { z } from 'zod'

const emailSchema = z.string().email('Please enter a valid email address')

interface EmailCaptureModalProps {
  sessionId: string | null
  onComplete: () => void
}

export function EmailCaptureModal({ sessionId, onComplete }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = emailSchema.safeParse(email)
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? 'Invalid email')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sessionId, source: 'chat' }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit email')
      }

      onComplete()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-t border-gray-200 bg-rpiCream p-4">
      <p className="mb-2 text-sm font-medium text-rpiNavy">
        To continue chatting, please share your email:
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rpiGold focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-rpiGold px-4 py-2 text-sm font-medium text-white hover:bg-rpiNavy disabled:opacity-50"
        >
          {isSubmitting ? '...' : 'Continue'}
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
