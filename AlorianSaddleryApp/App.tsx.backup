import React from 'react';
import { LogBox, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import DiagnosticScreen from './src/components/DiagnosticScreen';

// More aggressive log suppression for production
if (!__DEV__) {
  LogBox.ignoreAllLogs(true);
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
  
  // Disable global error reporting that might cause white screens
  try {
    (global as any).ErrorUtils?.setGlobalHandler(() => {});
  } catch (e) {
    // Ignore if ErrorUtils is not available
  }
} else {
  LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'Non-serializable values were found in the navigation state',
    'Require cycle:',
    'Warning: componentWillReceiveProps',
    'Warning: componentWillMount',
    'Module RCTImageLoader',
  ]);
}

// Fallback component in case of critical errors
function FallbackComponent() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <Text style={{ fontSize: 18, color: '#333' }}>Alorian Saddlery</Text>
      <Text style={{ fontSize: 14, color: '#666', marginTop: 10 }}>Loading...</Text>
    </View>
  );
}

export default function App() {
  // Wrap everything in a try-catch to prevent white screens
  try {
    return (
      <SafeAreaProvider>
        <ErrorBoundary fallback={<FallbackComponent />}>
          <AuthProvider>
            <CartProvider>
              <AppNavigator />
              <DiagnosticScreen />
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    );
  } catch (error) {
    // Last resort fallback
    return <FallbackComponent />;
  }
}
