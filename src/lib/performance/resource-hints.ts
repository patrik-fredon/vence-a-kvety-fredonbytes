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
export const getCriticalResourceHints = (_locale: string = "en"): ResourceHint[] => [
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
        .filter(([_key, value]) => value !== undefined)
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
    hero: 95, // Highest quality for hero images
    product: 85, // High quality for product images
    thumbnail: 75, // Good quality for thumbnails
    fallback: 50, // Lower quality for fallback images
  },
  // Lazy loading configuration
  lazyLoading: {
    rootMargin: "100px", // Start loading 100px before entering viewport
    threshold: 0.1, // Trigger when 10% visible
  },
  // Preloading configuration for critical images
  preloading: {
    // Number of above-the-fold images to preload
    aboveFoldCount: 4,
    // Preload hero images immediately
    heroImages: true,
    // Preload first product grid row
    firstProductRow: true,
    // Use fetchpriority="high" for critical images
    useFetchPriority: true,
  },
  // Caching configuration
  caching: {
    // Browser cache duration (1 year)
    maxAge: 31536000,
    // Use immutable cache for optimized images
    immutable: true,
    // Stale-while-revalidate for better UX
    staleWhileRevalidate: 86400, // 1 day
  },
  // Responsive image sizes for different components
  responsiveSizes: {
    hero: "(min-width: 1200px) 1200px, (min-width: 768px) 100vw, 100vw",
    productGrid: "(min-width: 1200px) 300px, (min-width: 768px) 50vw, 100vw",
    productDetail: "(min-width: 1200px) 600px, (min-width: 768px) 80vw, 100vw",
    thumbnail: "(min-width: 768px) 150px, 100px",
  },
});;
/**
 * Generate preload hints for critical images
 */
export const getCriticalImagePreloads = (images: Array<{ url: string; alt: string; priority?: boolean }>) => {
  const config = getImageOptimizations();
  
  return images
    .filter((_, index) => index < config.preloading.aboveFoldCount)
    .map((image, index) => ({
      rel: "preload" as const,
      as: "image" as const,
      href: image.url,
      // Use fetchpriority for the first few images
      fetchpriority: (index < 2 && config.preloading.useFetchPriority) ? "high" as const : undefined,
      // Add responsive image hints
      imagesrcset: generateResponsiveImageSrcSet(image.url),
      imagesizes: config.responsiveSizes.productGrid,
    }));
};

/**
 * Generate responsive image srcset for preloading
 */
const generateResponsiveImageSrcSet = (baseUrl: string) => {
  const config = getImageOptimizations();
  return config.deviceSizes
    .slice(0, 4) // Limit to first 4 sizes for preloading
    .map(size => `${baseUrl}?w=${size}&q=${config.quality.product} ${size}w`)
    .join(", ");
};

/**
 * Preload critical images in the browser
 */
export const preloadCriticalImages = (images: Array<{ url: string; priority?: boolean }>) => {
  if (typeof window === 'undefined') return;
  
  const config = getImageOptimizations();
  const criticalImages = images.slice(0, config.preloading.aboveFoldCount);
  
  criticalImages.forEach((image, index) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = image.url;
    
    // Add fetchpriority for critical images
    if (index < 2 && config.preloading.useFetchPriority) {
      link.setAttribute('fetchpriority', 'high');
    }
    
    // Add responsive image attributes
    link.setAttribute('imagesrcset', generateResponsiveImageSrcSet(image.url));
    link.setAttribute('imagesizes', config.responsiveSizes.productGrid);
    
    document.head.appendChild(link);
  });
};

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
