/**
 * Image optimization utilities for better performance and user experience
 */

// Generate a blur data URL for placeholder effect
export const generateBlurDataURL = (
  width: number = 8,
  height: number = 8,
  color1: string = "#f3f4f6",
  color2: string = "#e5e7eb"
): string => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>`
  ).toString("base64")}`;
};

// Generate a low-quality image placeholder (LQIP) from a base64 string
export const generateLQIP = (_originalUrl: string): string => {
  // This is a simplified version - in production, you might want to generate
  // actual low-quality versions of images on the server
  return generateBlurDataURL(10, 10);
};

// Determine optimal image sizes based on viewport and usage
export const getOptimalImageSizes = (
  variant: "product" | "thumbnail" | "hero" | "avatar"
): string => {
  switch (variant) {
    case "product":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw";
    case "thumbnail":
      return "(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw";
    case "hero":
      return "100vw";
    case "avatar":
      return "(max-width: 640px) 15vw, 10vw";
    default:
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
  }
};

// Calculate optimal quality based on image usage and screen density
export const getOptimalQuality = (
  variant: "product" | "thumbnail" | "hero" | "avatar",
  isHighDensity: boolean = false
): number => {
  const baseQuality = {
    product: 85,
    thumbnail: 75,
    hero: 90,
    avatar: 80,
  }[variant];

  // Reduce quality slightly for high-density screens to balance file size
  return isHighDensity ? Math.max(baseQuality - 10, 60) : baseQuality;
};

// Check if device supports modern image formats
export const supportsModernFormats = (): { avif: boolean; webp: boolean } => {
  if (typeof window === "undefined") {
    return { avif: false, webp: false };
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  return {
    avif: canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0,
    webp: canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0,
  };
};

// Preload critical images for better performance
export const preloadImage = (src: string, priority: boolean = false): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;

    if (priority) {
      link.setAttribute("fetchpriority", "high");
    }

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));

    document.head.appendChild(link);
  });
};

// Lazy load images with intersection observer
export const createImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
};

// Performance monitoring for images
export interface ImageLoadMetrics {
  url: string;
  loadTime: number;
  fileSize?: number;
  dimensions?: { width: number; height: number };
  format?: string;
}

export const trackImagePerformance = (
  url: string,
  startTime: number,
  image?: HTMLImageElement
): ImageLoadMetrics => {
  const loadTime = performance.now() - startTime;

  const metrics: ImageLoadMetrics = {
    url,
    loadTime,
  };

  if (image) {
    metrics.dimensions = {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }

  // Try to get file size from performance API
  if (typeof window !== "undefined" && window.performance) {
    const resourceEntries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const imageEntry = resourceEntries.find((entry) => entry.name.includes(url));

    if (imageEntry && imageEntry.transferSize) {
      metrics.fileSize = imageEntry.transferSize;
    }
  }

  return metrics;
};

// Optimize image loading based on connection speed
export const getLoadingStrategy = (connectionSpeed?: "slow" | "fast"): "eager" | "lazy" => {
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const connection = (navigator as any).connection;

    if (connection) {
      // Slow connections: be more conservative with eager loading
      if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
        return "lazy";
      }

      // Fast connections: can afford more eager loading
      if (connection.effectiveType === "4g" && connection.downlink > 10) {
        return "eager";
      }
    }
  }

  // Default based on provided hint or conservative approach
  return connectionSpeed === "fast" ? "eager" : "lazy";
};

export default {
  generateBlurDataURL,
  generateLQIP,
  getOptimalImageSizes,
  getOptimalQuality,
  supportsModernFormats,
  preloadImage,
  createImageObserver,
  trackImagePerformance,
  getLoadingStrategy,
};
