import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopifyService } from '../services/shopifyService';

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
  const [cartCount, setCartCount] = useState(0);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Update cart count when cart changes
  useEffect(() => {
    if (cart) {
      setCartCount(cart.totalQuantity || 0);
    }
  }, [cart]);

  const loadCart = async () => {
    try {
      const savedCartId = await AsyncStorage.getItem('cartId');
      if (savedCartId) {
        // In a real app, you'd fetch the cart details here
        // For now, we'll just store the ID
        setCart({ id: savedCartId });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const createNewCart = async () => {
    try {
      setLoading(true);
      const newCart = await shopifyService.createCart();
      await AsyncStorage.setItem('cartId', newCart.id);
      setCart(newCart);
      return newCart;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (variantId, quantity = 1) => {
    try {
      setLoading(true);
      let currentCart = cart;
      
      // Create cart if it doesn't exist
      if (!currentCart) {
        currentCart = await createNewCart();
      }
      
      // Add item to cart
      const updatedCart = await shopifyService.addToCart(currentCart.id, variantId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem('cartId');
      setCart(null);
      setCartCount(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const value = {
    cart,
    cartCount,
    loading,
    addToCart,
    clearCart,
    createNewCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 