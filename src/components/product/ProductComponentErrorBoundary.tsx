"use client";

import { Component, type ReactNode } from "react";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@/lib/icons";

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
      errorId: this.state.errorId || "unknown",
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
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
          error={this.state.error || new Error("Unknown error")}
          onRetry={this.handleRetry}
          componentName={this.props.componentName || "Unknown"}
          errorId={this.state.errorId || "unknown"}
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
      className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] border border-stone-200 rounded-lg p-6 text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ExclamationTriangleIcon className="w-6 h-6 text-teal-600" />
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
        <p className="text-xs text-amber-100 mb-4 font-mono bg-teal-800 px-2 py-1 rounded">
          ID chyby: {errorId}
        </p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] hover:bg-stone-700 text-amber-100 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
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
          <pre className="mt-2 p-3 bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] rounded text-xs text-teal-900 overflow-auto max-h-32">
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
  error: _error,
  onRetry,
  errorId: _errorId,
}: ProductErrorFallbackProps) {
  return (
    <div
      className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] border border-stone-200 rounded-lg p-4 h-96 flex flex-col items-center justify-center text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mb-3">
        <ExclamationTriangleIcon className="w-4 h-4 text-teal-900" />
      </div>

      <h4 className="text-sm font-medium text-stone-800 mb-2">
        Produkt se nepodařilo načíst
      </h4>

      <p className="text-xs text-amber-100 mb-3">
        Při načítání tohoto produktu došlo k chybě.
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] hover:bg-stone-700 text-amber-100 text-xs rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
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
  error: _error,
  onRetry,
  errorId: _errorId,
}: ProductErrorFallbackProps) {
  return (
    <div
      className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] border border-stone-200 rounded-lg p-4 text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center space-x-2 mb-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-teal-900" />
        <span className="text-sm font-medium text-teal-800">
          Filtry se nepodařilo načíst
        </span>
      </div>

      <p className="text-xs text-teal-800 mb-3">
        Při načítání filtrů došlo k chybě. Produkty jsou stále dostupné.
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] hover:bg-teal-700 text-amber-100 text-xs rounded font-medium"
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
      componentName={componentName || "Unknown"}

/**
 * Specialized error boundary for product grid with grid-specific error handling
 */
export class ProductGridErrorBoundary extends Component<
  ProductComponentErrorBoundaryProps & { gridSize?: number },
  { hasError: boolean; error?: Error; errorId?: string }
> {
  constructor(props: ProductComponentErrorBoundaryProps & { gridSize?: number }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    const errorId = `grid_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    const { onError } = this.props;

    // Log error with grid-specific context
    logError(error, {
      errorInfo,
      level: "component",
      context: "product-grid",
      errorId: this.state.errorId || "unknown",
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      gridSize: this.props.gridSize,
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
        <ProductGridErrorFallback
          error={this.state.error || new Error("Unknown error")}
          onRetry={this.handleRetry}
          errorId={this.state.errorId || "unknown"}
          gridSize={this.props.gridSize}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error fallback specifically designed for product grid failures
 */
export function ProductGridErrorFallback({
  error,
  onRetry,
  errorId,
  gridSize,
}: ProductErrorFallbackProps & { gridSize?: number }) {
  return (
    <div
      className="bg-stone-50 border border-stone-200 rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center"
      role="alert"
      aria-live="polite"
    >
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ExclamationTriangleIcon className="w-8 h-8 text-teal-600" />
      </div>

      <h3 className="text-xl font-semibold text-stone-800 mb-3">
        Produkty se nepodařilo načíst
      </h3>

      <p className="text-stone-600 mb-6 max-w-md">
        Při načítání seznamu produktů došlo k chybě. Zkuste to prosím znovu nebo kontaktujte podporu.
      </p>

      {gridSize && (
        <p className="text-sm text-stone-500 mb-4">
          Očekávaný počet produktů: {gridSize}
        </p>
      )}

      {errorId && (
        <p className="text-xs text-stone-400 mb-6 font-mono bg-stone-100 px-3 py-2 rounded">
          ID chyby: {errorId}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            aria-label="Zkusit znovu načíst produkty"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Zkusit znovu</span>
          </button>
        )}

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-stone-600 hover:bg-stone-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
          aria-label="Obnovit stránku"
        >
          <span>Obnovit stránku</span>
        </button>
      </div>

      {process.env['NODE_ENV'] === "development" && error && (
        <details className="mt-6 text-left w-full max-w-2xl">
          <summary className="cursor-pointer text-sm text-stone-500 hover:text-stone-700">
            Zobrazit technické detaily
          </summary>
          <pre className="mt-3 p-4 bg-stone-100 rounded text-xs text-stone-800 overflow-auto max-h-40">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Specialized error boundary for navigation failures
 */
export class NavigationErrorBoundary extends Component<
  ProductComponentErrorBoundaryProps & { currentPath?: string },
  { hasError: boolean; error?: Error; errorId?: string }
> {
  constructor(props: ProductComponentErrorBoundaryProps & { currentPath?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    const errorId = `nav_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    const { onError } = this.props;

    // Log error with navigation-specific context
    logError(error, {
      errorInfo,
      level: "component",
      context: "navigation",
      errorId: this.state.errorId || "unknown",
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      currentPath: this.props.currentPath,
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
        <NavigationErrorFallback
          error={this.state.error || new Error("Unknown error")}
          onRetry={this.handleRetry}
          errorId={this.state.errorId || "unknown"}
          currentPath={this.props.currentPath}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error fallback for navigation failures
 */
export function NavigationErrorFallback({
  error,
  onRetry,
  errorId,
  currentPath,
}: ProductErrorFallbackProps & { currentPath?: string }) {
  return (
    <div
      className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
      </div>

      <h3 className="text-lg font-semibold text-amber-800 mb-2">
        Navigace se nezdařila
      </h3>

      <p className="text-amber-700 mb-4 text-sm">
        Při přechodu na požadovanou stránku došlo k chybě.
      </p>

      {currentPath && (
        <p className="text-xs text-amber-600 mb-4 font-mono bg-amber-100 px-2 py-1 rounded">
          Cesta: {currentPath}
        </p>
      )}

      {errorId && (
        <p className="text-xs text-amber-600 mb-4 font-mono bg-amber-100 px-2 py-1 rounded">
          ID chyby: {errorId}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            aria-label="Zkusit znovu"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Zkusit znovu</span>
          </button>
        )}

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
          aria-label="Zpět"
        >
          <span>Zpět</span>
        </button>
      </div>

      {process.env['NODE_ENV'] === "development" && error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-amber-600 hover:text-amber-800">
            Zobrazit technické detaily
          </summary>
          <pre className="mt-2 p-3 bg-amber-100 rounded text-xs text-amber-800 overflow-auto max-h-32">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Specialized error boundary for image loading failures
 */
export class ImageErrorBoundary extends Component<
  ProductComponentErrorBoundaryProps & { imageSrc?: string },
  { hasError: boolean; error?: Error; errorId?: string }
> {
  constructor(props: ProductComponentErrorBoundaryProps & { imageSrc?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    const errorId = `img_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    const { onError } = this.props;

    // Log error with image-specific context
    logError(error, {
      errorInfo,
      level: "component",
      context: "image-loading",
      errorId: this.state.errorId || "unknown",
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      imageSrc: this.props.imageSrc,
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
        <ImageErrorFallback
          error={this.state.error || new Error("Unknown error")}
          onRetry={this.handleRetry}
          errorId={this.state.errorId || "unknown"}
          imageSrc={this.props.imageSrc}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error fallback for image loading failures
 */
export function ImageErrorFallback({
  error: _error,
  onRetry,
  errorId: _errorId,
  imageSrc,
}: ProductErrorFallbackProps & { imageSrc?: string }) {
  return (
    <div
      className="bg-stone-100 border border-stone-200 rounded-lg flex flex-col items-center justify-center p-4 aspect-square"
      role="img"
      aria-label="Obrázek se nepodařilo načíst"
    >
      <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center mb-2">
        <ExclamationTriangleIcon className="w-4 h-4 text-stone-500" />
      </div>

      <p className="text-xs text-stone-600 text-center mb-2">
        Obrázek se nepodařilo načíst
      </p>

      {imageSrc && (
        <p className="text-xs text-stone-400 text-center mb-3 truncate max-w-full">
          {imageSrc}
        </p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center space-x-1 px-2 py-1 bg-stone-600 hover:bg-stone-700 text-white text-xs rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
          aria-label="Zkusit znovu načíst obrázek"
        >
          <ArrowPathIcon className="w-3 h-3" />
          <span>Znovu</span>
        </button>
      )}
    </div>
  );
}
      fallbackComponent={fallbackComponent}
    >
      <Component {...props} />
    </ProductComponentErrorBoundary>
  );

  WrappedComponent.displayName = `withProductErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
