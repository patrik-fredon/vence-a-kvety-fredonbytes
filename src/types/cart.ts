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

// Cart state for client-side management
export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
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
  created_at: string;
  updated_at: string;
}
