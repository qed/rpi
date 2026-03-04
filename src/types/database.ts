export interface Database {
  public: {
    Tables: {
      content_documents: {
        Row: {
          id: string
          title: string
          content: string
          content_type: string
          source_path: string
          metadata: Record<string, unknown> | null
          content_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          content_type: string
          source_path: string
          metadata?: Record<string, unknown> | null
          content_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          content_type?: string
          source_path?: string
          metadata?: Record<string, unknown> | null
          content_hash?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_chunks: {
        Row: {
          id: string
          document_id: string
          content: string
          embedding: number[] | null
          chunk_index: number
          token_count: number
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          content: string
          embedding?: number[] | null
          chunk_index: number
          token_count: number
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          content?: string
          embedding?: number[] | null
          chunk_index?: number
          token_count?: number
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          session_id: string
          lead_id: string | null
          message_count: number
          has_email: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          lead_id?: string | null
          message_count?: number
          has_email?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          lead_id?: string | null
          message_count?: number
          has_email?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          sources: Record<string, unknown>[] | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          sources?: Record<string, unknown>[] | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          sources?: Record<string, unknown>[] | null
          created_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          email: string
          name: string | null
          session_id: string
          score: number
          score_tier: string
          source: string
          keap_contact_id: string | null
          keap_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          session_id: string
          score?: number
          score_tier?: string
          source?: string
          keap_contact_id?: string | null
          keap_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          session_id?: string
          score?: number
          score_tier?: string
          source?: string
          keap_contact_id?: string | null
          keap_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_events: {
        Row: {
          id: string
          session_id: string
          lead_id: string | null
          event_type: string
          metadata: Record<string, unknown> | null
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          lead_id?: string | null
          event_type: string
          metadata?: Record<string, unknown> | null
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          lead_id?: string | null
          event_type?: string
          metadata?: Record<string, unknown> | null
          points?: number
          created_at?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          id: string
          session_id: string
          lead_id: string | null
          answers: Record<string, unknown>
          scores: Record<string, number>
          recommended_tier: string
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          lead_id?: string | null
          answers: Record<string, unknown>
          scores: Record<string, number>
          recommended_tier: string
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          lead_id?: string | null
          answers?: Record<string, unknown>
          scores?: Record<string, number>
          recommended_tier?: string
          completed_at?: string
          created_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          id: string
          session_id: string
          message_count: number
          window_start: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          message_count?: number
          window_start?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          message_count?: number
          window_start?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          document_id: string
          content: string
          similarity: number
          metadata: Record<string, unknown> | null
        }[]
      }
      hybrid_search: {
        Args: {
          query_embedding: number[]
          query_text: string
          match_count?: number
          vector_weight?: number
          keyword_weight?: number
        }
        Returns: {
          id: string
          document_id: string
          content: string
          combined_score: number
          metadata: Record<string, unknown> | null
        }[]
      }
      check_rate_limit: {
        Args: {
          p_session_id: string
          p_max_messages?: number
          p_window_hours?: number
        }
        Returns: {
          allowed: boolean
          remaining: number
        }[]
      }
      calculate_lead_score: {
        Args: {
          p_session_id: string
        }
        Returns: {
          total_score: number
          score_tier: string
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
