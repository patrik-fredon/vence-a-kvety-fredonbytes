"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export type ProductCardActionType = "addToCart" | "customize" | "quickView" | "viewDetails";

export interface ProductCardProps {
  product: Product;
  locale: string;
  onAddToCart?: (product: Product) => void;
  className?: string;
  featured?: boolean;
  viewMode?: "grid" | "list";
  variant?: "grid" | "teaser" | "list";
  loading?: boolean;
  onAction?: (product: Product, actionType: string) => void;
  onQuickView?: (product: Product) => void;
  children?: React.ReactNode;
}

interface ActionConfig {
  type: ProductCardActionType;
  text: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

const ProductCardComponent = function ProductCard({
  product,
  locale,
  variant = "grid",
  className,
  featured = false,
  loading = false,
  onAction,
  onQuickView,
  children,
}: ProductCardProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const productName = product.name[locale as keyof typeof product.name];
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const secondaryImage = product.images?.find((img) => !img.isPrimary) || product.images?.[1];

  const formatPrice = useCallback(
    (price: number) => {
      return tCurrency("format", {
        amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
      });
    },
    [locale, tCurrency]
  );

  const handleAction = useCallback(
    (actionType: ProductCardActionType) => {
      onAction?.(product, actionType);
    },
    [product, onAction]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onQuickView?.(product);
    },
    [product, onQuickView]
  );

  // Determine primary action based on product type and customization options
  const getPrimaryAction = (): ActionConfig => {
    const hasCustomizations =
      product.customizationOptions && product.customizationOptions.length > 0;

    if (hasCustomizations) {
      return {
        type: "customize",
        text: t("customize"),
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Customize Icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
        variant: "default" as const,
      };
    }

    return {
      type: "addToCart",
      text: t("addToCart"),
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <title>Add to Cart Icon</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
          />
        </svg>
      ),
      variant: "default" as const,
    };
  };

  const primaryAction = getPrimaryAction();

  // Variant-specific styling
  const getCardStyles = () => {
    const baseStyles = cn(
      "group relative bg-funeral-teal transition-all duration-300 shadow-lg border border-teal-800",
      "focus-within:ring-2 focus-within:ring-stone-500 focus-within:ring-offset-2",
      className
    );

    switch (variant) {
      case "grid":
        return cn(
          baseStyles,
          "overflow-hidden shadow-xl hover:-translate-y-1 clip-corners",
          "h-100 w-full" // Increased height as per requirements
        );

      case "teaser":
        return cn(
          baseStyles,
          "rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 clip-corners",
          "h-auto w-full" // Slightly smaller than grid
        );

      case "list":
        return cn(
          baseStyles,
          "rounded-lg flex flex-row items-stretch overflow-hidden hover:shadow-lg h-64 sm:h-72 md:h-80 corner-clip-container"
        );

      default:
        return baseStyles;
    }
  };

  const getImageContainerStyles = () => {
    switch (variant) {
      case "grid":
      case "teaser":
        return "relative aspect-square  overflow-hidden corner-clip-container";

      case "list":
        return "relative overflow-hidden  w-1/2 h-full flex-shrink-0 corner-clip-container";

      default:
        return "relative aspect-square  overflow-hidden corner-clip-container";
    }
  };

  const getContentStyles = () => {
    switch (variant) {
      case "grid":
        return "absolute bottom-0 left-0 right-0 p-4 z-20";

      case "teaser":
        return "p-6";

      case "list":
        return "w-1/2 p-4 sm:p-6 flex flex-col justify-between";

      default:
        return "p-4";
    }
  };

  // Render product image
  const renderImage = () => (
    <div className={getImageContainerStyles()}>
      {primaryImage?.url && (
        <>
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || productName}
            fill
            sizes={
              variant === "list"
                ? "(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
            }
            className={cn(
              "object-cover transition-all duration-500",
              imageLoading && "blur-sm",
              variant !== "list" && isHovered && secondaryImage && "opacity-0"
            )}
            onLoad={() => setImageLoading(false)}
            priority={featured}
            loading={featured ? undefined : "lazy"}
          />

          {/* Secondary image on hover for grid/teaser variants */}
          {variant !== "list" && secondaryImage && (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt || productName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
              className={cn(
                "object-cover transition-all duration-500 absolute inset-0",
                !isHovered && "opacity-0"
              )}
              priority={false}
            />
          )}
        </>
      )}

      {/* No Image Placeholder */}
      {!primaryImage && (
        <div className="absolute inset-0  flex items-center justify-center">
          <svg
            className="w-16 h-16 text-amber-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>No Image Available</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );

  // Render product name
  const renderProductName = () => (
    <h3
      id={`product-${product.id}-title`}
      className={cn(
        "font-bold text-teal-800 transition-colors",
        variant === "grid" && "text-sm sm:text-xl mb-2 line-clamp-2 leading-tight",
        variant === "teaser" && "text-xl mb-2 line-clamp-2 min-h-[3.5rem]",
        variant === "list" &&
          "text-base sm:text-lg md:text-xl mb-2 line-clamp-2 group-hover:text-teal-800"
      )}
    >
      {productName}
    </h3>
  );

  // Render category for list view
  const renderCategory = () => {
    if (variant !== "list" || !product.category) return null;

    return (
      <p className="text-teal-800 mb-1 text-xl font-bold">
        {product.category.name[locale as keyof typeof product.category.name]}
      </p>
    );
  };

  // Render price section
  const renderPrice = () => (
    <div
      className={cn(
        "flex items-center gap-2",
        variant === "grid" && "justify-between",
        variant === "teaser" && "mb-4",
        variant === "list" && "mb-3"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-semibold text-teal-800",
            variant === "grid" && "text-xl",
            variant === "teaser" && "text-2xl",
            variant === "list" && "text-lg sm:text-xl"
          )}
        >
          {formatPrice(product.basePrice)}
        </span>
        {product.finalPrice && product.finalPrice < product.basePrice && (
          <span className="text-teal-800 line-through text-sm">
            {formatPrice(product.basePrice)}
          </span>
        )}
        {variant === "teaser" && primaryAction.type === "customize" && (
          <span className="text-sm text-teal-800 ml-2">{locale === "cs" ? "od" : "from"}</span>
        )}
      </div>

      {/* Quick View Button for grid variant only */}
      {variant === "grid" && onQuickView && (
        <Button
          size="sm"
          variant="outline"
          className="bg-teal-800 hover:bg-amber-200/80 text-amber-300 min-w-8 h-8 p-0"
          onClick={handleQuickView}
          aria-label={t("quickView")}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Quick View Icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </Button>
      )}
    </div>
  );

  // Get button props based on variant
  const getButtonProps = () => ({
    disabled: !product.availability.inStock || loading,
    loading,
    className: variant === "teaser" ? "w-full" : "",
    variant: primaryAction.variant || "default",
    size: variant === "list" ? ("sm" as const) : ("default" as const),
    icon: primaryAction.icon,
    iconPosition: "left" as const,
  });

  // Render customize button
  const renderCustomizeButton = () => (
    <Link href={`/${locale}/products/${product.slug}`}>
      <Button {...getButtonProps()}>
        <span className={variant === "list" ? "text-xs sm:text-sm" : ""}>{primaryAction.text}</span>
      </Button>
    </Link>
  );

  // Render add to cart button
  const renderAddToCartButton = () => (
    <Button {...getButtonProps()} onClick={() => handleAction(primaryAction.type)}>
      <span className={variant === "list" ? "text-xs sm:text-sm" : ""}>
        {product.availability.inStock ? primaryAction.text : t("outOfStock")}
      </span>
    </Button>
  );

  // Render action button for teaser and list variants
  const renderActionButton = () => {
    if (variant !== "teaser" && variant !== "list") return null;

    return (
      <div className={variant === "list" ? "flex gap-2" : ""}>
        {primaryAction.type === "customize" ? renderCustomizeButton() : renderAddToCartButton()}
        {/* Quick View Button for list variant */}
        {variant === "list" && onQuickView && (
          <Button
            size="sm"
            variant="outline"
            className="bg-teal-800 hover:bg-amber-100 text-amber-100 flex-1"
            onClick={handleQuickView}
            aria-label={t("quickView")}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Quick View Icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {t("quickView")}
          </Button>
        )}
      </div>
    );
  };

  // Render product content
  const renderContent = () => {
    const contentContainer =
      variant === "grid"
        ? "bg-amber-200/50 backdrop-blur-sm rounded-xl p-4 mx-2 shadow-lg border border-amber-300"
        : "";

    return (
      <div className={getContentStyles()}>
        <div className={contentContainer}>
          {renderProductName()}
          {renderCategory()}
          {renderPrice()}
          {renderActionButton()}
          {children}
        </div>
      </div>
    );
  };

  // Render based on variant
  if (variant === "list") {
    return (
      <article
        className={getCardStyles()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-labelledby={`product-${product.id}-title`}
      >
        {/* Image - Left Half - Full Height */}
        <div className="relative w-1/2 h-full flex-shrink-0 overflow-hidden">
          {primaryImage?.url && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || productName}
              fill
              sizes="(max-width: 768px) 50vw, 384px"
              className="object-cover"
              onLoad={() => setImageLoading(false)}
              priority={featured}
              loading={featured ? undefined : "lazy"}
            />
          )}
          {!primaryImage && (
            <div className="absolute inset-0 bg-amber-100 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-amber-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>No Image Available</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content - Right Half - Clean Modern Layout */}
        <div className="w-1/2 p-4 sm:p-6 flex flex-col relative">
          {/* Top Section: Name and Stock Badge */}
          <div className="flex-1 ">
            <div className="flex  mb-3">
              {/* Product Name - Large */}
              <h3
                id={`product-${product.id}-title`}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-800 line-clamp-2 flex-1"
              >
                {productName}
              </h3>
            </div>

            {/* Category */}
            {product.category && (
              <p className="text-sm text-teal-700 mb-3 ">
                {product.category.name[locale as keyof typeof product.category.name]}
              </p>
            )}
          </div>
          {/* Price - Right Aligned, Smaller */}
          <div className="flex justify-end mb-4">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-2xl sm:text-3xl font-bold text-teal-800">
                  {formatPrice(product.finalPrice || product.basePrice)}
                </span>
              </div>
              {product.finalPrice && product.finalPrice < product.basePrice && (
                <span className="text-sm text-teal-600 line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Section: Action Buttons - Same Height, Centered */}
          <div className="flex gap-3 mt-auto">
            {/* Customize/Add to Cart Button */}
            {primaryAction.type === "customize" ? (
              <Link href={`/${locale}/products/${product.slug}`} className="flex-1">
                <Button
                  disabled={!product.availability.inStock || loading}
                  loading={loading}
                  className="w-full h-12 text-base font-semibold"
                  variant="default"
                >
                  {primaryAction.text}
                </Button>
              </Link>
            ) : (
              <Button
                disabled={!product.availability.inStock || loading}
                loading={loading}
                className="flex-1 h-12 text-base font-semibold"
                variant="default"
                onClick={() => handleAction(primaryAction.type)}
              >
                {product.availability.inStock ? primaryAction.text : t("outOfStock")}
              </Button>
            )}

            {/* Quick View Button - Same Height */}
            {onQuickView && (
              <Button
                variant="outline"
                className="flex h-auto text-xl font-semibold bg-teal-800 hover:bg-teal-800/60 text-amber-200 border-amber-300"
                onClick={handleQuickView}
                aria-label={t("quickView")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>Quick View Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Grid and teaser variants
  return (
    <article
      className={getCardStyles()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-labelledby={`product-${product.id}-title`}
    >
      {variant === "grid" ? (
        <Link href={`/${locale}/products/${product.slug}`} className="block w-full h-full relative">
          {renderImage()}
          {renderContent()}
        </Link>
      ) : (
        <>
          <Link href={`/${locale}/products/${product.slug}`} className="block">
            {renderImage()}
          </Link>
          {renderContent()}
        </>
      )}
    </article>
  );
};

// Memoize component for performance optimization
export const ProductCard = memo(ProductCardComponent);
ProductCard.displayName = "ProductCard";
