import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopifyClient } from '../config/shopify';
import {
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
  CUSTOMER_CREATE_MUTATION,
  CUSTOMER_QUERY,
  CUSTOMER_UPDATE_MUTATION,
  CUSTOMER_RECOVER_MUTATION,
} from '../config/shopify';
import {
  Customer,
  CustomerAccessToken,
  CustomerAccessTokenCreateResponse,
  CustomerCreateResponse,
  CustomerResponse,
  CustomerUpdateResponse,
  CustomerRecoverResponse,
} from '../types/shopify';
import { logger } from '../utils/logger';

const ACCESS_TOKEN_KEY = '@alorian_access_token';
const CUSTOMER_KEY = '@alorian_customer';

class AuthService {
  private accessToken: string | null = null;
  private customer: Customer | null = null;

  // Initialize auth state from storage
  async initialize(): Promise<void> {
    try {
      logger.log('AuthService: Starting initialization...');
      
      // Load stored data synchronously without network calls
      const storedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const storedCustomer = await AsyncStorage.getItem(CUSTOMER_KEY);
      
      if (storedToken && storedCustomer) {
        this.accessToken = storedToken;
        try {
          this.customer = JSON.parse(storedCustomer);
          logger.log('AuthService: Restored user session from storage');
        } catch (parseError) {
          logger.error('AuthService: Error parsing stored customer data', parseError);
          await this.clearAuthData();
          return;
        }
      }
      
      logger.log('AuthService: Initialization completed successfully');
    } catch (error) {
      logger.error('AuthService: Error initializing auth:', error);
      // Force clear memory state to prevent white screen
      this.accessToken = null;
      this.customer = null;
    }
  }

  // Login with email and password
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await shopifyClient.request<CustomerAccessTokenCreateResponse>(
        CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
        {
          variables: {
            input: {
              email: email.toLowerCase().trim(),
              password,
            },
          },
        }
      );

      if (!response.data) {
        return {
          success: false,
          error: 'No response data received',
        };
      }

      const { customerAccessToken, customerUserErrors } = response.data.customerAccessTokenCreate;

      if (customerUserErrors && customerUserErrors.length > 0) {
        return {
          success: false,
          error: customerUserErrors[0].message || 'Login failed',
        };
      }

      if (!customerAccessToken) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      // Store access token
      this.accessToken = customerAccessToken.accessToken;
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, this.accessToken);

      // Fetch customer data
      const customerData = await this.fetchCustomerData();
      if (!customerData.success) {
        return {
          success: false,
          error: 'Failed to fetch customer data',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Register new customer
  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First create the customer
      const createResponse = await shopifyClient.request<CustomerCreateResponse>(
        CUSTOMER_CREATE_MUTATION,
        {
          variables: {
            input: {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.toLowerCase().trim(),
              password,
              acceptsMarketing: false,
            },
          },
        }
      );

      if (!createResponse.data) {
        return {
          success: false,
          error: 'No response data received',
        };
      }

      const { customer, customerUserErrors } = createResponse.data.customerCreate;

      if (customerUserErrors && customerUserErrors.length > 0) {
        return {
          success: false,
          error: customerUserErrors[0].message || 'Registration failed',
        };
      }

      if (!customer) {
        return {
          success: false,
          error: 'Registration failed',
        };
      }

      // Now login with the new credentials
      return await this.login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        // Delete access token from Shopify
        await shopifyClient.request(CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION, {
          variables: {
            customerAccessToken: this.accessToken,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  // Update customer information
  async updateCustomer(customerData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    acceptsMarketing?: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await shopifyClient.request<CustomerUpdateResponse>(
        CUSTOMER_UPDATE_MUTATION,
        {
          variables: {
            customerAccessToken: this.accessToken,
            customer: customerData,
          },
        }
      );

      if (!response.data) {
        return {
          success: false,
          error: 'No response data received',
        };
      }

      const { customer, customerUserErrors } = response.data.customerUpdate;

      if (customerUserErrors && customerUserErrors.length > 0) {
        return {
          success: false,
          error: customerUserErrors[0].message || 'Update failed',
        };
      }

      if (customer) {
        this.customer = customer;
        await AsyncStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
      }

      return { success: true };
    } catch (error) {
      console.error('Update customer error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Password recovery
  async recoverPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await shopifyClient.request<CustomerRecoverResponse>(
        CUSTOMER_RECOVER_MUTATION,
        {
          variables: {
            email: email.toLowerCase().trim(),
          },
        }
      );

      if (!response.data) {
        return {
          success: false,
          error: 'No response data received',
        };
      }

      const { customerUserErrors } = response.data.customerRecover;

      if (customerUserErrors && customerUserErrors.length > 0) {
        return {
          success: false,
          error: customerUserErrors[0].message || 'Recovery failed',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Password recovery error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Fetch customer data
  private async fetchCustomerData(): Promise<{ success: boolean; error?: string }> {
    if (!this.accessToken) {
      return { success: false, error: 'No access token' };
    }

    try {
      const response = await shopifyClient.request<CustomerResponse>(CUSTOMER_QUERY, {
        variables: {
          customerAccessToken: this.accessToken,
        },
      });

      if (!response.data) {
        return { success: false, error: 'No response data received' };
      }

      if (response.data.customer) {
        this.customer = response.data.customer;
        await AsyncStorage.setItem(CUSTOMER_KEY, JSON.stringify(this.customer));
        return { success: true };
      }

      return { success: false, error: 'Customer not found' };
    } catch (error) {
      console.error('Fetch customer error:', error);
      return { success: false, error: 'Failed to fetch customer data' };
    }
  }

  // Validate stored token
  private async validateToken(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await shopifyClient.request<CustomerResponse>(CUSTOMER_QUERY, {
        variables: {
          customerAccessToken: this.accessToken,
        },
      });

      return !!(response.data && response.data.customer);
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Clear all auth data
  private async clearAuthData(): Promise<void> {
    this.accessToken = null;
    this.customer = null;
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, CUSTOMER_KEY]);
  }

  // Getters
  getAccessToken(): string | null {
    return this.accessToken;
  }

  getCustomer(): Customer | null {
    return this.customer;
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken && this.customer);
  }
}

export const authService = new AuthService();
