import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from '../Header'

describe('Header', () => {
  it('renders the site name', () => {
    render(<Header />)
    expect(screen.getAllByText('RPI Education').length).toBeGreaterThanOrEqual(1)
  })

  it('renders desktop navigation links', () => {
    render(<Header />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getAllByText('About')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Programs')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Quiz')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Contact')[0]).toBeInTheDocument()
  })

  it('renders home link', () => {
    render(<Header />)
    const homeLink = screen.getAllByText('RPI Education')[0]!.closest('a')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders a sticky header', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('sticky')
    expect(header.className).toContain('top-0')
  })

  it('renders mobile menu button', () => {
    render(<Header />)
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })

  it('opens mobile menu when hamburger is clicked', () => {
    render(<Header />)
    const menuButton = screen.getByLabelText('Open menu')
    fireEvent.click(menuButton)
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument()
  })

  it('closes mobile menu when close button is clicked', () => {
    render(<Header />)
    fireEvent.click(screen.getByLabelText('Open menu'))
    fireEvent.click(screen.getByLabelText('Close menu'))
    // The mobile menu should transition to closed state (opacity-0)
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('opacity-0')
  })
})
