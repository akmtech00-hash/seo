-- =========================================================================
-- AEGIS GROWTH OS — PRODUCTION DATABASE SCHEMA & MIGRATIONS
-- Targets: PostgreSQL 15+ with TimescaleDB & pgvector
-- =========================================================================

BEGIN;

-- 1. System Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;

-- 2. Multi-Tenant Account & Company Structure
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(64) DEFAULT 'growth_pro' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Encrypted Credentials & Integration Vault
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    provider VARCHAR(64) NOT NULL, -- 'google_search_console', 'bing_webmaster', 'openai', 'anthropic', 'sendgrid'
    auth_payload BYTEA NOT NULL, -- AES-256-GCM encrypted binary blob
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_company_provider UNIQUE (company_id, provider)
);

-- 4. Monitored Websites & Domains
CREATE TABLE IF NOT EXISTS websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    crawl_configuration JSONB DEFAULT '{"max_depth": 3, "render_js": true, "crawl_frequency": "daily"}'::jsonb NOT NULL,
    edge_middleware_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    last_audit_at TIMESTAMP WITH TIME ZONE,
    health_score INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. CMS & Git Auto-Remediation Connections
CREATE TABLE IF NOT EXISTS cms_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    cms_type VARCHAR(64) NOT NULL, -- 'github', 'gitlab', 'wordpress', 'shopify', 'webflow'
    encrypted_token BYTEA NOT NULL,
    repo_name VARCHAR(255),
    auto_pr_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_site_cms UNIQUE (website_id, cms_type)
);

-- 6. Knowledge Vector Matrix (Unified Memory for SEO & AI SDR)
CREATE TABLE IF NOT EXISTS website_knowledge_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    content_chunk TEXT NOT NULL,
    semantic_embedding vector(1536) NOT NULL, -- OpenAI text-embedding-3-small dimension
    hash_checksum VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vectors_hnsw_cosine 
ON website_knowledge_vectors USING hnsw (semantic_embedding vector_cosine_ops);

-- 7. Time-Series Metric Ledger (TimescaleDB Hypertable)
CREATE TABLE IF NOT EXISTS generative_visibility_metrics (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    website_id UUID NOT NULL,
    engine_identity VARCHAR(64) NOT NULL, -- 'perplexity', 'chatgpt', 'gemini', 'google_aio'
    tracked_keyword VARCHAR(255) NOT NULL,
    citation_frequency INT DEFAULT 0 NOT NULL,
    share_of_voice_percentage NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    inbound_referral_clicks INT DEFAULT 0 NOT NULL,
    sentiment_score NUMERIC(3, 2) DEFAULT 1.00, -- -1.00 to 1.00
    hallucination_flagged BOOLEAN DEFAULT FALSE NOT NULL
);

-- Convert to TimescaleDB Hypertable partitioned across 7-day windows
SELECT create_hypertable('generative_visibility_metrics', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_metrics_site_engine_time 
ON generative_visibility_metrics (website_id, engine_identity, time DESC);

-- 8. AXO (Agent Experience Optimization) Execution Logs
CREATE TABLE IF NOT EXISTS axo_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    simulated_task_description TEXT NOT NULL,
    execution_status VARCHAR(64) NOT NULL, -- 'success', 'selector_failure', 'honeypot_trap'
    dom_target_failure_selector TEXT,
    trace_file_bucket_url TEXT,
    system_remediation_suggestion TEXT
);

CREATE INDEX IF NOT EXISTS idx_axo_lookup 
ON axo_execution_logs (website_id, executed_at DESC);

-- 9. Inbound Intent Overrides & A/B Experiments
CREATE TABLE IF NOT EXISTS ab_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    target_selector VARCHAR(255) NOT NULL,
    intent_tag VARCHAR(128) NOT NULL,
    variant_payloads JSONB NOT NULL,
    impressions_count INT DEFAULT 0 NOT NULL,
    conversions_count INT DEFAULT 0 NOT NULL,
    winning_variant VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. Autonomous Lead Engine & CRM Timeline
CREATE TABLE IF NOT EXISTS system_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email_address VARCHAR(255) NOT NULL,
    first_name VARCHAR(128),
    last_name VARCHAR(128),
    company_name VARCHAR(255),
    enriched_corporate_profile JSONB DEFAULT '{}'::jsonb NOT NULL,
    initial_acquisition_intent TEXT,
    lifecycle_stage VARCHAR(64) DEFAULT 'captured' NOT NULL, -- 'captured', 'nurturing', 'booked', 'sql', 'human_handoff'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_lead_company_email UNIQUE (company_id, email_address)
);

CREATE TABLE IF NOT EXISTS lead_interaction_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES system_leads(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    direction VARCHAR(32) DEFAULT 'outbound' NOT NULL, -- 'inbound', 'outbound'
    interaction_channel VARCHAR(64) NOT NULL, -- 'email', 'sms', 'form_intercept', 'calendar_booked'
    interaction_payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_lead 
ON lead_interaction_timeline (lead_id, recorded_at DESC);

COMMIT;
