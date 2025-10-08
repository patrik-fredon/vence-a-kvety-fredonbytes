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
      colors: {
        "fb-blue": {
          500: "#3b82f6", // Example blue, adjust based on final design
          600: "#2563eb",
        },
        "fb-yellow": {
          400: "#fbbf24", // Example yellow/gold
          500: "#f59e0b",
        },
        "fb-dark": {
          800: "#1f2937", // Example dark background color
          900: "#111827",
        },
        "fb-light": {
          100: "#f3f4f6", // Example light text
          300: "#d1d5db",
        },
      },

      // Custom responsive breakpoints for mobile-first design
      screens: {
        xs: "475px", // Extra small screens (larger phones)
        // Default breakpoints are still available: sm, md, lg, xl, 2xl
      },
      fontFamily: {
         sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
         serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
         mono: ["Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
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
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
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
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
