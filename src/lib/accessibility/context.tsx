/**
 * Accessibility context provider for global accessibility settings
 */

"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { HighContrast } from "./utils";

interface AccessibilityContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  prefersReducedMotion: boolean;
  announceMessage: (message: string, priority?: "polite" | "assertive") => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Initialize high contrast mode
  useEffect(() => {
    HighContrast.initialize();
    setIsHighContrast(HighContrast.isEnabled());

    // Listen for system preference changes
    const contrastQuery = window.matchMedia("(prefers-contrast: high)");
    const forcedColorsQuery = window.matchMedia("(forced-colors: active)");

    const handleContrastChange = () => {
      setIsHighContrast(HighContrast.isEnabled());
    };

    contrastQuery.addEventListener("change", handleContrastChange);
    forcedColorsQuery.addEventListener("change", handleContrastChange);

    // Listen for manual class changes
    const observer = new MutationObserver(handleContrastChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      contrastQuery.removeEventListener("change", handleContrastChange);
      forcedColorsQuery.removeEventListener("change", handleContrastChange);
      observer.disconnect();
    };
  }, []);

  // Initialize reduced motion preference
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    motionQuery.addEventListener("change", handleMotionChange);
    return () => motionQuery.removeEventListener("change", handleMotionChange);
  }, []);

  const toggleHighContrast = () => {
    HighContrast.toggle();
    setIsHighContrast(HighContrast.isEnabled());
  };

  const announceMessage = (message: string, priority: "polite" | "assertive" = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  const value: AccessibilityContextType = {
    isHighContrast,
    toggleHighContrast,
    prefersReducedMotion,
    announceMessage,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
