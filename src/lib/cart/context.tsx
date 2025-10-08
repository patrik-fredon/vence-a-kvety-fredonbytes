"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useAuthContext } from "@/components/auth";
import { supabase } from "@/lib/supabase/client";
import type { AddToCartRequest, CartItem, CartState, CartSummary } from "@/types/cart";
import {
  CartConflictResolver,
  CartPersistenceManager,
  type CartSyncEvent,
  CartSyncManager,
} from "./realtime-sync";
import {
  generateCartSessionId,
  getCartSessionId,
  setCartSessionId,
  validateConditionalCustomizations,
} from "./utils";

// Enhanced cart actions with optimistic updates
type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CART"; payload: CartSummary }
  | { type: "CLEAR_CART" }
  | { type: "SET_LAST_UPDATED"; payload: Date }
  | { type: "OPTIMISTIC_ADD_ITEM"; payload: { item: CartItem; tempId: string } }
  | {
      type: "OPTIMISTIC_UPDATE_QUANTITY";
      payload: { itemId: string; quantity: number };
    }
  | { type: "OPTIMISTIC_REMOVE_ITEM"; payload: { itemId: string } }
  | { type: "REVERT_OPTIMISTIC"; payload: { tempId?: string; itemId?: string } }
  | {
      type: "CONFIRM_OPTIMISTIC";
      payload: { tempId?: string; actualItem?: CartItem };
    }
  | { type: "SET_SYNCING"; payload: boolean };

// Enhanced cart context type
interface CartContextType {
  state: CartState;
  addToCart: (request: AddToCartRequest) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
  clearAllItems: () => Promise<boolean>;
  syncWithServer: () => Promise<void>;
  isOnline: boolean;
  isRealTimeEnabled: boolean;
  enableRealTime: () => void;
  disableRealTime: () => void;
  getCartVersion: () => number;
  runIntegrityCheck: () => Promise<any>;
}

// Enhanced initial state
const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  isSyncing: false,
  optimisticUpdates: new Map(),
};

// Enhanced cart reducer with optimistic updates
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "SET_CART":
      return {
        ...state,
        items: action.payload.items,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        optimisticUpdates: new Map(), // Clear optimistic updates when server data arrives
      };
    case "CLEAR_CART":
      return { ...initialState };
    case "SET_LAST_UPDATED":
      return { ...state, lastUpdated: action.payload };
    case "SET_SYNCING":
      return { ...state, isSyncing: action.payload };
    case "OPTIMISTIC_ADD_ITEM": {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.set(action.payload.tempId, {
        type: "add",
        item: action.payload.item,
      });
      return {
        ...state,
        items: [...state.items, action.payload.item],
        optimisticUpdates: newOptimisticUpdates,
        lastUpdated: new Date(),
      };
    }
    case "OPTIMISTIC_UPDATE_QUANTITY": {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.set(action.payload.itemId, {
        type: "update",
        originalQuantity:
          state.items.find((item) => item.id === action.payload.itemId)?.quantity || 0,
      });
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId
            ? {
                ...item,
                quantity: action.payload.quantity,
                totalPrice: (item.unitPrice || 0) * action.payload.quantity,
              }
            : item
        ),
        optimisticUpdates: newOptimisticUpdates,
        lastUpdated: new Date(),
      };
    }
    case "OPTIMISTIC_REMOVE_ITEM": {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      const itemToRemove = state.items.find((item) => item.id === action.payload.itemId);
      if (itemToRemove) {
        newOptimisticUpdates.set(action.payload.itemId, {
          type: "remove",
          originalItem: itemToRemove,
        });
      }
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.itemId),
        optimisticUpdates: newOptimisticUpdates,
        lastUpdated: new Date(),
      };
    }
    case "REVERT_OPTIMISTIC": {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      const updateKey = action.payload.tempId || action.payload.itemId;

      if (updateKey && newOptimisticUpdates.has(updateKey)) {
        const update = newOptimisticUpdates.get(updateKey);
        newOptimisticUpdates.delete(updateKey);

        if (update?.type === "add" && action.payload.tempId) {
          // Remove optimistically added item
          return {
            ...state,
            items: state.items.filter((item) => item.id !== action.payload.tempId),
            optimisticUpdates: newOptimisticUpdates,
          };
        } else if (update?.type === "update" && action.payload.itemId) {
          // Revert quantity update
          return {
            ...state,
            items: state.items.map((item) =>
              item.id === action.payload.itemId
                ? {
                    ...item,
                    quantity: update.originalQuantity || 0,
                    totalPrice: (item.unitPrice || 0) * (update.originalQuantity || 0),
                  }
                : item
            ),
            optimisticUpdates: newOptimisticUpdates,
          };
        } else if (update?.type === "remove" && update.originalItem) {
          // Restore removed item
          return {
            ...state,
            items: [...state.items, update.originalItem],
            optimisticUpdates: newOptimisticUpdates,
          };
        }
      }
      return { ...state, optimisticUpdates: newOptimisticUpdates };
    }
    case "CONFIRM_OPTIMISTIC": {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      const updateKey = action.payload.tempId;

      if (updateKey && newOptimisticUpdates.has(updateKey)) {
        newOptimisticUpdates.delete(updateKey);

        // If we have an actual item from server, replace the optimistic one
        if (action.payload.actualItem && action.payload.tempId) {
          return {
            ...state,
            items: state.items.map((item) =>
              item.id === action.payload.tempId ? action.payload.actualItem! : item
            ),
            optimisticUpdates: newOptimisticUpdates,
          };
        }
      }
      return { ...state, optimisticUpdates: newOptimisticUpdates };
    }
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
  const { user, loading } = useAuthContext();
  // Removed unused _syncTimeoutRef
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const [isOnline, setIsOnline] = useState(true);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [cartVersion, setCartVersion] = useState(Date.now());
  const syncManagerRef = useRef<CartSyncManager | null>(null);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync when coming back online
      syncWithServer();
      // Reconnect real-time sync if enabled
      if (isRealTimeEnabled && syncManagerRef.current) {
        syncManagerRef.current.connect();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      // Disconnect real-time sync
      if (syncManagerRef.current) {
        syncManagerRef.current.disconnect();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isRealTimeEnabled]); // syncWithServer is stable via useCallback

  // Enhanced fetch cart with retry logic
  const fetchCart = useCallback(
    async (retryCount = 0): Promise<boolean> => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const response = await fetch("/api/cart", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch cart: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          dispatch({ type: "SET_CART", payload: data.cart });
          retryCountRef.current = 0; // Reset retry count on success
          return true;
        } else {
          throw new Error(data.error || "Failed to fetch cart");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);

        // Retry logic for network errors
        if (retryCount < maxRetries && isOnline) {
          const delay = 2 ** retryCount * 1000; // Exponential backoff
          setTimeout(() => fetchCart(retryCount + 1), delay);
          return false;
        }

        dispatch({ type: "SET_ERROR", payload: "Failed to fetch cart" });
        return false;
      }
    },
    [isOnline]
  );

  // Enhanced add item to cart with optimistic updates
  const addToCart = useCallback(
    async (request: AddToCartRequest): Promise<boolean> => {
      // Validate conditional customizations before processing
      if (request.customizations && request.customizations.length > 0) {
        // Note: We would need product customization options for full validation
        // This is a basic validation that ensures customizations are properly structured
        const basicValidation = validateConditionalCustomizations(
          request.customizations,
          [] // We don't have customization options here, but the function handles empty array
        );

        if (!basicValidation.isValid) {
          dispatch({
            type: "SET_ERROR",
            payload: "Invalid customization configuration",
          });
          return false;
        }
      }

      // Generate temporary ID for optimistic update
      const tempId = `temp_${Date.now()}_${Math.random()}`;

      // Create optimistic cart item
      const optimisticItem: CartItem = {
        id: tempId,
        productId: request.productId,
        quantity: request.quantity,
        customizations: request.customizations,
        unitPrice: 0, // Will be calculated by server
        totalPrice: 0, // Will be calculated by server
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Apply optimistic update immediately
      dispatch({
        type: "OPTIMISTIC_ADD_ITEM",
        payload: { item: optimisticItem, tempId },
      });

      try {
        // Ensure we have a session ID for guest users
        let sessionId = getCartSessionId();
        if (!(user || sessionId)) {
          sessionId = generateCartSessionId();
          setCartSessionId(sessionId);
        }

        const response = await fetch("/api/cart/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(request),
        });

        const data = await response.json();

        if (data.success) {
          // Confirm optimistic update with actual server data
          dispatch({
            type: "CONFIRM_OPTIMISTIC",
            payload: { tempId, actualItem: data.item },
          });

          // Refresh cart to get updated totals and product details
          await fetchCart();
          return true;
        } else {
          // Revert optimistic update on failure
          dispatch({
            type: "REVERT_OPTIMISTIC",
            payload: { tempId },
          });
          dispatch({
            type: "SET_ERROR",
            payload: data.error || "Failed to add item to cart",
          });
          return false;
        }
      } catch (error) {
        console.error("Error adding to cart:", error);

        // Revert optimistic update on error
        dispatch({
          type: "REVERT_OPTIMISTIC",
          payload: { tempId },
        });

        // Store failed operation for retry when online
        if (!isOnline) {
          dispatch({
            type: "SET_ERROR",
            payload: "No internet connection. Changes will sync when online.",
          });
          // TODO: Store in localStorage for offline sync
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: "Failed to add item to cart",
          });
        }
        return false;
      }
    },
    [fetchCart, user, isOnline]
  );

  // Enhanced remove item from cart with optimistic updates
  const removeItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      // Apply optimistic update immediately
      dispatch({
        type: "OPTIMISTIC_REMOVE_ITEM",
        payload: { itemId },
      });

      try {
        const response = await fetch(`/api/cart/items/${itemId}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          // Confirm optimistic update
          dispatch({
            type: "CONFIRM_OPTIMISTIC",
            payload: { tempId: itemId },
          });

          // Check if cart becomes empty after removal
          const remainingItems = state.items.filter((item) => item.id !== itemId);

          if (remainingItems.length === 0) {
            console.log("🧹 [Cart] Cart is now empty, clearing cache and localStorage");

            // Clear LocalStorage completely when cart becomes empty
            CartPersistenceManager.clearCartState();

            // Call explicit cache clear endpoint when cart becomes empty
            try {
              const cacheResponse = await fetch("/api/cart/clear-cache", {
                method: "POST",
                credentials: "include",
              });

              const cacheData = await cacheResponse.json();

              if (cacheData.success) {
                console.log("✅ [Cart] Cache cleared successfully for empty cart");
              } else {
                console.warn("⚠️ [Cart] Cache clear failed (non-critical):", cacheData.error);
              }
            } catch (cacheError) {
              console.error("⚠️ [Cart] Error clearing cache (non-critical):", cacheError);
              // Don't fail the operation if cache clearing fails
            }
          }

          // Refresh cart to get updated totals
          await fetchCart();
          return true;
        } else {
          // Revert optimistic update on failure
          dispatch({
            type: "REVERT_OPTIMISTIC",
            payload: { itemId },
          });
          dispatch({
            type: "SET_ERROR",
            payload: data.error || "Failed to remove item",
          });
          return false;
        }
      } catch (error) {
        console.error("Error removing cart item:", error);

        // Revert optimistic update on error
        dispatch({
          type: "REVERT_OPTIMISTIC",
          payload: { itemId },
        });

        if (!isOnline) {
          dispatch({
            type: "SET_ERROR",
            payload: "No internet connection. Changes will sync when online.",
          });
        } else {
          dispatch({ type: "SET_ERROR", payload: "Failed to remove item" });
        }
        return false;
      }
    },
    [fetchCart, isOnline, state.items]
  );

  // Enhanced update item quantity with optimistic updates
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<boolean> => {
      // Handle removal case
      if (quantity <= 0) {
        return removeItem(itemId);
      }

      // Apply optimistic update immediately
      dispatch({
        type: "OPTIMISTIC_UPDATE_QUANTITY",
        payload: { itemId, quantity },
      });

      try {
        const response = await fetch(`/api/cart/items/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ quantity }),
        });

        const data = await response.json();

        if (data.success) {
          // Confirm optimistic update
          dispatch({
            type: "CONFIRM_OPTIMISTIC",
            payload: { tempId: itemId },
          });

          // Refresh cart to get updated totals
          await fetchCart();
          return true;
        } else {
          // Revert optimistic update on failure
          dispatch({
            type: "REVERT_OPTIMISTIC",
            payload: { itemId },
          });
          dispatch({
            type: "SET_ERROR",
            payload: data.error || "Failed to update item",
          });
          return false;
        }
      } catch (error) {
        console.error("Error updating cart item:", error);

        // Revert optimistic update on error
        dispatch({
          type: "REVERT_OPTIMISTIC",
          payload: { itemId },
        });

        if (!isOnline) {
          dispatch({
            type: "SET_ERROR",
            payload: "No internet connection. Changes will sync when online.",
          });
        } else {
          dispatch({ type: "SET_ERROR", payload: "Failed to update item" });
        }
        return false;
      }
    },
    [fetchCart, isOnline, removeItem]
  );

  // Clear cart (local state only)
  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  // Clear all items from cart (server + cache + local state)
  const clearAllItems = useCallback(async (): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch("/api/cart/clear", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        console.log("🧹 [Cart] Clearing all items, removing cache and localStorage");

        // Clear local state
        dispatch({ type: "CLEAR_CART" });

        // Clear LocalStorage completely when cart is cleared
        CartPersistenceManager.clearCartState();

        // Call explicit cache clear endpoint after DELETE all API
        try {
          const cacheResponse = await fetch("/api/cart/clear-cache", {
            method: "POST",
            credentials: "include",
          });

          const cacheData = await cacheResponse.json();

          if (cacheData.success) {
            console.log("✅ [Cart] Cache cleared successfully after clearing all items");
          } else {
            console.warn("⚠️ [Cart] Cache clear failed (non-critical):", cacheData.error);
          }
        } catch (cacheError) {
          console.error("⚠️ [Cart] Error clearing cache (non-critical):", cacheError);
          // Don't fail the operation if cache clearing fails
        }

        // Refresh cart to confirm empty state
        await fetchCart();

        return true;
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: data.error || "Failed to clear cart",
        });
        return false;
      }
    } catch (error) {
      console.error("Error clearing all cart items:", error);

      if (!isOnline) {
        dispatch({
          type: "SET_ERROR",
          payload: "No internet connection. Changes will sync when online.",
        });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to clear cart",
        });
      }
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [fetchCart, isOnline]);

  // Refresh cart
  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // Sync with server (for conflict resolution and offline sync)
  const syncWithServer = useCallback(async () => {
    if (!isOnline) return;

    dispatch({ type: "SET_SYNCING", payload: true });

    try {
      // Get current server state
      const response = await fetch("/api/cart", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Check for conflicts with local state
          const resolution = CartConflictResolver.resolveConflicts(
            {
              items: state.items,
              itemCount: state.items.length,
              subtotal: state.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
              total: state.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
            },
            data.cart,
            "merge"
          );

          // Apply resolved state
          dispatch({ type: "SET_CART", payload: resolution.resolvedCart });
          setCartVersion(Date.now());

          // Save to persistence
          CartPersistenceManager.saveCartState(resolution.resolvedCart, cartVersion);

          // Log conflicts if any
          if (resolution.conflicts.length > 0) {
          }
        }
      }
    } catch (error) {
      console.error("Error syncing with server:", error);
    } finally {
      dispatch({ type: "SET_SYNCING", payload: false });
    }
  }, [isOnline, state.items, cartVersion]);

  // Periodic sync to detect server-side changes
  useEffect(() => {
    if (!isOnline || loading) return;

    const syncInterval = setInterval(() => {
      // Only sync if no optimistic updates are pending
      if (state.optimisticUpdates?.size === 0) {
        syncWithServer();
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [syncWithServer, isOnline, loading, state.optimisticUpdates?.size]);

  // Load cart on mount and when auth state changes
  useEffect(() => {
    if (!loading) {
      fetchCart();
    }
  }, [loading, fetchCart]);

  // Real-time synchronization management
  const enableRealTime = useCallback(() => {
    if (!isOnline || isRealTimeEnabled) return;

    const sessionId = getCartSessionId();
    syncManagerRef.current = new CartSyncManager(user?.id, sessionId || undefined);

    // Handle real-time cart updates
    syncManagerRef.current.on("sync", (event: CartSyncEvent) => {
      if (event.source === "remote") {
        // Apply remote changes
        syncWithServer();
      }
    });

    syncManagerRef.current.connect().then((connected) => {
      if (connected) {
        setIsRealTimeEnabled(true);
      }
    });
  }, [isOnline, isRealTimeEnabled, user?.id, syncWithServer]);

  const disableRealTime = useCallback(() => {
    if (syncManagerRef.current) {
      syncManagerRef.current.disconnect();
      syncManagerRef.current = null;
    }
    setIsRealTimeEnabled(false);
  }, []);

  const getCartVersion = useCallback(() => cartVersion, [cartVersion]);
  const runIntegrityCheck = useCallback(async (): Promise<any> => {
    try {
      const { performCustomizationIntegrityCheck } = await import("@/lib/cart/utils");
      const supabaseClient = supabase;

      const result = await performCustomizationIntegrityCheck(supabaseClient);

      // Log integrity check results
      console.log("Cart integrity check completed:", result);

      return result;
    } catch (error) {
      console.error("Cart integrity check failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        issues: [],
        fixedItems: [],
        summary: {
          totalCartItems: 0,
          itemsWithCustomizations: 0,
          issuesFound: 1,
          issuesFixed: 0,
        },
      };
    }
  }, []);

  // Persist cart state to localStorage for offline support with versioning
  useEffect(() => {
    if (state.items.length > 0) {
      const cartSummary: CartSummary = {
        items: state.items,
        itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: state.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
        total: state.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
      };
      CartPersistenceManager.saveCartState(cartSummary, cartVersion);
    }
  }, [state.items, cartVersion]);

  // Restore cart from localStorage on mount if needed with version checking
  useEffect(() => {
    if (state.items.length === 0 && !loading) {
      const persistedState = CartPersistenceManager.loadCartState();
      if (persistedState) {
        dispatch({
          type: "SET_CART",
          payload: persistedState.cart,
        });
        setCartVersion(persistedState.version);
      }
    }
  }, [loading, state.items.length]);

  // Cleanup real-time sync on unmount
  useEffect(() => {
    return () => {
      if (syncManagerRef.current) {
        syncManagerRef.current.disconnect();
      }
    };
  }, []);

  const contextValue: CartContextType = {
    state,
    addToCart,
    updateQuantity,
    removeItem,
    refreshCart,
    clearCart,
    clearAllItems,
    syncWithServer,
    isOnline,
    isRealTimeEnabled,
    enableRealTime,
    disableRealTime,
    getCartVersion,
    runIntegrityCheck,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
