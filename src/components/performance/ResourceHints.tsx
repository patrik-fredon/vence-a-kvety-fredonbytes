/**
 * Resource hints component for optimizing critical resource loading
 * Addresses requirements 8.4 and 8.5 for critical resource prioritization
 */

import {
  getBelowFoldResourceHints,
  getCriticalResourceHints,
  getHeroResourceHints,
} from "@/lib/performance/resource-hints";

interface ResourceHintsProps {
  /** Locale for localized resource hints */
  locale?: string;
  /** Hero logo source for preloading */
  heroLogoSrc?: string;
  /** Whether to include below-the-fold resource hints */
  includeBelowFold?: boolean;
}

/**
 * Resource hints component that should be included in the document head
 */
export function ResourceHints({
  locale = "en",
  heroLogoSrc,
  includeBelowFold = false,
}: ResourceHintsProps) {
  const criticalHints = getCriticalResourceHints(locale);
  const heroHints = getHeroResourceHints(heroLogoSrc);
  const belowFoldHints = includeBelowFold ? getBelowFoldResourceHints() : [];

  const allHints = [...criticalHints, ...heroHints, ...belowFoldHints];

  return (
    <>
      {/* Critical resource hints for faster loading */}
      {allHints.map((hint, index) => (
        <link
          key={`${hint.rel}-${hint.href}-${index}`}
          rel={hint.rel}
          href={hint.href}
          {...(hint.as && { as: hint.as })}
          {...(hint.type && { type: hint.type })}
          {...(hint.crossOrigin && { crossOrigin: hint.crossOrigin })}
          {...(hint.media && { media: hint.media })}
        />
      ))}

      {/* Font optimization */}
      <link
        rel="preload"
        href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      {/* Critical CSS preload (if using separate critical CSS file) */}
      <link
        rel="preload"
        href="/styles/critical.css"
        as="style"
        onLoad={(e) => {
          const target = e.target as HTMLLinkElement;
          target.onload = null;
          target.rel = "stylesheet";
        }}
      />

      {/* Viewport meta for proper responsive behavior */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />

      {/* Performance hints */}
      <meta httpEquiv="x-dns-prefetch-control" content="on" />

      {/* Optimize resource loading */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </>
  );
}

/**
 * Critical CSS component for inlining above-the-fold styles
 */
export function CriticalCSS() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Critical CSS for above-the-fold content */

          /* Hero section critical styles */
          #hero-section {
            background-color: var(--color-teal-950, #013029);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          /* Logo critical styles */
          #hero-section img {
            max-width: 100%;
            height: auto;
          }

          /* Typography critical styles */
          #hero-heading {
            font-weight: 600;
            line-height: 1.2;
            margin-bottom: 1rem;
          }

          /* CTA button critical styles */
          .cta-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 1.5rem;
            background-color: var(--color-amber-600, #d97706);
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 500;
            transition: background-color 0.2s ease;
            min-height: 44px;
          }

          .cta-button:hover {
            background-color: var(--color-amber-700, #b45309);
          }

          /* Prevent layout shift */
          .aspect-square {
            aspect-ratio: 1 / 1;
          }

          /* Font loading optimization */
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 400;
            font-display: swap;
            src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
          }

          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 600;
            font-display: swap;
            src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2') format('woff2');
          }

          /* Responsive breakpoints for critical content */
          @media (min-width: 640px) {
            #hero-section {
              min-height: 90vh;
            }

            #hero-heading {
              font-size: 1.875rem;
            }
          }

          @media (min-width: 768px) {
            #hero-section {
              min-height: 85vh;
            }

            #hero-heading {
              font-size: 2.25rem;
            }
          }

          @media (min-width: 1024px) {
            #hero-section {
              min-height: 80vh;
            }

            #hero-heading {
              font-size: 3rem;
            }
          }
        `,
      }}
    />
  );
}
