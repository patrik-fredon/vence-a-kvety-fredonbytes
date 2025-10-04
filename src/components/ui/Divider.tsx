import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "dotted" | "memorial";
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  variant = "solid",
  spacing = "md",
  className,
  ...props
}: DividerProps) {
  const orientations = {
    horizontal: "w-full h-px",
    vertical: "h-full w-px",
  };

  const variants = {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
    memorial:
      "border-solid bg-gradient-to-r from-transparent via-primary-300 to-transparent border-0",
  };

  const spacings = {
    none: orientation === "horizontal" ? "my-0" : "mx-0",
    sm: orientation === "horizontal" ? "my-2" : "mx-2",
    md: orientation === "horizontal" ? "my-4" : "mx-4",
    lg: orientation === "horizontal" ? "my-6" : "mx-6",
    xl: orientation === "horizontal" ? "my-8" : "mx-8",
  };

  const borderColor = variant === "memorial" ? "" : "border-neutral-200";

  return (
    <hr
      className={cn(
        orientations[orientation],
        variants[variant],
        spacings[spacing],
        borderColor,
        // High contrast support
        "high-contrast:border-WindowText",
        className
      )}
      {...props}
    />
  );
}
