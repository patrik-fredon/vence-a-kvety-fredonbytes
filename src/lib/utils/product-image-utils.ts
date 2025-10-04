/**
 * Product image resolution utilities
 * Handles primary image resolution with fallback chain for product display
 */

import type { Product, ProductImage } from "@/types/product";

/**
 * Result of product image resolution with metadata
 */
export interface ProductImageResolution {
  url: string;
  alt: string;
  isPrimary: boolean;
  fallbackUsed: boolean;
}

/**
 * Resolves the primary image to display for a product
 * Priority: primary image → first image → placeholder
 *
 * @param product - The product to resolve image for
 * @param locale - Current locale for alt text (default: "cs")
 * @returns Image resolution result with metadata
 */
export function resolvePrimaryProductImage(
  product: Product,
  locale: string = "cs"
): ProductImageResolution {
  const placeholderUrl = "/placeholder-product.jpg";

  // Get product name for alt text
  const productName =
    product.name?.[locale as keyof typeof product.name] ||
    product.name?.cs ||
    product.nameCs ||
    "Product";

  // Check if product has images
  if (!product.images || product.images.length === 0) {
    return {
      url: placeholderUrl,
      alt: productName,
      isPrimary: false,
      fallbackUsed: true,
    };
  }

  // Try to find explicitly marked primary image
  const primaryImage = product.images.find((img: ProductImage) => img.isPrimary);
  if (primaryImage?.url) {
    return {
      url: primaryImage.url,
      alt: primaryImage.alt || productName,
      isPrimary: true,
      fallbackUsed: false,
    };
  }

  // Fallback to first available image
  const firstImage = product.images[0];
  if (firstImage?.url) {
    return {
      url: firstImage.url,
      alt: firstImage.alt || productName,
      isPrimary: false,
      fallbackUsed: false,
    };
  }

  // No valid images found, use placeholder
  return {
    url: placeholderUrl,
    alt: productName,
    isPrimary: false,
    fallbackUsed: true,
  };
}
