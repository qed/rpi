import { SITE_NAME } from '@/lib/constants'
import { Container } from '@/components/ui/Container'

const FOOTER_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#programs', label: 'Programs' },
  { href: '/quiz', label: 'Quiz' },
  { href: '#contact', label: 'Contact' },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-rpiNavy py-12 text-white/70" id="contact">
      <Container>
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <div>
            <span className="font-heading text-lg font-bold text-rpiGold">
              {SITE_NAME}
            </span>
            <p className="mt-1 text-sm">Invest Like the Top 2%</p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex gap-6">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:text-rpiGold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm">
          <p>&copy; {year} {SITE_NAME}. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  )
}
