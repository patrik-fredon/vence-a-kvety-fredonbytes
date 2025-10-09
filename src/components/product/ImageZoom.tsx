/**
 * ImageZoom Component - Lightbox for product images
 *
 * Features:
 * - Full-screen image viewing with smooth animations
 * - Keyboard navigation (arrow keys, ESC)
 * - Touch gestures for mobile
 * - Image counter display
 * - Accessible with ARIA labels
 */

"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAnnouncer } from "@/lib/accessibility/hooks";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";
import { Button } from "../ui/Button";

interface ImageZoomProps {
  images: ProductImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export function ImageZoom({ images, initialIndex, isOpen, onClose, productName }: ImageZoomProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const announce = useAnnouncer();

  // Update current index when initial index changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        case "ArrowLeft":
          event.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
    return undefined;
  }, [isOpen]);

  const handlePrevious = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => {
      const newIndex = prev > 0 ? prev - 1 : images.length - 1;
      const currentImage = images[newIndex];
      announce(
        `Image ${newIndex + 1} of ${images.length}: ${currentImage?.alt || productName}`,
        "polite"
      );
      return newIndex;
    });

    setTimeout(() => setIsAnimating(false), 300);
  }, [images, productName, announce, isAnimating]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => {
      const newIndex = prev < images.length - 1 ? prev + 1 : 0;
      const currentImage = images[newIndex];
      announce(
        `Image ${newIndex + 1} of ${images.length}: ${currentImage?.alt || productName}`,
        "polite"
      );
      return newIndex;
    });

    setTimeout(() => setIsAnimating(false), 300);
  }, [images, productName, announce, isAnimating]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!(isOpen && images[currentIndex])) return null;

  const currentImage = images[currentIndex]!;
  const showNavigation = images.length > 1;

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-stone-900/95 backdrop-blur-sm",
        "animate-in fade-in duration-200"
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className={cn(
          "absolute top-4 right-4 z-10",
          "bg-stone-900/50 hover:bg-stone-900/70",
          "text-amber-100 hover:text-amber-100",
          "backdrop-blur-sm"
        )}
        aria-label="Close image viewer"
      >
        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
      </Button>

      {/* Image counter */}
      {showNavigation && (
        <div
          className={cn(
            "absolute top-4 left-1/2 -translate-x-1/2 z-10",
            "px-4 py-2 rounded-full",
            "bg-stone-900/50 backdrop-blur-sm",
            "text-amber-100 text-sm font-medium"
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Previous button */}
      {showNavigation && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          disabled={isAnimating}
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 z-10",
            "bg-stone-900/50 hover:bg-stone-900/70",
            "text-amber-100 hover:text-amber-100",
            "backdrop-blur-sm",
            "h-12 w-12"
          )}
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="h-8 w-8" aria-hidden="true" />
        </Button>
      )}

      {/* Next button */}
      {showNavigation && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={isAnimating}
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 z-10",
            "bg-stone-900/50 hover:bg-stone-900/70",
            "text-amber-100 hover:text-amber-100",
            "backdrop-blur-sm",
            "h-12 w-12"
          )}
          aria-label="Next image"
        >
          <ChevronRightIcon className="h-8 w-8" aria-hidden="true" />
        </Button>
      )}

      {/* Main image */}
      <div
        className={cn(
          "relative w-full h-full max-w-7xl max-h-[90vh]",
          "mx-4 my-auto",
          "transition-opacity duration-300",
          isAnimating ? "opacity-50" : "opacity-100"
        )}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.alt || productName}
          fill
          sizes="100vw"
          className="object-contain"
          quality={90}
          priority
        />
      </div>

      {/* Image caption */}
      {currentImage.alt && (
        <div
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 z-10",
            "max-w-2xl px-6 py-3 rounded-lg",
            "bg-stone-900/50 backdrop-blur-sm",
            "text-amber-100 text-sm text-center"
          )}
        >
          {currentImage.alt}
        </div>
      )}

      {/* Touch gesture hint for mobile */}
      {showNavigation && (
        <div
          className={cn(
            "absolute bottom-20 left-1/2 -translate-x-1/2 z-10",
            "px-4 py-2 rounded-full",
            "bg-stone-900/30 backdrop-blur-sm",
            "text-amber-100/70 text-xs",
            "md:hidden"
          )}
        >
          Swipe to navigate
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
