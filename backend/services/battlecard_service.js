/**
 * Aegis Growth OS — Sales Pipeline Battlecard & CRM Sync Engine
 * Module 4: Autonomous CRM Contact Enrichment
 * 
 * Injects context-aware competitive sales battlecards directly into CRM contact records
 * (HubSpot, Salesforce) whenever an organic or zero-click lead arrives from an AI search path.
 */

const db = require('../database/db');

class BattlecardService {
  /**
   * Generates tailored sales battlecard and updates CRM contact
   */
  async injectCrmSalesBattlecard({ lead_email, company_id = 'comp_01', identified_intent_topic = 'low latency fintech database' }) {
    if (!lead_email) {
      throw new Error('lead_email is required for CRM contact enrichment');
    }

    // 1. Query time-series co-citation matrix to find top competitor for this intent topic
    const citations = await db.getCoCitationMatrix('site_01', identified_intent_topic);
    
    let mainCompetitor = 'Legacy Database Providers';
    let proximityScore = 2.4;
    let sentimentDiff = 0.2;

    if (citations.length > 0) {
      // Sort by proximity (lowest distance = closest competitor)
      citations.sort((a, b) => parseFloat(a.proximity_score) - parseFloat(b.proximity_score));
      mainCompetitor = citations[0].brand_name || citations[0].competitor_id;
      proximityScore = citations[0].proximity_score;
      sentimentDiff = citations[0].sentiment_differential;
    }

    // 2. Build tailored battlecard copy script
    const battlecardContent = [
      '=== AEGIS LIVE SALES INTELLIGENCE BATTLECARD ===',
      `Lead Conversion Path: Arrived via AI search path targeting '${identified_intent_topic}'.`,
      `Main Competitor in AI Citations: ${mainCompetitor} (Proximity Score: ${proximityScore}).`,
      `Live Sentiment Delta: ${sentimentDiff > 0 ? '+' : ''}${sentimentDiff} favorable to your brand.`,
      '',
      `» Counter-argument vs ${mainCompetitor}: Highlight our sub-5ms global replication vs their multi-region write latency penalties.`,
      `» Tailored Pricing Playbook: Position our transparent predictability tier; emphasize lack of hidden per-core egress fees.`,
      '» Technical Proof Asset: Share the independent FinTech Scalability Benchmark PDF automatically.'
    ].join('\n');

    // 3. Prepare CRM API integration payload (HubSpot / Salesforce compatible format)
    const crmPayload = {
      properties: {
        aegis_sales_battlecard: battlecardContent,
        aegis_ai_inbound_intent: identified_intent_topic,
        aegis_primary_threat_competitor: mainCompetitor,
        aegis_enrichment_timestamp: new Date().toISOString()
      }
    };

    let crmStatus = 'simulated_crm_patched';

    // If live HubSpot/Salesforce tokens present
    if (process.env.HUBSPOT_API_TOKEN && process.env.HUBSPOT_LIVE_SYNC === 'true') {
      try {
        const resp = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(lead_email)}?idProperty=email`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.HUBSPOT_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(crmPayload)
        });
        if (resp.ok) crmStatus = 'hubspot_patched_live';
      } catch (err) {
        console.warn('HubSpot sync warning:', err.message);
      }
    }

    return {
      status: 'success',
      crmStatus,
      lead_email,
      identified_intent_topic,
      mainCompetitor,
      battlecard: battlecardContent,
      crmPayload
    };
  }
}

module.exports = new BattlecardService();
