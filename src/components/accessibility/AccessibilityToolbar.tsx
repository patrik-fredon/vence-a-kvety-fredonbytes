/**
 * Accessibility toolbar component providing quick access to accessibility features
 */

"use client";

import {
  AdjustmentsHorizontalIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAccessibility } from "@/lib/accessibility/context";
import { useSkipLinks } from "@/lib/accessibility/hooks";



export function AccessibilityToolbar() {
  const t = useTranslations("accessibility");
  const [isOpen, setIsOpen] = useState(false);
  const { isHighContrast, toggleHighContrast, announceMessage } = useAccessibility();
  const { skipToContent, skipToNavigation } = useSkipLinks();

  const handleToggleToolbar = () => {
    setIsOpen(!isOpen);
    announceMessage(isOpen ? t("toolbarClosed") : t("toolbarOpened"), "polite");
  };

  const handleHighContrastToggle = () => {
    toggleHighContrast();
    announceMessage(isHighContrast ? t("highContrastOff") : t("highContrastOn"), "assertive");
  };

  const handleSkipToContent = () => {
    skipToContent();
    setIsOpen(false);
    announceMessage(t("skippedToContent"), "polite");
  };

  const handleSkipToNavigation = () => {
    skipToNavigation();
    setIsOpen(false);
    announceMessage(t("skippedToNavigation"), "polite");
  };

  return (
    <>
      {/* Accessibility Toolbar Toggle Button */}
      <button
        onClick={handleToggleToolbar}
        className={`
          fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-200
          ${isHighContrast
            ? "bg-black text-white border-2 border-white"
            : "bg-stone-900 text-white hover:bg-stone-800"
          }
          focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2
        `}
        aria-label={isOpen ? t("closeAccessibilityToolbar") : t("openAccessibilityToolbar")}
        aria-expanded={isOpen}
        aria-controls="accessibility-toolbar"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" aria-hidden="true" />
        ) : (
          <AdjustmentsHorizontalIcon className="w-6 h-6" aria-hidden="true" />
        )}
      </button>

      {/* Accessibility Toolbar Panel */}
      {isOpen && (
        <div
          id="accessibility-toolbar"
          className={`
            fixed top-20 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-lg shadow-elegant
            ${isHighContrast
              ? "bg-black text-white border-2 border-white"
              : "bg-white text-neutral-900 border border-neutral-200"
            }
          `}
          role="dialog"
          aria-labelledby="accessibility-toolbar-title"
          aria-describedby="accessibility-toolbar-description"
        >
          <div className="p-4">
            <h2 id="accessibility-toolbar-title" className="text-lg font-semibold mb-2">
              {t("accessibilityOptions")}
            </h2>

            <p id="accessibility-toolbar-description" className="text-sm text-neutral-600 mb-4">
              {t("toolbarDescription")}
            </p>

            <div className="space-y-3">
              {/* Skip Links */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">{t("navigation")}</h3>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSkipToContent}
                    className="justify-start"
                  >
                    <span className="mr-2" aria-hidden="true">
                      ⬇️
                    </span>
                    {t("skipToContent")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSkipToNavigation}
                    className="justify-start"
                  >
                    <span className="mr-2" aria-hidden="true">
                      🧭
                    </span>
                    {t("skipToNavigation")}
                  </Button>
                </div>
              </div>

              {/* Visual Options */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">{t("visualOptions")}</h3>
                <Button
                  size="sm"
                  variant={isHighContrast ? "primary" : "outline"}
                  onClick={handleHighContrastToggle}
                  className="justify-start w-full"
                  aria-pressed={isHighContrast}
                >
                  <EyeIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {isHighContrast ? t("disableHighContrast") : t("enableHighContrast")}
                </Button>
              </div>

              {/* Keyboard Shortcuts Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">{t("keyboardShortcuts")}</h3>
                <div className="text-xs space-y-1 text-neutral-600">
                  <div>
                    <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Tab</kbd>{" "}
                    {t("navigateForward")}
                  </div>
                  <div>
                    <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Shift+Tab</kbd>{" "}
                    {t("navigateBackward")}
                  </div>
                  <div>
                    <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Enter</kbd>{" "}
                    {t("activate")}
                  </div>
                  <div>
                    <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Esc</kbd>{" "}
                    {t("close")}
                  </div>
                  <div>
                    <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">↑↓←→</kbd>{" "}
                    {t("navigateArrows")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={handleToggleToolbar}
          aria-hidden="true"
        />
      )}
    </>
  );
}
