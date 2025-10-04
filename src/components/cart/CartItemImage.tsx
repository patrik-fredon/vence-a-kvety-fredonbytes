"use client";

import Image from "next/image";
import React, { useState } from "react";
import { resolveCartItemImage } from "@/lib/cart/image-utils";
import { ShoppingCartIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

/**
 * Size variants for cart item images
 */
export type CartItemImageSize = "sm" | "md" | "lg";

/**
 * Props for CartItemImage component
 */
export interface CartItemImageProps {
  item: CartItem;
  locale: string;
  size?: CartItemImageSize;
  className?: string;
}

/**
 * Size configuration mapping
 */
const SIZE_CONFIG: Record<
  CartItemImageSize,
  {
    container: string;
    dimensions: number;
    iconSize: string;
  }
> = {
  sm: {
    container: "w-16 h-16",
    dimensions: 64,
    iconSize: "w-5 h-5",
  },
  md: {
    container: "w-20 h-20",
    dimensions: 80,
    iconSize: "w-6 h-6",
  },
  lg: {
    container: "w-32 h-32",
    dimensions: 128,
    iconSize: "w-8 h-8",
  },
};

/**
 * Loading skeleton component
 */
function ImageSkeleton({ size }: { size: CartItemImageSize }) {
  const config = SIZE_CONFIG[size];
  return (
    <div
      className={cn(config.container, "bg-stone-200 animate-pulse rounded-lg")}
      aria-label="Loading image"
    />
  );
}

/**
 * Fallback image component for errors or missing images
 */
function FallbackImage({ size, alt }: { size: CartItemImageSize; alt: string }) {
  const config = SIZE_CONFIG[size];
  return (
    <div
      className={cn(
        config.container,
        "bg-teal-100 rounded-lg overflow-hidden flex items-center justify-center"
      )}
      role="img"
      aria-label={alt}
    >
      <ShoppingCartIcon className={cn(config.iconSize, "text-stone-400")} />
    </div>
  );
}

/**
 * CartItemImage Component
 *
 * Displays product images for cart items with proper fallbacks and loading states.
 * Handles image resolution, error states, and accessibility.
 *
 * @example
 * ```tsx
 * <CartItemImage item={cartItem} locale="cs" size="md" />
 * ```
 */
export function CartItemImage({ item, locale, size = "md", className }: CartItemImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve the best image to display
  const imageResolution = resolveCartItemImage(item, locale);

  // Show fallback if no URL or error occurred
  if (!imageResolution.url || imageError) {
    return <FallbackImage size={size} alt={imageResolution.alt} />;
  }

  const config = SIZE_CONFIG[size];

  return (
    <div className={cn("relative", config.container, className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0">
          <ImageSkeleton size={size} />
        </div>
      )}

      {/* Actual image */}
      <Image
        src={imageResolution.url}
        alt={imageResolution.alt}
        width={config.dimensions}
        height={config.dimensions}
        className={cn(
          "rounded-lg object-cover transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
          console.error("Failed to load cart item image:", imageResolution.url);
        }}
        priority={size === "lg"} // Prioritize larger images
      />
    </div>
  );
}
