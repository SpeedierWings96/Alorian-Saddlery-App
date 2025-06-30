import axios from 'axios';
import { SHOPIFY_CONFIG, getShopifyUrl } from '../config/shopify';

class ShopifyService {
  async query(query, variables = {}) {
    try {
      const response = await axios.post(
        getShopifyUrl(),
        {
          query,
          variables,
        },
        {
          headers: {
            'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        console.error('GraphQL Errors:', response.data.errors);
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data;
    } catch (error) {
      console.error('Shopify API Error:', error);
      throw error;
    }
  }

  async getProducts(first = 20, after = null) {
    const query = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            cursor
            node {
              id
              title
              description
              handle
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 5) {
                edges {
                  node {
                    originalSrc
                    altText
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    return this.query(query, { first, after });
  }

  async getProductByHandle(handle) {
    const query = `
      query getProduct($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                originalSrc
                altText
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            id
            name
            values
          }
        }
      }
    `;

    return this.query(query, { handle });
  }

  async searchProducts(searchTerm) {
    const query = `
      query searchProducts($query: String!) {
        products(first: 20, query: $query) {
          edges {
            node {
              id
              title
              description
              handle
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    originalSrc
                    altText
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query(query, { query: searchTerm });
  }

  async getCollections() {
    const query = `
      query getCollections {
        collections(first: 20) {
          edges {
            node {
              id
              title
              description
              handle
              image {
                originalSrc
                altText
              }
            }
          }
        }
      }
    `;

    return this.query(query);
  }

  async getCollectionByHandle(handle) {
    const query = `
      query getCollection($handle: String!) {
        collectionByHandle(handle: $handle) {
          id
          title
          description
          products(first: 20) {
            edges {
              node {
                id
                title
                handle
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      originalSrc
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query(query, { handle });
  }

  async createCart() {
    const query = `
      mutation createCart {
        cartCreate {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `;

    return this.query(query);
  }

  async addToCart(cartId, variantId, quantity = 1) {
    const query = `
      mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                        handle
                        images(first: 1) {
                          edges {
                            node {
                              originalSrc
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query(query, {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    });
  }

  async updateCartLine(cartId, lineId, quantity) {
    const query = `
      mutation updateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                        handle
                        images(first: 1) {
                          edges {
                            node {
                              originalSrc
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query(query, {
      cartId,
      lines: [{ id: lineId, quantity }],
    });
  }

  async removeFromCart(cartId, lineId) {
    const query = `
      mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                        handle
                        images(first: 1) {
                          edges {
                            node {
                              originalSrc
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query(query, {
      cartId,
      lineIds: [lineId],
    });
  }

  async getCart(cartId) {
    const query = `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      handle
                      images(first: 1) {
                        edges {
                          node {
                            originalSrc
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query(query, { cartId });
  }
}

export default new ShopifyService();