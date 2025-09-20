/**
 * Design System Utilities
 *
 * Provides utilities for accessing design tokens and creating consistent
 * styling patterns across the application.
 */

import { designTokens } from "./design-tokens";
import { cn } from "./utils";

// =============================================================================
// DESIGN TOKEN ACCESSORS
// =============================================================================

/**
 * Stone color variants for consistent usage
 */
export const stoneVariants = {
  background: {
    primary: "bg-stone-50",
    secondary: "bg-stone-100",
    muted: "bg-stone-200",
  },
  text: {
    primary: "text-stone-900",
    secondary: "text-stone-700",
    muted: "text-stone-500",
  },
  border: {
    light: "border-stone-200",
    medium: "border-stone-300",
    dark: "border-stone-400",
  },
} as const;

/**
 * Amber color variants for accent elements
 */
export const amberVariants = {
  background: {
    primary: "bg-amber-600",
    secondary: "bg-amber-500",
    light: "bg-amber-200",
  },
  text: {
    primary: "text-amber-600",
    secondary: "text-amber-700",
    light: "text-amber-200",
  },
  border: {
    primary: "border-amber-600",
    secondary: "border-amber-500",
  },
} as const;

// =============================================================================
// COMPONENT STYLE GENERATORS
// =============================================================================

/**
 * Generate button styles based on variant and size
 */
export function getButtonStyles(
  variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" = "default",
  size: "default" | "sm" | "lg" | "icon" = "default"
) {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-stone-900 text-stone-50 hover:bg-stone-900/90",
    destructive: "bg-red-500 text-stone-50 hover:bg-red-500/90",
    outline: "border border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900",
    secondary: "bg-stone-100 text-stone-900 hover:bg-stone-100/80",
    ghost: "hover:bg-stone-100 hover:text-stone-900",
    link: "text-stone-900 underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return cn(baseStyles, variants[variant], sizes[size]);
}

/**
 * Generate card styles with optional hover effects
 */
export function getCardStyles(withHover = false) {
  const baseStyles = "rounded-lg border border-stone-200 bg-white text-stone-950 shadow-sm";
  const hoverStyles = withHover ? "hover:shadow-md transition-shadow duration-200" : "";

  return cn(baseStyles, hoverStyles);
}

/**
 * Generate input styles with focus states
 */
export function getInputStyles() {
  return cn(
    "flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm",
    "ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  );
}

/**
 * Generate heading styles based on level
 */
export function getHeadingStyles(level: 1 | 2 | 3 | 4 | 5 | 6 = 1) {
  const baseStyles = "font-semibold tracking-tight text-stone-900";

  const levelStyles = {
    1: "text-4xl lg:text-5xl",
    2: "text-3xl lg:text-4xl",
    3: "text-2xl lg:text-3xl",
    4: "text-xl lg:text-2xl",
    5: "text-lg lg:text-xl",
    6: "text-base lg:text-lg",
  };

  return cn(baseStyles, levelStyles[level]);
}

// =============================================================================
// LAYOUT UTILITIES
// =============================================================================

/**
 * Container styles for consistent page layouts
 */
export const containerStyles = "container mx-auto px-4 sm:px-6 lg:px-8";

/**
 * Section spacing utilities
 */
export const sectionSpacing = {
  sm: "py-8 md:py-12",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24",
  xl: "py-24 md:py-32",
} as const;

/**
 * Grid utilities for responsive layouts
 */
export const gridStyles = {
  products: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
  features: "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3",
  testimonials: "grid grid-cols-1 gap-6 md:grid-cols-2",
} as const;

// =============================================================================
// ANIMATION UTILITIES
// =============================================================================

/**
 * Common animation classes
 */
export const animations = {
  fadeIn: "animate-in fade-in duration-500",
  slideUp: "animate-in slide-in-from-bottom-4 duration-300",
  slideDown: "animate-in slide-in-from-top-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
} as const;

/**
 * Hover animation utilities
 */
export const hoverAnimations = {
  scale: "hover:scale-105 transition-transform duration-200",
  lift: "hover:-translate-y-1 hover:shadow-lg transition-all duration-200",
  glow: "hover:shadow-amber-200/50 hover:shadow-lg transition-shadow duration-200",
} as const;

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

/**
 * Responsive text sizes
 */
export const responsiveText = {
  hero: "text-4xl sm:text-5xl lg:text-6xl",
  title: "text-2xl sm:text-3xl lg:text-4xl",
  subtitle: "text-lg sm:text-xl lg:text-2xl",
  body: "text-base sm:text-lg",
} as const;

/**
 * Responsive spacing
 */
export const responsiveSpacing = {
  section: "py-12 sm:py-16 lg:py-20",
  container: "px-4 sm:px-6 lg:px-8",
  gap: "gap-4 sm:gap-6 lg:gap-8",
} as const;

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

/**
 * Screen reader only styles
 */
export const srOnly = "sr-only";

/**
 * Focus styles for accessibility
 */
export const focusStyles = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2";

/**
 * Skip link styles
 */
export const skipLinkStyles = cn(
  "absolute left-4 top-4 z-50 rounded-md bg-stone-900 px-4 py-2 text-stone-50",
  "transform -translate-y-16 transition-transform focus:translate-y-0"
);

// =============================================================================
// EXPORT DESIGN TOKENS FOR DIRECT ACCESS
// =============================================================================

export { designTokens };
export { stoneColors, amberColors } from "./design-tokens";
