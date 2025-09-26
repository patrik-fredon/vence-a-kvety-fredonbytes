"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProductGridSkeleton } from "@/components/ui/LoadingSpinner";
import { useAnnouncer } from "@/lib/accessibility/hooks";
import { cn } from "@/lib/utils";
import { hasRequiredCustomizations, hasCustomizations } from "@/lib/utils/productCustomization";
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

export function ProductGrid({
  initialProducts = [],
  initialCategories = [],
  locale,
  className,
  onAddToCart,
}: ProductGridProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const announce = useAnnouncer();

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

  const PRODUCTS_PER_PAGE = 12;

  // Load view mode preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("product-view-mode") as "grid" | "list" | null;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode preference to localStorage
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("product-view-mode", mode);
    announce(mode === "grid" ? t("switchedToGrid") : t("switchedToList"), "polite");
  };

  // Fetch products from API
  const fetchProducts = useCallback(
    async (page: number = 1, resetProducts: boolean = false) => {
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

        const response = await fetch(`/api/products?${searchParams.toString()}`);

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
              count: newProducts.length,
              total: pagination?.total || 0,
            }),
            "polite"
          );
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [filters, sortOptions, locale, announce, t]
  );

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key as keyof ProductFilters] !== undefined &&
      filters[key as keyof ProductFilters] !== ""
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
    }
  }, [initialProducts.length, hasActiveFilters]);

  // Fetch products when filters or sort options change
  useEffect(() => {
    // Always fetch when filters are active, or when sort options change, or when no initial products
    if (hasActiveFilters || initialProducts.length === 0) {
      fetchProducts(1, true);
    }
  }, [filters, locale]); // Separate useEffect for filters

  // Fetch products when sort options change (always, regardless of filters)
  useEffect(() => {
    fetchProducts(1, true);
  }, [sortOptions]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // fetchProducts will be called by useEffect due to filters dependency
  };

  // Handle sort changes
  const handleSortChange = (newSort: ProductSortOptions) => {
    setSortOptions(newSort);
    setCurrentPage(1);
    // fetchProducts will be called by useEffect due to sortOptions dependency
  };

  // Load more products (pagination)
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProducts(currentPage + 1, false);
    }
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
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
  };;;

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
                  count: products.length,
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
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
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
        {!error && (
          <>
            {products.length > 0 ? (
              <div
                className={cn(
                  viewMode === "grid"
                    ? // Clean, minimal responsive grid
                    "grid mb-12 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                    : // List view: Clean single column layout
                    "flex flex-col gap-6 mb-12"
                )}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    onAddToCart={handleAddToCart}
                    featured={product.featured}
                    viewMode={viewMode}
                    className="transition-all duration-200 hover:scale-[1.02]"
                  />
                ))}
              </div>
            ) : !loading ? (
              // No Results State
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-amber-100">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
            ) : null}
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {products.length === 0 ? (
              <div
                className={cn(
                  "grid",
                  // Use same responsive grid for loading skeleton
                  "grid-cols-1 gap-4",
                  "sm:grid-cols-2 sm:gap-6",
                  "lg:grid-cols-3 lg:gap-8",
                  "xl:grid-cols-4",
                  "2xl:grid-cols-5"
                )}
              >
                <ProductGridSkeleton count={PRODUCTS_PER_PAGE} />
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
        {!loading && hasMore && products.length > 0 && (
          <div className="text-center pt-8">
            <Button variant="outline" onClick={loadMore} size="lg">
              {t("loadMore")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
