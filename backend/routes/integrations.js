/**
 * Aegis Growth OS — 3rd-Party Integrations Router
 * Manages disconnected-by-default integrations with AES-256-GCM encrypted credentials.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const cryptoVault = require('../services/crypto_vault');

// Available 3rd-party integration platforms
const SUPPORTED_INTEGRATIONS = {
  google_search_console: {
    id: 'google_search_console',
    name: 'Google Search Console & GA4',
    category: 'search_console',
    description: 'Autonomous indexation sweep, zero-click impressions, and SERP click tracking.',
    fields: ['service_account_json', 'property_url']
  },
  bing_webmaster: {
    id: 'bing_webmaster',
    name: 'Microsoft Bing Webmaster Tools',
    category: 'search_console',
    description: 'IndexNow live API pushes and Copilot AI snippet citation tracking.',
    fields: ['api_key', 'site_url']
  },
  cloudflare_edge: {
    id: 'cloudflare_edge',
    name: 'Cloudflare Edge Workers (Zero-CLS)',
    category: 'edge_cdn',
    description: 'Sub-5ms HTML AST injection, dynamic Schema.org insertion, and bot interception.',
    fields: ['zone_id', 'api_token']
  },
  shopify_storefront: {
    id: 'shopify_storefront',
    name: 'Shopify Storefront & Metafields',
    category: 'cms_sync',
    description: 'Native GraphQL metafield syncing, product structured schema, and dynamic landing pages.',
    fields: ['shop_domain', 'admin_access_token']
  },
  hubspot_crm: {
    id: 'hubspot_crm',
    name: 'HubSpot & Salesforce CRM',
    category: 'crm',
    description: 'Real-time high-intent AI lead synchronization and dynamic battlecard feeding.',
    fields: ['portal_id', 'private_app_token']
  },
  github_pr: {
    id: 'github_pr',
    name: 'GitHub Auto-Remediation Publisher',
    category: 'developer_tools',
    description: 'Autonomous pull requests with verified code diffs, /llms.txt, and schema fixups.',
    fields: ['repo_slug', 'personal_access_token']
  },
  google_ads: {
    id: 'google_ads',
    name: 'Google Ads & Meta Graph (Ad Guard RTB)',
    category: 'advertising',
    description: 'Real-time bidding defense: triggers high-intent search ads when AI share of voice dips.',
    fields: ['customer_id', 'developer_token', 'refresh_token']
  }
};

// 1. Get status of all 3rd-party integrations (all default to connected: false)
router.get('/', async (req, res) => {
  try {
    const companyId = req.query.company_id || (req.user && req.user.company_id) || 'comp_01';
    const statusMap = await db.getIntegrations(companyId);

    // Merge metadata with connection statuses
    const list = Object.keys(SUPPORTED_INTEGRATIONS).map(key => {
      const meta = SUPPORTED_INTEGRATIONS[key];
      const state = statusMap[key] || { connected: false, last_sync: null, account_identifier: null };
      return {
        id: key,
        name: meta.name,
        category: meta.category,
        description: meta.description,
        fields: meta.fields,
        connected: Boolean(state.connected),
        account_identifier: state.account_identifier || null,
        connected_at: state.connected_at || null,
        last_sync: state.last_sync || null
      };
    });

    res.json({
      success: true,
      total: list.length,
      connectedCount: list.filter(i => i.connected).length,
      integrations: list
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Connect a 3rd-party platform (encrypts credentials into vault)
router.post('/:platform/connect', async (req, res) => {
  try {
    const { platform } = req.params;
    const companyId = req.body?.company_id || (req.user && req.user.company_id) || 'comp_01';

    if (!SUPPORTED_INTEGRATIONS[platform]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported integration platform: ${platform}. Supported: ${Object.keys(SUPPORTED_INTEGRATIONS).join(', ')}`
      });
    }

    const { credentials = {}, identifier } = req.body || {};

    // Encrypt sensitive credential payload before persisting
    const encryptedBlob = cryptoVault.encrypt(credentials);

    const updated = await db.connectIntegration(companyId, platform, {
      identifier: identifier || credentials.shop_domain || credentials.site_url || credentials.repo_slug || credentials.property_url || 'Enterprise Connected Account',
      encrypted_credentials: encryptedBlob
    });

    res.json({
      success: true,
      message: `Successfully connected ${SUPPORTED_INTEGRATIONS[platform].name}. Credentials encrypted in AES-256-GCM vault.`,
      integration: {
        platform,
        name: SUPPORTED_INTEGRATIONS[platform].name,
        connected: true,
        account_identifier: updated.account_identifier,
        connected_at: updated.connected_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Disconnect a 3rd-party platform
router.post('/:platform/disconnect', async (req, res) => {
  try {
    const { platform } = req.params;
    const companyId = req.body?.company_id || (req.user && req.user.company_id) || 'comp_01';

    if (!SUPPORTED_INTEGRATIONS[platform]) {
      return res.status(400).json({ success: false, error: `Invalid platform: ${platform}` });
    }

    const updated = await db.disconnectIntegration(companyId, platform);

    res.json({
      success: true,
      message: `Disconnected ${SUPPORTED_INTEGRATIONS[platform].name}. Stored credentials purged from vault.`,
      integration: {
        platform,
        connected: false
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
