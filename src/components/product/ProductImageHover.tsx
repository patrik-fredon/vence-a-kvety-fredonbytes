"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage as ProductImageType } from "@/types/product";
import { ProductImage } from "./ProductImage";

interface ProductImageHoverProps {
  /** Primary product image */
  primaryImage: ProductImageType;
  /** Secondary image to show on hover */
  secondaryImage?: ProductImageType | undefined;
  /** Product name for alt text */
  productName: string;
  /** Current locale */
  locale: string;
  /** Whether this is a featured/priority image */
  priority?: boolean;
  /** Whether this image is above the fold */
  isAboveFold?: boolean;
  /** Image variant for optimization */
  variant?: "product" | "thumbnail" | "hero" | "gallery";
  /** Additional CSS classes */
  className?: string;
  /** Whether to fill the container */
  fill?: boolean;
  /** Fixed width (when not using fill) */
  width?: number;
  /** Fixed height (when not using fill) */
  height?: number;
  /** Custom sizes attribute */
  sizes?: string;
  /** Callback when image is clicked */
  onClick?: (e: React.MouseEvent) => void;
  /** Hover transition duration in milliseconds */
  transitionDuration?: number;
  /** Whether to enable touch device hover simulation */
  enableTouchHover?: boolean;
  /** Callback when hover state changes */
  onHoverChange?: (isHovered: boolean) => void;
}

export function ProductImageHover({
  primaryImage,
  secondaryImage,
  productName,
  locale,
  priority = false,
  isAboveFold = false,
  variant = "product",
  className,
  fill = false,
  width,
  height,
  sizes,
  onClick,
  transitionDuration = 500,
  enableTouchHover = true,
  onHoverChange,
}: ProductImageHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchHoverActive, setTouchHoverActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect touch device capability
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);

    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  // Handle hover state changes
  const handleHoverChange = useCallback(
    (hovered: boolean) => {
      setIsHovered(hovered);
      onHoverChange?.(hovered);
    },
    [onHoverChange]
  );

  // Mouse event handlers
  const handleMouseEnter = useCallback(() => {
    if (!isTouchDevice) {
      handleHoverChange(true);
    }
  }, [isTouchDevice, handleHoverChange]);

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice) {
      handleHoverChange(false);
    }
  }, [isTouchDevice, handleHoverChange]);

  // Touch event handlers for hover simulation
  const handleTouchStart = useCallback(
    (_e: React.TouchEvent) => {
      if (!(enableTouchHover && secondaryImage)) return;

      // Clear any existing timeout
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }

      // Activate touch hover
      setTouchHoverActive(true);
      handleHoverChange(true);

      // Auto-deactivate after 2 seconds
      touchTimeoutRef.current = setTimeout(() => {
        setTouchHoverActive(false);
        handleHoverChange(false);
      }, 2000);
    },
    [enableTouchHover, secondaryImage, handleHoverChange]
  );

  const handleTouchEnd = useCallback(() => {
    // Don't immediately deactivate on touch end to allow for tap-to-hover
    // The timeout will handle deactivation
  }, []);

  // Click handler
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // On touch devices, first tap shows hover, second tap triggers click
      if (isTouchDevice && enableTouchHover && secondaryImage && !touchHoverActive) {
        e.preventDefault();
        handleTouchStart(e as any);
        return;
      }

      onClick?.(e);
    },
    [isTouchDevice, enableTouchHover, secondaryImage, touchHoverActive, onClick, handleTouchStart]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  // Determine if secondary image should be shown
  const showSecondaryImage = isHovered && secondaryImage;

  // Calculate transition classes based on duration
  const transitionClasses = useMemo(() => {
    if (transitionDuration <= 150) return "transition-all duration-150 ease-in-out";
    if (transitionDuration <= 300) return "transition-all duration-300 ease-in-out";
    if (transitionDuration <= 500) return "transition-all duration-500 ease-in-out";
    if (transitionDuration <= 700) return "transition-all duration-700 ease-in-out";
    return "transition-all duration-1000 ease-in-out";
  }, [transitionDuration]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        // Ensure proper dimensions for fill images
        fill && "w-full h-full min-h-[200px]",
        !fill && "w-full h-full",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      style={{
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Primary Image */}
      <ProductImage
        image={primaryImage}
        productName={productName}
        locale={locale}
        priority={priority}
        isAboveFold={isAboveFold}
        variant={variant}
        fill={fill}
        {...(width && { width })}
        {...(height && { height })}
        {...(sizes && { sizes })}
        className={cn(
          "object-cover",
          transitionClasses,
          showSecondaryImage && "opacity-0 scale-105"
        )}
        showLoadingSpinner={false}
        preload={priority}
        enableIntersectionObserver={!priority}
      />

      {/* Secondary Image (shown on hover) */}
      {secondaryImage && (
        <div className="absolute inset-0">
          <ProductImage
            image={secondaryImage}
            productName={productName}
            locale={locale}
            priority={false}
            isAboveFold={false}
            variant={variant}
            fill={fill}
            {...(width && { width })}
            {...(height && { height })}
            {...(sizes && { sizes })}
            className={cn(
              "object-cover",
              transitionClasses,
              !showSecondaryImage && "opacity-0 scale-95"
            )}
            showLoadingSpinner={false}
            preload={false}
            enableIntersectionObserver={true}
          />
        </div>
      )}

      {/* Touch hover indicator for touch devices */}
      {isTouchDevice && enableTouchHover && secondaryImage && (
        <div
          className={cn(
            "absolute top-2 right-2 z-10 transition-opacity duration-300",
            touchHoverActive ? "opacity-0" : "opacity-70"
          )}
        >
          <div className="bg-black/50 rounded-full p-1.5">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite">
        {showSecondaryImage && (
          <span>
            {locale === "cs"
              ? `Zobrazuje se alternativní obrázek produktu ${productName}`
              : `Showing alternative image for ${productName}`}
          </span>
        )}
      </div>
    </div>
  );
}

export default ProductImageHover;
