-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Create tables 
CREATE TABLE "public"."nods_page" (
  id BIGSERIAL PRIMARY KEY,
  parent_page_id BIGINT REFERENCES public.nods_page,
  path TEXT NOT NULL UNIQUE,
  checksum TEXT,
  meta JSONB,
  type TEXT,
  source TEXT
);
ALTER TABLE "public"."nods_page" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."nods_page_section" (
  id BIGSERIAL PRIMARY KEY,
  page_id BIGINT NOT NULL REFERENCES public.nods_page ON DELETE CASCADE,
  content TEXT,
  token_count INT,
  embedding VECTOR(1536),
  slug TEXT,
  heading TEXT
);
ALTER TABLE "public"."nods_page_section" ENABLE ROW LEVEL SECURITY;

-- Create embedding similarity search functions
CREATE OR REPLACE FUNCTION public.match_page_sections(
  page_id BIGINT,
  embedding VECTOR(1536),
  match_threshold DOUBLE PRECISION,
  match_count INTEGER,
  min_content_length INTEGER
)
RETURNS TABLE (id BIGINT, page_id BIGINT, slug TEXT, heading TEXT, content TEXT, similarity DOUBLE PRECISION)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.page_id,
    p.slug,
    p.heading,
    p.content,
    (p.embedding <-> embedding) * -1 AS similarity
  FROM
    public.nods_page_section AS p
  WHERE
    LENGTH(p.content) >= min_content_length
    AND p.page_id = page_id
    AND (p.embedding <-> embedding) * -1 > match_threshold
  ORDER BY
    p.embedding <-> embedding
  LIMIT
    match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_page_parents(page_id BIGINT)
RETURNS TABLE (id BIGINT, parent_page_id BIGINT, path TEXT, meta JSONB)
LANGUAGE sql
AS $$
  WITH RECURSIVE chain AS (
    SELECT *
    FROM nods_page 
    WHERE id = page_id

    UNION ALL

    SELECT np.*
    FROM public.nods_page np
    JOIN chain ON chain.parent_page_id = np.id 
  )
  SELECT id, parent_page_id, path, meta
  FROM chain;
$$;
