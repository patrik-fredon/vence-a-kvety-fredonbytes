"use client";

import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { RibbonConfiguratorProps } from "./RibbonConfigurator";

// Lazy load the RibbonConfigurator component
const RibbonConfigurator = lazy(() =>
  import("./RibbonConfigurator").then((module) => ({
    default: module.RibbonConfigurator,
  }))
);

/**
 * Lazy-loaded wrapper for RibbonConfigurator to improve performance
 * Only loads the component when ribbon customization is needed
 */
export function LazyRibbonConfigurator(props: RibbonConfiguratorProps) {
  // Don't render anything if not visible to avoid loading the component
  if (!props.isVisible) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-amber-200">Loading ribbon options...</span>
        </div>
      }
    >
      <RibbonConfigurator {...props} />
    </Suspense>
  );
}
