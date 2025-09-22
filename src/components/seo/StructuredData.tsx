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
    name: locale === "cs" 
      ? "Pohřební věnce | Ketingmar s.r.o."
      : "Funeral Wreaths | Ketingmar s.r.o.",
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

/**
 * Generate LocalBusiness structured data
 */
export function generateLocalBusinessStructuredData(locale: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/#business`,
    name: "Ketingmar s.r.o.",
    alternateName: locale === "cs" ? "Pohřební věnce" : "Funeral Wreaths",
    description: locale === "cs"
      ? "Prémiové pohřební věnce a květinové aranžmá. Ruční výroba, rychlé dodání, důstojné rozloučení."
      : "Premium funeral wreaths and floral arrangements. Handcrafted, fast delivery, dignified farewell.",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/og-image.jpg`,
    telephone: "+420-XXX-XXX-XXX", // Replace with actual phone
    email: "info@pohrebni-vence.cz", // Replace with actual email
    address: {
      "@type": "PostalAddress",
      streetAddress: "Your Street Address", // Replace with actual address
      addressLocality: "Praha",
      addressRegion: "Praha",
      postalCode: "10000", // Replace with actual postal code
      addressCountry: "CZ",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "50.0755", // Replace with actual coordinates
      longitude: "14.4378",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "16:00",
      },
    ],
    priceRange: "$$",
    currenciesAccepted: "CZK",
    paymentAccepted: ["Cash", "Credit Card", "Bank Transfer"],
    areaServed: {
      "@type": "Country",
      name: "Czech Republic",
    },
    serviceType: locale === "cs" ? "Pohřební služby" : "Funeral Services",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "cs" ? "Pohřební věnce a květinové aranžmá" : "Funeral Wreaths and Floral Arrangements",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: locale === "cs" ? "Pohřební věnce" : "Funeral Wreaths",
            description: locale === "cs"
              ? "Ruční výroba pohřebních věnců s možností přizpůsobení"
              : "Handcrafted funeral wreaths with customization options",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: locale === "cs" ? "Květinové aranžmá" : "Floral Arrangements",
            description: locale === "cs"
              ? "Profesionální květinové aranžmá pro pohřební služby"
              : "Professional floral arrangements for funeral services",
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    sameAs: [
      // Add social media URLs when available
      // "https://www.facebook.com/ketingmar",
      // "https://www.instagram.com/ketingmar",
    ],
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>,
  locale: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate ItemList structured data for product categories
 */
export function generateItemListStructuredData(
  items: Array<{
    name: string;
    url: string;
    image?: string;
    description?: string;
    price?: number;
  }>,
  listName: string,
  locale: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.name,
        url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
        image: item.image ? (item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`) : undefined,
        description: item.description,
        offers: item.price ? {
          "@type": "Offer",
          price: item.price,
          priceCurrency: "CZK",
          availability: "https://schema.org/InStock",
        } : undefined,
      },
    })),
  };
}

/**
 * Generate CollectionPage structured data for category pages
 */
export function generateCollectionPageStructuredData(
  category: {
    name: string;
    description?: string;
    url: string;
    productCount: number;
  },
  locale: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: category.url.startsWith('http') ? category.url : `${baseUrl}${category.url}`,
    mainEntity: {
      "@type": "ItemList",
      name: category.name,
      numberOfItems: category.productCount,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "cs" ? "Domů" : "Home",
          item: `${baseUrl}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: locale === "cs" ? "Produkty" : "Products",
          item: `${baseUrl}/${locale}/products`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: category.name,
          item: category.url.startsWith('http') ? category.url : `${baseUrl}${category.url}`,
        },
      ],
    },
  };
}
