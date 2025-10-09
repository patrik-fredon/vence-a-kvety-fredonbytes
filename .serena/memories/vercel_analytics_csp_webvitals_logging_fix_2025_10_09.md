# Vercel Analytics CSP and Web Vitals Logging Fix

## Date
2025-10-09

## Issues Fixed

### 1. Content Security Policy (CSP) Violation
**Problem**: Vercel Analytics script from `https://va.vercel-scripts.com/v1/script.debug.js` was being blocked by CSP

**Solution**: Added `https://va.vercel-scripts.com` to the `script-src` directive in `next.config.ts`

**File Modified**: `next.config.ts` (line ~122)
```typescript
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://va.vercel-scripts.com"
```

### 2. Excessive Web Vitals Console Logging
**Problem**: Web Vitals metrics were logging to console every time they were collected, resulting in 12k+ logs per 3 minutes

**Solutions Applied**:

#### A. Conditional Logging (line ~189)
Changed from always logging to only logging in development mode when debug is enabled:
```typescript
// Only log in development and limit frequency
if (process.env.NODE_ENV === "development" && debug) {
  console.log(`📊 Web Vitals - ${metric.name}:`, {
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
  });
}
```

#### B. Reduced Reporting Frequency (line ~230)
Changed periodic reporting interval from 30 seconds to 5 minutes:
```typescript
// Report every 5 minutes (300000ms) instead of 30 seconds
const reportingInterval = setInterval(() => {
  if (metricsQueue.current.length > 0) {
    sendMetricsToServer([...metricsQueue.current]);
    metricsQueue.current = [];
  }
}, 300000);
```

## Files Modified
1. `next.config.ts` - Added Vercel Analytics domain to CSP
2. `src/components/monitoring/WebVitalsTracker.tsx` - Reduced logging and reporting frequency

## Impact
- Vercel Analytics will now load without CSP violations
- Console logs reduced by ~99% (only in dev mode with debug flag)
- Network requests for web vitals reduced from every 30s to every 5 minutes
- Better performance and cleaner console output