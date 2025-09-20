/**
 * Component Factory - Enhanced Component Creation Utilities
 */

import React, { memo } from "react";
import { designTokens } from "@/lib/design-tokens";

/**
 * Creates a memoized component with custom comparison
 */
export function createMemoizedComponent<P>(
  component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(component, areEqual);
}

/**
 * Gets design token value by path
 */
export function getToken(path: string): string {
  const keys = path.split(".");
  let value: any = designTokens;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Design token not found: ${path}`);
      return "";
    }
  }

  return value;
}

export { memo, React };
