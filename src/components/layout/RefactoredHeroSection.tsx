"use client";

import Link from "next/link";
import Image from "next/image";
import { CTAButton } from "@/components/ui";
import { cn } from "@/lib/utils";

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
      className={cn(
        // Background color - funeral hero color (#102724) - WCAG AA compliant
        "bg-funeral-hero",
        // Height and positioning - responsive height
        "min-h-[100vh] md:min-h-[80vh] lg:min-h-[700px]",
        "flex items-center justify-center",
        // Padding for content spacing
        "px-4 py-16 sm:px-6 lg:px-8",
        // Text color for contrast
        "text-white",
        className
      )}
      aria-label={heading}
      role="banner"
    >
      {/* Centered content container */}
      <div className="w-full max-w-4xl mx-auto text-center">

        {/* Company Logo - Dominant positioning */}
        <div className="mb-8">
          <Image
            src={companyLogo.src}
            alt={companyLogo.alt}
            width={companyLogo.width}
            height={companyLogo.height}
            priority
            className={cn(
              // Responsive logo sizing - dominant but appropriate
              "h-32 w-auto mx-auto", // 128px base
              "sm:h-40", // 160px on small screens
              "md:h-48", // 192px on medium screens
              "lg:h-56", // 224px on large screens
              "xl:h-64", // 256px on extra large screens
              // Ensure proper scaling and contrast
              "object-contain",
              // Subtle animation on load - using defined animation
              "animate-gentle-fade"
            )}
          />
        </div>

        {/* H2 Heading - Single line with responsive typography */}
        <h2 className={cn(
          // Responsive font sizes as per design spec
          "text-2xl", // 32px mobile (2rem)
          "sm:text-3xl", // 48px small screens
          "md:text-4xl", // 40px tablet (2.5rem equivalent)
          "lg:text-5xl", // 48px desktop (3rem)
          // Typography styling
          "font-semibold leading-tight tracking-wide",
          // Single line constraint - no truncation for hero text
          "whitespace-nowrap overflow-hidden",
          // Spacing
          "mb-6",
          // Text color and contrast - white on #102724 provides excellent contrast (>7:1)
          "text-white",
          // Accessibility
          "focus:outline-none"
        )}>
          {heading}
        </h2>

        {/* Paragraph - Single line with responsive typography */}
        <p className={cn(
          // Responsive font sizes as per design spec
          "text-lg", // 18px mobile (1.125rem)
          "sm:text-xl", // 20px small screens (1.25rem)
          "md:text-xl", // 20px tablet (1.25rem)
          "lg:text-2xl", // 22px desktop (1.375rem equivalent)
          // Typography styling
          "font-normal leading-relaxed",
          // Single line constraint - no truncation for hero text
          "whitespace-nowrap overflow-hidden",
          // Spacing and layout
          "mb-8 max-w-2xl mx-auto",
          // Text color - beige (#F5F5DC) on #102724 provides good contrast (>4.5:1)
          "text-funeral-textSecondary"
        )}>
          {description}
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          <CTAButton
            href={ctaHref}
            size="lg"
            className="focus-visible:ring-offset-funeral-hero"
          >
            {ctaText}
          </CTAButton>
        </div>
      </div>

      {/* Screen reader only content for additional context */}
      <div className="sr-only">
        <p>
          {locale === 'cs'
            ? 'Hlavní sekce stránky s nabídkou pohřebních věnců a květinových aranžmá'
            : 'Main page section offering funeral wreaths and floral arrangements'
          }
        </p>
      </div>
    </section>
  );
}
