# Aegis Growth OS — Enterprise Engineering Onboarding Integration Guide

Welcome to the Aegis Growth OS autonomous infrastructure orchestration engine. Follow these technical guidelines to connect your external storefronts, headless edge networks, database layers, and sales CRMs to our optimization pipeline.

---

## 1. Quickstart CDN Tag Integration
To activate real-time intent-matching DOM personalization with zero Cumulative Layout Shift (CLS), inject our `<10kb` client tag into the `<head>` of your main HTML layout template file.

```html
<!-- Place this immediately before the closing </head> element -->
<script 
  id="aegis-growth-tag" 
  data-client-token="pk_live_your_vault_token_signature_here"
  src="https://cdn.aegisgrowth.ai/aegis-interceptor.js" 
  async>
</script>
```

---

## 2. API Authentication Core Contracts
All programmatic API requests to our ingestion gateways require an encrypted bearer token sent via standard HTTPS request headers. Tokens are managed and rotated via HashiCorp Vault.

```http
Authorization: Bearer sk_live_your_secure_vault_token
Content-Type: application/json
```

---

## 3. Core Endpoint Specifications

### A. Inbound Lead Synchronization Ingress
If you utilize custom lead generation structures or multi-step form workflows and need to synchronize captured records with our downstream sales engine:

* **HTTP Method:** `POST`
* **Production Route:** `https://api.aegisgrowth.ai/api/v1/leads`

#### Request Payload Specification
```json
{
  "company_id": "uuid-v4-tenant-identifier-token",
  "email_address": "engineering-buyer@enterprise-firm.com",
  "first_name": "Alex",
  "last_name": "Jones",
  "company_name": "Enterprise Data Systems",
  "initial_acquisition_intent": "Low-latency distributed datastores handling fintech compliance rules.",
  "inbound_metadata": {
    "captured_via": "Primary Product Core CTA Form",
    "aegis_intent_context_id": "int_01JBM5F89A23BC45DE67FG8901"
  }
}
```

#### Expected System Response
```json
{
  "status": "lead_ingested",
  "lead_id": "lead_1730198400000",
  "enrichment_status": "complete",
  "nurture_pipeline_state": "queued"
}
```

---

### B. Programmatic Real-Time Ad Guard (Smart RTB)
When Share of Voice (SoV) drops below 40.0%, this endpoint initiates real-time Google Ads and Meta Graph API budget and campaign activations:

* **HTTP Method:** `POST`
* **Route:** `https://api.aegisgrowth.ai/api/v1/ad-guard/evaluate-visibility-drop`

#### Request Payload
```json
{
  "website_id": "site_01",
  "keyword_topic": "enterprise distributed db",
  "current_share_of_voice": 34.5,
  "customer_ad_account_id": "982-114-8802",
  "associated_fallback_campaign_id": "cmp_fallback_fintech_772",
  "boost_budget_id": "bgt_boost_550"
}
```

---

### C. Shopify Storefront Metafields GraphQL Sync
Bypasses theme code modifications by updating native Shopify Metafields [2.0 framework]:

* **HTTP Method:** `POST`
* **Route:** `https://api.aegisgrowth.ai/api/v1/sync/shopify/update-product-node`

#### Liquid Theme Integration
Include in `layout/theme.liquid`:
```liquid
{% render 'aegis-seo-metafields' %}
```
And render dynamic copy in `sections/main-product.liquid`:
```liquid
{{ product.metafields.aegis_growth.geo_optimized_copy.value }}
```

---

## 4. Webhook Delivery Implementations
The platform fires event webhooks to notify your systems about new visibility updates, AXO agent workflow selector failures, or subscription changes. Your endpoint configurations must respond with a `200 OK` status in under 3 seconds.

#### Target AXO Failure Webhook Payload
```json
{
  "event_type": "axo.workflow.selector_failure",
  "timestamp": "2026-10-29T16:40:00Z",
  "website_domain": "fintechdb.io",
  "diagnostic_metrics": {
    "failure_selector": "button#submit-enterprise-form",
    "reasons": "Element covered by transparent overlay container rule or CSS layout change.",
    "trace_log_url": "https://api.aegisgrowth.ai/api/v1/websites/fintechdb.io/axo/axo_01"
  }
}
```

---

## 5. Security & Privacy Governance
- **AES-256-GCM Vault:** All customer OAuth tokens and CRM API keys are stored encrypted.
- **GDPR / CCPA Rule Engine:** Every outbound sequence is checked against global suppression registers before transmission.
- **TimescaleDB Columnar Compression:** Continuous 14-day chunk compaction keeps telemetry fast and cost-efficient.
