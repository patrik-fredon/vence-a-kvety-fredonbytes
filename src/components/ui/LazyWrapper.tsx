/**
 * Lazy loading wrapper for heavy components
 * Provides intersection observer-based lazy loading with fallback components
 */

"use client";

import { useState, useEffect, useRef, ReactNode, ComponentType } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: number;
}

/**
 * Generic lazy wrapper that loads content when it comes into view
 */
export function LazyWrapper({
  children,
  fallback,
  rootMargin = "50px",
  threshold = 0.1,
  className,
  minHeight = 200,
}: LazyWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (isVisible) {
      // Add a small delay to ensure smooth loading
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
    // Return undefined when isVisible is false to satisfy TypeScript
    return undefined;
  }, [isVisible]);

  const defaultFallback = (
    <div className="flex items-center justify-center" style={{ minHeight }}>
      <LoadingSpinner size="md" />
    </div>
  );

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {isLoaded ? children : fallback || defaultFallback}
    </div>
  );
}

/**
 * HOC for creating lazy-loaded components
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    rootMargin?: string;
    threshold?: number;
    minHeight?: number;
  }
) {
  return function LazyComponent(props: P) {
    return (
      <LazyWrapper {...options}>
        <Component {...props} />
      </LazyWrapper>
    );
  };
}

/**
 * Skeleton component for loading states
 */
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({
  className,
  width = "100%",
  height = "1rem",
  rounded = false,
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-neutral-200 ${rounded ? "rounded-full" : "rounded"} ${className || ""}`}
      style={{ width, height }}
    />
  );
}

/**
 * Product card skeleton for loading states
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      {/* Image skeleton */}
      <Skeleton height="200px" className="w-full" />

      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton height="1.25rem" width="80%" />

        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton height="0.875rem" width="100%" />
          <Skeleton height="0.875rem" width="60%" />
        </div>

        {/* Price skeleton */}
        <Skeleton height="1.5rem" width="40%" />

        {/* Button skeleton */}
        <Skeleton height="2.5rem" width="100%" className="rounded-md" />
      </div>
    </div>
  );
}

/**
 * Product grid skeleton for loading states
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Category filter skeleton
 */
export function CategoryFilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton
          key={index}
          height="2.5rem"
          width={`${Math.random() * 60 + 80}px`}
          className="rounded-full"
        />
      ))}
    </div>
  );
}

/**
 * Lazy image component with intersection observer
 */
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
}

export function LazyImage({ src, alt, className, width, height, placeholder }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse" style={{ width, height }} />
      )}

      <img
        ref={imgRef}
        src={
          isInView
            ? src
            : placeholder ||
              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        }
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}
