-- Aegis Growth OS — Phase 5 Advanced Enterprise Migrations
-- Module 2: Competitive Co-Citation Matrices & LLM Topology Hypertable

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: competitor_profiles
CREATE TABLE IF NOT EXISTS competitor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    domain_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: co_citation_matrix_ts (TimescaleDB Hypertable)
CREATE TABLE IF NOT EXISTS co_citation_matrix_ts (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    website_id UUID NOT NULL,
    competitor_id UUID NOT NULL REFERENCES competitor_profiles(id) ON DELETE CASCADE,
    engine_identity VARCHAR(64) NOT NULL, -- 'perplexity', 'chatgpt', 'gemini', 'claude'
    target_prompt_topic VARCHAR(255) NOT NULL,
    proximity_score NUMERIC(5, 2) NOT NULL, -- Proximity distance of competitor mention to brand in text (lower = closer proximity)
    sentiment_differential NUMERIC(3, 2) NOT NULL -- Relative sentiment delta (-1.00 to +1.00)
);

-- TimescaleDB Hypertable conversion & indexes
SELECT create_hypertable('co_citation_matrix_ts', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_cocite_lookup ON co_citation_matrix_ts (website_id, engine_identity, time DESC);
CREATE INDEX IF NOT EXISTS idx_cocite_topic ON co_citation_matrix_ts (target_prompt_topic, proximity_score ASC);

-- Automated Columnar Compression Policies (Chunks older than 14 days)
ALTER TABLE co_citation_matrix_ts SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'website_id, engine_identity'
);
SELECT add_compression_policy('co_citation_matrix_ts', INTERVAL '14 days', if_not_exists => TRUE);

COMMIT;
