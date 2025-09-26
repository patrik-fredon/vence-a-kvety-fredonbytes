/**
 * Shopping cart type definitions for the funeral wreaths e-commerce platform
 */

import type { BaseEntity } from "./index";
import type { Customization, Product } from "./product";

// Cart item interface
export interface CartItem extends BaseEntity {
  userId?: string;
  sessionId?: string;
  productId: string;
  quantity: number;
  customizations: Customization[];

  // Computed fields (populated when fetching)
  product?: Product;
  unitPrice?: number;
  totalPrice?: number;
}

// Cart summary interface
export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  estimatedDeliveryDate?: Date;
}

// Cart state for client-side management with optimistic updates
export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isSyncing?: boolean;
  optimisticUpdates?: Map<string, OptimisticUpdate>;
  version?: number;
  conflictResolution?: "auto" | "manual";
}

// Optimistic update tracking
export interface OptimisticUpdate {
  type: "add" | "update" | "remove";
  item?: CartItem;
  originalItem?: CartItem;
  originalQuantity?: number;
}

// API request types
export interface AddToCartRequest {
  productId: string;
  quantity: number;
  customizations: Customization[];
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartItemResponse {
  success: boolean;
  item?: CartItem;
  error?: string;
}

export interface CartResponse {
  success: boolean;
  cart?: CartSummary;
  error?: string;
}

// Database row type (matching Supabase schema)
export interface CartItemRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  quantity: number;
  customizations: any; // JSONB
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

// Real-time synchronization types
export interface CartSyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  conflictsDetected: number;
}

export interface CartMetrics {
  totalItems: number;
  totalValue: number;
  averageItemValue: number;
  lastActivity: Date | null;
  sessionDuration: number;
}
