'use client'

import { useState, useCallback, useRef } from 'react'
import type { ChatMessage, SourceAttribution, ProductRecommendation } from '@/types'

interface UseChatOptions {
  sessionId: string | null
}

export function useChat({ sessionId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [requiresEmail, setRequiresEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || isLoading) return

      setError(null)
      setIsLoading(true)

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      try {
        abortRef.current = new AbortController()

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message: content }),
          signal: abortRef.current.signal,
        })

        if (response.status === 429) {
          setError('You\'ve reached the message limit. Please try again later.')
          setIsLoading(false)
          return
        }

        const contentType = response.headers.get('content-type')

        // Handle JSON response (email gate)
        if (contentType?.includes('application/json')) {
          const data: { requiresEmail?: boolean } = await response.json()
          if (data.requiresEmail) {
            setRequiresEmail(true)
            setIsLoading(false)
            return
          }
        }

        // Handle SSE stream
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let assistantContent = ''
        let sources: SourceAttribution[] = []
        let recommendation: ProductRecommendation | null = null

        const assistantId = `msg_${Date.now()}_assistant`
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
          },
        ])

        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const jsonStr = line.slice(6)
            try {
              const event: {
                type: string
                content?: string
                sources?: SourceAttribution[]
                recommendation?: ProductRecommendation | null
                error?: string
              } = JSON.parse(jsonStr)

              if (event.type === 'text' && event.content) {
                assistantContent += event.content
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  )
                )
              } else if (event.type === 'done') {
                sources = event.sources ?? []
                recommendation = event.recommendation ?? null
              } else if (event.type === 'error') {
                setError(event.error ?? 'Stream error')
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }

        // Update final message with sources and recommendation
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: assistantContent,
                  sources: sources.length > 0 ? sources : undefined,
                  recommendation: recommendation ?? undefined,
                }
              : m
          )
        )
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Failed to send message. Please try again.')
        }
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [sessionId, isLoading]
  )

  const clearEmailGate = useCallback(() => {
    setRequiresEmail(false)
  }, [])

  return {
    messages,
    isLoading,
    requiresEmail,
    error,
    sendMessage,
    clearEmailGate,
  }
}
