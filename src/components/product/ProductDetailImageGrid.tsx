"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";

interface ProductDetailImageGridProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

/**
 * ProductDetailImageGrid Component
 *
 * Displays product images in a responsive CSS Grid layout for the product detail page.
 * - Desktop: 2 columns
 * - Mobile: 1 column
 * - Max height constraint to match right column
 * - First image loads with priority, rest are lazy loaded
 * - Quality 70 for optimized performance
 */
export function ProductDetailImageGrid({
  images,
  productName,
  className,
}: ProductDetailImageGridProps) {
  // Handle empty images array
  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-teal-900 rounded-lg",
          "min-h-[400px] max-h-[700px]",
          className
        )}
      >
        <div className="text-amber-100 text-center">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">No images available</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        // Grid layout: 2 cols desktop, 1 col mobile
        "grid grid-cols-1 md:grid-cols-2 gap-4",
        // Max height constraint to match right column
        "max-h-[700px] overflow-y-auto",
        // Scrollbar styling
        "scrollbar-thin scrollbar-thumb-teal-800 scrollbar-track-teal-900",
        className
      )}
    >
      {images.map((image, index) => (
        <div
          key={image.id || index}
          className={cn(
            "relative overflow-hidden rounded-lg bg-teal-900",
            // Aspect ratio for consistent sizing
            "aspect-square",
            // First image spans full width on mobile for emphasis
            index === 0 && "md:col-span-2"
          )}
        >
          <Image
            src={image.url}
            alt={image.alt || productName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            quality={70}
            // Priority load first image only
            priority={index === 0}
            // Lazy load subsequent images
            loading={index === 0 ? undefined : "lazy"}
          />
        </div>
      ))}
    </div>
  );
}
