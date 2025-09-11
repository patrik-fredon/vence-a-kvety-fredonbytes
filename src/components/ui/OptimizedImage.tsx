/**
 * Optimized Image component with lazy loading, proper sizing, and performance optimizations
 */

import Image from "next/image";
import { useState } from "react";
import { clsx } from "clsx";

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
