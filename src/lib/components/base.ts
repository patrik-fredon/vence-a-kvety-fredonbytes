/**
 * Base component utilities and interfaces
 */

import * as React from "react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import type { BaseComponentProps, AccessibilityProps } from "@/types/components";

/**
 * Creates a base component with consistent props and behavior
 */
export function createBaseComponent<T extends keyof React.JSX.IntrinsicElements>(
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

    return React.createElement(Element, {
      ref,
      className: cn(defaultClassName, className),
      "data-testid": testId,
      ...props
    });
  });
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
      return React.createElement("div", {
        className: "flex items-center justify-center p-4"
      }, [
        React.createElement("div", {
          key: "spinner",
          className: "animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"
        }),
        loadingText && React.createElement("span", {
          key: "text",
          className: "ml-2 text-sm text-neutral-600"
        }, loadingText)
      ]);
    }

    return React.createElement(Component, componentProps as P);
  };
}

/**
 * Common prop validators
 */
export const validators = {
  string: (value: any): value is string => typeof value === "string",
  number: (value: any): value is number => typeof value === "number",
  boolean: (value: any): value is boolean => typeof value === "boolean",
  required: (value: any): boolean => value !== undefined && value !== null,
};
