import { createAdminClient } from '@/lib/supabase/admin'

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function getOrCreateConversation(sessionId: string) {
  const supabase = createAdminClient()

  // Try to find existing conversation
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) return existing

  // Create new conversation
  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ session_id: sessionId })
    .select()
    .single()

  if (error) throw new Error(`Failed to create conversation: ${error.message}`)
  return created!
}

export async function loadHistory(conversationId: string): Promise<ConversationMessage[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to load history: ${error.message}`)

  return (data ?? []).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  sources?: Record<string, unknown>[]
) {
  const supabase = createAdminClient()

  const { error: msgError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    role,
    content,
    sources: sources ?? null,
  })

  if (msgError) throw new Error(`Failed to save message: ${msgError.message}`)

  // Increment message count on conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('message_count')
    .eq('id', conversationId)
    .single()

  if (conv) {
    await supabase
      .from('conversations')
      .update({ message_count: conv.message_count + 1 })
      .eq('id', conversationId)
  }
}
