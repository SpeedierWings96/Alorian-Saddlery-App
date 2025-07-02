import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { shopifyService } from '../services/shopifyService';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const CollectionsScreen = ({ navigation }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const collectionsData = await shopifyService.getCollections(20);
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCollections();
  };

  const renderCollection = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => navigation.navigate('Collection', { 
        handle: item.handle, 
        title: item.title 
      })}
    >
      {item.image?.url ? (
        <Image source={{ uri: item.image.url }} style={styles.collectionImage} />
      ) : (
        <View style={[styles.collectionImage, styles.placeholderImage]} />
      )}
      <View style={styles.overlay}>
        <Text style={styles.collectionTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.collectionDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  collectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collectionImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    backgroundColor: Colors.accent,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  collectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.light,
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
}); 