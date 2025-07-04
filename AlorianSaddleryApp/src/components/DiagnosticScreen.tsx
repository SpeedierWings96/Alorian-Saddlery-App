import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DiagnosticInfo {
  authState: string;
  asyncStorageWorking: boolean;
  contextProviders: string[];
  navigationReady: boolean;
  errors: string[];
}

export default function DiagnosticScreen() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo>({
    authState: 'unknown',
    asyncStorageWorking: false,
    contextProviders: [],
    navigationReady: false,
    errors: []
  });
  const [isVisible, setIsVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const { customer, isGuest, isLoading } = useAuth();

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const errors: string[] = [];
    const contextProviders: string[] = [];

    try {
      // Test AsyncStorage
      let asyncStorageWorking = false;
      try {
        await AsyncStorage.setItem('test', 'test');
        const testValue = await AsyncStorage.getItem('test');
        asyncStorageWorking = testValue === 'test';
        await AsyncStorage.removeItem('test');
      } catch (e) {
        errors.push(`AsyncStorage error: ${e}`);
      }

      // Check auth state
      let authState = 'unknown';
      try {
        if (customer) {
          authState = 'authenticated';
          contextProviders.push('AuthProvider (authenticated)');
        } else if (isGuest) {
          authState = 'guest';
          contextProviders.push('AuthProvider (guest)');
        } else if (isLoading) {
          authState = 'loading';
          contextProviders.push('AuthProvider (loading)');
        } else {
          authState = 'unauthenticated';
          contextProviders.push('AuthProvider (unauthenticated)');
        }
      } catch (e) {
        errors.push(`Auth context error: ${e}`);
        authState = 'error';
      }

      // Check other context providers
      try {
        // This will help identify if context providers are working
        contextProviders.push('DiagnosticScreen rendered');
      } catch (e) {
        errors.push(`Component render error: ${e}`);
      }

      setDiagnostics({
        authState,
        asyncStorageWorking,
        contextProviders,
        navigationReady: true, // If this screen renders, navigation is working
        errors
      });
    } catch (e) {
      errors.push(`Diagnostic error: ${e}`);
      setDiagnostics(prev => ({ ...prev, errors }));
    }
  };

  const handleTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);
    
    if (newTapCount >= 5) {
      setIsVisible(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTapCount(0);
  };

  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={styles.hiddenTrigger} 
        onPress={handleTap}
        activeOpacity={1}
      >
        <View style={styles.hiddenIndicator} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>App Diagnostics</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Auth State</Text>
            <Text style={styles.value}>{diagnostics.authState}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AsyncStorage</Text>
            <Text style={[styles.value, { color: diagnostics.asyncStorageWorking ? COLORS.success : COLORS.error }]}>
              {diagnostics.asyncStorageWorking ? 'Working' : 'Not Working'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Context Providers</Text>
            {diagnostics.contextProviders.map((provider, index) => (
              <Text key={index} style={styles.listItem}>• {provider}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Navigation</Text>
            <Text style={[styles.value, { color: diagnostics.navigationReady ? COLORS.success : COLORS.error }]}>
              {diagnostics.navigationReady ? 'Ready' : 'Not Ready'}
            </Text>
          </View>

          {diagnostics.errors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Errors</Text>
              {diagnostics.errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>• {error}</Text>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.refreshButton} onPress={runDiagnostics}>
            <Text style={styles.refreshButtonText}>Refresh Diagnostics</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: '80%',
    width: '90%',
  },
  scrollView: {
    padding: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  listItem: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginBottom: 2,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: COLORS.gray[600],
    padding: SPACING.sm,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
  },
  hiddenTrigger: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 20,
    height: 20,
    zIndex: 1000,
  },
  hiddenIndicator: {
    width: 4,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    opacity: 0.3,
  },
});
