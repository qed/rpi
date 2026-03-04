import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EmailCapture } from '../EmailCapture'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockReset()
})

describe('EmailCapture', () => {
  it('renders the heading', () => {
    render(<EmailCapture />)
    expect(screen.getByRole('heading', { level: 2, name: /get free investing tips/i })).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<EmailCapture />)
    expect(screen.getByText(/join our newsletter/i)).toBeInTheDocument()
  })

  it('renders the email input', () => {
    render(<EmailCapture />)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
  })

  it('renders the subscribe button', () => {
    render(<EmailCapture />)
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    render(<EmailCapture />)
    const input = screen.getByPlaceholderText(/enter your email/i)
    const button = screen.getByRole('button', { name: /subscribe/i })

    fireEvent.change(input, { target: { value: 'not-an-email' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i)
    })
  })

  it('shows validation error for empty email', async () => {
    render(<EmailCapture />)
    const button = screen.getByRole('button', { name: /subscribe/i })

    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('submits valid email and shows success message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, leadId: '123' }),
    })

    render(<EmailCapture />)
    const input = screen.getByPlaceholderText(/enter your email/i)
    const button = screen.getByRole('button', { name: /subscribe/i })

    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/thanks for subscribing/i)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', source: 'email_capture' }),
    })
  })

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' }),
    })

    render(<EmailCapture />)
    const input = screen.getByPlaceholderText(/enter your email/i)
    const button = screen.getByRole('button', { name: /subscribe/i })

    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/server error/i)
    })
  })

  it('shows generic error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<EmailCapture />)
    const input = screen.getByPlaceholderText(/enter your email/i)
    const button = screen.getByRole('button', { name: /subscribe/i })

    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i)
    })
  })

  it('shows generic error on non-Error throw', async () => {
    mockFetch.mockRejectedValueOnce('some string error')

    render(<EmailCapture />)
    const input = screen.getByPlaceholderText(/enter your email/i)
    const button = screen.getByRole('button', { name: /subscribe/i })

    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i)
    })
  })

  it('shows Subscribing... while submitting', async () => {
    let resolvePromise: (value: unknown) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockFetch.mockReturnValueOnce(promise)

    render(<EmailCapture />)
    const input = screen.getByPlaceholderText(/enter your email/i)
    const button = screen.getByRole('button', { name: /subscribe/i })

    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /subscribing/i })).toBeDisabled()
    })

    // Resolve to prevent test warning
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ success: true, leadId: '123' }),
    })
  })

  it('clears error when user types after validation error', async () => {
    render(<EmailCapture />)
    const input = screen.getByPlaceholderText(/enter your email/i)
    const button = screen.getByRole('button', { name: /subscribe/i })

    fireEvent.change(input, { target: { value: 'bad' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    fireEvent.change(input, { target: { value: 'better@email.com' } })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('handles API error response without error field', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    })

    render(<EmailCapture />)
    const input = screen.getByPlaceholderText(/enter your email/i)
    const button = screen.getByRole('button', { name: /subscribe/i })

    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i)
    })
  })
})
