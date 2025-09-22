"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  locale: string;
  onAddToCart?: (product: Product) => void;
  className?: string;
  featured?: boolean;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({
  product,
  locale,
  onAddToCart,
  className,
  featured = false,
  onToggleFavorite,
  isFavorite = false,
  viewMode = 'grid'
}: ProductCardProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  return (
    <article
      className={cn(
        // Base card styles with improved responsive design
        "group bg-stone-200 overflow-hidden transition-all duration-300",
        "hover:shadow-lg rounded-lg",
        // Focus styles for keyboard navigation
        "focus-within:ring-2 focus-within:ring-stone-500 focus-within:ring-offset-2",
        // Layout based on view mode with better responsive handling
        viewMode === 'grid'
          ? "flex flex-col h-full hover:-translate-y-1"
          : "flex flex-row items-center gap-4 p-4",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/${locale}/products/${product.id}`}
        className={cn(
          "block",
          viewMode === 'grid'
            ? "h-full flex flex-col"
            : "flex-1 flex items-center gap-4"
        )}
      >
        {/* Product Image */}
        <div className={cn(
          "relative overflow-hidden bg-stone-100",
          viewMode === 'grid'
            ? // Grid view: responsive aspect ratio
            "aspect-square w-full"
            : // List view: fixed size
            "w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md"
        )}>
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "absolute top-2 right-2 z-10 p-1.5 sm:p-2 rounded-full transition-all duration-200",
              "bg-white/80 hover:bg-white shadow-sm hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-1",
              isFavorite ? "text-red-500" : "text-stone-400 hover:text-red-500"
            )}
            aria-label={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
          >
            <span className={cn(
              viewMode === 'grid' ? "text-base sm:text-lg" : "text-sm"
            )}>
              {isFavorite ? "❤️" : "🤍"}
            </span>
          </button>

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-2 left-2 z-10">
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium",
                "bg-amber-100 text-amber-800 border border-amber-200",
                viewMode === 'grid' ? "text-xs" : "text-xs"
              )}>
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
                  viewMode === 'grid'
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
                  viewMode === 'grid'
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
              <span className={cn(
                "text-white font-medium px-2 py-1 bg-red-600 rounded-full",
                viewMode === 'grid' ? "text-xs sm:text-sm" : "text-xs"
              )}>
                {t("outOfStock")}
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={cn(
          "flex flex-col",
          viewMode === 'grid'
            ? "p-3 sm:p-4 flex-1 min-h-0"
            : "flex-1 min-w-0"
        )}>
          {/* Product Name */}
          <h3 className={cn(
            "font-medium text-stone-900 group-hover:text-stone-700 transition-colors",
            viewMode === 'grid'
              ? "text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 line-clamp-2"
              : "text-sm sm:text-base mb-1 truncate"
          )}>
            {product.name[locale as keyof typeof product.name]}
          </h3>

          {/* Category */}
          {product.category && (
            <p className={cn(
              "text-stone-500 mb-1 sm:mb-2",
              viewMode === 'grid' ? "text-xs sm:text-sm" : "text-xs"
            )}>
              {product.category.name[locale as keyof typeof product.category.name]}
            </p>
          )}

          {/* Price */}
          <div className={cn(
            "flex items-center gap-2",
            viewMode === 'grid' ? "mb-2 sm:mb-4" : "mb-2"
          )}>
            <span className={cn(
              "font-semibold text-stone-900",
              viewMode === 'grid' ? "text-base sm:text-lg lg:text-xl" : "text-sm sm:text-base"
            )}>
              {formatPrice(product.basePrice)}
            </span>
            {product.finalPrice && product.finalPrice < product.basePrice && (
              <span className={cn(
                "text-stone-500 line-through",
                viewMode === 'grid' ? "text-xs sm:text-sm" : "text-xs"
              )}>
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button - Only in grid view */}
          {viewMode === 'grid' && (
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
        {viewMode === 'list' && (
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
    </article>
  );
}
