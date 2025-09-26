/**
 * Shared types for product card components
 */

import type { Product } from "@/types/product";

export type ProductCardVariant = "grid" | "teaser" | "list";
export type ProductCardActionType = "addToCart" | "customize" | "quickView" | "viewDetails";

export interface ProductCardLayoutProps {
  product: Product;
  locale: string;
  variant?: ProductCardVariant;
  className?: string;
  featured?: boolean;
  loading?: boolean;
  onAction?: (product: Product, actionType: ProductCardActionType) => void;
  onQuickView?: (product: Product) => void;
  children?: React.ReactNode;
}

export interface ProductCardActionConfig {
  type: ProductCardActionType;
  text: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

export interface ProductCardImageProps {
  product: Product;
  locale: string;
  variant: ProductCardVariant;
  featured?: boolean;
  isHovered?: boolean;
  onImageLoad?: () => void;
}

export interface ProductCardContentProps {
  product: Product;
  locale: string;
  variant: ProductCardVariant;
  primaryAction?: ProductCardActionConfig;
  onAction?: (product: Product, actionType: ProductCardActionType) => void;
  onQuickView?: (product: Product) => void;
  loading?: boolean;
  children?: React.ReactNode;
}

// Shared styling configurations
export interface ProductCardStyleConfig {
  cardStyles: string;
  imageContainerStyles: string;
  contentStyles: string;
  nameStyles: string;
  priceStyles: string;
  availabilityStyles: string;
}

// Props for components that will use the shared layout
export interface SharedProductCardProps {
  product: Product;
  locale: string;
  onAddToCart?: (product: Product) => void;
  className?: string;
  featured?: boolean;
  loading?: boolean;
}

export interface ProductCardProps extends SharedProductCardProps {
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  viewMode?: "grid" | "list";
}

export interface ProductTeaserProps extends SharedProductCardProps {
  // Additional teaser-specific props can be added here
}
