import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Shopify configuration
export const SHOPIFY_CONFIG = {
  domain: 'aloriansaddlery.myshopify.com',
  storefrontAccessToken: '89cb18c70c870c535954418a1589d964',
  apiVersion: '2024-10',
};

// Create Shopify client
export const shopifyClient = createStorefrontApiClient({
  storeDomain: `https://${SHOPIFY_CONFIG.domain}`,
  apiVersion: SHOPIFY_CONFIG.apiVersion,
  publicAccessToken: SHOPIFY_CONFIG.storefrontAccessToken,
}); 