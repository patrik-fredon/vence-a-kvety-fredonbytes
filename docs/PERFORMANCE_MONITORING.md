# Performance Monitoring System

## Overview

The funeral wreath e-commerce platform includes a comprehensive performance monitoring system that tracks Core Web Vitals, component performance, image loading, and error patterns. This system provides real-time insights for optimization and production monitoring.

## Architecture

### Core Components

1. **Performance Monitor** (`src/lib/monitoring/performance-monitor.ts`)

   - Central performance tracking system
   - Metrics aggregation and storage
   - Threshold-based alerting
   - Integration with monitoring dashboard

2. **Error Logger** (`src/lib/monitoring/error-logger.ts`)

   - Production-grade error tracking
   - Context-aware error logging
   - Error categorization (navigation, payment, performance, image)
   - Integration with external monitoring services

3. **Performance Hooks** (`src/lib/hooks/`)

   - `usePerformanceMonitor`: Component render time tracking
   - `useLighthouseOptimization`: Lighthouse metric optimization
   - `usePerformanceProfiler`: Comprehensive profiling
   - `useCoreWebVitals`: Core Web Vitals tracking
   - `useImagePerformance`: Image loading performance

4. **Monitoring Dashboard** (`src/components/admin/MonitoringDashboard.tsx`)
   - Real-time performance metrics visualization
   - Error analysis and categorization
   - Core Web Vitals insights
   - Navigation and payment error tracking

## Core Web Vitals Tracking

### Metrics Monitored

#### Largest Contentful Paint (LCP)

- **Target**: < 2.5 seconds
  -racking\*\*: Automatic via Web Vitals API
- **Optimization**: Image preloading, critical resource hints
- **Monitoring**: Real-time dashboard with threshold alerts

#### First Input Delay (FID)

- **Target**: < 100 milliseconds
- **Tracking**: User interaction timing
- **Optimization**: Code splitting, lazy loading
- **Monitoring**: Interaction delay tracking

#### Cumulative Layout Shift (CLS)

- **Target**: < 0.1
- **Tracking**: Layout shift detection
- **Optimization**: Image dimensions, skeleton loaders
- **Monitoring**: CLS contribution analysis

### Implementation

```typescript
import { useCoreWebVitals } from "@/lib/hooks/useCoreWebVitals";

function MyComponent() {
  const { metrics, isGood } = useCoreWebVitals({
    onMetric: (metric) => {
      console.log(`${metric.name}: ${metric.value}`);
    },
  });

  return (
    <div>
      <p>LCP: {metrics.lcp?.toFixed(2)}ms</p>
      <p>FID: {metrics.fid?.toFixed(2)}ms</p>
      <p>CLS: {metrics.cls?.toFixed(3)}</p>
    </div>
  );
}
```

## Component Performance Tracking

### usePerformanceMonitor Hook

Tracks component render times and detects performance issues:

```typescript
import { usePerformanceMonitor } from "@/lib/hooks/usePerformanceMonitor";

function ProductCard({ product }: Props) {
  const { renderTime, mountTime, updateCount } = usePerformanceMonitor({
    componentName: "ProductCard",
    threshold: 16, // 16ms for 60fps
    onSlowRender: (time) => {
      console.warn(`Slow render detected: ${time}ms`);
    },
  });

  return <div>{/* Component content */}</div>;
}
```

### Features

- **Render Time Tracking**: Measures component render duration
- **Mount Detection**: Tracks initial mount time
- **Update Counting**: Monitors re-render frequency
- **Slow Render Detection**: Configurable threshold warnings
- **Development Logging**: Console warnings for slow renders
- **Production Integration**: Metrics sent to monitoring system

### Performance Thresholds

- **Good**: < 16ms (60fps)
- **Needs Improvement**: 16-50ms
- **Poor**: > 50ms

## Image Performance Monitoring

### Image Load Tracking

```typescript
import { useImagePerformance } from "@/lib/hooks/useImagePerformance";

function ProductImage({ src, alt }: Props) {
  const { loadTime, isLoaded, error } = useImagePerformance({
    src,
    onLoad: (time) => {
      console.log(`Image loaded in ${time}ms`);
    },
  });

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      fetchpriority={isPriority ? "high" : "auto"}
    />
  );
}
```

### Optimization Features

1. **Critical Image Preloading**

   - Above-the-fold images with `fetchpriority="high"`
   - Resource hints for critical images
   - Preload configuration in `src/lib/performance/resource-hints.ts`

2. **Lazy Loading**

   - Intersection observer with 100px margin
   - Automatic loading state management
   - Error handling with fallback images

3. **Quality Presets**

   - 50: Thumbnails and previews
   - 70: Standard product images
   - 75: Default quality (Next.js default)
   - 85: High-quality product details
   - 90: Hero images
   - 95: Maximum quality for critical images

4. **Format Selection**
   - Automatic AVIF/WebP with fallbacks
   - Browser capability detection
   - Optimal format for each use case

## Error Tracking

### Error Categories

1. **Navigation Errors**

   - Failed route transitions
   - Missing product slugs
   - Invalid URLs
   - Tracking: Route, error message, user context

2. **Payment Errors**

   - Payment initialization failures
   - Processing errors
   - Webhook failures
   - Tracking: Payment step, provider, error details

3. **Performance Errors**

   - Core Web Vitals threshold violations
   - Slow component renders
   - Memory issues
   - Tracking: Metric name, value, threshold

4. **Image Errors**
   - Failed image loads
   - Missing images
   - Format errors
   - Tracking: URL (sanitized), error type, context

### Error Logging

```typescript
import { logErrorWithContext } from "@/lib/monitoring/error-logger";

try {
  await performOperation();
} catch (error) {
  logErrorWithContext(error, {
    component: "ProductCard",
    operation: "addToCart",
    productId: product.id,
    userId: user?.id,
  });
}
```

### Production Error Logger

```typescript
import { ProductionErrorLogger } from "@/lib/monitoring/error-logger";

const logger = new ProductionErrorLogger();

// Log Core Web Vitals issue
logger.logCoreWebVitalsIssue({
  metric: "LCP",
  value: 3500,
  threshold: 2500,
  url: window.location.href,
});

// Log navigation error
logger.logNavigationError({
  route: "/products/invalid-slug",
  error: "Product not found",
  userId: user?.id,
});

// Log payment error
logger.logPaymentError({
  step: "initialization",
  provider: "stripe",
  error: "Invalid API key",
  orderId: order.id,
});
```

## Monitoring Dashboard

### Access

- **URL**: `/admin/monitoring` (requires admin authentication)
- **Features**: Real-time metrics, error analysis, performance insights

### Dashboard Sections

#### 1. Overview

- Total errors by category
- Recent error trends
- System health status
- Quick action buttons

#### 2. Core Web Vitals

- LCP, FID, CLS metrics
- Historical trends
- Threshold violations
- Optimization recommendations

#### 3. Navigation Errors

- Failed routes
- Problematic URLs
- User impact analysis
- Fix recommendations

#### 4. Payment Errors

- Errors by processing step
- Provider-specific issues
- Business impact metrics
- Resolution tracking

#### 5. Image Performance

- Load time distribution
- Failed image loads
- LCP impact analysis
- Optimization opportunities

#### 6. Insights

- Automated optimization recommendations
- Performance regression detection
- Actionable improvement suggestions
- Priority ranking

### API Endpoints

```typescript
// Get performance metrics
GET /api/monitoring/performance
Response: {
  coreWebVitals: { lcp, fid, cls },
  componentMetrics: [...],
  imageMetrics: [...]
}

// Log error
POST /api/monitoring/errors
Body: {
  category: 'navigation' | 'payment' | 'performance' | 'image',
  error: string,
  context: object
}

// Get error analysis
GET /api/admin/activity
Response: {
  errors: [...],
  trends: [...],
  insights: [...]
}
```

## Performance Optimization Workflow

### 1. Identify Issues

```bash
# Access monitoring dashboard
https://your-domain.com/admin/monitoring

# Review Core Web Vitals
# Check error categories
# Analyze performance insights
```

### 2. Analyze Metrics

- **LCP > 2.5s**: Check image optimization, critical resource loading
- **FID > 100ms**: Review JavaScript bundle size, code splitting
- **CLS > 0.1**: Verify image dimensions, skeleton loaders
- **Slow Renders**: Check component complexity, unnecessary re-renders

### 3. Implement Fixes

```typescript
// Example: Optimize slow component
import { memo } from "react";
import { usePerformanceMonitor } from "@/lib/hooks/usePerformanceMonitor";

const ProductCard = memo(({ product }: Props) => {
  usePerformanceMonitor({
    componentName: "ProductCard",
    threshold: 16,
  });

  return <div>{/* Optimized content */}</div>;
});
```

### 4. Verify Improvements

- Monitor dashboard for metric improvements
- Check error reduction
- Verify Core Web Vitals in "Good" range
- Validate with Lighthouse audits

## Best Practices

### Development

1. **Use Performance Hooks**: Add `usePerformanceMonitor` to complex components
2. **Monitor Slow Renders**: Set appropriate thresholds for your use case
3. **Test with Throttling**: Simulate slow networks and devices
4. **Profile Regularly**: Use `usePerformanceProfiler` for detailed analysis

### Production

1. **Monitor Core Web Vitals**: Set up alerts for threshold violations
2. **Track Error Trends**: Review dashboard weekly for patterns
3. **Optimize Images**: Use appropriate quality presets
4. **Cache Effectively**: Leverage Redis caching for performance
5. **Review Insights**: Act on automated optimization recommendations

### Performance Budgets

```typescript
// Set performance budgets
const PERFORMANCE_BUDGETS = {
  lcp: 2500, // 2.5 seconds
  fid: 100, // 100 milliseconds
  cls: 0.1, // 0.1 score
  renderTime: 16, // 16ms for 60fps
  bundleSize: 244, // 244KB per chunk
};
```

## Troubleshooting

### High LCP

**Symptoms**: LCP > 2.5 seconds

**Solutions**:

1. Preload critical images with `fetchpriority="high"`
2. Optimize image quality (use quality 70-75 for most images)
3. Enable image caching (1-year TTL)
4. Use responsive image sizes
5. Implement critical CSS

### High FID

**Symptoms**: FID > 100 milliseconds

**Solutions**:

1. Reduce JavaScript bundle size
2. Implement code splitting
3. Lazy load non-critical components
4. Optimize event handlers
5. Use web workers for heavy computations

### High CLS

**Symptoms**: CLS > 0.1

**Solutions**:

1. Set explicit image dimensions
2. Use skeleton loaders
3. Reserve space for dynamic content
4. Avoid inserting content above existing content
5. Use CSS transforms for animations

### Slow Component Renders

**Symptoms**: Render time > 16ms

**Solutions**:

1. Memoize components with `React.memo`
2. Use `useMemo` for expensive calculations
3. Implement virtualization for long lists
4. Reduce component complexity
5. Optimize re-render triggers

## Integration with External Services

### Sentry (Optional)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [new Sentry.BrowserTracing()],
});
```

### Google Analytics (Optional)

```typescript
import { sendToGoogleAnalytics } from "@/lib/analytics";

// Track Core Web Vitals
onCLS((metric) => sendToGoogleAnalytics(metric));
onFID((metric) => sendToGoogleAnalytics(metric));
onLCP((metric) => sendToGoogleAnalytics(metric));
```

## Maintenance

### Regular Tasks

1. **Daily**: Review error dashboard for critical issues
2. **Weekly**: Analyze performance trends and insights
3. **Monthly**: Review and update performance budgets
4. **Quarterly**: Comprehensive performance audit

### Performance Regression Prevention

```bash
# Run performance tests before deployment
npm run benchmark

# Check bundle size
npm run analyze

# Verify Core Web Vitals
npm run test:performance
```

## Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)

## Support

For performance monitoring issues or questions:

1. Check monitoring dashboard for insights
2. Review this documentation
3. Check browser console for warnings
4. Contact development team: dev@ketingmar.cz
