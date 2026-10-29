/**
 * Aegis Growth OS — Shopify Storefront Metafields GraphQL Sync Engine
 * Module 1: Event-Driven Native CMS Sync Infrastructure
 * 
 * Bypasses theme template edits by executing Admin GraphQL mutations directly,
 * writing SEO, GEO, and AEO optimization variants directly into Metafields [2.0 framework].
 */

const cryptoVault = require('./crypto_vault');

class ShopifyMetafieldSynchronizer {
  /**
   * @param {string} shopDomain e.g. "my-brand.myshopify.com"
   * @param {string|Buffer} accessToken Encrypted access token or plain string in test mode
   */
  constructor(shopDomain, accessToken) {
    this.shopDomain = (shopDomain || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    this.graphqlUrl = `https://${this.shopDomain}/admin/api/2026-04/graphql.json`;
    
    // Decrypt if encrypted blob or use raw string
    try {
      if (typeof accessToken === 'string' && accessToken.includes(':')) {
        const decrypted = cryptoVault.decrypt(accessToken);
        this.accessToken = decrypted;
      } else {
        this.accessToken = accessToken || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || 'shpat_mock_vault_token';
      }
    } catch (e) {
      this.accessToken = accessToken || 'shpat_mock_vault_token';
    }
  }

  /**
   * Formats GraphQL mutation payload for atomic Metafields 2.0 upsert
   */
  buildMetafieldsUpsertMutation(shopifyProductId, optimizedCopy, schemaJson) {
    const mutation = `
      mutation metafieldsUpsert($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      metafields: [
        {
          ownerId: shopifyProductId,
          namespace: 'aegis_growth',
          key: 'geo_optimized_copy',
          value: typeof optimizedCopy === 'string' ? optimizedCopy : JSON.stringify(optimizedCopy),
          type: 'single_line_text_field'
        },
        {
          ownerId: shopifyProductId,
          namespace: 'aegis_growth',
          key: 'agent_structured_schema',
          value: typeof schemaJson === 'string' ? schemaJson : JSON.stringify(schemaJson, null, 2),
          type: 'json'
        }
      ]
    };

    return { mutation, variables };
  }

  /**
   * Synchronizes product node with Aegis GEO / AEO optimized variants
   */
  async pushOptimizationMetafields(shopifyProductId, optimizedCopy, schemaJson) {
    const { mutation, variables } = this.buildMetafieldsUpsertMutation(shopifyProductId, optimizedCopy, schemaJson);

    // If running in live network mode with credentials
    if (process.env.SHOPIFY_LIVE_SYNC === 'true' && this.accessToken !== 'shpat_mock_vault_token') {
      const response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: mutation, variables })
      });

      if (!response.ok) {
        throw new Error(`Shopify HTTP transport error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.errors) {
        throw new Error(`Shopify GraphQL execution errors: ${JSON.stringify(result.errors)}`);
      }

      const userErrors = result.data?.metafieldsSet?.userErrors || [];
      if (userErrors.length > 0) {
        throw new Error(`Shopify metafieldsSet validation error: ${JSON.stringify(userErrors)}`);
      }

      return {
        status: 'synchronized',
        mode: 'live_graphql',
        metafields: result.data.metafieldsSet.metafields
      };
    }

    // High-fidelity simulation mode (for sandbox verification and local dev)
    return {
      status: 'synchronized',
      mode: 'simulated_graphql',
      shopDomain: this.shopDomain,
      productId: shopifyProductId,
      syncedMetafields: [
        {
          id: `gid://shopify/Metafield/${Date.now()}_01`,
          namespace: 'aegis_growth',
          key: 'geo_optimized_copy',
          valueSnippet: (optimizedCopy || '').slice(0, 80) + '...'
        },
        {
          id: `gid://shopify/Metafield/${Date.now()}_02`,
          namespace: 'aegis_growth',
          key: 'agent_structured_schema',
          type: 'json'
        }
      ],
      userErrors: []
    };
  }
}

module.exports = {
  ShopifyMetafieldSynchronizer
};
