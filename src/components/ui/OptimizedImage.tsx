/**
 * Optimized Image component with lazy loading, proper sizing, and performance optimizations
 */

import { clsx } from "clsx";
import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Generate a simple blur placeholder
 */
function generateBlurDataURL(width = 10, height = 10): string {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>`
  ).toString("base64")}`;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 85,
  placeholder = "blur",
  blurDataURL,
  objectFit = "cover",
  loading = "lazy",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate default blur placeholder if not provided
  const defaultBlurDataURL = blurDataURL || generateBlurDataURL(width, height);

  // Default sizes for responsive images
  const defaultSizes = sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

  if (hasError) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center bg-neutral-100 text-neutral-400",
          className
        )}
        style={{ width, height }}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

import React, { useState, useCallback, useMemo } from "react";
import Image from "next/image";
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
}

// Generate optimized blur placeholder for better perceived performance
const generateBlurDataURL = (width: number = 8, height: number = 8): string => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
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
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  // Optimized load handler
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

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
    <div className={cn("relative", !fill && "w-full h-full")}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={optimizedSizes}
        priority={priority}
        loading={priority ? "eager" : loading}
        quality={optimizedQuality}
        placeholder={placeholder}
        blurDataURL={optimizedBlurDataURL}
        className={cn(
          "transition-all duration-300",
          isLoading && "blur-sm scale-105",
          !isLoading && "blur-0 scale-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        // Performance optimizations
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
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

  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse" style={{ width, height }} />
      )}

      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === "blur" ? defaultBlurDataURL : undefined}
        sizes={fill ? defaultSizes : undefined}
        loading={priority ? "eager" : loading}
        className={clsx(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down"
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

/**
 * Product image component with specific optimizations for product photos
 */
interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  size?: "small" | "medium" | "large" | "xl";
}

export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  size = "medium",
}: ProductImageProps) {
  const dimensions = {
    small: { width: 200, height: 200 },
    medium: { width: 400, height: 400 },
    large: { width: 600, height: 600 },
    xl: { width: 800, height: 800 },
  };

  const { width, height } = dimensions[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={90}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      objectFit="cover"
    />
  );
}

/**
 * Hero image component for banners and large images
 */
interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function HeroImage({ src, alt, className, priority = true }: HeroImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={className}
      priority={priority}
      quality={95}
      sizes="100vw"
      objectFit="cover"
    />
  );
}

/**
 * Avatar image component for user profiles
 */
interface AvatarImageProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function AvatarImage({ src, alt, size = 40, className }: AvatarImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={clsx("rounded-full", className)}
      quality={80}
      objectFit="cover"
    />
  );
}
