/**
 * Stripe Price ID selector utility
 * Handles dynamic price selection based on product customizations
 */

import type { Product, Customization } from "@/types/product";

/**
 * Size-specific Stripe price mappings for products with multiple sizes
 */
const SIZE_PRICE_MAPPINGS: Record<string, Record<string, string>> = {
  "Plné srdce": {
    "180": "price_1SG7zIK7X9a6rKGIgz3jZth1",
    "150": "price_1SG7yxK7X9a6rKGIZIwpsJQD",
    "120": "price_1SG7yUK7X9a6rKGI5qDGMWbh",
  },
  "Kulatý věnec": {
    "180": "price_1SG7viK7X9a6rKGILiN2x5Tx",
    "150": "price_1SG7viK7X9a6rKGI9D5n7WcY",
    "120": "price_1SG7viK7X9a6rKGIqhLP1Byz",
  },
};

/**
 * Gets the appropriate Stripe price ID for a product based on customizations
 *
 * @param product - The product to get the price ID for
 * @param customizations - Array of customizations applied to the product
 * @returns The Stripe price ID to use for checkout
 *
 * @example
 * ```typescript
 * const priceId = getStripePriceId(product, [
 *   { optionId: 'size', choiceIds: ['180'], customValue: '180' }
 * ]);
 * ```
 */
export function getStripePriceId(
  product: Product,
  customizations: Customization[] = []
): string {
  // Check if product has size-specific pricing
  const productName = product.nameCs;
  const sizePrices = SIZE_PRICE_MAPPINGS[productName];

  if (sizePrices) {
    // Find size customization
    const sizeCustomization = customizations.find(
      (c) => c.optionId === "size" || c.customValue
    );

    if (sizeCustomization?.customValue) {
      const size = sizeCustomization.customValue;
      const priceId = sizePrices[size];

      if (priceId) {
        return priceId;
      }
    }

    // Default to base size (120) if no size specified
    const defaultPriceId = sizePrices["120"];
    if (!defaultPriceId) {
      throw new Error(
        `Product ${product.nameCs} is missing default size (120) price ID`
      );
    }
    return defaultPriceId;
  }

  // For products without size variations, return the default price_id
  if (!product.stripePriceId) {
    throw new Error(
      `Product ${product.nameCs} (${product.id}) is missing Stripe price ID`
    );
  }

  return product.stripePriceId;
}

/**
 * Gets the Stripe product ID for a product
 *
 * @param product - The product to get the product ID for
 * @returns The Stripe product ID
 * @throws Error if product doesn't have a Stripe product ID
 */
export function getStripeProductId(product: Product): string {
  if (!product.stripeProductId) {
    throw new Error(
      `Product ${product.nameCs} (${product.id}) is missing Stripe product ID`
    );
  }

  return product.stripeProductId;
}

/**
 * Validates that a product has the required Stripe IDs
 *
 * @param product - The product to validate
 * @returns True if product has required Stripe IDs
 */
export function hasStripeIds(product: Product): boolean {
  return Boolean(product.stripeProductId && product.stripePriceId);
}

/**
 * Gets all available price IDs for a product (including size variations)
 *
 * @param product - The product to get price IDs for
 * @returns Array of available Stripe price IDs
 */
export function getAvailablePriceIds(product: Product): string[] {
  const priceIds: string[] = [];

  // Add base price ID
  if (product.stripePriceId) {
    priceIds.push(product.stripePriceId);
  }

  // Add size-specific price IDs if available
  const productName = product.nameCs;
  const sizePrices = SIZE_PRICE_MAPPINGS[productName];

  if (sizePrices) {
    priceIds.push(...Object.values(sizePrices));
  }

  return [...new Set(priceIds)]; // Remove duplicates
}
