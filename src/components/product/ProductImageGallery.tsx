"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ProductImage, Customization } from "@/types/product";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  customizations?: Customization[];
  className?: string;
}

export function ProductImageGallery({
  images,
  productName,
  customizations = [],
  className,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Filter images based on customizations
  const getRelevantImages = () => {
    if (customizations.length === 0) {
      return images;
    }

    // Get images that match current customizations or have no customization link
    const relevantImages = images.filter((image) => {
      if (!image.customizationId) return true; // Always show base images

      return customizations.some((customization) =>
        customization.choiceIds.includes(image.customizationId!)
      );
    });

    return relevantImages.length > 0 ? relevantImages : images;
  };

  const relevantImages = getRelevantImages();
  const selectedImage = relevantImages[selectedImageIndex];

  // Reset selected index when images change
  useEffect(() => {
    if (selectedImageIndex >= relevantImages.length) {
      setSelectedImageIndex(0);
    }
  }, [relevantImages.length, selectedImageIndex]);

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? relevantImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === relevantImages.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      handlePrevious();
    } else if (event.key === "ArrowRight") {
      handleNext();
    } else if (event.key === "Escape") {
      setIsZoomed(false);
    }
  };

  if (relevantImages.length === 0) {
    return (
      <div
        className={cn(
          "aspect-square bg-neutral-100 rounded-lg flex items-center justify-center",
          className
        )}
      >
        <div className="text-neutral-400 text-center">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">No images available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image Display */}
      <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden group">
        {selectedImage && (
          <>
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt || productName}
              fill
              className={cn(
                "object-cover transition-transform duration-300",
                isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
              )}
              onClick={() => setIsZoomed(!isZoomed)}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />

            {/* Navigation Arrows */}
            {relevantImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-neutral-700" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-5 h-5 text-neutral-700" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {relevantImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {selectedImageIndex + 1} / {relevantImages.length}
              </div>
            )}
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {relevantImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {relevantImages.map((image, index) => (
            <button
              key={`${image.id}-${index}`}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                index === selectedImageIndex
                  ? "border-primary-500 ring-2 ring-primary-200"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} thumbnail ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Instructions */}
      {selectedImage && (
        <div className="text-xs text-neutral-500 text-center">
          {isZoomed ? "Click to zoom out" : "Click image to zoom in"}
        </div>
      )}
    </div>
  );
}
