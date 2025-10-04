"use client";

import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductReferencesSectionProps } from "@/types/components";

// Lazy load the ProductReferencesSection component
const ProductReferencesSection = lazy(() =>
  import("./ProductReferencesSection").then((module) => ({
    default: module.ProductReferencesSection,
  }))
);

// Loading skeleton component for better UX
const ProductReferencesSkeleton = ({ locale }: { locale: string }) => (
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
      "bg-funeral-gold", // funeral background color from design tokens
      // Orientation handling
      "landscape:py-8", // Reduced padding in landscape
      "md:landscape:py-16" // Tablet landscape adjustment
    )}
    aria-labelledby="products-heading"
    aria-describedby="products-loading"
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
      {/* Section heading skeleton */}
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
        <div
          className={cn(
            "bg-white/10 rounded-lg animate-pulse",
            // Mobile-first typography dimensions
            "h-8 w-48 mx-auto mb-4", // 24px height for mobile
            "xs:h-10 xs:w-56", // 30px for 375px+ screens
            "sm:h-12 sm:w-64", // 36px for 640px+ screens
            "md:h-16 md:w-72", // 48px for tablet
            "lg:h-20 lg:w-80" // 60px for desktop
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            "bg-white/5 rounded-lg animate-pulse mx-auto",
            "h-4 w-64", // Mobile
            "xs:h-5 xs:w-72", // 375px+
            "sm:h-6 sm:w-80", // 640px+
            "md:h-7 md:w-96", // Tablet
            "lg:h-8 lg:w-[28rem]" // Desktop
          )}
          aria-hidden="true"
        />
      </div>

      {/* Product grid skeleton */}
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
          "xl:gap-10" // Large screen gaps
        )}
        aria-hidden="true"
      >
        {/* Generate skeleton cards based on expected product count */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden",
              "animate-pulse"
            )}
          >
            {/* Image skeleton */}
            <div className="aspect-square bg-white/5" />
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-6 bg-white/5 rounded w-3/4" />
              <div className="h-4 bg-white/5 rounded w-1/2" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Loading announcement for screen readers */}
      <div className="sr-only" aria-live="polite">
        <span id="products-loading">
          {locale === "cs" ? "Načítání produktů..." : "Loading products..."}
        </span>
      </div>
    </div>
  </section>
);

// Error boundary for lazy loading failures
class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("LazyProductReferencesSection failed to load:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Main lazy loading wrapper component
export function LazyProductReferencesSection(props: ProductReferencesSectionProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasLoaded) {
          setIsIntersecting(true);
          setHasLoaded(true);
          // Disconnect observer after first intersection to prevent re-loading
          observer.disconnect();
        }
      },
      {
        // Load when section is 100px away from viewport
        rootMargin: "100px 0px",
        // Trigger when at least 10% of the section is visible
        threshold: 0.1,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasLoaded]);

  // Error fallback component
  const ErrorFallback = () => (
    <section
      className={cn(
        "py-12 px-3 bg-funeral-gold",
        "xs:py-14 xs:px-4",
        "sm:py-16 sm:px-6",
        "md:py-20 md:px-8",
        "lg:py-24 lg:px-12",
        "xl:py-28 xl:px-16"
      )}
      aria-labelledby="products-error-heading"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          id="products-error-heading"
          className="text-2xl font-bold text-amber-100 mb-4 sm:text-3xl md:text-4xl"
        >
          {props.locale === "cs" ? "Naše produkty" : "Our Products"}
        </h2>
        <p className="text-amber-100 text-lg">
          {props.locale === "cs"
            ? "Produkty se momentálně nepodařilo načíst. Zkuste prosím obnovit stránku."
            : "Products could not be loaded at this time. Please try refreshing the page."}
        </p>
      </div>
    </section>
  );

  return (
    <div ref={sectionRef}>
      {isIntersecting ? (
        <LazyLoadErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<ProductReferencesSkeleton locale={props.locale} />}>
            <ProductReferencesSection {...props} />
          </Suspense>
        </LazyLoadErrorBoundary>
      ) : (
        <ProductReferencesSkeleton locale={props.locale} />
      )}
    </div>
  );
}
