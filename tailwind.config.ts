import type { Config } from "tailwindcss";
import { designTokens } from "./src/lib/design-tokens";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom responsive breakpoints for mobile-first design
      screens: {
        xs: "475px", // Extra small screens (larger phones)
        // Default breakpoints are still available: sm, md, lg, xl, 2xl
      },
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      lineHeight: designTokens.typography.lineHeight,
      letterSpacing: designTokens.typography.letterSpacing,
      spacing: {
        ...designTokens.spacing,
        // Additional custom spacing
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },
      borderRadius: {
        ...designTokens.borderRadius,
        "4xl": "2rem",
      },
      boxShadow: {
        ...designTokens.boxShadow,
        // Custom funeral-appropriate shadows
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        elegant: "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)",
        memorial: "0 8px 40px -12px rgba(0, 0, 0, 0.15)",
      },
      zIndex: designTokens.zIndex,
      transitionDuration: designTokens.animation.duration,
      transitionTimingFunction: designTokens.animation.timingFunction,
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        // Respectful, gentle animations for funeral context
        "gentle-fade": "gentleFade 0.8s ease-in-out",
        "soft-slide": "softSlide 0.6s ease-out",
        "memorial-glow": "memorialGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        gentleFade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        softSlide: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        memorialGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(45, 80, 22, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(45, 80, 22, 0.6)" },
        },
      },
      backgroundImage: {
        // Centralized gradient system for consistent branding
        "funeral-gold": "linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47)",
        "funeral-teal": "linear-gradient(to right, #0f766e, #14b8a6, #0d9488)",
      },
    },
  },
  plugins: [],
};

export default config;
