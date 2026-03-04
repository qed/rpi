import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Storefront } from '../Storefront'

describe('Storefront', () => {
  it('renders the heading', () => {
    render(<Storefront />)
    expect(screen.getByRole('heading', { level: 2, name: /start your journey today/i })).toBeInTheDocument()
  })

  it('renders the subheading', () => {
    render(<Storefront />)
    expect(screen.getByText(/pick the program that fits/i)).toBeInTheDocument()
  })

  it('renders all four product cards with names', () => {
    render(<Storefront />)
    expect(screen.getByRole('heading', { name: 'Community Access' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wealth Immersion Program' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Personal Coaching' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Elite Investor' })).toBeInTheDocument()
  })

  it('renders prices for each tier', () => {
    render(<Storefront />)
    expect(screen.getByText('$30/mo')).toBeInTheDocument()
    expect(screen.getByText('$297/mo')).toBeInTheDocument()
    expect(screen.getByText('$997/mo')).toBeInTheDocument()
    expect(screen.getByText('From $15,000')).toBeInTheDocument()
  })

  it('renders Get Started links for all tiers', () => {
    render(<Storefront />)
    const links = screen.getAllByRole('link', { name: /get started/i })
    expect(links).toHaveLength(4)
  })

  it('links to the correct Teachable URLs', () => {
    render(<Storefront />)
    const links = screen.getAllByRole('link', { name: /get started/i })
    expect(links[0]).toHaveAttribute('href', 'https://rpi-education.teachable.com/p/community')
    expect(links[1]).toHaveAttribute('href', 'https://rpi-education.teachable.com/p/wealth-immersion')
  })

  it('has the storefront id', () => {
    render(<Storefront />)
    const section = screen.getByRole('heading', { level: 2 }).closest('section')
    expect(section).toHaveAttribute('id', 'storefront')
  })
})
