"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
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
}

export function ProductCard({
  product,
  locale,
  onAddToCart,
  className,
  featured = false,
  onToggleFavorite,
  isFavorite = false
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
        // Borderless card with subtle hover effects
        "group bg-white overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        // Featured product styling - spans 2 columns
        featured && "md:col-span-2",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-labelledby={`product-${product.id}-title`}
    >
      {/* Product Image Container - 64 height (16rem = 256px) */}
      <div className={cn(
        "relative overflow-hidden bg-stone-50",
        // Standard card: square aspect ratio, Featured card: different aspect ratio
        featured ? "aspect-[2/1] md:aspect-[3/2]" : "aspect-square",
        "h-64" // 64 height as specified
      )}>
        <Link href={`/${locale}/products/${product.slug}`}>
          {primaryImage && (
            <>
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt}
                fill
                className={cn(
                  "object-cover transition-all duration-500",
                  // Scale-on-hover animation
                  "group-hover:scale-105",
                  imageLoading ? "scale-110 blur-sm" : "scale-100 blur-0",
                  isHovered && secondaryImage ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setImageLoading(false)}
                sizes={featured
                  ? "(max-width: 768px) 100vw, 66vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                }
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage.url}
                  alt={secondaryImage.alt}
                  fill
                  className={cn(
                    "object-cover transition-all duration-500 group-hover:scale-105",
                    isHovered ? "opacity-100" : "opacity-0"
                  )}
                  sizes={featured
                    ? "(max-width: 768px) 100vw, 66vw"
                    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                />
              )}
            </>
          )}
        </Link>

        {/* Heart icon for favorites - mobile-friendly touch target */}
        <button
          onClick={handleToggleFavorite}
          className={cn(
            "absolute top-2 right-2 sm:top-3 sm:right-3",
            // Mobile-first: larger touch target (44px minimum)
            "p-3 sm:p-2 min-h-11 min-w-11 sm:min-h-auto sm:min-w-auto",
            "rounded-full bg-white/80 backdrop-blur-sm",
            "transition-all duration-300 hover:bg-white hover:scale-110",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/20",
            "active:scale-95 active:bg-white/90",
            // Mobile: always visible, Desktop: show on hover or if favorited
            "opacity-100 translate-y-0 sm:opacity-100 sm:translate-y-0",
            !isFavorite && "sm:opacity-0 sm:translate-y-2",
            (isHovered || isFavorite) && "sm:opacity-100 sm:translate-y-0"
          )}
          aria-label={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
        >
          {isFavorite ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-stone-600 hover:text-red-500 transition-colors" />
          )}
        </button>

        {/* Category tag */}
        {product.category && (
          <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium">
            {product.category.name[locale as keyof typeof product.category.name]}
          </div>
        )}

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute bottom-3 left-3 bg-amber-600 text-white px-2 py-1 rounded-md text-xs font-medium">
            {t("featured")}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={cn(
        "p-4",
        // Featured products get more padding
        featured && "md:p-6"
      )}>
        <Link href={`/${locale}/products/${product.slug}`} className="block">
          <h3
            id={`product-${product.id}-title`}
            className={cn(
              "font-medium text-stone-900 mb-2 line-clamp-2 group-hover:text-stone-700 transition-colors",
              // Featured products get larger text
              featured ? "text-xl md:text-2xl" : "text-lg"
            )}
          >
            {product.name[locale as keyof typeof product.name]}
          </h3>
        </Link>

        {product.description && (
          <p className={cn(
            "text-stone-600 mb-3 line-clamp-2",
            featured ? "text-base" : "text-sm"
          )}>
            {product.description[locale as keyof typeof product.description]}
          </p>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "font-semibold text-stone-900",
            featured ? "text-xl" : "text-lg"
          )}>
            {formatPrice(product.basePrice)}
          </div>

          {/* Add to cart button with shopping cart icon - mobile optimized */}
          {onAddToCart && product.availability.inStock && (
            <Button
              size={featured ? "default" : "sm"}
              onClick={handleAddToCart}
              className={cn(
                "transition-all duration-300",
                // Mobile: always show full button, Desktop: show on hover or featured
                "px-4 sm:px-4",
                !featured && !isHovered && "sm:px-3",
                // Touch-friendly sizing
                "min-h-11 sm:min-h-auto"
              )}
              icon={<ShoppingCartIcon className="h-4 w-4" />}
              iconPosition="left"
            >
              {/* Mobile: always show text, Desktop: show on hover or featured */}
              <span className="sm:hidden">{t("addToCart")}</span>
              <span className="hidden sm:inline">
                {(isHovered || featured) && t("addToCart")}
              </span>
              <span className="sr-only">{t("addToCart")}</span>
            </Button>
          )}
        </div>

        {/* Availability status */}
        {!product.availability.inStock && (
          <div className="mt-2 text-sm text-red-600 font-medium">
            {t("outOfStock")}
          </div>
        )}
      </div>
    </article>
  );
}
