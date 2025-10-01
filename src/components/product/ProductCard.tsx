"use client";

// Removed unused Image import
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { LazyProductQuickView } from "./LazyProductQuickView";
// Removed unused useCoreWebVitals import
import { useJavaScriptOptimization } from "@/lib/utils/javascript-optimization";
import { ProductImage } from "./ProductImage";

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
  const [imageLoading, setImageLoading] = useState(true);
  // Removed unused imageError state
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Core Web Vitals optimization - DISABLED to prevent performance issues
  // Multiple instances were causing UI freezing and navbar unresponsiveness
  // Core Web Vitals tracking is now handled at the page level
  // Removed unused coreWebVitals hook

  // JavaScript optimization
  const { measureExecution } = useJavaScriptOptimization('ProductCard');

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary) || product.images[1];

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

      await measureExecution('productNavigation', async () => {
        try {
          await router.push(`/${locale}/products/${product.slug}`);
        } catch (error) {
          console.error('Navigation error:', error);
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

      await measureExecution('imageNavigation', async () => {
        try {
          await router.push(`/${locale}/products/${product.slug}`);
        } catch (error) {
          console.error('Image navigation error:', error);
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

      await measureExecution('titleNavigation', async () => {
        try {
          await router.push(`/${locale}/products/${product.slug}`);
        } catch (error) {
          console.error('Title navigation error:', error);
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

      await measureExecution('addToCart', async () => {
        onAddToCart?.(product);
      });
    },
    [onAddToCart, product, measureExecution]
  );

  const handleQuickView = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      await measureExecution('quickView', async () => {
        setIsQuickViewOpen(true);
      });
    },
    [measureExecution]
  );

  // List view - keep existing layout but update navigation
  if (viewMode === "list") {
    return (
      <>
        <article
          className={cn(
            "group bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] clip-corners overflow-hidden transition-all duration-300 shadow-lg relative",
            "hover:shadow-lg rounded-lg flex flex-row items-center gap-4 p-4 cursor-pointer",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleProductClick}
          aria-labelledby={`product-${product.id}-title`}
        >
          {/* Product Image */}
          <div
            className="relative overflow-hidden bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md cursor-pointer"
            onClick={handleImageClick}
          >
            {primaryImage && (
              <ProductImage
                image={primaryImage}
                productName={product.name[locale as keyof typeof product.name]}
                locale={locale}
                fill
                sizes="96px"
                className="object-cover"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
                priority={featured}
                variant="thumbnail"
                showLoadingSpinner={false}
              />
            )}

            {/* Stock Status Overlay */}
            {!product.availability.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-amber-100 font-medium px-2 py-1 bg-red-600 rounded-full text-xs">
                  {t("outOfStock")}
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3
              id={`product-${product.id}-title`}
              className="font-medium text-amber-100 group-hover:text-stone-700 transition-colors text-sm sm:text-base mb-1 truncate cursor-pointer"
              onClick={handleTitleClick}
            >
              {product.name[locale as keyof typeof product.name]}
            </h3>

            {product.category && (
              <p className="text-amber-100 mb-1 text-xs">
                {product.category.name[locale as keyof typeof product.category.name]}
              </p>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-stone-900 text-sm sm:text-base">
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
                  product.availability.inStock ? "text-green-700" : "text-red-700"
                )}
              >
                {product.availability.inStock
                  ? product.availability.stockQuantity && product.availability.stockQuantity <= 5
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
                {product.availability.inStock ? t("addToCart") : t("outOfStock")}
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

  // Grid view - Enhanced with h-96 height for better visual impact
  return (
    <>
      <article
        className={cn(
          // Base card styles with increased height (h-96) for better visual impact
          "group relative overflow-hidden transition-all duration-300 shadow-lg cursor-pointer",
          "clip-corners rounded-lg h-96 hover:-translate-y-1 hover:shadow-xl",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleProductClick}
        aria-labelledby={`product-${product.id}-title`}
      >
        {/* Full Coverage Product Image - Takes up most of the h-96 space */}
        <div
          className="absolute inset-0 bg-amber-100 cursor-pointer"
          onClick={handleImageClick}
        >
          {primaryImage && (
            <ProductImage
              image={primaryImage}
              productName={product.name[locale as keyof typeof product.name]}
              locale={locale}
              fill
              className={cn(
                "object-cover transition-all duration-500",
                isHovered && secondaryImage && "opacity-0"
              )}
              onLoad={() => setImageLoading(false)}
              priority={featured}
              variant="product"
              showLoadingSpinner={false}
            />
          )}

          {/* Secondary image on hover */}
          {secondaryImage && (
            <ProductImage
              image={secondaryImage}
              productName={product.name[locale as keyof typeof product.name]}
              locale={locale}
              fill
              className={cn(
                "object-cover transition-all duration-500 absolute inset-0",
                !isHovered && "opacity-0"
              )}
              priority={false}
              variant="product"
              showLoadingSpinner={false}
            />
          )}

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-teal-800 border border-amber-200 shadow-sm">
                {t("featured")}
              </span>
            </div>
          )}

          {/* Stock Status Overlay */}
          {!product.availability.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="text-amber-100 font-medium px-3 py-2 bg-red-600 rounded-full text-sm shadow-lg">
                {t("outOfStock")}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Overlay - Optimized for h-96 height with better proportions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className="bg-amber-100/95 backdrop-blur-sm rounded-xl p-4 mx-2 shadow-lg border border-white/20">
            {/* Product Name - Increased line height for better readability in taller cards */}
            <h3
              id={`product-${product.id}-title`}
              className="font-semibold text-stone-900 text-sm sm:text-base mb-3 line-clamp-2 leading-relaxed cursor-pointer"
              onClick={handleTitleClick}
            >
              {product.name[locale as keyof typeof product.name]}
            </h3>

            {/* Price and QuickView Row - Enhanced spacing for h-96 */}
            <div className="flex items-center justify-between mb-3">
              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-lg sm:text-xl">
                  {formatPrice(product.basePrice)}
                </span>
                {product.finalPrice && product.finalPrice < product.basePrice && (
                  <span className="text-stone-500 line-through text-sm">
                    {formatPrice(product.basePrice)}
                  </span>
                )}
              </div>

              {/* QuickView Icon Button - Slightly larger for better visibility */}
              <Button
                size="sm"
                className="bg-amber-100/80 hover:bg-stone-200/80 text-teal-700 min-w-9 h-9"
                onClick={handleQuickView}
                aria-label={t("quickView")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>
        </div>

        {/* Hover Overlay for Additional Actions - Maintained for h-96 */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 pointer-events-none z-10" />
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
