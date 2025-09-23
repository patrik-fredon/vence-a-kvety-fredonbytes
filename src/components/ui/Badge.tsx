import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "secondary" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  const variants = {
    default: cn("bg-primary-100 text-primary-800 border-primary-200", "hover:bg-primary-200"),
    secondary: cn(
      "bg-secondary-100 text-secondary-800 border-secondary-200",
      "hover:bg-secondary-200"
    ),
    success: cn("bg-success-100 text-success-800 border-success-200", "hover:bg-success-200"),
    warning: cn("bg-warning-100 text-warning-800 border-warning-200", "hover:bg-warning-200"),
    error: cn("bg-error-100 text-error-800 border-error-200", "hover:bg-error-200"),
    outline: cn("bg-transparent text-neutral-700 border-neutral-300", "hover:bg-neutral-50"),
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-sm font-medium",
    lg: "px-3 py-1.5 text-base font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border transition-colors duration-200",
        "font-sans antialiased",
        variants[variant],
        sizes[size],
        // High contrast support
        "high-contrast:border-2 high-contrast:border-WindowText high-contrast:text-WindowText",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
