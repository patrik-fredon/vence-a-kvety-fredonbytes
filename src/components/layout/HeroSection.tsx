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
      {/* Stone-900/40 overlay for proper text contrast */}
      <div
        className="absolute inset-0 bg-stone-900/40"
        aria-hidden="true"
      />

      {/* Content container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main heading with responsive typography scaling (4xl to 5xl) */}
        <h1 className={cn(
          // Responsive font sizes: 4xl on mobile, 5xl on larger screens
          "text-4xl lg:text-5xl xl:text-6xl",
          // Typography styling
          "font-light leading-tight tracking-wide",
          // Margin bottom
          "mb-6",
          // Text color with amber accent support
          "text-white"
        )}>
          {t("hero.title")}
        </h1>

        {/* Subtitle with elegant styling */}
        <p className={cn(
          "text-xl md:text-2xl lg:text-3xl",
          "font-light leading-relaxed",
          "text-amber-200", // Amber accent for subtitle
          "mb-6"
        )}>
          {t("hero.subtitle")}
        </p>

        {/* Description text */}
        <p className={cn(
          "text-lg md:text-xl",
          "font-light leading-relaxed",
          "text-white/90",
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
                "focus-visible:ring-amber-500/20 focus-visible:ring-offset-2",
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
