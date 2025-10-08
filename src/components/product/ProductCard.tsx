"use client";

// Removed unused Image import
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
// Removed unused useCoreWebVitals import
import { useJavaScriptOptimization } from "@/lib/utils/javascript-optimization";
import { resolvePrimaryProductImage } from "@/lib/utils/product-image-utils";
import type { Product } from "@/types/product";
import { LazyProductQuickView } from "./LazyProductQuickView";
import { ProductImageHover } from "./ProductImageHover";

interface ProductCardProps {
  product: Product;
  locale: string;
  onAddToCart?: (product: Product) => void;
  className?: string;
  featured?: boolean;
  viewMode?: "grid" | "list";
}

export function ProductCard({
  product,
  locale,
  onAddToCart,
  className,
  featured = false,
  viewMode = "grid",
}: ProductCardProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Core Web Vitals optimization - DISABLED to prevent performance issues
  // Multiple instances were causing UI freezing and navbar unresponsiveness
  // Core Web Vitals tracking is now handled at the page level
  // Removed unused coreWebVitals hook

  // JavaScript optimization
  const { measureExecution } = useJavaScriptOptimization("ProductCard");

  // Image resolution with fallback handling using utility function
  const resolvedPrimaryImage = resolvePrimaryProductImage(product, locale);

  // Get primary and secondary images for hover effect
  // Use properly typed ProductImage instead of 'any'
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const secondaryImage = product.images?.find((img) => !img.isPrimary) || product.images?.[1];

  // Use resolved image if no primary image exists (fallback scenario)
  const displayPrimaryImage = primaryImage || {
    url: resolvedPrimaryImage.url,
    alt: resolvedPrimaryImage.alt,
    isPrimary: resolvedPrimaryImage.isPrimary,
    id: "fallback",
    sortOrder: 0,
  };

  const formatPrice = (price: number) => {
    return tCurrency("format", {
      amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
    });
  };

  // Navigation handlers using Next.js router
  const handleProductClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      await measureExecution("productNavigation", async () => {
        try {
          await router.push(`/${locale}/products/${product.slug}`);
        } catch (error) {
          console.error("Navigation error:", error);
          // Fallback to window.location if router fails
          window.location.href = `/${locale}/products/${product.slug}`;
        }
      });
    },
    [router, locale, product.slug, measureExecution]
  );

  const handleImageClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      await measureExecution("imageNavigation", async () => {
        try {
          await router.push(`/${locale}/products/${product.slug}`);
        } catch (error) {
          console.error("Image navigation error:", error);
          // Fallback to window.location if router fails
          window.location.href = `/${locale}/products/${product.slug}`;
        }
      });
    },
    [router, locale, product.slug, measureExecution]
  );

  const handleTitleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      await measureExecution("titleNavigation", async () => {
        try {
          await router.push(`/${locale}/products/${product.slug}`);
        } catch (error) {
          console.error("Title navigation error:", error);
          // Fallback to window.location if router fails
          window.location.href = `/${locale}/products/${product.slug}`;
        }
      });
    },
    [router, locale, product.slug, measureExecution]
  );

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      await measureExecution("addToCart", async () => {
        onAddToCart?.(product);
      });
    },
    [onAddToCart, product, measureExecution]
  );

  const handleQuickView = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      await measureExecution("quickView", async () => {
        setIsQuickViewOpen(true);
      });
    },
    [measureExecution]
  );

  // List view - updated with teal-800 background
  if (viewMode === "list") {
    return (
      <>
        <article
          className={cn(
            "group bg-teal-800 clip-corners overflow-hidden transition-all duration-300 shadow-lg relative",
            "hover:shadow-xl rounded-lg flex flex-row items-center gap-4 p-4 cursor-pointer",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleProductClick}
          aria-labelledby={`product-${product.id}-title`}
        >
          {/* Product Image */}
          <div
            className="relative overflow-hidden bg-teal-800 w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md cursor-pointer"
            onClick={handleImageClick}
          >
            <ProductImageHover
              primaryImage={displayPrimaryImage}
              secondaryImage={secondaryImage}
              productName={product.name[locale as keyof typeof product.name]}
              locale={locale}
              fill
              sizes="96px"
              className="rounded-md"
              onClick={handleImageClick}
              priority={featured}
              isAboveFold={featured}
              variant="thumbnail"
              transitionDuration={300}
              enableTouchHover={true}
            />

            {/* Stock Status Overlay */}
            {!product.availability.inStock && (
              <div className="absolute inset-0 bg-teal-900/50 flex items-center justify-center">
                <span className="text-white font-medium px-2 py-1 bg-red-600 rounded-full text-xs">
                  {t("outOfStock")}
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3
              id={`product-${product.id}-title`}
              className="font-medium text-amber-100 group-hover:text-amber-200 transition-colors text-sm sm:text-base mb-1 truncate cursor-pointer"
              onClick={handleTitleClick}
            >
              {product.name[locale as keyof typeof product.name]}
            </h3>

            {product.category && (
              <p className="text-amber-200 mb-1 text-xs">
                {
                  product.category.name[
                    locale as keyof typeof product.category.name
                  ]
                }
              </p>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-amber-100 text-sm sm:text-base">
                {formatPrice(product.basePrice)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  product.availability.inStock ? "bg-green-500" : "bg-red-500"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  product.availability.inStock
                    ? "text-green-400"
                    : "text-red-400"
                )}
              >
                {product.availability.inStock
                  ? product.availability.stockQuantity &&
                    product.availability.stockQuantity <= 5
                    ? t("limitedStock")
                    : t("inStock")
                  : t("outOfStock")}
              </span>
            </div>
          </div>

          {/* List View Add to Cart Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleAddToCart}
              disabled={!product.availability.inStock}
              variant={product.availability.inStock ? "default" : "secondary"}
              size="sm"
            >
              <span className="text-xs sm:text-sm">
                {product.availability.inStock
                  ? t("addToCart")
                  : t("outOfStock")}
              </span>
            </Button>
          </div>
        </article>

        {/* Quick View Modal */}
        <LazyProductQuickView
          product={product}
          locale={locale}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          {...(onAddToCart ? { onAddToCart } : {})}
        />
      </>
    );
  }

  // Grid view - Updated with teal-800 background and clip-corners
  return (
    <>
      <article
        className={cn(
          // Base card styles with teal-800 background and clip-corners
          "group relative overflow-hidden transition-all duration-300 shadow-lg cursor-pointer",
          "clip-corners h-96 hover:-translate-y-1 hover:shadow-xl",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleProductClick}
        aria-labelledby={`product-${product.id}-title`}
      >
        {/* Image Layer (z-0) - Fills container with absolute positioning */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <ProductImageHover
            primaryImage={displayPrimaryImage}
            secondaryImage={secondaryImage}
            productName={product.name[locale as keyof typeof product.name]}
            locale={locale}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onClick={handleImageClick}
            priority={featured}
            isAboveFold={featured}
            variant="product"
            transitionDuration={500}
            enableTouchHover={true}
            onHoverChange={(hovered) => setIsHovered(hovered)}
          />
        </div>

        {/* Overlay Layer (z-10) - Contains badges and status overlays */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 left-3 pointer-events-auto">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-200 text-teal-900 border border-amber-300 shadow-sm">
                {t("featured")}
              </span>
            </div>
          )}

          {/* Stock Status Overlay */}
          {!product.availability.inStock && (
            <div className="absolute inset-0 bg-teal-900/50 flex items-center justify-center pointer-events-auto">
              <span className="text-white font-medium px-3 py-2 bg-red-600 rounded-full text-sm shadow-lg">
                {t("outOfStock")}
              </span>
            </div>
          )}
        </div>

        {/* Info Overlay (z-20) - Bottom positioned with backdrop blur for readability */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className="bg-amber-100/95 backdrop-blur-sm rounded-xl p-4 mx-2 shadow-xl border border-amber-200/20">
            {/* Product Name - Increased line height for better readability in taller cards */}
            <h3
              id={`product-${product.id}-title`}
              className="font-semibold text-teal-900 hover:text-teal-800 transition-colors text-sm sm:text-base mb-3 line-clamp-2 leading-relaxed cursor-pointer"
              onClick={handleTitleClick}
            >
              {product.name[locale as keyof typeof product.name]}
            </h3>

            {/* Price and QuickView Row - Enhanced spacing for h-96 */}
            <div className="flex items-center justify-between mb-3">
              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-900 text-lg sm:text-xl">
                  {formatPrice(product.basePrice)}
                </span>
                {product.finalPrice &&
                  product.finalPrice < product.basePrice && (
                    <span className="text-teal-700 line-through text-sm">
                      {formatPrice(product.basePrice)}
                    </span>
                  )}
              </div>

              {/* QuickView Icon Button - Slightly larger for better visibility */}
              <Button
                size="sm"
                className="bg-amber-200/80 hover:bg-amber-300/80 text-teal-900 min-w-9 h-9"
                onClick={handleQuickView}
                aria-label={t("quickView")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Quick View</title>
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
            </div>

            {/* Availability Status - Enhanced for better visibility in taller cards */}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  product.availability.inStock ? "bg-green-500" : "bg-red-500"
                )}
              />
              <output
                className={cn(
                  "text-xs font-medium",
                  product.availability.inStock
                    ? "text-green-700"
                    : "text-red-700"
                )}
                aria-label={`${t("availability")}: ${
                  product.availability.inStock ? t("inStock") : t("outOfStock")
                }`}
              >
                {product.availability.inStock
                  ? product.availability.stockQuantity &&
                    product.availability.stockQuantity <= 5
                    ? t("limitedStock")
                    : t("inStock")
                  : t("outOfStock")}
              </output>
            </div>
          </div>
        </div>

        {/* Hover Overlay for Additional Actions - Maintained for h-96 */}
        {isHovered && (
          <div className="absolute inset-0 bg-teal-900/10 transition-opacity duration-300 pointer-events-none z-10" />
        )}
      </article>

      {/* Quick View Modal */}
      <LazyProductQuickView
        product={product}
        locale={locale}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        {...(onAddToCart ? { onAddToCart } : {})}
      />
    </>
  );
}
