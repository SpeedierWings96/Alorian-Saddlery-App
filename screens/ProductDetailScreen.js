import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { shopifyService } from '../services/shopifyService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }) => {
  const { handle } = route.params;
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    loadProduct();
  }, [handle]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await shopifyService.getProductByHandle(handle);
      setProduct(productData);
      
      // Set initial variant
      if (productData?.variants?.edges?.length > 0) {
        const firstVariant = productData.variants.edges[0].node;
        setSelectedVariant(firstVariant);
        
        // Set initial options
        const initialOptions = {};
        firstVariant.selectedOptions?.forEach(option => {
          initialOptions[option.name] = option.value;
        });
        setSelectedOptions(initialOptions);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (optionName, value) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);
    
    // Find matching variant
    const matchingVariant = product.variants.edges.find(edge => {
      const variant = edge.node;
      return variant.selectedOptions.every(
        option => newOptions[option.name] === option.value
      );
    });
    
    if (matchingVariant) {
      setSelectedVariant(matchingVariant.node);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      Alert.alert('Please select options');
      return;
    }
    
    if (!selectedVariant.availableForSale) {
      Alert.alert('Out of Stock', 'This variant is currently unavailable');
      return;
    }
    
    try {
      await addToCart(selectedVariant.id, 1);
      Alert.alert('Success', 'Added to cart!', [
        { text: 'Continue Shopping' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const images = product.images?.edges?.map(edge => edge.node) || [];
  const currentPrice = selectedVariant?.price || product.priceRange?.minVariantPrice;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image Gallery */}
      <View style={styles.imageSection}>
        {images.length > 0 ? (
          <>
            <Image
              source={{ uri: images[selectedImage]?.url }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {images.length > 1 && (
              <FlatList
                horizontal
                data={images}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedImage(index)}
                    style={[
                      styles.thumbnail,
                      selectedImage === index && styles.selectedThumbnail,
                    ]}
                  >
                    <Image source={{ uri: item.url }} style={styles.thumbnailImage} />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
              />
            )}
          </>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No images available</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.title}>{product.title}</Text>
        {currentPrice && (
          <Text style={styles.price}>
            {formatPrice(currentPrice.amount, currentPrice.currencyCode)}
          </Text>
        )}
        
        {/* Options */}
        {product.options?.map(option => (
          <View key={option.id} style={styles.optionContainer}>
            <Text style={styles.optionLabel}>{option.name}</Text>
            <View style={styles.optionValues}>
              {option.values.map(value => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.optionButton,
                    selectedOptions[option.name] === value && styles.selectedOptionButton,
                  ]}
                  onPress={() => handleOptionChange(option.name, value)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedOptions[option.name] === value && styles.selectedOptionButtonText,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Description */}
        {product.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (!selectedVariant?.availableForSale || cartLoading) && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={!selectedVariant?.availableForSale || cartLoading}
        >
          <Ionicons name="cart-outline" size={24} color={Colors.text.light} />
          <Text style={styles.addToCartText}>
            {!selectedVariant?.availableForSale ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  imageSection: {
    backgroundColor: Colors.surface,
  },
  mainImage: {
    width: width,
    height: width,
  },
  noImageContainer: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.accent,
  },
  noImageText: {
    color: Colors.text.secondary,
  },
  thumbnailList: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  optionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOptionButton: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  selectedOptionButtonText: {
    color: Colors.text.light,
  },
  descriptionContainer: {
    marginTop: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: Colors.text.secondary,
  },
  addToCartText: {
    color: Colors.text.light,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 