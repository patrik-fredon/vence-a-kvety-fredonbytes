/**
 * CTAButton - Call-to-Action Button Component
 *
 * A specialized button component designed for primary call-to-action elements.
 * Features modern design principles, enhanced visual feedback, and accessibility compliance.
 * Optimized for conversion with funeral-appropriate styling.
 */

import Link from "next/link";
import { Button } from "./Button";
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
  const ctaStyles = cn(
    // Modern design principles - Amber color scheme for funeral context
    "bg-amber-600 hover:bg-amber-700 active:bg-amber-800",
    "text-white font-medium",

    // Enhanced visual feedback and interactions
    "shadow-lg hover:shadow-xl",
    "transition-all duration-300 ease-in-out",
    "transform hover:scale-105 active:scale-95",

    // Accessibility and touch targets (minimum 44px)
    "min-h-[44px] min-w-[44px]",
    "focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",

    // High contrast mode support
    "high-contrast:bg-ButtonText high-contrast:text-ButtonFace",
    "high-contrast:border-2 high-contrast:border-ButtonText",

    // Responsive enhancements
    size === "lg" && "px-8 py-4 text-lg",
    size === "default" && "px-6 py-3 text-base",

    className
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link href={href} className="inline-block">
      <Button
        size={size}
        className={ctaStyles}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    </Link>
  );
}
