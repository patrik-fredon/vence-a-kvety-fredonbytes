/**
 * Design Tokens - Funeral-Appropriate Design System
 *
 * This module defines the design tokens for the funeral wreaths e-commerce platform,
 * providing a respectful, professional, and empathetic visual language.
 */

import type { FuneralColorScheme, SpacingScale } from "@/types/components";

// =============================================================================
// COLOR PALETTE - FUNERAL APPROPRIATE
// =============================================================================

/**
 * Primary color palette - Deep forest green
 * Represents nature, growth, and eternal life
 */
export const primaryColors = {
  50: "#F0F7ED",
  100: "#DDECD2",
  200: "#BDDAA9",
  300: "#94C176",
  400: "#6FA64C",
  500: "#2D5016", // Main primary color
  600: "#254012",
  700: "#1E320E",
  800: "#17240A",
  900: "#101807",
  950: "#0A0F04",
} as const;

/**
 * Secondary color palette - Muted sage
 * Provides subtle contrast and sophistication
 */
export const secondaryColors = {
  50: "#F6F7F4",
  100: "#EBEEE6",
  200: "#D4DAC9",
  300: "#B8C2A6",
  400: "#9BA883",
  500: "#8B9467", // Main secondary color
  600: "#6F7752",
  700: "#565C42",
  800: "#3E4230",
  900: "#2A2D21",
  950: "#181A15",
} as const;

/**
 * Accent color palette - Respectful gold
 * Used sparingly for important highlights
 */
export const accentColors = {
  50: "#FEFBF0",
  100: "#FDF5D9",
  200: "#FAEAB3",
  300: "#F6DC82",
  400: "#F1CB4F",
  500: "#D4AF37", // Main accent color
  600: "#B8942A",
  700: "#9A7A1F",
  800: "#7A6118",
  900: "#5C4912",
  950: "#3D310C",
} as const;

/**
 * Neutral color palette - Professional grays
 * Foundation for text, backgrounds, and borders
 */
export const neutralColors = {
  50: "#F8F9FA",
  100: "#E9ECEF",
  200: "#DEE2E6",
  300: "#CED4DA",
  400: "#ADB5BD",
  500: "#6C757D",
  600: "#495057",
  700: "#343A40",
  800: "#212529",
  900: "#1A1D20",
  950: "#0F1114",
} as const;

/**
 * Semantic colors for states and feedback
 */
export const semanticColors = {
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
    950: "#052E16",
  },
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
    950: "#451A03",
  },
  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
    950: "#450A0A",
  },
  info: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
    950: "#172554",
  },
} as const;

/**
 * Complete funeral color scheme
 */
export const funeralColorScheme: FuneralColorScheme = {
  primary: primaryColors,
  secondary: secondaryColors,
  accent: accentColors,
  neutral: neutralColors,
};

// =============================================================================
// TYPOGRAPHY SCALE
// =============================================================================

/**
 * Font family stack
 */
export const fontFamily = {
  sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
  mono: ["Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
} as const;

/**
 * Font size scale (rem values)
 */
export const fontSize = {
  xs: "0.75rem",    // 12px
  sm: "0.875rem",   // 14px
  base: "1rem",     // 16px
  lg: "1.125rem",   // 18px
  xl: "1.25rem",    // 20px
  "2xl": "1.5rem",  // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
  "5xl": "3rem",    // 48px
  "6xl": "3.75rem", // 60px
  "7xl": "4.5rem",  // 72px
  "8xl": "6rem",    // 96px
  "9xl": "8rem",    // 128px
} as const;

/**
 * Font weight scale
 */
export const fontWeight = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

/**
 * Line height scale
 */
export const lineHeight = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
} as const;

/**
 * Letter spacing scale
 */
export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const;

// =============================================================================
// SPACING SCALE
// =============================================================================

/**
 * Spacing scale based on 0.25rem (4px) increments
 */
export const spacing =
 0: "0px
x: "1px",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  3.5: "0.875rem",  // 14px
  4: "1rem",        // 16px
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  7: "1.75rem",     // 28px
  8: "2rem",        // 32px
  9: "2.25rem",     // 36px
  10: "2.5rem",     // 40px
  11: "2.75rem",    // 44px
  12: "3rem",       // 48px
  14: "3.5rem",     // 56px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
  24: "6rem",       // 96px
 28: "7rem",   // 112px
  32: "8rem",       // 128px
  36: "9rem",       // 144px
  40: "10rem",      // 160px
  44: "11rem",      // 176px
  48: "12rem",      // 192px
  52: "13rem",      // 208px
  56: "14rem",      // 224px
  60: "15rem",      // 240px
 
