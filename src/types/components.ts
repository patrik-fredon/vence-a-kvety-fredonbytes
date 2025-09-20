/**
 * Base component interfaces and type definitions for atomic design system
 * Following atomic design principles: Atoms -> Molecules -> Organisms -> Templates -> Pages
 */

import type { ReactNode, HTMLAttributes, ComponentPropsWithoutRef } from "react";
import type { Locale } from "./index";

// =============================================================================
// BASE COMPONENT INTERFACES
// =============================================================================

/**
 * Base props that all components should extend
 */
export interface BaseComponentProps {
  /** Custom CSS class name */
  className?: string;
  /** Test identifier for testing */
  "data-testid"?: string;
  /** Accessibility label */
  "aria-label"?: string;
}

/**
 * Props for components that contain children
 */
export interface ComponentWithChildren extends BaseComponentProps {
  children: ReactNode;
}

/**
 * Props for components that support internationalization
 */
export interface ComponentWithLocale extends BaseComponentProps {
  locale: Locale;
}

/**
 * Props for components with loading states
 */
export interface ComponentWithLoading extends BaseComponentProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Props for components with error states
 */
export interface ComponentWithError extends BaseComponentProps {
  error?: string | null;
  onErrorRetry?: () => void;
}

// =============================================================================
// ATOMIC DESIGN LEVEL INTERFACES
// =============================================================================

/**
 * Atom-level component props (basic building blocks)
 * Examples: Button, Input, Icon, Text, Image
 */
export interface AtomProps extends BaseComponentProps {
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Visual variant */
  variant?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Molecule-level component props (combinations of atoms)
 * Examples: SearchBox, ProductCard, FormField, Navigation Item
 */
export interface MoleculeProps extends AtomProps, ComponentWithChildren {
  /** Interactive state */
  interactive?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Organism-level component props (complex UI sections)
 * Examples: Header, ProductGrid, CheckoutForm, Footer
 */
export interface OrganismProps extends MoleculeProps, ComponentWithLocale {
  /** Data loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
}

/**
 * Template-level component props (page layouts)
 * Examples: MainLayout, AuthLayout, CheckoutLayout
 */
export interface TemplateProps extends OrganismProps {
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** SEO metadata */
  seo?: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };
}

// =============================================================================
// SPECIFIC COMPONENT TYPE DEFINITIONS
// =============================================================================

/**
 * Button component variants and sizes
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends
  Omit<ComponentPropsWithoutRef<"button">, "size">,
  AtomProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

/**
 * Input component types and variants
 */
export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search";

export type InputVariant = "default" | "filled" | "outline";

export interface InputProps extends
  Omit<ComponentPropsWithoutRef<"input">, "size" | "type">,
  AtomProps {
  type?: InputType;
  variant?: InputVariant;
  label?: string;
  error?: string;
  helpText?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

/**
 * Card component props
 */
export type CardVariant = "default" | "outlined" | "elevated" | "filled";

export interface CardProps extends ComponentWithChildren {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
}

/**
 * Modal component props
 */
export interface ModalProps extends ComponentWithChildren {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

/**
 * Loading component props
 */
export type LoadingVariant = "spinner" | "dots" | "pulse" | "skeleton";

export interface LoadingProps extends BaseComponentProps {
  variant?: LoadingVariant;
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

/**
 * Image component props with optimization
 */
export interface OptimizedImageProps extends BaseComponentProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  lazy?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

// =============================================================================
// LAYOUT COMPONENT INTERFACES
// =============================================================================

/**
 * Container component props
 */
export interface ContainerProps extends ComponentWithChildren {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  center?: boolean;
}

/**
 * Grid component props
 */
export interface GridProps extends ComponentWithChildren {
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

/**
 * Stack component props (vertical layout)
 */
export interface StackProps extends ComponentWithChildren {
  spacing?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  divider?: ReactNode;
}

/**
 * Flex component props
 */
export interface FlexProps extends ComponentWithChildren {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

// =============================================================================
// FORM COMPONENT INTERFACES
// =============================================================================

/**
 * Form field wrapper props
 */
export interface FormFieldProps extends ComponentWithChildren {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Form validation types
 */
export interface ValidationRule {
  type: "required" | "email" | "minLength" | "maxLength" | "pattern" | "custom";
  value?: string | number | RegExp;
  message: string;
  validator?: (value: any) => boolean | Promise<boolean>;
}

export interface FormFieldState {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
}

// =============================================================================
// ACCESSIBILITY INTERFACES
// =============================================================================

/**
 * Accessibility props for interactive components
 */
export interface AccessibilityProps {
  /** ARIA role */
  role?: string;
  /** ARIA label */
  "aria-label"?: string;
  /** ARIA described by */
  "aria-describedby"?: string;
  /** ARIA expanded state */
  "aria-expanded"?: boolean;
  /** ARIA pressed state */
  "aria-pressed"?: boolean;
  /** ARIA selected state */
  "aria-selected"?: boolean;
  /** ARIA disabled state */
  "aria-disabled"?: boolean;
  /** Tab index */
  tabIndex?: number;
}

/**
 * Keyboard navigation props
 */
export interface KeyboardNavigationProps {
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyUp?: (event: React.KeyboardEvent) => void;
  onKeyPress?: (event: React.KeyboardEvent) => void;
}

// =============================================================================
// PERFORMANCE OPTIMIZATION INTERFACES
// =============================================================================

/**
 * Props for components that support lazy loading
 */
export interface LazyLoadProps {
  lazy?: boolean;
  threshold?: number;
  rootMargin?: string;
  onIntersect?: () => void;
}

/**
 * Props for components with virtualization support
 */
export interface VirtualizationProps {
  virtualized?: boolean;
  itemHeight?: number;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

// =============================================================================
// THEME AND STYLING INTERFACES
// =============================================================================

/**
 * Theme-aware component props
 */
export interface ThemeProps {
  theme?: "light" | "dark" | "auto";
  colorScheme?: "default" | "funeral" | "celebration";
}

/**
 * Responsive props for components
 */
export interface ResponsiveProps {
  responsive?: boolean;
  breakpoints?: {
    sm?: any;
    md?: any;
    lg?: any;
    xl?: any;
  };
}

// =============================================================================
// ADVANCED COMPONENT PATTERNS
// =============================================================================

/**
 * Render prop pattern interface
 */
export interface RenderPropComponent<T = any> {
  children: (props: T) => ReactNode;
}

/**
 * Compound component pattern interface
 */
export interface CompoundComponent<T extends Record<string, any>> {
  [K in keyof T]: T[K];
}

/**
 * Polymorphic component props
 */
export type PolymorphicProps<T extends keyof JSX.IntrinsicElements> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

/**
 * Forward ref component type
 */
export type ForwardRefComponent<T, P = {}> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;

// =============================================================================
// DESIGN SYSTEM TOKENS
// =============================================================================

/**
 * Design system spacing scale
 */
export type SpacingScale =
  | "0" | "px" | "0.5" | "1" | "1.5" | "2" | "2.5" | "3" | "3.5" | "4"
  | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16"
  | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56"
  | "60" | "64" | "72" | "80" | "96";

/**
 * Design system color palette
 */
export type ColorScale =
  | "50" | "100" | "200" | "300" | "400" | "500"
  | "600" | "700" | "800" | "900" | "950";

/**
 * Funeral-appropriate color scheme
 */
export interface FuneralColorScheme {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Deep forest green
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Muted sage
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Respectful gold
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
}

// =============================================================================
// COMPONENT STATE MANAGEMENT
// =============================================================================

/**
 * Component state for form controls
 */
export interface FormControlState {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  disabled: boolean;
  required: boolean;
}

/**
 * Component state for async operations
 */
export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch?: Date;
}

/**
 * Component state for pagination
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // HTML element props for type safety
  HTMLAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
};
