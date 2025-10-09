/**
 * Fallback utilities for error handling and graceful degradation
 * Provides fallback images, translations, and error recovery functions
 */

// Fallback images for different scenarios
export const FALLBACK_IMAGES = {
  logo: {
    src: "/logo.svg",
    alt: "Company Logo",
    width: 400,
    height: 400,
  },
  logoSvg: `data:image/svg+xml;base64,${Buffer.from(
    `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120">
      <rect width="200" height="120" fill="#102724" rx="8"/>
      <text x="100" y="60" text-anchor="middle" dominant-baseline="middle"
            fill="white" font-family="serif" font-size="16" font-weight="bold">
        Funeral Wreaths
      </text>
      <circle cx="50" cy="30" r="8" fill="#9B9259" opacity="0.7"/>
      <circle cx="150" cy="30" r="8" fill="#9B9259" opacity="0.7"/>
      <circle cx="50" cy="90" r="8" fill="#9B9259" opacity="0.7"/>
      <circle cx="150" cy="90" r="8" fill="#9B9259" opacity="0.7"/>
    </svg>
  `
  ).toString("base64")}`,
  product: {
    src: "https://cdn.fredonbytes.com/cross-shaped-funeral-arrangement-red-white-roses-black-ribbon_thumb.webp",
    alt: "Funeral Wreath",
    width: 400,
    height: 400,
  },
  productSvg: `data:image/svg+xml;base64,${Buffer.from(
    `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f3f4f6" rx="8"/>
      <circle cx="200" cy="200" r="120" fill="none" stroke="#9B9259" stroke-width="8"/>
      <circle cx="200" cy="120" r="12" fill="#8B4513"/>
      <circle cx="280" cy="200" r="12" fill="#8B4513"/>
      <circle cx="200" cy="280" r="12" fill="#8B4513"/>
      <circle cx="120" cy="200" r="12" fill="#8B4513"/>
      <circle cx="240" cy="160" r="8" fill="#228B22"/>
      <circle cx="240" cy="240" r="8" fill="#228B22"/>
      <circle cx="160" cy="240" r="8" fill="#228B22"/>
      <circle cx="160" cy="160" r="8" fill="#228B22"/>
      <text x="200" y="350" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="14">
        Funeral Wreath
      </text>
    </svg>
  `
  ).toString("base64")}`,
} as const;

// Fallback translations for different locales
export const FALLBACK_TRANSLATIONS = {
  en: {
    "home.refactoredHero.heading": "Funeral wreaths with love and respect",
    "home.refactoredHero.subheading": "Beautiful floral arrangements for dignified farewell",
    "home.refactoredHero.description": "Beautiful floral arrangements for dignified farewell",
    "home.refactoredHero.cta": "Browse Wreaths",
    "home.refactoredHero.ctaAriaLabel": "Navigate to funeral wreaths page",
    "home.refactoredHero.ctaButton": "Browse Wreaths",
    "home.refactoredHero.logoAlt": "Company logo specializing in funeral wreaths",
    "accessibility.accessibility": "Accessibility",
    "home.productReferences.heading": "Our Products",
    "home.productReferences.description": "Discover our carefully curated collection",
    "home.productReferences.loading": "Loading products...",
    "home.productReferences.loadingError": "Failed to load products",
    "home.productReferences.tryAgain": "Try again",
    "home.productReferences.productImageAlt": "Funeral wreath from our collection",
    "common.loading": "Loading...",
    "common.error": "Error",
  },
  cs: {
    "home.refactoredHero.heading": "Pohřební věnce s láskou a úctou",
    "home.refactoredHero.subheading": "Krásné květinové aranžmá pro důstojné rozloučení",
    "home.refactoredHero.description": "Krásné květinové aranžmá pro důstojné rozloučení",
    "home.refactoredHero.cta": "Prohlédnout věnce",
    "home.refactoredHero.ctaAriaLabel": "Přejít na stránku s pohřebními věnci",
    "home.refactoredHero.ctaButton": "Prohlédnout věnce",
    "home.refactoredHero.logoAlt": "Logo společnosti specializující se na pohřební věnce",
    "accessibility.accessibility": "Přístupnost",
    "home.productReferences.heading": "Naše produkty",
    "home.productReferences.description": "Objevte naši pečlivě vybranou kolekci",
    "home.productReferences.loading": "Načítání produktů...",
    "home.productReferences.loadingError": "Nepodařilo se načíst produkty",
    "home.productReferences.tryAgain": "Zkusit znovu",
    "home.productReferences.productImageAlt": "Pohřební věnec z naší kolekce",
    "common.loading": "Načítání...",
    "common.error": "Chyba",
  },
} as const;

/**
 * Get fallback translation for a given key and locale
 */
export function getFallbackTranslation(key: string, locale: string = "en"): string {
  const translations =
    FALLBACK_TRANSLATIONS[locale as keyof typeof FALLBACK_TRANSLATIONS] || FALLBACK_TRANSLATIONS.en;
  return translations[key as keyof typeof translations] || key;
}

/**
 * Safe translation function that provides fallbacks
 */
export function safeTranslate(
  translateFn: (key: string, values?: Record<string, any>) => string,
  key: string,
  locale: string = "en",
  values?: Record<string, any>
): string {
  try {
    const translation = translateFn(key, values);
    // Check if translation is just the key (indicating missing translation)
    if (translation === key || !translation) {
      return getFallbackTranslation(key, locale);
    }
    return translation;
  } catch (error) {
    console.warn(`Translation error for key "${key}":`, error);
    return getFallbackTranslation(key, locale);
  }
}

/**
 * Get fallback image configuration
 */
export function getFallbackImage(type: "logo" | "product"): {
  src: string;
  alt: string;
  width: number;
  height: number;
} {
  return FALLBACK_IMAGES[type];
}

/**
 * Get fallback SVG data URL
 */
export function getFallbackSvg(type: "logo" | "product"): string {
  return type === "logo" ? FALLBACK_IMAGES.logoSvg : FALLBACK_IMAGES.productSvg;
}

/**
 * Enhanced image error handler with fallback logic
 */
export function createImageErrorHandler(
  type: "logo" | "product",
  onError?: (error: Event) => void
) {
  return (event: Event) => {
    const img = event.target as HTMLImageElement;
    if (img && !img.dataset.fallbackApplied) {
      // Mark as fallback applied to prevent infinite loops
      img.dataset.fallbackApplied = "true";

      // Try the fallback image first
      const fallback = getFallbackImage(type);
      img.src = fallback.src;
      img.alt = fallback.alt;

      // If fallback image also fails, use SVG
      img.onerror = () => {
        if (!img.dataset.svgFallbackApplied) {
          img.dataset.svgFallbackApplied = "true";
          img.src = getFallbackSvg(type);
        }
      };
    }

    // Call custom error handler if provided
    onError?.(event);
  };
}

/**
 * Loading state configuration for different components
 */
export const LOADING_STATES = {
  hero: {
    minDuration: 100, // Minimum loading time to prevent flashing
    timeout: 5000, // Maximum loading time before showing error
  },
  products: {
    minDuration: 200,
    timeout: 10000,
  },
} as const;

/**
 * Error recovery actions for different error types
 */
export const ERROR_RECOVERY_ACTIONS = {
  imageLoad: {
    en: [
      {
        label: "Refresh page",
        action: () => window.location.reload(),
      },
      {
        label: "Go to products",
        action: () => (window.location.href = "/en/products"),
      },
    ],
    cs: [
      {
        label: "Obnovit stránku",
        action: () => window.location.reload(),
      },
      {
        label: "Přejít na produkty",
        action: () => (window.location.href = "/cs/products"),
      },
    ],
  },
  apiError: {
    en: [
      {
        label: "Try again",
        action: () => window.location.reload(),
      },
      {
        label: "Contact support",
        action: () => window.open("mailto:support@funeral-wreaths.com"),
      },
    ],
    cs: [
      {
        label: "Zkusit znovu",
        action: () => window.location.reload(),
      },
      {
        label: "Kontaktovat podporu",
        action: () => window.open("mailto:podpora@pohrebni-vence.cz"),
      },
    ],
  },
} as const;

/**
 * Get error recovery actions for a specific error type and locale
 */
export function getErrorRecoveryActions(
  errorType: keyof typeof ERROR_RECOVERY_ACTIONS,
  locale: string = "en"
) {
  const actions = ERROR_RECOVERY_ACTIONS[errorType];
  return actions[locale as keyof typeof actions] || actions.en;
}

/**
 * Debounced retry function to prevent rapid retry attempts
 */
export function createDebouncedRetry(fn: () => void, delay: number = 1000) {
  let timeoutId: NodeJS.Timeout;

  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(fn, delay);
  };
}

/**
 * Check if an error is recoverable
 */
export function isRecoverableError(error: Error): boolean {
  const recoverablePatterns = [/network/i, /fetch/i, /timeout/i, /connection/i, /load/i];

  return recoverablePatterns.some(
    (pattern) => pattern.test(error.message) || pattern.test(error.name)
  );
}

/**
 * Enhanced error logging with context
 */
export function logErrorWithContext(
  error: Error,
  context: {
    component?: string;
    action?: string;
    locale?: string;
    userId?: string;
    timestamp?: string;
  }
) {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context: {
      ...context,
      timestamp: context.timestamp || new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
    },
  };

  console.error("Component Error:", errorLog);

  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === "production") {
    // Example: Send to error reporting service
    // errorReportingService.log(errorLog);
  }
}
