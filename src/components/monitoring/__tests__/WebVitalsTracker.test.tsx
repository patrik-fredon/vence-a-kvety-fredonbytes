/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WebVitalsTracker, useWebVitals } from '../WebVitalsTracker';

// Mock web-vitals
const mockOnCLS = jest.fn();
const mockOnINP = jest.fn();
const mockOnFCP = jest.fn();
const mockOnLCP = jest.fn();
const mockOnTTFB = jest.fn();
const mockOnFID = jest.fn();

jest.mock('web-vitals', () => ({
  onCLS: mockOnCLS,
  onINP: mockOnINP,
  onFCP: mockOnFCP,
  onLCP: mockOnLCP,
  onTTFB: mockOnTTFB,
  onFID: mockOnFID,
}));

// Mock performance monitor
jest.mock('@/lib/monitoring/performance-monitor', () => ({
  performanceMonitor: {
    recordMetric: jest.fn(),
  },
}));

// Mock performance config
jest.mock('../../../performance.config.js', () => ({
  development: {
    debug: {
      showWebVitalsOverlay: false,
    },
  },
  monitoring: {
    webVitalsTracking: {
      endpoint: '/api/monitoring/performance',
      sampleRate: 1.0,
      autoReport: true,
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock sendBeacon
Object.defineProperty(navigator, 'sendBeacon', {
  value: jest.fn(),
  writable: true,
});

describe('WebVitalsTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    mockSessionStorage.getItem.mockReturnValue('test-session-id');
  });

  it('should render nothing in production mode', () => {
    const { container } = render(<WebVitalsTracker />);
    expect(container.firstChild).toBeNull();
  });

  it('should render debug overlay when debug is enabled', () => {
    render(<WebVitalsTracker debug={true} />);
    expect(screen.getByText('Web Vitals')).toBeInTheDocument();
  });

  it('should initialize Web Vitals listeners', async () => {
    render(<WebVitalsTracker />);

    await waitFor(() => {
      expect(mockOnCLS).toHaveBeenCalled();
      expect(mockOnINP).toHaveBeenCalled();
      expect(mockOnFCP).toHaveBeenCalled();
      expect(mockOnLCP).toHaveBeenCalled();
      expect(mockOnTTFB).toHaveBeenCalled();
    });
  });

  it('should call onMetric callback when metric is received', async () => {
    const onMetric = jest.fn();
    render(<WebVitalsTracker onMetric={onMetric} />);

    // Simulate Web Vitals metric
    const mockMetric = {
      name: 'LCP',
      value: 2500,
      rating: 'good',
      delta: 100,
      id: 'test-id',
      navigationType: 'navigate',
    };

    // Get the callback passed to onLCP and call it
    const lcpCallback = mockOnLCP.mock.calls[0][0];
    lcpCallback(mockMetric);

    expect(onMetric).toHaveBeenCalledWith({
      name: 'LCP',
      value: 2500,
      rating: 'good',
      delta: 100,
      id: 'test-id',
      navigationType: 'navigate',
    });
  });

  it('should display metrics in debug overlay', async () => {
    render(<WebVitalsTracker debug={true} />);

    // Simulate Web Vitals metric
    const mockMetric = {
      name: 'LCP',
      value: 2500,
      rating: 'good',
      delta: 100,
      id: 'test-id',
      navigationType: 'navigate',
    };

    const lcpCallback = mockOnLCP.mock.calls[0][0];
    lcpCallback(mockMetric);

    await waitFor(() => {
      expect(screen.getByText('LCP:')).toBeInTheDocument();
      expect(screen.getByText('2500ms')).toBeInTheDocument();
    });
  });

  it('should format CLS values correctly', async () => {
    render(<WebVitalsTracker debug={true} />);

    const mockMetric = {
      name: 'CLS',
      value: 0.123,
      rating: 'good',
      delta: 0.01,
      id: 'test-id',
      navigationType: 'navigate',
    };

    const clsCallback = mockOnCLS.mock.calls[0][0];
    clsCallback(mockMetric);

    await waitFor(() => {
      expect(screen.getByText('CLS:')).toBeInTheDocument();
      expect(screen.getByText('0.123')).toBeInTheDocument();
    });
  });

  it('should hide debug overlay when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<WebVitalsTracker debug={true} />);

    expect(screen.getByText('Web Vitals')).toBeInTheDocument();

    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    expect(screen.queryByText('Web Vitals')).not.toBeInTheDocument();
    expect(screen.getByTitle('Show Web Vitals')).toBeInTheDocument();
  });

  it('should show debug overlay when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<WebVitalsTracker debug={true} />);

    // Close the overlay first
    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    // Click the toggle button
    const toggleButton = screen.getByTitle('Show Web Vitals');
    await user.click(toggleButton);

    expect(screen.getByText('Web Vitals')).toBeInTheDocument();
  });

  it('should send metrics to server when autoReport is enabled', async () => {
    jest.useFakeTimers();

    render(<WebVitalsTracker autoReport={true} sampleRate={1.0} />);

    const mockMetric = {
      name: 'LCP',
      value: 2500,
      rating: 'good',
      delta: 100,
      id: 'test-id',
      navigationType: 'navigate',
    };

    const lcpCallback = mockOnLCP.mock.calls[0][0];
    lcpCallback(mockMetric);

    // Fast-forward to trigger periodic reporting
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/monitoring/performance',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('LCP'),
        })
      );
    });

    jest.useRealTimers();
  });

  it('should use sendBeacon on page unload', () => {
    render(<WebVitalsTracker autoReport={true} />);

    const mockMetric = {
      name: 'LCP',
      value: 2500,
      rating: 'good',
      delta: 100,
      id: 'test-id',
      navigationType: 'navigate',
    };

    const lcpCallback = mockOnLCP.mock.calls[0][0];
    lcpCallback(mockMetric);

    // Simulate page unload
    const beforeUnloadEvent = new Event('beforeunload');
    window.dispatchEvent(beforeUnloadEvent);

    expect(navigator.sendBeacon).toHaveBeenCalled();
  });

  it('should respect sample rate', async () => {
    // Mock Math.random to return 0.5
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5);

    render(<WebVitalsTracker autoReport={true} sampleRate={0.3} />);

    const mockMetric = {
      name: 'LCP',
      value: 2500,
      rating: 'good',
      delta: 100,
      id: 'test-id',
      navigationType: 'navigate',
    };

    const lcpCallback = mockOnLCP.mock.calls[0][0];
    lcpCallback(mockMetric);

    // Should not queue metric because 0.5 > 0.3
    jest.useFakeTimers();
    jest.advanceTimersByTime(30000);

    expect(fetch).not.toHaveBeenCalled();

    Math.random = originalRandom;
    jest.useRealTimers();
  });

  it('should generate session ID if not exists', () => {
    mockSessionStorage.getItem.mockReturnValue(null);

    render(<WebVitalsTracker />);

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'webvitals_session_id',
      expect.stringMatching(/^\d+-[a-z0-9]+$/)
    );
  });
});

describe('useWebVitals hook', () => {
  function TestComponent() {
    const vitals = useWebVitals();

    return (
      <div>
        {Object.entries(vitals).map(([name, metric]) => (
          <div key={name} data-testid={`metric-${name}`}>
            {name}: {metric.value}
          </div>
        ))}
      </div>
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty object initially', () => {
    render(<TestComponent />);

    expect(screen.queryByTestId('metric-LCP')).not.toBeInTheDocument();
  });

  it('should update when Web Vitals metrics are received', async () => {
    render(<TestComponent />);

    const mockMetric = {
      name: 'LCP',
      value: 2500,
      rating: 'good',
      delta: 100,
      id: 'test-id',
      navigationType: 'navigate',
    };

    const lcpCallback = mockOnLCP.mock.calls[0][0];
    lcpCallback(mockMetric);

    await waitFor(() => {
      expect(screen.getByTestId('metric-LCP')).toHaveTextContent('LCP: 2500');
    });
  });

  it('should handle multiple metrics', async () => {
    render(<TestComponent />);

    const lcpMetric = {
      name: 'LCP',
      value: 2500,
      rating: 'good',
      delta: 100,
      id: 'lcp-id',
      navigationType: 'navigate',
    };

    const fcpMetric = {
      name: 'FCP',
      value: 1800,
      rating: 'good',
      delta: 50,
      id: 'fcp-id',
      navigationType: 'navigate',
    };

    const lcpCallback = mockOnLCP.mock.calls[0][0];
    const fcpCallback = mockOnFCP.mock.calls[0][0];

    lcpCallback(lcpMetric);
    fcpCallback(fcpMetric);

    await waitFor(() => {
      expect(screen.getByTestId('metric-LCP')).toHaveTextContent('LCP: 2500');
      expect(screen.getByTestId('metric-FCP')).toHaveTextContent('FCP: 1800');
    });
  });
});
