import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import shopifyService from '../services/shopify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const storedCartId = await AsyncStorage.getItem('cartId');
      if (storedCartId) {
        const cartData = await shopifyService.getCart(storedCartId);
        if (cartData.cart) {
          setCart(cartData.cart);
          setCartId(storedCartId);
        } else {
          await createNewCart();
        }
      } else {
        await createNewCart();
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      await createNewCart();
    }
  };

  const createNewCart = async () => {
    try {
      const result = await shopifyService.createCart();
      const newCart = result.cartCreate.cart;
      setCart(newCart);
      setCartId(newCart.id);
      await AsyncStorage.setItem('cartId', newCart.id);
    } catch (error) {
      console.error('Error creating cart:', error);
    }
  };

  const addToCart = async (variantId, quantity = 1) => {
    if (!cartId) {
      await createNewCart();
    }
    
    setLoading(true);
    try {
      const result = await shopifyService.addToCart(cartId, variantId, quantity);
      setCart(result.cartLinesAdd.cart);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (lineId, quantity) => {
    setLoading(true);
    try {
      const result = await shopifyService.updateCartLine(cartId, lineId, quantity);
      setCart(result.cartLinesUpdate.cart);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (lineId) => {
    setLoading(true);
    try {
      const result = await shopifyService.removeFromCart(cartId, lineId);
      setCart(result.cartLinesRemove.cart);
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCartCount = () => {
    return cart?.totalQuantity || 0;
  };

  const getCartTotal = () => {
    return cart?.cost?.totalAmount || { amount: '0', currencyCode: 'USD' };
  };

  const getCheckoutUrl = () => {
    return cart?.checkoutUrl || '';
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        getCartCount,
        getCartTotal,
        getCheckoutUrl,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};