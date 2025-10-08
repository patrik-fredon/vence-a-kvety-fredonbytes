"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
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

export function ProductCard({
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
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary) || product.images[1];

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
          "overflow-hidden hover:shadow-xl hover:-translate-y-1 clip-corners",
          "h-80" // Increased height as per requirements
        );

      case "teaser":
        return cn(
          baseStyles,
          "rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-1",
          "h-80" // Slightly smaller than grid
        );

      case "list":
        return cn(baseStyles, "rounded-lg flex flex-row items-center gap-4 p-4 hover:shadow-lg");

      default:
        return baseStyles;
    }
  };

  const getImageContainerStyles = () => {
    switch (variant) {
      case "grid":
      case "teaser":
        return "relative aspect-square bg-amber-100 overflow-hidden";

      case "list":
        return "relative overflow-hidden bg-amber-100 w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md";

      default:
        return "relative aspect-square bg-amber-100 overflow-hidden";
    }
  };

  const getContentStyles = () => {
    switch (variant) {
      case "grid":
        return "absolute bottom-0 left-0 right-0 p-4 z-20";

      case "teaser":
        return "p-6";

      case "list":
        return "flex-1 min-w-0";

      default:
        return "p-4";
    }
  };

  // Render product image
  const renderImage = () => (
    <div className={getImageContainerStyles()}>
      {primaryImage && (
        <>
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || productName}
            fill
            sizes={
              variant === "list"
                ? "96px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
            }
            className={cn(
              "object-cover transition-all duration-500",
              imageLoading && "blur-sm",
              variant !== "list" && isHovered && secondaryImage && "opacity-0"
            )}
            onLoad={() => setImageLoading(false)}
            priority={featured}
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

      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
            {t("featured")}
          </span>
        </div>
      )}

      {/* Customization indicator for teaser variant */}
      {variant === "teaser" && primaryAction.type === "customize" && (
        <div className="absolute top-3 right-3 bg-amber-800 text-white px-2 py-1 rounded-full text-xs font-medium">
          {locale === "cs" ? "Přizpůsobitelné" : "Customizable"}
        </div>
      )}

      {/* Stock Status Overlay */}
      {!product.availability.inStock && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <span className="text-white font-medium px-3 py-2 bg-red-600 rounded-full text-sm shadow-lg">
            {t("outOfStock")}
          </span>
        </div>
      )}
    </div>
  );

  // Render product name
  const renderProductName = () => (
    <h3
      id={`product-${product.id}-title`}
      className={cn(
        "font-semibold text-teal-800 transition-colors",
        variant === "grid" && "text-sm sm:text-base mb-2 line-clamp-2 leading-tight",
        variant === "teaser" && "text-xl mb-2 line-clamp-2 min-h-[3.5rem]",
        variant === "list" && "text-sm sm:text-base mb-1 truncate group-hover:text-teal-800"
      )}
    >
      {productName}
    </h3>
  );

  // Render category for list view
  const renderCategory = () => {
    if (variant !== "list" || !product.category) return null;

    return (
      <p className="text-teal-800 mb-1 text-xs">
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
        variant === "list" && "mb-2"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-semibold text-teal-800",
            variant === "grid" && "text-lg",
            variant === "teaser" && "text-2xl",
            variant === "list" && "text-sm sm:text-base"
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

      {/* Quick View Button for grid variant */}
      {variant === "grid" && onQuickView && (
        <Button
          size="sm"
          variant="outline"
          className="bg-amber-100/80 hover:bg-amber-200/80 text-teal-800 min-w-8 h-8 p-0"
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

  // Render availability status
  const renderAvailability = () => (
    <div
      className={cn(
        "flex items-center gap-1.5",
        variant === "grid" && "mt-2",
        variant === "teaser" && "mb-4",
        variant === "list" && "mb-2"
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          product.availability.inStock ? "bg-green-500" : "bg-red-500"
        )}
      />
      <output
        className={cn(
          "text-xs font-medium",
          product.availability.inStock ? "text-green-700" : "text-red-700"
        )}
        aria-label={`${t("availability")}: ${product.availability.inStock ? t("inStock") : t("outOfStock")}`}
      >
        {product.availability.inStock
          ? product.availability.stockQuantity && product.availability.stockQuantity <= 5
            ? t("limitedStock")
            : t("inStock")
          : t("outOfStock")}
      </output>
    </div>
  );

  // Get button props based on variant
  const getButtonProps = () => ({
    disabled: !product.availability.inStock || loading,
    loading,
    className: variant === "teaser" ? "w-full" : "",
    variant: primaryAction.variant,
    size: variant === "list" ? "sm" : "default",
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
      <div className={variant === "list" ? "flex-shrink-0" : ""}>
        {primaryAction.type === "customize" ? renderCustomizeButton() : renderAddToCartButton()}
      </div>
    );
  };

  // Render product content
  const renderContent = () => {
    const contentContainer =
      variant === "grid"
        ? "bg-funeral-gold backdrop-blur-sm rounded-xl p-4 mx-2 shadow-lg border border-amber-300"
        : "";

    return (
      <div className={getContentStyles()}>
        <div className={contentContainer}>
          {renderProductName()}
          {renderCategory()}
          {renderPrice()}
          {renderAvailability()}
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
        <Link
          href={`/${locale}/products/${product.slug}`}
          className="flex-1 flex items-center gap-4"
        >
          {renderImage()}
          {renderContent()}
        </Link>
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
          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 pointer-events-none z-10" />
          )}
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
}
