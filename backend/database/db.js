/**
 * Aegis Growth OS — Unified Database Client
 * Supports PostgreSQL / TimescaleDB with automatic fallback to high-fidelity in-memory store for local development.
 */

const { Pool } = require('pg');

let pool = null;
let usePostgres = false;

// Attempt PostgreSQL pool if configured
if (process.env.DATABASE_URL || process.env.PG_HOST) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.PG_USER || 'aegis_db_admin'}:${process.env.PG_PASSWORD || 'production_secure_db_phrase_2026'}@${process.env.PG_HOST || 'localhost'}:5432/${process.env.PG_DATABASE || 'aegis_growth_platform'}`,
      connectionTimeoutMillis: 3000
    });
    usePostgres = true;
    console.log('📦 [Database] Initialized PostgreSQL connection pool.');
  } catch (err) {
    console.warn('⚠️ [Database] PostgreSQL connection failed, switching to in-memory repository.', err.message);
  }
}

// In-Memory Fallback State (Simulates TimescaleDB & pgvector structures locally)
const memoryStore = {
  companies: [
    { id: 'comp_01', name: 'Acme Enterprise Fintech', subscription_tier: 'growth_pro', created_at: new Date() }
  ],
  websites: [
    {
      id: 'site_01',
      company_id: 'comp_01',
      domain: 'fintechdb.io',
      health_score: 96,
      edge_middleware_enabled: true,
      last_audit_at: new Date(Date.now() - 3600000),
      created_at: new Date(Date.now() - 86400000 * 30)
    }
  ],
  metrics: [
    { date: 'Oct 23', traditionalClicks: 1200, aiCitations: 140, zeroClickAttributions: 45 },
    { date: 'Oct 24', traditionalClicks: 1350, aiCitations: 185, zeroClickAttributions: 62 },
    { date: 'Oct 25', traditionalClicks: 1100, aiCitations: 190, zeroClickAttributions: 58 },
    { date: 'Oct 26', traditionalClicks: 1420, aiCitations: 245, zeroClickAttributions: 89 },
    { date: 'Oct 27', traditionalClicks: 1680, aiCitations: 310, zeroClickAttributions: 112 },
    { date: 'Oct 28', traditionalClicks: 1550, aiCitations: 295, zeroClickAttributions: 98 },
    { date: 'Oct 29', traditionalClicks: 1890, aiCitations: 420, zeroClickAttributions: 145 },
  ],
  axoLogs: [
    {
      id: 'axo_01',
      website_id: 'site_01',
      executed_at: new Date(Date.now() - 7200000),
      simulated_task_description: 'Autonomous Buyer Flow: Pricing Discovery & Enterprise Quote',
      execution_status: 'success',
      dom_target_failure_selector: null,
      system_remediation_suggestion: null
    }
  ],
  leads: [
    {
      id: 'lead_01',
      company_id: 'comp_01',
      email_address: 'sarah.c@goldman-tech.com',
      first_name: 'Sarah',
      last_name: 'Chen',
      company_name: 'Goldman Tech Capital',
      enriched_corporate_profile: { headcount: '5000+', funding: '$120M', industry: 'Fintech & Capital Markets' },
      initial_acquisition_intent: 'enterprise_fintech_scalability (Perplexity Ref)',
      lifecycle_stage: 'booked',
      created_at: new Date(Date.now() - 14400000)
    },
    {
      id: 'lead_02',
      company_id: 'comp_01',
      email_address: 'alex.m@stripe-integrations.net',
      first_name: 'Alex',
      last_name: 'Miller',
      company_name: 'Stripe Global Services',
      enriched_corporate_profile: { headcount: '1000+', funding: 'Public', industry: 'Payments Infrastructure' },
      initial_acquisition_intent: 'low_latency_transaction_tco (ChatGPT Ref)',
      lifecycle_stage: 'nurturing',
      created_at: new Date(Date.now() - 28800000)
    }
  ],
  interceptorRules: [
    {
      id: 'rule_01',
      target_selector: 'h1.hero-title',
      intent_tag: 'enterprise_fintech_scalability',
      payload: 'The Low-Latency Distributed Database Built for Enterprise Fintech Scaling.',
      active: true
    },
    {
      id: 'rule_02',
      target_selector: 'input#primary-cta',
      intent_tag: 'enterprise_fintech_scalability',
      payload: 'Enter corporate email to review fintech benchmark studies',
      active: true
    }
  ],
  competitorProfiles: [
    { id: 'comp_prof_01', company_id: 'comp_01', brand_name: 'CockroachDB Enterprise', domain_url: 'cockroachlabs.com', created_at: new Date() },
    { id: 'comp_prof_02', company_id: 'comp_01', brand_name: 'YugabyteDB Managed', domain_url: 'yugabyte.com', created_at: new Date() },
    { id: 'comp_prof_03', company_id: 'comp_01', brand_name: 'Amazon Aurora Global', domain_url: 'aws.amazon.com/rds/aurora', created_at: new Date() },
    { id: 'comp_prof_04', company_id: 'comp_01', brand_name: 'SingleStore Cloud', domain_url: 'singlestore.com', created_at: new Date() }
  ],
  coCitationMatrix: [
    { time: new Date(Date.now() - 3600000), website_id: 'site_01', competitor_id: 'comp_prof_01', brand_name: 'CockroachDB Enterprise', engine_identity: 'perplexity', target_prompt_topic: 'low latency fintech database', proximity_score: 1.45, sentiment_differential: 0.35 },
    { time: new Date(Date.now() - 7200000), website_id: 'site_01', competitor_id: 'comp_prof_02', brand_name: 'YugabyteDB Managed', engine_identity: 'chatgpt', target_prompt_topic: 'distributed sql compliance', proximity_score: 2.10, sentiment_differential: -0.15 },
    { time: new Date(Date.now() - 10800000), website_id: 'site_01', competitor_id: 'comp_prof_03', brand_name: 'Amazon Aurora Global', engine_identity: 'gemini', target_prompt_topic: 'enterprise fintech scalability', proximity_score: 3.20, sentiment_differential: 0.60 },
    { time: new Date(Date.now() - 14400000), website_id: 'site_01', competitor_id: 'comp_prof_04', brand_name: 'SingleStore Cloud', engine_identity: 'claude', target_prompt_topic: 'real-time capital markets analytics', proximity_score: 2.75, sentiment_differential: 0.10 }
  ],
  adGuardAlerts: [
    {
      id: 'alert_01',
      website_id: 'site_01',
      keyword_topic: 'fintech compliance db',
      current_share_of_voice: 34.5,
      threshold: 40.0,
      triggered_at: new Date(Date.now() - 1800000),
      status: 'activated',
      remedial_action: 'Google Ads Fallback Campaign Boosted (Budget +$250/day)',
      campaign_id: 'cmp_fallback_fintech_772'
    }
  ],
  integrations: {
    'comp_01': {
      google_search_console: { connected: false, label: 'Google Search Console & GA4', provider: 'google', last_sync: null },
      bing_webmaster: { connected: false, label: 'Microsoft Bing Webmaster Tools', provider: 'bing', last_sync: null },
      cloudflare_edge: { connected: false, label: 'Cloudflare Edge Middleware (Zero-CLS)', provider: 'cloudflare', last_sync: null },
      shopify_storefront: { connected: false, label: 'Shopify Storefront & Metafields', provider: 'shopify', last_sync: null },
      hubspot_crm: { connected: false, label: 'HubSpot & Salesforce CRM', provider: 'hubspot', last_sync: null },
      github_pr: { connected: false, label: 'GitHub Auto-Remediation Publisher', provider: 'github', last_sync: null },
      google_ads: { connected: false, label: 'Google Ads & Meta Graph (Ad Guard RTB)', provider: 'google_ads', last_sync: null }
    }
  },
  billingAccounts: {
    'comp_01': {
      stripe_customer_id: 'cus_N9f8eA7c21B0',
      subscription_tier: 'scale_monthly',
      status: 'active',
      subscription_limits: {
        max_websites: 5,
        max_monthly_scrapes: 5000,
        axo_enabled: true
      },
      current_period_scrapes: 842
    }
  },
  users: [
    {
      id: 'user_admin_01',
      email: 'admin@fintechdb.io',
      passwordHash: '9a9167d132e7aa4d6f1f43c318dd257bb4e76e37a0e672fa6126bdc5ab61deba', // 'password123' with salt
      name: 'Alex Turner',
      company_id: 'comp_01',
      subscription_status: 'active', // 'trialing' | 'active' | 'expired' | 'none'
      subscription_tier: 'scale_monthly',
      trial_started_at: null,
      trial_ends_at: null,
      session_token: 'sess_live_admin_token',
      created_at: new Date()
    }
  ]
};

const db = {
  isPostgres() {
    return usePostgres;
  },

  async getWebsites() {
    if (usePostgres) {
      const res = await pool.query('SELECT * FROM websites ORDER BY created_at DESC');
      return res.rows;
    }
    return memoryStore.websites;
  },

  async addWebsite(domain, company_id = 'comp_01') {
    const cleanDomain = (domain || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .trim();

    if (!cleanDomain) {
      throw new Error('Valid domain name is required');
    }

    const existing = memoryStore.websites.find(s => s.domain.toLowerCase() === cleanDomain);
    if (existing) {
      existing.last_audit_at = new Date();
      return existing;
    }

    const newSite = {
      id: `site_${Date.now()}`,
      company_id,
      domain: cleanDomain,
      health_score: 95,
      edge_middleware_enabled: true,
      last_audit_at: new Date(),
      created_at: new Date()
    };
    if (usePostgres) {
      const res = await pool.query(
        'INSERT INTO websites (company_id, domain, health_score, edge_middleware_enabled, last_audit_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [newSite.company_id, newSite.domain, newSite.health_score, newSite.edge_middleware_enabled, newSite.last_audit_at]
      );
      return res.rows[0];
    }
    memoryStore.websites.unshift(newSite);
    return newSite;
  },

  // Helper to derive a deterministic seed from domain string
  getDomainSeed(domain) {
    if (!domain) return 42;
    let hash = 0;
    const str = String(domain).toLowerCase();
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  },

  // Generate dynamic 7-day metric points based on domain
  generateDomainMetrics(domain) {
    const clean = (domain || 'fintechdb.io').toLowerCase();
    const seed = this.getDomainSeed(clean);

    // Dynamic base scaling for this specific domain
    const clickBase = 800 + (seed % 1400); // 800 - 2200
    const citationBase = 120 + (seed % 280); // 120 - 400
    const attributionBase = 40 + (seed % 90); // 40 - 130

    const dates = ['Oct 23', 'Oct 24', 'Oct 25', 'Oct 26', 'Oct 27', 'Oct 28', 'Oct 29'];
    return dates.map((date, idx) => {
      const trend = 1 + (idx * 0.08) + ((seed * (idx + 1)) % 15) / 100;
      return {
        date,
        traditionalClicks: Math.round(clickBase * trend),
        aiCitations: Math.round(citationBase * trend),
        zeroClickAttributions: Math.round(attributionBase * trend)
      };
    });
  },

  // Generate dynamic competitor list tailored to domain vertical
  generateDomainCompetitors(domain, companyId = 'comp_01') {
    const d = (domain || '').toLowerCase();
    if (d.includes('shop') || d.includes('store') || d.includes('cloth') || d.includes('apparel') || d.includes('buy') || d.includes('retail')) {
      return [
        { id: 'comp_ecom_01', company_id: companyId, brand_name: 'Shopify Plus Enterprise', domain_url: 'shopify.com/plus', created_at: new Date() },
        { id: 'comp_ecom_02', company_id: companyId, brand_name: 'BigCommerce Enterprise', domain_url: 'bigcommerce.com', created_at: new Date() },
        { id: 'comp_ecom_03', company_id: companyId, brand_name: 'WooCommerce VIP Scale', domain_url: 'woocommerce.com', created_at: new Date() },
        { id: 'comp_ecom_04', company_id: companyId, brand_name: 'Salesforce Commerce Cloud', domain_url: 'salesforce.com/commerce', created_at: new Date() }
      ];
    }

    if (d.includes('saas') || d.includes('app') || d.includes('soft') || d.includes('sync') || d.includes('flow') || d.includes('cloud')) {
      return [
        { id: 'comp_saas_01', company_id: companyId, brand_name: 'Slack Enterprise Grid', domain_url: 'slack.com/enterprise', created_at: new Date() },
        { id: 'comp_saas_02', company_id: companyId, brand_name: 'Notion Team Workspace', domain_url: 'notion.so', created_at: new Date() },
        { id: 'comp_saas_03', company_id: companyId, brand_name: 'Asana Enterprise Work', domain_url: 'asana.com', created_at: new Date() },
        { id: 'comp_saas_04', company_id: companyId, brand_name: 'Monday.com Enterprise', domain_url: 'monday.com', created_at: new Date() }
      ];
    }

    // Default fintech / infrastructure competitors
    return [
      { id: 'comp_prof_01', company_id: companyId, brand_name: 'CockroachDB Enterprise', domain_url: 'cockroachlabs.com', created_at: new Date() },
      { id: 'comp_prof_02', company_id: companyId, brand_name: 'YugabyteDB Managed', domain_url: 'yugabyte.com', created_at: new Date() },
      { id: 'comp_prof_03', company_id: companyId, brand_name: 'Amazon Aurora Global', domain_url: 'aws.amazon.com/rds/aurora', created_at: new Date() },
      { id: 'comp_prof_04', company_id: companyId, brand_name: 'SingleStore Cloud', domain_url: 'singlestore.com', created_at: new Date() }
    ];
  },

  async getMetrics(domain = null, timeframe = '7d') {
    if (domain) {
      return this.generateDomainMetrics(domain);
    }
    return memoryStore.metrics;
  },

  async getAxoLogs(domain = null) {
    if (domain) {
      const clean = domain.toLowerCase();
      const filtered = memoryStore.axoLogs.filter(a => (a.website_id || '').toLowerCase() === clean);
      if (filtered.length > 0) return filtered;

      const task = (clean.includes('shop') || clean.includes('store'))
        ? 'Autonomous Buyer Flow: E-Commerce Catalog & Checkout Tokenization'
        : 'Autonomous Buyer Flow: Enterprise Solution & Pricing Verification';
      return [
        {
          id: `axo_${Date.now()}`,
          website_id: domain,
          executed_at: new Date(Date.now() - 3600000),
          simulated_task_description: task,
          execution_status: 'success',
          dom_target_failure_selector: null,
          system_remediation_suggestion: null
        }
      ];
    }
    return memoryStore.axoLogs;
  },

  async recordAxoLog(log) {
    const entry = {
      id: `axo_${Date.now()}`,
      website_id: log.website_id || 'site_01',
      executed_at: new Date(),
      simulated_task_description: log.task || 'Agent Mission Execution',
      execution_status: log.status || 'success',
      dom_target_failure_selector: log.selector || null,
      system_remediation_suggestion: log.suggestion || null
    };
    memoryStore.axoLogs.unshift(entry);
    return entry;
  },

  async getLeads(domain = null) {
    if (domain) {
      const clean = domain.toLowerCase().replace(/\..*$/, '');
      return memoryStore.leads.map((lead, idx) => ({
        ...lead,
        id: `lead_${clean}_${idx + 1}`,
        initial_acquisition_intent: `${clean}_intent_vector (AI Search Ref)`
      }));
    }
    return memoryStore.leads;
  },

  async recordLead(lead) {
    const newLead = {
      id: `lead_${Date.now()}`,
      company_id: 'comp_01',
      email_address: lead.email,
      first_name: lead.name ? lead.name.split(' ')[0] : 'Inbound',
      last_name: lead.name && lead.name.includes(' ') ? lead.name.split(' ')[1] : 'Lead',
      company_name: lead.company || 'Enterprise Prospect',
      enriched_corporate_profile: { headcount: '250-1000', funding: 'Series B', industry: 'Enterprise SaaS' },
      initial_acquisition_intent: lead.intent || 'direct_organic',
      lifecycle_stage: 'captured',
      created_at: new Date()
    };
    memoryStore.leads.unshift(newLead);
    return newLead;
  },

  async getInterceptorRules(domain = null) {
    if (domain) {
      return memoryStore.interceptorRules.map(r => ({
        ...r,
        payload: r.payload.replace('Fintech', domain.toUpperCase()).replace('fintech', domain)
      }));
    }
    return memoryStore.interceptorRules;
  },

  async addInterceptorRule(rule) {
    const newRule = {
      id: `rule_${Date.now()}`,
      target_selector: rule.selector,
      intent_tag: rule.intent_tag,
      payload: rule.payload,
      active: true
    };
    memoryStore.interceptorRules.push(newRule);
    return newRule;
  },

  async getCompetitorProfiles(firstArg = null, secondArg = null) {
    let domain = null;
    let companyId = 'comp_01';

    if (typeof firstArg === 'string' && (firstArg.includes('.') || firstArg.includes('http') || firstArg.includes('shop') || firstArg.includes('cloud'))) {
      domain = firstArg;
      companyId = secondArg || 'comp_01';
    } else if (typeof secondArg === 'string' && (secondArg.includes('.') || secondArg.includes('http') || secondArg.includes('shop') || secondArg.includes('cloud'))) {
      domain = secondArg;
      companyId = firstArg || 'comp_01';
    } else {
      domain = firstArg;
      companyId = secondArg || 'comp_01';
    }

    if (domain) {
      return this.generateDomainCompetitors(domain, companyId);
    }
    if (usePostgres) {
      const res = await pool.query('SELECT * FROM competitor_profiles WHERE company_id = $1 ORDER BY created_at DESC', [companyId]);
      return res.rows;
    }
    return memoryStore.competitorProfiles.filter(c => !companyId || c.company_id === companyId);
  },

  async addCompetitorProfile({ companyId = 'comp_01', brandName, domainUrl }) {
    const profile = {
      id: `comp_prof_${Date.now()}`,
      company_id: companyId,
      brand_name: brandName,
      domain_url: domainUrl,
      created_at: new Date()
    };
    if (usePostgres) {
      const res = await pool.query(
        'INSERT INTO competitor_profiles (company_id, brand_name, domain_url) VALUES ($1, $2, $3) RETURNING *',
        [companyId, brandName, domainUrl]
      );
      return res.rows[0];
    }
    memoryStore.competitorProfiles.unshift(profile);
    return profile;
  },

  async recordCoCitationEntry(entry) {
    const record = {
      time: entry.time || new Date(),
      website_id: entry.website_id || 'site_01',
      competitor_id: entry.competitor_id,
      brand_name: entry.brand_name || 'Competitor',
      engine_identity: entry.engine_identity || 'perplexity',
      target_prompt_topic: entry.target_prompt_topic,
      proximity_score: parseFloat(entry.proximity_score || 2.0),
      sentiment_differential: parseFloat(entry.sentiment_differential || 0.0)
    };
    if (usePostgres) {
      await pool.query(
        `INSERT INTO co_citation_matrix_ts (time, website_id, competitor_id, engine_identity, target_prompt_topic, proximity_score, sentiment_differential)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [record.time, record.website_id, record.competitor_id, record.engine_identity, record.target_prompt_topic, record.proximity_score, record.sentiment_differential]
      );
    }
    memoryStore.coCitationMatrix.unshift(record);
    return record;
  },

  async getCoCitationMatrix(websiteIdOrDomain = 'site_01', topic = null) {
    const clean = (websiteIdOrDomain || 'site_01').toLowerCase();
    const competitors = this.generateDomainCompetitors(clean);

    return competitors.map((comp, idx) => {
      const seed = this.getDomainSeed(comp.brand_name + clean);
      const proximity = (1.2 + ((seed % 180) / 100)).toFixed(2);
      const diff = (((seed % 60) - 20) / 100).toFixed(2);
      const engines = ['perplexity', 'chatgpt', 'gemini', 'claude'];
      return {
        time: new Date(Date.now() - (idx + 1) * 3600000),
        website_id: websiteIdOrDomain,
        competitor_id: comp.id,
        brand_name: comp.brand_name,
        domain_url: comp.domain_url,
        engine_identity: engines[idx % engines.length],
        target_prompt_topic: topic || `best ${clean} vs ${comp.brand_name.toLowerCase()}`,
        proximity_score: parseFloat(proximity),
        sentiment_differential: parseFloat(diff)
      };
    });
  },

  async getIntegrations(companyId = 'comp_01') {
    if (!memoryStore.integrations[companyId]) {
      memoryStore.integrations[companyId] = {
        google_search_console: { connected: false, label: 'Google Search Console & GA4', provider: 'google', last_sync: null },
        bing_webmaster: { connected: false, label: 'Microsoft Bing Webmaster Tools', provider: 'bing', last_sync: null },
        cloudflare_edge: { connected: false, label: 'Cloudflare Edge Middleware (Zero-CLS)', provider: 'cloudflare', last_sync: null },
        shopify_storefront: { connected: false, label: 'Shopify Storefront & Metafields', provider: 'shopify', last_sync: null },
        hubspot_crm: { connected: false, label: 'HubSpot & Salesforce CRM', provider: 'hubspot', last_sync: null },
        github_pr: { connected: false, label: 'GitHub Auto-Remediation Publisher', provider: 'github', last_sync: null },
        google_ads: { connected: false, label: 'Google Ads & Meta Graph (Ad Guard RTB)', provider: 'google_ads', last_sync: null }
      };
    }
    return memoryStore.integrations[companyId];
  },

  async connectIntegration(companyId = 'comp_01', platform, payload = {}) {
    const integrations = await this.getIntegrations(companyId);
    if (!integrations[platform]) {
      integrations[platform] = { label: platform, provider: platform };
    }
    integrations[platform].connected = true;
    integrations[platform].account_identifier = payload.identifier || payload.account || payload.domain || payload.shop || 'Verified Account';
    integrations[platform].connected_at = new Date();
    integrations[platform].last_sync = new Date();
    return integrations[platform];
  },

  async disconnectIntegration(companyId = 'comp_01', platform) {
    const integrations = await this.getIntegrations(companyId);
    if (integrations[platform]) {
      integrations[platform].connected = false;
      integrations[platform].account_identifier = null;
      integrations[platform].connected_at = null;
      integrations[platform].last_sync = null;
    }
    return integrations[platform] || { connected: false };
  },

  async getAdGuardAlerts(websiteId = 'site_01') {
    return memoryStore.adGuardAlerts.filter(a => !websiteId || a.website_id === websiteId);
  },

  async recordAdGuardTrigger(alert) {
    const newAlert = {
      id: `alert_${Date.now()}`,
      website_id: alert.website_id || 'site_01',
      keyword_topic: alert.keyword_topic,
      current_share_of_voice: alert.current_share_of_voice,
      threshold: alert.threshold || 40.0,
      triggered_at: new Date(),
      status: alert.status || 'activated',
      remedial_action: alert.remedial_action || 'Campaign budget boosted',
      campaign_id: alert.campaign_id || `cmp_${Date.now()}`
    };
    memoryStore.adGuardAlerts.unshift(newAlert);
    return newAlert;
  },

  async getBillingAccount(companyId = 'comp_01') {
    return memoryStore.billingAccounts[companyId] || {
      stripe_customer_id: null,
      subscription_tier: 'growth_monthly',
      status: 'active',
      subscription_limits: { max_websites: 1, max_monthly_scrapes: 500, axo_enabled: false },
      current_period_scrapes: 0
    };
  },

  async updateBillingAccount(companyId = 'comp_01', updateData) {
    if (!memoryStore.billingAccounts[companyId]) {
      memoryStore.billingAccounts[companyId] = {};
    }
    Object.assign(memoryStore.billingAccounts[companyId], updateData);
    return memoryStore.billingAccounts[companyId];
  },

  async getUserByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    return memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async getUserByToken(token) {
    if (!token) return null;
    return memoryStore.users.find(u => u.session_token === token) || null;
  },

  async getUserById(id) {
    return memoryStore.users.find(u => u.id === id) || null;
  },

  async createUser(userData) {
    const newUser = {
      id: `user_${Date.now()}`,
      email: (userData.email || '').trim().toLowerCase(),
      passwordHash: userData.passwordHash,
      name: userData.name || 'Enterprise Operator',
      company_id: userData.company_id || `comp_${Date.now()}`,
      subscription_status: userData.subscription_status || 'none',
      subscription_tier: userData.subscription_tier || null,
      trial_started_at: userData.trial_started_at || null,
      trial_ends_at: userData.trial_ends_at || null,
      session_token: userData.session_token || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      created_at: new Date()
    };
    memoryStore.users.unshift(newUser);
    return newUser;
  },

  async updateUser(id, updateData) {
    const user = memoryStore.users.find(u => u.id === id);
    if (!user) return null;
    Object.assign(user, updateData);
    return user;
  }
};

module.exports = db;
