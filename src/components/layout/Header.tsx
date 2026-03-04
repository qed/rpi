'use client'

import { useState } from 'react'
import { SITE_NAME } from '@/lib/constants'
import { Container } from '@/components/ui/Container'
import { MobileMenu } from './MobileMenu'
import { Menu } from 'lucide-react'

const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '#about', label: 'About' },
  { href: '#programs', label: 'Programs' },
  { href: '/quiz', label: 'Quiz' },
  { href: '#contact', label: 'Contact' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-rpiNavy shadow-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="font-heading text-xl font-bold text-rpiGold">
            {SITE_NAME}
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 transition-colors hover:text-rpiGold"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            className="text-white md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </Container>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={NAV_LINKS}
      />
    </header>
  )
}
