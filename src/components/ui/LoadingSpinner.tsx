import React from "react";
import { cn } from "@/lib/utils";
import { getFallbackTranslation } from "@/lib/utils/fallback-utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  locale?: string;
}

export function LoadingSpinner({
  size = "md",
  className = "",
  label,
  locale = "en",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Use fallback translation if label not provided
  const loadingLabel = label || getFallbackTranslation("common.loading", locale);

  return (
    <div
      className={`${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={loadingLabel}
      aria-live="polite"
    >
      <div
        className={cn(
          "rounded-full border-2 border-primary-200 border-t-primary-600",
          !prefersReducedMotion && "animate-spin",
          prefersReducedMotion && "animate-pulse", // Alternative for reduced motion
          // High contrast support
          "high-contrast:border-WindowText high-contrast:border-t-Highlight"
        )}
      >
        <span className="sr-only">{loadingLabel}</span>
      </div>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  locale?: string;
  timeout?: number;
  onTimeout?: () => void;
}

export function LoadingState({
  message,
  size = "md",
  className = "",
  locale = "en",
  timeout,
  onTimeout,
}: LoadingStateProps) {
  // Use fallback translation if message not provided
  const loadingMessage = message || getFallbackTranslation("common.loading", locale);

  // Handle timeout if specified
  React.useEffect(() => {
    if (timeout && onTimeout) {
      const timeoutId = setTimeout(onTimeout, timeout);
      return () => clearTimeout(timeoutId);
    }
    // Return undefined explicitly for the else case
    return undefined;
  }, [timeout, onTimeout]);

  return (
    <div
      className={cn("flex flex-col items-center justify-center space-y-3", className)}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size={size} locale={locale} />
      <p className="text-sm text-neutral-600 font-medium animate-gentle-fade">{loadingMessage}</p>
    </div>
  );
}

export function PageLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-memorial">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">🌹</span>
        </div>
        <LoadingState message="Načítání stránky..." size="lg" />
      </div>
    </div>
  );
}

export function ComponentLoadingState({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <LoadingState />
    </div>
  );
}

// Skeleton loaders for specific components
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-soft overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
        <div className="h-8 bg-neutral-200 rounded w-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
