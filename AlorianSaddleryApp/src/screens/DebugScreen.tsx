import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING } from '../config/theme';
import { logger } from '../utils/logger';

export default function DebugScreen() {
  const [debugInfo, setDebugInfo] = useState<any>({
    appState: 'Loading...',
    asyncStorageKeys: [],
    environment: __DEV__ ? 'Development' : 'Production',
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      // Get all AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      const asyncData: any = {};
      
      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          asyncData[key] = value ? JSON.parse(value) : null;
        } catch {
          asyncData[key] = await AsyncStorage.getItem(key);
        }
      }

      setDebugInfo({
        appState: 'Loaded',
        asyncStorageKeys: keys,
        asyncStorageData: asyncData,
        environment: __DEV__ ? 'Development' : 'Production',
        timestamp: new Date().toISOString(),
        shopifyConfig: {
          storeDomain: 'aloriansaddlery.myshopify.com',
          hasToken: true,
        },
      });
    } catch (error) {
      logger.error('Debug screen error:', error);
      setDebugInfo((prev: any) => ({ ...prev, error: error?.toString() }));
    }
  };

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      await loadDebugInfo();
      logger.log('AsyncStorage cleared successfully');
    } catch (error) {
      logger.error('Failed to clear AsyncStorage:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Debug Information</Text>
        <Text style={styles.subtitle}>Environment: {debugInfo.environment}</Text>
        <Text style={styles.subtitle}>Timestamp: {debugInfo.timestamp}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App State</Text>
        <Text style={styles.text}>{debugInfo.appState}</Text>
        {debugInfo.error && (
          <Text style={styles.errorText}>Error: {debugInfo.error}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AsyncStorage Keys ({debugInfo.asyncStorageKeys.length})</Text>
        {debugInfo.asyncStorageKeys.map((key: string) => (
          <Text key={key} style={styles.text}>• {key}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AsyncStorage Data</Text>
        <Text style={styles.code}>
          {JSON.stringify(debugInfo.asyncStorageData, null, 2)}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={clearAsyncStorage}>
        <Text style={styles.buttonText}>Clear AsyncStorage</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={loadDebugInfo}>
        <Text style={styles.buttonText}>Refresh Debug Info</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 8,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  code: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'monospace',
    color: COLORS.text.secondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: 'bold',
  },
}); 