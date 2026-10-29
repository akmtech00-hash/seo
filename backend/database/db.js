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

  async getMetrics(timeframe = '7d') {
    return memoryStore.metrics;
  },

  async getAxoLogs() {
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

  async getLeads() {
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

  async getInterceptorRules() {
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

  async getCompetitorProfiles(companyId = 'comp_01') {
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

  async getCoCitationMatrix(websiteId = 'site_01', topic = null) {
    if (usePostgres) {
      let query = `
        SELECT ts.*, cp.brand_name, cp.domain_url
        FROM co_citation_matrix_ts ts
        JOIN competitor_profiles cp ON cp.id = ts.competitor_id
        WHERE ts.website_id = $1
      `;
      const params = [websiteId];
      if (topic) {
        query += ' AND ts.target_prompt_topic = $2';
        params.push(topic);
      }
      query += ' ORDER BY ts.time DESC, ts.proximity_score ASC LIMIT 50';
      const res = await pool.query(query, params);
      return res.rows;
    }
    return memoryStore.coCitationMatrix.filter(row => {
      const matchSite = !websiteId || row.website_id === websiteId;
      const matchTopic = !topic || row.target_prompt_topic.toLowerCase().includes(topic.toLowerCase());
      return matchSite && matchTopic;
    });
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
