/**
 * Utility functions for product customization logic
 */

import type { Product, CustomizationOption } from "@/types/product";

/**
 * Check if a product has any required customization options
 */
export function hasRequiredCustomizations(product: Product): boolean {
  if (!product.customizationOptions || product.customizationOptions.length === 0) {
    return false;
  }

  return product.customizationOptions.some((option: CustomizationOption) => option.required === true);
}

/**
 * Check if a product has any customization options at all
 */
export function hasCustomizations(product: Product): boolean {
  return product.customizationOptions && product.customizationOptions.length > 0;
}

/**
 * Check if a product has size options
 */
export function hasSizeOptions(product: Product): boolean {
  if (!product.customizationOptions) return false;

  return product.customizationOptions.some(
    (option: CustomizationOption) => option.type === "size" || option.id === "size"
  );
}

/**
 * Check if a product has ribbon options
 */
export function hasRibbonOptions(product: Product): boolean {
  if (!product.customizationOptions) return false;

  return product.customizationOptions.some(
    (option: CustomizationOption) => option.type === "ribbon" || option.id === "ribbon"
  );
}

/**
 * Get the appropriate button text and action for a product
 */
export function getProductActionConfig(product: Product, locale: string) {
  const requiresCustomization = hasRequiredCustomizations(product);
  const hasAnyCustomization = hasCustomizations(product);

  if (requiresCustomization || hasAnyCustomization) {
    return {
      action: "customize",
      text: locale === "cs" ? "Přizpůsobit" : "Customize",
      icon: "cog" as const,
    };
  }

  return {
    action: "addToCart",
    text: locale === "cs" ? "Do košíku" : "Add to Cart",
    icon: "cart" as const,
  };
}
