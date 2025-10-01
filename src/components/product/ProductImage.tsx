"use client";

import React, { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage as ProductImageType } from "@/types/product";

interface ProductImageProps {
  /** Product image data from database */
  image: ProductImageType;
  /** Product name for fallback alt text */
  productName: string;
  /** Current locale for alt text */
  locale: string;
  /** Whether this image should be loaded with priority */
  priority?: boolean;
  /** Custom sizes attribute for responsive images */
  sizes?: string;
  /** Additional CSS classes */
  className?: string;
  /** Image variant for optimization settings */
  variant?: "product" | "thumbnail" | "hero" | "gallery";
  /** Whether to fill the container */
  fill?: boolean;
  /** Fixed width (when not using fill) */
  width?: number;
  /** Fixed height (when not using fill) */
  height?: number;
  /** Loading behavior */
  loading?: "lazy" | "eager";
  /** Quality setting (1-100) */
  quality?: number;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Callback when loading starts */
  onLoadStart?: () => void;
  /** Whether to show loading spinner */
  showLoadingSpinner?: boolean;
  /** Whether to show error fallback */
  showErrorFallback?: boolean;
  /** Custom fallback image URL */
  fallbackSrc?: string;
}

// Generate optimized blur placeholder
const generateBlurDataURL = (width: number = 8, height: number = 8): string => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f5f5f4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e7e5e4;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>`
  ).toString("base64")}`;
};

// Default fallback image (funeral-appropriate placeholder)
const DEFAULT_FALLBACK_IMAGE = `data:image/svg+xml;base64,${Buffer.from(
  `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fallback" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f5f5f4;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#d6d3d1;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#fallback)" />
    <g transform="translate(150, 150)">
      <circle cx="50" cy="50" r="40" fill="#a8a29e" opacity="0.3"/>
      <path d="M30 40 L50 20 L70 40 L60 40 L60 70 L40 70 L40 40 Z" fill="#78716c" opacity="0.5"/>
      <circle cx="45" cy="35" r="3" fill="#78716c" opacity="0.7"/>
    </g>
    <text x="200" y="350" text-anchor="middle" fill="#78716c" font-family="Arial, sans-serif" font-size="14" opacity="0.6">
      Obrázek není dostupný
    </text>
  </svg>`
).toString("base64")}`;

// Optimized sizes configuration for different variants
const getSizesForVariant = (variant: ProductImageProps["variant"]): string => {
  switch (variant) {
    case "product":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw";
    case "thumbnail":
      return "(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw";
    case "hero":
      return "100vw";
    case "gallery":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw";
    default:
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
  }
};

// Quality settings based on variant
const getQualityForVariant = (variant: ProductImageProps["variant"]): number => {
  switch (variant) {
    case "product":
      return 85; // High quality for product images
    case "thumbnail":
      return 75; // Medium quality for thumbnails
    case "hero":
      return 90; // Highest quality for hero images
    case "gallery":
      return 88; // High quality for gallery images
    default:
      return 80;
  }
};

export function ProductImage({
  image,
  productName,
  locale,
  priority = false,
  sizes,
  className,
  variant = "product",
  fill = false,
  width,
  height,
  loading = "lazy",
  quality,
  onLoad,
  onError,
  onLoadStart,
  showLoadingSpinner = true,
  showErrorFallback = true,
  fallbackSrc,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

  // Memoize optimized configuration
  const optimizedSizes = useMemo(() => {
    return sizes || getSizesForVariant(variant);
  }, [sizes, variant]);

  const optimizedQuality = useMemo(() => {
    return quality || getQualityForVariant(variant);
  }, [quality, variant]);

  // Generate blur placeholder from image dimensions or defaults
  const blurDataURL = useMemo(() => {
    if (image.blurDataUrl) return image.blurDataUrl;
    return generateBlurDataURL(image.width || 400, image.height || 400);
  }, [image.blurDataUrl, image.width, image.height]);

  // Determine alt text with proper fallbacks
  const altText = useMemo(() => {
    if (image.alt) return image.alt;
    return `${productName} - produkt obrázek`;
  }, [image.alt, productName]);

  // Handle load start with performance tracking
  const handleLoadStart = useCallback(() => {
    const startTime = performance.now();
    setLoadStartTime(startTime);
    onLoadStart?.();
  }, [onLoadStart]);

  // Handle successful image load
  const handleLoad = useCallback(() => {
    const loadEndTime = performance.now();
    const loadDuration = loadStartTime ? loadEndTime - loadStartTime : 0;

    setIsLoading(false);
    setHasError(false);

    // Log performance for monitoring
    if (loadStartTime && loadDuration > 1000) {
      console.warn(`Slow image load detected: ${image.url} took ${loadDuration.toFixed(2)}ms`);
    }

    onLoad?.();
  }, [onLoad, loadStartTime, image.url]);

  // Handle image load error with fallback
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);

    // Log error for monitoring
    console.error(`Failed to load product image: ${image.url}`);

    onError?.();
  }, [onError, image.url]);

  // Determine final image source with fallback
  const imageSrc = useMemo(() => {
    if (hasError) {
      return fallbackSrc || DEFAULT_FALLBACK_IMAGE;
    }
    return image.url;
  }, [hasError, image.url, fallbackSrc]);

  // Error fallback component
  if (hasError && !showErrorFallback) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-stone-100 text-stone-400",
          fill ? "absolute inset-0" : "w-full h-full",
          className
        )}
        role="img"
        aria-label={`Obrázek produktu ${productName} se nepodařilo načíst`}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative", !fill && "w-full h-full")}>
      <Image
        src={imageSrc}
        alt={altText}
        {...(!fill && width && { width })}
        {...(!fill && height && { height })}
        {...(fill && { fill: true })}
        sizes={optimizedSizes}
        priority={priority}
        loading={priority ? "eager" : loading}
        quality={optimizedQuality}
        placeholder="blur"
        blurDataURL={blurDataURL}
        className={cn(
          "transition-all duration-300",
          isLoading && "blur-sm scale-105",
          !isLoading && "blur-0 scale-100",
          hasError && "opacity-75",
          className
        )}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Loading spinner overlay */}
      {isLoading && showLoadingSpinner && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-stone-100/50 backdrop-blur-sm"
          aria-label="Načítání obrázku..."
        >
          <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error indicator for accessibility */}
      {hasError && (
        <div className="sr-only" role="alert">
          Obrázek produktu {productName} se nepodařilo načíst. Zobrazuje se náhradní obrázek.
        </div>
      )}
    </div>
  );
}

export default ProductImage;
