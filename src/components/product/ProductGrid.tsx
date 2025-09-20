"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Product, Category, ProductFilters, ProductSortOptions, ApiResponse } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductFilters as ProductFiltersComponent } from "./ProductFilters";
import { ProductGridSkeleton } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { KeyboardNavigationGrid } from "@/components/accessibility/KeyboardNavigationGrid";
import { useAnnouncer } from "@/lib/accessibility/hooks";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  initialProducts?: Product[];
  initialCategories?: Category[];
  locale: string;
  className?: string;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (productId: string) => void;
  favoriteProductIds?: string[];
}

export function ProductGrid({
  initialProducts = [],
  initialCategories = [],
  locale,
  className,
  onAddToCart,
  onToggleFavorite,
  favoriteProductIds = [],
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

  // Filter and sort state
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortOptions, setSortOptions] = useState<ProductSortOptions>({
    field: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const PRODUCTS_PER_PAGE = 12;

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
            'polite'
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

  // Load initial products or when filters/sort change
  useEffect(() => {
    if (initialProducts.length === 0) {
      fetchProducts(1, true);
    } else {
      // Use initial products if API fails
      setTotalProducts(initialProducts.length);
    }
  }, [fetchProducts, initialProducts.length]);

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
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      // Default behavior - TODO: Implement cart functionality in later tasks
      console.log("Added to cart:", product.name[locale as keyof typeof product.name]);
      // Could show a toast notification here
    }
  };

  // Organize products for grid layout with featured products
  const organizeProductsForGrid = (products: Product[]) => {
    const featuredProducts = products.filter(p => p.featured);
    const regularProducts = products.filter(p => !p.featured);

    // Interleave featured products with regular products
    // Place featured products at strategic positions (every 6-8 products)
    const organizedProducts: Array<{ product: Product; featured: boolean }> = [];
    let regularIndex = 0;
    let featuredIndex = 0;

    for (let i = 0; i < products.length; i++) {
      // Place featured product every 6 positions, starting from position 2
      if (featuredIndex < featuredProducts.length && (i === 1 || (i > 1 && (i - 1) % 6 === 0))) {
        organizedProducts.push({ product: featuredProducts[featuredIndex], featured: true });
        featuredIndex++;
      } else if (regularIndex < regularProducts.length) {
        organizedProducts.push({ product: regularProducts[regularIndex], featured: false });
        regularIndex++;
      }
    }

    return organizedProducts;
  };

  const organizedProducts = organizeProductsForGrid(products);

  return (
    <section className={cn("bg-stone-50 py-8", className)}>
      <div className="container mx-auto px-4">
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

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-stone-600">
            {totalProducts > 0 && (
              <span>
                {t("showingResults", {
                  count: products.length,
                  total: totalProducts,
                })}
              </span>
            )}
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
            {organizedProducts.length > 0 ? (
              <KeyboardNavigationGrid
                className={cn(
                  // Responsive grid: 1 col mobile, 2 tablet, 3 desktop
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8",
                  // Auto-fit for featured products that span 2 columns
                  "auto-rows-max"
                )}
                columns={3}
                orientation="both"
                ariaLabel={t("title")}
                onItemActivate={(index, element) => {
                  // Handle Enter/Space key activation
                  const link = element.querySelector('a');
                  if (link) {
                    link.click();
                  }
                }}
              >
                {organizedProducts.map(({ product, featured }, index) => (
                  <div
                    key={product.id}
                    data-keyboard-nav-item
                    tabIndex={index === 0 ? 0 : -1}
                    className={cn(
                      // Featured products span 2 columns on tablet and desktop
                      featured && "md:col-span-2 lg:col-span-2"
                    )}
                  >
                    <ProductCard
                      product={product}
                      locale={locale}
                      onAddToCart={handleAddToCart}
                      onToggleFavorite={onToggleFavorite}
                      isFavorite={favoriteProductIds.includes(product.id)}
                      featured={featured}
                      className="h-full" // Ensure cards fill their container height
                    />
                  </div>
                ))}
              </KeyboardNavigationGrid>
            ) : !loading ? (
              // No Results State
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold text-stone-700 mb-2">{t("noResults")}</h3>
                <p className="text-stone-500 mb-6">{t("noResultsDescription")}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({});
                    setSortOptions({ field: "created_at", direction: "desc" });
                  }}
                >
                  {t("clearFilters")}
                </Button>
              </div>
            ) : null}

            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                {products.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ProductGridSkeleton count={PRODUCTS_PER_PAGE} />
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-stone-600">{tCommon("loading")}</span>
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
          </>
        )}
      </div>
    </section>
  );
}
