# Aegis Growth OS — Troubleshooting & Technical FAQ

---

### Q1: How does Aegis guarantee Zero Cumulative Layout Shift (Zero-CLS)?
**Answer:**  
In Mode A (Edge Middleware via Cloudflare Workers / Next.js Edge), personalization takes place **before** the HTML response reaches the browser using `HTMLRewriter`. The browser renders the personalized copy on its first layout pass, resulting in a strict `0.00` CLS score.  
In Mode B (Universal Client Tag), the tag wraps replacements in a smooth 120ms micro-opacity cross-fade and operates before first paint (`DOMContentLoaded`), maintaining a Google Core Web Vitals score above 95.

---

### Q2: What happens if an AI engine or privacy browser strips the `Referer` header?
**Answer:**  
Browsers utilizing strict tracking protection (e.g., Brave, Safari Private Browsing) may omit the `Referer` HTTP header.  
Aegis addresses this through automatic query parameter fallback. If no referrer header is present, the script parses `?utm_source=perplexity`, `?ref=chatgpt`, or explicit intent keys (`?aegis_intent=...`) to maintain continuous personalization.

---

### Q3: How does the platform run without an active PostgreSQL / TimescaleDB instance?
**Answer:**  
The unified database adapter (`backend/database/db.js`) features dual-mode architecture. If `DATABASE_URL` or `PG_HOST` is unreachable, it automatically initializes an in-memory transactional ledger that simulates TimescaleDB hypertables, pgvector HNSW indices, and relational tables. This allows developers to run tests, demo the dashboard, and build UI components with zero external infrastructure dependencies.

---

### Q4: Why use Shopify Metafields instead of editing Liquid template files?
**Answer:**  
Competitor tools write directly into Liquid theme files via REST APIs. This causes broken layouts when merchants change themes or update app extensions. Aegis writes variants into native Shopify Metafields [2.0 framework] via GraphQL (`product.metafields.aegis_growth.geo_optimized_copy`). The companion theme snippet reads this field dynamically, keeping template code 100% clean and update-proof.

---

### Q5: How does the Programmatic Ad Guard prevent budget waste?
**Answer:**  
Unlike static scripts that run once every 24 hours, Aegis triggers mutations instantaneously the second Share of Voice (SoV) drops below the **40.0%** safety threshold. It activates pre-configured fallback campaigns and targets prompt slips while search volume is active, then restores default spend when visibility stabilizes.

---

### Q6: How do we test the platform under high concurrent load?
**Answer:**  
Run the included Locust load test suite:
```bash
locust -f tests/locustfile.py --host http://localhost:4000
```
This simulates thousands of concurrent visitors arriving from Perplexity, ChatGPT, and Claude hitting the interceptor and converting via lead forms.
