import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, SPACING, TYPOGRAPHY } from '../config/theme';
import { RootStackParamList } from '../types/shopify';
import { useCart } from '../contexts/CartContext';
import { shopifyApi } from '../services/shopifyApi';

type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;
type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const route = useRoute<CheckoutScreenRouteProp>();
  const { cart, isLoading: cartLoading } = useCart();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);

  useEffect(() => {
    // Set up navigation header
    navigation.setOptions({
      title: showWebView ? 'Secure Checkout' : 'Checkout',
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            if (showWebView) {
              setShowWebView(false);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, showWebView]);

  const handleProceedToShopify = () => {
    if (!cart || !cart.checkoutUrl) {
      Alert.alert('Error', 'Unable to proceed to checkout. Please try again.');
      return;
    }
    setShowWebView(true);
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    // Handle successful checkout completion
    if (navState.url.includes('thank_you') || navState.url.includes('orders')) {
      Alert.alert(
        'Order Complete!',
        'Thank you for your purchase. You will receive a confirmation email shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowWebView(false);
              navigation.navigate('Home');
            },
          },
        ]
      );
    }
  };

  const formatPrice = (amount: string, currencyCode: string = 'USD') => {
    return shopifyApi.formatPrice(amount, currencyCode);
  };

  const renderOrderSummary = () => {
    if (!cart) return null;

    const subtotal = parseFloat(cart.estimatedCost.subtotalAmount.amount);
    const tax = cart.estimatedCost.totalTaxAmount 
      ? parseFloat(cart.estimatedCost.totalTaxAmount.amount) 
      : 0;
    const total = parseFloat(cart.estimatedCost.totalAmount.amount);
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
      </View>
    );
  };

  const renderCartItems = () => {
    if (!cart || cart.lines.edges.length === 0) return null;

    return (
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Items in your order</Text>
        
        {cart.lines.edges.map(({ node: line }) => {
          const product = line.merchandise.product;
          const variant = line.merchandise;
          const imageUrl = product.images.edges.length > 0 
            ? product.images.edges[0].node.url 
            : null;

          return (
            <View key={line.id} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {product.title}
                </Text>
                <Text style={styles.itemVariant}>{variant.title}</Text>
                <Text style={styles.itemQuantity}>Quantity: {line.quantity}</Text>
              </View>
              <View style={styles.itemPricing}>
                <Text style={styles.itemPrice}>
                  {formatPrice(variant.price.amount, variant.price.currencyCode)}
                </Text>
                <Text style={styles.itemTotal}>
                  {formatPrice(line.estimatedCost.totalAmount.amount, line.estimatedCost.totalAmount.currencyCode)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (cartLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  if (!cart || cart.lines.edges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bag-outline" size={80} color={COLORS.gray[400]} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyMessage}>
          Add some items to your cart before checking out.
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If WebView should be shown, render the checkout WebView
  if (showWebView && cart?.checkoutUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowWebView(false)}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            <Text style={styles.backButtonText}>Back to Summary</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: cart.checkoutUrl }}
          style={styles.webView}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading secure checkout...</Text>
            </View>
          )}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCartItems()}
        {renderOrderSummary()}
        
        <View style={styles.checkoutInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
            <Text style={styles.infoText}>Secure checkout powered by Shopify</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="card" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>Multiple payment options available</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>Your information is protected</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.checkoutButtonContainer}>
        <TouchableOpacity
          style={[styles.checkoutButton, (isLoading || cartLoading) && styles.disabledButton]}
          onPress={handleProceedToShopify}
          disabled={isLoading || cartLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="card" size={20} color={COLORS.white} />
              <Text style={styles.checkoutButtonText}>
                Complete Purchase
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.checkoutNote}>
          Checkout will open within the app
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
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
  headerButton: {
    padding: SPACING.sm,
  },
  itemsContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.md,
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
  itemQuantity: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  itemTotal: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginBottom: 0,
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
  checkoutInfo: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  checkoutButtonContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  disabledButton: {
    backgroundColor: COLORS.gray[400],
  },
  checkoutButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  checkoutNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  webViewHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  backButtonText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.primary,
    fontWeight: '500',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

export default CheckoutScreen;
