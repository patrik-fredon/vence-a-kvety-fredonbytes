"use client";

import Image from "next/image";
import { useRef, useState } from "react";
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
 * - Mobile: Touch-friendly carousel with scroll-snap
 * - Desktop: Sophisticated grid layouts (1, 2, 3, 4+ images)
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Handle image click to open zoom
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsZoomOpen(true);
  };

  // Handle carousel scroll for mobile
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const slideWidth = container.offsetWidth;
    const newIndex = Math.round(container.scrollLeft / slideWidth);
    if (newIndex !== currentSlide) {
      setCurrentSlide(newIndex);
    }
  };

  // Navigate to specific slide
  const goToSlide = (index: number) => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      });
    }
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

  // Mobile Carousel View (< md breakpoint)
  const MobileCarousel = () => (
    <div className="md:hidden">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="relative overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        }}
        onScroll={handleScroll}
      >
        <div className="flex">
          {images.map((image, index) => {
            if (!image) return null;
            return (
              <div key={image.id || index} className="flex-shrink-0 w-full snap-center snap-always">
                <div
                  className="relative aspect-square bg-teal-900 rounded-lg overflow-hidden cursor-zoom-in group"
                  onClick={() => handleImageClick(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleImageClick(index);
                    }
                  }}
                  aria-label={`View ${image.alt || productName} in full size`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || productName}
                    fill
                    sizes="100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    quality={70}
                    priority={index === 0}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300 pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carousel Dots Navigation */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer",
                currentSlide === index ? "bg-teal-900 w-3" : "bg-teal-900/30 hover:bg-teal-900/50"
              )}
              aria-label={`Go to image ${index + 1}`}
              aria-current={currentSlide === index ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Desktop Grid View (>= md breakpoint)
  const DesktopGrid = () => {
    // Single image - display large
    if (images.length === 1) {
      return (
        <div className="hidden md:block w-full">
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
      );
    }

    // Two images - side by side with main image larger
    if (images.length === 2) {
      return (
        <div className="hidden md:grid grid-cols-3 gap-3">
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
      );
    }

    // Three images - main image on left, two stacked on right
    if (images.length === 3) {
      return (
        <div className="hidden md:grid grid-cols-2 gap-3">
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
      );
    }

    // Four or more images - advanced masonry-style grid
    const secondaryImages = images.slice(1);
    const hasMany = images.length >= 6;

    return (
      <div className="hidden md:block space-y-3">
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
            const isLarge = index % 4 === 0 || index % 4 === 3;
            const isMedium = index % 4 === 1;
            const isWide = index % 5 === 0 && hasMany;
            const imageIndex = index + 1;

            return (
              <div
                key={image.id || index}
                className={cn(
                  "relative overflow-hidden rounded-lg bg-teal-900 cursor-zoom-in group",
                  isWide && hasMany && "col-span-2",
                  isLarge && "row-span-2",
                  isMedium && !hasMany && "row-span-1",
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
    );
  };

  return (
    <div className={className}>
      {/* Mobile Carousel */}
      <MobileCarousel />

      {/* Desktop Grid */}
      <DesktopGrid />

      {/* Image Zoom Modal */}
      <ImageZoom
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        productName={productName}
      />
    </div>
  );
}
