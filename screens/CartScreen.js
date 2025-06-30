import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';

const CartScreen = ({ navigation }) => {
  const {
    cart,
    loading,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCheckoutUrl,
  } = useCart();

  const formatPrice = (amount, currency) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(parseFloat(amount));
  };

  const handleUpdateQuantity = async (lineId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', onPress: () => removeFromCart(lineId), style: 'destructive' }
        ]
      );
    } else {
      await updateQuantity(lineId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      try {
        await Linking.openURL(checkoutUrl);
      } catch (error) {
        Alert.alert('Error', 'Unable to open checkout. Please try again.');
      }
    }
  };

  const renderCartItem = ({ item }) => {
    const line = item;
    const variant = line.merchandise;
    const product = variant.product;
    const imageUrl = product.images?.edges[0]?.node?.originalSrc;

    return (
      <View style={styles.cartItem}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetail', { 
            handle: product.handle,
            title: product.title 
          })}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.itemImage} />
          ) : (
            <LinearGradient
              colors={['#8B4513', '#D2691E']}
              style={styles.itemImage}
            >
              <Text style={styles.placeholderText}>A</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>

        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>{product.title}</Text>
          {variant.title !== 'Default Title' && (
            <Text style={styles.variantTitle}>{variant.title}</Text>
          )}
          <Text style={styles.itemPrice}>
            {formatPrice(variant.price.amount, variant.price.currencyCode)}
          </Text>
        </View>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(line.id, line.quantity, -1)}
          >
            <Ionicons name="remove" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{line.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(line.id, line.quantity, 1)}
          >
            <Ionicons name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>Your cart is empty</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  const cartItems = cart?.lines?.edges?.map(edge => edge.node) || [];
  const total = getCartTotal();

  return (
    <SafeAreaView style={styles.container}>
      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          
          <View style={styles.bottomContainer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>
                {formatPrice(total.amount, total.currencyCode)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  variantTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  quantityButton: {
    padding: 8,
  },
  quantity: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  checkoutButton: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 25,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default CartScreen;