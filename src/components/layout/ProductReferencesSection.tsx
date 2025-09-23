"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/accessibility/hooks";
import { cn } from "@/lib/utils";
import {
  createDebouncedRetry,
  getFallbackImage,
  isRecoverableError,
  logErrorWithContext,
  safeTranslate,
} from "@/lib/utils/fallback-utils";
import type { ProductReference, ProductReferencesSectionProps } from "@/types/components";

// Utility function to transform Product to ProductReference
const transformProductToReference = (product: any, locale: string): ProductReference => {
  // Get the primary image or first available image
  const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];

  // Fallback image for products without images
  const fallbackImage = {
    src: "/funeral-wreaths-and-floral-arrangement-001.png",
    alt: locale === "cs" ? "Pohřební věnec" : "Funeral wreath",
    width: 400,
    height: 400,
  };

  return {
    id: product.id,
    name: locale === "cs" ? product.name?.cs || product.nameCs : product.name?.en || product.nameEn,
    image: primaryImage
      ? {
          src: primaryImage.url,
          alt: primaryImage.alt,
          width: primaryImage.width || 400,
          height: primaryImage.height || 400,
        }
      : fallbackImage,
    description:
      locale === "cs"
        ? product.description?.cs ||
          product.descriptionCs ||
          "Krásný pohřební věnec vyrobený s láskou a péčí"
        : product.description?.en ||
          product.descriptionEn ||
          "Beautiful funeral wreath crafted with love and care",
    category:
      product.category?.name?.[locale] || (locale === "cs" ? "Pohřební věnce" : "Funeral Wreaths"),
    slug: product.slug,
  };
};

// Individual product reference card component
const ProductReferenceCard = ({
  product,
  index = 0,
  locale = "en",
}: {
  product: ProductReference;
  index?: number;
  locale?: string;
}) => {
  const t = useTranslations("home.productReferences");
  const prefersReducedMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(product.image.src);

  // Safe translation function with fallbacks (memoized to prevent re-renders)
  const safeT = useCallback(
    (key: string, values?: Record<string, any>) => safeTranslate(t, key, locale, values),
    [t, locale]
  );

  // Handle image loading error with fallback
  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      const fallbackImage = getFallbackImage("product");
      setCurrentImageSrc(fallbackImage.src);

      logErrorWithContext(new Error("Product image failed to load"), {
        component: "ProductReferenceCard",
        action: "image_load_error",
        locale,
        productId: product.id,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle Enter and Space key activation
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // In a real implementation, this would navigate to product detail
      console.log(`Navigating to product: ${product.name}`);
    }
  };

  const handleClick = () => {
    // In a real implementation, this would navigate to product detail
    console.log(`Navigating to product: ${product.name}`);
  };

  return (
    <article
      className={cn(
        "group bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-md",
        // Enhanced hover effects with motion preference support
        "transition-all duration-300 ease-in-out",
        !prefersReducedMotion && "hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]",
        prefersReducedMotion && "hover:shadow-lg hover:bg-white/15", // Subtle effect for motion-sensitive users
        "focus-within:ring-2 focus-within:ring-white focus-within:ring-opacity-50",
        "cursor-pointer"
      )}
      role="gridcell"
      aria-rowindex={Math.floor(index / 4) + 1}
      aria-colindex={(index % 4) + 1}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      aria-labelledby={`product-name-${product.id}`}
      aria-describedby={`product-description-${product.id}`}
    >
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={currentImageSrc}
          alt={`${product.image.alt} - ${safeT("productImageAlt")}`}
          width={product.image.width}
          height={product.image.height}
          onError={handleImageError}
          className={cn(
            "w-full h-full object-cover",
            // Gentle image hover effect
            "transition-transform duration-300 ease-in-out",
            !prefersReducedMotion && "group-hover:scale-110",
            prefersReducedMotion && "group-hover:brightness-110", // Alternative effect for motion-sensitive users
            // Error state styling
            imageError && "opacity-80 grayscale-[0.2]"
          )}
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Error indicator for images (subtle, for accessibility) */}
        {imageError && (
          <div className="sr-only" role="alert">
            Product image failed to load, showing fallback image
          </div>
        )}
        {/* Subtle overlay for better text readability */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent",
            "transition-opacity duration-300 ease-in-out",
            "group-hover:from-black/30"
          )}
        />
      </div>

      <div
        className={cn(
          // Mobile-first responsive padding
          "p-3", // Compact padding on mobile
          "xs:p-4", // Slightly more for 375px+
          "sm:p-5", // Standard padding for 640px+
          "md:p-6", // Tablet padding
          "lg:p-7" // Desktop padding
        )}
      >
        <h3
          id={`product-name-${product.id}`}
          className={cn(
            // Mobile-first typography
            "text-sm font-semibold text-teal-800", // 14px for mobile
            "xs:text-base", // 16px for 375px+
            "sm:text-lg", // 18px for 640px+
            "md:text-xl", // 20px for tablet
            "lg:text-2xl", // 24px for desktop
            // Spacing
            "mb-2", // Compact on mobile
            "sm:mb-3", // Standard for 640px+
            "md:mb-4", // Tablet spacing
            // Text effects
            "line-clamp-2", // Limit to 2 lines
            "transition-colors duration-300 ease-in-out",
            "group-hover:text-amber-200"
          )}
        >
          {product.name}
        </h3>

        <p
          id={`product-description-${product.id}`}
          className={cn(
            // Mobile-first typography
            "text-xs text-teal-800/80", // 12px for mobile
            "xs:text-sm", // 14px for 375px+
            "sm:text-base", // 16px for 640px+
            "md:text-lg", // 18px for tablet
            // Text effects
            "line-clamp-3", // Limit to 3 lines
            "transition-colors duration-300 ease-in-out",
            "group-hover:text-teal-800/90"
          )}
        >
          {product.description}
        </p>

        {/* Category badge */}
        <div
          className={cn(
            "mt-3", // Mobile spacing
            "sm:mt-4", // Standard spacing for 640px+
            "md:mt-5" // Tablet spacing
          )}
        >
          <span
            className={cn(
              "inline-block px-2 py-1 rounded-full",
              "text-xs font-medium", // Mobile typography
              "xs:text-sm xs:px-3", // 375px+ sizing
              "bg-white/20 text-teal-800",
              "transition-all duration-300 ease-in-out",
              "group-hover:bg-amber-600/80 group-hover:text-teal-800"
            )}
          >
            {product.category}
          </span>
        </div>
      </div>
    </article>
  );
};

// Main ProductReferencesSection component
export const ProductReferencesSection = ({
  locale,
  products: propProducts,
  maxProducts = 4,
  className,
}: ProductReferencesSectionProps) => {
  const t = useTranslations("home.productReferences");
  const [products, setProducts] = useState<ProductReference[]>(propProducts || []);
  const [loading, setLoading] = useState(!propProducts);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchProducts = useCallback(async () => {
    // Skip fetching if products are provided as props
    if (propProducts) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsRetrying(retryCount > 0);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `/api/products/random?count=${maxProducts}&locale=${locale}&featured=true`,
        {
          cache: "no-store", // Ensure fresh data
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch products`);
      }

      const data = await response.json();

      if (data.success && data.products) {
        const transformedProducts = data.products.map((product: any) =>
          transformProductToReference(product, locale)
        );
        setProducts(transformedProducts);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(data.error || "Failed to load products");
      }
    } catch (err) {
      const error = err as Error;

      logErrorWithContext(error, {
        component: "ProductReferencesSection",
        action: "fetch_products",
        locale,
        retryCount,
        timestamp: new Date().toISOString(),
      });

      // Set user-friendly error message
      if (error.name === "AbortError") {
        setError(safeTranslate(t, "timeoutError", locale) || "Request timed out");
      } else if (isRecoverableError(error)) {
        setError(safeTranslate(t, "loadingError", locale));
      } else {
        setError(safeTranslate(t, "criticalError", locale) || "Critical error occurred");
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [maxProducts, locale, propProducts, retryCount, t]);

  // Safe translation function with fallbacks (memoized to prevent infinite loops)
  const safeT = useCallback(
    (key: string, values?: Record<string, any>) => safeTranslate(t, key, locale, values),
    [t, locale]
  );

  // Debounced retry function to prevent rapid retry attempts
  const debouncedRetry = createDebouncedRetry(() => {
    setRetryCount((prev) => prev + 1);
    fetchProducts();
  }, 1000);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Loading state with accessibility improvements
  if (loading) {
    return (
      <section
        id="products-section"
        className={cn(
          // Mobile-first responsive padding (320px-767px)
          "py-12 px-3", // Compact padding for very small screens
          "xs:py-14 xs:px-4", // Slightly more for 375px+
          "sm:py-16 sm:px-6", // Standard mobile padding (640px+)
          // Tablet optimizations (768px-1023px)
          "md:py-20 md:px-8", // More generous tablet padding
          // Desktop layout with proper space utilization (1024px+)
          "lg:py-24 lg:px-12", // Ample desktop padding
          "xl:px-16", // Extra padding for large screens
          "bg-amber-100",
          // Orientation handling
          "landscape:py-8", // Reduced padding in landscape
          "md:landscape:py-16", // Tablet landscape adjustment
          className
        )}
        aria-labelledby="products-heading"
        aria-describedby="products-loading"
        role="region"
      >
        <div
          className={cn(
            // Mobile-first max-width progression
            "max-w-sm mx-auto", // 384px for very small screens
            "xs:max-w-md", // 448px for 375px+ screens
            "sm:max-w-4xl", // 896px for small screens (640px+)
            "md:max-w-5xl", // 1024px for tablets
            "lg:max-w-6xl", // 1152px for desktop
            "xl:max-w-7xl" // 1280px for large screens
          )}
        >
          <div
            className={cn(
              "text-center",
              // Mobile-first spacing
              "mb-8", // Compact spacing on mobile
              "sm:mb-10", // Standard spacing for 640px+
              "md:mb-12", // Tablet spacing
              "lg:mb-16" // Desktop spacing
            )}
          >
            <h2
              id="products-heading"
              className={cn(
                // Mobile-first typography
                "text-2xl font-bold text-teal-800", // 24px for mobile
                "xs:text-3xl", // 30px for 375px+ screens
                "sm:text-4xl", // 36px for 640px+ screens
                "md:text-5xl", // 48px for tablet
                "lg:text-6xl", // 60px for desktop
                // Spacing
                "mb-3", // Compact on mobile
                "sm:mb-4", // Standard for 640px+
                "md:mb-6", // Tablet spacing
                // Orientation adjustments
                "landscape:text-xl landscape:sm:text-3xl", // Smaller in landscape
                "md:landscape:text-4xl" // Tablet landscape
              )}
            >
              {t("heading")}
            </h2>
          </div>
          <div className="flex justify-center items-center py-12" role="status" aria-live="polite">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"
              aria-hidden="true"
            />
            <span id="products-loading" className="sr-only">
              {safeT("loading")}
            </span>
          </div>
        </div>
      </section>
    );
  }

  // Error state with accessibility improvements
  if (error) {
    return (
      <section
        id="products-section"
        className={cn(
          // Mobile-first responsive padding (320px-767px)
          "py-12 px-3", // Compact padding for very small screens
          "xs:py-14 xs:px-4", // Slightly more for 375px+
          "sm:py-16 sm:px-6", // Standard mobile padding (640px+)
          // Tablet optimizations (768px-1023px)
          "md:py-20 md:px-8", // More generous tablet padding
          // Desktop layout with proper space utilization (1024px+)
          "lg:py-24 lg:px-12", // Ample desktop padding
          "xl:px-16", // Extra padding for large screens
          "bg-amber-100",
          // Orientation handling
          "landscape:py-8", // Reduced padding in landscape
          "md:landscape:py-16", // Tablet landscape adjustment
          className
        )}
        aria-labelledby="products-heading"
        aria-describedby="products-error"
        role="region"
      >
        <div
          className={cn(
            // Mobile-first max-width progression
            "max-w-sm mx-auto", // 384px for very small screens
            "xs:max-w-md", // 448px for 375px+ screens
            "sm:max-w-4xl", // 896px for small screens (640px+)
            "md:max-w-5xl", // 1024px for tablets
            "lg:max-w-6xl", // 1152px for desktop
            "xl:max-w-7xl" // 1280px for large screens
          )}
        >
          <div className="text-center">
            <h2
              id="products-heading"
              className={cn(
                // Mobile-first typography
                "text-2xl font-bold text-teal-800", // 24px for mobile
                "xs:text-3xl", // 30px for 375px+ screens
                "sm:text-4xl", // 36px for 640px+ screens
                "md:text-5xl", // 48px for tablet
                "lg:text-6xl", // 60px for desktop
                // Spacing
                "mb-3", // Compact on mobile
                "sm:mb-4", // Standard for 640px+
                "md:mb-6", // Tablet spacing
                // Orientation adjustments
                "landscape:text-xl landscape:sm:text-3xl", // Smaller in landscape
                "md:landscape:text-4xl" // Tablet landscape
              )}
            >
              {t("heading")}
            </h2>
            <div role="alert" aria-live="assertive" className="text-center py-12">
              <p
                id="products-error"
                className={cn(
                  "text-red-300", // Error color
                  // Mobile-first typography
                  "text-base", // 16px for mobile
                  "sm:text-lg", // 18px for 640px+
                  "md:text-xl", // 20px for tablet
                  "lg:text-2xl", // 24px for desktop
                  "mb-4"
                )}
              >
                {error}
              </p>
              {/* Retry information */}
              {retryCount > 0 && (
                <p className="text-teal-800/70 text-sm mb-4">
                  {safeT("retryAttempt")} {retryCount}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={debouncedRetry}
                  disabled={isRetrying}
                  className={cn(
                    "text-teal-800 hover:text-stone-200 font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-funeral-background",
                    "rounded-md px-4 py-2 border border-white/30 hover:border-white/50",
                    "min-h-[44px]", // WCAG touch targe
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isRetrying && "animate-pulse"
                  )}
                  aria-describedby="retry-description"
                >
                  {isRetrying ? safeT("retrying") || "Retrying..." : safeT("tryAgain")}
                </button>

                {/* Alternative action - go to products page */}
                <button
                  onClick={() => (window.location.href = `/${locale}/products`)}
                  className={cn(
                    "text-teal-800 hover:text-stone-200 font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-funeral-background",
                    "rounded-md px-4 py-2 bg-white/10 hover:bg-white/20",
                    "min-h-[44px]" // WCAG touch target
                  )}
                >
                  {safeT("viewAllProducts") ||
                    (locale === "cs" ? "Zobrazit všechny produkty" : "View All Products")}
                </button>
              </div>
              <div id="retry-description" className="sr-only">
                {safeT("retryDescription")}
              </div>{" "}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no products
  if (products.length === 0) {
    return null;
  }

  // Main render with enhanced accessibility
  return (
    <section
      id="products-section"
      className={cn(
        // Mobile-first responsive padding (320px-767px)
        "py-12 px-3", // Compact padding for very small screens
        "xs:py-14 xs:px-4", // Slightly more for 375px+
        "sm:py-16 sm:px-6", // Standard mobile padding (640px+)
        // Tablet optimizations (768px-1023px)
        "md:py-20 md:px-8", // More generous tablet padding
        // Desktop layout with proper space utilization (1024px+)
        "lg:py-24 lg:px-12", // Ample desktop padding
        "xl:py-28 xl:px-16", // Maximum padding for large screens
        "bg-amber-100", // funeral background color from design tokens
        // Orientation handling
        "landscape:py-8", // Reduced padding in landscape
        "md:landscape:py-16", // Tablet landscape adjustment
        className
      )}
      aria-labelledby="products-heading"
      aria-describedby="products-description"
      role="region"
    >
      <div
        className={cn(
          // Mobile-first max-width progression for better space utilization
          "max-w-sm mx-auto", // 384px for very small screens
          "xs:max-w-md", // 448px for 375px+ screens
          "sm:max-w-4xl", // 896px for small screens (640px+)
          "md:max-w-5xl", // 1024px for tablets
          "lg:max-w-6xl", // 1152px for desktop
          "xl:max-w-7xl" // 1280px for large screens
        )}
      >
        {/* Section heading with mobile-first responsive design */}
        <div
          className={cn(
            "text-center",
            // Mobile-first spacing
            "mb-8", // Compact spacing on mobile
            "xs:mb-10", // Slightly more for 375px+
            "sm:mb-12", // Standard spacing for 640px+
            "md:mb-16", // Tablet spacing
            "lg:mb-20" // Desktop spacing
          )}
        >
          <h2
            id="products-heading"
            className={cn(
              // Mobile-first typography (320px-767px)
              "text-2xl font-bold text-teal-800", // 24px for mobile
              "xs:text-3xl", // 30px for 375px+ screens
              "sm:text-4xl", // 36px for 640px+ screens
              // Tablet optimizations (768px-1023px)
              "md:text-5xl", // 48px for tablet - strong hierarchy
              // Desktop layout with proper space utilization (1024px+)
              "lg:text-6xl", // 60px for desktop - prominent display
              "xl:text-7xl", // 72px for large screens
              // Spacing
              "mb-3", // Compact on mobile
              "xs:mb-4", // Slightly more for 375px+
              "sm:mb-5", // Standard for 640px+
              "md:mb-6", // Tablet spacing
              "lg:mb-8", // Desktop spacing
              // Orientation adjustments
              "landscape:text-xl landscape:xs:text-2xl landscape:sm:text-3xl", // Smaller in landscape
              "md:landscape:text-4xl", // Tablet landscape
              // Accessibility
              "focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            )}
            tabIndex={0}
            role="heading"
            aria-level={2}
          >
            {safeT("heading")}
          </h2>
          <p
            id="products-description"
            className={cn(
              "text-hero",
              // Mobile-first typography (320px-767px)
              "text-sm", // 14px for very small screens
              "xs:text-base", // 16px for 375px+ screens
              "sm:text-lg", // 18px for 640px+ screens
              // Tablet optimizations (768px-1023px)
              "md:text-xl", // 20px for tablet
              // Desktop layout with proper space utilization (1024px+)
              "lg:text-2xl", // 24px for desktop
              "xl:text-3xl", // 30px for large screens
              // Responsive max-width for better readability
              "max-w-xs mx-auto", // Very narrow on small screens
              "xs:max-w-sm", // 384px for 375px+ screens
              "sm:max-w-lg", // 512px for 640px+ screens
              "md:max-w-xl", // 576px for tablet
              "lg:max-w-2xl", // 672px for desktop
              "xl:max-w-3xl", // 768px for large screens
              // Orientation adjustments
              "landscape:text-xs landscape:xs:text-sm landscape:sm:text-base", // Smaller in landscape
              "md:landscape:text-lg", // Tablet landscape
              // Accessibility
              "focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            )}
            tabIndex={0}
          >
            {safeT("description")}
          </p>
        </div>

        {/* Mobile-first responsive product grid with keyboard navigation */}
        <div
          className={cn(
            "grid",
            // Mobile-first grid layout (320px-767px)
            "grid-cols-1", // Single column for very small screens
            "xs:grid-cols-1", // Still single column for 375px+ (better for mobile UX)
            "sm:grid-cols-2", // Two columns for 640px+ screens
            // Tablet optimizations (768px-1023px)
            "md:grid-cols-2", // Two columns for tablet portrait
            // Desktop layout with proper space utilization (1024px+)
            "lg:grid-cols-3", // Three columns for desktop
            "xl:grid-cols-4", // Four columns for large screens
            "2xl:grid-cols-4", // Maintain four columns for very large screens
            // Mobile-first gap spacing
            "gap-4", // Compact gaps on mobile
            "xs:gap-5", // Slightly more for 375px+
            "sm:gap-6", // Standard gaps for 640px+
            "md:gap-7", // Tablet gaps
            "lg:gap-8", // Desktop gaps
            "xl:gap-10", // Large screen gaps
            // Orientation adjustments
            "landscape:gap-3 landscape:sm:gap-4", // Smaller gaps in landscape
            "md:landscape:gap-6" // Tablet landscape gaps
          )}
          role="grid"
          aria-label={safeT("productGridLabel")}
          aria-rowcount={Math.ceil(products.length / 4)}
          aria-colcount={4}
        >
          {products.map((product, index) => (
            <ProductReferenceCard
              key={product.id}
              product={product}
              index={index}
              locale={locale}
            />
          ))}
        </div>

        {/* Screen reader summary */}
        <div className="sr-only" aria-live="polite">
          <p>{safeT("summaryText", { count: products.length })}</p>
        </div>
      </div>
    </section>
  );
};

export default ProductReferencesSection;
