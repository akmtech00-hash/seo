/**
 * Aegis Growth OS — Universal Inbound Intent Interceptor Tag
 * Version: 2.1.0-Universal
 * 
 * Works on ANY website:
 * - Single Page Applications (React, Vue, Angular, Svelte, Next.js, Nuxt, Remix)
 * - Headless & Edge-Rendered Platforms (Astro, Gatsby, Vercel, Cloudflare)
 * - Major CMSs (WordPress, Shopify, Webflow, Squarespace, Ghost, Magento)
 * - Custom Static HTML & Enterprise Backends (PHP, Python, Ruby, Java, Go, Node)
 * 
 * Features:
 * - Zero Cumulative Layout Shift (Zero-CLS micro-transitions)
 * - SPA Route Navigation Listener (`history.pushState`, `replaceState`, `popstate`)
 * - MutationObserver for dynamic React/Vue DOM hydration
 * - Privacy-Safe Intent Fallback (supports `?utm_source`, `?ref`, `?aegis_intent`)
 * - Automatic CMS / Platform Heuristics Detection
 */

(function (window, document) {
  'use strict';

  // Prevent multiple tag instantiations
  if (window.__AEGIS_INITIALIZED__) return;
  window.__AEGIS_INITIALIZED__ = true;

  const scriptTag = document.getElementById('aegis-growth-tag') || document.querySelector('script[data-client-token]');
  const clientToken = scriptTag ? scriptTag.getAttribute('data-client-token') : (window.AEGIS_TOKEN || 'pk_live_default');
  const GATEWAY_URL = window.AEGIS_GATEWAY || (scriptTag && scriptTag.getAttribute('data-gateway')) || 'http://localhost:4000/api/v1/interceptor/intent';

  // Platform detection heuristics
  const detectedPlatform = (function detectPlatform() {
    if (window.Shopify) return 'shopify';
    if (document.body && document.body.classList.contains('wp-admin') || window.wp) return 'wordpress';
    if (window.Webflow) return 'webflow';
    if (window.__NEXT_DATA__) return 'nextjs';
    if (window.__NUXT__) return 'nuxtjs';
    if (window.astro) return 'astro';
    return 'universal_html';
  })();

  let currentAppliedDelta = null;
  let observer = null;

  /**
   * Extracts inbound intent signals from referrer, URL parameters, and session history
   */
  function extractInboundContext() {
    const referrer = document.referrer || '';
    const currentUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);

    let matchedEngine = null;
    let fallbackIntent = urlParams.get('aegis_intent') || urlParams.get('utm_term') || null;

    // 1. Detect AI Engine Referrers
    if (referrer.includes('perplexity.ai')) matchedEngine = 'perplexity';
    else if (referrer.includes('chatgpt.com') || referrer.includes('openai.com')) matchedEngine = 'chatgpt';
    else if (referrer.includes('gemini.google.com') || referrer.includes('bard.google.com')) matchedEngine = 'gemini';
    else if (referrer.includes('claude.ai')) matchedEngine = 'claude';
    else if (referrer.includes('google.com')) matchedEngine = 'google_sge';
    else if (referrer.includes('bing.com') || referrer.includes('copilot.microsoft.com')) matchedEngine = 'copilot';

    // 2. Query param intent fallback (for strict privacy browsers that strip Referer header)
    if (!matchedEngine) {
      const utmSource = (urlParams.get('utm_source') || '').toLowerCase();
      const refParam = (urlParams.get('ref') || '').toLowerCase();
      if (utmSource.includes('perplexity') || refParam.includes('perplexity')) matchedEngine = 'perplexity';
      else if (utmSource.includes('chatgpt') || refParam.includes('chatgpt')) matchedEngine = 'chatgpt';
      else if (utmSource.includes('claude') || refParam.includes('claude')) matchedEngine = 'claude';
      else if (fallbackIntent) matchedEngine = 'direct_prompt_intent';
    }

    if (!matchedEngine && !fallbackIntent) return null;

    return {
      engine: matchedEngine || 'organic_direct',
      referrerUrl: referrer,
      targetUrl: currentUrl,
      platform: detectedPlatform,
      explicitIntentTag: fallbackIntent,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Applies DOM modifications with zero-CLS smooth cross-fade
   */
  function applyModifications(modifications) {
    if (!Array.isArray(modifications)) return;

    modifications.forEach(mod => {
      // Support CSS selectors or platform-adaptive fallbacks
      let targetSelector = mod.target_selector;
      if (!document.querySelector(targetSelector)) {
        if (detectedPlatform === 'shopify' && document.querySelector('.product__description, .product-single__description')) {
          targetSelector = '.product__description, .product-single__description';
        } else if (detectedPlatform === 'webflow' && document.querySelector('h1, .hero-heading')) {
          targetSelector = 'h1, .hero-heading';
        } else if (document.querySelector('h1')) {
          targetSelector = 'h1';
        }
      }

      const elements = document.querySelectorAll(targetSelector);
      elements.forEach(el => {
        // Prevent reapplying identical payload
        if (el.getAttribute('data-aegis-modified') === 'true') return;

        // Zero-CLS micro cross-fade
        el.style.transition = 'opacity 120ms ease-in-out';
        el.style.opacity = '0.7';

        setTimeout(() => {
          if (mod.action === 'replace_text') {
            el.innerText = mod.payload;
          } else if (mod.action === 'set_attribute' && mod.payload) {
            el.setAttribute(mod.payload.attribute, mod.payload.value);
          } else if (mod.action === 'inject_html') {
            el.innerHTML = mod.payload;
          }
          el.setAttribute('data-aegis-modified', 'true');
          el.style.opacity = '1';
        }, 120);
      });
    });
  }

  /**
   * Enriches all active HTML forms with intent tracking metadata for CRM synchronization
   */
  function enrichForms(intentContextId) {
    if (!intentContextId) return;

    document.querySelectorAll('form').forEach(form => {
      if (!form.querySelector('input[name="aegis_intent_context_id"]')) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'aegis_intent_context_id';
        hiddenInput.value = intentContextId;
        form.appendChild(hiddenInput);
      }
    });
  }

  /**
   * Main personalizer routine
   */
  async function runPersonalizer() {
    const context = extractInboundContext();
    if (!context) return;

    try {
      const response = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientToken}`
        },
        body: JSON.stringify({
          client_token: clientToken,
          referrer_url: context.referrerUrl,
          current_url: context.targetUrl,
          platform: context.platform,
          intent_tag: context.explicitIntentTag
        })
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.status === 'matched') {
        currentAppliedDelta = data.dom_modifications;
        applyModifications(currentAppliedDelta);

        if (data.injected_nurture_context && data.injected_nurture_context.intent_id) {
          enrichForms(data.injected_nurture_context.intent_id);
        }

        // Set up MutationObserver for Single Page App hydration (React/Vue/Next.js)
        if (!observer && window.MutationObserver) {
          observer = new MutationObserver(() => {
            if (currentAppliedDelta) {
              applyModifications(currentAppliedDelta);
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      }
    } catch (err) {
      // Passive failover: never break host website functionality
      if (window.AEGIS_DEBUG) console.warn('[Aegis Interceptor] Passive bypass:', err.message);
    }
  }

  // 1. Initial Page Load Execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPersonalizer);
  } else {
    runPersonalizer();
  }

  // 2. SPA Route Navigation Handlers (HTML5 History API & popstate)
  const originalPushState = history.pushState;
  if (originalPushState) {
    history.pushState = function () {
      originalPushState.apply(this, arguments);
      setTimeout(runPersonalizer, 50);
    };
  }

  const originalReplaceState = history.replaceState;
  if (originalReplaceState) {
    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      setTimeout(runPersonalizer, 50);
    };
  }

  window.addEventListener('popstate', () => {
    setTimeout(runPersonalizer, 50);
  });

})(window, document);
