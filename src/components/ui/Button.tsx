import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/accessibility/hooks";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "sm" | "default" | "lg" | "icon";
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Button({
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
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseStyles = cn(
    "inline-flex items-center justify-center font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "relative overflow-hidden",
    // High contrast mode support
    "high-contrast:border-2 high-contrast:border-current"
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
    sm: "px-3 py-1.5 text-sm rounded-md min-h-[2rem] font-medium",
    default: "px-4 py-2 text-sm rounded-md min-h-[2.5rem] font-medium",
    lg: "px-8 py-3 text-base rounded-md min-h-[3rem] font-medium",
    icon: "h-9 w-9 rounded-md",
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
