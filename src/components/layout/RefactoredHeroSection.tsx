'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CTAButton } from '@/components/ui/CTAButton';

interface RefactoredHeroSectionProps {
  locale: string;
  companyLogo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  heading: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  className?: string;
}

export function RefactoredHeroSection({
  locale,
  companyLogo,
  heading,
  description,
  ctaText,
  ctaHref,
  className
}: RefactoredHeroSectionProps) {

  return (
    <section
      id="hero-section"
      className={cn(
        // Background color - funeral hero color (#102724) - WCAG AA compliant
        "bg-funeral-hero",
        // Mobile-first responsive height (320px-767px)
        "min-h-screen", // Full height on mobile for impact
        "sm:min-h-[90vh]", // Slightly reduced on small screens (640px+)
        // Tablet optimizations (768px-1023px)
        "md:min-h-[85vh]", // Optimized for tablet viewing
        // Desktop layout with proper space utilization (1024px+)
        "lg:min-h-[80vh]", // More compact on desktop
        "xl:min-h-[700px]", // Fixed minimum for very large screens
        // Flexbox layout for centering
        "flex items-center justify-center",
        // Mobile-first responsive padding
        "px-3 py-12", // Minimal padding for very small screens (320px+)
        "xs:px-4 xs:py-14", // Slightly more padding for 375px+
        "sm:px-6 sm:py-16", // Standard mobile padding (640px+)
        "md:px-8 md:py-20", // Tablet padding (768px+)
        "lg:px-12 lg:py-24", // Desktop padding (1024px+)
        "xl:px-16", // Extra padding for large screens
        // Text color for contrast
        "text-white",
        // Orientation handling
        "landscape:min-h-[100vh] landscape:py-8", // Landscape mobile adjustments
        "md:landscape:min-h-[90vh]", // Landscape tablet adjustments
        className
      )}
      aria-labelledby="hero-heading"
      aria-describedby="hero-description"
      role="banner"
    >
      {/* Centered content container with responsive max-width */}
      <div className={cn(
        "w-full text-center",
        // Mobile-first max-width progression
        "max-w-sm", // 384px for very small screens
        "xs:max-w-md", // 448px for 375px+ screens
        "sm:max-w-2xl", // 672px for small screens (640px+)
        "md:max-w-3xl", // 768px for tablets
        "lg:max-w-4xl", // 896px for desktop
        "xl:max-w-5xl", // 1024px for large screens
        "mx-auto"
      )}>

        {/* Company Logo - Mobile-first responsive sizing */}
        <div className={cn(
          // Mobile spacing (320px-767px)
          "mb-6", // Compact spacing on mobile
          "xs:mb-7", // Slightly more for 375px+
          "sm:mb-8", // Standard spacing for 640px+
          // Tablet spacing (768px-1023px)
          "md:mb-10", // More generous spacing on tablet
          // Desktop spacing (1024px+)
          "lg:mb-12", // Ample spacing on desktop
          "xl:mb-14" // Maximum spacing for large screens
        )}>
          <Image
            src={companyLogo.src}
            alt={`${companyLogo.alt} - ${locale === 'cs' ? 'Hlavní logo společnosti specializující se na pohřební věnce a květinové aranžmá' : 'Main company logo specializing in funeral wreaths and floral arrangements'}`}
            width={companyLogo.width}
            height={companyLogo.height}
            sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, (max-width: 1280px) 192px, 224px"
            priority
            className={cn(
              // Mobile-first logo sizing (320px-767px)
              "h-24 w-auto mx-auto", // 96px - compact for small screens
              "xs:h-28", // 112px for 375px+ screens
              "sm:h-32", // 128px for 480px+ screens
              // Tablet optimizations (768px-1023px)
              "md:h-40", // 160px - prominent on tablet
              // Desktop layout with proper space utilization (1024px+)
              "lg:h-48", // 192px - dominant on desktop
              "xl:h-56", // 224px - maximum impact on large screens
              "2xl:h-64", // 256px - for very large displays
              // Ensure proper scaling and contrast
              "object-contain",
              // Subtle animation on load
              "animate-gentle-fade",
              // Orientation adjustments
              "landscape:h-20 landscape:xs:h-24 landscape:sm:h-28", // Smaller in landscape
              "md:landscape:h-36", // Tablet landscape adjustment
              // Focus styles for accessibility
              "focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
            )}
            role="img"
            aria-describedby="logo-description"
          />
          {/* Hidden description for screen readers */}
          <div id="logo-description" className="sr-only">
            {locale === 'cs'
              ? 'Logo společnosti specializující se na pohřební věnce a květinové aranžmá. Dominantní prvek stránky umístěný v centru.'
              : 'Company logo specializing in funeral wreaths and floral arrangements. Dominant page element positioned in the center.'
            }
          </div>
        </div>

        {/* H2 Heading - Mobile-first responsive typography */}
        <h2
          id="hero-heading"
          className={cn(
            // Mobile-first font sizes (320px-767px)
            "text-xl", // 20px for very small screens
            "xs:text-2xl", // 24px for 375px+ screens
            "sm:text-3xl", // 30px for 480px+ screens
            // Tablet optimizations (768px-1023px)
            "md:text-4xl", // 36px for tablet - optimal readability
            // Desktop layout with proper space utilization (1024px+)
            "lg:text-5xl", // 48px for desktop - strong hierarchy
            "xl:text-6xl", // 60px for large screens
            // Typography styling
            "font-semibold leading-tight tracking-wide",
            // Single line constraint with responsive handling
            "whitespace-nowrap overflow-hidden",
            // Mobile-first spacing
            "mb-4", // Compact spacing on mobile
            "xs:mb-5", // Slightly more for 375px+
            "sm:mb-6", // Standard spacing for 640px+
            "md:mb-7", // Tablet spacing
            "lg:mb-8", // Desktop spacing
            // Text color and contrast - white on #102724 provides excellent contrast (>7:1)
            "text-white",
            // Accessibility
            "focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50",
            // Orientation adjustments
            "landscape:text-lg landscape:xs:text-xl landscape:sm:text-2xl", // Smaller in landscape
            "md:landscape:text-3xl" // Tablet landscape adjustment
          )}
          tabIndex={0}
          role="heading"
          aria-level={2}
        >
          {heading}
        </h2>

        {/* Paragraph - Mobile-first responsive typography */}
        <p
          id="hero-description"
          className={cn(
            // Mobile-first font sizes (320px-767px)
            "text-base", // 16px for very small screens
            "xs:text-lg", // 18px for 375px+ screens
            "sm:text-xl", // 20px for 480px+ screens
            // Tablet optimizations (768px-1023px)
            "md:text-xl", // 20px for tablet - consistent readability
            // Desktop layout with proper space utilization (1024px+)
            "lg:text-2xl", // 24px for desktop - enhanced readability
            "xl:text-3xl", // 30px for large screens
            // Typography styling
            "font-normal leading-relaxed",
            // Single line constraint with responsive handling
            "whitespace-nowrap overflow-hidden",
            // Mobile-first spacing and layout
            "mb-6", // Compact spacing on mobile
            "xs:mb-7", // Slightly more for 375px+
            "sm:mb-8", // Standard spacing for 640px+
            "md:mb-10", // Tablet spacing
            "lg:mb-12", // Desktop spacing
            // Responsive max-width for better readability
            "max-w-xs mx-auto", // Very narrow on small screens
            "xs:max-w-sm", // 384px for 375px+ screens
            "sm:max-w-lg", // 512px for 640px+ screens
            "md:max-w-xl", // 576px for tablet
            "lg:max-w-2xl", // 672px for desktop
            "xl:max-w-3xl", // 768px for large screens
            // Text color - beige (#F5F5DC) on #102724 provides good contrast (>4.5:1)
            "text-funeral-textSecondary",
            // Accessibility
            "focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50",
            // Orientation adjustments
            "landscape:text-sm landscape:xs:text-base landscape:sm:text-lg", // Smaller in landscape
            "md:landscape:text-xl" // Tablet landscape adjustment
          )}
          tabIndex={0}
          role="text"
        >
          {description}
        </p>

        {/* CTA Button - Mobile-first responsive sizing */}
        <div className="flex justify-center">
          <CTAButton
            href={ctaHref}
            size="lg"
            className={cn(
              "focus-visible:ring-offset-funeral-hero",
              // Mobile-first button sizing
              "px-6 py-3", // Compact on mobile
              "xs:px-7 xs:py-3.5", // Slightly larger for 375px+
              "sm:px-8 sm:py-4", // Standard size for 640px+
              // Tablet optimizations
              "md:px-10 md:py-5", // More prominent on tablet
              // Desktop optimizations
              "lg:px-12 lg:py-6", // Large and prominent on desktop
              // Responsive text sizing
              "text-base", // 16px on mobile
              "sm:text-lg", // 18px on small screens
              "md:text-xl", // 20px on tablet
              "lg:text-2xl", // 24px on desktop
              // Touch target optimization for mobile
              "min-h-[44px]", // WCAG minimum touch target
              "sm:min-h-[48px]", // Slightly larger for small screens
              "md:min-h-[52px]", // Tablet optimization
              "lg:min-h-[56px]", // Desktop optimization
              // Orientation adjustments
              "landscape:px-5 landscape:py-2.5 landscape:text-sm", // Compact in landscape
              "md:landscape:px-8 md:landscape:py-4 md:landscape:text-lg" // Tablet landscape
            )}
            aria-describedby="cta-description"
          >
            {ctaText}
          </CTAButton>
          {/* Hidden description for screen readers */}
          <div id="cta-description" className="sr-only">
            {locale === 'cs'
              ? 'Tlačítko pro přechod na stránku s produkty. Otevře se nová stránka s nabídkou pohřebních věnců.'
              : 'Button to navigate to products page. Opens a new page with funeral wreaths offerings.'
            }
          </div>
        </div>
      </div>

      {/* Enhanced screen reader content for additional context */}
      <div className="sr-only" aria-live="polite">
        <p>
          {locale === 'cs'
            ? 'Hlavní sekce stránky s nabídkou pohřebních věnců a květinových aranžmá. Obsahuje logo společnosti, hlavní nadpis, popis služeb a tlačítko pro přechod na produkty.'
            : 'Main page section offering funeral wreaths and floral arrangements. Contains company logo, main heading, service description, and button to navigate to products.'
          }
        </p>
      </div>

      {/* Skip link target for accessibility */}
      <div id="main-content" className="sr-only" tabIndex={-1}>
        {locale === 'cs' ? 'Začátek hlavního obsahu' : 'Start of main content'}
      </div>
    </section>
  );
}
