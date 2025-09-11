"use client";

import React from "react";
import { useLocale } from "next-intl";
import { type Locale, type LocalizedContent } from "@/types";

interface LocalizedContentProps {
  content: LocalizedContent;
  fallback?: Locale;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Component for rendering localized content
 */
export function LocalizedContent({
  content,
  fallback = "cs",
  className,
  as: Component = "span",
}: LocalizedContentProps) {
  const locale = useLocale() as Locale;

  const text = content[locale] || content[fallback] || "";

  return <Component className={className}>{text}</Component>;
}

/**
 * Hook for getting localized content
 */
export function useLocalizedContent() {
  const locale = useLocale() as Locale;

  return {
    getContent: <T = string>(content: Record<Locale, T>, fallback: Locale = "cs"): T => {
      return content[locale] || content[fallback];
    },
    locale,
  };
}
