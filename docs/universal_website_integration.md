# Aegis Growth OS — Universal Website Integration Guide

Aegis Growth OS is architected to operate on **ANY website or web application in the world**, regardless of whether it is a legacy monolithic CMS, a cutting-edge Single Page Application (SPA), a server-rendered Jamstack site, an e-commerce storefront, or a custom enterprise backend.

---

## 1. Compatibility Matrix

| Platform / Framework | Integration Tier | Execution Method | Cumulative Layout Shift (CLS) |
| :--- | :--- | :--- | :--- |
| **Shopify (Liquid / Hydrogen)** | Tier 1 (Native GraphQL) | Admin GraphQL Metafields [2.0] + Theme Snippet | **0.00 (Zero-CLS)** |
| **WordPress (Core / Headless)** | Tier 1 (Native PHP Hook) | `wp_insert_post_data` Plugin + HashiCorp Vault | **0.00 (Zero-CLS)** |
| **Next.js (App / Pages Router)** | Tier 1 (Edge Middleware) | Vercel Edge / Cloudflare Worker `HTMLRewriter` | **0.00 (Zero-CLS)** |
| **Nuxt / Remix / SvelteKit** | Tier 1 (Edge Middleware) | Edge Worker HTML stream rewrites | **0.00 (Zero-CLS)** |
| **Webflow / Framer / Squarespace** | Tier 2 (Client Tag) | Lightweight `<10kb` Script + MutationObserver | **<0.01 (Imperceptible)** |
| **Single Page Apps (React/Vue/Angular)**| Tier 2 (Universal Tag) | History API Listener (`pushState`/`popstate`) | **<0.01 (Micro Cross-fade)** |
| **Custom Enterprise Backends (PHP, Go, Java, Python, Rails)** | Tier 1 or Tier 2 | Edge CDN Reverse Proxy or Universal Tag | **0.00 to <0.01** |

---

## 2. Integration Modes

### Mode A: Zero-CLS Edge Middleware (Recommended for SSR / Headless)
Intercepts inbound requests at edge points-of-presence in under 5ms, personalizing the HTML stream before bytes reach the visitor's browser.

#### Next.js Edge Middleware (`middleware.ts`):
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const referrer = request.headers.get('referer') || '';
  const response = NextResponse.next();

  if (referrer.includes('perplexity.ai') || referrer.includes('chatgpt.com')) {
    response.headers.set('x-aegis-intent', 'enterprise_scalability');
    response.headers.set('x-aegis-edge-personalized', 'true');
  }

  return response;
}
```

#### Cloudflare Worker (`worker.js`):
Uses native `HTMLRewriter` streaming:
```javascript
export default {
  async fetch(request, env) {
    const response = await fetch(request);
    const referrer = request.headers.get('Referer') || '';

    if (referrer.includes('perplexity.ai')) {
      return new HTMLRewriter()
        .on('h1.hero-title', {
          element(el) {
            el.setInnerContent('The Distributed Database Optimized for Enterprise Capital Markets.');
          }
        })
        .transform(response);
    }
    return response;
  }
};
```

---

### Mode B: Universal Client-Side Tag (Works on ALL Sites & CMSs)
Paste this single snippet inside the `<head>` of your website layout template:

```html
<!-- Place before closing </head> -->
<script 
  id="aegis-growth-tag" 
  data-client-token="pk_live_your_vault_token" 
  src="https://cdn.aegisgrowth.ai/aegis-interceptor.js" 
  async>
</script>
```

#### How the Universal Tag Adapts to Different Platforms:
1. **Single Page Applications (SPAs)**:
   - React, Vue, Angular, and Svelte hydrate components asynchronously.
   - The Aegis tag hooks into `window.history.pushState`, `window.history.replaceState`, and `window.onpopstate`.
   - A `MutationObserver` monitors DOM subtrees to reapply intent modifications when client-side route changes take place without page reloads.
2. **Strict Privacy Browsers (Referrer Stripping)**:
   - When visitors arrive via browsers that strip the `Referer` header, Aegis automatically checks query string parameters (`?utm_source=chatgpt`, `?ref=perplexity`, `?aegis_intent=...`) so personalization never drops.
3. **Adaptive Selector Heuristics**:
   - If a target selector (`h1.hero-title`) is missing on a page, Aegis falls back intelligently to platform standards (`.product__description` on Shopify, `.hero-heading` on Webflow, or the primary page `h1`).

---

### Mode C: Native CMS & Storefront Sync (Zero Template Code Edits)

#### Shopify Integration
Bypasses Liquid template code edits entirely. Optimization variants are written directly into Shopify Metafields [2.0 framework] via Admin GraphQL mutations:
- `product.metafields.aegis_growth.geo_optimized_copy`
- `product.metafields.aegis_growth.agent_structured_schema`

Add this single snippet to `layout/theme.liquid`:
```liquid
{% render 'aegis-seo-metafields' %}
```

#### WordPress Integration
Install the standalone Aegis AST Sync plugin (`cms/wordpress/aegis-ast-sync.php`). It hooks natively into WordPress database lifecycles:
- Filters post data on `wp_insert_post_data`
- Injects Schema.org blocks into `wp_head`
- Authenticates securely via `X-Aegis-Vault-Key` generated in HashiCorp Vault.

---

## 3. Verification & Core Web Vitals Checklist

To confirm zero layout shift (Zero-CLS) on any connected domain:
1. Run Google Chrome DevTools → **Performance** tab.
2. Enable **Web Vitals** and simulate an inbound AI search visit using query parameter: `?utm_source=perplexity.ai`.
3. Verify that **CLS** score is `<0.01` and **LCP** (Largest Contentful Paint) occurs in `<1.2s`.
