import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { useReducedMotion } from "@/lib/accessibility/hooks";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "sm" | "default" | "lg" | "icon";
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  children,
  className,
  variant = "default",
  size = "default",
  loading = false,
  loadingText,
  icon,
  iconPosition = "left",
  disabled,
  ...props
}, ref) {
  const prefersReducedMotion = useReducedMotion();

  const baseStyles = cn(
    // Mobile-first: Base styles for mobile
    "inline-flex items-center justify-center font-medium",
    // Touch-friendly minimum height (44px) for mobile
    "min-h-11 min-w-11",
    // Mobile-first transitions and focus states
    "transition-colors duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2",
    // Touch-friendly active states
    "active:scale-95 active:transition-transform active:duration-75",
    "disabled:pointer-events-none disabled:opacity-50",
    "relative overflow-hidden",
    // High contrast mode support
    "high-contrast:border-2 high-contrast:border-current",
    // Responsive text sizing
    "text-sm sm:text-sm md:text-base",
    // Responsive padding - mobile first
    "px-4 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3"
  );

  const variants = {
    default: cn(
      "bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-700",
      "shadow-sm hover:shadow-md transition-all duration-200",
      "focus-visible:ring-stone-950/20",
      "high-contrast:bg-ButtonText high-contrast:text-ButtonFace",
      "high-contrast:border-ButtonText high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
    ),
    destructive: cn(
      "bg-error-600 text-white hover:bg-error-700 active:bg-error-800",
      "shadow-sm hover:shadow-md transition-all duration-200",
      "focus-visible:ring-error-500/20",
      "high-contrast:bg-ButtonText high-contrast:text-ButtonFace",
      "high-contrast:border-ButtonText high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
    ),
    outline: cn(
      "border border-stone-300 text-stone-700 bg-white",
      "hover:bg-stone-50 active:bg-stone-100",
      "shadow-sm hover:shadow-md transition-all duration-200",
      "focus-visible:ring-stone-950/20",
      "high-contrast:border-ButtonText high-contrast:text-ButtonText",
      "high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
    ),
    secondary: cn(
      "bg-stone-100 text-stone-900 hover:bg-stone-200 active:bg-stone-300",
      "shadow-sm hover:shadow-md transition-all duration-200",
      "focus-visible:ring-stone-950/20",
      "high-contrast:bg-ButtonText high-contrast:text-ButtonFace",
      "high-contrast:border-ButtonText high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
    ),
    ghost: cn(
      "text-stone-700 bg-transparent hover:bg-stone-100 active:bg-stone-200",
      "transition-all duration-200",
      "focus-visible:ring-stone-950/20",
      "high-contrast:text-ButtonText high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
    ),
    link: cn(
      "text-stone-900 bg-transparent hover:text-amber-600 active:text-amber-700",
      "underline-offset-4 hover:underline transition-all duration-200",
      "focus-visible:ring-stone-950/20",
      "high-contrast:text-ButtonText high-contrast:hover:text-Highlight"
    ),
  };

  const sizes = {
    // Mobile-first sizing with responsive adjustments
    sm: cn(
      "px-3 py-1.5 text-xs rounded-md min-h-9", // 36px min height for small
      "sm:px-3 sm:py-1.5 sm:text-sm",
      "md:px-4 md:py-2 md:text-sm",
      "font-medium"
    ),
    default: cn(
      "px-4 py-2 text-sm rounded-md min-h-11", // 44px min height (touch-friendly)
      "sm:px-4 sm:py-2 sm:text-sm",
      "md:px-6 md:py-3 md:text-base",
      "font-medium"
    ),
    lg: cn(
      "px-6 py-3 text-base rounded-lg min-h-12", // 48px min height for large
      "sm:px-6 sm:py-3 sm:text-base",
      "md:px-8 md:py-4 md:text-lg",
      "lg:px-10 lg:py-5 lg:text-xl",
      "font-medium"
    ),
    icon: cn(
      "h-11 w-11 rounded-md", // 44px for touch-friendly icon buttons
      "sm:h-10 sm:w-10",
      "md:h-9 md:w-9"
    ),
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-describedby={loading ? `${props.id}-loading` : undefined}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <>
          <svg
            className={cn(
              "h-4 w-4",
              children || loadingText ? "mr-2" : "",
              !prefersReducedMotion && "animate-spin"
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {/* Screen reader loading text */}
          <span className="sr-only" id={`${props.id}-loading`}>
            {loadingText || "Načítání..."}
          </span>
        </>
      )}

      {/* Icon - left position */}
      {!loading && icon && iconPosition === "left" && (
        <span className={cn("flex-shrink-0", children ? "mr-2" : "")}>
          {icon}
        </span>
      )}

      {/* Content */}
      {loading && loadingText ? loadingText : children}

      {/* Icon - right position */}
      {!loading && icon && iconPosition === "right" && (
        <span className={cn("flex-shrink-0", children ? "ml-2" : "")}>
          {icon}
        </span>
      )}
    </button>
  );
});
