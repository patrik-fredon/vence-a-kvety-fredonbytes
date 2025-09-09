'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Product, Category, ProductFilters, ProductSortOptions, ApiResponse } from '@/types';
import { ProductCard } from './ProductCard';
import { ProductFilters as ProductFiltersComponent } from './ProductFilters';
import { ProductGridSkeleton } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

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
  onAddToCart
}: ProductGridProps) {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');

  // State management
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Filter and sort state
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortOptions, setSortOptions] = useState<ProductSortOptions>({
    field: 'created_at',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const PRODUCTS_PER_PAGE = 12;

  // Fetch products from API
  const fetchProducts = useCallback(async (
    page: number = 1,
    resetProducts: boolean = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      // Add pagination
      searchParams.set('page', page.toString());
      searchParams.set('limit', PRODUCTS_PER_PAGE.toString());
      searchParams.set('locale', locale);

      // Add filters
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.categoryId) searchParams.set('categoryId', filters.categoryId);
      if (filters.minPrice !== undefined) searchParams.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) searchParams.set('maxPrice', filters.maxPrice.toString());
      if (filters.inStock) searchParams.set('inStock', 'true');
      if (filters.featured) searchParams.set('featured', 'true');

      // Add sorting
      searchParams.set('sortField', sortOptions.field);
      searchParams.set('sortDirection', sortOptions.direction);

      const response = await fetch(`/api/products?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ApiResponse<Product[]> = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch products');
      }

      const newProducts = data.data || [];
      const pagination = data.pagination;

      if (resetProducts || page === 1) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      setTotalProducts(pagination?.total || 0);
      setHasMore(page < (pagination?.totalPages || 1));
      setCurrentPage(page);

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, sortOptions, locale]);

  // Load initial products or when filters/sort change
  useEffect(() => {
    if (initialProducts.length === 0) {
      fetchProducts(1, true);
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
      // Default behavior - could show a toast or redirect
      console.log('Added to cart:', product.name);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      <ProductFiltersComponent
        categories={categories}
        filters={filters}
        sortOptions={sortOptions}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        locale={locale}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          {totalProducts > 0 && (
            <span>
              {t('showingResults', {
                count: products.length,
                total: totalProducts
              })}
            </span>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-2">{tCommon('error')}</p>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => fetchProducts(1, true)}
            size="sm"
          >
            Zkusit znovu
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!error && (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : !loading ? (
            // No Results State
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                {t('noResults')}
              </h3>
              <p className="text-neutral-500 mb-4">
                {t('noResultsDescription')}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setSortOptions({ field: 'created_at', direction: 'desc' });
                }}
              >
                {t('clearFilters')}
              </Button>
            </div>
          ) : null}

          {/* Loading State */}
          {loading && (
            <div className="space-y-6">
              {products.length === 0 ? (
                <ProductGridSkeleton count={PRODUCTS_PER_PAGE} />
              ) : (
                <div className="flex justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-neutral-600">{tCommon('loading')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Load More Button */}
          {!loading && hasMore && products.length > 0 && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                size="lg"
              >
                {t('loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
