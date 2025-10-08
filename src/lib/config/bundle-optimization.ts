/**
 * Bundle optimization configuration for Next.js
 * This file contains settings and utilities for optimizing bundle size
 */

// Libraries that should be dynamically imported to reduce initial bundle size
export const DYNAMIC_IMPORT_LIBRARIES = [
  // Admin components - not needed on main product pages
  "@/components/admin",

  // Payment components - only needed during checkout
  "@stripe/react-stripe-js",
  "@stripe/stripe-js",

  // Monitoring components - can be loaded after initial render
  "web-vitals",

  // Complex UI components that are not immediately visible
  "@/components/accessibility/AccessibilityToolbar",
  "@/components/product/ProductImageGallery",
  "@/components/product/ProductQuickView",
] as const;

// Libraries that benefit from optimizePackageImports
export const OPTIMIZE_PACKAGE_IMPORTS: string[] = [
  // Internal modules
  "@/components",
  "@/lib",
  "@/types",

  // UI libraries
  "@headlessui/react",
  "@heroicons/react/24/outline",
  "@heroicons/react/24/solid",
  "@heroicons/react/20/solid",

  // Note: Radix UI components removed as they were unused

  // Payment libraries
  "@stripe/react-stripe-js",
  "@stripe/stripe-js",

  // Supabase
  "@supabase/supabase-js",

  // Utility libraries
  "clsx",
  "tailwind-merge",
  "next-intl",
  "web-vitals",
];

// Webpack optimization settings
export const WEBPACK_OPTIMIZATION = {
  splitChunks: {
    chunks: "all" as const,
    minSize: 20000,
    maxSize: 244000, // Optimized for better caching and parallel loading
    maxAsyncRequests: 30, // Increased for better code splitting
    maxInitialRequests: 30, // Increased for better initial load
    cacheGroups: {
      // React and React DOM - highest priority (separate bundles for better caching)
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: "react",
        chunks: "all" as const,
        priority: 40,
        enforce: true,
        reuseExistingChunk: true,
      },
      // React internals (scheduler, etc.)
      reactInternals: {
        test: /[\\/]node_modules[\\/](scheduler|react-is)[\\/]/,
        name: "react-internals",
        chunks: "all" as const,
        priority: 35,
        reuseExistingChunk: true,
      },
      // Next.js framework
      nextjs: {
        test: /[\\/]node_modules[\\/]next[\\/]/,
        name: "nextjs",
        chunks: "all" as const,
        priority: 30,
        reuseExistingChunk: true,
      },
      // Stripe - separate bundle for payment functionality
      stripe: {
        test: /[\\/]node_modules[\\/](@stripe[\\/]stripe-js|@stripe[\\/]react-stripe-js)[\\/]/,
        name: "stripe",
        chunks: "async" as const, // Async loading for better initial performance
        priority: 25,
        enforce: true,
        reuseExistingChunk: true,
      },
      // Supabase - separate bundles for better caching
      supabaseClient: {
        test: /[\\/]node_modules[\\/]@supabase[\\/]supabase-js[\\/]/,
        name: "supabase-client",
        chunks: "all" as const,
        priority: 24,
        enforce: true,
        reuseExistingChunk: true,
      },
      supabaseAuth: {
        test: /[\\/]node_modules[\\/]@supabase[\\/](auth-js|auth-helpers|ssr)[\\/]/,
        name: "supabase-auth",
        chunks: "all" as const,
        priority: 23,
        reuseExistingChunk: true,
      },
      supabaseStorage: {
        test: /[\\/]node_modules[\\/]@supabase[\\/](storage-js|realtime-js)[\\/]/,
        name: "supabase-storage",
        chunks: "async" as const, // Async for storage operations
        priority: 22,
        reuseExistingChunk: true,
      },
      // UI libraries
      headlessui: {
        test: /[\\/]node_modules[\\/]@headlessui[\\/]/,
        name: "headlessui",
        chunks: "all" as const,
        priority: 20,
        reuseExistingChunk: true,
      },
      heroicons: {
        test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
        name: "heroicons",
        chunks: "all" as const,
        priority: 19,
        reuseExistingChunk: true,
      },
      // Internationalization
      i18n: {
        test: /[\\/]node_modules[\\/](next-intl|@formatjs)[\\/]/,
        name: "i18n",
        chunks: "all" as const,
        priority: 18,
        reuseExistingChunk: true,
      },
      // Utilities and helpers
      utils: {
        test: /[\\/]node_modules[\\/](clsx|class-variance-authority|tailwind-merge)[\\/]/,
        name: "utils",
        chunks: "all" as const,
        priority: 15,
        reuseExistingChunk: true,
      },
      // Date utilities (can be async)
      dateFns: {
        test: /[\\/]node_modules[\\/]date-fns[\\/]/,
        name: "date-fns",
        chunks: "async" as const,
        priority: 14,
        reuseExistingChunk: true,
      },
      // Web Vitals (async for performance monitoring)
      webVitals: {
        test: /[\\/]node_modules[\\/]web-vitals[\\/]/,
        name: "web-vitals",
        chunks: "async" as const,
        priority: 13,
        reuseExistingChunk: true,
      },
      // Vendor libraries (catch-all for other node_modules)
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: "vendors",
        chunks: "all" as const,
        priority: 5,
        minChunks: 2, // Only create vendor chunk if used in 2+ places
        reuseExistingChunk: true,
      },
      // Product components (frequently used together)
      productComponents: {
        test: /[\\/]src[\\/]components[\\/]product[\\/]/,
        name: "product-components",
        chunks: "all" as const,
        minChunks: 2,
        priority: 12,
        reuseExistingChunk: true,
      },
      // Admin components (lazy loaded)
      adminComponents: {
        test: /[\\/]src[\\/]components[\\/]admin[\\/]/,
        name: "admin-components",
        chunks: "async" as const,
        minChunks: 1,
        priority: 11,
        reuseExistingChunk: true,
      },
      // Checkout components (lazy loaded)
      checkoutComponents: {
        test: /[\\/]src[\\/]components[\\/]checkout[\\/]/,
        name: "checkout-components",
        chunks: "async" as const,
        minChunks: 1,
        priority: 10,
        reuseExistingChunk: true,
      },
      // Payment components (lazy loaded)
      paymentComponents: {
        test: /[\\/]src[\\/]components[\\/]payments[\\/]/,
        name: "payment-components",
        chunks: "async" as const,
        minChunks: 1,
        priority: 10,
        reuseExistingChunk: true,
      },
      // Common components
      components: {
        test: /[\\/]src[\\/]components[\\/]/,
        name: "components",
        chunks: "all" as const,
        minChunks: 3,
        priority: 8,
        reuseExistingChunk: true,
      },
      // Lib utilities
      lib: {
        test: /[\\/]src[\\/]lib[\\/]/,
        name: "lib",
        chunks: "all" as const,
        minChunks: 2,
        priority: 9,
        reuseExistingChunk: true,
      },
    },
  },
  usedExports: true,
  sideEffects: false,
  concatenateModules: true,
  // Enhanced tree shaking
  innerGraph: true,
  // Optimize module IDs for better caching
  moduleIds: "deterministic" as const,
  chunkIds: "deterministic" as const,
  // Runtime chunk optimization
  runtimeChunk: {
    name: "runtime",
  },
  // Minimize duplicate code
  mergeDuplicateChunks: true,
  removeAvailableModules: true,
  removeEmptyChunks: true,
  // Flag used modules
  flagIncludedChunks: true,
} as const;;

// Bundle analyzer configuration
export const BUNDLE_ANALYZER_CONFIG = {
  analyzerMode: "static" as const,
  reportFilename: (isServer: boolean) =>
    isServer ? "../analyze/server.html" : "./analyze/client.html",
  openAnalyzer: false,
  generateStatsFile: true,
  statsFilename: (isServer: boolean) =>
    isServer ? "../analyze/server.json" : "./analyze/client.json",
};

// Third-party library optimization configuration
export const THIRD_PARTY_OPTIMIZATIONS = {
  // Lodash tree-shaking (if used)
  lodash: {
    // Use babel-plugin-lodash for better tree-shaking
    plugins: ["lodash"],
    // Import specific functions only
    imports: "es",
  },

  // Date-fns optimization
  dateFns: {
    // Use ESM imports for better tree-shaking
    format: "esm",
    // Only import needed locales
    locales: ["cs", "en-US"],
  },

  // Tailwind CSS optimization
  tailwind: {
    // Purge unused classes
    purge: {
      enabled: true,
      content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
      ],
    },
  },

  // Next.js optimization
  nextjs: {
    // Optimize images
    images: {
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 31536000, // 1 year
    },
    // Optimize fonts
    fonts: {
      preload: true,
      display: "swap",
    },
  },
} as const;

// Bundle size monitoring thresholds
export const BUNDLE_SIZE_THRESHOLDS = {
  // Warning thresholds in KB
  warnings: {
    totalBundle: 1000, // 1MB total
    vendorChunk: 500, // 500KB vendor
    pageChunk: 250, // 250KB per page
  },

  // Error thresholds in KB
  errors: {
    totalBundle: 2000, // 2MB total
    vendorChunk: 1000, // 1MB vendor
    pageChunk: 500, // 500KB per page
  },

  // Performance budget for Core Web Vitals
  performance: {
    // First Contentful Paint budget
    fcp: 1.8, // seconds
    // Largest Contentful Paint budget
    lcp: 2.5, // seconds
    // Total Blocking Time budget
    tbt: 200, // milliseconds
  },
} as const;

/**
 * Check if a module should be dynamically imported
 */
export function shouldDynamicImport(modulePath: string): boolean {
  return DYNAMIC_IMPORT_LIBRARIES.some((lib) => modulePath.includes(lib));
}

/**
 * Check if a module should be optimized with optimizePackageImports
 */
export function shouldOptimizePackageImport(modulePath: string): boolean {
  return OPTIMIZE_PACKAGE_IMPORTS.some((lib) => modulePath.startsWith(lib));
}

/**
 * Get recommended chunk name for a module
 */
export function getRecommendedChunkName(modulePath: string): string {
  if (modulePath.includes("@stripe")) return "payments";
  if (modulePath.includes("@supabase")) return "supabase";
  if (modulePath.includes("@headlessui") || modulePath.includes("@heroicons")) return "ui-libs";
  if (modulePath.includes("react")) return "react";
  if (modulePath.includes("/admin/")) return "admin";
  if (modulePath.includes("/components/")) return "components";
  return "vendors";
}
