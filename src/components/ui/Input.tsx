import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useId } from "@/lib/accessibility/hooks";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    label,
    error,
    helperText,
    hideLabel = false,
    leftIcon,
    rightIcon,
    type = "text",
    id,
    required,
    ...props
  }, ref) => {
    const generatedId = useId('input');
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    const inputClasses = cn(
      "block w-full rounded-md border shadow-sm transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
      "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 disabled:border-neutral-200",
      "placeholder:text-neutral-400",
      // High contrast mode support
      "high-contrast:border-2 high-contrast:border-ButtonText",
      "high-contrast:focus:border-Highlight high-contrast:focus:ring-Highlight",
      // Base styling
      error
        ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
        : "border-neutral-300 text-neutral-900",
      // Icon padding
      leftIcon && "pl-10",
      rightIcon && "pr-10",
      // Default padding when no icons
      !leftIcon && !rightIcon && "px-3 py-2",
      leftIcon && !rightIcon && "pr-3 py-2",
      !leftIcon && rightIcon && "pl-3 py-2",
      leftIcon && rightIcon && "py-2",
      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium",
              error ? "text-red-700" : "text-neutral-700",
              hideLabel && "sr-only"
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="povinné pole">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-neutral-400" aria-hidden="true">
                {leftIcon}
              </span>
            </div>
          )}

          <input
            type={type}
            id={inputId}
            className={inputClasses}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-required={required}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-neutral-400" aria-hidden="true">
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {/* Helper text */}
        {helperText && !error && (
          <p
            id={helperId}
            className="text-sm text-neutral-500"
          >
            {helperText}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
