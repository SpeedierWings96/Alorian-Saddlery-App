import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService';
import { Customer, AuthContextType } from '../types/shopify';
import { logger } from '../utils/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true); // Default to guest mode to prevent white screen
  const [isLoading, setIsLoading] = useState(false); // Start with false to prevent infinite loading

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    // Don't set loading to true in production to prevent white screen
    if (__DEV__) {
      setIsLoading(true);
    }

    try {
      // Simple initialization without complex timeouts
      await authService.initialize();
      
      // Try to get stored data
      const storedCustomer = authService.getCustomer();
      const storedToken = authService.getAccessToken();
      
      if (storedCustomer && storedToken) {
        setCustomer(storedCustomer);
        setAccessToken(storedToken);
        setIsGuest(false);
      }
      // If no stored data, stay in guest mode (already set as default)
      
    } catch (error) {
      // On any error, just stay in guest mode
      console.error('AuthContext: Error during initialization, staying in guest mode:', error);
      setCustomer(null);
      setAccessToken(null);
      setIsGuest(true);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setCustomer(authService.getCustomer());
        setAccessToken(authService.getAccessToken());
        setIsGuest(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authService.register(firstName, lastName, email, password);
      if (result.success) {
        setCustomer(authService.getCustomer());
        setAccessToken(authService.getAccessToken());
        setIsGuest(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setCustomer(null);
      setAccessToken(null);
      setIsGuest(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if logout request fails
      setCustomer(null);
      setAccessToken(null);
      setIsGuest(false);
    } finally {
      setIsLoading(false);
    }
  };

  const enterAsGuest = (): void => {
    console.log('AuthContext: Entering guest mode');
    setIsGuest(true);
    setCustomer(null);
    setAccessToken(null);
    setIsLoading(false);
  };

  const updateCustomer = async (customerData: Partial<Customer>): Promise<boolean> => {
    try {
      const result = await authService.updateCustomer(customerData);
      if (result.success) {
        setCustomer(authService.getCustomer());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update customer error:', error);
      return false;
    }
  };

  const recoverPassword = async (email: string): Promise<boolean> => {
    try {
      const result = await authService.recoverPassword(email);
      return result.success;
    } catch (error) {
      console.error('Password recovery error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    customer,
    accessToken,
    isGuest,
    isLoading,
    login,
    register,
    logout,
    enterAsGuest,
    updateCustomer,
    recoverPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
