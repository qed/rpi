'use client'

import type { QuizQuestion } from '@/lib/quiz/types'

interface QuestionRendererProps {
  question: QuizQuestion
  value: string | string[] | undefined
  onChange: (questionId: string, value: string | string[]) => void
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  if (question.type === 'text') {
    return (
      <div className="mb-6">
        <label className="mb-2 block font-heading text-lg text-rpiNavy">{question.text}</label>
        <input
          type={question.id === 'email' ? 'email' : 'text'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-rpiCharcoal focus:border-rpiGold focus:outline-none focus:ring-1 focus:ring-rpiGold"
          placeholder={question.id === 'email' ? 'your@email.com' : ''}
        />
      </div>
    )
  }

  if (question.type === 'multi') {
    const selected = (value as string[] | undefined) ?? []
    return (
      <div className="mb-6">
        <p className="mb-3 font-heading text-lg text-rpiNavy">{question.text}</p>
        <div className="space-y-2">
          {question.options?.map((option) => {
            const isSelected = selected.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const next = isSelected
                    ? selected.filter((v) => v !== option.value)
                    : [...selected, option.value]
                  onChange(question.id, next)
                }}
                className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'border-rpiGold bg-rpiGold/10 text-rpiNavy'
                    : 'border-gray-200 text-rpiCharcoal hover:border-rpiGold/50'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Single select
  const selectedValue = value as string | undefined
  return (
    <div className="mb-6">
      <p className="mb-3 font-heading text-lg text-rpiNavy">{question.text}</p>
      <div className="space-y-2">
        {question.options?.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(question.id, option.value)}
            className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-colors ${
              selectedValue === option.value
                ? 'border-rpiGold bg-rpiGold/10 text-rpiNavy'
                : 'border-gray-200 text-rpiCharcoal hover:border-rpiGold/50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
