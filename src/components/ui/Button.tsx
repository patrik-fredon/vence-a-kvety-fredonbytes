import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/accessibility/hooks";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  icon,
  iconPosition = "left",
  disabled,
  ...props
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseStyles = cn(
    "inline-flex items-center justify-center font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "relative overflow-hidden",
    // High contrast mode support
    "high-contrast:border-2 high-contrast:border-current"
  );

  const variants = {
    primary: cn(
      "bg-primary-600 text-white hover:bg-primary-700 shadow-soft",
      "high-contrast:bg-ButtonText high-contrast:text-ButtonFace",
      "high-contrast:border-ButtonText high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
    ),
    secondary: cn(
      "bg-secondary-600 text-white hover:bg-secondary-700 shadow-soft",
      "high-contrast:bg-ButtonText high-contrast:text-ButtonFace",
      "high-contrast:border-ButtonText high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
    ),
    outline: cn(
      "border-2 border-primary-600 text-primary-700 hover:bg-primary-50",
      "high-contrast:border-ButtonText high-contrast:text-ButtonText",
      "high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
    ),
    ghost: cn(
      "text-primary-700 hover:bg-primary-50",
      "high-contrast:text-ButtonText high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
    ),
    destructive: cn(
      "bg-red-600 text-white hover:bg-red-700 shadow-soft",
      "high-contrast:bg-ButtonText high-contrast:text-ButtonFace",
      "high-contrast:border-ButtonText high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
    ),
  };

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-md min-h-[2rem]",
    md: "px-4 py-2 text-base rounded-lg min-h-[2.5rem]",
    lg: "px-6 py-3 text-lg rounded-lg min-h-[3rem]",
  };

  const isDisabled = disabled || loading;

  return (
    <button
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

      {/* Left icon */}
      {!loading && icon && iconPosition === "left" && (
        <span className={cn("flex-shrink-0", children && "mr-2")} aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Button content */}
      <span className={loading ? "opacity-75" : ""}>
        {loading && loadingText ? loadingText : children}
      </span>

      {/* Right icon */}
      {!loading && icon && iconPosition === "right" && (
        <span className={cn("flex-shrink-0", children && "ml-2")} aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
}
