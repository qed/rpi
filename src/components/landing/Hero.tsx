import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

export function Hero() {
  return (
    <Section className="bg-rpiNavy py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Invest Like the Top 2%
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl">
            Join Monika Jazyk and her team of real estate experts. Whether
            you&apos;re just starting out or scaling a portfolio, RPI Education
            gives you the strategies, community, and coaching to build lasting
            wealth.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href="/quiz" size="lg">
              Take the Quiz
            </Button>
            <Button href="#chat" variant="secondary" size="lg" className="border-rpiGold text-rpiGold hover:bg-rpiGold hover:text-rpiNavy">
              Chat with Our AI Advisor
            </Button>
          </div>

          {/* Video embed placeholder */}
          <div className="mt-12 overflow-hidden rounded-xl bg-rpiSlate/30">
            <div className="flex aspect-video items-center justify-center">
              <p className="text-sm text-white/50">Video coming soon</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
