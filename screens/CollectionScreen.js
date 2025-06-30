import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import shopifyService from '../services/shopify';

const CollectionScreen = ({ route, navigation }) => {
  const { handle, title } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);

  useEffect(() => {
    loadCollection();
  }, [handle]);

  const loadCollection = async () => {
    try {
      const data = await shopifyService.getCollectionByHandle(handle);
      setCollection(data.collectionByHandle);
      setProducts(data.collectionByHandle.products.edges.map(edge => edge.node));
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { 
              handle: item.handle,
              title: item.title 
            })}
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productList}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productList: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default CollectionScreen;