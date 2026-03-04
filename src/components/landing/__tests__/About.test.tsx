import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { About } from '../About'

describe('About', () => {
  it('renders the heading', () => {
    render(<About />)
    expect(screen.getByRole('heading', { level: 2, name: /meet monika jazyk/i })).toBeInTheDocument()
  })

  it('renders the bio paragraph', () => {
    render(<About />)
    expect(screen.getByText(/seasoned real estate investor/i)).toBeInTheDocument()
  })

  it('renders the team mention', () => {
    render(<About />)
    expect(screen.getByText(/team of industry experts/i)).toBeInTheDocument()
  })

  it('renders stats', () => {
    render(<About />)
    expect(screen.getByText('15+')).toBeInTheDocument()
    expect(screen.getByText('Years Experience')).toBeInTheDocument()
    expect(screen.getByText('$50M+')).toBeInTheDocument()
    expect(screen.getByText('1,000+')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('has the about id for anchor linking', () => {
    render(<About />)
    const section = screen.getByRole('heading', { level: 2 }).closest('section')
    expect(section).toHaveAttribute('id', 'about')
  })
})
