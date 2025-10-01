'use client';

import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor, usePerformanceProfiler } from '@/lib/hooks';

/**
 * Example component demonstrating performance monitoring hooks usage
 * This component shows how to integrate performance tracking into React components
 */
export const PerformanceMonitoringExample: React.FC = () => {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<number[]>([]);

  // Basic performance monitoring
  const { metrics: renderMetrics, markMounted } = usePerformanceMonitor({
    componentName: 'PerformanceMonitoringExample',
    logMetrics: true,
    slowRenderThreshold: 16, // 60fps target
    onMetrics: (metrics) => {
      // Custom handling of performance metrics
      if (metrics.renderDuration && metrics.renderDuration > 50) {
        console.warn('Slow render detected!', metrics);
      }
    },
  });

  // Comprehensive performance profiling
  const {
    profile,
    getPerformanceReport,
    exportProfile,
    isProfiling
  } = usePerformanceProfiler({
    componentName: 'PerformanceMonitoringExample',
    trackMemory: true,
    trackNetwork: true,
    sampleRate: 1.0, // Profile 100% of renders in development
    onProfileComplete: (profile) => {
      console.log('Performance profile complete:', profile);
    },
  });

  // Mark component as mounted for performance tracking
  useEffect(() => {
    markMounted();
  }, [markMounted]);

  // Simulate expensive operations
  const handleExpensiveOperation = () => {
    const start = performance.now();

    // Simulate heavy computation
    const newItems = Array.from({ length: 1000 }, (_, i) => i + count * 1000);
    setItems(newItems);

    const duration = performance.now() - start;
    console.log(`Expensive operation took: ${duration.toFixed(2)}ms`);
  };

  // Simulate layout shift
  const handleLayoutShift = () => {
    setCount(prev => prev + 1);
  };

  // Export performance data
  const handleExportProfile = () => {
    const report = getPerformanceReport();
    const profileData = exportProfile();

    console.log('Performance Report:\n', report);
    console.log('Profile Data:', profileData);

    // In a real app, you might send this to analytics
    // analytics.track('performance_profile', JSON.parse(profileData));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" data-component="PerformanceMonitoringExample">
      <h2 className="text-2xl font-bold mb-6">Performance Monitoring Example</h2>

      {/* Performance Status */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Performance Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Profiling:</span>
            <span className={`ml-2 px-2 py-1 rounded ${isProfiling ? 'bg-green-200 text-green-800' : 'bg-gray-200'}`}>
              {isProfiling ? 'Active' : 'Inactive'}
            </span>
          </div>

          {renderMetrics && (
            <>
              <div>
                <span className="font-medium">Renders:</span>
                <span className="ml-2">{renderMetrics.updateCount}</span>
              </div>
              <div>
                <span className="font-medium">Last Render:</span>
                <span className="ml-2">
                  {renderMetrics.renderDuration ? `${renderMetrics.renderDuration.toFixed(2)}ms` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-medium">First Render:</span>
                <span className="ml-2">{renderMetrics.isFirstRender ? 'Yes' : 'No'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Performance Profile Summary */}
      {profile && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Performance Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Avg Render:</span>
              <span className="ml-2">{profile.renderMetrics.averageRenderTime.toFixed(2)}ms</span>
            </div>
            <div>
              <span className="font-medium">Total Renders:</span>
              <span className="ml-2">{profile.renderMetrics.totalRenders}</span>
            </div>
            <div>
              <span className="font-medium">Performance Score:</span>
              <span className="ml-2">{profile.lighthouseMetrics.performanceScore}/100</span>
            </div>
            <div>
              <span className="font-medium">Optimizations:</span>
              <span className="ml-2">{profile.lighthouseMetrics.optimizationOpportunities.length}</span>
            </div>
          </div>

          {profile.lighthouseMetrics.optimizationOpportunities.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Optimization Opportunities:</h4>
              <ul className="text-sm space-y-1">
                {profile.lighthouseMetrics.optimizationOpportunities.map((opp, index) => (
                  <li key={index} className="text-blue-700">• {opp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Interactive Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleLayoutShift}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Trigger Re-render (Count: {count})
          </button>

          <button
            onClick={handleExpensiveOperation}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Expensive Operation
          </button>

          <button
            onClick={handleExportProfile}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Export Performance Data
          </button>
        </div>

        {/* Render expensive list to test performance */}
        {items.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Generated Items ({items.length}):</h4>
            <div className="grid grid-cols-10 gap-1 text-xs max-h-32 overflow-y-auto">
              {items.slice(0, 100).map((item) => (
                <div key={item} className="bg-white p-1 rounded text-center">
                  {item}
                </div>
              ))}
              {items.length > 100 && (
                <div className="col-span-10 text-center text-gray-500">
                  ... and {items.length - 100} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Development Tools */}
      {process.env['NODE_ENV'] === 'development' && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Development Tools</h3>
          <p className="text-sm text-gray-600 mb-4">
            Performance monitoring is active in development mode. Check the browser console for detailed logs.
          </p>
          <div className="text-xs space-y-1">
            <div>• Render times are logged for each component update</div>
            <div>• Slow renders (&gt;16ms) trigger warnings</div>
            <div>• Memory usage is tracked during profiling sessions</div>
            <div>• Network resources are monitored for optimization opportunities</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitoringExample;
