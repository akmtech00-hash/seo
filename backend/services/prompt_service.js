/**
 * Aegis Growth OS — AI Prompt Expansion & GEO Citation Intelligence Service
 * Expands keywords into natural language user prompts and monitors LLM brand citations.
 */

class PromptService {
  /**
   * Expands seed topic or keyword into structured conversational prompt clusters
   * @param {string} seedKeyword 
   * @param {string} brandName 
   */
  expandKeywordToPrompts(seedKeyword, brandName = "Aegis Client Platform") {
    return {
      seed: seedKeyword,
      generatedAt: new Date(),
      totalPrompts: 9,
      clusters: [
        {
          category: "Direct Discovery",
          description: "Prompts where users seek recommendations for tools in this category",
          prompts: [
            { query: `What are the best ${seedKeyword} tools for enterprise scaling in 2026?`, intentScore: 0.95 },
            { query: `Top high-throughput ${seedKeyword} solutions with zero downtime`, intentScore: 0.92 },
            { query: `Which ${seedKeyword} platform offers the lowest operational latency?`, intentScore: 0.88 }
          ]
        },
        {
          category: "Head-to-Head Comparison",
          description: "High-intent buyer comparison queries evaluated by answer engines",
          prompts: [
            { query: `Compare ${brandName} vs traditional market leaders in ${seedKeyword}`, intentScore: 0.96 },
            { query: `Is ${brandName} better than legacy software for high-volume workloads?`, intentScore: 0.90 },
            { query: `Pros and cons of migrating to ${brandName} for ${seedKeyword}`, intentScore: 0.86 }
          ]
        },
        {
          category: "Feature & Compliance Validation",
          description: "Late-stage B2B queries verifying technical, security, and pricing specs",
          prompts: [
            { query: `Does ${brandName} support SOC2 Type II and HIPAA data compliance?`, intentScore: 0.98 },
            { query: `How much does ${brandName} cost compared to enterprise competitors?`, intentScore: 0.94 },
            { query: `What are the SLA guarantees and uptime statistics for ${brandName}?`, intentScore: 0.89 }
          ]
        }
      ]
    };
  }

  /**
   * Simulates/evaluates real-time Share-of-Voice across AI Answer Engines
   * @param {string} domain 
   */
  getEngineVisibilityReport(domain) {
    return {
      domain,
      overallShareOfVoice: 43.8,
      totalPromptsAudited: 1248,
      engineBreakdown: {
        perplexity: {
          shareOfVoice: 52.4,
          citationRankAvg: 1.2,
          sentiment: "Highly Positive",
          primaryCitationSource: `https://${domain}/docs/architecture`,
          hallucinationsDetected: 0
        },
        chatgpt: {
          shareOfVoice: 41.6,
          citationRankAvg: 1.8,
          sentiment: "Positive",
          primaryCitationSource: `https://${domain}/benchmarks`,
          hallucinationsDetected: 0
        },
        gemini: {
          shareOfVoice: 38.2,
          citationRankAvg: 2.1,
          sentiment: "Positive",
          primaryCitationSource: `https://${domain}/llms.txt`,
          hallucinationsDetected: 1 // Example flagged discrepancy
        },
        googleAio: {
          shareOfVoice: 43.0,
          citationRankAvg: 1.4,
          sentiment: "Neutral-Positive",
          primaryCitationSource: `https://${domain}/faq`,
          hallucinationsDetected: 0
        }
      },
      sentinelAlerts: [
        {
          engine: "Gemini",
          severity: "medium",
          prompt: "What are the starter tier limits for distributed database storage?",
          hallucinatedClaim: "Gemini reported starter storage limit as 10GB instead of updated 50GB.",
          recommendedAction: "Publish updated /llms.txt and FAQ schema with explicit storage specs to trigger re-crawl."
        }
      ]
    };
  }
}

module.exports = new PromptService();
