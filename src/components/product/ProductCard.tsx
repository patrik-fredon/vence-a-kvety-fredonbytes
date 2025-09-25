"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductQuickView } from "./ProductQuickView";

interface ProductCardProps {
  product: Product;
  locale: string;
  onAddToCart?: (product: Product) => void;
  className?: string;
  featured?: boolean;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  viewMode?: "grid" | "list";
}

export function ProductCard({
  product,
  locale,
  onAddToCart,
  className,
  featured = false,
  onToggleFavorite,
  isFavorite = false,
  viewMode = "grid",
}: ProductCardProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary) || product.images[1];

  const formatPrice = (price: number) => {
    return tCurrency("format", {
      amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <article
        className={cn(
          // Base card styles with improved responsive design
          "group bg-teal-800 clip-corners overflow-hidden transition-all duration-300 shadow-lg relative ",
          "hover:shadow-lg rounded-lg",
          // Focus styles for keyboard navigation
          "focus-within:ring-2 focus-within:ring-stone-500 focus-within:ring-offset-2",
          // Layout based on view mode with better responsive handling
          viewMode === "grid"
            ? "flex flex-col h-full hover:-translate-y-1"
            : "flex flex-row items-center gap-4 p-4",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-labelledby={`product-${product.id}-title`}
      >
        <Link
          href={`/${locale}/products/${product.slug}`}
          className={cn(
            "block",
            viewMode === "grid" ? "h-full flex flex-col" : "flex-1 flex items-center gap-4"
          )}
        >
          {/* Product Image */}
          <div
            className={cn(
              "relative overflow-hidden bg-stone-100",
              viewMode === "grid"
                ? // Grid view: responsive aspect ratio
                "aspect-square w-full"
                : // List view: fixed size
                "w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md"
            )}
          >


            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-2 left-2 z-10">
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium",
                    "bg-amber-100 text-amber-800 border border-amber-200",
                    viewMode === "grid" ? "text-xs" : "text-xs"
                  )}
                >
                  {t("featured")}
                </span>
              </div>
            )}

            {/* Product Images */}
            <div className="relative w-full h-full">
              {primaryImage && (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || product.name[locale as keyof typeof product.name]}
                  fill
                  sizes={
                    viewMode === "grid"
                      ? // Responsive sizes for grid view
                      "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
                      : // Fixed size for list view
                      "96px"
                  }
                  className={cn(
                    "object-cover transition-all duration-500",
                    imageLoading && "blur-sm",
                    isHovered && secondaryImage && "opacity-0"
                  )}
                  onLoad={() => setImageLoading(false)}
                  priority={featured}
                />
              )}

              {/* Secondary image on hover */}
              {secondaryImage && (
                <Image
                  src={secondaryImage.url}
                  alt={secondaryImage.alt || product.name[locale as keyof typeof product.name]}
                  fill
                  sizes={
                    viewMode === "grid"
                      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
                      : "96px"
                  }
                  className={cn(
                    "object-cover transition-all duration-500 absolute inset-0",
                    !isHovered && "opacity-0"
                  )}
                  priority={false}
                />
              )}
            </div>

            {/* Stock Status Overlay */}
            {!product.availability.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span
                  className={cn(
                    "text-white font-medium px-2 py-1 bg-red-600 rounded-full",
                    viewMode === "grid" ? "text-xs sm:text-sm" : "text-xs"
                  )}
                >
                  {t("outOfStock")}
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div
            className={cn(
              "flex flex-col",
              viewMode === "grid" ? "p-3 sm:p-4 flex-1 min-h-0" : "flex-1 min-w-0"
            )}
          >
            {/* Product Name */}
            <h3
              id={`product-${product.id}-title`}
              className={cn(
                "font-medium text-stone-900 group-hover:text-stone-700 transition-colors",
                viewMode === "grid"
                  ? "text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 line-clamp-2"
                  : "text-sm sm:text-base mb-1 truncate"
              )}
            >
              {product.name[locale as keyof typeof product.name]}
            </h3>

            {/* Category */}
            {product.category && (
              <p
                className={cn(
                  "text-stone-500 mb-1 sm:mb-2",
                  viewMode === "grid" ? "text-xs sm:text-sm" : "text-xs"
                )}
              >
                {product.category.name[locale as keyof typeof product.category.name]}
              </p>
            )}

            {/* Price */}
            <div
              className={cn(
                "flex items-center gap-2",
                viewMode === "grid" ? "mb-2 sm:mb-4" : "mb-2"
              )}
            >
              <span
                className={cn(
                  "font-semibold text-stone-900",
                  viewMode === "grid" ? "text-base sm:text-lg lg:text-xl" : "text-sm sm:text-base"
                )}
              >
                {formatPrice(product.basePrice)}
              </span>
              {product.finalPrice && product.finalPrice < product.basePrice && (
                <span
                  className={cn(
                    "text-stone-500 line-through",
                    viewMode === "grid" ? "text-xs sm:text-sm" : "text-xs"
                  )}
                >
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>

            {/* Availability Status */}
            <div
              className={cn(
                "flex items-center gap-1.5",
                viewMode === "grid" ? "mb-2 sm:mb-4" : "mb-2"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  product.availability.inStock ? "bg-green-500" : "bg-red-500"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  product.availability.inStock ? "text-green-700" : "text-red-700"
                )}
                role="status"
                aria-label={`${t("availability")}: ${product.availability.inStock ? t("inStock") : t("outOfStock")}`}
              >
                {product.availability.inStock
                  ? product.availability.stockQuantity && product.availability.stockQuantity <= 5
                    ? t("limitedStock")
                    : t("inStock")
                  : t("outOfStock")}
              </span>
            </div>

            {/* Add to Cart Button - Only in grid view */}
            {viewMode === "grid" && (
              <Button
                onClick={handleAddToCart}
                disabled={!product.availability.inStock}
                className={cn(
                  "w-full mt-auto transition-all duration-200",
                  !product.availability.inStock && "opacity-50 cursor-not-allowed"
                )}
                variant={product.availability.inStock ? "default" : "secondary"}
                size="sm"
              >
                <span className="text-xs sm:text-sm">
                  {product.availability.inStock ? t("addToCart") : t("outOfStock")}
                </span>
              </Button>
            )}
          </div>

          {/* List View Add to Cart Button */}
          {viewMode === "list" && (
            <div className="flex-shrink-0">
              <Button
                onClick={handleAddToCart}
                disabled={!product.availability.inStock}
                variant={product.availability.inStock ? "default" : "secondary"}
                size="sm"
              >
                <span className="text-xs sm:text-sm">
                  {product.availability.inStock ? t("addToCart") : t("outOfStock")}
                </span>
              </Button>
            </div>
          )}
        </Link>

        {/* Hover Overlay with Quick Actions - Only in grid view */}
        {viewMode === "grid" && isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-stone-900 shadow-lg"
                onClick={handleQuickView}
              >
                <span className="text-xs">{t("quickView")}</span>
              </Button>
            </div>
          </div>
        )}
      </article>

      {/* Quick View Modal */}
      <ProductQuickView
        product={product}
        locale={locale}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        {...(onAddToCart ? { onAddToCart } : {})}
      />
    </>
  );
}
