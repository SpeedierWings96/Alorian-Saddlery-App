import { shopifyClient } from '../config/shopify';

// GraphQL Queries
const PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

const PRODUCT_DETAILS_QUERY = `
  query getProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      handle
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
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

const COLLECTIONS_QUERY = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `
  query getCollectionProducts($handle: String!, $first: Int!) {
    collectionByHandle(handle: $handle) {
      id
      title
      description
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
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

const CREATE_CART_MUTATION = `
  mutation createCart($cartInput: CartInput) {
    cartCreate(input: $cartInput) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
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
                          url
                          altText
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

// Service functions
export const shopifyService = {
  // Fetch all products
  async getProducts(limit = 20) {
    try {
      const { data, errors } = await shopifyClient.request(PRODUCTS_QUERY, {
        variables: { first: limit },
      });
      
      if (errors) {
        console.error('Shopify API errors:', errors);
        throw new Error('Failed to fetch products');
      }
      
      return data?.products?.edges?.map(edge => edge.node) || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Fetch product details
  async getProductByHandle(handle) {
    try {
      const { data, errors } = await shopifyClient.request(PRODUCT_DETAILS_QUERY, {
        variables: { handle },
      });
      
      if (errors) {
        console.error('Shopify API errors:', errors);
        throw new Error('Failed to fetch product details');
      }
      
      return data?.productByHandle;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Fetch collections
  async getCollections(limit = 10) {
    try {
      const { data, errors } = await shopifyClient.request(COLLECTIONS_QUERY, {
        variables: { first: limit },
      });
      
      if (errors) {
        console.error('Shopify API errors:', errors);
        throw new Error('Failed to fetch collections');
      }
      
      return data?.collections?.edges?.map(edge => edge.node) || [];
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  },

  // Fetch products in a collection
  async getCollectionProducts(handle, limit = 20) {
    try {
      const { data, errors } = await shopifyClient.request(COLLECTION_PRODUCTS_QUERY, {
        variables: { handle, first: limit },
      });
      
      if (errors) {
        console.error('Shopify API errors:', errors);
        throw new Error('Failed to fetch collection products');
      }
      
      return {
        collection: data?.collectionByHandle,
        products: data?.collectionByHandle?.products?.edges?.map(edge => edge.node) || [],
      };
    } catch (error) {
      console.error('Error fetching collection products:', error);
      throw error;
    }
  },

  // Create a new cart
  async createCart() {
    try {
      const { data, errors } = await shopifyClient.request(CREATE_CART_MUTATION, {
        variables: { cartInput: {} },
      });
      
      if (errors) {
        console.error('Shopify API errors:', errors);
        throw new Error('Failed to create cart');
      }
      
      return data?.cartCreate?.cart;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  },

  // Add items to cart
  async addToCart(cartId, variantId, quantity = 1) {
    try {
      const { data, errors } = await shopifyClient.request(ADD_TO_CART_MUTATION, {
        variables: {
          cartId,
          lines: [{ merchandiseId: variantId, quantity }],
        },
      });
      
      if (errors) {
        console.error('Shopify API errors:', errors);
        throw new Error('Failed to add to cart');
      }
      
      return data?.cartLinesAdd?.cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },
}; 