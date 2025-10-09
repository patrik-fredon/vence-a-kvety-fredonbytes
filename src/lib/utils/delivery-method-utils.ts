/**
 * Utility functions for handling delivery method data
 */

import type { CartItem } from "@/types/cart";

/**
 * Extract delivery method from cart items
 * 
 * @param items - Cart items to extract delivery method from
 * @returns Delivery method ('delivery' | 'pickup') or null if not found
 */
export function getDeliveryMethodFromCart(
  items: CartItem[]
): "delivery" | "pickup" | null {
  for (const item of items) {
    const deliveryCustomization = item.customizations?.find(
      (c) => c.optionId === "delivery_method"
    );
    
    if (deliveryCustomization && deliveryCustomization.choiceIds.length > 0) {
      const choiceId = deliveryCustomization.choiceIds[0];
      if (choiceId === "delivery_address") return "delivery";
      if (choiceId === "personal_pickup") return "pickup";
    }
  }
  
  return null;
}

/**
 * Get pickup location information
 * This would typically come from a configuration or database
 * For now, returning a default value
 * 
 * @returns Pickup location address
 */
export function getPickupLocation(): string {
  // TODO: Make this configurable via environment variables or database
  return "Company Address, Prague";
}

/**
 * Validate that delivery method is present in cart items
 * 
 * @param items - Cart items to validate
 * @returns True if delivery method is present, false otherwise
 */
export function hasDeliveryMethod(items: CartItem[]): boolean {
  return getDeliveryMethodFromCart(items) !== null;
}
