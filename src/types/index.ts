export type MembershipTierId = 'community' | 'wealth-immersion' | 'coaching' | 'elite'

export interface MembershipTier {
  id: MembershipTierId
  name: string
  price: string
  priceValue: number
  description: string
  features: string[]
  teachableUrl: string
  recommended: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SourceAttribution[]
  recommendation?: ProductRecommendation
  createdAt: string
}

export interface SourceAttribution {
  title: string
  contentType: string
  similarity: number
}

export interface ProductRecommendation {
  tierId: MembershipTierId
  tierName: string
  reason: string
  ctaUrl: string
}

export interface QuizAnswer {
  questionId: string
  value: string | string[]
}

export interface QuizResult {
  recommendedTierId: MembershipTierId
  scores: {
    experience: number
    budget: number
    urgency: number
    learningStyle: number
  }
  answers: QuizAnswer[]
}

export interface Lead {
  id: string
  email: string
  name?: string
  sessionId: string
  score: number
  scoreTier: 'cold' | 'warm' | 'hot'
  source: string
  createdAt: string
  updatedAt: string
}

export interface LeadEvent {
  id: string
  sessionId: string
  leadId?: string
  eventType: string
  metadata?: Record<string, unknown>
  points: number
  createdAt: string
}
