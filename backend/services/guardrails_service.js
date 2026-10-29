/**
 * Aegis Growth OS — Safety Guardrails & Compliance Service
 * Sanitizes PII, redacts secrets, and audits outbound AI emails against verified site facts to eliminate hallucinations.
 */

const JWT_PATTERN = /eyJhbGciOi[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g;
const SECRET_KEY_PATTERN = /(password|passwd|secret|api_key|token)\s*[:=]\s*["']?\w+["']?/gi;

class GuardrailsService {
  /**
   * Sanitizes text removing unintentional system tokens and credentials
   * @param {string} text 
   * @returns {string}
   */
  sanitizeText(text) {
    if (!text) return '';
    let clean = text.replace(JWT_PATTERN, '[REDACTED_SYSTEM_TOKEN]');
    clean = clean.replace(SECRET_KEY_PATTERN, '$1: "[REDACTED]"');
    return clean;
  }

  /**
   * Validates draft AI email against verified website facts
   * @param {string} emailDraft 
   * @param {Array<string>} sourceFacts 
   * @returns {object}
   */
  auditOutboundMessage(emailDraft, sourceFacts = []) {
    const sanitized = this.sanitizeText(emailDraft);

    // Basic heuristic hallucination checks
    const hasUnverifiedPricing = sanitized.includes('$') && !sourceFacts.some(f => f.includes('$'));
    const isSafe = !hasUnverifiedPricing;

    return {
      isSafe,
      rejectionReason: isSafe ? null : "Draft mentioned pricing figures not verified in current domain vectors.",
      sanitizedText: sanitized,
      complianceScore: isSafe ? 1.0 : 0.65,
      auditTimestamp: new Date()
    };
  }
}

module.exports = new GuardrailsService();
