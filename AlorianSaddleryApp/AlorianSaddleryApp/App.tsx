import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alorian Saddlery</Text>
      <Text style={styles.subtitle}>App is working!</Text>
      <Text style={styles.text}>✅ JavaScript bundle loaded successfully</Text>
      <Text style={styles.text}>✅ React Native components working</Text>
      <Text style={styles.text}>✅ No white screen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  text: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
    textAlign: 'center',
  },
}); 