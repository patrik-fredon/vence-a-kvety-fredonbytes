/**
 * CTAButton - Call-to-Action Button Component
 *
 * A specialized button component designed for primary call-to-action elements.
 * Features modern design principles, enhanced visual feedback, and accessibility compliance.
 * Optimized for conversion with funeral-appropriate styling.
 */

import Link from "next/link";
import { useReducedMotion } from "@/lib/accessibility/hooks";
import { cn } from "@/lib/utils";


interface CTAButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Destination URL for navigation */
  href: string;
  /** Additional CSS classes */
  className?: string;
  /** Button size variant */
  size?: "default" | "lg";
  /** Disabled state */
  disabled?: boolean;
  /** Click handler for additional functionality */
  onClick?: () => void;
}

export function CTAButton({
  children,
  href,
  className,
  size = "lg",
  disabled = false,
  onClick,
  ...props
}: CTAButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const ctaStyles = cn(
    // Modern design principles - Amber color scheme for funeral context
    "bg-amber-600 hover:bg-amber-700 active:bg-amber-800",
    "text-white font-medium",

    // Enhanced visual feedback and interactions with exact 300ms timing
    "shadow-lg hover:shadow-xl",
    "transition-all duration-300 ease-in-out",

    // Conditional animations based on motion preferences
    !prefersReducedMotion && "transform hover:scale-105 active:scale-95",
    prefersReducedMotion && "hover:shadow-md", // Reduced effect for motion-sensitive users

    // Accessibility and touch targets (minimum 44px)
    "min-h-[44px] min-w-[44px]",
    "focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
    "focus:outline-none",

    // Enhanced keyboard navigation
    "focus-visible:ring-4 focus-visible:ring-amber-300 focus-visible:ring-opacity-75",

    // High contrast mode support
    "high-contrast:bg-ButtonText high-contrast:text-ButtonFace",
    "high-contrast:border-2 high-contrast:border-ButtonText",

    // Disabled state accessibility
    disabled && "opacity-50 cursor-not-allowed focus:ring-0",
    disabled && "hover:scale-100 hover:shadow-lg", // Disable hover effects when disabled

    // Responsive enhancements
    size === "lg" && "px-8 py-4 text-lg",
    size === "default" && "px-6 py-3 text-base",

    className
  );

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Enhanced keyboard interaction
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!disabled && onClick) {
        onClick();
      }
    }
  };

  return (
    <Link
      href={href}
      className="inline-block"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      {...props}
    >
      <button
        type="button"
        className={ctaStyles}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={typeof children === "string" ? children : undefined}
      >
        {children}
      </button>
    </Link>
  );
}
