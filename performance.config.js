/**
 * Performance Monitoring Configuration
 *
 * Centralized configuration for all performance monitoring tools,
 * bundle analysis, and regression testing.
 */

module.exports = {
  // Bundle Analysis Configuration
  bundle: {
    thresholds: {
      totalSize: 500 * 1024, // 500KB
      chunkSize: 250 * 1024, // 250KB
      regressionPercent: 10, // 10% increase threshold
    },
    optimization: {
      enableTreeShaking: true,
      enableCodeSplitting: true,
      enableMinification: true,
      enableGzipAnalysis: true,
    },
    reporting: {
      generateHTML: true,
      generateJSON: true,
      includeSourceMaps: false,
    },
  },

  // Web Vitals Thresholds (Core Web Vitals)
  webVitals: {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
    INP: { good: 200, poor: 500 },   // Interaction to Next Paint (ms)
    CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift (unitless)
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
  },

  // Performance Benchmarks
  benchmarks: {
    // Test URLs for performance analysis
    testUrls: [
      '/',
      '/products',
      '/cart',
      '/contact',
      '/about',
    ],

    // Lighthouse configuration
    lighthouse: {
      categories: ['performance', 'accessibility', 'best-practices', 'seo'],
      device: 'mobile', // 'mobile' or 'desktop'
      throttling: 'simulated3G', // 'simulated3G', 'applied3G', 'none'
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
      },
    },

    // Custom performance thresholds
    customThresholds: {
      buildTime: { good: 60000, poor: 120000 }, // Build time in ms
      typeCheckTime: { good: 15000, poor: 30000 }, // TypeScript check time in ms
      testTime: { good: 30000, poor: 60000 }, // Test execution time in ms
      memoryUsage: { good: 100 * 1024 * 1024, poor: 200 * 1024 * 1024 }, // Memory usage in bytes
    },

    // Scoring weights
    scoring: {
      lighthouse: 0.4,    // 40% weight
      webVitals: 0.3,     // 30% weight
      customMetrics: 0.3, // 30% weight
    },
  },

  // Regression Testing
  regression: {
    thresholds: {
      totalSizeIncrease: 10,     // 10% increase threshold
      chunkSizeIncrease: 15,     // 15% increase threshold for individual chunks
      newChunkThreshold: 50 * 1024, // 50KB threshold for new chunks
      criticalSizeLimit: 1024 * 1024, // 1MB critical limit
    },

    // CI/CD Integration
    ci: {
      failOnRegression: process.env.CI === 'true',
      failOnCritical: true,
      warnOnMedium: true,
      commentOnPR: process.env.GITHUB_ACTIONS === 'true',
    },

    // Notification settings
    notifications: {
      slack: {
        enabled: !!process.env.SLACK_WEBHOOK_URL,
        webhook: process.env.SLACK_WEBHOOK_URL,
        channel: '#performance',
        onlyOnFailure: true,
      },
      email: {
        enabled: false,
        recipients: [],
        onlyOnFailure: true,
      },
    },
  },

  // Monitoring Configuration
  monitoring: {
    // Web Vitals tracking
    webVitalsTracking: {
      enabled: true,
      sampleRate: 1.0, // 100% sampling in development, adjust for production
      autoReport: true,
      endpoint: '/api/monitoring/performance',
      batchSize: 10,
      batchTimeout: 30000, // 30 seconds
    },

    // Performance metrics collection
    metricsCollection: {
      enabled: true,
      collectCustomMetrics: true,
      collectResourceTiming: true,
      collectLongTasks: true,
      collectNavigationTiming: true,
    },

    // Error tracking integration
    errorTracking: {
      enabled: true,
      trackPerformanceErrors: true,
      performanceErrorThreshold: 'poor', // Track metrics with 'poor' rating
    },
  },

  // Development Tools
  development: {
    // Debug mode settings
    debug: {
      enabled: process.env.NODE_ENV === 'development',
      showWebVitalsOverlay: process.env.NODE_ENV === 'development',
      logPerformanceMetrics: process.env.NODE_ENV === 'development',
      enablePerformanceProfiler: false,
    },

    // Hot reload performance
    hotReload: {
      trackBuildTimes: true,
      trackMemoryUsage: true,
      warnOnSlowBuilds: true,
      slowBuildThreshold: 10000, // 10 seconds
    },
  },

  // Production Optimizations
  production: {
    // Bundle optimizations
    bundleOptimizations: {
      enableTreeShaking: true,
      enableCodeSplitting: true,
      enableMinification: true,
      enableCompression: true,
      enableSourceMapOptimization: true,
    },

    // Runtime optimizations
    runtimeOptimizations: {
      enableServiceWorker: false, // Disabled for now
      enablePrefetching: true,
      enablePreloading: true,
      enableResourceHints: true,
    },

    // Monitoring in production
    productionMonitoring: {
      sampleRate: 0.1, // 10% sampling in production
      enableRealUserMonitoring: true,
      enableSyntheticMonitoring: false,
      reportingInterval: 60000, // 1 minute
    },
  },

  // File paths and directories
  paths: {
    baseline: './bundle-baseline.json',
    performanceBaseline: './performance-baseline.json',
    reports: './performance-reports',
    bundleAnalysis: './bundle-analysis',
    benchmarks: './performance-benchmarks',
  },

  // Tool-specific configurations
  tools: {
    // Bundle analyzer specific settings
    bundleAnalyzer: {
      analyzeServer: false,
      analyzeClient: true,
      bundleAnalyzerConfig: {
        mode: 'static',
        reportFilename: 'bundle-report.html',
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: 'bundle-stats.json',
      },
    },

    // Lighthouse specific settings
    lighthouse: {
      extends: 'lighthouse:default',
      settings: {
        onlyAudits: [
          'first-contentful-paint',
          'largest-contentful-paint',
          'cumulative-layout-shift',
          'total-blocking-time',
          'speed-index',
          'interactive',
        ],
      },
    },

    // Playwright for E2E performance testing
    playwright: {
      use: {
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      projects: [
        {
          name: 'chromium',
          use: { ...require('@playwright/test').devices['Desktop Chrome'] },
        },
        {
          name: 'mobile-chrome',
          use: { ...require('@playwright/test').devices['Pixel 5'] },
        },
      ],
    },
  },

  // Environment-specific overrides
  environments: {
    development: {
      monitoring: {
        webVitalsTracking: {
          sampleRate: 1.0,
          autoReport: false, // Don't send to server in development
        },
      },
      debug: {
        enabled: true,
        showWebVitalsOverlay: true,
        logPerformanceMetrics: true,
      },
    },

    staging: {
      monitoring: {
        webVitalsTracking: {
          sampleRate: 0.5, // 50% sampling in staging
        },
      },
      regression: {
        ci: {
          failOnRegression: false, // Don't fail builds in staging
          warnOnMedium: true,
        },
      },
    },

    production: {
      monitoring: {
        webVitalsTracking: {
          sampleRate: 0.1, // 10% sampling in production
        },
      },
      debug: {
        enabled: false,
        showWebVitalsOverlay: false,
        logPerformanceMetrics: false,
      },
    },
  },
};

// Export environment-specific configuration
const environment = process.env.NODE_ENV || 'development';
const config = module.exports;

// Apply environment-specific overrides
if (config.environments[environment]) {
  const envConfig = config.environments[environment];

  // Deep merge environment config
  function deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  deepMerge(config, envConfig);
}

module.exports = config;
