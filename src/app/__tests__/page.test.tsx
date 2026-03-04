import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HomePage from '../page'

describe('HomePage', () => {
  it('renders the main element', () => {
    render(<HomePage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the Hero section', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 1, name: /invest like the top 2%/i })).toBeInTheDocument()
  })

  it('renders the About section', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 2, name: /meet monika jazyk/i })).toBeInTheDocument()
  })

  it('renders the Testimonials section', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 2, name: /real results from real members/i })).toBeInTheDocument()
  })

  it('renders the Membership Comparison section', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 2, name: /choose your path to wealth/i })).toBeInTheDocument()
  })

  it('renders the Storefront section', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 2, name: /start your journey today/i })).toBeInTheDocument()
  })

  it('renders the Email Capture section', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 2, name: /get free investing tips/i })).toBeInTheDocument()
  })
})
