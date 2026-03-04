'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Conversation {
  id: string
  session_id: string
  message_count: number
  has_email: boolean
  tags: string[]
  created_at: string
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/conversations')
      if (res.ok) {
        const data: { conversations: Conversation[] } = await res.json()
        setConversations(data.conversations)
      }
    }
    void load()
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-3xl text-rpiNavy">Conversations</h1>

      <div className="mt-6 space-y-3">
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/admin/conversations/${conv.id}`}
            className="block rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-sm text-gray-500">{conv.session_id}</span>
                <span className="ml-3 text-sm text-rpiSlate">
                  {conv.message_count} messages
                </span>
              </div>
              <div className="flex items-center gap-2">
                {conv.has_email && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    Email
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(conv.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {conversations.length === 0 && (
          <p className="py-8 text-center text-gray-500">No conversations yet</p>
        )}
      </div>
    </div>
  )
}
