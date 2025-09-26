/**
 * Bundle optimization configuration for Next.js
 * This file contains settings and utilities for optimizing bundle size
 */

// Libraries that should be dynamically imported to reduce initial bundle size
export const DYNAMIC_IMPORT_LIBRARIES = [
  // Admin components - not needed on main product pages
  '@/components/admin',

  // Payment components - only needed during checkout
  '@stripe/react-stripe-js',
  '@stripe/stripe-js',

  // Monitoring components - can be loaded after initial render
  'web-vitals',

  // Complex UI components that are not immediately visible
  '@/components/accessibility/AccessibilityToolbar',
  '@/components/product/ProductImageGallery',
  '@/components/product/ProductQuickView',
] as const;

// Libraries that benefit from optimizePackageImports
export const OPTIMIZE_PACKAGE_IMPORTS = [
  // Internal modules
  '@/components',
  '@/lib',
  '@/types',

  // UI libraries
  '@headlessui/react',
  '@heroicons/react/24/outline',
  '@heroicons/react/24/solid',
  '@heroicons/react/20/solid',

  // Radix UI components
  '@radix-ui/react-accordion',
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-avatar',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-label',
  '@radix-ui/react-popover',
  '@radix-ui/react-progress',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-slot',
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  '@radix-ui/react-tooltip',

  // Payment libraries
  '@stripe/react-stripe-js',
  '@stripe/stripe-js',

  // Supabase
  '@supabase/supabase-js',
  '@supabase/ssr',

  // Utility libraries
  'clsx',
  'tailwind-merge',
  'next-intl',
  'web-vitals',
] as const;

// Webpack optimization settings
export const WEBPACK_OPTIMIZATION = {
  splitChunks: {
    chunks: 'all' as const,
    minSize: 20000,
    maxSize: 244000,
    cacheGroups: {
      // Vendor libraries
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all' as const,
        priority: 10,
      },
      // React and React DOM
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        chunks: 'all' as const,
        priority: 20,
      },
      // UI libraries
      ui: {
        test: /[\\/]node_modules[\\/](@headlessui|@heroicons|@radix-ui)[\\/]/,
        name: 'ui-libs',
        chunks: 'all' as const,
        priority: 15,
      },
      // Supabase
      supabase: {
        test: /[\\/]node_modules[\\/]@supabase[\\/]/,
        name: 'supabase',
        chunks: 'all' as const,
        priority: 15,
      },
      // Payment libraries
      payments: {
        test: /[\\/]node_modules[\\/]@stripe[\\/]/,
        name: 'payments',
        chunks: 'all' as const,
        priority: 15,
      },
      // Common components
      components: {
        test: /[\\/]src[\\/]components[\\/]/,
        name: 'components',
        chunks: 'all' as const,
        minChunks: 2,
        priority: 5,
      },
    },
  },
  usedExports: true,
  sideEffects: false,
  concatenateModules: true,
} as const;

// Bundle analyzer configuration
export const BUNDLE_ANALYZER_CONFIG = {
  analyzerMode: 'static' as const,
  reportFilename: (isServer: boolean) =>
    isServer ? '../analyze/server.html' : './analyze/client.html',
  openAnalyzer: false,
  generateStatsFile: true,
  statsFilename: (isServer: boolean) =>
    isServer ? '../analyze/server.json' : './analyze/client.json',
};

/**
 * Check if a module should be dynamically imported
 */
export function shouldDynamicImport(modulePath: string): boolean {
  return DYNAMIC_IMPORT_LIBRARIES.some(lib => modulePath.includes(lib));
}

/**
 * Check if a module should be optimized with optimizePackageImports
 */
export function shouldOptimizePackageImport(modulePath: string): boolean {
  return OPTIMIZE_PACKAGE_IMPORTS.some(lib => modulePath.startsWith(lib));
}

/**
 * Get recommended chunk name for a module
 */
export function getRecommendedChunkName(modulePath: string): string {
  if (modulePath.includes('@stripe')) return 'payments';
  if (modulePath.includes('@supabase')) return 'supabase';
  if (modulePath.includes('@radix-ui') || modulePath.includes('@headlessui') || modulePath.includes('@heroicons')) return 'ui-libs';
  if (modulePath.includes('react')) return 'react';
  if (modulePath.includes('/admin/')) return 'admin';
  if (modulePath.includes('/components/')) return 'components';
  return 'vendors';
}
