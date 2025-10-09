"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, XMarkIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Customization, ProductImage } from "@/types/product";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

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

  const handlePrevious = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === 0 ? relevantImages.length - 1 : prev - 1));
  }, [relevantImages.length]);

  const handleNext = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === relevantImages.length - 1 ? 0 : prev + 1));
  }, [relevantImages.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFullscreen) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          handlePrevious();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          handleNext();
        } else if (event.key === "Escape") {
          event.preventDefault();
          setIsFullscreen(false);
          setIsZoomed(false);
        }
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen, handleNext, handlePrevious]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!(isZoomed && imageRef.current)) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    if (!isZoomed) {
      setZoomPosition({ x: 50, y: 50 });
    }
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
    setIsZoomed(false);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setIsZoomed(false);
  };

  if (relevantImages.length === 0) {
    return (
      <Card
        className={cn("aspect-square bg-funeral-gold flex items-center justify-center", className)}
      >
        <div className="text-stone-400 text-center">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">No images available</div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Main Image Display */}
        <Card
          padding="none"
          className="relative aspect-square bg-funeral-gold overflow-hidden group"
        >
          {selectedImage && (
            <div
              ref={imageRef}
              className="relative w-full h-full"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <Image
                src={selectedImage.url}
                alt={selectedImage.alt || productName}
                fill
                className={cn(
                  "object-cover transition-all duration-300 cursor-pointer",
                  isZoomed && "scale-150"
                )}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : undefined
                }
                onClick={toggleZoom}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Zoom overlay */}
              {isZoomed && <div className="absolute inset-0 bg-black/10 pointer-events-none" />}

              {/* Navigation Arrows */}
              {relevantImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-stone-700" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-stone-700" />
                  </button>
                </>
              )}

              {/* Fullscreen button */}
              <button
                onClick={openFullscreen}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                aria-label="View fullscreen"
              >
                <MagnifyingGlassIcon className="w-5 h-5 text-stone-700" />
              </button>

              {/* Image Counter */}
              {relevantImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                  {selectedImageIndex + 1} / {relevantImages.length}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Thumbnail Navigation */}
        {relevantImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {relevantImages.map((image, index) => (
              <button
                key={`${image.id}-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  index === selectedImageIndex
                    ? "border-amber-600 ring-2 ring-amber-200 shadow-md"
                    : "border-stone-200 hover:border-stone-300 hover:shadow-sm"
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `${productName} thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Zoom Instructions */}
        {selectedImage && (
          <div className="text-xs text-stone-500 text-center">
            {isZoomed
              ? "Move mouse to pan • Click to zoom out"
              : "Click image to zoom • Click magnifying glass for fullscreen"}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors backdrop-blur-sm"
              aria-label="Close fullscreen"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {relevantImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-3 text-white transition-colors backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-3 text-white transition-colors backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Fullscreen image */}
            <div className="relative max-w-full max-h-full">
              <Image
                src={selectedImage.url}
                alt={selectedImage.alt || productName}
                width={1200}
                height={1200}
                className="max-w-full max-h-full object-contain"
                sizes="100vw"
              />
            </div>

            {/* Image counter */}
            {relevantImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                {selectedImageIndex + 1} / {relevantImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
