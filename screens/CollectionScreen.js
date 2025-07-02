import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { shopifyService } from '../services/shopifyService';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');

export const CollectionScreen = ({ route, navigation }) => {
  const { handle, title } = route.params;
  const [products, setProducts] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: title || 'Collection' });
    loadCollectionProducts();
  }, [handle, title]);

  const loadCollectionProducts = async () => {
    try {
      const { collection: collectionData, products: productsData } = 
        await shopifyService.getCollectionProducts(handle, 50);
      setCollection(collectionData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading collection products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCollectionProducts();
  };

  const renderProduct = ({ item, index }) => {
    const isLeftColumn = index % 2 === 0;
    return (
      <View style={[styles.productWrapper, isLeftColumn && styles.leftProduct]}>
        <ProductCard
          product={item}
          onPress={() => navigation.navigate('ProductDetail', { handle: item.handle })}
        />
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          collection?.description ? (
            <View style={styles.header}>
              <Text style={styles.description}>{collection.description}</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products in this collection</Text>
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
  header: {
    padding: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 32,
  },
  productWrapper: {
    width: (width - 32) / 2,
    paddingHorizontal: 8,
  },
  leftProduct: {
    paddingRight: 4,
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