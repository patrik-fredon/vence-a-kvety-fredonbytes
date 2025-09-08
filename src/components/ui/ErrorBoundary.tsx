'use client';

import { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
}

export function ErrorFallback({
  error,
  onRetry,
  title = 'Něco se pokazilo',
  message = 'Omlouváme se, došlo k neočekávané chybě. Zkuste to prosím znovu.',
  showRetry = true
}: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon className="w-8 h-8 text-error" />
        </div>

        <h2 className="text-elegant text-xl font-semibold text-neutral-800 mb-3">
          {title}
        </h2>

        <p className="text-neutral-600 mb-6 leading-relaxed">
          {message}
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700">
              Zobrazit technické detaily
            </summary>
            <pre className="mt-2 p-3 bg-neutral-100 rounded text-xs text-neutral-700 overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}

        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Zkusit znovu</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function PageErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-memorial flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-elegant p-8 max-w-md mx-auto">
        <ErrorFallback
          error={error}
          onRetry={onRetry}
          title="Stránka se nepodařila načíst"
          message="Omlouváme se, při načítání stránky došlo k chybě. Zkuste obnovit stránku nebo se vraťte později."
        />
      </div>
    </div>
  );
}

export function ComponentErrorFallback({ error, onRetry, className = '' }: ErrorFallbackProps & { className?: string }) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-lg p-6 ${className}`}>
      <ErrorFallback
        error={error}
        onRetry={onRetry}
        title="Komponenta se nepodařila načíst"
        message="Při načítání této části stránky došlo k chybě."
      />
    </div>
  );
}

// Hook for handling async errors in components
export function useErrorHandler() {
  return (error: Error) => {
    console.error('Async error caught:', error);
    // In a real app, you might want to send this to an error reporting service
    throw error; // Re-throw to trigger error boundary
  };
}
