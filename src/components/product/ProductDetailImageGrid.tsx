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
 * Displays product images in a flexible layout for the product detail page.
 * - Removes artificial height constraints for large monitors
 * - Main image displayed prominently with aspect-square ratio
 * - Thumbnail grid for additional images (responsive: 2/3/4 columns)
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
          "min-h-[400px]",
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

  const firstImage = images[0];
  if (!firstImage) {
    return null;
  }

  // Single image - display large
  if (images.length === 1) {
    return (
      <div className={cn("w-full", className)}>
        <div className="relative overflow-hidden rounded-lg bg-teal-900 aspect-square w-full">
          <Image
            src={firstImage.url}
            alt={firstImage.alt || productName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            className="object-cover"
            quality={70}
            priority
          />
        </div>
      </div>
    );
  }

  // Multiple images - flexible grid layout
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main image - first image displayed prominently */}
      <div className="relative overflow-hidden rounded-lg bg-teal-900 aspect-square w-full">
        <Image
          src={firstImage.url}
          alt={firstImage.alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          className="object-cover"
          quality={70}
          priority
        />
      </div>

      {/* Thumbnail grid - remaining images in responsive grid */}
      {images.length > 1 && (
        <div
          className={cn(
            "grid gap-2",
            // Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
            "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          )}
        >
          {images.slice(1).map((image, index) => (
            <div
              key={image.id || index}
              className="relative overflow-hidden rounded-md bg-teal-900 aspect-square"
            >
              <Image
                src={image.url}
                alt={image.alt || productName}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover"
                quality={70}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
