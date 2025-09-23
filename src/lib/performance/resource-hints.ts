/**
 * Performance optimization utilities for critical resource hints and preloading
 * Addresses requirements 8.4 and 8.5 for critical resource prioritization
 */

export interface ResourceHint {
  rel: "preload" | "prefetch" | "preconnect" | "dns-prefetch";
  href: string;
  as?: "font" | "image" | "script" | "style" | "document";
  type?: string;
  crossOrigin?: "anonymous" | "use-credentials";
  media?: string;
}

/**
 * Critical resources that should be preloaded for optimal LCP
 */
export const getCriticalResourceHints = (locale: string = "en"): ResourceHint[] => [
  // Preconnect to external domains for faster connection establishment
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  // DNS prefetch for Supabase domains (if using external images)
  {
    rel: "dns-prefetch",
    href: "https://cdn.fredonbytes.com",
  },
  // Preload critical fonts for better text rendering
  {
    rel: "preload",
    href: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

/**
 * Get resource hints for hero section optimization
 */
export const getHeroResourceHints = (logoSrc?: string): ResourceHint[] => {
  const hints: ResourceHint[] = [];

  // Preload hero logo if provided
  if (logoSrc) {
    hints.push({
      rel: "preload",
      href: logoSrc,
      as: "image",
    });
  }

  return hints;
};

/**
 * Get resource hints for below-the-fold content
 */
export const getBelowFoldResourceHints = (): ResourceHint[] => [
  // Prefetch API endpoints that might be needed
  {
    rel: "prefetch",
    href: "/api/products/random",
  },
];

/**
 * Generate HTML link tags for resource hints
 */
export const generateResourceHintTags = (hints: ResourceHint[]): string => {
  return hints
    .map((hint) => {
      const attributes = Object.entries(hint)
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => {
          // Convert camelCase to kebab-case for HTML attributes
          const attrName = key.replace(/([A-Z])/g, "-$1").toLowerCase();
          return `${attrName}="${value}"`;
        })
        .join(" ");

      return `<link ${attributes}>`;
    })
    .join("\n");
};

/**
 * Critical CSS optimization utilities
 */
export const getCriticalCSSOptimizations = () => ({
  // Inline critical CSS for above-the-fold content
  inlineCriticalCSS: true,
  // Defer non-critical CSS loading
  deferNonCriticalCSS: true,
  // Preload critical stylesheets
  preloadCriticalCSS: [
    "/styles/critical.css", // Would contain hero section styles
  ],
  // Prefetch non-critical stylesheets
  prefetchNonCriticalCSS: [
    "/styles/components.css", // Product grid and other components
  ],
});

/**
 * Font optimization configuration
 */
export const getFontOptimizations = () => ({
  // Use font-display: swap for better loading performance
  fontDisplay: "swap",
  // Preload critical font variants
  preloadFonts: [
    {
      href: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
      weight: "400",
      style: "normal",
    },
    {
      href: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2",
      weight: "600",
      style: "normal",
    },
  ],
});

/**
 * Image optimization configuration
 */
export const getImageOptimizations = () => ({
  // Formats in order of preference
  formats: ["image/avif", "image/webp", "image/jpeg"],
  // Device sizes for responsive images
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  // Image sizes for different breakpoints
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  // Quality settings
  quality: {
    hero: 90, // High quality for hero images
    product: 80, // Good quality for product images
    thumbnail: 70, // Lower quality for thumbnails
  },
  // Lazy loading configuration
  lazyLoading: {
    rootMargin: "50px", // Start loading 50px before entering viewport
    threshold: 0.1, // Trigger when 10% visible
  },
});

/**
 * Performance monitoring configuration
 */
export const getPerformanceConfig = () => ({
  // Core Web Vitals thresholds
  thresholds: {
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100, // First Input Delay (ms)
    CLS: 0.1, // Cumulative Layout Shift
    FCP: 1800, // First Contentful Paint (ms)
    TTFB: 800, // Time to First Byte (ms)
  },
  // Performance budget
  budget: {
    javascript: 200, // KB
    css: 100, // KB
    images: 1000, // KB
    fonts: 100, // KB
  },
});
