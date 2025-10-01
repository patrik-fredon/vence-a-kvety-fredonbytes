"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type {
  Category,
  ProductFilters as ProductFiltersType,
  ProductSortOptions,
} from "@/types/product";

interface ProductFiltersProps {
  categories: Category[];
  filters: ProductFiltersType;
  sortOptions: ProductSortOptions;
  onFiltersChange: (filters: ProductFiltersType) => void;
  onSortChange: (sort: ProductSortOptions) => void;
  locale: string;
  className?: string;
}

export function ProductFilters({
  categories,
  filters,
  sortOptions: _sortOptions,
  onFiltersChange,
  onSortChange: _onSortChange,
  locale,
  className,
}: ProductFiltersProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");

  const [isSearchAndFiltersVisible, setIsSearchAndFiltersVisible] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
    setSearchValue(filters.search || "");
  }, [filters]);

  // Debounced search function with useRef to avoid stale closures
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback(
    (searchTerm: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        // Use functional update to get the latest localFilters
        setLocalFilters((currentFilters) => {
          const { search: _, ...filtersWithoutSearch } = currentFilters;
          const newFilters = searchTerm
            ? { ...currentFilters, search: searchTerm }
            : filtersWithoutSearch;
          onFiltersChange(newFilters);
          return newFilters;
        });
      }, 300); // 300ms debounce
    },
    [onFiltersChange]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key: keyof ProductFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };



  const clearFilters = () => {
    const clearedFilters: ProductFiltersType = {};
    setLocalFilters(clearedFilters);
    setSearchValue("");
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).some(
    (key) =>
      localFilters[key as keyof ProductFiltersType] !== undefined &&
      localFilters[key as keyof ProductFiltersType] !== ""
  );

  const toggleSearchAndFilters = () => {
    setIsSearchAndFiltersVisible(!isSearchAndFiltersVisible);
  };

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSearchAndFiltersVisible) {
        setIsSearchAndFiltersVisible(false);
      }
    };

    if (isSearchAndFiltersVisible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchAndFiltersVisible]);

  return (
    <div className={cn("bg-teal-800 text-amber-100", className)}>
      {/* Search & Filters Toggle Button */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={toggleSearchAndFilters}
          className="flex items-center gap-2 bg-teal-800 text-amber-100 hover:bg-teal-800 border-amber-100 hover:border-amber-100"
          aria-expanded={isSearchAndFiltersVisible}
          aria-controls="filters-panel"
          aria-label={isSearchAndFiltersVisible ? t("hideSearch") : t("showSearch")}
        >
          <span aria-hidden="true">🔍</span>
          <span>{isSearchAndFiltersVisible ? t("hideSearch") : t("showSearch")}</span>
          {hasActiveFilters && (
            <span
              className="ml-2 px-2 py-1 bg-teal-800 text-amber-100 text-xs rounded-full"
              aria-label={`${Object.keys(localFilters).filter(
                (key) =>
                  localFilters[key as keyof ProductFiltersType] !== undefined &&
                  localFilters[key as keyof ProductFiltersType] !== ""
              ).length} active filters`}
            >
              {
                Object.keys(localFilters).filter(
                  (key) =>
                    localFilters[key as keyof ProductFiltersType] !== undefined &&
                    localFilters[key as keyof ProductFiltersType] !== ""
                ).length
              }
            </span>
          )}
        </Button>
      </div>

      {/* Search & Filters Panel - Collapsible with amber background */}
      {isSearchAndFiltersVisible && (
        <div
          id="filters-panel"
          className="space-y-6 p-4 bg-teal-800 rounded-lg border border-amber-200 shadow-sm"
          role="region"
          aria-labelledby="filters-heading"
        >
          {/* Close Button */}
          <div className="flex items-center justify-between">
            <h3 id="filters-heading" className="text-sm font-medium text-amber-100">{t("searchAndFilters")}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchAndFiltersVisible(false)}
              className="text-amber-100 hover:text-teal-800 hover:bg-amber-100"
              aria-label="Close filters panel"
            >
              <span aria-hidden="true">✕</span>
            </Button>
          </div>

          {/* Search Input */}
          <div>
            <Input
              id="product-search"
              type="text"
              label={tCommon("search")}
              placeholder={t("searchPlaceholder")}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-teal-900 text-amber-100 border-amber-100 "
              autoFocus
              aria-describedby={searchValue ? "search-status" : undefined}
            />
            {searchValue && (
              <div id="search-status" className="mt-2 text-xs text-amber-100" role="status" aria-live="polite">
                {t("searchingFor", { query: searchValue })}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-amber-100 mb-2">
              {t("filterByCategory")}
            </label>
            <select
              id="category-filter"
              value={localFilters.categoryId || ""}
              onChange={(e) => handleFilterChange("categoryId", e.target.value || undefined)}
              className="w-full px-3 py-2 border border-amber-100 rounded-md  bg-teal-800 text-amber-100"
              aria-label={t("filterByCategory")}
            >
              <option value="">{t("allCategories")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name[locale as keyof typeof category.name]}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-amber-100 mb-2">
                {t("filterByPrice")}
              </legend>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="min-price"
                  type="number"
                  label={t("priceFrom")}
                  placeholder={t("priceFrom")}
                  value={localFilters.minPrice || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minPrice",
                      e.target.value ? Number.parseFloat(e.target.value) : undefined
                    )
                  }
                  min="0"
                  className="bg-teal-800 text-amber-100 border-amber-100"
                  aria-describedby="price-range-help"
                />
                <Input
                  id="max-price"
                  type="number"
                  label={t("priceTo")}
                  placeholder={t("priceTo")}
                  value={localFilters.maxPrice || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxPrice",
                      e.target.value ? Number.parseFloat(e.target.value) : undefined
                    )
                  }
                  min="0"
                  className="bg-teal-800 text-amber-100 border-amber-100 focus:border-amber-100 focus:ring-amber-100"
                  aria-describedby="price-range-help"
                />
              </div>
              <div id="price-range-help" className="sr-only">
                Enter minimum and maximum price range for filtering products
              </div>
            </fieldset>
          </div>

          {/* Availability Filters */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-amber-100 mb-2">
                {t("availability")}
              </legend>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    id="in-stock-filter"
                    type="checkbox"
                    checked={localFilters.inStock}
                    onChange={(e) => handleFilterChange("inStock", e.target.checked || undefined)}
                    className="mr-2 rounded border-amber-100 text-amber-100  bg-teal-800"
                    aria-describedby="in-stock-help"
                  />
                  <span className="text-sm text-amber-100">{t("inStockOnly")}</span>
                </label>
                <div id="in-stock-help" className="sr-only">
                  Filter to show only products that are currently in stock
                </div>
                <label className="flex items-center">
                  <input
                    id="featured-filter"
                    type="checkbox"
                    checked={localFilters.featured}
                    onChange={(e) => handleFilterChange("featured", e.target.checked || undefined)}
                    className="mr-2 rounded border-amber-100 text-amber-100  bg-teal-800"
                    aria-describedby="featured-help"
                  />
                  <span className="text-sm text-amber-100">{t("featuredOnly")}</span>
                </label>
                <div id="featured-help" className="sr-only">
                  Filter to show only featured products
                </div>
              </div>
            </fieldset>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full bg-teal-950 text-amber-100 border-amber-100 hover:bg-amber-200 hover:text-teal-800"
            >
              {t("clearFilters")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
