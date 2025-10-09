import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import {
  BUNDLE_ANALYZER_CONFIG,
  OPTIMIZE_PACKAGE_IMPORTS,
  WEBPACK_OPTIMIZATION,
} from "./src/lib/config/bundle-optimization";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // TypeScript checking enabled for production builds
  typescript: {
    ignoreBuildErrors: false,
  },

  // Transpile packages for better optimization (removed serverExternalPackages to avoid conflicts with optimizePackageImports)
  transpilePackages: [],

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: OPTIMIZE_PACKAGE_IMPORTS,
    // CSS optimization disabled due to critters module dependency issue
    // optimizeCss: true,
  },

  // Turbopack configuration (replaces experimental.turbo)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Output file tracing configuration to silence workspace warning
  outputFileTracingRoot: __dirname,

  // Enhanced image optimization configuration
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 70, 75, 85, 90], // Optimized quality levels: 50 (thumbnails), 70 (standard), 75 (default), 85 (high quality), 90 (hero images)
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for better caching
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize image loading
    unoptimized: false,
    loader: "default",
    // Enable image optimization for external domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/sign/**",
      },
      {
        protocol: "https",
        hostname: "cdn.fredonbytes.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking attacks
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=()",
          },
          // Enable XSS protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Strict Transport Security
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://cdn.fredonbytes.com",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://checkout.stripe.com wss://*.supabase.co",
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // Prevent DNS prefetching
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },
          // Hide server information
          {
            key: "Server",
            value: "",
          },
        ],
      },
      // Enhanced caching headers for static assets
      {
        source: "/public/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Image optimization caching
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Additional headers for API routes
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ];
  },

  // Webpack configuration for better bundle optimization and tree-shaking
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer configuration for monitoring bundle size
    if (process.env["ANALYZE"] === "true") {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          ...BUNDLE_ANALYZER_CONFIG,
          reportFilename: BUNDLE_ANALYZER_CONFIG.reportFilename(isServer),
          statsFilename: BUNDLE_ANALYZER_CONFIG.statsFilename(isServer),
        })
      );
    }
    // Optimize bundle size in production
    if (!(dev || isServer)) {
      // Enhanced code splitting configuration using centralized config
      config.optimization.splitChunks = WEBPACK_OPTIMIZATION.splitChunks;

      // Runtime chunk optimization for better caching
      config.optimization.runtimeChunk = WEBPACK_OPTIMIZATION.runtimeChunk;

      // Tree-shaking optimizations
      config.optimization.usedExports = WEBPACK_OPTIMIZATION.usedExports;
      config.optimization.sideEffects = WEBPACK_OPTIMIZATION.sideEffects;

      // Module concatenation for better tree-shaking
      config.optimization.concatenateModules = WEBPACK_OPTIMIZATION.concatenateModules;

      // Additional optimizations from centralized config
      config.optimization.innerGraph = WEBPACK_OPTIMIZATION.innerGraph;
      config.optimization.moduleIds = WEBPACK_OPTIMIZATION.moduleIds;
      config.optimization.chunkIds = WEBPACK_OPTIMIZATION.chunkIds;
      config.optimization.mergeDuplicateChunks = WEBPACK_OPTIMIZATION.mergeDuplicateChunks;
      config.optimization.removeAvailableModules = WEBPACK_OPTIMIZATION.removeAvailableModules;
      config.optimization.removeEmptyChunks = WEBPACK_OPTIMIZATION.removeEmptyChunks;
      config.optimization.flagIncludedChunks = WEBPACK_OPTIMIZATION.flagIncludedChunks;
    }

    // Resolve alias for better tree-shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/components": path.resolve(__dirname, "src/components"),
      "@/lib": path.resolve(__dirname, "src/lib"),
      "@/types": path.resolve(__dirname, "src/types"),
      "@/app": path.resolve(__dirname, "src/app"),
    };

    // Ignore source maps in production for smaller bundles
    if (!dev) {
      config.devtool = false;
    }

    return config;
  },

  // Environment variables that should be available on the client
  env: {
    CUSTOM_KEY: process.env["CUSTOM_KEY"],
  },

  // Redirects for SEO and user experience
  async redirects() {
    return [
      // Add redirects as needed
    ];
  },

  // Rewrites for clean URLs
  async rewrites() {
    return [
      // Add rewrites as needed
    ];
  },
};

export default withNextIntl(nextConfig);
