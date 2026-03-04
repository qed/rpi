import { MEMBERSHIP_TIERS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Check } from 'lucide-react'

export function MembershipComparison() {
  return (
    <Section id="programs" className="bg-rpiCream">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-rpiNavy sm:text-4xl">
            Choose Your Path to Wealth
          </h2>
          <p className="mt-4 text-lg text-rpiSlate">
            Four tiers designed to match your experience level and investment
            goals.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-4">
          {MEMBERSHIP_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-xl border-2 bg-white p-6 shadow-sm ${
                tier.recommended
                  ? 'border-rpiGold shadow-lg'
                  : 'border-rpiNavy/10'
              }`}
            >
              {tier.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rpiGold px-4 py-1 text-xs font-bold text-rpiNavy">
                  Recommended
                </span>
              )}

              <h3 className="font-heading text-xl font-bold text-rpiNavy">
                {tier.name}
              </h3>
              <p className="mt-2 text-2xl font-bold text-rpiGold">{tier.price}</p>
              <p className="mt-2 text-sm text-rpiSlate">{tier.description}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-rpiCharcoal">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-rpiGold" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                href={tier.teachableUrl}
                variant={tier.recommended ? 'primary' : 'secondary'}
                className="mt-6 w-full"
              >
                Join Now
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
