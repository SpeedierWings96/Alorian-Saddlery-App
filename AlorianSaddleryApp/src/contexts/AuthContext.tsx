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
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      logger.log('AuthContext: Starting auth initialization...');
      
      // Add timeout to prevent hanging in production
      const initPromise = authService.initialize();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth initialization timeout')), 10000)
      );
      
      await Promise.race([initPromise, timeoutPromise]);
      
      setCustomer(authService.getCustomer());
      setAccessToken(authService.getAccessToken());
      logger.log('AuthContext: Auth initialization completed successfully');
    } catch (error) {
      logger.error('AuthContext: Auth initialization error:', error);
      // Always set default state in production to prevent white screen
      setCustomer(null);
      setAccessToken(null);
      setIsGuest(false);
    } finally {
      // Always set loading to false to prevent infinite loading
      setIsLoading(false);
      logger.log('AuthContext: Auth initialization finished');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setCustomer(authService.getCustomer());
        setAccessToken(authService.getAccessToken());
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
    } finally {
      setIsLoading(false);
    }
  };

  const enterAsGuest = (): void => {
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
