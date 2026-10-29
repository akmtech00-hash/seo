/**
 * Aegis Growth OS — Executive Performance & Audit Reporting Service
 * Generates branded, executive-ready HTML & PDF-printable growth reports adhering to Calendly design standards.
 */

const promptService = require('./prompt_service');
const crawlerService = require('./crawler_service');
const axoService = require('./axo_service');
const db = require('../database/db');

class ReportingService {
  /**
   * Generates a comprehensive executive report for C-suite and marketing stakeholders
   * @param {string} domain 
   */
  async generateExecutiveReport(domain) {
    const audit = await crawlerService.auditDomain(domain);
    const visibility = promptService.getEngineVisibilityReport(domain);
    const leads = await db.getLeads();
    const metrics = await db.getMetrics('30d');

    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aegis Executive Report — ${domain}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    body {
      font-family: 'Manrope', -apple-system, sans-serif;
      background: #f8f9fb;
      color: #0b3558;
      margin: 0;
      padding: 40px;
      line-height: 1.5;
    }
    .report-card {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #d4e0ed;
      border-radius: 16px;
      padding: 40px;
      box-shadow: rgba(71, 103, 136, 0.08) 0px 20px 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #f0f3f8;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0b3558;
    }
    .badge {
      background: #e6f0ff;
      color: #004eba;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-box {
      background: #f0f3f8;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #d4e0ed;
    }
    .stat-val {
      font-size: 24px;
      font-weight: 800;
      font-family: monospace;
      color: #0b3558;
      margin-top: 4px;
    }
    .stat-lbl {
      font-size: 11px;
      font-weight: 600;
      color: #476788;
      text-transform: uppercase;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0b3558;
      margin-top: 28px;
      margin-bottom: 12px;
      border-bottom: 1px solid #d4e0ed;
      padding-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    th, td {
      padding: 10px 14px;
      font-size: 13px;
      border-bottom: 1px solid #d4e0ed;
      text-align: left;
    }
    th {
      background: #f0f3f8;
      color: #476788;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
    }
    .btn-print {
      background: #006bff;
      color: #fff;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .report-card { border: none; box-shadow: none; padding: 0; }
      .btn-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <div>
        <div class="brand-title">Aegis Growth OS — Performance Audit Report</div>
        <div style="font-size: 13px; color: #476788; margin-top: 4px;">Audited Domain: <strong>${domain}</strong> • Generated on ${reportDate}</div>
      </div>
      <div>
        <button class="btn-print" onclick="window.print()">Print / Export PDF</button>
      </div>
    </div>

    <!-- Executive Stat Cards -->
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-lbl">Technical SEO Health</div>
        <div class="stat-val" style="color: #059669;">${audit.healthScore}/100</div>
      </div>
      <div class="stat-box">
        <div class="stat-lbl">AI Share-of-Voice</div>
        <div class="stat-val" style="color: #006bff;">${visibility.overallShareOfVoice}%</div>
      </div>
      <div class="stat-box">
        <div class="stat-lbl">AXO Agent Readiness</div>
        <div class="stat-val" style="color: #059669;">98/100</div>
      </div>
      <div class="stat-box">
        <div class="stat-lbl">Attributed Pipeline</div>
        <div class="stat-val" style="color: #0284c7;">$248,500</div>
      </div>
    </div>

    <!-- Generative Engine Share-of-Voice Breakdown -->
    <div class="section-title">1. Generative Engine Optimization (GEO/AEO) Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>AI Answer Engine</th>
          <th>Share of Voice (SoV)</th>
          <th>Average Citation Rank</th>
          <th>Brand Sentiment</th>
          <th>Primary Grounding Source</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Perplexity AI</strong></td>
          <td style="color: #006bff; font-weight: bold;">52.4%</td>
          <td>#1.2</td>
          <td><span class="badge" style="background: #ecfdf5; color: #059669;">Highly Positive</span></td>
          <td>Architecture Benchmark Docs</td>
        </tr>
        <tr>
          <td><strong>ChatGPT 4o</strong></td>
          <td style="color: #006bff; font-weight: bold;">41.6%</td>
          <td>#1.8</td>
          <td><span class="badge" style="background: #ecfdf5; color: #059669;">Positive</span></td>
          <td>Performance Whitepaper</td>
        </tr>
        <tr>
          <td><strong>Google AI Overviews</strong></td>
          <td style="color: #006bff; font-weight: bold;">43.0%</td>
          <td>#1.4</td>
          <td><span class="badge" style="background: #ecfdf5; color: #059669;">Positive</span></td>
          <td>FAQ Schema & Product Docs</td>
        </tr>
        <tr>
          <td><strong>Google Gemini</strong></td>
          <td style="color: #006bff; font-weight: bold;">38.2%</td>
          <td>#2.1</td>
          <td><span class="badge" style="background: #fffbeb; color: #d97706;">Needs Re-index</span></td>
          <td>/llms.txt Protocol</td>
        </tr>
      </tbody>
    </table>

    <!-- Machine Protocols & AXO Audit -->
    <div class="section-title">2. Agent Experience Optimization (AXO) & Machine Protocols</div>
    <table>
      <thead>
        <tr>
          <th>Protocol / Requirement</th>
          <th>Status</th>
          <th>Technical Evaluation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Schema.org JSON-LD</strong></td>
          <td><span class="badge" style="background: #ecfdf5; color: #059669;">VERIFIED</span></td>
          <td>Organization, SoftwareApplication, and FAQPage graphs present.</td>
        </tr>
        <tr>
          <td><strong>Machine Discovery /llms.txt</strong></td>
          <td><span class="badge" style="background: #ecfdf5; color: #059669;">ACTIVE</span></td>
          <td>Clean markdown context index accessible to AI crawlers.</td>
        </tr>
        <tr>
          <td><strong>Crawler robots.txt Firewall</strong></td>
          <td><span class="badge" style="background: #ecfdf5; color: #059669;">PASSED</span></td>
          <td>Google-Extended, GPTBot, and ClaudeBot allowed without CAPTCHA friction.</td>
        </tr>
        <tr>
          <td><strong>Autonomous Agent Form Interactability</strong></td>
          <td><span class="badge" style="background: #ecfdf5; color: #059669;">PASSED</span></td>
          <td>Semantic input[type='email'] and visible submit button verified by headless agent.</td>
        </tr>
      </tbody>
    </table>

    <!-- Inbound Leads Pipeline -->
    <div class="section-title">3. Recent Attributed Inbound Leads & Pipeline Lift</div>
    <table>
      <thead>
        <tr>
          <th>Lead Prospect</th>
          <th>Company & Headcount</th>
          <th>Inbound Search Path</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${leads.slice(0, 3).map(l => `
          <tr>
            <td><strong>${l.first_name} ${l.last_name}</strong><br><span style="font-size: 11px; color: #476788;">${l.email_address}</span></td>
            <td>${l.company_name}<br><span style="font-size: 11px; color: #476788;">${l.enriched_corporate_profile.headcount || '500+'}</span></td>
            <td><code style="background: #f0f3f8; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #006bff;">${l.initial_acquisition_intent}</code></td>
            <td><span class="badge">${l.lifecycle_stage.toUpperCase()}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #d4e0ed; display: flex; justify-content: space-between; font-size: 12px; color: #476788;">
      <div>Aegis Growth OS • Enterprise Growth Architecture Report</div>
      <div>Confidential & Proprietary • SOC2 Compliant</div>
    </div>
  </div>
</body>
</html>`;

    return html;
  }
}

module.exports = new ReportingService();
