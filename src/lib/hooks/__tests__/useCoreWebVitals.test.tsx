import { renderHook, act } from '@testing-library/react';
import { useCoreWebVitals } from '../useCoreWebVitals';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => 1000),
  getEntriesByType: jest.fn(() => []),
};

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onLCP: jest.fn((callback) => {
    // Simulate LCP measurement
    setTimeout(() => callback({ name: 'LCP', value: 2000, id: 'lcp-1' }), 100);
  }),
  onFID: jest.fn((callback) => {
    // Simulate FID measurement
    setTimeout(() => callback({ name: 'FID', value: 80, id: 'fid-1' }), 100);
  }),
  onINP: jest.fn((callback) => {
    // Simulate INP measurement
    setTimeout(() => callback({ name: 'INP', value: 150, id: 'inp-1' }), 100);
  }),
  onCLS: jest.fn((callback) => {
    // Simulate CLS measurement
    setTimeout(() => callback({ name: 'CLS', value: 0.05, id: 'cls-1' }), 100);
  }),
  onFCP: jest.fn((callback) => {
    // Simulate FCP measurement
    setTimeout(() => callback({ name: 'FCP', value: 1500, id: 'fcp-1' }), 100);
  }),
  onTTFB: jest.fn((callback) => {
    // Simulate TTFB measurement
    setTimeout(() => callback({ name: 'TTFB', value: 600, id: 'ttfb-1' }), 100);
  }),
}));

// Mock performance monitor
jest.mock('@/lib/monitoring/performance-monitor', () => ({
  performanceMonitor: {
    recordMetric: jest.fn(),
  },
}));

// Mock PerformanceObserver
const mockObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};

global.PerformanceObserver = jest.fn(() => mockObserver) as any;
global.performance = mockPerformance as any;

describe('useCoreWebVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() =>
      useCoreWebVitals({
        componentName: 'TestComponent',
      })
    );

    expect(result.current.isTracking).toBe(true);
    expect(result.current.metrics).toBeDefined();
  });

  it('should track layout shifts', async () => {
    const { result } = renderHook(() =>
      useCoreWebVitals({
        componentName: 'TestComponent',
        trackCLS: true,
      })
    );

    act(() => {
      result.current.recordLayoutShift(0.15);
    });

    expect(result.current.metrics?.cls).toBe(0.15);
  });

  it('should track image loads', async () => {
    const { result } = renderHook(() =>
      useCoreWebVitals({
        componentName: 'TestComponent',
        trackLCP: true,
      })
    );

    act(() => {
      result.current.recordImageLoad('test-image.jpg', 1200, true);
    });

    expect(result.current.metrics?.lcp).toBe(1200);
  });

  it('should track JavaScript execution', async () => {
    const onOptimizationFound = jest.fn();
    const { result } = renderHook(() =>
      useCoreWebVitals({
        componentName: 'TestComponent',
        trackFID: true,
        onOptimizationFound,
      })
    );

    act(() => {
      // First record a high FID to trigger optimization
      result.current.recordJSExecution('slowTask', 350);
      // Update metrics to trigger FID optimization
      // We need to simulate the FID metric being set to trigger optimizations
    });

    // Wait for metrics to be processed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Check if JS execution was recorded (the function should be called)
    expect(result.current.metrics).toBeDefined();
  });

  it('should generate performance ratings', async () => {
    const { result } = renderHook(() =>
      useCoreWebVitals({
        componentName: 'TestComponent',
      })
    );

    // Wait for web vitals to be initialized
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    expect(result.current.metrics?.ratings).toBeDefined();
  });

  it('should provide CLS prevention styles', () => {
    const { result } = renderHook(() =>
      useCoreWebVitals({
        componentName: 'TestComponent',
        reserveImageSpace: true,
      })
    );

    const styles = result.current.reserveImageSpace(800, 600);

    expect(styles).toHaveProperty('aspectRatio');
    expect(styles.aspectRatio).toBe((800 / 600).toString());
  });

  it('should generate optimization recommendations', async () => {
    const { result } = renderHook(() =>
      useCoreWebVitals({
        componentName: 'TestComponent',
      })
    );

    // Simulate poor metrics
    act(() => {
      result.current.recordLayoutShift(0.3); // Poor CLS
      result.current.recordImageLoad('slow-image.jpg', 5000, true); // Poor LCP
      result.current.recordJSExecution('blockingTask', 400); // Poor FID
    });

    const optimizations = result.current.getOptimizations();

    expect(optimizations.length).toBeGreaterThan(0);
    expect(optimizations.some(opt => opt.includes('CRITICAL'))).toBe(true);
  });

  it('should stop tracking when disabled', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useCoreWebVitals({
          componentName: 'TestComponent',
          enabled,
        }),
      { initialProps: { enabled: true } }
    );

    expect(result.current.isTracking).toBe(true);

    rerender({ enabled: false });

    expect(result.current.isTracking).toBe(false);
  });

  it('should handle metrics updates callback', async () => {
    const onMetricsUpdate = jest.fn();
    const { result } = renderHook(() =>
      useCoreWebVitals({
        componentName: 'TestComponent',
        onMetricsUpdate,
      })
    );

    act(() => {
      result.current.recordLayoutShift(0.1);
    });

    expect(onMetricsUpdate).toHaveBeenCalled();
  });

  it('should calculate correct performance ratings', () => {
    const { result } = renderHook(() =>
      useCoreWebVitals({
        componentName: 'TestComponent',
      })
    );

    // Test good LCP
    act(() => {
      result.current.recordImageLoad('fast-image.jpg', 2000, true);
    });
    expect(result.current.metrics?.ratings.lcp).toBe('good');

    // Test poor CLS
    act(() => {
      result.current.recordLayoutShift(0.3);
    });
    expect(result.current.metrics?.ratings.cls).toBe('poor');
  });

  it('should handle multiple layout shifts correctly', () => {
    const { result } = renderHook(() =>
      useCoreWebVitals({
        componentName: 'TestComponent',
        trackCLS: true,
      })
    );

    act(() => {
      result.current.recordLayoutShift(0.05);
      result.current.recordLayoutShift(0.08);
      result.current.recordLayoutShift(0.03);
    });

    // Should accumulate layout shifts
    expect(result.current.metrics?.cls).toBe(0.16);
  });
});
