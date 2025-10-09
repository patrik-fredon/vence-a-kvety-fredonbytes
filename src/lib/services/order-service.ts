/**
 * Order service with cache invalidation
 * Handles order operations with proper cache management
 */

import { invalidateCacheByEvent } from "@/lib/cache/cache-invalidation";
import { orderUtils } from "@/lib/supabase/utils";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

/**
 * Update order status with cache invalidation
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  internalNotes?: string
) {
  try {
    // Update order in database
    const result = await orderUtils.updateOrderStatus(orderId, status, internalNotes);

    // Invalidate caches based on status
    if (status === "confirmed" || status === "delivered") {
      // Order is completed, invalidate related caches
      await invalidateCacheByEvent("order.completed", { orderId });
    }

    return result;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

/**
 * Create order with cache invalidation
 */
export async function createOrder(orderData: any) {
  try {
    // Create order in database
    const result = await orderUtils.createOrder(orderData);

    // Invalidate cart cache for the user/session
    if (result.data) {
      await invalidateCacheByEvent("order.completed", {
        orderId: result.data.id,
        userId: orderData.user_id,
        sessionId: orderData.session_id,
      });
    }

    return result;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string) {
  try {
    return await orderUtils.getOrderById(orderId);
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
}

/**
 * Get orders by user ID
 */
export async function getOrdersByUserId(userId: string) {
  try {
    return await orderUtils.getUserOrders(userId);
  } catch (error) {
    console.error("Error getting user orders:", error);
    throw error;
  }
}
