'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CartState, CartSummary, AddToCartRequest } from '@/types/cart';
import { useSession } from 'next-auth/react';

// Cart actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: CartSummary }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LAST_UPDATED'; payload: Date };

// Cart context type
interface CartContextType {
  state: CartState;
  addToCart: (request: AddToCartRequest) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

// Initial state
const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  lastUpdated: null
};

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      };
    case 'CLEAR_CART':
      return { ...initialState };
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };
    default:
      return state;
  }
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { data: session, status } = useSession();

  // Fetch cart data from API
  const fetchCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/cart', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'SET_CART', payload: data.cart });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Failed to fetch cart' });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch cart' });
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(async (request: AddToCartRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (data.success) {
        // Refresh cart after adding item
        await fetchCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Failed to add item to cart' });
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
      return false;
    }
  }, [fetchCart]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh cart after updating
        await fetchCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Failed to update item' });
        return false;
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update item' });
      return false;
    }
  }, [fetchCart]);

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Refresh cart after removing item
        await fetchCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Failed to remove item' });
        return false;
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item' });
      return false;
    }
  }, [fetchCart]);

  // Clear cart
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Refresh cart
  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // Load cart on mount and when session changes
  useEffect(() => {
    if (status !== 'loading') {
      fetchCart();
    }
  }, [status, fetchCart]);

  const contextValue: CartContextType = {
    state,
    addToCart,
    updateQuantity,
    removeItem,
    refreshCart,
    clearCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
