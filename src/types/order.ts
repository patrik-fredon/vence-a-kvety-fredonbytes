/**
 * Order-related type definitions for the funeral wreaths e-commerce platform
 */

import type { CartItem } from "./cart";
import type { DeliveryTimeSlot, DeliveryUrgency } from "./delivery";
import type { Address, BaseEntity, ContactInfo } from "./index";

// Order status types
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "stripe";

// Customer information for checkout
export interface CustomerInfo extends ContactInfo {
  firstName: string;
  lastName: string;
  company?: string;
  note?: string;
}

// Delivery information for checkout
export interface DeliveryInfo {
  address: Address;
  urgency: DeliveryUrgency;
  preferredDate?: Date;
  preferredTimeSlot?: DeliveryTimeSlot;
  specialInstructions?: string;
  recipientName?: string;
  recipientPhone?: string;
}

// Payment information
export interface PaymentInfo {
  method: PaymentMethod;
  amount: number;
  currency: string;
  transactionId: string | undefined;
  status: PaymentStatus;
  processedAt: Date | undefined;
  failureReason: string | undefined;
}

// Order item (similar to cart item but for completed orders)
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations: any[]; // JSON data
  productSnapshot?: any; // Snapshot of product at time of order
}

// Main Order interface
export interface Order extends BaseEntity {
  orderNumber: string;
  userId?: string;
  sessionId?: string;

  // Order details
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  deliveryCost: number;
  totalAmount: number;

  // Customer and delivery info
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  paymentInfo: PaymentInfo;

  // Status and tracking
  status: OrderStatus;
  notes?: string;
  internalNotes?: string;

  // Timestamps
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

// Checkout form data structure
export interface CheckoutFormData {
  customerInfo: Partial<CustomerInfo>;
  deliveryInfo: Partial<DeliveryInfo>;
  paymentMethod?: PaymentMethod;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

// Checkout step types
export type CheckoutStep = "customer" | "delivery" | "payment" | "review";

// Checkout state management
export interface CheckoutState {
  currentStep: CheckoutStep;
  formData: CheckoutFormData;
  isSubmitting: boolean;
  errors: CheckoutValidationErrors;
  deliveryCost: number;
  estimatedDeliveryDate?: Date;
}

// API request/response types
export interface CreateOrderRequest {
  items: CartItem[];
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  paymentMethod: PaymentMethod;
  agreeToTerms: boolean;
}

export interface CreateOrderResponse {
  success: boolean;
  order?: Order;
  paymentUrl?: string;
  error?: string;
}

export interface OrderSummary {
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  deliveryCost: number;
  totalAmount: number;
  estimatedDeliveryDate?: Date;
}

// Form validation types
export interface CheckoutValidationErrors {
  customerInfo?: Partial<Record<keyof CustomerInfo, string>>;
  deliveryInfo?: Partial<Record<keyof DeliveryInfo, string>>;
  general?: string[];
}

// Database row type (matching Supabase schema)
export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  session_id: string | null;
  items: any; // JSONB
  item_count: number;
  subtotal: number;
  delivery_cost: number;
  total_amount: number;
  customer_info: any; // JSONB
  delivery_info: any; // JSONB
  payment_info: any; // JSONB
  status: OrderStatus;
  notes: string | null;
  internal_notes: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}
