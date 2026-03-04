import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Section({ children, className, id, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={clsx('py-16 sm:py-20 lg:py-24', className)}
      {...props}
    >
      {children}
    </section>
  )
}
