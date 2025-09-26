"use client";

import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProductGridSkeleton } from "@/components/ui/LoadingSpinner";
import { useAnnouncer } from "@/lib/accessibility/hooks";
import { useImageOptimization } from "@/lib/hooks/useImageOptimization";
import { useCoreWebVitals } from "@/lib/hooks";
import { useJavaScriptOptimization } from "@/lib/utils/javascript-optimization";
import { cn } from "@/lib/utils";
import { hasCustomizations, hasRequiredCustomizations } from "@/lib/utils/productCustomization";
import type { ApiResponse, Category, Product, ProductFilters, ProductSortOptions } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductFilters as ProductFiltersComponent } from "./ProductFilters";

interface ProductGridProps {
  initialProducts?: Product[];
  initialCategories?: Category[];
  locale: string;
  className?: string;
  onAddToCart?: (product: Product) => void;
}

const ProductGrid = React.memo(function ProductGrid({
  initialProducts = [],
  initialCategories = [],
  locale,
  className,
  onAddToCart,
}: ProductGridProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const announce = useAnnouncer();
  const loadMoreDescriptionId = useId();

  // State management
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter and sort state
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortOptions, setSortOptions] = useState<ProductSortOptions>({
    field: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Progressive loading state - display 8 products initially (2 rows of 4)
  const [displayedCount, setDisplayedCount] = useState(8);

  // Updated constants for 4-column grid layout
  const INITIAL_PRODUCTS_COUNT = 8; // Show 8 products initially (2 rows of 4)
  const PRODUCTS_PER_PAGE = 12; // Keep API pagination at 12 for efficiency

  // Image optimization hook for managing priority loading and lazy loading
  const imageOptimization = useImageOptimization({
    priorityCount: INITIAL_PRODUCTS_COUNT, // First 8 products get priority loading
    enableLazyLoading: true,
    rootMargin: "100px", // Start loading images 100px before they come into view
  });

  // Core Web Vitals optimization - DISABLED in development to prevent cascading errors
  const coreWebVitals = useCoreWebVitals({
    componentName: 'ProductGrid',
    enabled: process.env.NODE_ENV !== 'development', // Disabled in development
    trackCLS: process.env.NODE_ENV !== 'development',
    trackLCP: process.env.NODE_ENV !== 'development',
    trackFID: process.env.NODE_ENV !== 'development',
    reserveImageSpace: true, // Keep for layout stability
    onOptimizationFound: (optimization, metric) => {
      // Only log in production
      if (process.env.NODE_ENV === 'production' && optimization.includes('CRITICAL')) {
        console.warn(`🔧 [ProductGrid] Critical optimization needed for ${metric}:`, optimization);
      }
    },
  });

  // JavaScript optimization
  const { measureExecution, optimizedEventHandler } = useJavaScriptOptimization('ProductGrid');

  // Ref to track ongoing requests for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized displayed products calculation for performance
  const displayedProducts = useMemo(() => {
    return products.slice(0, displayedCount);
  }, [products, displayedCount]);

  // Check if more products can be loaded from current products array
  const canLoadMore = displayedCount < products.length;

  // Memoized active filters check for performance
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(
      (key) =>
        filters[key as keyof ProductFilters] !== undefined &&
        filters[key as keyof ProductFilters] !== ""
    );
  }, [filters]);

  // Load view mode preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("product-view-mode") as "grid" | "list" | null;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Optimized view mode change handler with useCallback
  const handleViewModeChange = useCallback(
    optimizedEventHandler(async (mode: "grid" | "list") => {
      await measureExecution('viewModeChange', async () => {
        setViewMode(mode);
        localStorage.setItem("product-view-mode", mode);
        announce(mode === "grid" ? t("switchedToGrid") : t("switchedToList"), "polite");
      });
    }, { debounce: 100 }),
    [announce, t, optimizedEventHandler, measureExecution]
  );

  // Optimized fetch products function with abort controller for cleanup
  const fetchProducts = useCallback(
    async (page: number = 1, resetProducts: boolean = false) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();

        // Add pagination
        searchParams.set("page", page.toString());
        searchParams.set("limit", PRODUCTS_PER_PAGE.toString());
        searchParams.set("locale", locale);

        // Add filters
        if (filters.search) searchParams.set("search", filters.search);
        if (filters.categoryId) searchParams.set("categoryId", filters.categoryId);
        if (filters.minPrice !== undefined)
          searchParams.set("minPrice", filters.minPrice.toString());
        if (filters.maxPrice !== undefined)
          searchParams.set("maxPrice", filters.maxPrice.toString());
        if (filters.inStock) searchParams.set("inStock", "true");
        if (filters.featured) searchParams.set("featured", "true");

        // Add sorting
        searchParams.set("sortField", sortOptions.field);
        searchParams.set("sortDirection", sortOptions.direction);

        const response = await fetch(`/api/products?${searchParams.toString()}`, {
          signal: abortController.signal,
        });

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data: ApiResponse<Product[]> = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Failed to fetch products");
        }

        const newProducts = data.data || [];
        const pagination = data.pagination;

        if (resetProducts || page === 1) {
          setProducts(newProducts);
          // Reset displayed count to initial when getting new products
          setDisplayedCount(INITIAL_PRODUCTS_COUNT);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }

        setTotalProducts(pagination?.total || 0);
        setHasMore(page < (pagination?.totalPages || 1));
        setCurrentPage(page);

        // Announce results to screen readers
        if (resetProducts || page === 1) {
          announce(
            t("showingResults", {
              count: Math.min(newProducts.length, INITIAL_PRODUCTS_COUNT),
              total: pagination?.total || 0,
            }),
            "polite"
          );
        }
      } catch (err) {
        // Don't set error if request was aborted
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        // Only set loading to false if this is still the current request
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [filters, sortOptions, locale, announce, t]
  );
  // Load initial products or fetch from API
  useEffect(() => {
    if (initialProducts.length === 0 || hasActiveFilters) {
      // Use API if no initial products or if filters are active
      fetchProducts(1, true);
    } else {
      // Use initial products if available and no filters
      setProducts(initialProducts);
      setTotalProducts(initialProducts.length);
      // Set initial displayed count for initial products
      setDisplayedCount(INITIAL_PRODUCTS_COUNT);
    }
  }, [initialProducts.length, hasActiveFilters, fetchProducts, initialProducts]);

  // Fetch products when filters or sort options change
  useEffect(() => {
    // Always fetch when filters are active, or when sort options change, or when no initial products
    if (hasActiveFilters || initialProducts.length === 0) {
      fetchProducts(1, true);
    }
  }, [fetchProducts, hasActiveFilters, initialProducts.length]); // Separate useEffect for filters

  // Fetch products when sort options change (always, regardless of filters)
  useEffect(() => {
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Cleanup effect to abort ongoing requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Optimized filter change handler with useCallback
  const handleFiltersChange = useCallback(
    optimizedEventHandler(async (newFilters: ProductFilters) => {
      await measureExecution('filtersChange', async () => {
        setFilters(newFilters);
        setCurrentPage(1);
        // fetchProducts will be called by useEffect due to filters dependency
      });
    }, { debounce: 300 }),
    [optimizedEventHandler, measureExecution]
  );

  // Optimized sort change handler with useCallback
  const handleSortChange = useCallback(
    optimizedEventHandler(async (newSort: ProductSortOptions) => {
      await measureExecution('sortChange', async () => {
        setSortOptions(newSort);
        setCurrentPage(1);
        // fetchProducts will be called by useEffect due to sortOptions dependency
      });
    }, { debounce: 200 }),
    [optimizedEventHandler, measureExecution]
  );

  // Optimized load more function with useCallback
  const loadMore = useCallback(
    optimizedEventHandler(async () => {
      if (loading) return; // Prevent multiple simultaneous loads

      await measureExecution('loadMore', async () => {
        if (canLoadMore) {
          // Load 4 more products from current products array (1 additional row)
          const newDisplayedCount = Math.min(displayedCount + 4, products.length);
          setDisplayedCount(newDisplayedCount);

          // Announce to screen readers
          announce(
            t("loadedMoreProducts", {
              count: newDisplayedCount - displayedCount,
              total: products.length,
            }),
            "polite"
          );
        } else if (hasMore) {
          // Fetch more products from API
          await fetchProducts(currentPage + 1, false);
        }
      });
    }, { debounce: 500 }),
    [
      loading,
      canLoadMore,
      displayedCount,
      products.length,
      hasMore,
      currentPage,
      fetchProducts,
      announce,
      t,
      optimizedEventHandler,
      measureExecution,
    ]
  );

  // Optimized add to cart handler with useCallback
  const handleAddToCart = useCallback(
    (product: Product) => {
      // If product has customization options, redirect to product detail page instead of adding to cart
      if (hasRequiredCustomizations(product) || hasCustomizations(product)) {
        // Use window.location to navigate to product detail page
        window.location.href = `/${locale}/products/${product.slug}`;
        return;
      }

      // Only add directly to cart if no customization is needed
      if (onAddToCart) {
        onAddToCart(product);
      } else {
        // Default behavior - redirect to product detail page for safety
        window.location.href = `/${locale}/products/${product.slug}`;
      }
    },
    [locale, onAddToCart]
  );

  return (
    <section className={cn("bg-teal-800 py-12 rounded-2xl", className)}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Filters */}
        <div className="mb-8">
          <ProductFiltersComponent
            categories={categories}
            filters={filters}
            sortOptions={sortOptions}
            onFiltersChange={handleFiltersChange}
            onSortChange={handleSortChange}
            locale={locale}
          />
        </div>

        {/* Results Summary and View Switcher */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {totalProducts > 0 && (
              <p className="text-lg font-medium text-amber-800">
                {t("showingResults", {
                  count: displayedProducts.length,
                  total: totalProducts,
                })}
              </p>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-amber-700">{t("viewMode")}:</span>
            <div className="flex bg-white border border-amber-200 rounded-lg overflow-hidden shadow-sm">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("grid")}
                className="rounded-none border-0 px-4 py-2"
                aria-label={t("gridView")}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("list")}
                className="rounded-none border-0 px-4 py-2"
                aria-label={t("listView")}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-white border border-red-200 rounded-lg p-6 text-center mb-8 shadow-sm">
            <p className="text-red-600 mb-2 font-medium">{tCommon("error")}</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchProducts(1, true)} size="sm">
              {t("tryAgain")}
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!error &&
          (displayedProducts.length > 0 ? (
            <div
              className={cn(
                viewMode === "grid"
                  ? // Optimized 4-column responsive grid layout
                  "grid mb-12 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
                  : // List view: Clean single column layout
                  "flex flex-col gap-6 mb-12"
              )}
            >
              {displayedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  onAddToCart={handleAddToCart}
                  featured={product.featured || imageOptimization.shouldPrioritize(index)} // Prioritize first 8 products
                  viewMode={viewMode}
                  className="transition-all duration-200 hover:scale-[1.02]"
                />
              ))}
            </div>
          ) : !loading ? (
            // No Results State
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-amber-100">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-amber-800 mb-3">{t("noResults")}</h3>
              <p className="text-amber-600 mb-8 max-w-md mx-auto">{t("noResultsDescription")}</p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setFilters({});
                  setSortOptions({ field: "created_at", direction: "desc" });
                }}
                className="px-6"
              >
                {t("clearFilters")}
              </Button>
            </div>
          ) : null)}
        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {displayedProducts.length === 0 ? (
              <div
                className={cn(
                  "grid",
                  // Use same 4-column responsive grid for loading skeleton
                  "grid-cols-1 gap-4",
                  "sm:grid-cols-2 sm:gap-6",
                  "lg:grid-cols-4 lg:gap-8",
                  "xl:grid-cols-4"
                )}
              >
                <ProductGridSkeleton count={INITIAL_PRODUCTS_COUNT} />
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-amber-600">{tCommon("loading")}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Load More Button */}
        {(canLoadMore || hasMore) && displayedProducts.length > 0 && (
          <div className="flex flex-col items-center pt-12 pb-4 space-y-4">
            {/* Progress indicator */}
            {totalProducts > 0 && (
              <div className="text-center mb-4">
                <p className="text-sm text-amber-700 mb-2">
                  {t("showingOf", {
                    showing: displayedProducts.length,
                    total: totalProducts,
                  })}
                </p>
                <div className="w-64 bg-amber-100 rounded-full h-2 mx-auto">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${Math.min((displayedProducts.length / totalProducts) * 100, 100)}%`,
                    }}
                    role="progressbar"
                    aria-valuenow={displayedProducts.length}
                    aria-valuemin={0}
                    aria-valuemax={totalProducts}
                    aria-label={t("loadingProgress")}
                  />
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={loadMore}
              size="lg"
              disabled={loading}
              loading={loading}
              loadingText={t("loadingMore")}
              className={cn(
                "px-8 py-3 min-w-[200px] font-medium",
                "bg-white border-2 border-amber-600 text-amber-700",
                "hover:bg-amber-50 hover:border-amber-700 hover:text-amber-800",
                "focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200 ease-in-out",
                "shadow-sm hover:shadow-md"
              )}
              aria-describedby={loadMoreDescriptionId}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <span>{t("loadingMore")}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{t("loadMore")}</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-y-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              )}
            </Button>

            {/* Accessible description */}
            <p
              id={loadMoreDescriptionId}
              className="text-xs text-amber-600 text-center max-w-md sr-only"
            >
              {canLoadMore
                ? t("loadMoreFromCurrent", { remaining: products.length - displayedCount })
                : t("loadMoreFromServer")}
            </p>

            {/* Show when no more products available */}
            {!(hasMore || canLoadMore) && (
              <div className="text-center py-4">
                <p className="text-sm text-amber-600 font-medium">{t("allProductsLoaded")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
});

export { ProductGrid };
