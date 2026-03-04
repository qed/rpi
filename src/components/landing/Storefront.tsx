import { MEMBERSHIP_TIERS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

export function Storefront() {
  return (
    <Section id="storefront" className="bg-white">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-rpiNavy sm:text-4xl">
            Start Your Journey Today
          </h2>
          <p className="mt-4 text-lg text-rpiSlate">
            Pick the program that fits your goals and get instant access.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBERSHIP_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="group rounded-xl border border-rpiNavy/10 bg-rpiCream p-5 transition-shadow hover:shadow-md"
            >
              <h3 className="font-heading text-lg font-bold text-rpiNavy">
                {tier.name}
              </h3>
              <p className="mt-1 text-xl font-bold text-rpiGold">{tier.price}</p>
              <p className="mt-2 text-sm text-rpiSlate">{tier.description}</p>

              <Button
                href={tier.teachableUrl}
                variant="primary"
                size="sm"
                className="mt-4 w-full"
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
