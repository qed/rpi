-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- Table: content_documents
-- ============================================================
CREATE TABLE content_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  source_path TEXT NOT NULL UNIQUE,
  metadata JSONB DEFAULT '{}',
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_documents_type ON content_documents(content_type);
CREATE INDEX idx_content_documents_hash ON content_documents(content_hash);

-- ============================================================
-- Table: content_chunks (with pgvector 1024-dim)
-- ============================================================
CREATE TABLE content_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES content_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1024),
  chunk_index INTEGER NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_chunks_document ON content_chunks(document_id);
-- IVFFlat index created after data insertion (needs rows to build lists)
-- GIN index for full-text search
CREATE INDEX idx_content_chunks_fts ON content_chunks USING GIN (to_tsvector('english', content));

-- ============================================================
-- Table: conversations
-- ============================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  lead_id UUID,
  message_count INTEGER NOT NULL DEFAULT 0,
  has_email BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_lead ON conversations(lead_id);

-- ============================================================
-- Table: messages
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- ============================================================
-- Table: leads
-- ============================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  session_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  score_tier TEXT NOT NULL DEFAULT 'cold',
  source TEXT NOT NULL DEFAULT 'website',
  keap_contact_id TEXT,
  keap_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_session ON leads(session_id);
CREATE INDEX idx_leads_score_tier ON leads(score_tier);
CREATE INDEX idx_leads_email ON leads(email);

-- ============================================================
-- Table: lead_events
-- ============================================================
CREATE TABLE lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_events_session ON lead_events(session_id);
CREATE INDEX idx_lead_events_lead ON lead_events(lead_id);
CREATE INDEX idx_lead_events_type ON lead_events(event_type);

-- ============================================================
-- Table: quiz_results
-- ============================================================
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  scores JSONB NOT NULL DEFAULT '{}',
  recommended_tier TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_results_session ON quiz_results(session_id);

-- ============================================================
-- Table: rate_limits
-- ============================================================
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_rate_limits_session ON rate_limits(session_id);

-- ============================================================
-- Function: match_chunks (pure vector similarity)
-- ============================================================
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1024),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.document_id,
    cc.content,
    1 - (cc.embedding <=> query_embedding) AS similarity,
    cc.metadata
  FROM content_chunks cc
  WHERE cc.embedding IS NOT NULL
    AND 1 - (cc.embedding <=> query_embedding) > match_threshold
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- Function: hybrid_search (vector + keyword)
-- ============================================================
CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding vector(1024),
  query_text TEXT,
  match_count INT DEFAULT 20,
  vector_weight FLOAT DEFAULT 0.7,
  keyword_weight FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  combined_score FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT
      cc.id,
      cc.document_id,
      cc.content,
      1 - (cc.embedding <=> query_embedding) AS vscore,
      cc.metadata
    FROM content_chunks cc
    WHERE cc.embedding IS NOT NULL
  ),
  keyword_results AS (
    SELECT
      cc.id,
      ts_rank_cd(to_tsvector('english', cc.content), plainto_tsquery('english', query_text)) AS kscore
    FROM content_chunks cc
    WHERE to_tsvector('english', cc.content) @@ plainto_tsquery('english', query_text)
  )
  SELECT
    vr.id,
    vr.document_id,
    vr.content,
    (vr.vscore * vector_weight + COALESCE(kr.kscore, 0) * keyword_weight) AS combined_score,
    vr.metadata
  FROM vector_results vr
  LEFT JOIN keyword_results kr ON vr.id = kr.id
  WHERE vr.vscore > 0.3 OR kr.kscore IS NOT NULL
  ORDER BY (vr.vscore * vector_weight + COALESCE(kr.kscore, 0) * keyword_weight) DESC
  LIMIT match_count;
END;
$$;

-- ============================================================
-- Function: check_rate_limit
-- ============================================================
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_session_id TEXT,
  p_max_messages INT DEFAULT 20,
  p_window_hours INT DEFAULT 1
)
RETURNS TABLE (allowed BOOLEAN, remaining INT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT;
  v_window_start TIMESTAMPTZ;
BEGIN
  SELECT rl.message_count, rl.window_start
  INTO v_count, v_window_start
  FROM rate_limits rl
  WHERE rl.session_id = p_session_id;

  -- No record or window expired: reset
  IF NOT FOUND OR v_window_start < now() - (p_window_hours || ' hours')::INTERVAL THEN
    INSERT INTO rate_limits (session_id, message_count, window_start)
    VALUES (p_session_id, 1, now())
    ON CONFLICT (session_id)
    DO UPDATE SET message_count = 1, window_start = now();

    allowed := true;
    remaining := p_max_messages - 1;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Within window
  IF v_count >= p_max_messages THEN
    allowed := false;
    remaining := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  UPDATE rate_limits
  SET message_count = message_count + 1
  WHERE rate_limits.session_id = p_session_id;

  allowed := true;
  remaining := p_max_messages - v_count - 1;
  RETURN NEXT;
  RETURN;
END;
$$;

-- ============================================================
-- Function: calculate_lead_score
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_lead_score(p_session_id TEXT)
RETURNS TABLE (total_score INT, score_tier TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_score INT;
BEGIN
  SELECT COALESCE(SUM(le.points), 0)
  INTO v_score
  FROM lead_events le
  WHERE le.session_id = p_session_id;

  total_score := v_score;
  IF v_score > 50 THEN
    score_tier := 'hot';
  ELSIF v_score >= 20 THEN
    score_tier := 'warm';
  ELSE
    score_tier := 'cold';
  END IF;
  RETURN NEXT;
END;
$$;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE content_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Anon can read content
CREATE POLICY "anon_read_chunks" ON content_chunks
  FOR SELECT USING (true);

CREATE POLICY "anon_read_documents" ON content_documents
  FOR SELECT USING (true);

-- Anon can insert leads and events
CREATE POLICY "anon_insert_leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_read_own_lead" ON leads
  FOR SELECT USING (true);

CREATE POLICY "anon_update_own_lead" ON leads
  FOR UPDATE USING (true);

CREATE POLICY "anon_insert_events" ON lead_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_read_events" ON lead_events
  FOR SELECT USING (true);

-- Conversations: anon can create and read own session
CREATE POLICY "anon_insert_conversations" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_read_conversations" ON conversations
  FOR SELECT USING (true);

CREATE POLICY "anon_update_conversations" ON conversations
  FOR UPDATE USING (true);

-- Messages: anon can insert and read
CREATE POLICY "anon_insert_messages" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_read_messages" ON messages
  FOR SELECT USING (true);

-- Quiz results: anon can insert and read
CREATE POLICY "anon_insert_quiz" ON quiz_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_read_quiz" ON quiz_results
  FOR SELECT USING (true);

-- Rate limits: anon can read/write own
CREATE POLICY "anon_manage_rate_limits" ON rate_limits
  FOR ALL USING (true);

-- ============================================================
-- Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_content_documents
  BEFORE UPDATE ON content_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_conversations
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_leads
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
