import type { Metadata } from 'next'
import { QuizWizard } from '@/components/quiz/QuizWizard'

export const metadata: Metadata = {
  title: 'Find Your Path — RPI Education Quiz',
  description:
    'Take our 2-minute quiz to discover which RPI Education program is the perfect fit for your real estate investing goals.',
}

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-rpiCream px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-heading text-3xl text-rpiNavy sm:text-4xl">
          Find Your Perfect Program
        </h1>
        <p className="mt-3 text-lg text-rpiSlate">
          Answer a few questions and we&apos;ll recommend the best path for your real estate investing journey.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-xl">
        <QuizWizard />
      </div>
    </main>
  )
}
