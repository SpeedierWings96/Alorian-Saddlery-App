import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, SPACING, TYPOGRAPHY } from '../config/theme';
import { RootStackParamList, Product, ProductVariant } from '../types/shopify';
import { shopifyApi } from '../services/shopifyApi';
import { useCart } from '../contexts/CartContext';

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const { width: screenWidth } = Dimensions.get('window');

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { productHandle } = route.params;
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productHandle]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const product = await shopifyApi.getProductByHandle(productHandle);
      
      if (product) {
        setProduct(product);
        // Set the first available variant as default
        const firstVariant = product.variants.edges[0]?.node;
        if (firstVariant) {
          setSelectedVariant(firstVariant);
        }
      } else {
        Alert.alert('Error', 'Product not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      Alert.alert('Error', 'Please select a variant');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(selectedVariant.id, quantity);
      
      Alert.alert(
        'Added to Cart!',
        `${quantity} ${product?.title} added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'default' },
          { 
            text: 'View Cart', 
            style: 'default',
            onPress: () => navigation.navigate('Cart')
          }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const renderImageGallery = () => {
    if (!product || product.images.edges.length === 0) {
      return (
        <View style={styles.placeholderImageContainer}>
          <Ionicons name="image-outline" size={80} color={COLORS.gray[400]} />
        </View>
      );
    }

    return (
      <View style={styles.imageGallery}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setSelectedImageIndex(index);
          }}
        >
          {product.images.edges.map((edge, index) => (
            <Image
              key={index}
              source={{ uri: edge.node.url }}
              style={styles.productImage}
              contentFit="cover"
            />
          ))}
        </ScrollView>
        
        {product.images.edges.length > 1 && (
          <View style={styles.imageIndicators}>
            {product.images.edges.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  selectedImageIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderVariantOptions = () => {
    if (!product || !product.options || product.options.length === 0) {
      return null;
    }

    return (
      <View style={styles.variantSection}>
        {product.options.map((option) => (
          <View key={option.id} style={styles.optionGroup}>
            <Text style={styles.optionTitle}>{option.name}:</Text>
            <View style={styles.optionValues}>
              {option.values.map((value) => {
                const isSelected = selectedVariant?.selectedOptions.some(
                  (selected) => selected.name === option.name && selected.value === value
                );
                
                return (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.optionValue,
                      isSelected && styles.selectedOptionValue,
                    ]}
                    onPress={() => {
                      // Find variant with this option value
                      const variant = product.variants.edges.find((edge) =>
                        edge.node.selectedOptions.some(
                          (opt) => opt.name === option.name && opt.value === value
                        )
                      );
                      if (variant) {
                        setSelectedVariant(variant.node);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.optionValueText,
                        isSelected && styles.selectedOptionValueText,
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderQuantitySelector = () => (
    <View style={styles.quantitySection}>
      <Text style={styles.quantityLabel}>Quantity:</Text>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Ionicons name="remove" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        
        <Text style={styles.quantityText}>{quantity}</Text>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(quantity + 1)}
        >
          <Ionicons name="add" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        
        <View style={styles.productInfo}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productVendor}>{product.vendor}</Text>
            </View>
            
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceSection}>
            <Text style={styles.price}>
              {selectedVariant ? formatPrice(selectedVariant.price.amount) : formatPrice(product.priceRange.minVariantPrice.amount)}
            </Text>
            {selectedVariant?.availableForSale === false && (
              <Text style={styles.outOfStock}>Out of Stock</Text>
            )}
          </View>
          

          
          {renderVariantOptions()}
          {renderQuantitySelector()}
          
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (!selectedVariant?.availableForSale || addingToCart) && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={!selectedVariant?.availableForSale || addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="bag-add" size={20} color={COLORS.white} />
              <Text style={styles.addToCartText}>
                Add to Cart • {selectedVariant ? formatPrice(selectedVariant.price.amount) : formatPrice(product.priceRange.minVariantPrice.amount)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    height: 300,
    position: 'relative',
  },
  productImage: {
    width: screenWidth,
    height: 300,
  },
  placeholderImageContainer: {
    width: screenWidth,
    height: 300,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    opacity: 0.5,
  },
  activeIndicator: {
    opacity: 1,
  },
  productInfo: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleSection: {
    flex: 1,
  },
  productTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  productVendor: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  favoriteButton: {
    padding: SPACING.sm,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.md,
  },
  outOfStock: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontWeight: '500',
  },

  variantSection: {
    marginBottom: SPACING.lg,
  },
  optionGroup: {
    marginBottom: SPACING.md,
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  optionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionValue: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
  },
  selectedOptionValue: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  optionValueText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
  },
  selectedOptionValueText: {
    color: COLORS.white,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  quantityLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: SPACING.md,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
  },
  quantityButton: {
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: SPACING.xl,
  },
  descriptionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  bottomSection: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  disabledButton: {
    backgroundColor: COLORS.gray[400],
  },
  addToCartText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ProductDetailScreen;
