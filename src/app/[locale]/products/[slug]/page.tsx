import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProductDetail } from "@/components/product/ProductDetail";
import { generateProductMetadata } from "@/components/seo/PageMetadata";
import {
  generateBreadcrumbStructuredData,
  generateProductStructuredData,
  StructuredData,
} from "@/components/seo/StructuredData";
import { cacheProductBySlug, getCachedProductBySlug } from "@/lib/cache/product-cache";
import { createServerClient } from "@/lib/supabase/server";
import { transformCategoryRow, transformProductRow } from "@/lib/utils/product-transforms";

interface ProductDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Enable dynamic rendering for all product pages
export const dynamic = "force-dynamic";

// Disable static generation to avoid conflicts
export const dynamicParams = true;

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "navigation" });

  console.log(`🔍 [ProductDetailPage] Looking for product with slug: ${slug}`);

  // Try to get product from cache first
  let product = await getCachedProductBySlug(slug);

  console.log(`🔍 [ProductDetailPage] Cached product found: ${!!product}`);

  // Ensure cached product has required arrays
  if (product) {
    if (!product.images) product.images = [];
    if (!product.customizationOptions) product.customizationOptions = [];
    if (!product.availability) product.availability = { inStock: true };
  }

  if (!product) {
    console.log(`🔍 [ProductDetailPage] Fetching from database...`);
    // If not in cache, fetch from database
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
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
      `
      )
      .eq("slug", slug)
      .eq("active", true)
      .single();

    console.log(`🔍 [ProductDetailPage] Database query result:`, {
      hasData: !!data,
      error: error?.message,
      productName: data?.name_cs,
    });

    if (error || !data) {
      console.log(`❌ [ProductDetailPage] Product not found, calling notFound()`);
      notFound();
    }

    // Transform the data
    const category =
      data.categories && !("error" in data.categories)
        ? transformCategoryRow(data.categories)
        : undefined;
    product = transformProductRow(data, category);

    // Ensure product has required arrays to prevent map errors
    if (!product.images) product.images = [];
    if (!product.customizationOptions) product.customizationOptions = [];
    if (!product.availability) product.availability = { inStock: true };

    // Cache the product for future requests
    await cacheProductBySlug(slug, product);
  }

  // Generate structured data
  const baseUrl = process.env[".NEXT_PUBLIC_BASE_URL"] || "https://pohrebni-vence.cz";
  const productUrl = `${baseUrl}/${locale}/products/${slug}`;

  const productName = locale === "cs" ? product.name.cs : product.name.en;
  const productDescription = locale === "cs" ? product.description?.cs : product.description?.en;
  const categoryName = product.category
    ? locale === "cs"
      ? product.category.name.cs
      : product.category.name.en
    : "";

  // Product structured data
  const productStructuredData = generateProductStructuredData(
    {
      name: productName,
      description: productDescription || productName,
      price: product.basePrice,
      ...(product.images?.[0]?.url && { image: product.images[0].url }),
      availability: "InStock", // This should be dynamic based on actual availability
      category: categoryName,
      brand: "Pohrebni-vence-Bloomsy-Lucy",
      sku: product.id,
      url: productUrl,
    },
    locale
  );

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
    .select(
      `
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
    `
    )
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
    ? locale === "cs"
      ? data.categories.name_cs
      : data.categories.name_en
    : "";

  // Type-safe handling of seo_metadata
  const seoMetadata = data.seo_metadata as Record<string, Record<string, string>> | null;
  const seoTitle = seoMetadata?.["title"]?.[locale] as string | undefined;
  const seoDescription = seoMetadata?.["description"]?.[locale] as string | undefined;

  // Get first product image
  const productImages = Array.isArray(data.images) ? data.images : [];

  // Use the new generateProductMetadata function
  return generateProductMetadata({
    product: {
      name: seoTitle || name,
      ...(seoDescription || description
        ? { description: (seoDescription || description) as string }
        : {}),
      price: data.base_price,
      category: categoryName,
      images:
        productImages.length > 0
          ? productImages.map((img) => {
              if (img && typeof img === "object" && "url" in img && "alt" in img) {
                return {
                  url: typeof img["url"] === "string" ? img["url"] : "",
                  alt: (typeof img["alt"] === "string" ? img["alt"] : null) || name,
                };
              }
              return { url: "", alt: name };
            })
          : [],
      availability: "InStock", // This should be dynamic based on actual availability
      brand: "Ketingmar s.r.o.",
    },
    locale,
    slug,
    keywords: [
      name.toLowerCase(),
      categoryName.toLowerCase(),
      "pohřební věnce",
      "květinové aranžmá",
      "pohřeb",
      "rozloučení",
      "věnce",
      "ketingmar",
    ].filter(Boolean),
  });
}
