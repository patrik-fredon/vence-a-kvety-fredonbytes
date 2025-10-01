import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseImageOptimizationOptions {
  /** Number of images to prioritize (above-fold) */
  priorityCount?: number;
  /** Intersection observer root margin for lazy loading */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Enable/disable lazy loading */
  enableLazyLoading?: boolean;
}

export interface ImageOptimizationResult {
  /** Whether this image should have priority loading */
  shouldPrioritize: (index: number) => boolean;
  /** Whether this image should be lazy loaded */
  shouldLazyLoad: (index: number) => boolean;
  /** Register an image element for intersection observation */
  registerImage: (element: HTMLElement | null, index: number) => void;
  /** Check if an image is visible */
  isImageVisible: (index: number) => boolean;
  /** Get optimized loading strategy for an image */
  getLoadingStrategy: (index: number) => "eager" | "lazy";
  /** Get priority setting for an image */
  getPriority: (index: number) => boolean;
}

export const useImageOptimization = (
  options: UseImageOptimizationOptions = {}
): ImageOptimizationResult => {
  const {
    priorityCount = 6, // First 6 images get priority (above-fold content)
    rootMargin = "50px",
    threshold = 0.1,
    enableLazyLoading = true,
  } = options;

  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageElementsRef = useRef<Map<number, HTMLElement>>(new Map());

  // Initialize intersection observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading || typeof window === "undefined") return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const imageIndex = Number(entry.target.getAttribute("data-image-index"));

          if (entry.isIntersecting) {
            setVisibleImages((prev) => new Set([...prev, imageIndex]));
          } else {
            setVisibleImages((prev) => {
              const newSet = new Set(prev);
              newSet.delete(imageIndex);
              return newSet;
            });
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enableLazyLoading, rootMargin, threshold]);

  // Register image element for observation
  const registerImage = useCallback((element: HTMLElement | null, index: number) => {
    if (!element || !observerRef.current) return;

    // Store element reference
    imageElementsRef.current.set(index, element);

    // Add data attribute for identification
    element.setAttribute("data-image-index", index.toString());

    // Start observing
    observerRef.current.observe(element);

    // Cleanup function
    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
        imageElementsRef.current.delete(index);
      }
    };
  }, []);

  // Determine if image should have priority loading
  const shouldPrioritize = useCallback((index: number): boolean => {
    return index < priorityCount;
  }, [priorityCount]);

  // Determine if image should be lazy loaded
  const shouldLazyLoad = useCallback((index: number): boolean => {
    if (!enableLazyLoading) return false;
    return index >= priorityCount;
  }, [enableLazyLoading, priorityCount]);

  // Check if image is currently visible
  const isImageVisible = useCallback((index: number): boolean => {
    return visibleImages.has(index);
  }, [visibleImages]);

  // Get optimized loading strategy
  const getLoadingStrategy = useCallback((index: number): "eager" | "lazy" => {
    return shouldPrioritize(index) ? "eager" : "lazy";
  }, [shouldPrioritize]);

  // Get priority setting
  const getPriority = useCallback((index: number): boolean => {
    return shouldPrioritize(index);
  }, [shouldPrioritize]);

  return useMemo(() => ({
    shouldPrioritize,
    shouldLazyLoad,
    registerImage,
    isImageVisible,
    getLoadingStrategy,
    getPriority,
  }), [
    shouldPrioritize,
    shouldLazyLoad,
    registerImage,
    isImageVisible,
    getLoadingStrategy,
    getPriority,
  ]);
};

export default useImageOptimization;
