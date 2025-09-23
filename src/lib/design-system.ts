/**
 * Design System - Funeral Wreaths E-commerce
 *
 * This module provides utilities and guidelines for using the design system
 * consistently across the application, with special focus on funeral-appropriate
 * colors and professional aesthetics.
 */

import { designTokens } from "./design-tokens";

// =============================================================================
// COLOR USAGE GUIDELINES
// =============================================================================

/**
 * Funeral Color Usage Guidelines
 *
 * The funeral color palette is designed to convey dignity, professionalism,
 * and appropriate solemnity for memorial services and funeral wreaths.
 */
export const funeralColorUsage = {
  // Primary backgrounds
  heroSection: {
    className: "bg-funeral-hero",
    cssValue: designTokens.colors.funeral.hero,
    description: "Dark green-gray background for hero sections",
    textColor: "text-funeral-textOnHero",
  },
  pageBackground: {
    className: "bg-funeral-background",
    cssValue: designTokens.colors.funeral.background,
    description: "Muted olive-gold for main page background",
    textColor: "text-funeral-textOnBackground",
  },

  // Text colors
  primaryText: {
    className: "text-funeral-textOnHero",
    cssValue: designTokens.colors.funeral.textOnHero,
    description: "White text for use on dark backgrounds",
    usage: "Use on hero sections and dark backgrounds",
  },
  secondaryText: {
    className: "text-funeral-textOnBackground",
    cssValue: designTokens.colors.funeral.textOnBackground,
    description: "Dark text for use on light backgrounds",
    usage: "Use on page background and light sections",
  },
  accentText: {
    className: "text-funeral-accent",
    cssValue: designTokens.colors.funeral.accent,
    description: "Gold accent for highlights and important elements",
    usage: "Use sparingly for emphasis and CTAs",
  },

  // Variants for different contexts
  variants: {
    heroLight: {
      className: "bg-funeral-heroLight",
      cssValue: designTokens.colors.funeral.heroLight,
      description: "Lighter variant of hero color for hover states",
    },
    heroDark: {
      className: "bg-funeral-heroDark",
      cssValue: designTokens.colors.funeral.heroDark,
      description: "Darker variant of hero color for pressed states",
    },
    backgroundLight: {
      className: "bg-funeral-backgroundLight",
      cssValue: designTokens.colors.funeral.backgroundLight,
      description: "Lighter variant of background for cards and sections",
    },
    backgroundDark: {
      className: "bg-funeral-backgroundDark",
      cssValue: designTokens.colors.funeral.backgroundDark,
      description: "Darker variant of background for borders and dividers",
    },
  },
} as const;

/**
 * Color contrast validation
 * Ensures WCAG 2.1 AA compliance for text readability
 */
export const colorContrast = {
  // Validated color combinations that meet accessibility standards
  validCombinations: [
    {
      background: designTokens.colors.funeral.hero,
      text: designTokens.colors.funeral.textOnHero,
      ratio: "12.6:1", // Exceeds WCAG AA requirement of 4.5:1
    },
    {
      background: designTokens.colors.funeral.background,
      text: designTokens.colors.funeral.textOnBackground,
      ratio: "8.2:1", // Exceeds WCAG AA requirement of 4.5:1
    },
    {
      background: designTokens.colors.funeral.background,
      text: designTokens.colors.funeral.accent,
      ratio: "5.1:1", // Meets WCAG AA requirement
    },
  ],
} as const;

// =============================================================================
// COMPONENT PATTERNS
// =============================================================================

/**
 * Pre-defined component patterns using the funeral color system
 */
export const componentPatterns = {
  // Hero section pattern
  heroSection: {
    container: "bg-funeral-hero text-funeral-textOnHero",
    heading: "text-funeral-textOnHero font-bold",
    subheading: "text-funeral-textSecondary font-medium",
    cta: "bg-funeral-accent text-funeral-textOnBackground hover:bg-funeral-accent/90",
  },

  // Product card pattern
  productCard: {
    container: "bg-funeral-backgroundLight border border-funeral-backgroundDark",
    title: "text-funeral-textOnBackground font-semibold",
    description: "text-funeral-textOnBackground/80",
    price: "text-funeral-accent font-bold",
  },

  // Navigation pattern
  navigation: {
    container: "bg-funeral-background border-b border-funeral-backgroundDark",
    link: "text-funeral-textOnBackground hover:text-funeral-accent",
    activeLink: "text-funeral-accent font-medium",
  },

  // Button patterns
  buttons: {
    primary:
      "bg-funeral-accent text-funeral-textOnBackground hover:bg-funeral-accent/90 focus:ring-funeral-accent/50",
    secondary:
      "bg-funeral-backgroundLight text-funeral-textOnBackground border border-funeral-backgroundDark hover:bg-funeral-backgroundDark",
    ghost: "text-funeral-accent hover:bg-funeral-accent/10",
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get appropriate text color for a given background
 */
export function getTextColorForBackground(backgroundColor: string): string {
  const colorMap: Record<string, string> = {
    [designTokens.colors.funeral.hero]: designTokens.colors.funeral.textOnHero,
    [designTokens.colors.funeral.heroLight]: designTokens.colors.funeral.textOnHero,
    [designTokens.colors.funeral.heroDark]: designTokens.colors.funeral.textOnHero,
    [designTokens.colors.funeral.background]: designTokens.colors.funeral.textOnBackground,
    [designTokens.colors.funeral.backgroundLight]: designTokens.colors.funeral.textOnBackground,
    [designTokens.colors.funeral.backgroundDark]: designTokens.colors.funeral.textOnHero,
  };

  return colorMap[backgroundColor] || designTokens.colors.funeral.textOnBackground;
}

/**
 * Generate CSS custom properties for funeral colors
 * Useful for dynamic styling or CSS-in-JS solutions
 */
export function generateFuneralColorProperties(): Record<string, string> {
  return {
    "--funeral-hero": designTokens.colors.funeral.hero,
    "--funeral-background": designTokens.colors.funeral.background,
    "--funeral-hero-light": designTokens.colors.funeral.heroLight,
    "--funeral-hero-dark": designTokens.colors.funeral.heroDark,
    "--funeral-background-light": designTokens.colors.funeral.backgroundLight,
    "--funeral-background-dark": designTokens.colors.funeral.backgroundDark,
    "--funeral-text-on-hero": designTokens.colors.funeral.textOnHero,
    "--funeral-text-on-background": designTokens.colors.funeral.textOnBackground,
    "--funeral-text-secondary": designTokens.colors.funeral.textSecondary,
    "--funeral-accent": designTokens.colors.funeral.accent,
  };
}

/**
 * Validate color accessibility
 * Returns true if the color combination meets WCAG AA standards
 */
export function validateColorAccessibility(
  backgroundColor: string,
  textColor: string,
  minimumRatio: number = 4.5
): boolean {
  // This is a simplified check - in production, you'd use a proper contrast calculation library
  const validCombinations = colorContrast.validCombinations;
  return validCombinations.some(
    (combo) =>
      combo.background === backgroundColor &&
      combo.text === textColor &&
      Number.parseFloat(combo.ratio) >= minimumRatio
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  funeralColorUsage,
  colorContrast,
  componentPatterns,
  getTextColorForBackground,
  generateFuneralColorProperties,
  validateColorAccessibility,
};
