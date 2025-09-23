import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Input({
  label,
  error,
  helpText,
  icon,
  iconPosition = "left",
  className,
  id,
  required,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  const baseStyles = cn(
    "block w-full rounded-md border border-stone-300 px-3 py-2",
    "text-stone-900 placeholder-stone-500 bg-white",
    "focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20 focus:outline-none",
    "disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed disabled:border-stone-200",
    "transition-all duration-200 ease-in-out",
    "shadow-sm focus:shadow-md",
    "font-normal text-sm leading-normal",
    // High contrast mode support
    "high-contrast:border-2 high-contrast:border-ButtonText",
    "high-contrast:focus:border-Highlight high-contrast:focus:ring-Highlight"
  );

  const errorStyles = error
    ? "border-error-500 focus:border-error-500 focus:ring-error-500/20 bg-error-50/30"
    : "";

  const iconStyles = icon ? (iconPosition === "left" ? "pl-10" : "pr-10") : "";

  return (
    <div className="space-y-1">
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-stone-700">
          {label}
          {required && (
            <span className="text-error-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-stone-400" aria-hidden="true">
              {icon}
            </span>
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          className={cn(baseStyles, errorStyles, iconStyles, className)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={cn(errorId, helpId).trim() || undefined}
          aria-required={required}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-stone-400" aria-hidden="true">
              {icon}
            </span>
          </div>
        )}
      </div>

      {/* Help Text */}
      {helpText && (
        <p id={helpId} className="text-sm text-stone-600">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={errorId} className="text-sm text-error-600 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
