"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  type EnhancedValidationError,
  type ErrorRecoveryStrategy,
  ValidationErrorSeverity,
  WREATH_VALIDATION_MESSAGES,
} from "@/lib/validation/wreath";

interface ValidationErrorDisplayProps {
  errors: EnhancedValidationError[];
  recoveryStrategies?: ErrorRecoveryStrategy[];
  locale?: string;
  onRecovery?: (errorIndex: number, strategy: ErrorRecoveryStrategy) => void;
  onRetry?: () => void;
  onApplyFallback?: () => void;
  fallbackAvailable?: boolean;
  className?: string;
}

export function ValidationErrorDisplay({
  errors,
  recoveryStrategies = [],
  locale = "cs",
  onRecovery,
  onRetry,
  onApplyFallback,
  fallbackAvailable = false,
  className = "",
}: ValidationErrorDisplayProps) {
  const t = useTranslations("product.validation");
  const [recoveryInProgress, setRecoveryInProgress] = useState<string | null>(null);
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());

  const messages = WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES];

  // Handle error recovery
  const handleRecovery = useCallback(
    async (errorIndex: number, strategy: ErrorRecoveryStrategy) => {
      const error = errors[errorIndex];
      if (!error || recoveryInProgress) return;

      setRecoveryInProgress(error.code);

      try {
        if (onRecovery) {
          await onRecovery(errorIndex, strategy);
        }

        // Mark error as dismissed after successful recovery
        setDismissedErrors((prev) => new Set([...prev, error.code]));
      } catch (recoveryError) {
        console.error("Recovery failed:", recoveryError);
      } finally {
        setRecoveryInProgress(null);
      }
    },
    [errors, recoveryInProgress, onRecovery]
  );

  // Dismiss error manually
  const dismissError = useCallback((errorCode: string) => {
    setDismissedErrors((prev) => new Set([...prev, errorCode]));
  }, []);

  // Filter out dismissed errors
  const visibleErrors = errors.filter((error) => !dismissedErrors.has(error.code));

  if (visibleErrors.length === 0) {
    return null;
  }

  // Group errors by severity
  const errorsByType = visibleErrors.reduce(
    (acc, error, index) => {
      const key = error.severity;
      if (!acc[key]) acc[key] = [];
      const strategy = recoveryStrategies[index];
      acc[key].push({
        error,
        index,
        ...(strategy !== undefined && { strategy }),
      });
      return acc;
    },
    {} as Record<
      ValidationErrorSeverity,
      Array<{ error: EnhancedValidationError; index: number; strategy?: ErrorRecoveryStrategy }>
    >
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Critical Errors */}
      {errorsByType[ValidationErrorSeverity.ERROR] && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-red-600 rounded-full" />
              </div>
              <div className="flex-1 space-y-3">
                <h4 className="text-sm font-medium text-red-800">{t("title")}</h4>

                {errorsByType[ValidationErrorSeverity.ERROR].map(({ error, index, strategy }) => (
                  <div key={error.code} className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-red-700 flex-1">• {error.message}</p>
                      <button
                        onClick={() => dismissError(error.code)}
                        className="text-red-400 hover:text-red-600 text-xs"
                        aria-label="Dismiss error"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Recovery Actions */}
                    {strategy?.canRecover && (
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecovery(index, strategy)}
                          disabled={recoveryInProgress === error.code}
                          className="text-xs bg-white border-red-300 text-red-700 hover:bg-red-50"
                        >
                          {recoveryInProgress === error.code ? (
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                              {messages.tryAgain}...
                            </span>
                          ) : (
                            strategy.recoveryMessage
                          )}
                        </Button>

                        {strategy.recoveryAction === "contact_support" && (
                          <span className="text-xs text-red-600">{messages.fallbackMessage}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Global Recovery Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-red-200">
                  {onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      className="text-xs bg-white border-red-300 text-red-700 hover:bg-red-50"
                    >
                      {messages.tryAgain}
                    </Button>
                  )}

                  {fallbackAvailable && onApplyFallback && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onApplyFallback}
                      className="text-xs bg-white border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Use Safe Configuration
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {errorsByType[ValidationErrorSeverity.WARNING] && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-amber-600 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-medium text-amber-800">{t("warnings")}</h4>

                {errorsByType[ValidationErrorSeverity.WARNING].map(({ error, index, strategy }) => (
                  <div key={error.code} className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-amber-700 flex-1">• {error.message}</p>
                      <button
                        onClick={() => dismissError(error.code)}
                        className="text-amber-400 hover:text-amber-600 text-xs"
                        aria-label="Dismiss warning"
                      >
                        ✕
                      </button>
                    </div>

                    {strategy?.canRecover && (
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecovery(index, strategy)}
                          disabled={recoveryInProgress === error.code}
                          className="text-xs bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          {recoveryInProgress === error.code ? (
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                              Fixing...
                            </span>
                          ) : (
                            strategy.recoveryMessage
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Messages */}
      {errorsByType[ValidationErrorSeverity.INFO] && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-medium text-blue-800">Information</h4>

                {errorsByType[ValidationErrorSeverity.INFO].map(({ error }) => (
                  <div key={error.code} className="flex items-start justify-between gap-3">
                    <p className="text-sm text-blue-700 flex-1">• {error.message}</p>
                    <button
                      onClick={() => dismissError(error.code)}
                      className="text-blue-400 hover:text-blue-600 text-xs"
                      aria-label="Dismiss info"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ValidationErrorDisplay;
