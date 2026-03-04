export interface QuizQuestion {
  id: string
  step: number
  text: string
  type: 'single' | 'multi' | 'text'
  options?: QuizOption[]
  required: boolean
}

export interface QuizOption {
  value: string
  label: string
  scores: Partial<DimensionScores>
}

export interface DimensionScores {
  experience: number
  budget: number
  urgency: number
  learningStyle: number
}

export interface QuizSubmission {
  sessionId: string
  answers: QuizAnswerEntry[]
  email?: string
  name?: string
}

export interface QuizAnswerEntry {
  questionId: string
  value: string | string[]
}

export interface QuizRecommendation {
  tierId: 'community' | 'wealth-immersion' | 'coaching' | 'elite'
  tierName: string
  reason: string
  scores: DimensionScores
}
