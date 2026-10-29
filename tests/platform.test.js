/**
 * Aegis Growth OS — Automated Core Platform Unit & Integration Test Suite
 */

const assert = require('assert');
const cryptoVault = require('../backend/services/crypto_vault');
const chunkerService = require('../backend/services/chunker_service');
const axoService = require('../backend/services/axo_service');
const abTestingService = require('../backend/services/ab_testing_service');
const guardrailsService = require('../backend/services/guardrails_service');
const nurtureService = require('../backend/services/nurture_service');

async function runTests() {
  console.log('🧪 [Test Suite] Starting Aegis Growth OS Core Assertions...\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Cryptographic Vault Tests
  test('CryptoVault: AES-256-GCM encrypts and correctly decrypts payload', () => {
    const original = { provider: 'google_search_console', refreshToken: 'mock_token_secret_12345' };
    const encrypted = cryptoVault.encrypt(original);
    assert.strictEqual(typeof encrypted, 'string');
    assert.strictEqual(encrypted.split(':').length, 3);

    const decrypted = cryptoVault.decrypt(encrypted);
    assert.deepStrictEqual(decrypted, original);
  });

  test('CryptoVault: Tampered payload throws authentication tag error', () => {
    const original = 'secure_api_key_payload';
    const encrypted = cryptoVault.encrypt(original);
    const parts = encrypted.split(':');
    // Tamper with ciphertext
    const tampered = parts[0] + ':' + parts[1] + ':' + parts[2].slice(0, -2) + 'ff';
    assert.throws(() => cryptoVault.decrypt(tampered));
  });

  // 2. Semantic Chunker Tests
  test('ChunkerService: Partitions text and produces 1536d normalized vectors', () => {
    const text = "Aegis Core delivers sub-15ms p99 write latency and Raft consensus for enterprise financial institutions scaling cloud transactions.";
    const chunks = chunkerService.processDocumentToChunks('fintechdb.io', '/architecture', text);
    assert.ok(chunks.length > 0);
    assert.strictEqual(chunks[0].embedding.length, 1536);

    // Assert unit vector magnitude = 1.0 (within float tolerance)
    const mag = Math.sqrt(chunks[0].embedding.reduce((acc, v) => acc + v * v, 0));
    assert.ok(Math.abs(mag - 1.0) < 0.001);
  });

  test('ChunkerService: Semantic search returns matching chunks with similarity score', () => {
    const results = chunkerService.semanticSearch('fintechdb.io', 'What is enterprise SLA uptime?');
    assert.ok(results.length > 0);
    assert.ok(typeof results[0].similarity_score === 'number');
  });

  // 3. AXO Agent Sandbox Tests
  await testAsync('AxoService: Executes simulated AI buyer telemetry mission', async () => {
    const mission = await axoService.runMission('fintechdb.io', 'Test quote submission');
    assert.strictEqual(mission.overallStatus, 'SUCCESS');
    assert.ok(mission.agentReadinessScore >= 90);
    assert.ok(mission.telemetryLogs.length >= 5);
  });

  // 4. Bayesian A/B Testing Tests
  test('AbTestingService: Recalculates relative lift and conversion rates', () => {
    const exp = abTestingService.recordConversion('exp_fintech_hero', 'variant_intent');
    assert.ok(exp.variants.variant_intent.conversions > 0);
    assert.ok(exp.stats.relativeLiftPercentage > 0);
  });

  // 5. Safety Guardrails Tests
  test('GuardrailsService: Redacts passwords and JWT tokens', () => {
    const raw = 'Config: api_key = "secret_12345" and token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-ID';
    const clean = guardrailsService.sanitizeText(raw);
    assert.ok(!clean.includes('secret_12345'));
    assert.ok(clean.includes('[REDACTED]'));
    assert.ok(clean.includes('[REDACTED_SYSTEM_TOKEN]'));
  });

  // 6. Nurture & 2-Way Conversational SDR Tests
  test('NurtureService: Grounds responses in verified facts', () => {
    const lead = { id: 'test_lead_01', first_name: 'David', initial_acquisition_intent: 'fintech_scalability' };
    const message = nurtureService.generateInitialNurture(lead, 'fintechdb.io');
    assert.ok(message.body.includes('David'));
    assert.ok(message.body.includes('cal.com/fintechdb'));
  });

  test('NurtureService: Triggers Human Takeover (HITL) on NDA / custom pricing request', () => {
    const reply = nurtureService.processLeadReply('test_lead_01', 'We require a custom NDA signed by legal before proceeding.', 'fintechdb.io');
    assert.strictEqual(reply.status, 'HUMAN_HANDOFF_TRIGGERED');
    assert.strictEqual(reply.slackAlertEmitted, true);
  });

  // 7. Module 1: Shopify GraphQL Metafields & AST Delta Tests
  const { ShopifyMetafieldSynchronizer } = require('../backend/services/shopify_sync');
  const cmsSyncService = require('../backend/services/cms_sync_service');

  test('Module 1: ShopifyMetafieldSynchronizer generates atomic metafieldsUpsert mutation', () => {
    const sync = new ShopifyMetafieldSynchronizer('brand.myshopify.com', 'mock_token');
    const { mutation, variables } = sync.buildMetafieldsUpsertMutation(
      'gid://shopify/Product/12345',
      'AI-optimized copy description',
      { '@type': 'Product', name: 'Fintech Core' }
    );
    assert.ok(mutation.includes('metafieldsUpsert'));
    assert.strictEqual(variables.metafields.length, 2);
    assert.strictEqual(variables.metafields[0].namespace, 'aegis_growth');
    assert.strictEqual(variables.metafields[0].key, 'geo_optimized_copy');
    assert.strictEqual(variables.metafields[1].key, 'agent_structured_schema');
  });

  test('Module 1: CmsSyncService generates signed AST Delta payload', () => {
    const delta = cmsSyncService.generateAstDeltaPayload({
      pageId: '42',
      targetUrl: 'https://fintechdb.io/enterprise',
      modifications: [{ selector: 'h1', content: 'Distributed ACID Engine' }],
      schemaObject: { '@type': 'SoftwareApplication', name: 'Aegis Core' },
      intentTag: 'fintech_scalability'
    });
    assert.ok(delta.deltaId.startsWith('ast_delta_'));
    assert.strictEqual(delta.astNodes.length, 2);
    assert.strictEqual(delta.astNodes[0].type, 'AST_SCHEMA_INJECTION');
    assert.strictEqual(delta.astNodes[1].type, 'AST_SEMANTIC_COPY_BLOCK');
    assert.ok(typeof delta.signature === 'string' && delta.signature.length === 64);
  });

  // 8. Module 2: Synthetic Prompt Compiler & Co-Citation Topology Tests
  const promptCompiler = require('../backend/services/prompt_compiler');

  test('Module 2: PromptCompiler compiles permutations across intents x keywords x locations', () => {
    const compiled = promptCompiler.compileSyntheticPromptArrays(
      ['fintech db', 'real-time ledger'],
      ['New York', 'London', 'Tokyo']
    );
    // 6 default intent prefixes * 2 keywords * 3 locations = 36 prompts
    assert.strictEqual(compiled.totalGenerated, 36);
    assert.ok(compiled.prompts[0].includes('in New York'));
  });

  await testAsync('Module 2: PromptCompiler builds D3 Topology Graph with nodes and links', async () => {
    const topology = await promptCompiler.getTopologyGraph('site_01', 'comp_01');
    assert.ok(topology.nodesData.length >= 2);
    assert.ok(topology.linksData.length >= 1);
    const origin = topology.nodesData.find(n => n.group === 'origin');
    assert.ok(origin);
    assert.strictEqual(origin.id, 'fintechdb.io');
    assert.ok(typeof topology.linksData[0].closenessWeight === 'number');
  });

  // 9. Module 3: Programmatic Real-Time Ad Guard (Smart RTB) Tests
  const adGuard = require('../backend/services/ad_guard_service');

  await testAsync('Module 3: AdGuard activates fallback PPC mutation when SoV drops below 40%', async () => {
    const result = await adGuard.evaluateVisibilityDrop({
      website_id: 'site_01',
      keyword_topic: 'distributed sql compliance',
      current_share_of_voice: 31.5,
      customer_ad_account_id: '982-114-8802',
      associated_fallback_campaign_id: 'cmp_fallback_772',
      boost_budget_id: 'bgt_550'
    });
    assert.strictEqual(result.status, 'activated');
    assert.strictEqual(result.currentSoV, 31.5);
    assert.ok(result.googleAdsMutation.operations[0].update.status === 'ENABLED');
    assert.ok(result.metaRetargetingPayload.daily_budget === 25000);
  });

  await testAsync('Module 3: AdGuard maintains stable state when SoV >= 40%', async () => {
    const result = await adGuard.evaluateVisibilityDrop({
      current_share_of_voice: 58.0
    });
    assert.strictEqual(result.status, 'stable');
  });

  // 10. Module 4: Dynamic Sales Battlecard CRM Engine Tests
  const battlecardService = require('../backend/services/battlecard_service');

  await testAsync('Module 4: BattlecardService constructs competitive sales battlecard', async () => {
    const result = await battlecardService.injectCrmSalesBattlecard({
      lead_email: 'alex.jones@enterprise-buyer.com',
      company_id: 'comp_01',
      identified_intent_topic: 'low latency fintech database'
    });
    assert.strictEqual(result.status, 'success');
    assert.ok(result.battlecard.includes('=== AEGIS LIVE SALES INTELLIGENCE BATTLECARD ==='));
    assert.ok(result.battlecard.includes('alex.jones@enterprise-buyer.com') || result.battlecard.includes('Lead Conversion Path'));
    assert.ok(result.crmPayload.properties.aegis_sales_battlecard);
  });

  // 11. SaaS Multi-Tenant Billing & Privacy Compliance Tests
  const { enforceUsageLimits, PLAN_LIMITS } = require('../backend/routes/billing');
  const complianceService = require('../backend/services/compliance_service');

  await testAsync('Billing: Enforces scraping quotas and feature gates', async () => {
    const checkScale = await enforceUsageLimits('comp_01', 'axo');
    assert.strictEqual(checkScale.allowed, true);

    assert.ok(PLAN_LIMITS.growth_monthly.axo_enabled === false);
    assert.ok(PLAN_LIMITS.scale_monthly.axo_enabled === true);
    assert.strictEqual(PLAN_LIMITS.enterprise_monthly.max_monthly_scrapes, 100000);
  });

  test('ComplianceService: Enforces GDPR consent and detects suppressed domains', () => {
    // Normal lead pass
    const pass = complianceService.evaluateOutboundCompliance({ email: 'valid.lead@acme.com', consentGiven: true });
    assert.strictEqual(pass.compliant, true);

    // GDPR without consent denied
    const gdprDenial = complianceService.evaluateOutboundCompliance({ email: 'buyer@berlin-tech.de', jurisdiction: 'GDPR_EU', consentGiven: false });
    assert.strictEqual(gdprDenial.compliant, false);
    assert.strictEqual(gdprDenial.reason, 'GDPR_EXPLICIT_CONSENT_MISSING');

    // Suppression list block
    const suppressionBlock = complianceService.evaluateOutboundCompliance({ email: 'optout@donotcontact.org' });
    assert.strictEqual(suppressionBlock.compliant, false);
    assert.strictEqual(suppressionBlock.reason, 'SUPPRESSION_LIST_MATCH');
  });

  // 12. Autonomous Hourly Enhancement Orchestrator Tests
  const hourlyEnhancer = require('../backend/services/hourly_enhancement_service');

  await testAsync('HourlyEnhancer: Runs 5-phase continuous SEO & Marketing enhancement cycle', async () => {
    const cycle = await hourlyEnhancer.executeHourlyEnhancementCycle('unit_test_run');
    assert.strictEqual(cycle.status, 'completed');
    assert.ok(cycle.summary.websitesEnhancedCount >= 1);
    assert.strictEqual(cycle.summary.results[0].edgeProfileRefreshed, true);
    assert.ok(typeof cycle.summary.results[0].technicalHealthScore === 'number');
    assert.ok(typeof cycle.summary.results[0].geoSweepVectorsLogged === 'number');

    const status = hourlyEnhancer.getStatus();
    assert.strictEqual(status.totalCyclesRecorded >= 1, true);
  });

  console.log(`\n=======================================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed.`);
  console.log(`=======================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
