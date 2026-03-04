import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Section } from '../Section'

describe('Section', () => {
  it('renders children', () => {
    render(<Section>Section content</Section>)
    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('renders as a section element', () => {
    render(<Section data-testid="section">Content</Section>)
    const el = screen.getByTestId('section')
    expect(el.tagName).toBe('SECTION')
  })

  it('applies vertical padding classes', () => {
    render(<Section data-testid="section">Content</Section>)
    const el = screen.getByTestId('section')
    expect(el.className).toContain('py-16')
  })

  it('accepts an id for anchor links', () => {
    render(<Section id="about" data-testid="section">Content</Section>)
    const el = screen.getByTestId('section')
    expect(el).toHaveAttribute('id', 'about')
  })

  it('merges custom className', () => {
    render(<Section className="bg-white" data-testid="section">Content</Section>)
    const el = screen.getByTestId('section')
    expect(el.className).toContain('bg-white')
    expect(el.className).toContain('py-16')
  })

  it('passes additional HTML attributes', () => {
    render(<Section data-testid="section" aria-label="Test section">Content</Section>)
    const el = screen.getByTestId('section')
    expect(el).toHaveAttribute('aria-label', 'Test section')
  })
})
