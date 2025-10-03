/**
 * Cart image resolution utilities
 * Handles image URL resolution with fallback chain for cart items
 */

import type { CartItem } from "@/types/cart";
import type { ProductImage } from "@/types/product";

/**
 * Result of image resolution with metadata
 */
export interface CartItemImageResolution {
  url: string | null;
  alt: string;
  isPrimary: boolean;
  fallbackUsed: boolean;
}

/**
 * Resolves the best image to display for a cart item
 * Priority: primary image → first image → null (for placeholder)
 *
 * @param item - The cart item to resolve image for
 * @param locale - Current locale for alt text
 * @returns Image resolution result with metadata
 */
export function resolveCartItemImage(
  item: CartItem,
  locale: string = "cs"
): CartItemImageResolution {
  // Default result for missing product data
  const defaultResult: CartItemImageResolution = {
    url: null,
    alt: "Product image",
    isPrimary: false,
    fallbackUsed: true,
  };

  // Check if product and images exist
  if (!item.product?.images || item.product.images.length === 0) {
    return {
      ...defaultResult,
      alt:
        item.product?.name?.[locale as keyof typeof item.product.name] ||
        item.product?.name?.cs ||
        "Product",
    };
  }

  const images = item.product.images;

  // Try to find explicitly marked primary image
  const primaryImage = images.find((img: ProductImage) => img.isPrimary);
  if (primaryImage?.url) {
    return {
      url: primaryImage.url,
      alt:
        primaryImage.alt ||
        item.product.name?.[locale as keyof typeof item.product.name] ||
        item.product.name?.cs ||
        "Product",
      isPrimary: true,
      fallbackUsed: false,
    };
  }

  // Fallback to first available image
  const firstImage = images[0];
  if (firstImage?.url) {
    return {
      url: firstImage.url,
      alt:
        firstImage.alt ||
        item.product.name?.[locale as keyof typeof item.product.name] ||
        item.product.name?.cs ||
        "Product",
      isPrimary: false,
      fallbackUsed: false,
    };
  }

  // No valid images found
  return {
    ...defaultResult,
    alt:
      item.product.name?.[locale as keyof typeof item.product.name] ||
      item.product.name?.cs ||
      "Product",
  };
}
