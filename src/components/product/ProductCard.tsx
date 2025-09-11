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
}

export function ProductCard({ product, locale, onAddToCart, className }: ProductCardProps) {
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

  const getAvailabilityStatus = () => {
    if (!product.availability.inStock) {
      return { text: t("outOfStock"), className: "text-red-600 bg-red-50" };
    }
    if (product.availability.stockQuantity && product.availability.stockQuantity < 5) {
      return { text: t("limitedStock"), className: "text-orange-600 bg-orange-50" };
    }
    return { text: t("inStock"), className: "text-green-600 bg-green-50" };
  };

  const availability = getAvailabilityStatus();

  return (
    <div
      className={cn(
        "group bg-white rounded-lg shadow-soft overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Link href={`/${locale}/products/${product.slug}`}>
          {primaryImage && (
            <>
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt}
                fill
                className={cn(
                  "object-cover transition-all duration-500",
                  imageLoading ? "scale-110 blur-sm" : "scale-100 blur-0",
                  isHovered && secondaryImage ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage.url}
                  alt={secondaryImage.alt}
                  fill
                  className={cn(
                    "object-cover transition-all duration-500",
                    isHovered ? "opacity-100" : "opacity-0"
                  )}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              )}
            </>
          )}
        </Link>

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 rounded-md text-xs font-medium">
            ⭐ Featured
          </div>
        )}

        {/* Availability Badge */}
        <div
          className={cn(
            "absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium",
            availability.className
          )}
        >
          {availability.text}
        </div>

        {/* Quick Actions Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex gap-2">
            <Link href={`/${locale}/products/${product.slug}`}>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-primary-700 hover:bg-neutral-50"
              >
                {t("customize")}
              </Button>
            </Link>
            {onAddToCart && product.availability.inStock && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
              >
                {t("addToCart")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/${locale}/products/${product.slug}`} className="block">
          <h3 className="font-elegant text-lg font-semibold text-primary-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name[locale as keyof typeof product.name]}
          </h3>
        </Link>

        {product.description && (
          <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
            {product.description[locale as keyof typeof product.description]}
          </p>
        )}

        {/* Category */}
        {product.category && (
          <div className="text-xs text-neutral-500 mb-2">
            {product.category.name[locale as keyof typeof product.category.name]}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-primary-700">
            {formatPrice(product.basePrice)}
          </div>

          {/* Mobile Add to Cart */}
          <div className="sm:hidden">
            {onAddToCart && product.availability.inStock && (
              <Button size="sm" onClick={() => onAddToCart(product)} className="px-3">
                +
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Add to Cart */}
        <div className="hidden sm:block mt-3">
          {onAddToCart && product.availability.inStock && (
            <Button size="sm" onClick={() => onAddToCart(product)} className="w-full">
              {t("addToCart")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
