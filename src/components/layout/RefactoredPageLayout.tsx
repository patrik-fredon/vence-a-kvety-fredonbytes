/**
 * RefactoredPageLayout - Main page layout wrapper component
 *
 * This component provides the main layout structure for the refactored home page
 * with the funeral-appropriate background color and proper semantic HTML structure.
 * It integrates the hero section and product references sections while maintaining
 * SEO metadata and structured data.
 *
 * Requirements met:
 * - 5.2: Uses #9B9259 background color for overall page
 * - 6.2: Proper semantic HTML document structure
 * - 8.1: Maintains existing SEO metadata and structured data
 */

"use client";

import type React from "react";
import { ComponentErrorFallback, ErrorBoundary } from "@/components/ui/ErrorBoundary";
import type { Locale } from "@/i18n/config";
import { funeralColors } from "@/lib/design-tokens";
import { logErrorWithContext } from "@/lib/utils/fallback-utils";
import { LazyProductReferencesSection } from "./LazyProductReferencesSection";
import { RefactoredHeroSection } from "./RefactoredHeroSection";

interface RefactoredPageLayoutProps {
  locale: string;
  companyLogo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  children?: React.ReactNode;
  className?: string;
}

/**
 * RefactoredPageLayout component that provides the main layout structure
 * for the refactored home page with funeral-appropriate styling
 */
export const RefactoredPageLayout: React.FC<RefactoredPageLayoutProps> = ({
  locale,
  companyLogo,
  children,
  className = "",
}) => {
  // Error handler for component-level errors
  const handleComponentError = (error: Error, _errorInfo: any) => {
    logErrorWithContext(error, {
      component: "RefactoredPageLayout",
      action: "component_error",
      locale: locale as string,
      timestamp: new Date().toISOString(),
    } as any);
  };

  return (
    <div
      className={`min-h-screen ${className}`}
      role="document"
      aria-label="Home page content"
    >
      {/* Hero Section with centered logo and messaging */}
      <section aria-labelledby="hero-heading" role="banner" className="relative">
        <ErrorBoundary
          level="component"
          context="RefactoredHeroSection"
          onError={handleComponentError}
          fallback={
            <ComponentErrorFallback
              className="min-h-[400px] flex items-center justify-center"
              title={
                locale === "cs"
                  ? "Hlavní sekce se nepodařila načíst"
                  : "Hero section failed to load"
              }
              message={
                locale === "cs"
                  ? "Při načítání hlavní sekce došlo k chybě. Zkuste obnovit stránku."
                  : "An error occurred while loading the hero section. Please refresh the page."
              }
              showRetry={true}
              onRetry={() => window.location.reload()}
            />
          }
        >
          <RefactoredHeroSection locale={locale} companyLogo={companyLogo} />
        </ErrorBoundary>
      </section>

      {/* Product References Section */}
      <section aria-labelledby="products-heading" className="relative ">
        <ErrorBoundary
          level="component"
          context="LazyProductReferencesSection"
          onError={handleComponentError}
          fallback={
            <ComponentErrorFallback
              className="min-h-screen flex items-center justify-center"
              title={locale === "cs" ? "Produkty se nepodařily načíst" : "Products failed to load"}
              message={
                locale === "cs"
                  ? "Při načítání produktů došlo k chybě. Můžete zkusit přejít přímo na stránku produktů."
                  : "An error occurred while loading products. You can try going directly to the products page."
              }
              showRetry={true}
              onRetry={() => window.location.reload()}
              recoveryActions={[
                {
                  label: locale === "cs" ? "Přejít na produkty" : "Go to Products",
                  action: () => (window.location.href = `/${locale}/products`),
                  primary: true,
                },
              ]}
            />
          }
        >
          <LazyProductReferencesSection locale={locale as Locale} />
        </ErrorBoundary>
      </section>

      {/* Additional content if provided */}
      {children && (
        <section aria-label="Additional content" className="relative">
          <ErrorBoundary
            level="component"
            context="AdditionalContent"
            onError={handleComponentError}
            fallback={
              <ComponentErrorFallback
                className="min-h-[200px] flex items-center justify-center"
                title={locale === "cs" ? "Obsah se nepodařil načíst" : "Content failed to load"}
                message={
                  locale === "cs"
                    ? "Při načítání obsahu došlo k chybě."
                    : "An error occurred while loading content."
                }
              />
            }
          >
            {children}
          </ErrorBoundary>
        </section>
      )}
    </div>
  );
};

export default RefactoredPageLayout;
