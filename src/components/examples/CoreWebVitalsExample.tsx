"use client";

import React, { useCallback, useState } from "react";
import { OptimizedImage } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCoreWebVitals } from "@/lib/hooks";
import { useJavaScriptOptimization } from "@/lib/utils/javascript-optimization";

/**
 * Example component demonstrating Core Web Vitals optimizations
 * This component showcases all the optimization techniques implemented in Task 15
 */
export function CoreWebVitalsExample() {
  const [imageCount, setImageCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [layoutShiftDemo, setLayoutShiftDemo] = useState(false);

  // Core Web Vitals tracking
  const coreWebVitals = useCoreWebVitals({
    componentName: "CoreWebVitalsExample",
    enabled: true,
    trackCLS: true,
    trackLCP: true,
    trackFID: true,
    reserveImageSpace: true,
    onMetricsUpdate: (metrics) => {
      console.log("📊 [CoreWebVitals] Metrics updated:", metrics);
    },
    onOptimizationFound: (optimization, metric) => {
      console.warn(`🔧 [CoreWebVitals] Optimization needed for ${metric}:`, optimization);
    },
  });

  // JavaScript optimization
  const { measureExecution, optimizedEventHandler: _optimizedEventHandler } =
    useJavaScriptOptimization("CoreWebVitalsExample");

  // Optimized event handlers
  const handleAddImages = useCallback(async () => {
    await measureExecution("addImages", async () => {
      setImageCount((prev) => prev + 2);
    });
  }, [measureExecution]);

  const handleSimulateSlowTask = useCallback(async () => {
    setIsLoading(true);

    await measureExecution("slowTask", async () => {
      // Simulate a slow JavaScript task
      const startTime = performance.now();
      while (performance.now() - startTime < 100) {
        // Busy wait to simulate heavy computation
      }

      // Record the execution time for FID tracking
      coreWebVitals.recordJSExecution("simulatedSlowTask", 100);

      setIsLoading(false);
    });
  }, [measureExecution, coreWebVitals]);

  const handleLayoutShiftDemo = useCallback(async () => {
    await measureExecution("layoutShiftDemo", async () => {
      setLayoutShiftDemo((prev) => !prev);

      // Record layout shift for demonstration
      if (!layoutShiftDemo) {
        coreWebVitals.recordLayoutShift(0.15);
      }
    });
  }, [measureExecution, coreWebVitals, layoutShiftDemo]);

  const handleImageLoad = useCallback(
    (src: string, loadTime: number, isLCP: boolean) => {
      coreWebVitals.recordImageLoad(src, loadTime, isLCP);
    },
    [coreWebVitals]
  );

  // Get CLS prevention styles
  const clsPreventionStyles = coreWebVitals.reserveImageSpace(400, 300);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Core Web Vitals Optimization Demo</h1>
        <p className="text-teal-600 mb-6">
          This component demonstrates all Core Web Vitals optimizations implemented in Task 15.
        </p>

        {/* Performance Metrics Display */}
        {coreWebVitals.metrics && (
          <div className="bg-teal-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-3">Current Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {coreWebVitals.metrics.lcp && (
                <div>
                  <span className="font-medium">LCP:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      coreWebVitals.metrics.ratings.lcp === "good"
                        ? "bg-green-100 text-green-800"
                        : coreWebVitals.metrics.ratings.lcp === "needs-improvement"
                          ? "bg-yellow-100 text-teal-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coreWebVitals.metrics.lcp.toFixed(0)}ms ({coreWebVitals.metrics.ratings.lcp})
                  </span>
                </div>
              )}
              {coreWebVitals.metrics.fid && (
                <div>
                  <span className="font-medium">FID:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      coreWebVitals.metrics.ratings.fid === "good"
                        ? "bg-green-100 text-green-800"
                        : coreWebVitals.metrics.ratings.fid === "needs-improvement"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coreWebVitals.metrics.fid.toFixed(0)}ms ({coreWebVitals.metrics.ratings.fid})
                  </span>
                </div>
              )}
              {coreWebVitals.metrics.cls !== undefined && (
                <div>
                  <span className="font-medium">CLS:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      coreWebVitals.metrics.ratings.cls === "good"
                        ? "bg-green-100 text-green-800"
                        : coreWebVitals.metrics.ratings.cls === "needs-improvement"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coreWebVitals.metrics.cls.toFixed(3)} ({coreWebVitals.metrics.ratings.cls})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Optimization Recommendations */}
        {coreWebVitals.getOptimizations().length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              Optimization Recommendations
            </h3>
            <ul className="space-y-1 text-sm text-amber-700">
              {coreWebVitals.getOptimizations().map((optimization, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{optimization}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Demo Controls */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Demo Controls</h2>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAddImages} variant="outline" disabled={isLoading}>
              Add Images (LCP Test)
            </Button>

            <Button onClick={handleSimulateSlowTask} variant="outline" disabled={isLoading}>
              {isLoading ? "Processing..." : "Simulate Slow Task (FID Test)"}
            </Button>

            <Button onClick={handleLayoutShiftDemo} variant="outline" disabled={isLoading}>
              Toggle Layout Shift (CLS Test)
            </Button>
          </div>
        </div>
      </Card>

      {/* CLS Prevention Demo */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">CLS Prevention with Reserved Space</h2>
        <p className="text-teal-600 mb-4">
          Images below use aspect-ratio CSS to prevent layout shifts during loading.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: imageCount }, (_, index) => (
            <div
              key={index}
              style={clsPreventionStyles}
              className="bg-teal-100 rounded-lg overflow-hidden"
            >
              <OptimizedImage
                src={`https://picsum.photos/400/300?random=${index + 1}`}
                alt={`Demo image ${index + 1}`}
                width={400}
                height={300}
                className="w-full h-full object-cover"
                enableCoreWebVitals={true}
                componentName="CoreWebVitalsExample"
                isLCPCandidate={index === 0} // First image is LCP candidate
                priority={index === 0}
                onLoad={() =>
                  handleImageLoad(`demo-image-${index}`, performance.now(), index === 0)
                }
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Layout Shift Demo */}
      {layoutShiftDemo && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Layout Shift Detected!</h2>
          <p className="text-red-700">
            This content appeared without reserved space, causing a layout shift. In production,
            this would negatively impact CLS scores.
          </p>
        </Card>
      )}

      {/* Technical Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Optimization Techniques Implemented</h2>
        <div className="space-y-3 text-sm">
          <div>
            <h3 className="font-medium text-teal-900">Cumulative Layout Shift (CLS) Prevention:</h3>
            <p className="text-teal-600">• Reserved space for images using aspect-ratio CSS</p>
            <p className="text-teal-600">• Explicit dimensions for all media elements</p>
            <p className="text-teal-600">• Skeleton screens for loading states</p>
          </div>

          <div>
            <h3 className="font-medium text-teal-900">
              Largest Contentful Paint (LCP) Optimization:
            </h3>
            <p className="text-teal-600">• Priority loading for above-the-fold images</p>
            <p className="text-teal-600">• Optimized image formats and sizes</p>
            <p className="text-teal-600">• Preload hints for critical resources</p>
          </div>

          <div>
            <h3 className="font-medium text-teal-900">First Input Delay (FID) Optimization:</h3>
            <p className="text-teal-600">• Debounced and throttled event handlers</p>
            <p className="text-teal-600">• JavaScript execution time measurement</p>
            <p className="text-teal-600">• Task yielding for long operations</p>
          </div>

          <div>
            <h3 className="font-medium text-teal-900">Performance Monitoring:</h3>
            <p className="text-teal-600">• Real-time Core Web Vitals tracking</p>
            <p className="text-teal-600">• Automatic optimization recommendations</p>
            <p className="text-teal-600">• Integration with global performance monitoring</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
