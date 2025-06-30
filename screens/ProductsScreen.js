import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import shopifyService from '../services/shopify';

const ProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await shopifyService.getProducts(20, isLoadMore ? endCursor : null);
      const newProducts = data.products.edges.map(edge => edge.node);
      
      if (isLoadMore) {
        setProducts([...products, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      
      setHasNextPage(data.products.pageInfo.hasNextPage);
      setEndCursor(data.products.pageInfo.endCursor);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setEndCursor(null);
    loadProducts();
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage) {
      loadProducts(true);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8B4513" />
      </View>
    );
  };

  if (loading && products.length === 0) {
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B4513']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
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
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productList: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
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

export default ProductsScreen;