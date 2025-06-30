import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingSpinner from '../components/LoadingSpinner';
import shopifyService from '../services/shopify';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { handle } = route.params;
  const { addToCart, loading: cartLoading } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [handle]);

  const loadProduct = async () => {
    try {
      const data = await shopifyService.getProductByHandle(handle);
      const productData = data.productByHandle;
      setProduct(productData);
      
      if (productData.variants.edges.length > 0) {
        setSelectedVariant(productData.variants.edges[0].node);
        
        // Set initial selected options
        const initialOptions = {};
        productData.variants.edges[0].node.selectedOptions.forEach(option => {
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
      return variant.selectedOptions.every(option => 
        newOptions[option.name] === option.value
      );
    });
    
    if (matchingVariant) {
      setSelectedVariant(matchingVariant.node);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      Alert.alert('Please select options', 'Please select all product options before adding to cart.');
      return;
    }

    if (!selectedVariant.availableForSale) {
      Alert.alert('Out of Stock', 'This variant is currently out of stock.');
      return;
    }

    const success = await addToCart(selectedVariant.id);
    if (success) {
      Alert.alert(
        'Added to Cart',
        'Product has been added to your cart.',
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to add product to cart. Please try again.');
    }
  };

  const formatPrice = (amount, currency) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(parseFloat(amount));
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

  const images = product.images.edges.map(edge => edge.node);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(slideIndex);
            }}
            scrollEventThrottle={16}
          >
            {images.length > 0 ? (
              images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image.originalSrc }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              <LinearGradient
                colors={['#8B4513', '#D2691E']}
                style={styles.productImage}
              >
                <Text style={styles.placeholderText}>Alorian</Text>
              </LinearGradient>
            )}
          </ScrollView>
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === activeImageIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{product.title}</Text>
          
          {selectedVariant && (
            <Text style={styles.price}>
              {formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
            </Text>
          )}

          {/* Variant Options */}
          {product.options.map((option) => (
            <View key={option.id} style={styles.optionContainer}>
              <Text style={styles.optionTitle}>{option.name}:</Text>
              <View style={styles.optionValues}>
                {option.values.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.optionButton,
                      selectedOptions[option.name] === value && styles.selectedOption,
                    ]}
                    onPress={() => handleOptionChange(option.name, value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedOptions[option.name] === value && styles.selectedOptionText,
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Stock Status */}
          {selectedVariant && (
            <View style={styles.stockContainer}>
              {selectedVariant.availableForSale ? (
                <View style={styles.inStock}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.stockText}>In Stock</Text>
                </View>
              ) : (
                <View style={styles.outOfStock}>
                  <Ionicons name="close-circle" size={20} color="#F44336" />
                  <Text style={styles.stockText}>Out of Stock</Text>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (!selectedVariant || !selectedVariant.availableForSale || cartLoading) && 
            styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={!selectedVariant || !selectedVariant.availableForSale || cartLoading}
        >
          <Text style={styles.addToCartText}>
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 20,
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: '#8B4513',
    backgroundColor: '#8B4513',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  stockContainer: {
    marginBottom: 20,
  },
  inStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outOfStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 20,
    paddingBottom: 100,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addToCartButton: {
    backgroundColor: '#8B4513',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;