'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCoreWebVitals, type CoreWebVitalsMetrics } from '@/lib/hooks';

interface CoreWebVitalsContextType {
  metrics: CoreWebVitalsMetrics | null;
  isTracking: boolean;
  getOptimizations: () => string[];
  recordLayoutShift: (shift: number, element?: Element) => void;
  recordImageLoad: (src: string, loadTime: number, isLCP?: boolean) => void;
  recordJSExecution: (taskName: string, duration: number) => void;
}

const CoreWebVitalsContext = createContext<CoreWebVitalsContextType | null>(null);

interface CoreWebVitalsProviderProps {
  children: React.ReactNode;
  componentName?: string;
  enabled?: boolean;
  onMetricsUpdate?: (metrics: CoreWebVitalsMetrics) => void;
  onOptimizationFound?: (optimization: string, metric: string) => void;
}

/**
 * Core Web Vitals Provider component
 * Provides Core Web Vitals tracking context to child components
 */
export function CoreWebVitalsProvider({
  children,
  componentName = 'App',
  enabled = true,
  onMetricsUpdate,
  onOptimizationFound,
}: CoreWebVitalsProviderProps) {
  const [globalMetrics, setGlobalMetrics] = useState<CoreWebVitalsMetrics | null>(null);

  const coreWebVitals = useCoreWebVitals({
    componentName,
    enabled,
    trackCLS: true,
    trackLCP: true,
    trackFID: true,
    reserveImageSpace: true,
    optimizeJavaScript: true,
    prioritizeImages: true,
    onMetricsUpdate: (metrics) => {
      setGlobalMetrics(metrics);
      onMetricsUpdate?.(metrics);
    },
    onOptimizationFound,
  });

  // Log performance summary in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && coreWebVitals.metrics) {
      const { metrics } = coreWebVitals;
      console.log('🚀 [CoreWebVitals] Performance Summary:', {
        LCP: metrics.lcp ? `${metrics.lcp.toFixed(0)}ms (${metrics.ratings.lcp})` : 'N/A',
        FID: metrics.fid ? `${metrics.fid.toFixed(0)}ms (${metrics.ratings.fid})` : 'N/A',
        INP: metrics.inp ? `${metrics.inp.toFixed(0)}ms (${metrics.ratings.inp})` : 'N/A',
        CLS: metrics.cls ? `${metrics.cls.toFixed(3)} (${metrics.ratings.cls})` : 'N/A',
        optimizations: coreWebVitals.getOptimizations().length,
      });
    }
  }, [coreWebVitals.metrics, coreWebVitals]);

  const contextValue: CoreWebVitalsContextType = {
    metrics: coreWebVitals.metrics || globalMetrics,
    isTracking: coreWebVitals.isTracking,
    getOptimizations: coreWebVitals.getOptimizations,
    recordLayoutShift: coreWebVitals.recordLayoutShift,
    recordImageLoad: coreWebVitals.recordImageLoad,
    recordJSExecution: coreWebVitals.recordJSExecution,
  };

  return (
    <CoreWebVitalsContext.Provider value={contextValue}>
      {children}
    </CoreWebVitalsContext.Provider>
  );
}

/**
 * Hook to use Core Web Vitals context
 */
export function useCoreWebVitalsContext(): CoreWebVitalsContextType {
  const context = useContext(CoreWebVitalsContext);

  if (!context) {
    throw new Error('useCoreWebVitalsContext must be used within a CoreWebVitalsProvider');
  }

  return context;
}

/**
 * HOC to wrap components with Core Web Vitals tracking
 */
export function withCoreWebVitals<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName?: string;
    trackCLS?: boolean;
    trackLCP?: boolean;
    trackFID?: boolean;
  } = {}
) {
  const WrappedComponent = (props: P) => {
    const { componentName = Component.displayName || Component.name || 'Component' } = options;

    return (
      <CoreWebVitalsProvider
        componentName={componentName}
        enabled={true}
      >
        <Component {...props} />
      </CoreWebVitalsProvider>
    );
  };

  WrappedComponent.displayName = `withCoreWebVitals(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
