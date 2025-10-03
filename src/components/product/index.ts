export { ProductCard } from "./ProductCard";
export { ProductCardLayout } from "./ProductCardLayout";
export { ProductCustomizer } from "./ProductCustomizer";
export { ProductImage } from "./ProductImage";
export { ProductImageHover } from "./ProductImageHover";
export { OptimizedProductCustomizer } from "./OptimizedProductCustomizer";
export { ProductDetail } from "./ProductDetail";
export { ProductDetailImageGrid } from "./ProductDetailImageGrid";
export { ProductFilters } from "./ProductFilters";
export { ProductGrid } from "./ProductGrid";
export { ProductImageGallery } from "./ProductImageGallery";
export { ProductInfo } from "./ProductInfo";
export { ProductTeaser } from "./ProductTeaser";
export { RandomProductTeasers } from "./RandomProductTeasers";
export { SizeSelector } from "./SizeSelector";
export { RibbonConfigurator } from "./RibbonConfigurator";
export { LazyRibbonConfigurator } from "./LazyRibbonConfigurator";
export { PriceBreakdown } from "./PriceBreakdown";

// Error boundary components
export {
  ProductComponentErrorBoundary,
  ProductErrorFallback,
  ProductCardErrorFallback,
  ProductFiltersErrorFallback,
  ProductGridErrorFallback,
  NavigationErrorBoundary,
  NavigationErrorFallback,
  ImageErrorBoundary,
  ImageErrorFallback,
  withProductErrorBoundary,
} from "./ProductComponentErrorBoundary";

// Error handling hooks
export {
  useProductErrorHandler,
  withProductErrorHandling,
} from "./useProductErrorHandler";

// Error boundary integrations
export {
  ProductGridWithErrorBoundary,
  ProductFiltersWithErrorBoundary,
  ResilientProductPage,
} from "./ProductGridWithErrorBoundary";

// Error testing utilities (development only)
export { ErrorTestingDashboard, HOCErrorTest } from "./ErrorTestingUtils";

// Export shared types
export type {
  ProductCardVariant,
  ProductCardActionType,
  ProductCardLayoutProps,
  ProductCardActionConfig,
  SharedProductCardProps,
  ProductCardProps,
  ProductTeaserProps,
} from "./types";
