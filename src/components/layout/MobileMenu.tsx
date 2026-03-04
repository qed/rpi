'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { SITE_NAME } from '@/lib/constants'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  links: ReadonlyArray<{ href: string; label: string }>
}

export function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <nav
        className={`absolute right-0 top-0 h-full w-72 bg-rpiNavy p-6 shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-heading text-lg font-bold text-rpiGold">
            {SITE_NAME}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-white"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <ul className="flex flex-col gap-4">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block rounded-lg px-3 py-2 text-base font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-rpiGold"
                onClick={onClose}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
