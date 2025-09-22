"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Category,
  ProductFilters as ProductFiltersType,
  ProductSortOptions,
} from "@/types/product";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

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
  sortOptions,
  onFiltersChange,
  onSortChange,
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
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedSearch = useCallback((searchTerm: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Use functional update to get the latest localFilters
      setLocalFilters(currentFilters => {
        const newFilters = { ...currentFilters, search: searchTerm || undefined };
        onFiltersChange(newFilters);
        return newFilters;
      });
    }, 300); // 300ms debounce
  }, [onFiltersChange]);

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

  const handleSortChange = (
    field: ProductSortOptions["field"],
    direction?: ProductSortOptions["direction"]
  ) => {
    const newSort = {
      field,
      direction: direction || sortOptions.direction,
    };
    console.log('📊 [ProductFilters] Sort change:', newSort);
    onSortChange(newSort);
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

  return (
    <div className={cn("bg-amber-100 rounded-lg ", className)}>
      {/* Search & Filters Toggle Button */}
      <div className="mb-4 text-amber-100">
        <Button
          variant="outline"
          onClick={toggleSearchAndFilters}
          className="flex items-center gap-2 bg-teal-900 text-amber-100 hover:text-teal-900"
        >
          <span>🔍</span>
          <span>{isSearchAndFiltersVisible ? t("hideSearch") : t("showSearch")}</span>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 text-amber-100 text-xs rounded-full">
              {Object.keys(localFilters).filter(key =>
                localFilters[key as keyof ProductFiltersType] !== undefined &&
                localFilters[key as keyof ProductFiltersType] !== ""
              ).length}
            </span>
          )}
        </Button>
      </div>

      {/* Search & Filters Panel - Collapsible */}
      {isSearchAndFiltersVisible && (
        <div className="space-y-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
          {/* Close Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-amber-100">{t("searchAndFilters")}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchAndFiltersVisible(false)}
              className="text-amber-100 hover:text-stone-700"
            >
              ✕
            </Button>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {tCommon("search")}
            </label>
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
              autoFocus
            />
            {searchValue && (
              <div className="mt-2 text-xs text-stone-600">
                {t("searchingFor", { query: searchValue })}
              </div>
            )}
          </div>



          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t("filterByCategory")}
            </label>
            <select
              value={localFilters.categoryId || ""}
              onChange={(e) => handleFilterChange("categoryId", e.target.value || undefined)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t("filterByPrice")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder={t("priceFrom")}
                value={localFilters.minPrice || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "minPrice",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                min="0"
              />
              <Input
                type="number"
                placeholder={t("priceTo")}
                value={localFilters.maxPrice || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "maxPrice",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                min="0"
              />
            </div>
          </div>

          {/* Availability Filters */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t("availability")}
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.inStock || false}
                  onChange={(e) => handleFilterChange("inStock", e.target.checked || undefined)}
                  className="mr-2 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">{t("inStockOnly")}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.featured || false}
                  onChange={(e) => handleFilterChange("featured", e.target.checked || undefined)}
                  className="mr-2 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">{t("featuredOnly")}</span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="w-full">
              {t("clearFilters")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
