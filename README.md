# Aegis Growth OS — Autonomous Growth & Infrastructure Orchestration Engine

[![CI](https://github.com/aegis-growth/seo-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/aegis-growth/seo-platform/actions/workflows/ci.yml)
[![Daily Sweeper](https://github.com/aegis-growth/seo-platform/actions/workflows/daily-scheduled-sweeper.yml/badge.svg)](https://github.com/aegis-growth/seo-platform/actions/workflows/daily-scheduled-sweeper.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Zero-CLS](https://img.shields.io/badge/Core%20Web%20Vitals-Zero--CLS%20Guaranteed-success)](docs/universal_website_integration.md)

**Aegis Growth OS** is an enterprise autonomous infrastructure orchestration platform that unifies traditional Search Engine Optimization (SEO), Generative Engine Optimization (GEO/AEO), Agent Experience Optimization (AXO), and an Autonomous Revenue Engine into a single closed-loop system.

Designed strictly using the Calendly design aesthetic (**Navy ink on cool marble**).

---

## Key Enterprise Modules

### 1. Event-Driven Native CMS Sync Infrastructure
Bypasses theme template edits by generating abstract AST Delta payloads signed with HMACs.
- **Shopify GraphQL Engine**: Injects optimization variants directly into product and collection Metafields [2.0 framework] via atomic `metafieldsUpsert` mutations.
- **WordPress Native Plugin**: Hooks into core `wp_insert_post_data` and `wp_head` database lifecycles authenticated via HashiCorp Vault.
- **Edge Middleware**: Cloudflare Workers / Next.js Vercel Edge `<5ms` stream personalizations using `HTMLRewriter`.

### 2. Synthetic LLM Prompt Arrays & Co-Citation Matrices
Replaces static keyword databases with an automated prompt compiler and interactive graph topology.
- **TimescaleDB Hypertable**: Stores time-series competitive mentions with 14-day columnar chunk compression policies (`co_citation_matrix_ts`).
- **Combinatorial Prompt Compiler**: Permutes intent phrases x commercial keywords x target markets to sweep AI engines (Perplexity, ChatGPT, Gemini, Claude).
- **Interactive D3 Topology Graph**: Visualizes mutual competitive proximity and reciprocal citation threat tiers.

### 3. Programmatic Real-Time Ad Guard (Smart RTB)
Autonomous webhook router that defends brand market share:
- Continuously monitors AI Share of Voice (SoV).
- If SoV drops below **40.0%**, instantly triggers atomic Google Ads API mutations (`campaigns:mutate`) and boosts Meta Graph API retargeting budgets.

### 4. Sales Pipeline Battlecards & CRM Sync Engine
Replaces static PDF sales sheets with automated contact enrichment:
- Whenever a zero-click AI lead converts, Aegis queries internal co-citation matrices to assemble tailored competitive battlecards and patches contact properties in HubSpot and Salesforce.

---

## Universal Website Compatibility

Aegis runs on **ANY website in the world**:
* **Single Page Applications (React, Vue, Angular, Svelte)**: Listens to HTML5 History API (`pushState`/`popstate`) and uses `MutationObserver` for dynamic hydration.
* **Modern SSR & Edge Frameworks (Next.js, Nuxt, Remix, Astro)**: Zero-CLS edge interception in `<5ms`.
* **Major CMSs (Shopify, WordPress, Webflow, Squarespace, Ghost, Magento)**: Native GraphQL Metafields, PHP core hooks, or universal `<10kb` tag.
* **Custom Enterprise Stacks (PHP, Python, Go, Java, Rails, Node.js)**: Reverse-proxy edge rewriting or client-side script.

For step-by-step setup, see [Universal Website Integration Guide](docs/universal_website_integration.md).

---

## Quickstart & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Application Server
```bash
node backend/server.js
```
* **API Gateway**: `http://localhost:4000/api/v1/health`
* **Client Dashboard**: `http://localhost:4000/dashboard`
* **Public Landing**: `http://localhost:4000/`

### 3. Run Automated Test Suite
```bash
node tests/platform.test.js
```

---

## Repository Structure & Documentation

```
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                          # Continuous Integration workflow
│   │   ├── daily-scheduled-sweeper.yml     # Daily AI prompt sweep & DB compaction
│   │   ├── deploy.yml                      # Container build & deploy
│   │   └── aegis-regression-guard.yml      # PR regression test bot
│   ├── ISSUE_TEMPLATE/                     # Bug & Feature templates
│   ├── PULL_REQUEST_TEMPLATE.md            # Standard PR checklist
│   └── CODEOWNERS                          # Code ownership matrix
├── backend/
│   ├── database/
│   │   ├── db.js                           # Dual-mode DB adapter (Postgres/Memory)
│   │   ├── migrations.sql                  # Core schema & TimescaleDB hypertables
│   │   └── migrations_v2_advanced.sql      # Competitor profiles & co-citation matrix
│   ├── routes/                             # API routes (Ad Guard, Billing, CRM, OAuth)
│   ├── scripts/                            # Daily TimescaleDB archival pipeline
│   ├── services/                           # Enterprise services (Shopify, CMS, Prompt Compiler)
│   └── server.js                           # Express API Gateway server
├── cdn/
│   └── aegis-interceptor.js                # Universal client tag (<10kb, Zero-CLS)
├── cms/
│   ├── shopify/                            # Liquid theme templates
│   └── wordpress/                          # Native AST database sync plugin
├── dashboard/                              # In-app SaaS client dashboard (Calendly theme)
├── docs/
│   ├── ai_brain_map.md                     # Cognitive architecture & Mermaid diagram
│   ├── universal_website_integration.md    # Integration guide for ANY website
│   ├── api_reference.md                    # Comprehensive OpenAPI specifications
│   ├── onboarding.md                       # Engineering onboarding guide
│   ├── deployment_guide.md                 # Kubernetes, Docker, Cloudflare setup
│   └── troubleshooting_and_faq.md          # Technical FAQ & debugging
├── edge/                                   # Cloudflare Worker & Next.js middleware
├── tests/
│   ├── platform.test.js                    # Unit & integration test suite (18 assertions)
│   └── locustfile.py                       # Locust high-concurrency load tester
├── Dockerfile                              # Multi-stage production container
├── docker-compose.yml                      # Containerized stack
├── CONTRIBUTING.md                         # Contribution guide
└── LICENSE                                 # Apache 2.0 License
```

---

## License

Licensed under the [Apache License, Version 2.0](LICENSE).
