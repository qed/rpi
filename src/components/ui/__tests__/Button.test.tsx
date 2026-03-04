import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../Button'

describe('Button', () => {
  describe('as button element', () => {
    it('renders a button with default variant and size', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('applies primary variant styles by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button', { name: 'Primary' })
      expect(button.className).toContain('bg-rpiGold')
    })

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button', { name: 'Secondary' })
      expect(button.className).toContain('border-rpiNavy')
    })

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button', { name: 'Ghost' })
      expect(button.className).toContain('hover:bg-rpiNavy/10')
    })

    it('applies small size styles', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button', { name: 'Small' })
      expect(button.className).toContain('px-3')
      expect(button.className).toContain('text-sm')
    })

    it('applies medium size styles by default', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button', { name: 'Medium' })
      expect(button.className).toContain('px-5')
    })

    it('applies large size styles', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button', { name: 'Large' })
      expect(button.className).toContain('px-7')
      expect(button.className).toContain('text-lg')
    })

    it('merges custom className', () => {
      render(<Button className="mt-4">Custom</Button>)
      const button = screen.getByRole('button', { name: 'Custom' })
      expect(button.className).toContain('mt-4')
    })

    it('handles click events', () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button', { name: 'Click' }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('can be disabled', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button', { name: 'Disabled' })
      expect(button).toBeDisabled()
    })
  })

  describe('as anchor element', () => {
    it('renders an anchor when href is provided', () => {
      render(<Button href="/test">Link</Button>)
      const link = screen.getByRole('link', { name: 'Link' })
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', '/test')
    })

    it('applies variant styles to anchor', () => {
      render(<Button href="/test" variant="secondary">Link</Button>)
      const link = screen.getByRole('link', { name: 'Link' })
      expect(link.className).toContain('border-rpiNavy')
    })

    it('applies size styles to anchor', () => {
      render(<Button href="/test" size="lg">Link</Button>)
      const link = screen.getByRole('link', { name: 'Link' })
      expect(link.className).toContain('px-7')
    })
  })
})
