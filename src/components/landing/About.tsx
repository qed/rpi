import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

const STATS = [
  { value: '15+', label: 'Years Experience' },
  { value: '$50M+', label: 'Assets Under Management' },
  { value: '1,000+', label: 'Students Mentored' },
  { value: '7', label: 'Core Modules' },
] as const

export function About() {
  return (
    <Section id="about" className="bg-rpiCream">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold text-rpiNavy sm:text-4xl">
            Meet Monika Jazyk
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-rpiSlate">
            Monika is a seasoned real estate investor, educator, and
            entrepreneur with over 15 years of experience building wealth
            through strategic property investing. As the founder of RPI
            Education, she has helped more than 1,000 students transform their
            financial futures through proven systems, hands-on coaching, and a
            supportive community.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-rpiSlate">
            Backed by a team of industry experts — including mortgage
            specialists, tax strategists, and seasoned investors — Monika&apos;s
            programs deliver comprehensive education that covers every aspect
            of real estate wealth building.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-3xl font-bold text-rpiGold sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-rpiSlate">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
