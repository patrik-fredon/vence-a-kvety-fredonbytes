"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ProductCardErrorFallback,
  ProductComponentErrorBoundary,
  withProductErrorBoundary,
} from "./ProductComponentErrorBoundary";
import { useProductErrorHandler } from "./useProductErrorHandler";

/**
 * Utility components for testing error scenarios and demonstrating graceful degradation
 * These should only be used in development/testing environments
 */

interface ErrorTestingProps {
  onError?: (error: Error) => void;
}

// Component that throws synchronous errors
const SyncErrorComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Synchronous error in product component");
  }
  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded">
      <p>✅ Component loaded successfully</p>
    </div>
  );
};

// Component that throws async errors
const AsyncErrorComponent = ({ onError }: ErrorTestingProps) => {
  const { handleAsyncError } = useProductErrorHandler();
  const [loading, setLoading] = useState(false);

  const triggerAsyncError = async () => {
    setLoading(true);
    try {
      // Simulate async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Async operation failed")), 1000);
      });
    } catch (error) {
      const errorId = handleAsyncError(error as Error, {
        componentName: "AsyncErrorComponent",
        action: "async-operation",
      });
      onError?.(error as Error);
      console.log("Error logged with ID:", errorId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded">
      <p>Async Error Testing Component</p>
      <Button onClick={triggerAsyncError} disabled={loading} className="mt-2">
        {loading ? "Processing..." : "Trigger Async Error"}
      </Button>
    </div>
  );
};

// Component that simulates network errors
const NetworkErrorComponent = () => {
  const { handleAsyncError } = useProductErrorHandler();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");

  const simulateNetworkError = async () => {
    setStatus("loading");
    try {
      // Simulate network request
      const response = await fetch("/api/products/nonexistent");
      if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }
      setStatus("success");
    } catch (error) {
      handleAsyncError(error as Error, {
        componentName: "NetworkErrorComponent",
        action: "fetch-products",
      });
      setStatus("error");
    }
  };

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
      <p>Network Error Testing Component</p>
      <p>Status: {status}</p>
      <Button onClick={simulateNetworkError} disabled={status === "loading"} className="mt-2">
        {status === "loading" ? "Loading..." : "Simulate Network Error"}
      </Button>
    </div>
  );
};

// Component that simulates product card errors
const ProductCardErrorSimulator = () => {
  const [shouldError, setShouldError] = useState(false);

  const FakeProductCard = () => {
    if (shouldError) {
      throw new Error("Product card rendering error");
    }
    return (
      <div className="h-96 bg-white border border-stone-200 rounded-lg p-4 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-stone-200 rounded mb-4" />
        <h3 className="font-semibold mb-2">Sample Product</h3>
        <p className="text-stone-600 text-sm mb-4">Product description</p>
        <Button size="sm">Add to Cart</Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => setShouldError(!shouldError)}
          variant={shouldError ? "destructive" : "default"}
        >
          {shouldError ? "Fix Product Card" : "Break Product Card"}
        </Button>
        <span className="text-sm text-stone-600">
          Status: {shouldError ? "Error Mode" : "Normal Mode"}
        </span>
      </div>

      <ProductComponentErrorBoundary
        componentName="ProductCard"
        fallbackComponent={<ProductCardErrorFallback />}
      >
        <FakeProductCard />
      </ProductComponentErrorBoundary>
    </div>
  );
};

// Main error testing dashboard
export function ErrorTestingDashboard() {
  const [errorLog, setErrorLog] = useState<Array<{ timestamp: Date; error: Error }>>([]);

  const handleError = (error: Error) => {
    setErrorLog((prev) => [...prev, { timestamp: new Date(), error }]);
  };

  const clearErrorLog = () => {
    setErrorLog([]);
  };

  if (process.env.NODE_ENV === "production") {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <p className="text-red-800 font-semibold">
          Error testing utilities are not available in production
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Product Component Error Testing Dashboard</h2>
        <p className="text-stone-600 mb-6">
          This dashboard allows you to test various error scenarios and observe how the error
          boundaries handle them.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Synchronous Error Testing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Synchronous Errors</h3>
            <ProductComponentErrorBoundary componentName="SyncErrorTest" onError={handleError}>
              <SyncErrorComponent shouldThrow={true} />
            </ProductComponentErrorBoundary>
          </div>

          {/* Async Error Testing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Asynchronous Errors</h3>
            <AsyncErrorComponent onError={handleError} />
          </div>

          {/* Network Error Testing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Network Errors</h3>
            <NetworkErrorComponent />
          </div>

          {/* Product Card Error Testing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Card Errors</h3>
            <ProductCardErrorSimulator />
          </div>
        </div>

        {/* Error Log */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Error Log ({errorLog.length})</h3>
            <Button onClick={clearErrorLog} variant="outline" size="sm">
              Clear Log
            </Button>
          </div>

          {errorLog.length > 0 ? (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              {errorLog.map((entry, index) => (
                <div key={index} className="mb-2 pb-2 border-b border-stone-200 last:border-b-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-red-600">{entry.error.message}</span>
                    <span className="text-stone-500">{entry.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-center text-stone-500">
              No errors logged yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// HOC demonstration
const TestComponentWithHOC = withProductErrorBoundary(() => {
  throw new Error("HOC wrapped component error");
}, "HOCTestComponent");

export function HOCErrorTest() {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Higher-Order Component Error Test</h3>
      <TestComponentWithHOC />
    </div>
  );
}
