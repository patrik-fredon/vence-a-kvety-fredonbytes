import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { transformProductRow, transformCategoryRow } from "@/lib/utils/product-transforms";
import { Product, ProductRow, CategoryRow } from "@/types/product";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getCachedProductBySlug, cacheProductBySlug } from "@/lib/cache/product-cache";
import {
  StructuredData,
  generateProductStructuredData,
  generateBreadcrumbStructuredData
} from "@/components/seo/StructuredData";

interface ProductDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Generate static params for popular products
export async function generateStaticParams() {
  const supabase = createServerClient();

  // Get popular/featured products for static generation
  const { data: products } = await supabase
    .from("products")
    .select("slug")
    .eq("active", true)
    .or("featured.eq.true,created_at.gte.2024-01-01") // Featured or recent products
    .limit(50); // Limit to avoid too many static pages

  if (!products) return [];

  // Generate params for both locales
  const params = [];
  for (const product of products) {
    params.push({ locale: "cs", slug: product.slug }, { locale: "en", slug: product.slug });
  }

  return params;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "navigation" });

  // Try to get product from cache first
  let product = await getCachedProductBySlug(slug);

  if (!product) {
    // If not in cache, fetch from database
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name_cs,
          name_en,
          slug,
          description_cs,
          description_en,
          image_url,
          parent_id,
          sort_order,
          active,
          created_at,
          updated_at
        )
      `)
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (error || !data) {
      notFound();
    }

    // Transform the data
    const category = data.categories ? transformCategoryRow(data.categories) : undefined;
    product = transformProductRow(data, category);

    // Cache the product for future requests
    await cacheProductBySlug(slug, product);
  }

  // Generate structured data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";
  const productUrl = `${baseUrl}/${locale}/products/${slug}`;

  const productName = locale === "cs" ? product.name.cs : product.name.en;
  const productDescription = locale === "cs" ? product.description?.cs : product.description?.en;
  const categoryName = product.category
    ? (locale === "cs" ? product.category.name.cs : product.category.name.en)
    : "";

  // Product structured data
  const productStructuredData = generateProductStructuredData({
    name: productName,
    description: productDescription || productName,
    price: product.basePrice,
    image: product.images?.[0]?.url,
    availability: "InStock", // This should be dynamic based on actual availability
    category: categoryName,
    brand: "Ketingmar s.r.o.",
    sku: product.id,
    url: productUrl,
  }, locale);

  // Breadcrumb structured data
  const breadcrumbs = [
    { name: t("home"), url: "/" },
    { name: t("products"), url: "/products" },
  ];

  if (product.category) {
    breadcrumbs.push({
      name: categoryName,
      url: `/products?category=${product.category.slug}`,
    });
  }

  breadcrumbs.push({
    name: productName,
    url: `/products/${slug}`,
  });

  const breadcrumbStructuredData = generateBreadcrumbStructuredData(breadcrumbs, locale);

  return (
    <>
      <StructuredData data={productStructuredData} />
      <StructuredData data={breadcrumbStructuredData} />
      <div className="container mx-auto px-4 py-8">
        <ProductDetail product={product} locale={locale} />
      </div>
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  const supabase = createServerClient();

  const { data } = await supabase
    .from("products")
    .select(`
      name_cs,
      name_en,
      description_cs,
      description_en,
      seo_metadata,
      base_price,
      images,
      categories (
        name_cs,
        name_en,
        slug
      )
    `)
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!data) {
    return {
      title: "Product Not Found",
    };
  }

  const name = locale === "cs" ? data.name_cs : data.name_en;
  const description = locale === "cs" ? data.description_cs : data.description_en;
  const categoryName = data.categories
    ? (locale === "cs" ? data.categories.name_cs : data.categories.name_en)
    : "";

  // Type-safe handling of seo_metadata
  const seoMetadata = data.seo_metadata as any;
  const seoTitle = seoMetadata?.title?.[locale] as string;
  const seoDescription = seoMetadata?.description?.[locale] as string;
  const ogImage = seoMetadata?.ogImage as string;

  // Get first product image if no OG image specified
  const productImages = data.images as any[];
  const firstImage = productImages?.[0]?.url || ogImage;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";
  const productUrl = `${baseUrl}/${locale}/products/${slug}`;

  // Enhanced title with category context
  const finalTitle = seoTitle || `${name} | ${categoryName} | Pohřební věnce`;
  const finalDescription = seoDescription || description || `${name} - prémiové pohřební věnce a květinové aranžmá od Ketingmar s.r.o.`;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: [
      name.toLowerCase(),
      categoryName.toLowerCase(),
      "pohřební věnce",
      "květinové aranžmá",
      "pohřeb",
      "rozloučení",
      "věnce",
      "ketingmar"
    ].filter(Boolean),
    authors: [{ name: "Ketingmar s.r.o." }],
    creator: "Ketingmar s.r.o.",
    publisher: "Ketingmar s.r.o.",
    robots: "index, follow",
    alternates: {
      canonical: productUrl,
      languages: {
        cs: `${baseUrl}/cs/products/${slug}`,
        en: `${baseUrl}/en/products/${slug}`,
      },
    },
    openGraph: {
      type: "product",
      locale: locale === "cs" ? "cs_CZ" : "en_US",
      alternateLocale: locale === "cs" ? "en_US" : "cs_CZ",
      title: finalTitle,
      description: finalDescription,
      siteName: "Pohřební věnce | Ketingmar s.r.o.",
      url: productUrl,
      images: firstImage ? [
        {
          url: firstImage.startsWith('http') ? firstImage : `${baseUrl}${firstImage}`,
          width: 1200,
          height: 630,
          alt: name,
          type: "image/jpeg",
        }
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: firstImage ? [firstImage.startsWith('http') ? firstImage : `${baseUrl}${firstImage}`] : [],
    },
    other: {
      "product:price:amount": data.base_price?.toString(),
      "product:price:currency": "CZK",
      "product:availability": "in stock", // This should be dynamic based on actual availability
      "product:brand": "Ketingmar s.r.o.",
      "product:category": categoryName,
    },
  };
}
