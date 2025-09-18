import { Metadata } from "next";
import { generateEnhancedMetaTags, generateHreflangAttributes } from "@/lib/seo/utils";

interface PageMetadataProps {
  title: string;
  description: string;
  keywords?: string[];
  locale: string;
  path: string;
  type?: 'website' | 'product' | 'article' | 'profile';
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
}

/**
 * Generate comprehensive metadata for different page types
 */
export function generatePageMetadata(props: PageMetadataProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";
  const fullUrl = props.canonicalUrl || `${baseUrl}/${props.locale}${props.path}`;

  // Generate enhanced meta tags
  const metaTags = generateEnhancedMetaTags(props);

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
      type: 'website',
      locale: props.locale === "cs" ? "cs_CZ" : "en_US",
      alternateLocale: props.locale === "cs" ? "en_US" : "cs_CZ",
      title: props.title,
      description: props.description,
      siteName: "Pohřební věnce | Ketingmar s.r.o.",
      url: fullUrl,
      images: props.image ? [
        {
          url: props.image.startsWith('http') ? props.image : `${baseUrl}${props.image}`,
          width: 1200,
          height: 630,
          alt: props.title,
        }
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: props.title,
      description: props.description,
      images: props.image ? [props.image.startsWith('http') ? props.image : `${baseUrl}${props.image}`] : [],
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
      ...(props.type === 'product' && props.price && {
        "product:price:amount": props.price.toString(),
        "product:price:currency": "CZK",
      }),
      ...(props.type === 'product' && props.availability && {
        "product:availability": props.availability,
      }),
      ...(props.type === 'product' && props.brand && {
        "product:brand": props.brand,
      }),
      ...(props.type === 'product' && props.category && {
        "product:category": props.category,
      }),

      // Article-specific meta tags
      ...(props.type === 'article' && props.publishedTime && {
        "article:published_time": props.publishedTime,
      }),
      ...(props.type === 'article' && props.modifiedTime && {
        "article:modified_time": props.modifiedTime,
      }),
      ...(props.type === 'article' && props.author && {
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
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    sku?: string;
    brand?: string;
  };
  locale: string;
  slug: string;
  keywords?: string[];
}): Metadata {
  const { product, locale, slug, keywords } = params;

  // Enhanced title with category context
  const categoryText = product.category ? ` | ${product.category}` : '';
  const title = `${product.name}${categoryText} | Pohřební věnce`;

  // Enhanced description
  const description = product.description ||
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
    ...(keywords || [])
  ].filter(Boolean);

  return generatePageMetadata({
    title,
    description,
    keywords: productKeywords,
    locale,
    path: `/products/${slug}`,
    type: 'product',
    image: product.images?.[0]?.url,
    price: product.price,
    availability: product.availability === 'InStock' ? 'in stock' :
      product.availability === 'OutOfStock' ? 'out of stock' : 'preorder',
    brand: product.brand || 'Ketingmar s.r.o.',
    category: product.category,
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
  const description = category.description ||
    `Prohlédněte si naši kolekci ${category.name.toLowerCase()}. ${category.productCount} produktů k dispozici. Ruční výroba, rychlé dodání.`;

  const categoryKeywords = [
    category.name.toLowerCase(),
    "pohřební věnce",
    "květinové aranžmá",
    "kategorie",
    "kolekce",
    ...(keywords || [])
  ].filter(Boolean);

  return generatePageMetadata({
    title,
    description,
    keywords: categoryKeywords,
    locale,
    path: `/products?category=${slug}`,
    type: 'website',
  });
}

/**
 * Generate metadata for homepage
 */
export function generateHomepageMetadata(locale: string): Metadata {
  const title = locale === 'cs'
    ? "Pohřební věnce | Ketingmar s.r.o. | Prémiové květinové aranžmá"
    : "Funeral Wreaths | Ketingmar s.r.o. | Premium Floral Arrangements";

  const description = locale === 'cs'
    ? "Prémiové pohřební věnce a květinové aranžmá. Ruční výroba, pečlivý výběr květin, rychlé dodání. Pomáháme vám vyjádřit úctu a lásku v těžkých chvílích."
    : "Premium funeral wreaths and floral arrangements. Handcrafted, careful flower selection, fast delivery. We help you express respect and love in difficult times.";

  const keywords = locale === 'cs'
    ? ["pohřební věnce", "květinové aranžmá", "pohřeb", "rozloučení", "věnce", "ruční výroba", "rychlé dodání", "ketingmar"]
    : ["funeral wreaths", "floral arrangements", "funeral", "farewell", "wreaths", "handcrafted", "fast delivery", "ketingmar"];

  return generatePageMetadata({
    title,
    description,
    keywords,
    locale,
    path: '',
    type: 'website',
    image: '/og-homepage.jpg', // Create this image
  });
}

/**
 * Generate metadata for FAQ page
 */
export function generateFAQPageMetadata(locale: string): Metadata {
  const title = locale === 'cs'
    ? "Často kladené otázky | Pohřební věnce | Ketingmar s.r.o."
    : "Frequently Asked Questions | Funeral Wreaths | Ketingmar s.r.o.";

  const description = locale === 'cs'
    ? "Odpovědi na nejčastější otázky o pohřebních věncích - skladování, výdrž květin, recyklace. Praktické rady pro péči o smuteční věnce."
    : "Answers to the most common questions about funeral wreaths - storage, flower longevity, recycling. Practical advice for memorial wreath care.";

  const keywords = locale === 'cs'
    ? ["FAQ pohřební věnce", "péče o věnce", "skladování věnců", "výdrž květin", "recyklace věnců", "rady floristů"]
    : ["FAQ funeral wreaths", "wreath care", "wreath storage", "flower longevity", "wreath recycling", "florist advice"];

  return generatePageMetadata({
    title,
    description,
    keywords,
    locale,
    path: '/faq',
    type: 'website',
  });
}

/**
 * Generate metadata for About page
 */
export function generateAboutPageMetadata(locale: string): Metadata {
  const title = locale === 'cs'
    ? "O nás | Rodinná květinová dílnička | Ketingmar s.r.o."
    : "About Us | Family Floral Workshop | Ketingmar s.r.o.";

  const description = locale === 'cs'
    ? "Jsme malá rodinná květinová dílnička s dlouholetými zkušenostmi. Specializujeme se na pohřební věnce a smuteční květinové aranžmá s důrazem na kvalitu a detail."
    : "Small family floral workshop with years of experience. We specialize in funeral wreaths and memorial arrangements with emphasis on quality and detail.";

  const keywords = locale === 'cs'
    ? ["rodinná květinová dílnička", "zkušení floristé", "specializace pohřební věnce", "kvalitní květinové aranžmá", "osobní přístup", "Praha květinářství"]
    : ["family floral workshop", "experienced florists", "funeral wreaths specialization", "quality floral arrangements", "personal approach", "Prague florist"];

  return generatePageMetadata({
    title,
    description,
    keywords,
    locale,
    path: '/about',
    type: 'website',
  });
}
