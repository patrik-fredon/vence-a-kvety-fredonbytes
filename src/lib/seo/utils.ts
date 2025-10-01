/**
 * SEO utility functions for URL generation and optimization
 */

/**
 * Generate canonical URL for a given path and locale
 */
export function generateCanonicalUrl(path: string, locale: string): string {
  const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || "https://pohrebni-vence.cz";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}/${locale}${cleanPath}`;
}

/**
 * Generate alternate language URLs
 */
export function generateAlternateUrls(path: string): Record<string, string> {
  const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || "https://pohrebni-vence.cz";
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
  return (
    text
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
      .replace(/-+/g, "-")
  );
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
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "will",
    "with",
    "the",
    "this",
    "but",
    "they",
    "have",
    "had",
    "what",
    "said",
    "each",
    "which",
    "she",
    "do",
    "how",
    "their",
    "if",
    "up",
    "out",
    "many",
    "then",
    "them",
    "these",
    "so",
    "some",
    // Czech common words
    "a",
    "aby",
    "aj",
    "ak",
    "ako",
    "ale",
    "alebo",
    "and",
    "ani",
    "áno",
    "asi",
    "až",
    "bez",
    "bude",
    "budem",
    "budeš",
    "budeme",
    "budete",
    "budú",
    "by",
    "byť",
    "čas",
    "či",
    "čo",
    "či",
    "čím",
    "čo",
    "že",
    "do",
    "ho",
    "ich",
    "je",
    "jeho",
    "jej",
    "ich",
    "im",
    "ja",
    "je",
    "jedna",
    "jeden",
    "jedno",
    "jej",
    "jeho",
    "ich",
    "jej",
    "ju",
    "už",
  ]);

  const words = cleanContent
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.has(word))
    .filter((word) => /^[a-záčďéěíňóřšťúůýž]+$/i.test(word));

  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach((word) => {
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
export function generateOgImageUrl(title: string, subtitle?: string, imageUrl?: string): string {
  const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || "https://pohrebni-vence.cz";

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
    if (!(data["@context"] && data["@type"])) {
      return false;
    }

    // Validate JSON structure
    JSON.stringify(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate dynamic Open Graph image URL
 */
export function generateDynamicOgImage(params: {
  title: string;
  subtitle?: string;
  category?: string;
  price?: number;
  locale: string;
}): string {
  const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || "https://pohrebni-vence.cz";

  const searchParams = new URLSearchParams({
    title: params.title.substring(0, 60),
    locale: params.locale,
    ...(params.subtitle && { subtitle: params.subtitle.substring(0, 80) }),
    ...(params.category && { category: params.category }),
    ...(params.price && { price: params.price.toString() }),
  });

  return `${baseUrl}/api/og?${searchParams.toString()}`;
}

/**
 * Generate enhanced meta tags for different page types
 */
export function generateEnhancedMetaTags(params: {
  title: string;
  description: string;
  keywords?: string[];
  locale: string;
  path: string;
  type?: "website" | "product" | "article" | "profile";
  image?: string;
  price?: number;
  availability?: string;
  brand?: string;
  category?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || "https://pohrebni-vence.cz";
  const fullUrl = `${baseUrl}/${params.locale}${params.path}`;

  const metaTags: Record<string, string> = {
    // Basic meta tags
    title: params.title,
    description: params.description,
    robots: "index, follow",
    canonical: fullUrl,
    language: params.locale === "cs" ? "cs-CZ" : "en-US",

    // Open Graph
    "og:type": params.type || "website",
    "og:title": params.title,
    "og:description": params.description,
    "og:url": fullUrl,
    "og:site_name": "Pohřební věnce | Ketingmar s.r.o.",
    "og:locale": params.locale === "cs" ? "cs_CZ" : "en_US",
    "og:locale:alternate": params.locale === "cs" ? "en_US" : "cs_CZ",

    // Twitter Card
    "twitter:card": "summary_large_image",
    "twitter:title": params.title,
    "twitter:description": params.description,
    "twitter:site": "@ketingmar", // Add when available
    "twitter:creator": "@ketingmar",

    // Additional meta tags
    "theme-color": "#1f2937",
    "msapplication-TileColor": "#1f2937",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
  };

  // Add keywords if provided
  if (params.keywords && params.keywords.length > 0) {
    metaTags["keywords"] = params.keywords.join(", ");
  }

  // Add image if provided
  if (params.image) {
    const imageUrl = params.image.startsWith("http") ? params.image : `${baseUrl}${params.image}`;
    metaTags["og:image"] = imageUrl;
    metaTags["og:image:width"] = "1200";
    metaTags["og:image:height"] = "630";
    metaTags["og:image:alt"] = params.title;
    metaTags["twitter:image"] = imageUrl;
  }

  // Product-specific meta tags
  if (params.type === "product") {
    if (params.price) {
      metaTags["product:price:amount"] = params.price.toString();
      metaTags["product:price:currency"] = "CZK";
    }
    if (params.availability) {
      metaTags["product:availability"] = params.availability;
    }
    if (params.brand) {
      metaTags["product:brand"] = params.brand;
    }
    if (params.category) {
      metaTags["product:category"] = params.category;
    }
  }

  // Article-specific meta tags
  if (params.type === "article") {
    if (params.publishedTime) {
      metaTags["article:published_time"] = params.publishedTime;
    }
    if (params.modifiedTime) {
      metaTags["article:modified_time"] = params.modifiedTime;
    }
    if (params.author) {
      metaTags["article:author"] = params.author;
    }
  }

  return metaTags;
}

/**
 * Generate JSON-LD script tag
 */
export function generateJsonLdScript(data: any): string {
  if (!validateStructuredData(data)) {
    console.warn("Invalid structured data provided");
    return "";
  }

  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}

/**
 * Optimize URL structure for SEO
 */
export function optimizeUrlStructure(path: string, params?: Record<string, any>): string {
  let optimizedPath = path;

  // Remove trailing slashes
  optimizedPath = optimizedPath.replace(/\/+$/, "");

  // Ensure leading slash
  if (!optimizedPath.startsWith("/")) {
    optimizedPath = "/" + optimizedPath;
  }

  // Clean up double slashes
  optimizedPath = optimizedPath.replace(/\/+/g, "/");

  // Add clean query parameters if provided
  if (params && Object.keys(params).length > 0) {
    const cleanParams = cleanUrlParams(params);
    const searchParams = new URLSearchParams(cleanParams);
    const queryString = searchParams.toString();

    if (queryString) {
      optimizedPath += "?" + queryString;
    }
  }

  return optimizedPath;
}

/**
 * Generate hreflang attributes for multilingual pages
 */
export function generateHreflangAttributes(path: string): Record<string, string> {
  const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || "https://pohrebni-vence.cz";

  return {
    cs: `${baseUrl}/cs${path}`,
    en: `${baseUrl}/en${path}`,
    "x-default": `${baseUrl}/cs${path}`, // Default to Czech
  };
}

/**
 * Calculate reading time for content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate schema markup for reviews/ratings
 */
export function generateReviewSchema(
  reviews: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>,
  itemName: string
): any {
  if (reviews.length === 0) return null;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: itemName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished,
    })),
  };
}
