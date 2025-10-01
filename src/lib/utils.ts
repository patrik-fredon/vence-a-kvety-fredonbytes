import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { designTokens } from "./design-tokens";

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get design token color value
 * @param colorPath - Path to color in design tokens (e.g., "stone.500", "amber.600")
 * @returns Color value or fallback
 */
export function getColor(colorPath: string, fallback = "#000000"): string {
  const [colorFamily, shade] = colorPath.split(".");

  if (colorFamily === "stone" && shade && shade in designTokens.colors.stone) {
    return designTokens.colors.stone[shade as unknown as keyof typeof designTokens.colors.stone];
  }

  if (colorFamily === "amber" && shade && shade in designTokens.colors.amber) {
    return designTokens.colors.amber[shade as unknown as keyof typeof designTokens.colors.amber];
  }

  if (colorFamily === "white") {
    return designTokens.colors.white;
  }

  if (colorFamily === "black") {
    return designTokens.colors.black;
  }

  return fallback;
}

/**
 * Get design token spacing value
 * @param spacingKey - Spacing key from design tokens
 * @returns Spacing value or fallback
 */
export function getSpacing(spacingKey: string, fallback = "0"): string {
  if (spacingKey in designTokens.spacing) {
    return designTokens.spacing[spacingKey as keyof typeof designTokens.spacing];
  }
  return fallback;
}

/**
 * Get design token font size value
 * @param sizeKey - Font size key from design tokens
 * @returns Font size value or fallback
 */
export function getFontSize(sizeKey: string, fallback = "1rem"): string {
  if (sizeKey in designTokens.typography.fontSize) {
    return designTokens.typography.fontSize[
      sizeKey as keyof typeof designTokens.typography.fontSize
    ];
  }
  return fallback;
}

/**
 * Get design token border radius value
 * @param radiusKey - Border radius key from design tokens
 * @returns Border radius value or fallback
 */
export function getBorderRadius(radiusKey: string, fallback = "0"): string {
  if (radiusKey in designTokens.borderRadius) {
    return designTokens.borderRadius[radiusKey as keyof typeof designTokens.borderRadius];
  }
  return fallback;
}

/**
 * Format price in Czech Koruna
 * @param price - Price in CZK
 * @param locale - Locale for formatting (cs or en)
 * @returns Formatted price string
 */
export function formatPrice(price: number, locale: "cs" | "en" = "cs"): string {
  return new Intl.NumberFormat(locale === "cs" ? "cs-CZ" : "en-US", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Generate a slug from a string
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Debounce function for performance optimization
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if empty, false otherwise
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
