'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default function ConversationDetailPage() {
  const params = useParams()
  const conversationId = params.id as string
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/conversations?id=${conversationId}`)
      if (res.ok) {
        const data: { messages: Message[] } = await res.json()
        setMessages(data.messages)
      }
    }
    void load()
  }, [conversationId])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-2xl text-rpiNavy">Conversation</h1>
      <p className="mt-1 font-mono text-sm text-gray-500">{conversationId}</p>

      <div className="mt-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl p-4 ${
              msg.role === 'user' ? 'bg-rpiNavy text-white' : 'bg-gray-100'
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium uppercase opacity-60">{msg.role}</span>
              <span className="text-xs opacity-40">
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="py-8 text-center text-gray-500">No messages</p>
        )}
      </div>
    </div>
  )
}
