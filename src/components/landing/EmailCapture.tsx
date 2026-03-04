'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage('')

    const result = emailSchema.safeParse({ email })
    if (!result.success) {
      setErrorMessage(result.error.errors[0]?.message ?? 'Invalid email')
      setStatus('error')
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: result.data.email, source: 'email_capture' }),
      })

      if (!response.ok) {
        const data: unknown = await response.json()
        const errorData = data as { error?: string }
        throw new Error(errorData.error ?? 'Something went wrong')
      }

      setStatus('success')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <Section className="bg-rpiNavy">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Get Free Investing Tips
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join our newsletter for weekly insights on building wealth through
            real estate. No spam, unsubscribe anytime.
          </p>

          {status === 'success' ? (
            <div className="mt-8 rounded-lg bg-green-900/30 p-4">
              <p className="text-green-300" role="status">
                Thanks for subscribing! Check your inbox for a welcome message.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8" noValidate>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="email-capture" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-capture"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === 'error') {
                      setStatus('idle')
                      setErrorMessage('')
                    }
                  }}
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:border-rpiGold focus:outline-none focus:ring-2 focus:ring-rpiGold"
                  required
                  disabled={status === 'submitting'}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </div>

              {status === 'error' && errorMessage && (
                <p className="mt-3 text-sm text-red-400" role="alert">
                  {errorMessage}
                </p>
              )}
            </form>
          )}
        </div>
      </Container>
    </Section>
  )
}
