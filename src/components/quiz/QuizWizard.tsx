'use client'

import { useSession } from '@/hooks/useSession'
import { useQuiz } from '@/hooks/useQuiz'
import { ProgressBar } from './ProgressBar'
import { QuestionRenderer } from './QuestionRenderer'
import { ResultsView } from './ResultsView'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export function QuizWizard() {
  const sessionId = useSession()
  const {
    currentStep,
    totalSteps,
    currentQuestions,
    answers,
    setAnswer,
    canProceed,
    nextStep,
    prevStep,
    submit,
    recommendation,
    isSubmitting,
    error,
  } = useQuiz(sessionId)

  if (recommendation) {
    return <ResultsView recommendation={recommendation} />
  }

  const isLastStep = currentStep === totalSteps

  return (
    <div className="mx-auto max-w-xl">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <div className="min-h-[300px]">
        {currentQuestions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={answers.get(question.id)}
            onChange={setAnswer}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-1 rounded-lg px-4 py-2 text-rpiSlate transition-colors hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {isLastStep ? (
          <button
            onClick={submit}
            disabled={!canProceed || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-rpiGold px-6 py-2 font-medium text-white transition-colors hover:bg-rpiNavy disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Submitting...
              </>
            ) : (
              'Get My Recommendation'
            )}
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!canProceed}
            className="flex items-center gap-1 rounded-lg bg-rpiGold px-6 py-2 font-medium text-white transition-colors hover:bg-rpiNavy disabled:opacity-50"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
