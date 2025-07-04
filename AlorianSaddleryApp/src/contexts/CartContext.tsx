import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart, CartLineInput, CartLineUpdateInput } from '../types/shopify';
import { shopifyApi } from '../services/shopifyApi';

// Cart Context Types
interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (merchandiseId: string, quantity: number) => Promise<void>;
  updateCartLine: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartItemCount: () => number;
  getCartTotal: () => number;
}

// Cart State
interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

// Cart Actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_CART' };

// Initial State
const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

// Cart Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_CART':
      return { ...state, cart: null, error: null };
    default:
      return state;
  }
};

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Props
interface CartProviderProps {
  children: ReactNode;
}

// Storage Keys
const CART_ID_KEY = '@alorian_cart_id';

// Cart Provider Component
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Initialize cart on app start
  useEffect(() => {
    initializeCart();
  }, []);

  // Initialize cart from storage or create new one
  const initializeCart = async () => {
    try {
      console.log('CartContext: Starting cart initialization...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Try to get existing cart ID from storage
      const storedCartId = await AsyncStorage.getItem(CART_ID_KEY);
      console.log('CartContext: Found stored cart ID:', storedCartId);
      
      if (storedCartId) {
        // Try to fetch existing cart
        try {
          const existingCart = await shopifyApi.getCart(storedCartId);
          if (existingCart) {
            console.log('CartContext: Successfully loaded existing cart');
            dispatch({ type: 'SET_CART', payload: existingCart });
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }
        } catch (cartError) {
          console.log('CartContext: Existing cart not found or invalid, creating new cart');
          // Clear invalid cart ID
          await AsyncStorage.removeItem(CART_ID_KEY);
        }
      }
      
      // Create new cart if no existing cart found or if API fails
      try {
        console.log('CartContext: Creating new cart...');
        const newCart = await shopifyApi.createCart();
        await AsyncStorage.setItem(CART_ID_KEY, newCart.id);
        console.log('CartContext: New cart created successfully');
        dispatch({ type: 'SET_CART', payload: newCart });
      } catch (createError) {
        console.error('CartContext: Failed to create cart, using offline mode:', createError);
        // Set a minimal cart structure for offline mode
        const offlineCart: Cart = {
          id: 'offline-cart',
          checkoutUrl: '',
          totalQuantity: 0,
          estimatedCost: {
            totalAmount: { amount: '0.00', currencyCode: 'USD' },
            subtotalAmount: { amount: '0.00', currencyCode: 'USD' }
          },
          lines: { edges: [] }
        };
        dispatch({ type: 'SET_CART', payload: offlineCart });
      }
    } catch (error) {
      console.error('CartContext: Error initializing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Cart temporarily unavailable' });
      // Set a fallback cart to prevent loading state indefinitely
      const fallbackCart: Cart = {
        id: 'fallback-cart',
        checkoutUrl: '',
        totalQuantity: 0,
        estimatedCost: {
          totalAmount: { amount: '0.00', currencyCode: 'USD' },
          subtotalAmount: { amount: '0.00', currencyCode: 'USD' }
        },
        lines: { edges: [] }
      };
      dispatch({ type: 'SET_CART', payload: fallbackCart });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      console.log('CartContext: Cart initialization finished');
    }
  };

  // Add item to cart
  const addToCart = async (merchandiseId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (!state.cart) {
        throw new Error('Cart not initialized');
      }

      const lines: CartLineInput[] = [{ merchandiseId, quantity }];
      const updatedCart = await shopifyApi.addToCart(state.cart.id, lines);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update cart line quantity
  const updateCartLine = async (lineId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (!state.cart) {
        throw new Error('Cart not initialized');
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        await removeFromCart(lineId);
        return;
      }

      const lines: CartLineUpdateInput[] = [{ id: lineId, quantity }];
      const updatedCart = await shopifyApi.updateCartLines(state.cart.id, lines);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      console.error('Error updating cart line:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Remove item from cart
  const removeFromCart = async (lineId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (!state.cart) {
        throw new Error('Cart not initialized');
      }

      const updatedCart = await shopifyApi.removeFromCart(state.cart.id, [lineId]);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Create a new empty cart
      const newCart = await shopifyApi.createCart();
      await AsyncStorage.setItem(CART_ID_KEY, newCart.id);
      dispatch({ type: 'SET_CART', payload: newCart });
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh cart data
  const refreshCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (!state.cart) {
        await initializeCart();
        return;
      }

      const refreshedCart = await shopifyApi.getCart(state.cart.id);
      dispatch({ type: 'SET_CART', payload: refreshedCart });
    } catch (error) {
      console.error('Error refreshing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Get total number of items in cart
  const getCartItemCount = (): number => {
    if (!state.cart) return 0;
    return state.cart.totalQuantity;
  };

  // Get cart total amount
  const getCartTotal = (): number => {
    if (!state.cart || !state.cart.estimatedCost || !state.cart.estimatedCost.totalAmount) return 0;
    return parseFloat(state.cart.estimatedCost.totalAmount.amount || '0');
  };

  // Context value
  const contextValue: CartContextType = {
    cart: state.cart,
    isLoading: state.isLoading,
    error: state.error,
    addToCart,
    updateCartLine,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartItemCount,
    getCartTotal,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
