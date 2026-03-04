'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about real estate investing..."
          disabled={disabled}
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-rpiGold focus:outline-none focus:ring-1 focus:ring-rpiGold disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-rpiGold text-white transition-colors hover:bg-rpiNavy disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  )
}
