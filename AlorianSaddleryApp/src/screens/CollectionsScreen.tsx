import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, SPACING, TYPOGRAPHY } from '../config/theme';
import { RootStackParamList, Collection } from '../types/shopify';
import { shopifyApi } from '../services/shopifyApi';

type CollectionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Collections'>;

const CollectionsScreen: React.FC = () => {
  const navigation = useNavigation<CollectionsScreenNavigationProp>();
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const collectionsData = await shopifyApi.getCollections(20);
      // Filter out collections with 0 products
      const filteredCollections = collectionsData.filter(collection => 
        collection.products.edges.length > 0
      );
      setCollections(filteredCollections);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load collections. Please try again.');
      Alert.alert('Error', 'Failed to load collections. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderCollection = ({ item }: { item: Collection }) => {
    const productCount = item.products.edges.length;
    
    // Find the first product with an image if collection doesn't have its own image
    let collectionImage = item.image;
    if (!collectionImage) {
      for (const productEdge of item.products.edges) {
        const product = productEdge.node;
        if (product.images.edges.length > 0) {
          collectionImage = product.images.edges[0].node;
          break;
        }
      }
    }

    return (
      <TouchableOpacity
        style={styles.collectionCard}
        onPress={() => navigation.navigate('Products', { collectionId: item.id })}
      >
        <View style={styles.imageContainer}>
          {collectionImage ? (
            <Image
              source={{ uri: collectionImage.url }}
              style={styles.collectionImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="albums-outline" size={40} color={COLORS.gray[400]} />
            </View>
          )}
          
          {/* Overlay */}
          <View style={styles.imageOverlay} />
          
          {/* Collection Info Overlay */}
          <View style={styles.collectionInfo}>
            <Text style={styles.collectionTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.productCount}>
              {productCount} product{productCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        {item.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description} numberOfLines={3}>
              {item.description}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Collections</Text>
      <Text style={styles.headerSubtitle}>
        Explore our curated collections of premium equestrian equipment
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="albums-outline" size={64} color={COLORS.gray[400]} />
      <Text style={styles.emptyTitle}>No Collections Found</Text>
      <Text style={styles.emptyMessage}>
        Collections will appear here when they become available
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Products')}
      >
        <Text style={styles.browseButtonText}>Browse All Products</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading collections...</Text>
      </View>
    );
  }

  if (error && collections.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchCollections()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchCollections(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  collectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.black,
    opacity: 0.3,
  },
  collectionInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  collectionTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productCount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.white,
    opacity: 0.9,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descriptionContainer: {
    padding: SPACING.lg,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
});

export default CollectionsScreen;
