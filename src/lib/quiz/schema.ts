import type { QuizQuestion } from './types'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Step 1: Where are you now?
  {
    id: 'experience_level',
    step: 1,
    text: 'How would you describe your real estate investing experience?',
    type: 'single',
    required: true,
    options: [
      {
        value: 'beginner',
        label: "I'm just getting started — haven't purchased yet",
        scores: { experience: 1 },
      },
      {
        value: 'some',
        label: 'I own 1-2 investment properties',
        scores: { experience: 2 },
      },
      {
        value: 'experienced',
        label: 'I have 3+ properties or significant investing experience',
        scores: { experience: 3 },
      },
      {
        value: 'advanced',
        label: "I'm a seasoned investor looking to scale or optimize",
        scores: { experience: 4 },
      },
    ],
  },
  {
    id: 'current_portfolio',
    step: 1,
    text: 'What is your approximate net worth from investments?',
    type: 'single',
    required: true,
    options: [
      { value: 'under_50k', label: 'Under $50,000', scores: { budget: 1 } },
      { value: '50k_250k', label: '$50,000 — $250,000', scores: { budget: 2 } },
      { value: '250k_1m', label: '$250,000 — $1,000,000', scores: { budget: 3 } },
      { value: 'over_1m', label: 'Over $1,000,000', scores: { budget: 4 } },
    ],
  },
  // Step 2: What are your goals?
  {
    id: 'goals',
    step: 2,
    text: 'What are your main goals? (Select all that apply)',
    type: 'multi',
    required: true,
    options: [
      { value: 'passive_income', label: 'Generate passive income', scores: { urgency: 1 } },
      { value: 'wealth_building', label: 'Build long-term wealth', scores: { urgency: 1 } },
      { value: 'quit_job', label: 'Replace my job income', scores: { urgency: 3 } },
      { value: 'scale', label: 'Scale my existing portfolio', scores: { urgency: 2, experience: 1 } },
    ],
  },
  {
    id: 'timeline',
    step: 2,
    text: 'When do you want to take action?',
    type: 'single',
    required: true,
    options: [
      { value: 'now', label: 'Right now — I want to start immediately', scores: { urgency: 4 } },
      { value: '3_months', label: 'Within the next 3 months', scores: { urgency: 3 } },
      { value: '6_months', label: 'In the next 6 months', scores: { urgency: 2 } },
      { value: 'exploring', label: "Just exploring for now", scores: { urgency: 1 } },
    ],
  },
  // Step 3: How do you want to learn?
  {
    id: 'learning_preference',
    step: 3,
    text: 'How do you prefer to learn?',
    type: 'single',
    required: true,
    options: [
      {
        value: 'self_paced',
        label: 'Self-paced courses and content',
        scores: { learningStyle: 1 },
      },
      {
        value: 'community',
        label: 'Community support and group sessions',
        scores: { learningStyle: 2 },
      },
      {
        value: 'coaching',
        label: 'One-on-one coaching and mentorship',
        scores: { learningStyle: 3 },
      },
      {
        value: 'intensive',
        label: 'Intensive, hands-on guidance with direct expert access',
        scores: { learningStyle: 4 },
      },
    ],
  },
  {
    id: 'budget_range',
    step: 3,
    text: 'What monthly budget can you invest in your education?',
    type: 'single',
    required: true,
    options: [
      { value: 'under_50', label: 'Under $50/month', scores: { budget: 1 } },
      { value: '50_300', label: '$50 — $300/month', scores: { budget: 2 } },
      { value: '300_1000', label: '$300 — $1,000/month', scores: { budget: 3 } },
      { value: 'over_1000', label: 'Over $1,000/month', scores: { budget: 4 } },
    ],
  },
  // Step 4: Final details
  {
    id: 'email',
    step: 4,
    text: "What's your email? We'll send your personalized recommendations.",
    type: 'text',
    required: true,
  },
]

export function getStepQuestions(step: number): QuizQuestion[] {
  return QUIZ_QUESTIONS.filter((q) => q.step === step)
}

export const TOTAL_STEPS = 4
