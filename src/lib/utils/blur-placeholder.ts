/**
 * Blur Placeholder Utility
 * 
 * Generates optimized blur placeholders for images to prevent layout shift
 * and improve perceived performance.
 * 
 * @module blur-placeholder
 */

/**
 * Generate a blur data URL for image placeholders
 * Uses a gradient with funeral-appropriate colors from the design system
 * 
 * @param width - Width of the placeholder (default: 8)
 * @param height - Height of the placeholder (default: 8)
 * @param colors - Optional custom colors for the gradient
 * @returns Base64-encoded SVG data URL
 */
export function generateBlurDataURL(
  width: number = 8,
  height: number = 8,
  colors?: { start: string; end: string }
): string {
  // Use stone palette colors from the centralized color system
  const defaultColors = {
    start: "#f5f5f4", // stone-100
    end: "#e7e5e4", // stone-200
  };

  const { start, end } = colors || defaultColors;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${start};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${end};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * Generate a blur data URL with funeral-appropriate teal/amber colors
 * 
 * @param width - Width of the placeholder (default: 8)
 * @param height - Height of the placeholder (default: 8)
 * @returns Base64-encoded SVG data URL
 */
export function generateFuneralBlurDataURL(
  width: number = 8,
  height: number = 8
): string {
  return generateBlurDataURL(width, height, {
    start: "#134e4a", // teal-900
    end: "#0f766e", // teal-700
  });
}

/**
 * Generate a blur data URL with gold/amber colors for hero images
 * 
 * @param width - Width of the placeholder (default: 8)
 * @param height - Height of the placeholder (default: 8)
 * @returns Base64-encoded SVG data URL
 */
export function generateGoldBlurDataURL(
  width: number = 8,
  height: number = 8
): string {
  return generateBlurDataURL(width, height, {
    start: "#fef3c7", // amber-100
    end: "#fde68a", // amber-200
  });
}

/**
 * Predefined blur placeholders for common use cases
 */
export const BLUR_PLACEHOLDERS = {
  /** Default neutral blur placeholder */
  default: generateBlurDataURL(),
  /** Funeral-themed teal blur placeholder */
  funeral: generateFuneralBlurDataURL(),
  /** Gold/amber blur placeholder for hero images */
  gold: generateGoldBlurDataURL(),
  /** Logo placeholder with transparent background */
  logo: `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="transparent" />
    </svg>`
  ).toString("base64")}`,
} as const;
