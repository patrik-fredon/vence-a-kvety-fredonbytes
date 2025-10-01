/**
 * Design Tokens - Modern Theming System
 *
 * Centralized design tokens with semantic color naming and theme variants.
 * Maintains funeral-appropriate aesthetics with stone/amber palette.
 */

// =============================================================================
// BASE COLOR SCALES
// =============================================================================

/**
 * Stone color scale - Primary neutral colors
 * Used for backgrounds, borders, and neutral elements
 */
export const stoneScale = {
  50: '#fafaf9',
  100: '#f5f5f4',
  200: '#e7e5e4',
  300: '#d6d3d1',
  400: '#a8a29e',
  500: '#78716c',
  600: '#57534e',
  700: '#44403c',
  800: '#292524',
  900: '#1c1917',
  950: '#0c0a09',
} as const;

/**
 * Amber color scale - Accent colors
 * Used for highlights, CTAs, and important elements
 */
export const amberScale = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03',
} as const;

/**
 * Teal color scale - Secondary accent colors
 * Used for secondary actions and complementary elements
 */
export const tealScale = {
  50: '#f0fdfa',
  100: '#ccfbf1',
  200: '#99f6e4',
  300: '#5eead4',
  400: '#2dd4bf',
  500: '#14b8a6',
  600: '#0d9488',
  700: '#0f766e',
  800: '#115e59',
  900: '#134e4a',
  950: '#042f2e',
} as const;

/**
 * Neutral gray scale - Additional neutral colors
 * Used for text, borders, and subtle backgrounds
 */
export const grayScale = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#030712',
} as const;

/**
 * Semantic color scales for states and feedback
 */
export const semanticScales = {
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  warning: amberScale,
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
} as const;

// =============================================================================
// SEMANTIC COLOR TOKENS
// =============================================================================

/**
 * Light theme semantic colors
 * Funeral-appropriate colors maintaining dignity and professionalism
 */
export const lightThemeColors = {
  // Primary colors - Stone-based
  primary: {
    50: stoneScale[50],
    100: stoneScale[100],
    200: stoneScale[200],
    300: stoneScale[300],
    400: stoneScale[400],
    500: stoneScale[500],
    600: stoneScale[600],
    700: stoneScale[700],
    800: stoneScale[800],
    900: stoneScale[900],
    950: stoneScale[950],
  },

  // Secondary colors - Teal-based for complementary elements
  secondary: {
    50: tealScale[50],
    100: tealScale[100],
    200: tealScale[200],
    300: tealScale[300],
    400: tealScale[400],
    500: tealScale[500],
    600: tealScale[600],
    700: tealScale[700],
    800: tealScale[800],
    900: tealScale[900],
    950: tealScale[950],
  },

  // Accent colors - Amber-based for highlights and CTAs
  accent: {
    50: amberScale[50],
    100: amberScale[100],
    200: amberScale[200],
    300: amberScale[300],
    400: amberScale[400],
    500: amberScale[500],
    600: amberScale[600],
    700: amberScale[700],
    800: amberScale[800],
    900: amberScale[900],
    950: amberScale[950],
  },

  // Neutral colors - Gray-based for text and subtle elements
  neutral: {
    50: grayScale[50],
    100: grayScale[100],
    200: grayScale[200],
    300: grayScale[300],
    400: grayScale[400],
    500: grayScale[500],
    600: grayScale[600],
    700: grayScale[700],
    800: grayScale[800],
    900: grayScale[900],
    950: grayScale[950],
  },

  // Semantic colors
  success: semanticScales.success,
  warning: semanticScales.warning,
  error: semanticScales.error,
  info: semanticScales.info,

  // Surface colors - Backgrounds and containers
  surface: {
    background: '#ffffff',
    foreground: stoneScale[950],
    muted: stoneScale[50],
    mutedForeground: stoneScale[500],
    card: '#ffffff',
    cardForeground: stoneScale[950],
    popover: '#ffffff',
    popoverForeground: stoneScale[950],
    border: stoneScale[200],
    input: stoneScale[200],
    ring: stoneScale[950],
  },
} as const;

/**
 * Dark theme semantic colors
 * Maintains funeral-appropriate aesthetics in dark mode
 */
export const darkThemeColors = {
  // Primary colors - Inverted stone scale
  primary: {
    50: stoneScale[950],
    100: stoneScale[900],
    200: stoneScale[800],
    300: stoneScale[700],
    400: stoneScale[600],
    500: stoneScale[500],
    600: stoneScale[400],
    700: stoneScale[300],
    800: stoneScale[200],
    900: stoneScale[100],
    950: stoneScale[50],
  },

  // Secondary colors - Darker teal variants
  secondary: {
    50: tealScale[950],
    100: tealScale[900],
    200: tealScale[800],
    300: tealScale[700],
    400: tealScale[600],
    500: tealScale[500],
    600: tealScale[400],
    700: tealScale[300],
    800: tealScale[200],
    900: tealScale[100],
    950: tealScale[50],
  },

  // Accent colors - Slightly muted amber for dark theme
  accent: {
    50: amberScale[950],
    100: amberScale[900],
    200: amberScale[800],
    300: amberScale[700],
    400: amberScale[600],
    500: amberScale[500],
    600: amberScale[400],
    700: amberScale[300],
    800: amberScale[200],
    900: amberScale[100],
    950: amberScale[50],
  },

  // Neutral colors - Inverted gray scale
  neutral: {
    50: grayScale[950],
    100: grayScale[900],
    200: grayScale[800],
    300: grayScale[700],
    400: grayScale[600],
    500: grayScale[500],
    600: grayScale[400],
    700: grayScale[300],
    800: grayScale[200],
    900: grayScale[100],
    950: grayScale[50],
  },

  // Semantic colors - Adjusted for dark theme
  success: semanticScales.success,
  warning: semanticScales.warning,
  error: semanticScales.error,
  info: semanticScales.info,

  // Surface colors - Dark backgrounds and containers
  surface: {
    background: stoneScale[950],
    foreground: stoneScale[50],
    muted: stoneScale[900],
    mutedForeground: stoneScale[400],
    card: stoneScale[950],
    cardForeground: stoneScale[50],
    popover: stoneScale[950],
    popoverForeground: stoneScale[50],
    border: stoneScale[800],
    input: stoneScale[800],
    ring: stoneScale[300],
  },
} as const;

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

/**
 * Font family tokens
 */
export const fontFamily = {
  sans: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
  serif: [
    'Georgia',
    'Cambria',
    'Times New Roman',
    'Times',
    'serif',
  ],
  mono: [
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
} as const;

/**
 * Font size scale with consistent naming
 */
export const fontSize = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
  '7xl': '4.5rem',   // 72px
  '8xl': '6rem',     // 96px
  '9xl': '8rem',     // 128px
} as const;

/**
 * Font weight scale
 */
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

/**
 * Line height scale
 */
export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

/**
 * Letter spacing scale
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// =============================================================================
// SPACING TOKENS
// =============================================================================

/**
 * Spacing scale based on 0.25rem (4px) increments
 */
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const;

// =============================================================================
// SHADOW TOKENS
// =============================================================================

/**
 * Box shadow scale for depth and elevation
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// =============================================================================
// BORDER RADIUS TOKENS
// =============================================================================

/**
 * Border radius scale for consistent rounded corners
 */
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// =================================================================
// ANIMATION TOKENS
// =============================================================================

/**
 * Animation duration scale
 */
export const duration = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} as const;

/**
 * Animation timing functions
 */
export const timingFunction = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

/**
 * Responsive breakpoints
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

/**
 * Z-index scale for layering
 */
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070',
} as const;

// =============================================================================
// THEME DEFINITIONS
// =============================================================================

/**
 * Light theme configuration
 */
export const lightTheme = {
  colors: lightThemeColors,
  typography: {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  },
  spacing,
  shadows,
  borderRadius,
  animation: {
    duration,
    timingFunction,
  },
  breakpoints,
  zIndex,
} as const;

/**
 * Dark theme configuration
 */
export const darkTheme = {
  colors: darkThemeColors,
  typography: {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  },
  spacing,
  shadows,
  borderRadius,
  animation: {
    duration,
    timingFunction,
  },
  breakpoints,
  zIndex,
} as const;

// =============================================================================
// DESIGN TOKENS EXPORT
// =============================================================================

/**
 * Complete design token system
 */
export const designTokens = {
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  // Base scales for reference
  scales: {
    stone: stoneScale,
    amber: amberScale,
    teal: tealScale,
    gray: grayScale,
    semantic: semanticScales,
  },
} as const;

// Type definitions for theme tokens
export type ThemeMode = 'light' | 'dark';
export type ColorScale = typeof stoneScale;
export type SemanticColors = typeof semanticScales;
export type ThemeColors = typeof lightThemeColors;
export type DesignTokens = typeof designTokens;

export default designTokens;
