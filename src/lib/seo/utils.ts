/**
 * SEO utility functions for URL generation and optimization
 */

/**
 * Generate canonical URL for a given path and locale
 */
export function generateCanonicalUrl(path: string, locale: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}/${locale}${cleanPath}`;
}

/**
 * Generate alternate language URLs
 */
export function generateAlternateUrls(path: string): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return {
    cs: `${baseUrl}/cs${cleanPath}`,
    en: `${baseUrl}/en${cleanPath}`,
  };
}

/**
 * Generate SEO-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Czech characters
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/[ýÿ]/g, "y")
    .replace(/[ň]/g, "n")
    .replace(/[č]/g, "c")
    .replace(/[ř]/g, "r")
    .replace(/[š]/g, "s")
    .replace(/[ť]/g, "t")
    .replace(/[ž]/g, "z")
    .replace(/[ď]/g, "d")
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, "-");
}

/**
 * Validate and clean URL parameters for SEO
 */
export function cleanUrlParams(params: Record<string, any>): Record<string, string> {
  const cleaned: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      // Convert arrays to comma-separated strings
      if (Array.isArray(value)) {
        cleaned[key] = value.join(",");
      } else {
        cleaned[key] = String(value);
      }
    }
  }

  return cleaned;
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const cleanContent = content.replace(/<[^>]*>/g, "");

  // Truncate to max length
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete word within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + "...";
  }

  return truncated + "...";
}

/**
 * Generate keywords from text content
 */
export function extractKeywords(content: string, maxKeywords: number = 10): string[] {
  // Remove HTML tags and convert to lowercase
  const cleanContent = content.replace(/<[^>]*>/g, "").toLowerCase();

  // Split into words and filter out common words
  const commonWords = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
    "to", "was", "will", "with", "the", "this", "but", "they", "have",
    "had", "what", "said", "each", "which", "she", "do", "how", "their",
    "if", "up", "out", "many", "then", "them", "these", "so", "some",
    // Czech common words
    "a", "aby", "aj", "ak", "ako", "ale", "alebo", "and", "ani", "áno",
    "asi", "až", "bez", "bude", "budem", "budeš", "budeme", "budete",
    "budú", "by", "byť", "čas", "či", "čo", "či", "čím", "čo", "že",
    "do", "ho", "ich", "je", "jeho", "jej", "ich", "im", "ja", "je",
    "jedna", "jeden", "jedno", "jej", "jeho", "ich", "jej", "ju", "už"
  ]);

  const words = cleanContent
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .filter(word => /^[a-záčďéěíňóřšťúůýž]+$/i.test(word));

  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Sort by frequency and return top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Generate Open Graph image URL
 */
export function generateOgImageUrl(
  title: string,
  subtitle?: string,
  imageUrl?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";

  // If a specific image is provided, use it
  if (imageUrl) {
    return imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`;
  }

  // Generate dynamic OG image URL (you would implement this with a service like Vercel OG)
  const params = new URLSearchParams({
    title: title.substring(0, 60), // Limit title length
    ...(subtitle && { subtitle: subtitle.substring(0, 80) }),
  });

  return `${baseUrl}/api/og?${params.toString()}`;
}

/**
 * Validate structured data
 */
export function validateStructuredData(data: any): boolean {
  try {
    // Basic validation - check for required @context and @type
    if (!data["@context"] || !data["@type"]) {
      return false;
    }

    // Validate JSON structure
    JSON.stringify(data);
    return true;
  } catch {
    return false;
  }
}
