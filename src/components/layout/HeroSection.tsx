"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  locale: string;
  className?: string;
  backgroundImage?: string;
}

export function HeroSection({
  locale,
  className,
  backgroundImage = "/funeral-wreaths-and-floral-arrangement-001.png"
}: HeroSectionProps) {
  const t = useTranslations("home");

  return (
    <section
      className={cn(
        // Height and positioning
        "relative h-[70vh] min-h-[500px] flex items-center justify-center",
        // Background image with full cover
        "bg-cover bg-center bg-no-repeat",
        // Ensure proper text contrast
        "text-white",
        className
      )}
      style={{
        backgroundImage: `url('${backgroundImage}')`
      }}
      aria-label={t("hero.title")}
    >
      {/* Enhanced overlay for better text contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/50 to-stone-900/70"
        aria-hidden="true"
      />

      {/* Content container with subtle background */}
      <div className="relative text-white z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Optional subtle background for text content */}
        <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm rounded-2xl -m-8" aria-hidden="true" />

        {/* Text content wrapper */}
        <div className="relative z-10 py-8">
          {/* Main heading with enhanced visibility */}
          <h1 className={cn(
            // Responsive font sizes: 4xl on mobile, 5xl on larger screens
            "text-4xl lg:text-5xl xl:text-6xl",
            // Typography styling with enhanced weight for better visibility
            "font-semibold leading-tight tracking-wide",
            // Enhanced text shadow for better contrast
            "drop-shadow-2xl",
            // Text stroke for additional contrast (webkit browsers)
            "[text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]",
            // Margin bottom
            "mb-6",
          )}>
            {t("hero.title")}
          </h1>

          {/* Subtitle with enhanced visibility */}
          <p className={cn(
            "text-xl md:text-2xl lg:text-3xl",
            "font-medium leading-relaxed",
            // Enhanced text shadow
            "drop-shadow-xl",
            "[text-shadow:_1px_1px_3px_rgb(0_0_0_/_70%)]",
            "text-amber-200",
            "mb-6"
          )}>
            {t("hero.subtitle")}
          </p>

          {/* Description text with better contrast */}
          <p className={cn(
            "text-lg md:text-xl",
            "font-normal leading-relaxed",
            // Enhanced text shadow for description
            "drop-shadow-lg",
            "[text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)]",
            "text-stone-100",
            "max-w-2xl mx-auto",
            "mb-8"
          )}>
            {t("hero.description")}
          </p>

          {/* CTA Button with amber-600 background and hover states */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={`/${locale}/products`}>
              <Button
                size="lg"
                className={cn(
                  // Amber-600 background with hover states
                  "bg-amber-600 hover:bg-amber-700 active:bg-amber-800",
                  "text-white font-medium",
                  // Enhanced padding for hero CTA
                  "px-8 py-4 text-lg",
                  // Shadow and transitions
                  "shadow-lg hover:shadow-xl",
                  "transition-all duration-300",
                  // Focus states
                  "focus-visible:ring-amber-500/0 focus-visible:ring-offset-2",
                  // High contrast mode support
                  "high-contrast:bg-ButtonText high-contrast:text-ButtonFace",
                  "high-contrast:border-2 high-contrast:border-ButtonText"
                )}
              >
                {t("hero.cta")}
              </Button>
            </Link>

            {/* Secondary CTA - Contact button */}
            <Link href={`/${locale}/contact`}>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  // Outline styling with white border and text
                  "border-2 border-white/80 text-white bg-transparent",
                  "hover:bg-white/10 hover:border-white",
                  "active:bg-white/20",
                  // Enhanced padding
                  "px-8 py-4 text-lg font-medium",
                  // Transitions
                  "transition-all duration-300",
                  // Focus states
                  "focus-visible:ring-white/20 focus-visible:ring-offset-2",
                  // High contrast mode support
                  "high-contrast:border-ButtonText high-contrast:text-ButtonText"
                )}
              >
                {t("contactUs")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Accessibility: Screen reader only content for context */}
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
