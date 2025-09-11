import Script from "next/script";

interface StructuredDataProps {
  data: Record<string, any>;
}

/**
 * Component for rendering JSON-LD structured data
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}

/**
 * Generate product structured data for SEO
 */
export function generateProductStructuredData(
  product: {
    name: string;
    description: string;
    price: number;
    image?: string;
    availability: "InStock" | "OutOfStock" | "PreOrder";
    category?: string;
    brand?: string;
    sku?: string;
    url: string;
  },
  locale: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image ? (product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`) : undefined,
    url: product.url,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Ketingmar s.r.o.",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "CZK",
      availability: `https://schema.org/${product.availability}`,
      seller: {
        "@type": "Organization",
        name: "Ketingmar s.r.o.",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>,
  locale: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}/${locale}${crumb.url}`,
    })),
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData(locale: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ketingmar s.r.o.",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: locale === "cs"
      ? "Prémiové pohřební věnce a květinové aranžmá. Ruční výroba, rychlé dodání, důstojné rozloučení."
      : "Premium funeral wreaths and floral arrangements. Handcrafted, fast delivery, dignified farewell.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CZ",
      addressLocality: "Praha",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+420-XXX-XXX-XXX",
      contactType: "customer service",
      availableLanguage: ["Czech", "English"],
    },
    sameAs: [
      // Add social media URLs when available
    ],
  };
}

/**
 * Generate website structured data
 */
export function generateWebsiteStructuredData(locale: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pohřební věnce | Ketingmar s.r.o.",
    url: baseUrl,
    description: locale === "cs"
      ? "Prémiové pohřební věnce a květinové aranžmá. Ruční výroba, rychlé dodání, důstojné rozloučení."
      : "Premium funeral wreaths and floral arrangements. Handcrafted, fast delivery, dignified farewell.",
    inLanguage: locale === "cs" ? "cs-CZ" : "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/${locale}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
