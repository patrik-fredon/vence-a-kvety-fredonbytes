import type { Metadata } from "next";
import { generateHreflangAttributes } from "@/lib/seo/utils";

interface PageMetadataProps {
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
  noIndex?: boolean;
  canonicalUrl?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: "website" | "article" | "profile" | "book";
  };
}

/**
 * Generate comprehensive metadata for different page types
 */
export function generatePageMetadata(props: PageMetadataProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";
  const fullUrl = props.canonicalUrl || `${baseUrl}/${props.locale}${props.path}`;

  // Generate enhanced meta tags
  // const metaTags = generateEnhancedMetaTags(props); // TODO: Use this for enhanced meta tags

  // Generate hreflang attributes
  const hreflangUrls = generateHreflangAttributes(props.path);

  const metadata: Metadata = {
    title: props.title,
    description: props.description,
    keywords: props.keywords,
    authors: [{ name: "Ketingmar s.r.o." }],
    creator: "Ketingmar s.r.o.",
    publisher: "Ketingmar s.r.o.",
    robots: props.noIndex ? "noindex, nofollow" : "index, follow",
    alternates: {
      canonical: fullUrl,
      languages: hreflangUrls,
    },
    openGraph: {
      type: (props.openGraph?.type as any) || "website",
      locale: props.locale === "cs" ? "cs_CZ" : "en_US",
      alternateLocale: props.locale === "cs" ? "en_US" : "cs_CZ",
      title: props.openGraph?.title || props.title,
      description: props.openGraph?.description || props.description,
      siteName:
        props.locale === "cs"
          ? "Pohřební věnce | Ketingmar s.r.o."
          : "Funeral Wreaths | Ketingmar s.r.o.",
      url: fullUrl,
      images: props.image
        ? [
            {
              url: props.image.startsWith("http") ? props.image : `${baseUrl}${props.image}`,
              width: 1200,
              height: 630,
              alt: props.openGraph?.title || props.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: props.title,
      description: props.description,
      images: props.image
        ? [props.image.startsWith("http") ? props.image : `${baseUrl}${props.image}`]
        : [],
      site: "@ketingmar", // Add when Twitter account is available
      creator: "@ketingmar",
    },
    other: {
      // Theme and app meta tags
      "theme-color": "#1f2937",
      "msapplication-TileColor": "#1f2937",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "format-detection": "telephone=no",

      // Product-specific meta tags
      ...(props.type === "product" &&
        props.price && {
          "product:price:amount": props.price.toString(),
          "product:price:currency": "CZK",
        }),
      ...(props.type === "product" &&
        props.availability && {
          "product:availability": props.availability,
        }),
      ...(props.type === "product" &&
        props.brand && {
          "product:brand": props.brand,
        }),
      ...(props.type === "product" &&
        props.category && {
          "product:category": props.category,
        }),

      // Article-specific meta tags
      ...(props.type === "article" &&
        props.publishedTime && {
          "article:published_time": props.publishedTime,
        }),
      ...(props.type === "article" &&
        props.modifiedTime && {
          "article:modified_time": props.modifiedTime,
        }),
      ...(props.type === "article" &&
        props.author && {
          "article:author": props.author,
        }),
    },
  };

  return metadata;
}

/**
 * Generate metadata specifically for product pages
 */
export function generateProductMetadata(params: {
  product: {
    name: string;
    description?: string;
    price: number;
    category?: string;
    images?: Array<{ url: string; alt?: string }>;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
    sku?: string;
    brand?: string;
  };
  locale: string;
  slug: string;
  keywords?: string[];
}): Metadata {
  const { product, locale, slug, keywords } = params;

  // Enhanced title with category context
  const categoryText = product.category ? ` | ${product.category}` : "";
  const title = `${product.name}${categoryText} | Pohřební věnce`;

  // Enhanced description
  const description =
    product.description ||
    `${product.name} - prémiové pohřební věnce a květinové aranžmá od Ketingmar s.r.o. Ruční výroba, rychlé dodání.`;

  // Generate product-specific keywords
  const productKeywords = [
    product.name.toLowerCase(),
    ...(product.category ? [product.category.toLowerCase()] : []),
    "pohřební věnce",
    "květinové aranžmá",
    "pohřeb",
    "rozloučení",
    "věnce",
    "ketingmar",
    ...(keywords || []),
  ].filter(Boolean);

  const imageUrl = product.images?.[0]?.url;

  return generatePageMetadata({
    title,
    description,
    keywords: productKeywords,
    locale,
    path: `/products/${slug}`,
    type: "product",
    ...(imageUrl && { image: imageUrl }),
    price: product.price,
    availability:
      product.availability === "InStock"
        ? "in stock"
        : product.availability === "OutOfStock"
          ? "out of stock"
          : "preorder",
    brand: product.brand || "Ketingmar s.r.o.",
    ...(product.category && { category: product.category }),
  });
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata(params: {
  category: {
    name: string;
    description?: string;
    productCount: number;
  };
  locale: string;
  slug: string;
  keywords?: string[];
}): Metadata {
  const { category, locale, slug, keywords } = params;

  const title = `${category.name} | Pohřební věnce | Ketingmar s.r.o.`;
  const description =
    category.description ||
    `Prohlédněte si naši kolekci ${category.name.toLowerCase()}. ${category.productCount} produktů k dispozici. Ruční výroba, rychlé dodání.`;

  const categoryKeywords = [
    category.name.toLowerCase(),
    "pohřební věnce",
    "květinové aranžmá",
    "kategorie",
    "kolekce",
    ...(keywords || []),
  ].filter(Boolean);

  return generatePageMetadata({
    title,
    description,
    keywords: categoryKeywords,
    locale,
    path: `/products?category=${slug}`,
    type: "website",
  });
}

/**
 * Generate metadata for homepage using i18n content
 */
export async function generateHomepageMetadata(locale: string): Promise<Metadata> {
  // Import translations dynamically
  const messages = await import(`../../../messages/${locale}.json`);
  const seoData = messages.default.seo.home;

  return generatePageMetadata({
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    locale,
    path: "",
    type: "website",
    image: "/og-homepage.jpg",
    openGraph: seoData.openGraph,
  });
}

/**
 * Generate metadata for FAQ page using i18n content
 */
export async function generateFAQPageMetadata(locale: string): Promise<Metadata> {
  // Import translations dynamically
  const messages = await import(`../../../messages/${locale}.json`);
  const seoData = messages.default.seo.faq;

  return generatePageMetadata({
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    locale,
    path: "/faq",
    type: "website",
    openGraph: seoData.openGraph,
  });
}

/**
 * Generate metadata for legal page using i18n content
 */
export async function generateLegalMetadata(locale: string): Promise<Metadata> {
  const title =
    locale === "cs"
      ? "Právní informace - Obchodní podmínky, GDPR | Pohřební věnce"
      : "Legal Information - Terms, GDPR | Funeral Wreaths";

  const description =
    locale === "cs"
      ? "Obchodní podmínky, ochrana osobních údajů, GDPR a informace o cookies pro pohřební věnce a květinové aranžmá."
      : "Terms and conditions, privacy policy, GDPR and cookie information for funeral wreaths and floral arrangements.";

  const keywords =
    locale === "cs"
      ? [
          "obchodní podmínky",
          "GDPR",
          "ochrana údajů",
          "cookies",
          "pohřební věnce",
          "právní informace",
        ]
      : [
          "terms conditions",
          "GDPR",
          "privacy policy",
          "cookies",
          "funeral wreaths",
          "legal information",
        ];

  return generatePageMetadata({
    title,
    description,
    keywords,
    locale,
    path: "/legal",
    type: "website",
  });
}

/**
 * Generate metadata for About page using i18n content
 */
export async function generateAboutPageMetadata(locale: string): Promise<Metadata> {
  // Import translations dynamically
  const messages = await import(`../../../messages/${locale}.json`);
  const seoData = messages.default.seo.aboutPage;

  return generatePageMetadata({
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    locale,
    path: "/about",
    type: "website",
    openGraph: seoData.openGraph,
  });
}
