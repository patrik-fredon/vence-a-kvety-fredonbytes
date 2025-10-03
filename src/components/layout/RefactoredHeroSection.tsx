"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CTAButton } from "@/components/ui/CTAButton";
import { useReducedMotion } from "@/lib/accessibility/hooks";
import { cn } from "@/lib/utils";
import {
  getFallbackImage,
  logErrorWithContext,
  safeTranslate,
} from "@/lib/utils/fallback-utils";

interface RefactoredHeroSectionProps {
  locale: string;
  companyLogo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  className?: string;
}

export function RefactoredHeroSection({
  locale,
  companyLogo,
  className,
}: RefactoredHeroSectionProps) {
  const t = useTranslations("home.refactoredHero");
  const prefersReducedMotion = useReducedMotion();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [currentLogoSrc, setCurrentLogoSrc] = useState(companyLogo.src);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Safe translation function with fallbacks
  const safeT = (key: string) => safeTranslate(t, key, locale);

  // Handle logo loading error with fallback
  const handleLogoError = () => {
    if (!logoError) {
      setLogoError(true);
      const fallbackLogo = getFallbackImage("logo");
      setCurrentLogoSrc(fallbackLogo.src);

      logErrorWithContext(new Error("Logo failed to load"), {
        component: "RefactoredHeroSection",
        action: "logo_load_error",
        locale,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Handle successful logo load
  const handleLogoLoad = () => {
    setLogoLoaded(true);
  };

  // Trigger staggered animations after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true);
      if (!logoError) {
        setLogoLoaded(true);
      }
    }, 100); // Small delay to ensure smooth animation

    return () => clearTimeout(timer);
  }, [logoError]);

  return (
    <section
      id="hero-section"
      className={cn(
        // Background color - using centralized Teal gradient
        "bg-funeral-teal",
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
        "text-amber-100",
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
      <div
        className={cn(
          "w-full text-center",
          // Mobile-first max-width progression
          "max-w-sm", // 384px for very small screens
          "xs:max-w-md", // 448px for 375px+ screens
          "sm:max-w-2xl", // 672px for small screens (640px+)
          "md:max-w-3xl", // 768px for tablets
          "lg:max-w-4xl", // 896px for desktop
          "xl:max-w-5xl", // 1024px for large screens
          "mx-auto"
        )}
      >
        {/* Company Logo - Mobile-first responsive sizing with fade-in animation */}
        <div
          className={cn(
            "relative", // For loading state positioning
            // Mobile spacing (320px-767px)
            "mb-6", // Compact spacing on mobile
            "xs:mb-7", // Slightly more for 375px+
            "sm:mb-8", // Standard spacing for 640px+
            // Tablet spacing (768px-1023px)
            "md:mb-10", // More generous spacing on tablet
            // Desktop spacing (1024px+)
            "lg:mb-12", // Ample spacing on desktop
            "xl:mb-14" // Maximum spacing for large screens
          )}
        >
          <Image
            src={currentLogoSrc}
            alt={`${companyLogo.alt} - ${safeT("logoAlt")}`}
            width={companyLogo.width}
            height={companyLogo.height}
            priority={true} // Logo is above the fold and critical
            onLoad={handleLogoLoad}
            onError={handleLogoError}
            className={cn(
              // Mobile-first responsive sizing
              "h-42 w-auto", // 96px height for very small screens (320px+)
              "xs:h-56", // 112px for 375px+ screens
              "sm:h-64", // 128px for small screens (640px+)
              // Tablet sizing (768px-1023px)
              "md:h-72", // 160px for tablets
              // Desktop sizing (1024px+)
              "lg:h-96", // 192px for desktop
              "xl:h-128", // 224px for large screens
              // Centering and accessibility
              "mx-auto",
              // Fade-in animation that respects motion preferences
              "transition-opacity duration-700 ease-in-out",
              logoLoaded && !prefersReducedMotion
                ? "opacity-100"
                : logoLoaded
                  ? "opacity-100"
                  : "opacity-0",
              // Additional gentle animation for non-reduced motion users
              !prefersReducedMotion && logoLoaded && "animate-gentle-fade",
              // Error state styling
              logoError && "opacity-80 grayscale-[0.2]"
            )}
            // Accessibility improvements
            role="img"
            aria-label={`${companyLogo.alt} - ${safeT("logoAlt")}`}
          />

          {/* Loading state for logo */}
          {!(logoLoaded || logoError) && (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "bg-funeral-hero/50 rounded-lg",
                "animate-pulse"
              )}
              aria-hidden="true"
            >
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Error indicator (subtle, for accessibility) */}
          {logoError && (
            <div className="sr-only" role="alert">
              Logo failed to load, showing fallback image
            </div>
          )}
        </div>

        {/* H2 Heading - Single line with responsive typography and fade-in animation */}
        <h1
          id="hero-heading"
          className={cn(
            // Mobile-first typography (320px-767px)
            "text-2xl font-bold", // 24px for mobile
            "xs:text-3xl", // 30px for 375px+ screens
            "sm:text-4xl", // 36px for 640px+ screens
            // Tablet typography (768px-1023px)
            "md:text-5xl", // 48px for tablet
            // Desktop typography (1024px+)
            "lg:text-6xl", // 60px for desktop
            "xl:text-7xl", // 72px for large screens
            // Single line constraint and spacing
            "whitespace-nowrap overflow-hidden text-ellipsis",
            // Mobile-first spacing
            "mb-4", // Compact spacing on mobile
            "xs:mb-5", // Slightly more for 375px+
            "sm:mb-6", // Standard spacing for 640px+
            "md:mb-8", // Tablet spacing
            "lg:mb-10", // Desktop spacing
            // Orientation adjustments
            "landscape:text-xl landscape:sm:text-3xl", // Smaller in landscape
            "md:landscape:text-4xl", // Tablet landscape
            // Fade-in animation with delay
            "transition-all duration-1000 ease-out",
            animationStarted && !prefersReducedMotion
              ? "opacity-100 translate-y-0"
              : animationStarted
                ? "opacity-100"
                : "opacity-0 translate-y-4"
          )}
          style={{
            transitionDelay: prefersReducedMotion ? "0ms" : "300ms"
          }}
        >
          {safeT("heading")}
        </h1>

        {/* Paragraph - Single line with responsive typography and fade-in animation */}
        <p
          id="hero-description"
          className={cn(
            // Mobile-first typography (320px-767px)
            "text-base", // 16px for mobile
            "xs:text-lg", // 18px for 375px+ screens
            "sm:text-xl", // 20px for 640px+ screens
            // Tablet typography (768px-1023px)
            "md:text-2xl", // 24px for tablet
            // Desktop typography (1024px+)
            "lg:text-3xl", // 30px for desktop
            "xl:text-4xl", // 36px for large screens
            // Single line constraint and spacing
            "whitespace-nowrap overflow-hidden text-ellipsis",
            // Mobile-first spacing
            "mb-8", // Compact spacing on mobile
            "xs:mb-10", // Slightly more for 375px+
            "sm:mb-12", // Standard spacing for 640px+
            "md:mb-16", // Tablet spacing
            "lg:mb-20", // Desktop spacing
            // Text styling
            "text-amber-200", // Slightly transparent for hierarchy
            // Orientation adjustments
            "landscape:text-sm landscape:sm:text-lg", // Smaller in landscape
            "md:landscape:text-xl", // Tablet landscape
            // Fade-in animation with delay
            "transition-all duration-1000 ease-out",
            animationStarted && !prefersReducedMotion
              ? "opacity-100 translate-y-0"
              : animationStarted
                ? "opacity-100"
                : "opacity-0 translate-y-4"
          )}
          style={{
            transitionDelay: prefersReducedMotion ? "0ms" : "600ms"
          }}
        >
          {safeT("description")}
        </p>

        {/* Call-to-Action Button with fade-in animation */}
        <div
          className={cn(
            "transition-all duration-1000 ease-out",
            animationStarted && !prefersReducedMotion
              ? "opacity-100 translate-y-0 scale-100"
              : animationStarted
                ? "opacity-100"
                : "opacity-0 translate-y-4 scale-95"
          )}
          style={{
            transitionDelay: prefersReducedMotion ? "0ms" : "900ms"
          }}
        >
          <CTAButton
            href={`/${locale}/products`}
            className={cn(
              // Mobile-first responsive sizing
              "text-base px-6 py-3", // Compact on mobile
              "xs:text-lg xs:px-7 xs:py-4", // Slightly larger for 375px+
              "sm:text-xl sm:px-8 sm:py-4", // Standard for 640px+
              "md:text-2xl md:px-10 md:py-5", // Tablet sizing
              "lg:text-3xl lg:px-12 lg:py-6", // Desktop sizing
              "rounded-t-lg rounded-b-3xl bg-funeral-gold text-teal-800 font-extrabold",
              // Orientation adjustments
              "landscape:text-sm landscape:px-6 landscape:py-3", // Smaller in landscape
              "md:landscape:text-xl md:landscape:px-8 md:landscape:py-4", // Tablet landscape
              // Hover animation enhancement
              "hover:scale-105 hover:bg-amber-100/60 transition-transform duration-200"
            )}
          >
            {safeT("ctaButton")}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
