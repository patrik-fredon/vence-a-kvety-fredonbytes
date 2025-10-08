import type * as React from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  className?: string;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  interactive = false,
  className,
  onClick,
  ...props
}: CardProps) {
  const variants = {
    default: cn("bg-teal-900 border border-amber-200", "shadow-2xl"),
    outlined: cn("bg-teal-900 border border-amber-200", "shadow-2xl"),
    elevated: cn("bg-teal-900 border border-amber-200", "shadow-md"),
  };

  const paddings = {
    none: "p-0",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  };

  const interactiveStyles = interactive
    ? cn(
        "cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/20",
        "active:translate-y-0"
      )
    : "";

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        variants[variant],
        paddings[padding],
        interactiveStyles,
        // High contrast support
        "high-contrast:border-2 high-contrast:border-WindowText",
        className
      )}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.(e as any);
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}

export function AboutCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-2", className)}
      {...props}
    />
  );
}

// Card sub-components for better composition
export function CardHeader({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-amber-200",
        "high-contrast:text-WindowText",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm text-amber-100 leading-relaxed",
        "high-contrast:text-WindowText",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pt-4 border-t border-stone-200",
        "high-contrast:border-WindowText",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
