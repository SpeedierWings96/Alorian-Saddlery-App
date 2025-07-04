import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, SPACING, TYPOGRAPHY } from '../config/theme';
import { RootStackParamList, CartLine } from '../types/shopify';
import { useCart } from '../contexts/CartContext';
import { shopifyApi } from '../services/shopifyApi';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { 
    cart, 
    isLoading, 
    error, 
    updateCartLine, 
    removeFromCart, 
    clearCart,
    refreshCart,
    getCartItemCount,
    getCartTotal 
  } = useCart();

  useEffect(() => {
    // Refresh cart when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      refreshCart();
    });

    return unsubscribe;
  }, [navigation, refreshCart]);

  const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
    try {
      await updateCartLine(lineId, newQuantity);
    } catch (error) {
      Alert.alert('Error', 'Failed to update item quantity. Please try again.');
    }
  };

  const handleRemoveItem = (lineId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(lineId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cart. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (!cart || cart.lines.edges.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }

    // Navigate to checkout screen
    navigation.navigate('Checkout', { cartId: cart.id });
  };

  const formatPrice = (amount: string, currencyCode: string = 'USD') => {
    return shopifyApi.formatPrice(amount, currencyCode);
  };

  const renderCartItem = ({ item }: { item: CartLine }) => {
    const product = item.merchandise.product;
    const variant = item.merchandise;
    const imageUrl = product.images.edges.length > 0 
      ? product.images.edges[0].node.url 
      : null;

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemImageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.itemImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={32} color={COLORS.gray[400]} />
            </View>
          )}
        </View>
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.itemVariant}>{variant.title}</Text>
          <Text style={styles.itemPrice}>
            {formatPrice(variant.price.amount, variant.price.currencyCode)}
          </Text>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              disabled={isLoading}
            >
              <Ionicons name="remove" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              disabled={isLoading}
            >
              <Ionicons name="add" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.itemActions}>
          <Text style={styles.itemTotal}>
            {item.estimatedCost?.totalAmount?.amount 
              ? formatPrice(item.estimatedCost.totalAmount.amount, item.estimatedCost.totalAmount.currencyCode)
              : '$0.00'
            }
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.id)}
            disabled={isLoading}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Shopping Cart</Text>
      {cart && cart.lines.edges.length > 0 && (
        <TouchableOpacity onPress={handleClearCart} disabled={isLoading}>
          <Text style={styles.clearButton}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bag-outline" size={80} color={COLORS.gray[400]} />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyMessage}>
        Add some amazing equestrian products to get started!
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('Products')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSummary = () => {
    if (!cart || !cart.estimatedCost || !cart.estimatedCost.subtotalAmount || !cart.estimatedCost.totalAmount) return null;

    const subtotal = parseFloat(cart.estimatedCost.subtotalAmount.amount || '0');
    const tax = cart.estimatedCost.totalTaxAmount 
      ? parseFloat(cart.estimatedCost.totalTaxAmount.amount || '0') 
      : 0;
    const total = parseFloat(cart.estimatedCost.totalAmount.amount || '0');
    const shipping = total - subtotal - tax;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Subtotal ({cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'})
          </Text>
          <Text style={styles.summaryValue}>
            {formatPrice(cart.estimatedCost.subtotalAmount.amount, cart.estimatedCost.subtotalAmount.currencyCode)}
          </Text>
        </View>
        
        {shipping > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(shipping.toString(), cart.estimatedCost.totalAmount.currencyCode)}
            </Text>
          </View>
        )}
        
        {tax > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(cart.estimatedCost.totalTaxAmount!.amount, cart.estimatedCost.totalTaxAmount!.currencyCode)}
            </Text>
          </View>
        )}
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatPrice(cart.estimatedCost.totalAmount.amount, cart.estimatedCost.totalAmount.currencyCode)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.checkoutButton, isLoading && styles.disabledButton]}
          onPress={handleCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="card" size={20} color={COLORS.white} />
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && !cart) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color={COLORS.error} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshCart}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!cart || cart.lines.edges.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderEmptyCart()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.lines.edges.map(edge => edge.node)}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refreshCart}
      />
      {renderSummary()}
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
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  clearButton: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.error,
    fontWeight: '500',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  itemVariant: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 6,
  },
  quantityButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },
  quantityText: {
    paddingHorizontal: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: SPACING.sm,
  },
  itemTotal: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  checkoutButton: {
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
  checkoutButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CartScreen;
