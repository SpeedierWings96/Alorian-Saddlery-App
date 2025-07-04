import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

// Disable all logs in production to prevent issues
if (process.env.NODE_ENV === 'production') {
  LogBox.ignoreAllLogs(true);
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
} else {
  // Only ignore specific warnings in development
  LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'Non-serializable values were found in the navigation state',
    'Require cycle:',
  ]);
}

export default function App() {
  // Simple, direct rendering without complex initialization
  // This prevents white screen issues in production
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
