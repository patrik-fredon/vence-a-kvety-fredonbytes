"use client";

import React from "react";
import { ProductGrid } from "./ProductGrid";
import {
  ProductComponentErrorBoundary,
  ProductFiltersErrorFallback,
  useProductErrorHandler
} from "./ProductComponentErrorBoundary";
import { ProductFilters as ProductFiltersComponent } from "./ProductFilters";
import type { Category, Product } from "@/types";

interface ProductGridWithErrorBoundaryProps {
  initialProducts?: Product[];
  initialCategories?: Category[];
  locale: string;
  className?: string;
  onAddToCart?: (product: Product) => void;
}

/**
 * ProductGrid wrapped with error boundaries for graceful error handling
 * This demonstrates how to integrate error boundaries with existing product components
 */
export function ProductGridWithErrorBoundary(props: ProductGridWithErrorBoundaryProps) {
  const { handleAsyncError } = useProductErrorHandler();

  const handleAddToCartWithErrorHandling = React.useCallback((product: Product) => {
    try {
      props.onAddToCart?.(product);
    } catch (error) {
      handleAsyncError(error as Error, {
        componentName: "ProductGrid",
        action: "addToCart",
        productId: product.id,
        additionalData: { productSlug: product.slug },
      });
    }
  }, [props.onAddToCart, handleAsyncError]);

  return (
    <ProductComponentErrorBoundary
      componentName="ProductGrid"
      onError={(error, errorInfo) => {
        // Custom error handling for ProductGrid
        console.error("ProductGrid error:", { error, errorInfo });

        // Could send to analytics or error reporting service
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "exception", {
            description: `ProductGrid error: ${error.message}`,
            fatal: false,
          });
        }
      }}
    >
      <ProductGrid
        {...props}
        onAddToCart={handleAddToCartWithErrorHandling}
      />
    </ProductComponentErrorBoundary>
  );
}

/**
 * ProductFilters wrapped with error boundary for graceful degradation
 */
interface ProductFiltersWithErrorBoundaryProps {
  categories: Category[];
  filters: any;
  sortOptions: any;
  onFiltersChange: (filters: any) => void;
  onSortChange: (sort: any) => void;
  locale: string;
}

export function ProductFiltersWithErrorBoundary(props: ProductFiltersWithErrorBoundaryProps) {
  return (
    <ProductComponentErrorBoundary
      componentName="ProductFilters"
      fallbackComponent={
        <ProductFiltersErrorFallback
          componentName="ProductFilters"
          onRetry={() => window.location.reload()}
        />
      }
    >
      <ProductFiltersComponent {...props} />
    </ProductComponentErrorBoundary>
  );
}

/**
 * Example of how to create a resilient product page with multiple error boundaries
 */
interface ResilientProductPageProps {
  initialProducts?: Product[];
  initialCategories?: Category[];
  locale: string;
  onAddToCart?: (product: Product) => void;
}

export function ResilientProductPage({
  initialProducts = [],
  initialCategories = [],
  locale,
  onAddToCart,
}: ResilientProductPageProps) {
  const [filters, setFilters] = React.useState({});
  const [sortOptions, setSortOptions] = React.useState({
    field: "created_at",
    direction: "desc" as const,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters with error boundary */}
      <div className="mb-8">
        <ProductFiltersWithErrorBoundary
          categories={initialCategories}
          filters={filters}
          sortOptions={sortOptions}
          onFiltersChange={setFilters}
          onSortChange={setSortOptions}
          locale={locale}
        />
      </div>

      {/* Product grid with error boundary */}
      <ProductGridWithErrorBoundary
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        locale={locale}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
