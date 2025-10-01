"use client";

import { Component, type ReactNode } from "react";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { logError } from "@/lib/monitoring/error-logger";

interface ProductComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface ProductErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  componentName?: string;
  errorId?: string;
}

/**
 * Specialized error boundary for product components with graceful degradation
 * Provides product-specific error handling and fallback UI
 */
export class ProductComponentErrorBoundary extends Component<
  ProductComponentErrorBoundaryProps,
  { hasError: boolean; error?: Error; errorId?: string }
> {
  constructor(props: ProductComponentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    const errorId = `product_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    const { componentName, onError } = this.props;

    // Log error with product-specific context
    logError(error, {
      errorInfo,
      level: "component",
      context: `product-component-${componentName || "unknown"}`,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      productComponent: componentName,
    });

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <ProductErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          componentName={this.props.componentName}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Product-specific error fallback component with appropriate styling
 */
export function ProductErrorFallback({
  error,
  onRetry,
  componentName,
  errorId,
}: ProductErrorFallbackProps) {
  return (
    <div
      className="bg-white border border-stone-200 rounded-lg p-6 text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
      </div>

      <h3 className="text-lg font-semibold text-stone-800 mb-2">
        Komponenta se nepodařila načíst
      </h3>

      <p className="text-stone-600 mb-4 text-sm">
        {componentName
          ? `Při načítání komponenty "${componentName}" došlo k chybě.`
          : "Při načítání této části produktu došlo k chybě."
        }
      </p>

      {errorId && (
        <p className="text-xs text-stone-500 mb-4 font-mono bg-stone-50 px-2 py-1 rounded">
          ID chyby: {errorId}
        </p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
          aria-label="Zkusit znovu načíst komponentu"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Zkusit znovu</span>
        </button>
      )}

      {process.env['NODE_ENV'] === "development" && error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-stone-500 hover:text-stone-700">
            Zobrazit technické detaily
          </summary>
          <pre className="mt-2 p-3 bg-stone-100 rounded text-xs text-stone-700 overflow-auto max-h-32">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Lightweight error fallback for product cards in grids
 */
export function ProductCardErrorFallback({
  error,
  onRetry,
  errorId,
}: ProductErrorFallbackProps) {
  return (
    <div
      className="bg-white border border-stone-200 rounded-lg p-4 h-96 flex flex-col items-center justify-center text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mb-3">
        <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
      </div>

      <h4 className="text-sm font-medium text-stone-800 mb-2">
        Produkt se nepodařilo načíst
      </h4>

      <p className="text-xs text-stone-600 mb-3">
        Při načítání tohoto produktu došlo k chybě.
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white text-xs rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
          aria-label="Zkusit znovu načíst produkt"
        >
          <ArrowPathIcon className="w-3 h-3" />
          <span>Zkusit znovu</span>
        </button>
      )}
    </div>
  );
}

/**
 * Minimal error fallback for product filters
 */
export function ProductFiltersErrorFallback({
  error,
  onRetry,
  errorId,
}: ProductErrorFallbackProps) {
  return (
    <div
      className="bg-white border border-stone-200 rounded-lg p-4 text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center space-x-2 mb-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
        <span className="text-sm font-medium text-stone-800">
          Filtry se nepodařilo načíst
        </span>
      </div>

      <p className="text-xs text-stone-600 mb-3">
        Při načítání filtrů došlo k chybě. Produkty jsou stále dostupné.
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white text-xs rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
          aria-label="Zkusit znovu načíst filtry"
        >
          <ArrowPathIcon className="w-3 h-3" />
          <span>Zkusit znovu</span>
        </button>
      )}
    </div>
  );
}

/**
 * Hook for wrapping product components with error boundaries
 */
export function withProductErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  fallbackComponent?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ProductComponentErrorBoundary
      componentName={componentName}
      fallbackComponent={fallbackComponent}
    >
      <Component {...props} />
    </ProductComponentErrorBoundary>
  );

  WrappedComponent.displayName = `withProductErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
