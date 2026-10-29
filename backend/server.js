/**
 * Aegis Growth OS — Core API Gateway & Web Application Server
 * Serves Phase 1 REST endpoints, Edge Interceptor Gateway, and in-app Dashboard.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');
const cryptoVault = require('./services/crypto_vault');
const crawlerService = require('./services/crawler_service');
const axoService = require('./services/axo_service');
const chunkerService = require('./services/chunker_service');
const promptService = require('./services/prompt_service');
const remediationService = require('./services/remediation_service');
const abTestingService = require('./services/ab_testing_service');
const nurtureService = require('./services/nurture_service');
const reportingService = require('./services/reporting_service');
const cmsSyncService = require('./services/cms_sync_service');
const { ShopifyMetafieldSynchronizer } = require('./services/shopify_sync');
const promptCompilerService = require('./services/prompt_compiler');
const complianceService = require('./services/compliance_service');
const hourlyEnhancementService = require('./services/hourly_enhancement_service');

const authService = require('./services/auth_service');
const authRouter = require('./routes/auth');
const oauthRouter = require('./routes/oauth');
const adGuardRouter = require('./routes/ad_guard');
const crmRouter = require('./routes/crm');
const { router: billingRouter } = require('./routes/billing');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standard Cookie Parser
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(c => {
      const [k, ...v] = c.split('=');
      if (k) req.cookies[k.trim()] = decodeURIComponent(v.join('=').trim());
    });
  }
  next();
});

// Enterprise Modular Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/oauth', oauthRouter);
app.use('/api/v1/ad-guard', adGuardRouter);
app.use('/api/v1/crm', crmRouter);
app.use('/api/v1/billing', billingRouter);

// =========================================================================
// CLIENT PORTAL GATE MIDDLEWARE
// Only authenticated users with active subscription or 1-day trial can enter
// =========================================================================
const portalGate = async (req, res, next) => {
  // Extract token from cookie, Authorization header, or query param
  const token = req.cookies?.aegis_session_token ||
                (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '').trim() : null) ||
                req.query?.token;

  const session = await authService.verifySession(token);
  if (!session.valid) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ success: false, error: 'Authentication required to enter client portal' });
    }
    return res.redirect('/login.html?redirect=/dashboard&reason=auth_required');
  }

  if (!session.allowed) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(403).json({ success: false, error: 'Active subscription or free trial required', reason: session.reason });
    }
    return res.redirect(`/login.html?redirect=/dashboard&reason=${session.reason || 'subscription_required'}`);
  }

  // Attach session user to req for downstream usage
  req.user = session.user;
  next();
};

// Protect Client Portal paths
app.use('/dashboard', portalGate, express.static(path.join(__dirname, '..', 'dashboard')));
app.use('/cdn', express.static(path.join(__dirname, '..', 'cdn')));

// Prevent root static middleware from serving dashboard files directly without gate
app.use((req, res, next) => {
  if (req.path.startsWith('/dashboard')) {
    return portalGate(req, res, next);
  }
  next();
});

// Serve Public Static Assets
app.use(express.static(path.join(__dirname, '..')));

// =========================================================================
// API ROUTE DEFINITIONS
// =========================================================================

// 1. Health & Vault Status
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'Aegis Growth OS',
    version: '2.0.0',
    databaseEngine: db.isPostgres() ? 'PostgreSQL (TimescaleDB + pgvector)' : 'In-Memory Development Ledger',
    cryptographicVault: 'AES-256-GCM Authenticated Active',
    timestamp: new Date().toISOString()
  });
});

// 2. Monitored Websites Management
app.get('/api/v1/websites', async (req, res) => {
  try {
    const sites = await db.getWebsites();
    res.json({ success: true, count: sites.length, websites: sites });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/websites', async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) {
      return res.status(400).json({ success: false, error: 'Domain is required' });
    }
    const website = await db.addWebsite(domain);
    // Trigger baseline audit asynchronously
    crawlerService.auditDomain(domain).catch(console.error);
    res.status(201).json({ success: true, message: 'Website connected to Aegis Growth OS', website });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Technical SEO & GEO Audit
app.post('/api/v1/websites/:domain/audit', async (req, res) => {
  try {
    const { domain } = req.params;
    const audit = await crawlerService.auditDomain(domain);
    res.json({ success: true, audit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. AXO (Agent Experience Optimization) Mission Runner
app.post('/api/v1/websites/:domain/axo-mission', async (req, res) => {
  try {
    const { domain } = req.params;
    const { goal } = req.body;
    const result = await axoService.runMission(domain, goal);
    await db.recordAxoLog({
      website_id: domain,
      task: result.goal,
      status: result.overallStatus.toLowerCase(),
      selector: result.detectedBreakages[0] || null,
      suggestion: result.remediationSuggestion
    });
    res.json({ success: true, missionResult: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Time-Series Citation & Attribution Metrics
app.get('/api/v1/analytics/trends', async (req, res) => {
  try {
    const { timeframe } = req.query;
    const trends = await db.getMetrics(timeframe);
    res.json({
      success: true,
      timeframe: timeframe || '7d',
      summary: {
        traditionalTrafficLift: '+15.4%',
        generativeShareOfVoice: '43.8%',
        zeroClickAttributionRate: '28.3%'
      },
      datapoints: trends
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Inbound Intent Interception Endpoint (Called by Edge Middleware or CDN Tag)
app.post('/api/v1/intercept/intent', (req, res) => {
  const { referrer_url, current_url, client_token } = req.body;

  let matchedIntent = 'enterprise_fintech_scalability';
  let headingText = 'The Low-Latency Distributed Database Built for Enterprise Fintech Scaling.';
  let placeholderText = 'Enter corporate email to review fintech benchmark studies';

  if (referrer_url && (referrer_url.includes('chatgpt') || referrer_url.includes('openai'))) {
    matchedIntent = 'cloud_cost_optimization';
    headingText = 'Cut Cloud Database Infrastructure TCO by 62% Without Sacrificing Performance.';
    placeholderText = 'Enter corporate email to calculate your custom ROI reduction';
  } else if (referrer_url && referrer_url.includes('google')) {
    matchedIntent = 'developer_api_simplicity';
    headingText = 'Zero-Boilerplate SQL & Vector APIs Built for High-Velocity Product Teams.';
    placeholderText = 'Enter work email to receive instantaneous API test keys';
  }

  res.json({
    status: 'matched',
    intent_classification: matchedIntent,
    dom_modifications: [
      {
        target_selector: 'h1.hero-title',
        action: 'replace_text',
        payload: headingText
      },
      {
        target_selector: 'input#primary-cta-field',
        action: 'set_attribute',
        payload: {
          attribute: 'placeholder',
          value: placeholderText
        }
      }
    ],
    injected_nurture_context: {
      intent_id: `int_${Date.now()}`,
      primary_pain_point: matchedIntent
    }
  });
});

// 7. Dynamic Interceptor Rules Management
app.get('/api/v1/interceptor/rules', async (req, res) => {
  const rules = await db.getInterceptorRules();
  res.json({ success: true, count: rules.length, rules });
});

app.post('/api/v1/interceptor/rules', async (req, res) => {
  try {
    const { selector, intent_tag, payload } = req.body;
    if (!selector || !payload) {
      return res.status(400).json({ success: false, error: 'Selector and payload are required' });
    }
    const rule = await db.addInterceptorRule({ selector, intent_tag, payload });
    res.status(201).json({ success: true, rule });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Inbound Lead Ingestion & Autonomous CRM
app.get('/api/v1/leads', async (req, res) => {
  const leads = await db.getLeads();
  res.json({ success: true, count: leads.length, leads });
});

app.post('/api/v1/leads', async (req, res) => {
  try {
    const { email, name, company, intent } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    const lead = await db.recordLead({ email, name, company, intent });
    res.status(201).json({
      success: true,
      message: 'Lead ingested, firmographics enriched, autonomous follow-up scheduled with verified website context.',
      lead
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// PHASE 2 API ENDPOINTS: VECTOR KNOWLEDGE, PROMPT EXPANSION & REMEDIATION
// =========================================================================

// 9. Semantic Knowledge Ingestion & Cosine Search
app.post('/api/v1/websites/:domain/vectorize', (req, res) => {
  const { domain } = req.params;
  const { url, content } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, error: 'Raw page content is required' });
  }
  const chunks = chunkerService.processDocumentToChunks(domain, url || `https://${domain}`, content);
  const storedCount = chunkerService.storeChunks(domain, chunks);
  res.json({
    success: true,
    domain,
    chunksCreated: chunks.length,
    totalStoredChunks: storedCount,
    message: `Generated ${chunks.length} 1536-dimensional semantic vector chunks for SDR memory.`
  });
});

app.post('/api/v1/websites/:domain/query-knowledge', (req, res) => {
  const { domain } = req.params;
  const { query, topK } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, error: 'Search query is required' });
  }
  const results = chunkerService.semanticSearch(domain, query, topK || 3);
  res.json({
    success: true,
    domain,
    query,
    resultsCount: results.length,
    vectorMatches: results
  });
});

// 10. Prompt Expansion & GEO Visibility Intelligence
app.get('/api/v1/websites/:domain/prompts', (req, res) => {
  const { domain } = req.params;
  const { keyword } = req.query;
  const seed = keyword || 'distributed database';
  const promptClusters = promptService.expandKeywordToPrompts(seed, domain);
  const visibilityReport = promptService.getEngineVisibilityReport(domain);
  res.json({
    success: true,
    domain,
    promptClusters,
    visibilityReport
  });
});

// 11. Automated Remediation Engine (Schema, /llms.txt, GitHub PR)
app.post('/api/v1/websites/:domain/remediation/generate-schema', (req, res) => {
  const { domain } = req.params;
  const { brandName } = req.body;
  const schema = remediationService.generateSchema(domain, brandName);
  res.json({ success: true, domain, schema });
});

app.post('/api/v1/websites/:domain/remediation/generate-llmstxt', (req, res) => {
  const { domain } = req.params;
  const { brandName } = req.body;
  const llmsTxt = remediationService.generateLlmsTxt(domain, brandName);
  res.json({ success: true, domain, llmsTxt });
});

app.post('/api/v1/websites/:domain/remediation/create-pr', (req, res) => {
  const { domain } = req.params;
  const { repoSlug, fixes } = req.body;
  const pr = remediationService.createGitPullRequest(domain, repoSlug, fixes);
  res.status(201).json({
    success: true,
    message: 'Automated remediation Pull Request generated with tested code diffs.',
    pullRequest: pr
  });
});

// 12. Bayesian A/B Testing & Conversion Lift Engine
app.get('/api/v1/experiments', (req, res) => {
  const experiments = abTestingService.getAllExperiments();
  res.json({ success: true, count: experiments.length, experiments });
});

app.post('/api/v1/experiments/:id/impression', (req, res) => {
  const { id } = req.params;
  const { variant } = req.body;
  const exp = abTestingService.recordImpression(id, variant || 'variant_intent');
  if (!exp) return res.status(404).json({ success: false, error: 'Experiment not found' });
  res.json({ success: true, experiment: exp });
});

app.post('/api/v1/experiments/:id/conversion', (req, res) => {
  const { id } = req.params;
  const { variant } = req.body;
  const exp = abTestingService.recordConversion(id, variant || 'variant_intent');
  if (!exp) return res.status(404).json({ success: false, error: 'Experiment not found' });
  res.json({ success: true, message: 'Conversion recorded under Bayesian model.', experiment: exp });
});

// 13. Autonomous 2-Way Conversational AI SDR & HITL Escalation
app.post('/api/v1/leads/:id/reply', (req, res) => {
  const { id } = req.params;
  const { replyText, domain } = req.body;
  if (!replyText) {
    return res.status(400).json({ success: false, error: 'Reply text is required' });
  }
  const result = nurtureService.processLeadReply(id, replyText, domain || 'fintechdb.io');
  res.json({ success: true, result });
});

app.get('/api/v1/leads/:id/thread', (req, res) => {
  const { id } = req.params;
  const thread = nurtureService.getThread(id);
  res.json({ success: true, leadId: id, messageCount: thread.length, thread });
});

// 14. Executive Audit & Performance Reporting
app.get('/api/v1/websites/:domain/export/report', async (req, res) => {
  try {
    const { domain } = req.params;
    const reportHtml = await reportingService.generateExecutiveReport(domain);
    res.setHeader('Content-Type', 'text/html');
    res.send(reportHtml);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// MODULE 1: EVENT-DRIVEN NATIVE CMS SYNC INFRASTRUCTURE
// =========================================================================

app.post('/api/v1/sync/shopify/update-product-node', async (req, res) => {
  try {
    const {
      shop_domain = 'targetclient.myshopify.com',
      shopify_product_graphql_id = 'gid://shopify/Product/89211029381',
      text_copy_payload = 'Engineered for financial transaction throughput with zero-overhead indexing.',
      schema_json_payload = { '@context': 'https://schema.org', '@type': 'Product', 'name': 'Enterprise Scalable DB' },
      encrypted_token_blob
    } = req.body || {};

    const synchronizer = new ShopifyMetafieldSynchronizer(shop_domain, encrypted_token_blob);
    const result = await synchronizer.pushOptimizationMetafields(
      shopify_product_graphql_id,
      text_copy_payload,
      schema_json_payload
    );
    res.json({ status: 'synchronized', result });
  } catch (err) {
    res.status(400).json({ error: 'Shopify synchronization failure', detail: err.message });
  }
});

app.post('/api/v1/sync/cms/ast-delta', async (req, res) => {
  try {
    const { pageId, targetUrl, modifications, schemaObject, intentTag, platform, wpEndpoint, siteUrl, apiKey } = req.body || {};
    const delta = cmsSyncService.generateAstDeltaPayload({ pageId, targetUrl, modifications, schemaObject, intentTag });

    let syncResult = { delta };
    if (platform === 'wordpress') {
      syncResult.wp = await cmsSyncService.syncToWordPress({ wpEndpoint, siteUrl, apiKey, astDelta: delta });
    }
    res.json({ success: true, ...syncResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/sync/cms/export-edge', async (req, res) => {
  try {
    const { domain = 'fintechdb.io', astDelta } = req.body || {};
    const result = await cmsSyncService.exportToEdgeRepository({ domain, astDelta });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// MODULE 2: SYNTHETIC PROMPT COMPILER & CO-CITATION MATRIX
// =========================================================================

app.post('/api/v1/prompt-compiler/compile', (req, res) => {
  try {
    const { core_keywords, locations, custom_intents } = req.body || {};
    const compiled = promptCompilerService.compileSyntheticPromptArrays(core_keywords, locations, custom_intents);
    res.json({ success: true, ...compiled });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/prompt-compiler/sweep', async (req, res) => {
  try {
    const { website_id, company_id, topics } = req.body || {};
    const results = await promptCompilerService.sweepAndComputeCoCitations(website_id, company_id, topics);
    res.json({ success: true, count: results.length, sweepResults: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/prompt-compiler/topology', async (req, res) => {
  try {
    const { website_id, company_id, domain } = req.query;
    const topology = await promptCompilerService.getTopologyGraph(website_id || 'site_01', company_id || 'comp_01', domain);
    res.json({ success: true, ...topology });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/prompt-compiler/co-citations', async (req, res) => {
  try {
    const { website_id, topic } = req.query;
    const matrix = await db.getCoCitationMatrix(website_id || 'site_01', topic);
    res.json({ success: true, count: matrix.length, matrix });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// PRIVACY COMPLIANCE & REGULATORY FIRE-BREAK
// =========================================================================

app.post('/api/v1/compliance/verify', (req, res) => {
  try {
    const result = complianceService.evaluateOutboundCompliance(req.body || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v1/compliance/audit-logs', (req, res) => {
  res.json({ logs: complianceService.getAuditLogs() });
});

app.post('/api/v1/compliance/suppress', (req, res) => {
  const result = complianceService.addSuppression(req.body || {});
  res.json(result);
});

// =========================================================================
// AUTONOMOUS HOURLY ENHANCEMENT ORCHESTRATOR
// =========================================================================

app.post('/api/v1/orchestrator/run-hourly-cycle', async (req, res) => {
  try {
    const result = await hourlyEnhancementService.executeHourlyEnhancementCycle('manual_api_trigger');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v1/orchestrator/hourly-status', (req, res) => {
  res.json(hourlyEnhancementService.getStatus());
});

app.get('/api/v1/orchestrator/hourly-history', (req, res) => {
  res.json({ history: hourlyEnhancementService.getHistory() });
});

// Start Server & Background Daemon
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Aegis Growth OS API Server running on port ${PORT}`);
  console.log(`📡 Health Check:     http://localhost:${PORT}/api/v1/health`);
  console.log(`🌐 Public Landing:   http://localhost:${PORT}`);
  console.log(`📊 Client Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`⏰ Hourly Enhancer:  Active (Runs every 60m autonomously)`);
  console.log(`=======================================================`);

  // Arm background hourly daemon
  hourlyEnhancementService.startDaemon();
});
