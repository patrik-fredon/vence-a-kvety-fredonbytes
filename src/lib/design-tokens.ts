/**
 * Design Tokens - Stone/Amber Design System
 *
 * This module defines the design tokens for the pohrebni-vence layout migration,
 * providing a modern, professional stone/amber color palette with elegant typography.
 */

// =============================================================================
// COLOR PALETTE - STONE/AMBER DESIGN SYSTEM
// =============================================================================

/**
 * Stone color palette - Primary neutral colors
 * Foundation for backgrounds, text, and borders
 */
export const stoneColors = {
  50: "#00302D",
  100: "#00302D",
  200: "#00302D",
  300: "#D6D3D1",
  400: "#A8A29E",
  500: "#78716C",
  600: "#57534E",
  700: "#44403C",
  800: "#292524",
  900: "#1C1917",
  950: "#0C0A09",
} as const;

/**
 * Amber color palette - Accent colors
 * Used for highlights, CTAs, and important elements
 */
export const amberColors = {
  50: "#f0fdfa",
  100: "#FEF3C6",
  200: "#99f6e4",
  300: "#5eead4",
  400: "#2dd4bf",
  500: "#14b8a6",
  600: "#0d9488",
  700: "#0f766e",
  800: "#115e59",
  900: "#134e4a",
  950: "#013029",
} as const;

/**
 * White color for clean backgrounds and text
 */
export const whiteColor = "#FFFFFF" as const;

/**
 * Black color for text and high contrast elements
 */
export const blackColor = "#000000" as const;

/**
 * Funeral-specific color palette
 * Professional colors appropriate for funeral services and memorial products
 * Now using CSS custom properties for consistency with Tailwind CSS 4
 */
export const funeralColors = {
  // Hero section background - using CSS variable
  hero: "var(--color-teal-900)",
  // Page background - using CSS variable
  background: "var(--color-teal-900)",
  // Complementary shades for the funeral palette
  heroLight: "var(--color-teal-800)", // Lighter variant of hero color
  heroDark: "var(--color-teal-950)", // Darker variant of hero color
  backgroundLight: "linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47)", // Gradient background
  backgroundDark: "#7A7347", // Darker variant of background color
  // Text colors that work well with funeral palette
  textOnHero: "#FFFFFF", // White text on hero background
  textOnBackground: "#2D2D2D", // Dark text on page background
  textSecondary: "#F5F5DC", // Beige for secondary text
  accent: "var(--color-accent)", // Accent color using CSS variable
} as const;

/**
 * Semantic colors for states and feedback
 * Using green for success, amber for warning, red for error, blue for info
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
  warning: amberColors, // Use amber colors for warnings
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

// =============================================================================
// TYPOGRAPHY SCALE
// =============================================================================

/**
 * Font family stack
 */
export const fontFamily = {
  sans: [
    "Inter",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
  mono: [
    "Menlo",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace",
  ],
} as const;

/**
 * Font size scale (rem values)
 */
export const fontSize = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
  "5xl": "3rem", // 48px
  "6xl": "3.75rem", // 60px
  "7xl": "4.5rem", // 72px
  "8xl": "6rem", // 96px
  "9xl": "8rem", // 128px
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
export const spacing = {
  0: "0px",
  px: "1px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
} as const;

// =============================================================================
// BORDER RADIUS SCALE
// =============================================================================

/**
 * Border radius scale for consistent rounded corners
 */
export const borderRadius = {
  none: "0px",
  sm: "0.125rem", // 2px
  base: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const;

// =============================================================================
// SHADOW SCALE
// =============================================================================

/**
 * Box shadow scale for depth and elevation
 */
export const boxShadow = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

/**
 * Responsive breakpoints
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

/**
 * Z-index scale for layering
 */
export const zIndex = {
  auto: "auto",
  0: "0",
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50",
  dropdown: "1000",
  sticky: "1020",
  fixed: "1030",
  modal: "1040",
  popover: "1050",
  tooltip: "1060",
  toast: "1070",
} as const;

// =============================================================================
// ANIMATION DURATIONS
// =============================================================================

/**
 * Animation duration scale
 */
export const duration = {
  75: "75ms",
  100: "100ms",
  150: "150ms",
  200: "200ms",
  300: "300ms",
  500: "500ms",
  700: "700ms",
  1000: "1000ms",
} as const;

/**
 * Animation timing functions
 */
export const timingFunction = {
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

// =============================================================================
// DESIGN TOKEN EXPORTS
// =============================================================================

/**
 * Complete design token system for stone/amber design with funeral-appropriate colors
 */
export const designTokens = {
  colors: {
    stone: stoneColors,
    amber: amberColors,
    white: whiteColor,
    black: blackColor,
    funeral: funeralColors,
    semantic: semanticColors,
  },
  typography: {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  },
  spacing,
  borderRadius,
  boxShadow,
  breakpoints,
  zIndex,
  animation: {
    duration,
    timingFunction,
  },
} as const;

export default designTokens;
