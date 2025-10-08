"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/accessibility/hooks";
import { cn } from "@/lib/utils";
import { getFallbackImage, logErrorWithContext, safeTranslate } from "@/lib/utils/fallback-utils";

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
        // Background color - using teal-800 solid color (exception to gradient rule)
        "bg-funeral-teal",
        "min-h-screen",
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
            priority
            quality={90}
            onError={handleLogoError}
            onLoad={handleLogoLoad}
            className={cn(
              "mx-auto",
              // Mobile-first responsive sizing
              "w-56 h-auto", // 224px width on mobile (320px+) - increased from w-48
              "xs:w-64", // 256px for 375px+
              "sm:w-72", // 288px for small screens (640px+)
              "md:w-80", // 320px for tablets - increased from w-72
              "lg:w-96", // 384px for desktop - increased from w-80
              "xl:w-[28rem]", // 448px for large screens - increased from w-96
              // Fade-in animation (respecting reduced motion)
              !prefersReducedMotion && animationStarted && logoLoaded
                ? "animate-gentle-fade"
                : "opacity-100"
            )}
          />
        </div>

        {/* Main Heading - Mobile-first responsive typography with staggered fade-in */}
        <p
          id="hero-heading"
          className={cn(
            "font-serif font-bold",
            // Mobile-first font sizes (320px-767px)
            "text-xs", // 24px on very small screens
            "xs:text-sm", // 30px for 375px+
            "sm:text-md", // 36px for small screens (640px+)
            // Tablet font sizes (768px-1023px)
            "md:text-xl", // 48px for tablets
            // Desktop font sizes (1024px+)
            "lg:text-2xl", // 60px for desktop
            "xl:text-4xl", // 72px for large screens
            // Mobile-first line heights
            "leading-tight", // 1.25 for mobile
            "md:leading-tight", // Maintain tight leading on tablet
            "lg:leading-tight", // Maintain tight leading on desktop
            // Mobile-first spacing
            "mb-4", // Compact spacing on mobile
            "xs:mb-5", // Slightly more for 375px+
            "sm:mb-6", // Standard spacing for 640px+
            "md:mb-8", // More generous on tablet
            "lg:mb-10", // Ample spacing on desktop
            // Text color
            "text-amber-300",
            // Staggered fade-in animation (respecting reduced motion)
            !prefersReducedMotion && animationStarted ? "animate-fade-in-up-delay-1" : "opacity-100"
          )}
        >
          {safeT("heading")}
        </p>

        {/* Subheading - Mobile-first responsive typography with staggered fade-in */}
        <p
          id="hero-description"
          className={cn(
            // Mobile-first font sizes (320px-767px)
            "text-base", // 16px on very small screens
            "xs:text-xs", // 18px for 375px+
            "sm:text-xs", // 20px for small screens (640px+)
            // Tablet font sizes (768px-1023px)
            "md:text-sm", // 24px for tablets
            // Desktop font sizes (1024px+)
            "lg:text-md", // 30px for desktop
            "xl:text-xl", // 36px for large screens
            // Mobile-first line heights
            "leading-relaxed", // 1.625 for mobile
            "md:leading-relaxed", // Maintain relaxed leading on tablet
            "lg:leading-relaxed", // Maintain relaxed leading on desktop
            // Mobile-first spacing
            "mb-6", // Compact spacing on mobile
            "xs:mb-7", // Slightly more for 375px+
            "sm:mb-8", // Standard spacing for 640px+
            "md:mb-10", // More generous on tablet
            "lg:mb-12", // Ample spacing on desktop
            "xl:mb-14", // Maximum spacing for large screens
            "font-light",
            "italic",
            // Text color - updated to amber-200 for hierarchy
            "text-amber-200/50",
            // Staggered fade-in animation (respecting reduced motion)
            !prefersReducedMotion && animationStarted ? "animate-fade-in-up-delay-2" : "opacity-100"
          )}
        >
          {safeT("subheading")}
        </p>

        {/* CTA Button - Mobile-first responsive sizing with staggered fade-in */}
        <Link
          href={`/${locale}/products`}
          className={cn(
            "inline-block",
            // Mobile-first padding (320px-767px)
            "px-6 py-3", // Compact padding on mobile
            "xs:px-7 xs:py-3.5", // Slightly more for 375px+
            "sm:px-8 sm:py-4", // Standard padding for 640px+
            // Tablet padding (768px-1023px)
            "md:px-10 md:py-5", // More generous on tablet
            // Desktop padding (1024px+)
            "lg:px-12 lg:py-6", // Ample padding on desktop
            "xl:px-14 xl:py-7", // Maximum padding for large screens
            // Mobile-first font sizes
            "text-base", // 16px on mobile
            "xs:text-lg", // 18px for 375px+
            "sm:text-xl", // 20px for small screens (640px+)
            "md:text-2xl", // 24px for tablets
            "lg:text-3xl", // 30px for desktop
            // Font weight and styling
            "font-semibold",
            // Background and text colors - updated to use teal-900 for text
            "bg-funeral-gold text-teal-900",
            // Border radius
            "rounded-xl",

            // Transition
            "transition-colors duration-200",

            // Orientation adjustments
            "landscape:text-sm landscape:px-6 landscape:py-3", // Smaller in landscape
            "md:landscape:text-xl md:landscape:px-8 md:landscape:py-4", // Tablet landscape
            // Hover animation enhancement
            "hover:scale-105 transition-transform duration-200",
            // Staggered fade-in animation (respecting reduced motion)
            !prefersReducedMotion && animationStarted ? "animate-fade-in-up-delay-3" : "opacity-100"
          )}
          aria-label={safeT("ctaAriaLabel")}
        >
          {safeT("cta")}
        </Link>
      </div>
    </section>
  );
}
