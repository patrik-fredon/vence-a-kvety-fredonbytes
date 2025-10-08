"use client";

import Image from "next/image";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useCoreWebVitals } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  variant?: "product" | "thumbnail" | "hero" | "avatar";
  loading?: "lazy" | "eager";
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  /** Enable Core Web Vitals optimization */
  enableCoreWebVitals?: boolean;
  /** Component name for Core Web Vitals tracking */
  componentName?: string;
  /** Whether this image is the LCP candidate */
  isLCPCandidate?: boolean;
}

// Generate optimized blur placeholder for better perceived performance
const generateBlurDataURL = (width: number = 8, height: number = 8): string => {
  // Use stone palette colors from the centralized color system
  const stoneLight = "#f5f5f4"; // stone-100
  const stoneMedium = "#e7e5e4"; // stone-200

  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${stoneLight};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${stoneMedium};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>`
  ).toString("base64")}`;
};

// Optimized sizes configuration for different variants
const getSizesForVariant = (variant: OptimizedImageProps["variant"]): string => {
  switch (variant) {
    case "product":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw";
    case "thumbnail":
      return "(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw";
    case "hero":
      return "100vw";
    case "avatar":
      return "(max-width: 640px) 15vw, 10vw";
    default:
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
  }
};

// Quality settings based on variant for optimal file size vs quality balance
const getQualityForVariant = (variant: OptimizedImageProps["variant"]): number => {
  switch (variant) {
    case "product":
      return 85; // High quality for product images
    case "thumbnail":
      return 75; // Medium quality for thumbnails
    case "hero":
      return 90; // Highest quality for hero images
    case "avatar":
      return 80; // Good quality for avatars
    default:
      return 80;
  }
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  className,
  variant = "product",
  loading = "lazy",
  quality,
  placeholder = "blur",
  blurDataURL,
  onLoad,
  onError,
  enableCoreWebVitals = true,
  componentName = "OptimizedImage",
  isLCPCandidate = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

  // Core Web Vitals optimization
  const coreWebVitals = useCoreWebVitals({
    componentName: `${componentName}_Image`,
    enabled: enableCoreWebVitals,
    trackCLS: true,
    trackLCP: isLCPCandidate,
    reserveImageSpace: true,
  });

  // Memoize optimized sizes and quality based on variant
  const optimizedSizes = useMemo(() => {
    return sizes || getSizesForVariant(variant);
  }, [sizes, variant]);

  const optimizedQuality = useMemo(() => {
    return quality || getQualityForVariant(variant);
  }, [quality, variant]);

  // Memoize blur placeholder
  const optimizedBlurDataURL = useMemo(() => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === "blur") {
      return generateBlurDataURL(width || 400, height || 400);
    }
    return undefined;
  }, [blurDataURL, placeholder, width, height]);

  // CLS prevention styles
  const clsPreventionStyles = useMemo(() => {
    if (!(enableCoreWebVitals && width && height)) return {};
    return coreWebVitals.reserveImageSpace(width, height);
  }, [enableCoreWebVitals, width, height, coreWebVitals]);

  // Track image load start
  const handleLoadStart = useCallback(() => {
    const startTime = performance.now();
    setLoadStartTime(startTime);
  }, []);

  // Optimized load handler with Core Web Vitals tracking
  const handleLoad = useCallback(() => {
    const loadEndTime = performance.now();
    const loadDuration = loadStartTime ? loadEndTime - loadStartTime : 0;

    setIsLoading(false);

    // Record image load for Core Web Vitals
    if (enableCoreWebVitals && loadStartTime) {
      coreWebVitals.recordImageLoad(src, loadDuration, isLCPCandidate);
    }

    onLoad?.();
  }, [onLoad, loadStartTime, enableCoreWebVitals, coreWebVitals, src, isLCPCandidate]);

  // Optimized error handler
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // Error fallback component
  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-stone-100 text-stone-400",
          fill ? "absolute inset-0" : "w-full h-full",
          className
        )}
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
    <div className={cn("relative", !fill && "w-full h-full")} style={clsPreventionStyles}>
      <Image
        src={src}
        alt={alt}
        {...(!fill && width && { width })}
        {...(!fill && height && { height })}
        fill={fill}
        sizes={optimizedSizes}
        priority={priority}
        loading={priority ? "eager" : loading}
        quality={optimizedQuality}
        placeholder={placeholder}
        {...(optimizedBlurDataURL && { blurDataURL: optimizedBlurDataURL })}
        className={cn(
          "transition-all duration-300",
          isLoading && "blur-sm scale-105",
          !isLoading && "blur-0 scale-100",
          className
        )}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100/50 backdrop-blur-sm">
          <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
