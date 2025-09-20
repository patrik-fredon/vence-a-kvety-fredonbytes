/**
 * Base component utilities and interfaces
 *
 * This module provides foundational utilities for building consistent,
 * accessible, and performant components following atomic design principles.
 */

import type { ReactNode, ComponentPropsWithoutRef, ForwardedRef } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type {
  BaseComponentProps,
  AccessibilityProps,
  ThemeProps
} from "@/types/components";

// =============================================================================
// BASE COMPONENT FACTORY
// =============================================================================

/**
 * Creates a base component with consistent props and behavior
 */
export function createBaseComponent<T extends keyof JSX.IntrinsicElements>(
  element: T,
  defaultClassName?: string
) {
  type ElementProps = ComponentPropsWithoutRef<T>;
  type Props = ElementProps & BaseComponentProps & AccessibilityProps;

  return forwardRef<HTMLElement, Props>(function BaseComponent(
    { className, "data-testid": testId, ...props },
    ref
  ) {
    const Element = element as any;

    return (
      <Element
        ref= { ref }
    className = { cn(defaultClassName, className) }
    data - testid={ testId }
    {...props}
      />
    );
  });
}

// =============================================================================
// COMPONENT COMPOSITION UTILITIES
// =============================================================================

/**
 * Composes multiple component enhancers
 */
export function composeComponents<T>(...enhancers: Array<(component: T) => T>) {
  return (component: T): T => {
    return enhancers.reduce((acc, enhancer) => enhancer(acc), component);
  };
}

/**
 * Higher-order component for adding loading states
 */
export function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function LoadingComponent(
    props: P & { loading?: boolean; loadingText?: string }
  ) {
    const { loading, loadingText, ...componentProps } = props;

    if (loading) {
      return (
        <div className= "flex items-center justify-center p-4" >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
          { loadingText && (
            <span className="ml-2 text-sm text-neutral-600" > { loadingText } </span>
          )
    }
    </div>
      );
  }

  return <Component { ...(componentProps as P) } />;
};
}

/**
 * Higher-order component for adding error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function ErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback= { fallback } >
      <Component { ...props } />
      </ErrorBoundary>
    );
  };
}

/**
 * Higher-order component for adding accessibility features
 */
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AccessibleComponent(
    props: P & AccessibilityProps & { children?: ReactNode }
  ) {
    const {
      role,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      "aria-expanded": ariaExpanded,
      "aria-pressed": ariaPressed,
      "aria-selected": ariaSelected,
      "aria-disabled": ariaDisabled,
      tabIndex,
      ...componentProps
    } = props;

    const accessibilityProps = {
      role,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      "aria-expanded": ariaExpanded,
      "aria-pressed": ariaPressed,
      "aria-selected": ariaSelected,
      "aria-disabled": ariaDisabled,
      tabIndex,
    };

    return <Component { ...(componentProps as P) } {...accessibilityProps } />;
  };
}

/**
 * Higher-order component for adding theme support
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ThemedComponent(props: P & ThemeProps) {
    const { theme, colorScheme, ...componentProps } = props;

    // Theme logic can be implemented here
    // For now, just pass through the props
    return <Component { ...(componentProps as P) } />;
  };
}

// =============================================================================
// COMPONENT VALIDATION UTILITIES
// =============================================================================

/**
 * Validates component props at runtime (development only)
 */
export function validateProps<T extends Record<string, any>>(
  props: T,
  schema: Record<keyof T, (value: any) => boolean>
): void {
  if (process.env.NODE_ENV !== "development") return;

  for (const [key, validator] of Object.entries(schema)) {
    const value = props[key as keyof T];
    if (value !== undefined && !validator(value)) {
      console.warn(`Invalid prop '${key}' with value:`, value);
    }
  }
}

/**
 * Common prop validators
 */
export const validators = {
  string: (value: any): value is string => typeof value === "string",
  number: (value: any): value is number => typeof value === "number",
  boolean: (value: any): value is boolean => typeof value === "boolean",
  function: (value: any): value is Function => typeof value === "function",
  array: (value: any): value is any[] => Array.isArray(value),
  object: (value: any): value is object =>
    typeof value === "object" && value !== null && !Array.isArray(value),
  oneOf: <T>(options: T[]) => (value: any): value is T =>
    options.includes(value),
  required: (value: any): boolean => value !== undefined && value !== null,
};

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

/**
 * Memoization utility for expensive component calculations
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return React.useMemo(factory, deps);
}

/**
 * Callback memoization utility
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return React.useCallback(callback, deps);
}

// =============================================================================
// IMPORTS FOR INTERNAL USE
// =============================================================================

import React from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// =============================================================================
// COMPONENT DISPLAY NAME UTILITIES
// =============================================================================

/**
 * Sets display name for better debugging
 */
export function setDisplayName<T extends React.ComponentType<any>>(
  component: T,
  name: string
): T {
  component.displayName = name;
  return component;
}

/**
 * Creates a compound component with sub-components
 */
export function createCompoundComponent<
  T extends React.ComponentType<any>,
  S extends Record<string, React.ComponentType<any>>
>(MainComponent: T, subComponents: S): T & S {
  const CompoundComponent = MainComponent as T & S;

  Object.keys(subComponents).forEach((key) => {
    (CompoundComponent as any)[key] = subComponents[key as keyof S];
  });

  return CompoundComponent;
}
