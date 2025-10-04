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
    maxSize: 200000, // Reduced for better caching
    cacheGroups: {
      // React and React DOM - highest priority
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: "react",
        chunks: "all" as const,
        priority: 30,
        enforce: true,
      },
      // Next.js framework
      nextjs: {
        test: /[\\/]node_modules[\\/]next[\\/]/,
        name: "nextjs",
        chunks: "all" as const,
        priority: 25,
      },
      // Payment libraries (critical for checkout)
      payments: {
        test: /[\\/]node_modules[\\/]@stripe[\\/]/,
        name: "payments",
        chunks: "all" as const,
        priority: 20,
      },
      // Supabase (database and auth)
      supabase: {
        test: /[\\/]node_modules[\\/]@supabase[\\/]/,
        name: "supabase",
        chunks: "all" as const,
        priority: 20,
      },
      // UI libraries
      ui: {
        test: /[\\/]node_modules[\\/](@headlessui|@heroicons|@radix-ui)[\\/]/,
        name: "ui-libs",
        chunks: "all" as const,
        priority: 15,
      },
      // Internationalization
      i18n: {
        test: /[\\/]node_modules[\\/](next-intl|@formatjs)[\\/]/,
        name: "i18n",
        chunks: "all" as const,
        priority: 15,
      },
      // Utilities and helpers
      utils: {
        test: /[\\/]node_modules[\\/](clsx|class-variance-authority|tailwind-merge|date-fns)[\\/]/,
        name: "utils",
        chunks: "all" as const,
        priority: 10,
      },
      // Vendor libraries (catch-all for other node_modules)
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: "vendors",
        chunks: "all" as const,
        priority: 5,
        minChunks: 1,
      },
      // Product components (frequently used together)
      productComponents: {
        test: /[\\/]src[\\/]components[\\/]product[\\/]/,
        name: "product-components",
        chunks: "all" as const,
        minChunks: 2,
        priority: 8,
      },
      // Admin components (lazy loaded)
      adminComponents: {
        test: /[\\/]src[\\/]components[\\/]admin[\\/]/,
        name: "admin-components",
        chunks: "async" as const,
        minChunks: 1,
        priority: 8,
      },
      // Common components
      components: {
        test: /[\\/]src[\\/]components[\\/]/,
        name: "components",
        chunks: "all" as const,
        minChunks: 3,
        priority: 6,
      },
      // Lib utilities
      lib: {
        test: /[\\/]src[\\/]lib[\\/]/,
        name: "lib",
        chunks: "all" as const,
        minChunks: 2,
        priority: 7,
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
} as const;

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
