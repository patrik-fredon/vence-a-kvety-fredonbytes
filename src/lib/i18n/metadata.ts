import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { type Locale } from "@/i18n/config";

interface MetadataParams {
  locale: Locale;
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  image?: string;
}

/**
 * Generate localized metadata for pages
 */
export async function generateLocalizedMetadata({
  locale,
  title,
  description,
  keywords,
  path = "",
  image,
}: MetadataParams): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";
  const fullUrl = `${baseUrl}/${locale}${path}`;

  const defaultTitle = t("title");
  const defaultDescription = t("description");
  const defaultKeywords = t("keywords")
    .split(",")
    .map((k) => k.trim());

  const finalTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords ? [...keywords, ...defaultKeywords] : defaultKeywords;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: finalKeywords,
    authors: [{ name: "Ketingmar s.r.o." }],
    creator: "Ketingmar s.r.o.",
    publisher: "Ketingmar s.r.o.",
    robots: "index, follow",
    alternates: {
      canonical: fullUrl,
      languages: {
        cs: `${baseUrl}/cs${path}`,
        en: `${baseUrl}/en${path}`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "cs" ? "cs_CZ" : "en_US",
      alternateLocale: locale === "cs" ? "en_US" : "cs_CZ",
      title: finalTitle,
      description: finalDescription,
      siteName: defaultTitle,
      url: fullUrl,
      images: image
        ? [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: finalTitle,
          },
        ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: image ? [image] : undefined,
    },
  };
}

/**
 * Generate enhanced metadata with SEO optimizations
 */
export async function generateEnhancedMetadata({
  locale,
  title,
  description,
  keywords,
  path = "",
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
}: MetadataParams & {
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}): Promise<Metadata> {
  const baseMetadata = await generateLocalizedMetadata({
    locale,
    title,
    description,
    keywords,
    path,
    image,
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";
  const fullUrl = `${baseUrl}/${locale}${path}`;

  // Enhanced metadata with additional SEO properties
  return {
    ...baseMetadata,
    category: "e-commerce",
    classification: "funeral services, floral arrangements",
    other: {
      "og:type": type,
      "og:site_name": "Pohřební věnce | Ketingmar s.r.o.",
      "og:locale": locale === "cs" ? "cs_CZ" : "en_US",
      "og:locale:alternate": locale === "cs" ? "en_US" : "cs_CZ",
      ...(publishedTime && { "article:published_time": publishedTime }),
      ...(modifiedTime && { "article:modified_time": modifiedTime }),
      ...(author && { "article:author": author }),
      "twitter:site": "@ketingmar", // Add when Twitter account is available
      "twitter:creator": "@ketingmar",
      "fb:app_id": "your-facebook-app-id", // Add when Facebook app is available
    },
  };
}

/**
 * Generate structured data for products (legacy - moved to StructuredData component)
 */
export function generateProductStructuredData(
  product: {
    name: Record<Locale, string>;
    description: Record<Locale, string>;
    price: number;
    image?: string;
    availability: "InStock" | "OutOfStock" | "PreOrder";
  },
  locale: Locale
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name[locale],
    description: product.description[locale],
    image: product.image ? `${baseUrl}${product.image}` : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "CZK",
      availability: `https://schema.org/${product.availability}`,
    },
    brand: {
      "@type": "Brand",
      name: "Ketingmar s.r.o.",
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>,
  locale: Locale
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}/${locale}${crumb.url}`,
    })),
  };
}
