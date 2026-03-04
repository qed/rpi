import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MembershipComparison } from '../MembershipComparison'

describe('MembershipComparison', () => {
  it('renders the heading', () => {
    render(<MembershipComparison />)
    expect(screen.getByRole('heading', { level: 2, name: /choose your path to wealth/i })).toBeInTheDocument()
  })

  it('renders the subheading', () => {
    render(<MembershipComparison />)
    expect(screen.getByText(/four tiers designed to match/i)).toBeInTheDocument()
  })

  it('renders all four tier names', () => {
    render(<MembershipComparison />)
    expect(screen.getByRole('heading', { name: 'Community Access' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wealth Immersion Program' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Personal Coaching' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Elite Investor' })).toBeInTheDocument()
  })

  it('renders tier prices', () => {
    render(<MembershipComparison />)
    expect(screen.getByText('$30/mo')).toBeInTheDocument()
    expect(screen.getByText('$297/mo')).toBeInTheDocument()
    expect(screen.getByText('$997/mo')).toBeInTheDocument()
    expect(screen.getByText('From $15,000')).toBeInTheDocument()
  })

  it('renders tier descriptions', () => {
    render(<MembershipComparison />)
    expect(screen.getByText(/join our investor community/i)).toBeInTheDocument()
    expect(screen.getByText(/flagship 7-module program/i)).toBeInTheDocument()
  })

  it('renders the recommended badge for Wealth Immersion', () => {
    render(<MembershipComparison />)
    expect(screen.getByText('Recommended')).toBeInTheDocument()
  })

  it('renders Join Now links for all tiers', () => {
    render(<MembershipComparison />)
    const joinLinks = screen.getAllByRole('link', { name: /join now/i })
    expect(joinLinks).toHaveLength(4)
  })

  it('links to the correct Teachable URLs', () => {
    render(<MembershipComparison />)
    const joinLinks = screen.getAllByRole('link', { name: /join now/i })
    expect(joinLinks[0]).toHaveAttribute('href', 'https://rpi-education.teachable.com/p/community')
    expect(joinLinks[1]).toHaveAttribute('href', 'https://rpi-education.teachable.com/p/wealth-immersion')
    expect(joinLinks[2]).toHaveAttribute('href', 'https://rpi-education.teachable.com/p/coaching')
    expect(joinLinks[3]).toHaveAttribute('href', 'https://rpi-education.teachable.com/p/elite')
  })

  it('renders features with check icons', () => {
    render(<MembershipComparison />)
    expect(screen.getByText('Private community forum')).toBeInTheDocument()
    expect(screen.getByText('7 comprehensive modules')).toBeInTheDocument()
    expect(screen.getByText('Direct access to Monika')).toBeInTheDocument()
  })

  it('has the programs id', () => {
    render(<MembershipComparison />)
    const section = screen.getByRole('heading', { level: 2 }).closest('section')
    expect(section).toHaveAttribute('id', 'programs')
  })
})
