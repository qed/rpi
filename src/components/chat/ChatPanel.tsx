'use client'

import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { StarterQuestions } from './StarterQuestions'
import { TypingIndicator } from './TypingIndicator'
import { EmailCaptureModal } from './EmailCaptureModal'
import { AI_DISCLAIMER } from '@/app/api/chat/system-prompt'

interface ChatPanelProps {
  onClose: () => void
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const sessionId = useSession()
  const { messages, isLoading, requiresEmail, error, sendMessage, clearEmailGate } =
    useChat({ sessionId })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[600px] sm:w-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between bg-rpiNavy px-4 py-3 text-white">
        <div>
          <h3 className="font-heading text-lg font-semibold">RPI Advisor</h3>
          <p className="text-xs text-rpiGold">Powered by AI</p>
        </div>
        <button onClick={onClose} aria-label="Close chat" className="hover:text-rpiGold">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="mb-4">
            <p className="mb-3 text-sm text-gray-500">{AI_DISCLAIMER}</p>
            <StarterQuestions onSelect={sendMessage} />
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        {error && (
          <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Email capture modal */}
      {requiresEmail && (
        <EmailCaptureModal sessionId={sessionId} onComplete={clearEmailGate} />
      )}

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading || requiresEmail} />
    </div>
  )
}
