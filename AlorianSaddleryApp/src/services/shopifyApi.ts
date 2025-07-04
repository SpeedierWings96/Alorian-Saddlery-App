import { shopifyClient, PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, COLLECTIONS_QUERY, CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION, CART_LINES_UPDATE_MUTATION, CART_LINES_REMOVE_MUTATION, CART_QUERY } from '../config/shopify';
import {
  ProductsResponse,
  ProductByHandleResponse,
  CollectionsResponse,
  CartCreateResponse,
  CartLinesAddResponse,
  CartLinesUpdateResponse,
  CartLinesRemoveResponse,
  CartResponse,
  Product,
  Collection,
  Cart,
  CartInput,
  CartLineInput,
  CartLineUpdateInput,
} from '../types/shopify';

class ShopifyApiService {
  /**
   * Get mock products for development/fallback
   */
  private getMockProducts(): ProductsResponse {
    return {
      products: {
        edges: [
          {
            node: {
              id: 'mock-product-1',
              title: 'Premium English Saddle',
              handle: 'premium-english-saddle',
              description: 'High-quality English saddle made from premium leather.',
              priceRange: {
                minVariantPrice: { amount: '899.99', currencyCode: 'USD' },
                maxVariantPrice: { amount: '899.99', currencyCode: 'USD' }
              },
              images: {
                edges: [{
                  node: {
                    id: 'mock-image-1',
                    url: 'https://via.placeholder.com/400x400/1B2951/FFFFFF?text=Saddle',
                    altText: 'Premium English Saddle'
                  }
                }]
              },
              variants: {
                edges: [{
                  node: {
                    id: 'mock-variant-1',
                    title: 'Brown Leather - 17"',
                    price: { amount: '899.99', currencyCode: 'USD' },
                    availableForSale: true,
                    selectedOptions: [
                      { name: 'Color', value: 'Brown' },
                      { name: 'Size', value: '17"' }
                    ]
                  }
                }]
              },
              options: [
                { id: 'option-1', name: 'Color', values: ['Brown', 'Black'] },
                { id: 'option-2', name: 'Size', values: ['16"', '17"', '18"'] }
              ],
              tags: ['English', 'Premium', 'Leather'],
              productType: 'Saddles',
              vendor: 'Alorian Saddlery'
            }
          },
          {
            node: {
              id: 'mock-product-2',
              title: 'Leather Bridle Set',
              handle: 'leather-bridle-set',
              description: 'Complete bridle set with reins and bit.',
              priceRange: {
                minVariantPrice: { amount: '149.99', currencyCode: 'USD' },
                maxVariantPrice: { amount: '149.99', currencyCode: 'USD' }
              },
              images: {
                edges: [{
                  node: {
                    id: 'mock-image-2',
                    url: 'https://via.placeholder.com/400x400/D4AF37/FFFFFF?text=Bridle',
                    altText: 'Leather Bridle Set'
                  }
                }]
              },
              variants: {
                edges: [{
                  node: {
                    id: 'mock-variant-2',
                    title: 'Black - Full Size',
                    price: { amount: '149.99', currencyCode: 'USD' },
                    availableForSale: true,
                    selectedOptions: [
                      { name: 'Color', value: 'Black' },
                      { name: 'Size', value: 'Full' }
                    ]
                  }
                }]
              },
              options: [
                { id: 'option-3', name: 'Color', values: ['Black', 'Brown'] },
                { id: 'option-4', name: 'Size', values: ['Cob', 'Full', 'Oversize'] }
              ],
              tags: ['Bridle', 'Leather', 'Complete Set'],
              productType: 'Bridles',
              vendor: 'Alorian Saddlery'
            }
          }
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        }
      }
    };
  }

  /**
   * Get mock collections for development/fallback
   */
  private getMockCollections(): Collection[] {
    return [
      {
        id: 'mock-collection-1',
        title: 'English Tack',
        handle: 'english-tack',
        description: 'Premium English riding equipment',
        image: {
          id: 'mock-collection-image-1',
          url: 'https://via.placeholder.com/400x300/1B2951/FFFFFF?text=English+Tack',
          altText: 'English Tack Collection'
        },
        products: {
          edges: [
            {
              node: {
                id: 'mock-product-1',
                title: 'Premium English Saddle',
                handle: 'premium-english-saddle',
                description: 'High-quality English saddle',
                priceRange: {
                  minVariantPrice: { amount: '899.99', currencyCode: 'USD' },
                  maxVariantPrice: { amount: '899.99', currencyCode: 'USD' }
                },
                images: {
                  edges: [{
                    node: {
                      id: 'mock-image-1',
                      url: 'https://via.placeholder.com/400x400/1B2951/FFFFFF?text=Saddle',
                      altText: 'Premium English Saddle'
                    }
                  }]
                },
                variants: { edges: [] },
                tags: ['English', 'Premium'],
                productType: 'Saddles',
                vendor: 'Alorian Saddlery'
              }
            }
          ]
        }
      }
    ];
  }

  /**
   * Fetch products with pagination
   */
  async getProducts(first: number = 20, after?: string): Promise<ProductsResponse> {
    try {
      const variables = { first, ...(after && { after }) };
      const response = await shopifyClient.request(PRODUCTS_QUERY, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return response.data as ProductsResponse;
    } catch (error) {
      console.error('Error fetching products:', error);
      console.log('Falling back to mock data');
      return this.getMockProducts();
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
      const variables = { first };
      const response = await shopifyClient.request(COLLECTIONS_QUERY, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      const data = response.data as CollectionsResponse;
      return data.collections.edges.map(edge => edge.node);
    } catch (error) {
      console.error('Error fetching collections:', error);
      console.log('Falling back to mock collections');
      return this.getMockCollections();
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
   * Get products by collection ID
   */
  async getProductsByCollectionId(collectionId: string, first: number = 20): Promise<Product[]> {
    try {
      const collectionQuery = `
        query getProductsByCollectionId($id: ID!, $first: Int!) {
          collection(id: $id) {
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

      const variables = { id: collectionId, first };
      const response = await shopifyClient.request(collectionQuery, { variables });
      
      if (response.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
      }
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      const data = response.data as { collection: { products: { edges: { node: Product }[] } } | null };
      return data.collection?.products.edges.map(edge => edge.node) || [];
    } catch (error) {
      console.error('Error fetching products by collection ID:', error);
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
