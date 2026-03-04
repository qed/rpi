import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Hero } from '../Hero'

describe('Hero', () => {
  it('renders the main heading', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1, name: /invest like the top 2%/i })).toBeInTheDocument()
  })

  it('renders the subheading text', () => {
    render(<Hero />)
    expect(screen.getByText(/join monika jazyk/i)).toBeInTheDocument()
  })

  it('renders the quiz CTA link', () => {
    render(<Hero />)
    const quizLink = screen.getByRole('link', { name: /take the quiz/i })
    expect(quizLink).toHaveAttribute('href', '/quiz')
  })

  it('renders the AI advisor CTA link', () => {
    render(<Hero />)
    const chatLink = screen.getByRole('link', { name: /chat with our ai advisor/i })
    expect(chatLink).toHaveAttribute('href', '#chat')
  })

  it('renders the video placeholder', () => {
    render(<Hero />)
    expect(screen.getByText(/video coming soon/i)).toBeInTheDocument()
  })

  it('has navy background', () => {
    render(<Hero />)
    const section = screen.getByRole('heading', { level: 1 }).closest('section')
    expect(section?.className).toContain('bg-rpiNavy')
  })
})
