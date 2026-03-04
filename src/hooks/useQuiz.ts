'use client'

import { useState, useCallback } from 'react'
import { QUIZ_QUESTIONS, TOTAL_STEPS, getStepQuestions } from '@/lib/quiz/schema'
import type { QuizAnswerEntry, QuizRecommendation } from '@/lib/quiz/types'

export function useQuiz(sessionId: string | null) {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Map<string, string | string[]>>(new Map())
  const [recommendation, setRecommendation] = useState<QuizRecommendation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestions = getStepQuestions(currentStep)
  const totalQuestions = QUIZ_QUESTIONS.length

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(questionId, value)
      return next
    })
  }, [])

  const canProceed = currentQuestions.every((q) => {
    if (!q.required) return true
    const answer = answers.get(q.id)
    if (!answer) return false
    if (Array.isArray(answer)) return answer.length > 0
    return answer.length > 0
  })

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const submit = useCallback(async () => {
    if (!sessionId) return

    setIsSubmitting(true)
    setError(null)

    const answerEntries: QuizAnswerEntry[] = Array.from(answers.entries()).map(
      ([questionId, value]) => ({ questionId, value })
    )

    const email = answers.get('email') as string | undefined

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answers: answerEntries,
          email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const data: { recommendation: QuizRecommendation } = await response.json()
      setRecommendation(data.recommendation)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [sessionId, answers])

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    currentQuestions,
    totalQuestions,
    answers,
    setAnswer,
    canProceed,
    nextStep,
    prevStep,
    submit,
    recommendation,
    isSubmitting,
    error,
  }
}
