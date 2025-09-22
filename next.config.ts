import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Temporarily disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Server external packages (moved from experimental)
  serverExternalPackages: ["@supabase/supabase-js"],

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: [
      "@/components",
      "@/lib",
      "@/types",
      "@headlessui/react",
      "@heroicons/react",
      "clsx",
      "tailwind-merge"
    ],
    // CSS optimization for better performance
    optimizeCss: true,
    // Enable modern bundling optimizations
    bundlePagesRouterDependencies: true,
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
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize image loading
    unoptimized: false,
    loader: 'default',
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
            value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=(), bluetooth=()",
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://gate.gopay.cz",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://cdn.fredonbytes.com",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://checkout.stripe.com https://gate.gopay.cz wss://*.supabase.co",
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://gate.gopay.cz",
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
    // Optimize bundle size in production
    if (!dev && !isServer) {
      // Enhanced code splitting configuration
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // Vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          // React and React DOM
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react",
            chunks: "all",
            priority: 20,
          },
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|@heroicons)[\\/]/,
            name: "ui-libs",
            chunks: "all",
            priority: 15,
          },
          // Supabase
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: "supabase",
            chunks: "all",
            priority: 15,
          },
          // Common components
          components: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: "components",
            chunks: "all",
            minChunks: 2,
            priority: 5,
          },
        },
      };

      // Tree-shaking optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Module concatenation for better tree-shaking
      config.optimization.concatenateModules = true;
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
    CUSTOM_KEY: process.env['CUSTOM_KEY'],
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
