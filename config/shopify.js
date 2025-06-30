export const SHOPIFY_CONFIG = {
  domain: 'alorian.myshopify.com',
  storefrontAccessToken: '99cb18c70c870c535954418a1589d964',
  apiVersion: '2024-01',
};

export const getShopifyUrl = (endpoint) => {
  return `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;
};