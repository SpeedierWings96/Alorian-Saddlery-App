import { shopifyClient, PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, PRODUCTS_BY_COLLECTION_QUERY, COLLECTIONS_QUERY, CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION, CART_LINES_UPDATE_MUTATION, CART_LINES_REMOVE_MUTATION, CART_QUERY, SHOPIFY_CONFIG } from '../config/shopify';
import {
  ProductsResponse,
  ProductByHandleResponse,
  CollectionsResponse,
  CartCreateResponse,
  CartLinesAddResponse,
  CartLinesUpdateResponse,
  CartLinesRemoveResponse,
  CartResponse,
  ProductsByCollectionResponse,
  Product,
  Collection,
  Cart,
  CartInput,
  CartLineInput,
  CartLineUpdateInput,
} from '../types/shopify';
import { retryWithBackoff, testNetworkConnectivity, testShopifyConnectivity } from './networkUtils';

class ShopifyApiService {


  /**
   * Fetch products with pagination
   */
  async getProducts(first: number = 20, after?: string): Promise<ProductsResponse> {
    try {
      console.log('ShopifyApi: Attempting to fetch products from Shopify API...');
      
      // Test network connectivity first
      const hasNetwork = await testNetworkConnectivity();
      if (!hasNetwork) {
        console.error('ShopifyApi: No internet connectivity detected');
        throw new Error('No internet connection available');
      }
      
      // Test Shopify domain connectivity
      const shopifyTest = await testShopifyConnectivity(SHOPIFY_CONFIG.storeDomain);
      if (!shopifyTest.success) {
        console.error('ShopifyApi: Cannot reach Shopify domain:', shopifyTest.error);
        throw new Error(`Cannot reach Shopify store: ${shopifyTest.error}`);
      }
      
      const variables = { first, ...(after && { after }) };
      
      // Use retry logic for the API call
      const response = await retryWithBackoff(async () => {
        console.log('ShopifyApi: Making GraphQL request...');
        return await shopifyClient.request(PRODUCTS_QUERY, { variables });
      }, 3, 2000);
      
      console.log('ShopifyApi: Response received:', response);
      
      if (response.errors) {
        console.error('ShopifyApi: GraphQL errors:', response.errors);
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }
      
      if (!response.data) {
        console.error('ShopifyApi: No data returned from API');
        throw new Error('No data returned from API');
      }
      
      console.log('ShopifyApi: Successfully fetched products:', response.data.products.edges.length);
      return response.data as ProductsResponse;
    } catch (error) {
      console.error('ShopifyApi: Error fetching products:', error);
      console.error('ShopifyApi: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Instead of falling back to mock data, return empty results
      return {
        products: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          }
        }
      };
    }
  }

  /**
   * Fetch a single product by handle
   */
  async getProductsByCollectionId(id: string, first: number = 20): Promise<Product[]> {
    try {
      console.log('ShopifyApi: Attempting to fetch products from collection:', id);
      const variables = { id, first };
      const response = await shopifyClient.request(PRODUCTS_BY_COLLECTION_QUERY, { variables });

      if (response.errors) {
        console.error('ShopifyApi: GraphQL errors for collection:', response.errors);
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }

      if (!response.data) {
        console.error('ShopifyApi: No data returned from collection API');
        throw new Error('No data returned from API');
      }

      const data = response.data as ProductsByCollectionResponse;

      if (!data.node) {
        console.warn(`ShopifyApi: Collection not found for ID: ${id}`);
        return [];
      }

      console.log('ShopifyApi: Successfully fetched products from collection:', data.node.products.edges.length);
      return data.node.products.edges.map((edge: { node: Product }) => edge.node);
    } catch (error) {
      console.error('ShopifyApi: Error fetching products by collection:', error);
      console.error('ShopifyApi: Collection error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      return [];
    }
  }

  /**
   * Fetch a single product by handle
   */
  async getProductByHandle(handle: string): Promise<Product | null> {
    try {
      const variables = { handle };
      const response = await shopifyClient.request(PRODUCT_BY_HANDLE_QUERY, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      const data = response.data as ProductByHandleResponse;
      return data.productByHandle;
    } catch (error) {
      console.error('Error fetching product by handle:', error);
      throw error;
    }
  }

  /**
   * Fetch collections
   */
  async getCollections(first: number = 20): Promise<Collection[]> {
    try {
      console.log('ShopifyApi: Attempting to fetch collections from Shopify API...');
      const variables = { first };
      const response = await shopifyClient.request(COLLECTIONS_QUERY, { variables });
      
      if (response.errors) {
        console.error('ShopifyApi: GraphQL errors for collections:', response.errors);
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }
      
      if (!response.data) {
        console.error('ShopifyApi: No data returned from collections API');
        throw new Error('No data returned from API');
      }
      
      const data = response.data as CollectionsResponse;
      console.log('ShopifyApi: Successfully fetched collections:', data.collections.edges.length);
      return data.collections.edges.map(edge => edge.node);
    } catch (error) {
      console.error('ShopifyApi: Error fetching collections:', error);
      console.error('ShopifyApi: Collections error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      return [];
    }
  }

  /**
   * Create a new cart
   */
  async createCart(input: CartInput = {}): Promise<Cart> {
    try {
      const variables = { input };
      const response = await shopifyClient.request(CART_CREATE_MUTATION, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }

      if (!response.data) {
        throw new Error('No data returned from API');
      }

      const data = response.data as CartCreateResponse;
      
      if (data.cartCreate.userErrors.length > 0) {
        throw new Error(`Cart Error: ${data.cartCreate.userErrors.map(e => e.message).join(', ')}`);
      }

      if (!data.cartCreate.cart) {
        throw new Error('Failed to create cart');
      }
      
      return data.cartCreate.cart;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  }

  /**
   * Add lines to cart
   */
  async addToCart(cartId: string, lines: CartLineInput[]): Promise<Cart> {
    try {
      const variables = { cartId, lines };
      const response = await shopifyClient.request(CART_LINES_ADD_MUTATION, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }

      if (!response.data) {
        throw new Error('No data returned from API');
      }

      const data = response.data as CartLinesAddResponse;

      if (data.cartLinesAdd.userErrors.length > 0) {
        throw new Error(`Cart Error: ${data.cartLinesAdd.userErrors.map(e => e.message).join(', ')}`);
      }

      if (!data.cartLinesAdd.cart) {
        throw new Error('Failed to add items to cart');
      }
      
      return data.cartLinesAdd.cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * Update cart lines
   */
  async updateCartLines(cartId: string, lines: CartLineUpdateInput[]): Promise<Cart> {
    try {
      const variables = { cartId, lines };
      const response = await shopifyClient.request(CART_LINES_UPDATE_MUTATION, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }

      if (!response.data) {
        throw new Error('No data returned from API');
      }

      const data = response.data as CartLinesUpdateResponse;

      if (data.cartLinesUpdate.userErrors.length > 0) {
        throw new Error(`Cart Error: ${data.cartLinesUpdate.userErrors.map(e => e.message).join(', ')}`);
      }

      if (!data.cartLinesUpdate.cart) {
        throw new Error('Failed to update cart lines');
      }
      
      return data.cartLinesUpdate.cart;
    } catch (error) {
      console.error('Error updating cart lines:', error);
      throw error;
    }
  }

  /**
   * Remove lines from cart
   */
  async removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
    try {
      const variables = { cartId, lineIds };
      const response = await shopifyClient.request(CART_LINES_REMOVE_MUTATION, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }

      if (!response.data) {
        throw new Error('No data returned from API');
      }

      const data = response.data as CartLinesRemoveResponse;

      if (data.cartLinesRemove.userErrors.length > 0) {
        throw new Error(`Cart Error: ${data.cartLinesRemove.userErrors.map(e => e.message).join(', ')}`);
      }

      if (!data.cartLinesRemove.cart) {
        throw new Error('Failed to remove items from cart');
      }
      
      return data.cartLinesRemove.cart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  /**
   * Get cart by ID
   */
  async getCart(cartId: string): Promise<Cart | null> {
    try {
      const variables = { id: cartId };
      const response = await shopifyClient.request(CART_QUERY, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }

      if (!response.data) {
        throw new Error('No data returned from API');
      }

      const data = response.data as CartResponse;
      return data.cart || null;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  /**
   * Search products by query
   */
  async searchProducts(query: string, first: number = 20): Promise<Product[]> {
    try {
      const searchQuery = `
        query searchProducts($query: String!, $first: Int!) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                handle
                description
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 5) {
                  edges {
                    node {
                      id
                      url
                      altText
                      width
                      height
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
                      selectedOptions {
                        name
                        value
                      }
                    }
                  }
                }
                tags
                productType
                vendor
              }
            }
          }
        }
      `;

      const variables = { query, first };
      const response = await shopifyClient.request(searchQuery, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      const data = response.data as ProductsResponse;
      return data.products.edges.map(edge => edge.node);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get products by collection handle
   */
  async getProductsByCollection(collectionHandle: string, first: number = 20): Promise<Product[]> {
    try {
      const collectionQuery = `
        query getProductsByCollection($handle: String!, $first: Int!) {
          collectionByHandle(handle: $handle) {
            products(first: $first) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                    maxVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 5) {
                    edges {
                      node {
                        id
                        url
                        altText
                        width
                        height
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
                        selectedOptions {
                          name
                          value
                        }
                      }
                    }
                  }
                  tags
                  productType
                  vendor
                }
              }
            }
          }
        }
      `;

      const variables = { handle: collectionHandle, first };
      const response = await shopifyClient.request(collectionQuery, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      const data = response.data as { collectionByHandle: { products: { edges: { node: Product }[] } } | null };
      return data.collectionByHandle?.products.edges.map(edge => edge.node) || [];
    } catch (error) {
      console.error('Error fetching products by collection:', error);
      throw error;
    }
  }

  /**
   * Format price for display
   */
  formatPrice(amount: string, currencyCode: string = 'USD'): string {
    const price = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(price);
  }

  /**
   * Get the first image URL from a product
   */
  getProductImageUrl(product: Product): string | null {
    if (product.images.edges.length > 0) {
      return product.images.edges[0].node.url;
    }
    return null;
  }

  /**
   * Check if product has multiple variants
   */
  hasMultipleVariants(product: Product): boolean {
    return product.variants.edges.length > 1;
  }

  /**
   * Get available variants for a product
   */
  getAvailableVariants(product: Product) {
    return product.variants.edges
      .map(edge => edge.node)
      .filter(variant => variant.availableForSale);
  }
}

export const shopifyApi = new ShopifyApiService();
