import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Container } from '../Container'

describe('Container', () => {
  it('renders children', () => {
    render(<Container>Hello world</Container>)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('applies max-width and padding classes', () => {
    render(<Container data-testid="container">Content</Container>)
    const el = screen.getByTestId('container')
    expect(el.className).toContain('max-w-7xl')
    expect(el.className).toContain('mx-auto')
    expect(el.className).toContain('px-4')
  })

  it('merges custom className', () => {
    render(<Container className="mt-8" data-testid="container">Content</Container>)
    const el = screen.getByTestId('container')
    expect(el.className).toContain('mt-8')
    expect(el.className).toContain('max-w-7xl')
  })

  it('passes additional HTML attributes', () => {
    render(<Container data-testid="container" id="my-container">Content</Container>)
    const el = screen.getByTestId('container')
    expect(el).toHaveAttribute('id', 'my-container')
  })
})
