"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Dynamic import for AccessibilityToolbar to reduce initial bundle size
const AccessibilityToolbar = dynamic(
  () => import("./AccessibilityToolbar").then((mod) => ({ default: mod.AccessibilityToolbar })),
  {
    loading: () => (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] border border-stone-200 rounded-lg p-2 shadow-lg">
          <LoadingSpinner size="sm" />
        </div>
      </div>
    ),
    ssr: false, // Accessibility toolbar is interactive and doesn't need SSR
  }
);

interface LazyAccessibilityToolbarProps {
  className?: string;
}

export function LazyAccessibilityToolbar(_props: LazyAccessibilityToolbarProps) {
  return <AccessibilityToolbar />;
}
