import type { DimensionScores, QuizAnswerEntry, QuizOption } from './types'
import { QUIZ_QUESTIONS } from './schema'

export function scoreAnswers(answers: QuizAnswerEntry[]): DimensionScores {
  const scores: DimensionScores = {
    experience: 0,
    budget: 0,
    urgency: 0,
    learningStyle: 0,
  }

  for (const answer of answers) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId)
    if (!question?.options) continue

    const selectedValues = Array.isArray(answer.value) ? answer.value : [answer.value]

    for (const val of selectedValues) {
      const option = question.options.find((o: QuizOption) => o.value === val)
      if (!option) continue

      for (const [key, points] of Object.entries(option.scores)) {
        scores[key as keyof DimensionScores] += points
      }
    }
  }

  return scores
}
