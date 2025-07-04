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
  Modal,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, SPACING, TYPOGRAPHY } from '../config/theme';
import { RootStackParamList, Product } from '../types/shopify';
import { shopifyApi } from '../services/shopifyApi';

type ProductsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Products'>;
type ProductsScreenRouteProp = RouteProp<RootStackParamList, 'Products'>;

const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const route = useRoute<ProductsScreenRouteProp>();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  
  // Filter and Sort state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  const collectionId = route.params?.collectionId;

  const fetchProducts = async (isRefresh = false, loadMore = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setEndCursor(null);
        setHasNextPage(true);
      } else if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // For initial load or refresh, start fresh
      const cursor = (isRefresh || !loadMore) ? undefined : endCursor || undefined;
      
      let newProducts: Product[];
      let pageInfo: any;
      
      if (collectionId) {
        // If we have a collection ID, fetch products by collection
        newProducts = await shopifyApi.getProductsByCollectionId(collectionId, 50);
        // For collection products, we don't have pagination info, so we'll load all at once
        pageInfo = { hasNextPage: false, endCursor: null };
      } else {
        // Fetch all products with pagination
        const response = await shopifyApi.getProducts(50, cursor);
        newProducts = response.products.edges.map(edge => edge.node);
        pageInfo = response.products.pageInfo;
      }
      
      if (isRefresh || !loadMore) {
        setProducts(newProducts);
      } else {
        // Deduplicate products to avoid duplicate keys
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewProducts];
        });
      }
      
      setHasNextPage(pageInfo.hasNextPage);
      setEndCursor(pageInfo.endCursor || null);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      Alert.alert('Error', 'Failed to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };


  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage) {
      fetchProducts(false, true);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [collectionId]);

  // Apply filters and sorting whenever products or filter/sort options change
  useEffect(() => {
    applyFiltersAndSort();
  }, [products, selectedPriceRange, selectedTags, selectedVendor, sortBy]);

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Apply price filter
    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        switch (selectedPriceRange) {
          case 'under25':
            return price < 25;
          case '25to50':
            return price >= 25 && price <= 50;
          case '50to100':
            return price >= 50 && price <= 100;
          case 'over100':
            return price > 100;
          default:
            return true;
        }
      });
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product =>
        selectedTags.some(tag => product.tags.includes(tag))
      );
    }

    // Apply vendor filter
    if (selectedVendor !== 'all') {
      filtered = filtered.filter(product => product.vendor === selectedVendor);
    }

    // Apply sorting (only on currently loaded products)
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nameAsc':
          return a.title.localeCompare(b.title);
        case 'nameDesc':
          return b.title.localeCompare(a.title);
        case 'featured':
        default:
          return 0; // Keep original order
      }
    });

    setFilteredProducts(filtered);
  };

  const getUniqueVendors = () => {
    const vendors = products.map(product => product.vendor).filter(Boolean);
    return [...new Set(vendors)];
  };

  const getUniqueTags = () => {
    const allTags = products.flatMap(product => product.tags);
    return [...new Set(allTags)].slice(0, 20); // Limit to 20 most common tags
  };

  const clearFilters = () => {
    setSelectedPriceRange('all');
    setSelectedTags([]);
    setSelectedVendor('all');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const mainImage = item.images.edges[0]?.node;
    const minPrice = item.priceRange.minVariantPrice.amount;
    const maxPrice = item.priceRange.maxVariantPrice.amount;
    const priceDisplay = minPrice === maxPrice 
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productHandle: item.handle })}
      >
        <View style={styles.imageContainer}>
          {mainImage ? (
            <Image
              source={{ uri: mainImage.url }}
              style={styles.productImage}
              contentFit="cover"
              placeholder="Loading..."
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={40} color={COLORS.gray[400]} />
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productVendor}>{item.vendor}</Text>
          <Text style={styles.productPrice}>{priceDisplay}</Text>
          
          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>
          {collectionId ? 'Collection Products' : 'All Products'}
        </Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color={COLORS.primary} />
          <Text style={styles.filterText}>Filter</Text>
          {(selectedPriceRange !== 'all' || selectedTags.length > 0 || selectedVendor !== 'all') && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {(selectedPriceRange !== 'all' ? 1 : 0) + selectedTags.length + (selectedVendor !== 'all' ? 1 : 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical" size={20} color={COLORS.primary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.productCount}>
        {filteredProducts.length} of {products.length} product{products.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasNextPage) return null;
    
    return (
      <View style={styles.footerContainer}>
        {loadingMore ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
          >
            <Text style={styles.loadMoreText}>Load More Products</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProducts(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter Products</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Price Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              {[
                { key: 'all', label: 'All Prices' },
                { key: 'under25', label: 'Under $25' },
                { key: '25to50', label: '$25 - $50' },
                { key: '50to100', label: '$50 - $100' },
                { key: 'over100', label: 'Over $100' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.filterOption}
                  onPress={() => setSelectedPriceRange(option.key)}
                >
                  <Text style={styles.filterOptionText}>{option.label}</Text>
                  {selectedPriceRange === option.key && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Vendor Filter */}
            {getUniqueVendors().length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Brand</Text>
                <TouchableOpacity
                  style={styles.filterOption}
                  onPress={() => setSelectedVendor('all')}
                >
                  <Text style={styles.filterOptionText}>All Brands</Text>
                  {selectedVendor === 'all' && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
                {getUniqueVendors().map((vendor) => (
                  <TouchableOpacity
                    key={vendor}
                    style={styles.filterOption}
                    onPress={() => setSelectedVendor(vendor)}
                  >
                    <Text style={styles.filterOptionText}>{vendor}</Text>
                    {selectedVendor === vendor && (
                      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Tags Filter */}
            {getUniqueTags().length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Categories</Text>
                <View style={styles.tagsGrid}>
                  {getUniqueTags().map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagChip,
                        selectedTags.includes(tag) && styles.tagChipSelected
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[
                        styles.tagChipText,
                        selectedTags.includes(tag) && styles.tagChipTextSelected
                      ]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sort Products</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              {[
                { key: 'featured', label: 'Featured' },
                { key: 'nameAsc', label: 'Name: A to Z' },
                { key: 'nameDesc', label: 'Name: Z to A' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.filterOption}
                  onPress={() => {
                    setSortBy(option.key);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={styles.filterOptionText}>{option.label}</Text>
                  {sortBy === option.key && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  searchButton: {
    padding: SPACING.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  sortText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  productCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: SPACING.md,
  },
  productTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  productVendor: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    fontWeight: '500',
  },
  // Filter badge styles
  filterBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  filterBadgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  clearText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.xl,
  },
  filterSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  filterOptionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tagChip: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  tagChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: COLORS.white,
  },
  // Footer styles
  footerContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  loadMoreText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
});

export default ProductsScreen;
