"use client";

import { Component, ReactNode } from "react";
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { logError } from "@/lib/monitoring/error-logger";
import { getErrorMessage } from "@/lib/monitoring/error-messages";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  level?: 'page' | 'component' | 'critical';
  context?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const { level = 'component', context } = this.props;

    // Log error with context
    logError(error, {
      errorInfo,
      level,
      context,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;

      if (level === 'page') {
        return <PageErrorFallback error={this.state.error} onRetry={this.handleRetry} errorId={this.state.errorId} />;
      }

      if (level === 'critical') {
        return <CriticalErrorFallback error={this.state.error} errorId={this.state.errorId} />;
      }

      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} errorId={this.state.errorId} />;
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
  errorId?: string;
  showContactSupport?: boolean;
  recoveryActions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

export function ErrorFallback({
  error,
  onRetry,
  title,
  message,
  showRetry = true,
  errorId,
  showContactSupport = false,
  recoveryActions = [],
}: ErrorFallbackProps) {
  // Get enhanced error message if title/message not provided
  const errorMessage = (!title || !message) ? getErrorMessage(error || new Error('Unknown error')) : null;

  const finalTitle = title || errorMessage?.title || "Něco se pokazilo";
  const finalMessage = message || errorMessage?.message || "Omlouváme se, došlo k neočekávané chybě. Zkuste to prosím znovu.";
  const finalRecoveryActions = recoveryActions.length > 0 ? recoveryActions : (errorMessage?.recoveryActions || []);
  const finalShowContactSupport = showContactSupport || errorMessage?.contactSupport || false;

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Chyba na webu - ${errorId || 'neznámé ID'}`);
    const body = encodeURIComponent(`Dobrý den,\n\nnarazil jsem na chybu na vašem webu.\n\nID chyby: ${errorId || 'neznámé'}\nČas: ${new Date().toLocaleString('cs-CZ')}\nStránka: ${window.location.href}\n\nPopis problému:\n[Popište prosím, co jste dělali, když se chyba objevila]\n\nDěkuji`);
    window.open(`mailto:podpora@pohrebni-vence.cz?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8" role="alert">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon className="w-8 h-8 text-error" />
        </div>

        <h2 className="text-elegant text-xl font-semibold text-neutral-800 mb-3">{finalTitle}</h2>

        <p className="text-neutral-600 mb-6 leading-relaxed">{finalMessage}</p>

        {errorId && (
          <p className="text-xs text-neutral-500 mb-4 font-mono bg-neutral-50 px-2 py-1 rounded">
            ID chyby: {errorId}
          </p>
        )}

        {process.env.NODE_ENV === "development" && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700">
              Zobrazit technické detaily
            </summary>
            <pre className="mt-2 p-3 bg-neutral-100 rounded text-xs text-neutral-700 overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Zkusit znovu</span>
            </button>
          )}

          {finalRecoveryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${action.primary
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              <span>{action.label}</span>
            </button>
          ))}

          {finalShowContactSupport && (
            <button
              onClick={handleContactSupport}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>Kontaktovat podporu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PageErrorFallback({ error, onRetry, errorId }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-memorial flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-elegant p-8 max-w-md mx-auto">
        <ErrorFallback
          error={error}
          onRetry={onRetry}
          errorId={errorId}
          title="Stránka se nepodařila načíst"
          message="Omlouváme se, při načítání stránky došlo k chybě. Zkuste obnovit stránku nebo se vraťte na hlavní stránku."
          showContactSupport={true}
          recoveryActions={[
            {
              label: "Obnovit stránku",
              action: handleRefreshPage,
              icon: ArrowPathIcon,
            },
            {
              label: "Hlavní stránka",
              action: handleGoHome,
              icon: HomeIcon,
            },
          ]}
        />
      </div>
    </div>
  );
}

export function ComponentErrorFallback({
  error,
  onRetry,
  errorId,
  className = "",
}: ErrorFallbackProps & { className?: string }) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-lg p-6 ${className}`}>
      <ErrorFallback
        error={error}
        onRetry={onRetry}
        errorId={errorId}
        title="Komponenta se nepodařila načíst"
        message="Při načítání této části stránky došlo k chybě."
      />
    </div>
  );
}

export function CriticalErrorFallback({ error, errorId }: ErrorFallbackProps) {
  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Kritická chyba - ${errorId || 'neznámé ID'}`);
    const body = encodeURIComponent(`Dobrý den,\n\nnarazil jsem na kritickou chybu na vašem webu.\n\nID chyby: ${errorId || 'neznámé'}\nČas: ${new Date().toLocaleString('cs-CZ')}\nStránka: ${window.location.href}\n\nDěkuji za rychlé vyřešení.`);
    window.open(`mailto:podpora@pohrebni-vence.cz?subject=${subject}&body=${body}`);
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border-2 border-red-200 p-8 max-w-lg mx-auto">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-red-800 mb-4">Kritická chyba</h1>

          <p className="text-red-700 mb-6 leading-relaxed">
            Omlouváme se, došlo ke kritické chybě, která znemožňuje pokračování.
            Prosím kontaktujte naši podporu nebo se vraťte na hlavní stránku.
          </p>

          {errorId && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-600 font-medium">ID chyby pro podporu:</p>
              <p className="text-xs font-mono text-red-800 mt-1">{errorId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleContactSupport}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <PhoneIcon className="w-5 h-5" />
              <span>Kontaktovat podporu</span>
            </button>

            <button
              onClick={handleGoHome}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Hlavní stránka</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for handling async errors in components
export function useErrorHandler() {
  return (error: Error) => {
    console.error("Async error caught:", error);
    // In a real app, you might want to send this to an error reporting service
    throw error; // Re-throw to trigger error boundary
  };
}
