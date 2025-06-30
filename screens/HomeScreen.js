import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import shopifyService from '../services/shopify';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, collectionsData] = await Promise.all([
        shopifyService.getProducts(10),
        shopifyService.getCollections(),
      ]);
      
      setProducts(productsData.products.edges.map(edge => edge.node));
      setCollections(collectionsData.collections.edges.map(edge => edge.node));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    navigation.navigate('Search', { query: searchQuery });
  };

  const renderHeader = () => (
    <View>
      {/* Hero Banner */}
      <LinearGradient
        colors={['#8B4513', '#D2691E']}
        style={styles.heroBanner}
      >
        <Text style={styles.heroTitle}>Alorian Saddlery</Text>
        <Text style={styles.heroSubtitle}>Premium Equestrian Equipment</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Collections */}
      {collections.length > 0 && (
        <View style={styles.sectionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Collections')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.collectionsScroll}
          >
            {collections.map((collection) => (
              <TouchableOpacity
                key={collection.id}
                style={styles.collectionCard}
                onPress={() => navigation.navigate('Collection', { 
                  handle: collection.handle,
                  title: collection.title 
                })}
              >
                {collection.image ? (
                  <Image
                    source={{ uri: collection.image.originalSrc }}
                    style={styles.collectionImage}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={['#D2691E', '#8B4513']}
                    style={styles.collectionImage}
                  />
                )}
                <Text style={styles.collectionTitle}>{collection.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured Products Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Products')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B4513']}
          />
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
  heroBanner: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  sectionsContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
  },
  collectionsScroll: {
    paddingHorizontal: 16,
  },
  collectionCard: {
    marginRight: 12,
    alignItems: 'center',
  },
  collectionImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  collectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    maxWidth: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productList: {
    paddingBottom: 20,
  },
});

export default HomeScreen;