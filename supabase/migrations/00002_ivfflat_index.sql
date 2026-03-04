-- Run this AFTER embedding data has been inserted
-- IVFFlat needs existing rows to build index lists
-- Adjust lists count based on number of chunks: sqrt(num_chunks)
CREATE INDEX IF NOT EXISTS idx_content_chunks_embedding
  ON content_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);
