import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MobileMenu } from '../MobileMenu'

const links = [
  { href: '#about', label: 'About' },
  { href: '#programs', label: 'Programs' },
]

describe('MobileMenu', () => {
  it('renders the site name', () => {
    render(<MobileMenu open={true} onClose={vi.fn()} links={links} />)
    expect(screen.getByText('RPI Education')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<MobileMenu open={true} onClose={vi.fn()} links={links} />)
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Programs')).toBeInTheDocument()
  })

  it('applies visible styles when open', () => {
    render(<MobileMenu open={true} onClose={vi.fn()} links={links} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('opacity-100')
    expect(dialog.className).toContain('pointer-events-auto')
  })

  it('applies hidden styles when closed', () => {
    render(<MobileMenu open={false} onClose={vi.fn()} links={links} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('opacity-0')
    expect(dialog.className).toContain('pointer-events-none')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<MobileMenu open={true} onClose={onClose} links={links} />)
    fireEvent.click(screen.getByLabelText('Close menu'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<MobileMenu open={true} onClose={onClose} links={links} />)
    // The backdrop is the div with aria-hidden="true"
    const backdrop = screen.getByRole('dialog').querySelector('[aria-hidden="true"]')
    expect(backdrop).not.toBeNull()
    fireEvent.click(backdrop!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when a link is clicked', () => {
    const onClose = vi.fn()
    render(<MobileMenu open={true} onClose={onClose} links={links} />)
    fireEvent.click(screen.getByText('About'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('locks body scroll when open', () => {
    const { rerender } = render(
      <MobileMenu open={true} onClose={vi.fn()} links={links} />
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<MobileMenu open={false} onClose={vi.fn()} links={links} />)
    expect(document.body.style.overflow).toBe('')
  })

  it('restores body scroll on unmount', () => {
    const { unmount } = render(
      <MobileMenu open={true} onClose={vi.fn()} links={links} />
    )
    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
