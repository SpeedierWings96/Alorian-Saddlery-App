import React, { useEffect, useState } from 'react';
import { LogBox, View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import { logger } from './src/utils/logger';
import { COLORS } from './src/config/theme';

// Ignore specific warnings that might cause issues in production
LogBox.ignoreLogs([
  'new NativeEventEmitter',
  'Non-serializable values were found in the navigation state',
  'Require cycle:',
]);

// Add console logging for debugging
console.log('App.tsx: Component loading...');
logger.log('App.tsx: Component loading...');

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App.tsx: Starting app initialization');
    
    // Simplified initialization for production stability
    const initializeApp = () => {
      try {
        // Set ready immediately in production to prevent white screen
        if (!__DEV__) {
          console.log('App.tsx: Production mode - skipping complex initialization');
          setIsReady(true);
          return;
        }
        
        // Only do complex initialization in development
        setTimeout(() => {
          console.log('App.tsx: App initialization successful');
          setIsReady(true);
        }, 100);
        
      } catch (error) {
        console.error('App.tsx: Initialization error:', error);
        setInitError(error?.toString() || 'Unknown initialization error');
        
        // Always set ready to prevent white screen
        setIsReady(true);
      }
    };

    initializeApp();
    
    // Emergency fallback to prevent white screen
    const emergencyTimeout = setTimeout(() => {
      console.log('App.tsx: Emergency timeout - forcing app to load');
      setIsReady(true);
    }, 3000);

    return () => clearTimeout(emergencyTimeout);
  }, []);

  // Always render the app, even with errors
  if (initError && __DEV__) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>App Initialization Error</Text>
        <Text style={styles.errorText}>{initError}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  console.log('App.tsx: Rendering main app component');
  
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff0000',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
