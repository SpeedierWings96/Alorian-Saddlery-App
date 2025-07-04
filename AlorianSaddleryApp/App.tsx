import React, { useEffect, useState } from 'react';
import { LogBox, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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
]);

// Add console logging for debugging
logger.log('App.tsx: Component loading...');

// Initialize production-specific settings
// Do not disable console logging in production as it prevents debugging

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    logger.log('App.tsx: Starting app initialization');
    
    // Add a small delay to ensure all modules are loaded
    const initializeApp = async () => {
      try {
        // Give the app time to properly initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        logger.log('App.tsx: App initialization successful');
        setIsReady(true);
      } catch (error) {
        logger.error('App.tsx: Initialization error:', error);
        setInitError(error?.toString() || 'Unknown initialization error');
      }
    };

    initializeApp();
  }, []);

  if (initError) {
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

  logger.log('App.tsx: Rendering App component');
  
  try {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    logger.error('App.tsx: Error in App component:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>App Render Error</Text>
        <Text style={styles.errorText}>{error?.toString() || 'Unknown error'}</Text>
      </View>
    );
  }
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
