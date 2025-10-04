# Core Web Vitals Measurement Guide

## Overview

This guide provides instructions for measuring Core Web Vitals (LCP, FID, CLS) for the Vence a kvety website refactor.

**Requirements**: 10.3, 10.4

## Target Metrics

| Metric                             | Target  | Description                                          |
| ---------------------------------- | ------- | ---------------------------------------------------- |
| **LCP** (Largest Contentful Paint) | < 2.5s  | Time until the largest content element is visible    |
| **FID** (First Input Delay)        | < 100ms | Time from first user interaction to browser response |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | Visual stability - measures unexpected layout shifts |

## Measurement Methods

### Method 1: Automated Script (Recommended)

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Run the measurement script**:

   ```bash
   npm run measure:vitals
   ```

3. **View results**:

   - Results will be displayed in the terminal
   - Detailed JSON results saved to: `.kiro/specs/vence-kvety-refactor/core-web-vitals-results.json`

4. **Measure production build**:
   ```bash
   npm run build
   npm run start
   npm run measure:vitals
   ```

### Method 2: Chrome DevTools (Manual)

1. **Open Chrome DevTools** (F12)

2. **Navigate to Lighthouse tab**

3. **Configure settings**:

   - Mode: Navigation
   - Categories: Performance
   - Device: Desktop or Mobile

4. **Run audit** and check:
   - Performance score
   - Core Web Vitals section
   - Opportunities for improvement

### Method 3: Real User Monitoring (Production)

The application already has Web Vitals tracking implemented:

1. **Check browser console** for Web Vitals logs (development mode)

2. **Monitor production metrics** via:

   - `src/components/monitoring/WebVitalsTracker.tsx`
   - `src/lib/hooks/useCoreWebVitals.ts`

3. **View metrics** in monitoring dashboard (if configured)

## Key Pages to Test

Test these pages for comprehensive coverage:

1. **Home Page** (`/cs`, `/en`)

   - Hero section with large logo
   - Product grid
   - Reference products section

2. **Products Page** (`/cs/products`)

   - Product grid with multiple images
   - Filters and navigation

3. **Product Detail** (`/cs/products/[slug]`)

   - Large product images
   - Image gallery
   - Customization options

4. **About Page** (`/cs/about`)
   - Hero image
   - Logo
   - Image grid

## Current Optimizations

### LCP Optimizations ✅

- **Hero images** use `priority` flag
- **Above-the-fold images** load eagerly
- **Image formats**: AVIF → WebP → JPEG fallback
- **CDN delivery**: cdn.fredonbytes.com
- **Responsive images**: Multiple sizes configured
- **Preload hints**: Critical images preloaded

### FID Optimizations ✅

- **Code splitting**: Lazy loading for heavy components
- **JavaScript optimization**: Minimal blocking scripts
- **Event handlers**: Optimized with useCallback
- **Bundle size**: Monitored and optimized

### CLS Optimizations ✅

- **Image dimensions**: Width/height specified
- **Aspect ratios**: Maintained with aspect-square
- **Skeleton loaders**: Prevent layout shifts
- **Font loading**: Optimized with font-display
- **Reserved space**: Images reserve space before loading

## Interpreting Results

### Good Performance (Green)

- LCP: < 2.5s ✅
- FID: < 100ms ✅
- CLS: < 0.1 ✅
- Performance Score: 90-100

### Needs Improvement (Orange)

- LCP: 2.5s - 4.0s ⚠️
- FID: 100ms - 300ms ⚠️
- CLS: 0.1 - 0.25 ⚠️
- Performance Score: 50-89

### Poor Performance (Red)

- LCP: > 4.0s ❌
- FID: > 300ms ❌
- CLS: > 0.25 ❌
- Performance Score: 0-49

## Common Issues and Solutions

### High LCP

**Causes**:

- Large images not optimized
- Missing priority flags
- Slow server response
- Render-blocking resources

**Solutions**:

- Add `priority` to hero images
- Optimize image sizes
- Use CDN for static assets
- Preload critical resources

### High FID

**Causes**:

- Heavy JavaScript execution
- Long tasks blocking main thread
- Unoptimized event handlers

**Solutions**:

- Code split large bundles
- Defer non-critical JavaScript
- Use web workers for heavy computation
- Optimize event handlers

### High CLS

**Causes**:

- Images without dimensions
- Dynamic content insertion
- Web fonts causing layout shift
- Ads or embeds

**Solutions**:

- Specify image dimensions
- Reserve space for dynamic content
- Use font-display: optional
- Avoid inserting content above existing content

## Monitoring Over Time

### Development

- Run measurements before major changes
- Compare results after optimizations
- Track trends in performance scores

### Production

- Set up Real User Monitoring (RUM)
- Monitor Web Vitals API data
- Alert on performance regressions
- Track 75th percentile metrics

## Next Steps

After measuring Core Web Vitals:

1. **Document baseline metrics** in this file
2. **Identify bottlenecks** from Lighthouse opportunities
3. **Implement optimizations** based on findings
4. **Re-measure** to verify improvements
5. **Set up continuous monitoring** for production

## Baseline Measurements

Record your baseline measurements here:

### Development Build

```
Date: [YYYY-MM-DD]
Environment: Development (npm run dev)

Home Page (/cs):
- LCP: [X]ms
- FID: [X]ms
- CLS: [X]
- Performance Score: [X]/100

Products Page (/cs/products):
- LCP: [X]ms
- FID: [X]ms
- CLS: [X]
- Performance Score: [X]/100

Product Detail (/cs/products/[slug]):
- LCP: [X]ms
- FID: [X]ms
- CLS: [X]
- Performance Score: [X]/100

About Page (/cs/about):
- LCP: [X]ms
- FID: [X]ms
- CLS: [X]
- Performance Score: [X]/100
```

### Production Build

```
Date: [YYYY-MM-DD]
Environment: Production (npm run build && npm run start)

[Same structure as above]
```

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
