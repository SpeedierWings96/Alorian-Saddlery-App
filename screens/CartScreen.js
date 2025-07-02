import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

export const CartScreen = ({ navigation }) => {
  const { cart, cartCount } = useCart();

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount));
  };

  const handleCheckout = async () => {
    if (!cart?.checkoutUrl) {
      Alert.alert('Error', 'Unable to proceed to checkout');
      return;
    }
    
    // Open checkout URL in browser
    const supported = await Linking.canOpenURL(cart.checkoutUrl);
    if (supported) {
      await Linking.openURL(cart.checkoutUrl);
    } else {
      Alert.alert('Error', 'Unable to open checkout page');
    }
  };

  if (!cart || cartCount === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={100} color={Colors.text.secondary} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some products to get started</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cartLines = cart.lines?.edges || [];
  const subtotal = cart.cost?.subtotalAmount;
  const total = cart.cost?.totalAmount;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {cartLines.map(({ node: item }) => {
          const product = item.merchandise?.product;
          const variant = item.merchandise;
          const imageUrl = product?.images?.edges?.[0]?.node?.url;

          return (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemImageContainer}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>No Image</Text>
                  </View>
                )}
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {product?.title}
                </Text>
                {variant?.title !== 'Default Title' && (
                  <Text style={styles.variantTitle}>{variant?.title}</Text>
                )}
                <View style={styles.quantityPrice}>
                  <Text style={styles.quantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(variant?.price?.amount, variant?.price?.currencyCode)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Cart Summary */}
      <View style={styles.summary}>
        {subtotal && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(subtotal.amount, subtotal.currencyCode)}
            </Text>
          </View>
        )}
        {total && (
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatPrice(total.amount, total.currencyCode)}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  shopButtonText: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  variantTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  quantityPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  summary: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: Colors.text.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 