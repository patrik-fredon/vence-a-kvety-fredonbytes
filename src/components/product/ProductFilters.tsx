"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
  sortOptions,
  onFiltersChange,
  onSortChange,
  locale,
  className,
}: ProductFiltersProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");

  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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
    onSortChange(newSort);
  };

  const clearFilters = () => {
    const clearedFilters: ProductFiltersType = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).some(
    (key) =>
      localFilters[key as keyof ProductFiltersType] !== undefined &&
      localFilters[key as keyof ProductFiltersType] !== ""
  );

  return (
    <div className={cn("bg-white rounded-lg shadow-soft p-4", className)}>
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <span>{tCommon("filter")}</span>
          <span className={cn("transition-transform", isExpanded ? "rotate-180" : "")}>↓</span>
        </Button>
      </div>

      {/* Filters Content */}
      <div
        className={cn(
          "space-y-6",
          "lg:block", // Always visible on desktop
          isExpanded ? "block" : "hidden" // Toggle on mobile
        )}
      >
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {tCommon("search")}
          </label>
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={localFilters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">{t("sortBy")}</label>
          <div className="space-y-2">
            <select
              value={sortOptions.field}
              onChange={(e) => handleSortChange(e.target.value as ProductSortOptions["field"])}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="created_at">{t("sortByNewest")}</option>
              <option value="name">{t("sortByName")}</option>
              <option value="price">{t("sortByPrice")}</option>
              <option value="popularity">{t("sortByPopular")}</option>
            </select>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={sortOptions.direction === "asc" ? "primary" : "outline"}
                onClick={() => handleSortChange(sortOptions.field, "asc")}
                className="flex-1"
              >
                {t("sortAsc")}
              </Button>
              <Button
                size="sm"
                variant={sortOptions.direction === "desc" ? "primary" : "outline"}
                onClick={() => handleSortChange(sortOptions.field, "desc")}
                className="flex-1"
              >
                {t("sortDesc")}
              </Button>
            </div>
          </div>
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
    </div>
  );
}
