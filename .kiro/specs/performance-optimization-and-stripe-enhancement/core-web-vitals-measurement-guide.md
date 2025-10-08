# Core Web Vitals Measurement Guide

## Task 12.2: Measure Core Web Vitals

**Date:** 2025-10-08  
**Requirements:** 7.1, 7.3  
**Status:** Ready for Execution

---

## Overview

This guide provides instructions for measuring Core Web Vitals (LCP, FID, CLS) on key pages of the Vence a kvety e-commerce platform using Lighthouse audits.

## Core Web Vitals Thresholds

According to Google's Web Vitals initiative and our requirements:

| Metric | Good | Needs Improvement | Poor | Target |
|--------|------|-------------------|------|--------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s | < 2.5s |
| **FID** (First Input Delay) | ≤ 100ms | 100ms - 300ms | > 300ms | < 100ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 | < 0.1 |

### Additional Metrics to Track

| Metric | Good | Target |
|--------|------|--------|
| **FCP** (First Contentful Paint) | ≤ 1.8s | < 1.8s |
| **TTFB** (Time to First Byte) | ≤ 800ms | < 800ms |
| **TBT** (Total Blocking Time) | ≤ 200ms | < 200ms |

---

## Key Pages to Test

The following pages should be tested as they represent critical user journeys:

1. **Home Page (Czech)** - `/cs`
   - Primary landing page
   - Product grid display
   - Hero section with images

2. **Home Page (English)** - `/en`
   - International audience
   - Same functionality as Czech version

3. **Products Page** - `/cs/products`
   - Product listing with filters
   - Multiple product cards
   - Image-heavy page

4. **Product Detail Page** - `/cs/products/[slug]`
   - Individual product view
   - Image gallery
   - Customization options

5. **About Page** - `/cs/about`
   - Content-heavy page
   - Company information

6. **Checkout Page** - `/cs/checkout`
   - Critical conversion page
   - Payment form integration
   - Stripe Elements loading

---

## Measurement Methods

### Method 1: Automated Lighthouse Script (Recommended)

**Prerequisites:**
- Development server running (`npm run dev`)
- Or production build running (`npm run build && npm run start`)

**Steps:**

1. Start the server:
   ```bash
   npm run dev
   # OR for production testing
   npm run build && npm run start
   ```

2. Run the measurement script:
   ```bash
   npm run measure:vitals
   ```

3. Results will be:
   - Displayed in the console
   - Saved to `.kiro/specs/vence-kvety-refactor/core-web-vitals-results.json`

**Custom URL Testing:**
```bash
npm run measure:vitals -- --url=http://localhost:3000/cs
```

**Production Testing:**
```bash
npm run measure:vitals:prod
```

---

### Method 2: Browser-Based Measurement

**Prerequisites:**
- Development server running
- Modern browser (Chrome, Edge, Firefox)

**Steps:**

1. Open `scripts/measure-web-vitals-browser.html` in your browser

2. Navigate to the page you want to test (e.g., `http://localhost:3000/cs`)

3. Open DevTools (F12) and check the Console tab

4. Interact with the page (scroll, click, etc.)

5. Wait for metrics to be collected (displayed in the UI)

6. Record the results in the table below

---

### Method 3: Chrome DevTools Lighthouse

**Steps:**

1. Open Chrome DevTools (F12)

2. Go to the "Lighthouse" tab

3. Select:
   - ✅ Performance
   - ✅ Desktop or Mobile
   - ✅ Clear storage

4. Click "Analyze page load"

5. Review the report and record metrics

---

## Results Template

### Test Run Information

- **Date:** _____________
- **Environment:** [ ] Development [ ] Production
- **Device:** [ ] Desktop [ ] Mobile
- **Network:** [ ] Fast 3G [ ] 4G [ ] WiFi
- **Tester:** _____________

---

### Page: Home (Czech) - `/cs`

| Metric | Value | Status | Notes |
|--------|-------|--------|-------|
| LCP | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FID | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| CLS | _____ | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FCP | _____ ms | | |
| TTFB | _____ ms | | |
| Performance Score | _____ /100 | | |

**Issues Identified:**
- 
- 

**Recommendations:**
- 
- 

---

### Page: Home (English) - `/en`

| Metric | Value | Status | Notes |
|--------|-------|--------|-------|
| LCP | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FID | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| CLS | _____ | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FCP | _____ ms | | |
| TTFB | _____ ms | | |
| Performance Score | _____ /100 | | |

**Issues Identified:**
- 
- 

**Recommendations:**
- 
- 

---

### Page: Products - `/cs/products`

| Metric | Value | Status | Notes |
|--------|-------|--------|-------|
| LCP | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FID | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| CLS | _____ | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FCP | _____ ms | | |
| TTFB | _____ ms | | |
| Performance Score | _____ /100 | | |

**Issues Identified:**
- 
- 

**Recommendations:**
- 
- 

---

### Page: Product Detail - `/cs/products/[slug]`

| Metric | Value | Status | Notes |
|--------|-------|--------|-------|
| LCP | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FID | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| CLS | _____ | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FCP | _____ ms | | |
| TTFB | _____ ms | | |
| Performance Score | _____ /100 | | |

**Issues Identified:**
- 
- 

**Recommendations:**
- 
- 

---

### Page: About - `/cs/about`

| Metric | Value | Status | Notes |
|--------|-------|--------|-------|
| LCP | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FID | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| CLS | _____ | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FCP | _____ ms | | |
| TTFB | _____ ms | | |
| Performance Score | _____ /100 | | |

**Issues Identified:**
- 
- 

**Recommendations:**
- 
- 

---

### Page: Checkout - `/cs/checkout`

| Metric | Value | Status | Notes |
|--------|-------|--------|-------|
| LCP | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FID | _____ ms | [ ] Good [ ] Needs Improvement [ ] Poor | |
| CLS | _____ | [ ] Good [ ] Needs Improvement [ ] Poor | |
| FCP | _____ ms | | |
| TTFB | _____ ms | | |
| Performance Score | _____ /100 | | |

**Issues Identified:**
- 
- 

**Recommendations:**
- 
- 

---

## Summary Analysis

### Overall Performance

- **Average Performance Score:** _____ /100
- **Pages Passing All Core Web Vitals:** _____ / 6
- **Most Common Issues:**
  1. 
  2. 
  3. 

### Core Web Vitals Status

| Metric | Pages Passing | Status |
|--------|---------------|--------|
| LCP < 2.5s | _____ / 6 | [ ] All Pass [ ] Some Fail |
| FID < 100ms | _____ / 6 | [ ] All Pass [ ] Some Fail |
| CLS < 0.1 | _____ / 6 | [ ] All Pass [ ] Some Fail |

### Priority Optimizations

Based on the measurements, prioritize the following optimizations:

1. **High Priority:**
   - 
   - 

2. **Medium Priority:**
   - 
   - 

3. **Low Priority:**
   - 
   - 

---

## Common Performance Issues & Solutions

### LCP (Largest Contentful Paint) Issues

**Common Causes:**
- Large images without optimization
- Render-blocking resources
- Slow server response times
- Client-side rendering delays

**Solutions:**
- ✅ Use Next.js Image component with priority flag
- ✅ Implement lazy loading for below-the-fold images
- ✅ Optimize image formats (AVIF, WebP)
- ✅ Use CDN for static assets
- ✅ Implement Server Components where possible

### FID (First Input Delay) Issues

**Common Causes:**
- Heavy JavaScript execution
- Long tasks blocking main thread
- Large bundle sizes
- Unoptimized third-party scripts

**Solutions:**
- ✅ Code splitting and lazy loading
- ✅ Defer non-critical JavaScript
- ✅ Optimize third-party scripts (Stripe, analytics)
- ✅ Use Web Workers for heavy computations
- ✅ Implement progressive enhancement

### CLS (Cumulative Layout Shift) Issues

**Common Causes:**
- Images without dimensions
- Dynamic content injection
- Web fonts causing FOIT/FOUT
- Ads or embeds without reserved space

**Solutions:**
- ✅ Always specify image dimensions
- ✅ Use blur placeholders for images
- ✅ Reserve space for dynamic content
- ✅ Use font-display: swap
- ✅ Avoid inserting content above existing content

---

## Automated Monitoring

### Production Monitoring

The application includes built-in Core Web Vitals monitoring:

**Client-Side Tracking:**
```typescript
// src/components/monitoring/WebVitalsTracker.tsx
// Automatically tracks and reports metrics
```

**API Endpoint:**
```
POST /api/monitoring/vitals
```

**Viewing Metrics:**
- Check application logs
- Review monitoring dashboard (if configured)
- Query database table: `web_vitals_metrics`

### CI/CD Integration

Add performance checks to your CI/CD pipeline:

```yaml
# .github/workflows/performance.yml
- name: Run Lighthouse CI
  run: |
    npm run build
    npm run measure:vitals
    # Fail if performance score < 80
```

---

## Next Steps

After completing measurements:

1. ✅ Fill out the results template above
2. ✅ Identify performance bottlenecks
3. ✅ Prioritize optimizations (Task 12.3)
4. ✅ Implement fixes
5. ✅ Re-measure to verify improvements
6. ✅ Document final results

---

## References

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## Appendix: Quick Reference Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Measure Core Web Vitals (automated)
npm run measure:vitals

# Measure with custom URL
npm run measure:vitals -- --url=http://localhost:3000/cs

# Analyze bundle size
npm run analyze:bundle

# Run all performance tests
npm run measure:vitals && npm run analyze:bundle
```
