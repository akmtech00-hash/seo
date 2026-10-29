# Aegis Growth OS — Comprehensive API Reference

Base Production URL: `https://api.aegisgrowth.ai/api/v1`  
Local Development URL: `http://localhost:4000/api/v1`  
Authentication: `Authorization: Bearer <vault_token>`

---

## 1. System Health & Infrastructure

### `GET /health`
Returns cluster engine health, database status, and cryptographic vault status.
```http
GET /api/v1/health
```
**Response (200 OK):**
```json
{
  "status": "ONLINE",
  "platform": "Aegis Growth OS",
  "version": "2.0.0",
  "databaseEngine": "PostgreSQL (TimescaleDB + pgvector)",
  "cryptographicVault": "AES-256-GCM Authenticated Active",
  "timestamp": "2026-10-29T11:41:26.748Z"
}
```

---

## 2. Monitored Websites & Audits

### `GET /websites`
Lists all monitored domains and health scores.

### `POST /websites`
Connects a new domain to Aegis.
```json
{
  "domain": "fintechdb.io"
}
```

### `POST /websites/:domain/audit`
Triggers an on-demand crawl assessing Core Web Vitals, Schema.org coverage, and `/llms.txt` readiness.

### `POST /websites/:domain/axo-mission`
Runs a simulated AI autonomous buyer mission using Playwright to test form interaction.
```json
{
  "goal": "Test pricing calculator and submit demo request"
}
```

---

## 3. Module 1: Native CMS & Storefront Sync

### `POST /sync/shopify/update-product-node`
Executes an atomic GraphQL `metafieldsUpsert` mutation against Shopify Admin API.
```json
{
  "shop_domain": "brand.myshopify.com",
  "shopify_product_graphql_id": "gid://shopify/Product/89211029381",
  "text_copy_payload": "AI-optimized inbound value proposition.",
  "schema_json_payload": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Enterprise Core"
  }
}
```

### `POST /sync/cms/ast-delta`
Generates a signed Abstract Syntax Tree (AST) delta payload and optionally dispatches to WordPress.
```json
{
  "pageId": "101",
  "targetUrl": "https://fintechdb.io/enterprise",
  "modifications": [
    { "selector": "h1.title", "content": "Sub-5ms Distributed Database" }
  ],
  "platform": "wordpress"
}
```

### `POST /sync/cms/export-edge`
Exports optimization profiles directly to Cloudflare KV / Vercel Edge caches.

---

## 4. Module 2: Prompt Compiler & Co-Citation Topology

### `POST /prompt-compiler/compile`
Permutes intent prefixes x core keywords x target geographic markets.
```json
{
  "core_keywords": ["distributed SQL", "real-time analytics"],
  "locations": ["North America", "London EMEA"]
}
```

### `POST /prompt-compiler/sweep`
Sweeps Perplexity, ChatGPT, Claude, and Gemini, logging proximity scores to TimescaleDB.

### `GET /prompt-compiler/topology`
Returns formatted graph nodes and link weights for interactive D3 visualization.
```json
{
  "success": true,
  "nodesData": [
    { "id": "fintechdb.io", "group": "origin", "citationCount": 18 },
    { "id": "CockroachDB", "group": "competitor", "citationCount": 4 }
  ],
  "linksData": [
    { "source": "fintechdb.io", "target": "CockroachDB", "closenessWeight": 3.19 }
  ]
}
```

---

## 5. Module 3: Programmatic Real-Time Ad Guard (Smart RTB)

### `POST /ad-guard/evaluate-visibility-drop`
Monitors Share of Voice (SoV). If SoV drops below 40.0%, mutates Google Ads PPC and Meta budgets instantly.
```json
{
  "website_id": "site_01",
  "keyword_topic": "enterprise distributed database",
  "current_share_of_voice": 32.5,
  "customer_ad_account_id": "982-114-8802",
  "associated_fallback_campaign_id": "cmp_fallback_772",
  "boost_budget_id": "bgt_boost_550"
}
```

### `GET /ad-guard/status`
Returns real-time ad protection status and active alerts.

---

## 6. Module 4: Sales Battlecards & CRM Sync

### `POST /crm/inject-battlecard`
Queries co-citation matrix, constructs tailored competitive sales battlecard, and enriches HubSpot/Salesforce contacts.
```json
{
  "lead_email": "alex.jones@enterprise-buyer.com",
  "company_id": "comp_01",
  "identified_intent_topic": "low latency fintech database"
}
```

---

## 7. SaaS Billing & Privacy Governance

### `GET /billing/plans`
Lists available subscription tiers and quota thresholds.

### `GET /billing/account/:companyId`
Returns account quota usage, remaining scrape credits, and tier limits.

### `POST /billing/webhook`
Stripe subscription lifecycle webhook listener.

### `POST /compliance/verify`
Evaluates outbound outreach against GDPR affirmative consent, CCPA, and global suppression registries.
```json
{
  "email": "lead@enterprise.com",
  "jurisdiction": "GDPR_EU",
  "consentGiven": true
}
```
