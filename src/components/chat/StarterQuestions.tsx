'use client'

import { getStarterQuestions } from '@/lib/ai/starter-questions'

interface StarterQuestionsProps {
  onSelect: (question: string) => void
}

export function StarterQuestions({ onSelect }: StarterQuestionsProps) {
  const questions = getStarterQuestions()

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">Try asking:</p>
      {questions.map((question) => (
        <button
          key={question}
          onClick={() => onSelect(question)}
          className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-rpiSlate transition-colors hover:border-rpiGold hover:bg-rpiCream"
        >
          {question}
        </button>
      ))}
    </div>
  )
}
