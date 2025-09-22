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

import React from 'react';
import { RefactoredHeroSection } from './RefactoredHeroSection';
import { LazyProductReferencesSection } from './LazyProductReferencesSection';
import { funeralColors } from '@/lib/design-tokens';

interface RefactoredPageLayoutProps {
  locale: string;
  companyLogo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  heroContent: {
    heading: string;
    description: string;
    ctaText: string;
    ctaHref: string;
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
  heroContent,
  children,
  className = '',
}) => {
  return (
    <div
      className={`min-h-screen ${className}`}
      style={{ backgroundColor: funeralColors.background }}
      role="document"
      aria-label="Home page content"
    >
      {/* Hero Section with centered logo and messaging */}
      <section
        aria-labelledby="hero-heading"
        role="banner"
        className="relative"
      >
        <RefactoredHeroSection
          locale={locale}
          companyLogo={companyLogo}
          heading={heroContent.heading}
          description={heroContent.description}
          ctaText={heroContent.ctaText}
          ctaHref={heroContent.ctaHref}
        />
      </section>

      {/* Product References Section */}
      <section
        aria-labelledby="products-heading"
        role="region"
        className="relative"
      >
        <LazyProductReferencesSection locale={locale} />
      </section>

      {/* Additional content if provided */}
      {children && (
        <section
          role="region"
          aria-label="Additional content"
          className="relative"
        >
          {children}
        </section>
      )}
    </div>
  );
};

export default RefactoredPageLayout;
