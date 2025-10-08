"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";
import { ImageZoom } from "./ImageZoom";

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
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Handle image click to open zoom
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsZoomOpen(true);
  };

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
      <>
        <div className={cn("w-full", className)}>
          <div
            className="relative overflow-hidden rounded-lg bg-teal-900 aspect-square w-full cursor-zoom-in group"
            onClick={() => handleImageClick(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleImageClick(0);
              }
            }}
            aria-label={`View ${firstImage.alt || productName} in full size`}
          >
            <Image
              src={firstImage.url}
              alt={firstImage.alt || productName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={70}
              priority
            />
            <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300" />
          </div>
        </div>
        <ImageZoom
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          productName={productName}
        />
      </>
    );
  }

  // Two images - side by side with main image larger
  if (images.length === 2) {
    return (
      <>
        <div className={cn("grid grid-cols-3 gap-3", className)}>
          {/* Main image - 2/3 width */}
          <div
            className="col-span-2 relative overflow-hidden rounded-lg bg-teal-900 aspect-square cursor-zoom-in group"
            onClick={() => handleImageClick(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleImageClick(0);
              }
            }}
            aria-label={`View ${firstImage.alt || productName} in full size`}
          >
            <Image
              src={firstImage.url}
              alt={firstImage.alt || productName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 400px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={70}
              priority
            />
            <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300" />
          </div>
          {/* Secondary image - 1/3 width */}
          {images[1] && (
            <div
              className="relative overflow-hidden rounded-lg bg-teal-900 aspect-square cursor-zoom-in group"
              onClick={() => handleImageClick(1)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleImageClick(1);
              }
            }}
            aria-label={`View ${images[1].alt || productName} in full size`}
          >
            <Image
              src={images[1].url}
              alt={images[1].alt || productName}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={70}
            />
            <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300" />
            </div>
          )}
        </div>
        <ImageZoom
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          productName={productName}
        />
      </>
    );
  }

  // Three images - main image on left, two stacked on right
  if (images.length === 3) {
    return (
      <>
        <div className={cn("grid grid-cols-2 gap-3", className)}>
          {/* Main image - full height left side */}
          <div
            className="row-span-2 relative overflow-hidden rounded-lg bg-teal-900 aspect-square cursor-zoom-in group"
            onClick={() => handleImageClick(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleImageClick(0);
              }
            }}
            aria-label={`View ${firstImage.alt || productName} in full size`}
          >
            <Image
              src={firstImage.url}
              alt={firstImage.alt || productName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={70}
              priority
            />
            <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300" />
          </div>
          {/* Secondary images - stacked on right */}
          {images.slice(1).map((image, index) => {
            if (!image) return null;
            const imageIndex = index + 1;
            return (
              <div
                key={image.id || index}
                className="relative overflow-hidden rounded-lg bg-teal-900 aspect-square cursor-zoom-in group"
                onClick={() => handleImageClick(imageIndex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleImageClick(imageIndex);
                  }
                }}
                aria-label={`View ${image.alt || productName} in full size`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || productName}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  quality={70}
                />
                <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300" />
              </div>
            );
          })}
        </div>
        <ImageZoom
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          productName={productName}
        />
      </>
    );
  }

  // Four or more images - advanced masonry-style grid
  // Main image takes prominent position, secondary images vary in size
  const secondaryImages = images.slice(1);
  const hasMany = images.length >= 6;

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Main image - dominant, 60-70% of visual space */}
        <div
          className="relative overflow-hidden rounded-lg bg-teal-900 w-full aspect-[4/3] cursor-zoom-in group"
          onClick={() => handleImageClick(0)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleImageClick(0);
            }
          }}
          aria-label={`View ${firstImage.alt || productName} in full size`}
        >
          <Image
            src={firstImage.url}
            alt={firstImage.alt || productName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            quality={70}
            priority
          />
          <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300" />
        </div>

        {/* Secondary images - varying sizes in responsive grid */}
        <div
          className={cn(
            "grid gap-3",
            // Dynamic grid based on number of images
            hasMany
              ? "grid-cols-3 auto-rows-[minmax(120px,1fr)]"
              : "grid-cols-2 auto-rows-[minmax(140px,1fr)]"
          )}
        >
          {secondaryImages.map((image, index) => {
            if (!image) return null;

            // Create visual rhythm with varying sizes
            // Pattern: large, medium, small, medium, large...
            const isLarge = index % 4 === 0 || index % 4 === 3;
            const isMedium = index % 4 === 1;
            const isWide = index % 5 === 0 && hasMany;
            const imageIndex = index + 1;

            return (
              <div
                key={image.id || index}
                className={cn(
                  "relative overflow-hidden rounded-lg bg-teal-900 cursor-zoom-in group",
                  // Varying column spans for visual interest
                  isWide && hasMany && "col-span-2",
                  // Varying row spans for natural flow
                  isLarge && "row-span-2",
                  isMedium && !hasMany && "row-span-1",
                  // Default aspect ratio
                  "aspect-square"
                )}
                onClick={() => handleImageClick(imageIndex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleImageClick(imageIndex);
                  }
                }}
                aria-label={`View ${image.alt || productName} in full size`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || productName}
                  fill
                  sizes={
                    isWide
                      ? "(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 300px"
                      : "(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
                  }
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  quality={70}
                />
                <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300" />
              </div>
            );
          })}
        </div>
      </div>
      <ImageZoom
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        productName={productName}
      />
    </>
  );
}


