import { STARTER_QUESTIONS } from '@/app/api/chat/system-prompt'

export function getStarterQuestions(): string[] {
  return [...STARTER_QUESTIONS]
}
