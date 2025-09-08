import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary funeral wreaths color palette
        primary: {
          50: "#f8f7f4",
          100: "#f0ede6",
          200: "#e1dbc9",
          300: "#cfc4a4",
          400: "#bba87f",
          500: "#a89165",
          600: "#9a7f58",
          700: "#80694b",
          800: "#695642",
          900: "#564738",
          950: "#2f251d",
        },
        // Secondary colors for accents and highlights
        secondary: {
          50: "#f4f3f1",
          100: "#e6e4e0",
          200: "#cfc9c1",
          300: "#b3a99c",
          400: "#9a8c7a",
          500: "#8a7c6a",
          600: "#7a6d5c",
          700: "#65594d",
          800: "#544a42",
          900: "#473f39",
          950: "#25211d",
        },
        // Neutral colors for text and backgrounds
        neutral: {
          50: "#fafaf9",
          100: "#f4f4f3",
          200: "#e5e5e4",
          300: "#d1d1cf",
          400: "#b2b2b0",
          500: "#9a9a97",
          600: "#82827f",
          700: "#6b6b68",
          800: "#585856",
          900: "#4a4a48",
          950: "#262625",
        },
        // Accent colors for flowers and decorative elements
        accent: {
          rose: {
            50: "#fdf2f8",
            100: "#fce7f3",
            200: "#fbcfe8",
            300: "#f9a8d4",
            400: "#f472b6",
            500: "#ec4899",
            600: "#db2777",
            700: "#be185d",
            800: "#9d174d",
            900: "#831843",
          },
          lily: {
            50: "#fefce8",
            100: "#fef9c3",
            200: "#fef08a",
            300: "#fde047",
            400: "#facc15",
            500: "#eab308",
            600: "#ca8a04",
            700: "#a16207",
            800: "#854d0e",
            900: "#713f12",
          },
          sage: {
            50: "#f0f9f0",
            100: "#dcf2dc",
            200: "#bce5bc",
            300: "#8fd18f",
            400: "#5bb55b",
            500: "#389e38",
            600: "#2a7f2a",
            700: "#246524",
            800: "#215121",
            900: "#1d431d",
          },
        },
        // Status colors
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        elegant: "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)",
        memorial: "0 8px 40px -12px rgba(0, 0, 0, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
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
      },
    },
  },
  plugins: [],
};

export default config;
