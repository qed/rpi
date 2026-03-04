import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

const TESTIMONIALS = [
  {
    quote:
      'RPI Education completely changed how I think about money. Within 6 months of joining, I closed on my first rental property and it is already cash-flow positive.',
    name: 'Sarah M.',
    result: 'First rental property in 6 months',
  },
  {
    quote:
      'Monika and her team gave me the confidence and step-by-step framework to scale from 2 units to 14. The coaching calls alone are worth 10x the investment.',
    name: 'David R.',
    result: 'Scaled from 2 to 14 units',
  },
  {
    quote:
      'I was skeptical at first, but the Wealth Immersion Program is the real deal. The community support keeps me accountable, and the strategies are proven and practical.',
    name: 'Jennifer L.',
    result: 'Portfolio value doubled in 18 months',
  },
] as const

export function Testimonials() {
  return (
    <Section id="testimonials" className="bg-white">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-rpiNavy sm:text-4xl">
            Real Results from Real Members
          </h2>
          <p className="mt-4 text-lg text-rpiSlate">
            Hear from investors who transformed their financial future with RPI
            Education.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl border border-rpiNavy/10 bg-rpiCream p-6 shadow-sm"
            >
              <blockquote className="text-base leading-relaxed text-rpiCharcoal">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-6 border-t border-rpiNavy/10 pt-4">
                <p className="font-semibold text-rpiNavy">{testimonial.name}</p>
                <p className="text-sm text-rpiGold">{testimonial.result}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
