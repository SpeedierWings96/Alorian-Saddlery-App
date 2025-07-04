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
      console.log('AuthContext: Starting simplified auth initialization...');
      
      // In production, set a very short timeout to prevent white screen
      const timeout = __DEV__ ? 3000 : 1000;
      
      const initPromise = authService.initialize();
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), timeout)
      );
      
      try {
        await Promise.race([initPromise, timeoutPromise]);
        
        // Only try to get stored data if initialization succeeded
        const storedCustomer = authService.getCustomer();
        const storedToken = authService.getAccessToken();
        
        if (storedCustomer && storedToken) {
          console.log('AuthContext: Found stored user session');
          setCustomer(storedCustomer);
          setAccessToken(storedToken);
          setIsGuest(false);
        } else {
          console.log('AuthContext: No stored session, using guest mode');
          setIsGuest(false); // Don't force guest mode, let user choose
        }
      } catch (timeoutError) {
        console.log('AuthContext: Initialization timeout, proceeding without auth data');
        // Don't throw, just proceed with empty state
      }
      
      console.log('AuthContext: Auth initialization completed');
    } catch (error) {
      console.error('AuthContext: Auth initialization error:', error);
      // Always reset to clean state on any error
      setCustomer(null);
      setAccessToken(null);
      setIsGuest(false);
    } finally {
      // Always set loading to false to prevent infinite loading
      setIsLoading(false);
      console.log('AuthContext: Auth loading state set to false');
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
