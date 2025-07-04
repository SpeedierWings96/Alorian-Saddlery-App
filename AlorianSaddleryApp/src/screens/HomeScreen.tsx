import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SPACING, TYPOGRAPHY } from '../config/theme';
import { RootStackParamList, Collection, Product } from '../types/shopify';
import { shopifyApi } from '../services/shopifyApi';
import { useCart } from '../contexts/CartContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingFeaturedProducts, setLoadingFeaturedProducts] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      console.log('HomeScreen: Fetching featured products...');
      setLoadingFeaturedProducts(true);
      
      // Try to fetch from a specific collection, fallback to general products
      try {
        const productsData = await shopifyApi.getProductsByCollectionId('gid://shopify/Collection/519170851118', 10);
        console.log('HomeScreen: Fetched products from collection:', productsData.length);
        setFeaturedProducts(productsData.slice(0, 6));
      } catch (collectionError) {
        console.log('HomeScreen: Collection fetch failed, trying general products...');
        // Fallback to general products if collection doesn't exist
        const generalProducts = await shopifyApi.getProducts(6);
        const products = generalProducts.products.edges.map(edge => edge.node);
        console.log('HomeScreen: Fetched general products:', products.length);
        setFeaturedProducts(products);
      }
    } catch (error) {
      console.error('HomeScreen: Error fetching featured products:', error);
      // Set empty array as final fallback
      setFeaturedProducts([]);
    } finally {
      setLoadingFeaturedProducts(false);
      console.log('HomeScreen: Featured products fetch completed');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={require('../../assets/Alorian_Logo_copy.png')}
          style={styles.heroLogo}
          resizeMode="contain"
        />
      </View>

      {/* Search Bar with Enhanced Design */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
        >
          <View style={styles.searchIconContainer}>
            <Ionicons name="search" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.searchPlaceholder}>Search premium equestrian gear...</Text>
          <Ionicons name="mic-outline" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>

      {/* Featured Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Items</Text>
          <Text style={styles.sectionSubtitle}>Discover our premium products</Text>
        </View>
        {loadingFeaturedProducts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading featured products...</Text>
          </View>
        ) : (
          <FlatList
            data={featuredProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.collectionsContainer}
            renderItem={({ item }) => {
              const productImage = item.images.edges.length > 0 ? item.images.edges[0].node : null;
              const price = item.variants.edges.length > 0 ? item.variants.edges[0].node.price : null;

              return (
                <TouchableOpacity
                  style={styles.collectionCard}
                  onPress={() => navigation.navigate('ProductDetail', { productHandle: item.handle })}
                >
                  <View style={styles.collectionImageContainer}>
                    {productImage ? (
                      <Image
                        source={{ uri: productImage.url }}
                        style={styles.collectionImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Ionicons name="cube-outline" size={40} color={COLORS.gray[400]} />
                      </View>
                    )}
                    <View style={styles.collectionOverlay} />
                    <View style={styles.collectionInfo}>
                      <Text style={styles.collectionTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {price && (
                        <Text style={styles.collectionProductCount}>
                          ${parseFloat(price.amount).toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Products')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="grid-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>All Products</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Collections')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="albums-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Collections</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Cart')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="bag-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Shopping Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="person-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>My Account</Text>
          </TouchableOpacity>
        </View>
      </View>



      {/* Contact Information */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Get in Touch</Text>
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
            <Text style={styles.contactText}>info@alorian.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.contactText}>201-450-7505</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroSection: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    position: 'relative',
  },
  heroLogo: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    opacity: 1.0,
    top: -15,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  decorativeLine: {
    height: 1,
    width: 30,
    backgroundColor: COLORS.white,
    opacity: 0.7,
    marginHorizontal: SPACING.md,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.95,
    fontWeight: '500',
    letterSpacing: 1,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 30,
    gap: SPACING.sm,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  heroButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginTop: -15,
    zIndex: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray[500],
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  categoriesGrid: {
    gap: SPACING.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 16,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: SPACING.md,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  categoryDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  actionCard: {
    width: (width - SPACING.lg * 3) / 2,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: SPACING.md,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  modernActionCard: {
    width: (width - SPACING.lg * 3) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  actionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  modernActionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  aboutSection: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.xl,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  aboutHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  aboutTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  aboutSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  aboutQuote: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aboutIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  aboutContent: {
    flex: 1,
  },
  aboutText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  aboutFeatures: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  contactSection: {
    backgroundColor: COLORS.gray[50],
    margin: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: 20,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  contactInfo: {
    gap: SPACING.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  // Collections styles
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  collectionsContainer: {
    paddingLeft: SPACING.lg,
  },
  collectionCard: {
    width: (width - SPACING.lg * 2) / 3,
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    backgroundColor: COLORS.white,
  },
  collectionImageContainer: {
    height: 120,
    position: 'relative',
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
  collectionOverlay: {
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
    padding: SPACING.md,
  },
  collectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  collectionProductCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    opacity: 0.9,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default HomeScreen;
