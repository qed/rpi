import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Testimonials } from '../Testimonials'

describe('Testimonials', () => {
  it('renders the heading', () => {
    render(<Testimonials />)
    expect(screen.getByRole('heading', { level: 2, name: /real results from real members/i })).toBeInTheDocument()
  })

  it('renders the subheading', () => {
    render(<Testimonials />)
    expect(screen.getByText(/hear from investors/i)).toBeInTheDocument()
  })

  it('renders three testimonials', () => {
    render(<Testimonials />)
    expect(screen.getByText('Sarah M.')).toBeInTheDocument()
    expect(screen.getByText('David R.')).toBeInTheDocument()
    expect(screen.getByText('Jennifer L.')).toBeInTheDocument()
  })

  it('renders testimonial quotes', () => {
    render(<Testimonials />)
    expect(screen.getByText(/completely changed how I think about money/i)).toBeInTheDocument()
    expect(screen.getByText(/confidence and step-by-step framework/i)).toBeInTheDocument()
    expect(screen.getByText(/wealth immersion program is the real deal/i)).toBeInTheDocument()
  })

  it('renders testimonial results', () => {
    render(<Testimonials />)
    expect(screen.getByText(/first rental property in 6 months/i)).toBeInTheDocument()
    expect(screen.getByText(/scaled from 2 to 14 units/i)).toBeInTheDocument()
    expect(screen.getByText(/portfolio value doubled/i)).toBeInTheDocument()
  })

  it('has the testimonials id', () => {
    render(<Testimonials />)
    const section = screen.getByRole('heading', { level: 2 }).closest('section')
    expect(section).toHaveAttribute('id', 'testimonials')
  })
})
