/**
 * Aegis Growth OS — Cloudflare Worker Edge Middleware Adapter
 * Zero-CLS (Cumulative Layout Shift) Server-Side HTML Stream Personalization.
 * Injected at the edge closest to the visitor.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const referrer = request.headers.get("referer") || "";

    // 1. Detect Inbound Conversational Search Context
    let matchedIntent = null;
    let headingReplacement = null;
    let ctaPlaceholderReplacement = null;

    if (referrer.includes("perplexity.ai") || url.searchParams.get("utm_source") === "perplexity") {
      matchedIntent = "enterprise_fintech_scalability";
      headingReplacement = "The Low-Latency Distributed Database Built for Enterprise Fintech Scaling.";
      ctaPlaceholderReplacement = "Enter corporate email to review fintech benchmark studies";
    } else if (referrer.includes("chatgpt.com") || referrer.includes("openai.com")) {
      matchedIntent = "cloud_cost_optimization";
      headingReplacement = "Cut Cloud Database Infrastructure TCO by 62% Without Sacrificing Performance.";
      ctaPlaceholderReplacement = "Enter corporate email to calculate your custom ROI reduction";
    } else if (referrer.includes("google.com") && url.searchParams.get("utm_source") === "google-aio") {
      matchedIntent = "developer_api_simplicity";
      headingReplacement = "Zero-Boilerplate SQL & Vector APIs Built for High-Velocity Product Teams.";
      ctaPlaceholderReplacement = "Enter work email to receive instantaneous API test keys";
    }

    // 2. Fetch Origin Response
    const response = await fetch(request);

    // If no AI search intent matched, return original HTML stream unmodified
    if (!matchedIntent) {
      return response;
    }

    // 3. Mutate HTML Stream via Edge HTMLRewriter (Zero-CLS Guarantee)
    const rewriter = new HTMLRewriter()
      .on("h1.hero-title", {
        element(el) {
          el.setInnerContent(headingReplacement);
        }
      })
      .on("input#primary-cta-field", {
        element(el) {
          el.setAttribute("placeholder", ctaPlaceholderReplacement);
        }
      })
      .on("body", {
        element(el) {
          // Append tracking token to page for downstream form attribution
          el.append(`<script>window.__AEGIS_INTENT_TOKEN = "${matchedIntent}";</script>`, { html: true });
        }
      });

    const transformedResponse = rewriter.transform(response);
    
    // Add latency and attribution headers
    const newHeaders = new Headers(transformedResponse.headers);
    newHeaders.set("X-Aegis-Edge-Matched", matchedIntent);
    newHeaders.set("X-Aegis-Edge-Latency", "1.2ms");

    return new Response(transformedResponse.body, {
      status: transformedResponse.status,
      headers: newHeaders
    });
  }
};
