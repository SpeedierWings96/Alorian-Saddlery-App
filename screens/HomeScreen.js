import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { shopifyService } from '../services/shopifyService';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, collectionsData] = await Promise.all([
        shopifyService.getProducts(6),
        shopifyService.getCollections(5),
      ]);
      setProducts(productsData);
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionItem}
      onPress={() => navigation.navigate('Collection', { handle: item.handle, title: item.title })}
    >
      {item.image?.url ? (
        <Image source={{ uri: item.image.url }} style={styles.collectionImage} />
      ) : (
        <View style={[styles.collectionImage, styles.collectionPlaceholder]} />
      )}
      <Text style={styles.collectionTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>ALORIAN</Text>
        <Text style={styles.heroSubtitle}>SADDLERY</Text>
        <View style={styles.divider} />
        <Text style={styles.heroTagline}>More Than Tack, It's a Lifestyle</Text>
      </View>

      {/* Collections */}
      {collections.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Collections</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Collections')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={collections}
            renderItem={renderCollectionItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.collectionsContainer}
          />
        </View>
      )}

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <View key={product.id} style={styles.productWrapper}>
              <ProductCard
                product={product}
                onPress={() =>
                  navigation.navigate('ProductDetail', { handle: product.handle })
                }
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    backgroundColor: Colors.primary,
    padding: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.text.light,
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gold,
    letterSpacing: 3,
    marginTop: -4,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: Colors.gold,
    marginVertical: 16,
  },
  heroTagline: {
    fontSize: 14,
    color: Colors.text.light,
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  collectionsContainer: {
    paddingHorizontal: 16,
  },
  collectionItem: {
    marginRight: 16,
    alignItems: 'center',
  },
  collectionImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: Colors.gold,
  },
  collectionPlaceholder: {
    backgroundColor: Colors.accent,
  },
  collectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    maxWidth: 120,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  productWrapper: {
    width: (width - 32) / 2,
    paddingHorizontal: 8,
  },
}); 