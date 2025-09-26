# Performance Monitoring Hooks

This directory contains React hooks for comprehensive performance monitoring and optimization analysis. These hooks are designed to help developers track component performance, identify optimization opportunities, and improve Lighthouse scores.

## Available Hooks

### 1. `usePerformanceMonitor`

A React hook for tracking component render performance with detailed metrics collection.

**Features:**

- Tracks render start/end times and durations
- Monitors component mount times
- Counts render cycles and updates
- Detects slow renders with configurable thresholds
- Integrates with global performance monitoring system
- Development-friendly logging

**Usage:**

```tsx
import { usePerformanceMonitor } from '@/lib/hooks';

function MyComponent() {
  const { startTracking, endTracking, markMounted, metrics } = usePerformanceMonitor({
    componentName: 'MyComponent',
    logMetrics: true,
    slowRenderThreshold: 16, // 60fps target
    onMetrics: (metrics) => {
      console.log('Render metrics:', metrics);
    },
  });

  useEffect(() => {
    markMounted();
  }, [markMounted]);

  return <div>Component content</div>;
}
```

### 2. `useLighthouseOptimization`

A specialized hook for tracking Lighthouse optimization opportunities and Core Web Vitals contributions.

**Features:**

- Tracks Cumulative Layout Shift (CLS) contributions
- Monitors image loading performance for LCP optimization
- Measures JavaScript execution time for TBT analysis
- Identifies accessibility issues
- Provides actionable optimization recommendations
- Estimates performance score impact

**Usage:**

```tsx
import { useLighthouseOptimization } from '@/lib/hooks';

function MyComponent() {
  const {
    metrics,
    recordLayoutShift,
    recordImageLoad,
    recordJSExecution,
    getOptimizationRecommendations,
  } = useLighthouseOptimization({
    componentName: 'MyComponent',
    trackImages: true,
    trackJavaScript: true,
    trackAccessibility: true,
  });

  const handleImageLoad = (src: string, loadTime: number) => {
    recordImageLoad(src, loadTime);
  };

  const recommendations = getOptimizationRecommendations();

  return <div>Component with optimized images</div>;
}
```

### 3. `usePerformanceProfiler`

A comprehensive profiling hook that combines render monitoring, Lighthouse optimization, memory tracking, and network analysis.

**Features:**

- Complete performance profiling sessions
- Memory usage tracking
- Network resource monitoring
- Performance score calculation
- Detailed optimization reports
- Profile data export for analysis
- Configurable sampling rates

**Usage:**

```tsx
import { usePerformanceProfiler } from '@/lib/hooks';

function MyComponent() {
  const {
    profile,
    startProfiling,
    stopProfiling,
    getPerformanceReport,
    exportProfile,
    isProfiling,
  } = usePerformanceProfiler({
    componentName: 'MyComponent',
    trackMemory: true,
    trackNetwork: true,
    sampleRate: 0.1, // Profile 10% of sessions
    onProfileComplete: (profile) => {
      // Send to analytics
      analytics.track('performance_profile', profile);
    },
  });

  const handleExportReport = () => {
    const report = getPerformanceReport();
    console.log(report);
  };

  return (
    <div>
      <div>Profiling: {isProfiling ? 'Active' : 'Inactive'}</div>
      <button onClick={handleExportReport}>Export Report</button>
    </div>
  );
}
```

## Integration with Global Performance Monitor

All hooks integrate with the global performance monitoring system located at `@/lib/monitoring/performance-monitor`. This ensures:

- Consistent metric collection across the application
- Centralized performance data storage
- Automatic server-side reporting (in production)
- Integration with existing monitoring infrastructure

## Development vs Production Behavior

### Development Mode

- Detailed console logging enabled by default
- All performance metrics are tracked
- Optimization recommendations are displayed
- Memory and network tracking is active
- 100% sampling rate for profiling

### Production Mode

- Console logging is disabled
- Metrics are sent to monitoring endpoints
- Reduced sampling rates to minimize overhead
- Focus on critical performance issues only
- Automatic cleanup of old metrics

## Performance Impact

These hooks are designed to have minimal performance impact:

- **usePerformanceMonitor**: ~0.1ms overhead per render
- **useLighthouseOptimization**: ~0.2ms overhead per tracked event
- **usePerformanceProfiler**: ~0.5ms overhead per profiling session

The overhead is negligible compared to typical React component render times and provides valuable insights for optimization.

## Best Practices

### 1. Component Naming

Use descriptive, unique component names for better tracking:

```tsx
// Good
usePerformanceMonitor({ componentName: 'ProductCard' })
usePerformanceMonitor({ componentName: 'CheckoutForm' })

// Avoid
usePerformanceMonitor({ componentName: 'Component' })
usePerformanceMonitor({ componentName: 'div' })
```

### 2. Selective Monitoring

Don't monitor every component - focus on:

- Critical user interface components
- Components with complex rendering logic
- Components that handle large datasets
- Components in the critical rendering path

### 3. Threshold Configuration

Set appropriate thresholds based on your performance targets:

```tsx
// For 60fps (16.67ms per frame)
usePerformanceMonitor({ slowRenderThreshold: 16 })

// For 30fps (33.33ms per frame)
usePerformanceMonitor({ slowRenderThreshold: 33 })

// For complex components
usePerformanceMonitor({ slowRenderThreshold: 50 })
```

### 4. Sampling in Production

Use sampling to reduce overhead in production:

```tsx
usePerformanceProfiler({
  sampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.01, // 1% in production
})
```

### 5. Data Export and Analysis

Regularly export and analyze performance data:

```tsx
const { exportProfile } = usePerformanceProfiler({
  onProfileComplete: (profile) => {
    // Send to your analytics service
    if (profile.lighthouseMetrics.performanceScore < 80) {
      analytics.track('poor_performance', profile);
    }
  },
});
```

## Troubleshooting

### Common Issues

1. **Hook not tracking**: Ensure the component is actually rendering and the hook is enabled
2. **Missing metrics**: Check that `performance.now()` is available in your environment
3. **Console spam**: Disable `logMetrics` in production or reduce sampling rate
4. **Memory leaks**: Ensure proper cleanup in component unmount

### Debug Mode

Enable debug mode for detailed logging:

```tsx
usePerformanceMonitor({
  componentName: 'MyComponent',
  logMetrics: true,
  enabled: process.env.NODE_ENV === 'development',
});
```

## Examples

See `src/components/examples/PerformanceMonitoringExample.tsx` for a complete working example that demonstrates all three hooks in action.

## Testing

The hooks include comprehensive test coverage. Run tests with:

```bash
npm test src/lib/hooks/__tests__/
```

## Contributing

When adding new performance monitoring features:

1. Follow the existing hook patterns
2. Add comprehensive TypeScript types
3. Include test coverage
4. Update this documentation
5. Consider performance impact of the monitoring itself
6. Ensure compatibility with both development and production environments
