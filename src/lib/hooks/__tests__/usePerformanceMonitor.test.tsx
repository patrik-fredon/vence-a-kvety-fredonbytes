import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from '../usePerformanceMonitor';

// Mock the performance monitor
jest.mock('@/lib/monitoring/performance-monitor', () => ({
  performanceMonitor: {
    recordMetric: jest.fn(),
  },
}));

// Mock performance.now()
const mockPerformanceNow = jest.fn();
Object.defineProperty(window, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor({
        componentName: 'TestComponent',
      })
    );

    expect(result.current.metrics).toBeNull();
    expect(result.current.isTracking).toBe(false);
    expect(typeof result.current.startTracking).toBe('function');
    expect(typeof result.current.endTracking).toBe('function');
    expect(typeof result.current.markMounted).toBe('function');
  });

  it('should start and end tracking correctly', async () => {
    const onMetrics = jest.fn();
    const { result } = renderHook(() =>
      usePerformanceMonitor({
        componentName: 'TestComponent',
        onMetrics,
      })
    );

    // Start tracking
    act(() => {
      result.current.startTracking();
    });

    expect(result.current.isTracking).toBe(true);

    // Simulate time passing
    mockPerformanceNow.mockReturnValue(1050); // 50ms later

    // End tracking
    await act(async () => {
      result.current.endTracking();
    });

    expect(result.current.isTracking).toBe(false);
    expect(result.current.metrics).not.toBeNull();
    expect(result.current.metrics?.renderDuration).toBe(50);
    expect(result.current.metrics?.componentName).toBe('TestComponent');
    expect(onMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        componentName: 'TestComponent',
        renderDuration: 50,
        isFirstRender: true,
      })
    );
  });

  it('should track mount time correctly', () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor({
        componentName: 'TestComponent',
      })
    );

    mockPerformanceNow.mockReturnValue(2000);

    act(() => {
      result.current.markMounted();
    });

    // The mount time should be recorded in the global performance monitor
    const { performanceMonitor } = require('@/lib/monitoring/performance-monitor');
    expect(performanceMonitor.recordMetric).toHaveBeenCalledWith(
      'COMPONENT_MOUNT_TESTCOMPONENT',
      2000,
      'Component: TestComponent mount'
    );
  });

  it('should handle disabled state', () => {
    const onMetrics = jest.fn();
    const { result } = renderHook(() =>
      usePerformanceMonitor({
        componentName: 'TestComponent',
        enabled: false,
        onMetrics,
      })
    );

    act(() => {
      result.current.startTracking();
    });

    expect(result.current.isTracking).toBe(false);

    act(() => {
      result.current.endTracking();
    });

    expect(onMetrics).not.toHaveBeenCalled();
  });

  it('should detect slow renders', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() =>
      usePerformanceMonitor({
        componentName: 'TestComponent',
        logMetrics: true,
        slowRenderThreshold: 10,
      })
    );

    act(() => {
      result.current.startTracking();
    });

    // Simulate slow render (20ms > 10ms threshold)
    mockPerformanceNow.mockReturnValue(1020);

    await act(async () => {
      result.current.endTracking();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Slow render detected')
    );

    consoleSpy.mockRestore();
  });

  it('should track multiple renders and update counts', async () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor({
        componentName: 'TestComponent',
      })
    );

    // First render
    act(() => {
      result.current.startTracking();
    });

    mockPerformanceNow.mockReturnValue(1010);

    await act(async () => {
      result.current.endTracking();
    });

    expect(result.current.metrics?.updateCount).toBe(1);
    expect(result.current.metrics?.isFirstRender).toBe(true);

    // Second render
    mockPerformanceNow.mockReturnValue(1020);

    act(() => {
      result.current.startTracking();
    });

    mockPerformanceNow.mockReturnValue(1030);

    await act(async () => {
      result.current.endTracking();
    });

    expect(result.current.metrics?.updateCount).toBe(2);
    expect(result.current.metrics?.isFirstRender).toBe(false);
  });

  it('should not auto-track in test environment', () => {
    const onMetrics = jest.fn();

    renderHook(() =>
      usePerformanceMonitor({
        componentName: 'TestComponent',
        onMetrics,
      })
    );

    // In test environment, auto-tracking should be disabled
    expect(onMetrics).not.toHaveBeenCalled();
  });
});
