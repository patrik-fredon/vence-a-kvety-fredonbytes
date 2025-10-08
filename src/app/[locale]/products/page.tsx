import { getTranslations } from "next-intl/server";
import { ProductGridWithCart } from "@/components/product/ProductGridWithCart";
import { generatePageMetadata } from "@/components/seo/PageMetadata";
import {
  generateBreadcrumbStructuredData,
  generateCollectionPageStructuredData,
  generateItemListStructuredData,
  generateWebsiteStructuredData,
  StructuredData,
} from "@/components/seo/StructuredData";
import {
  cacheCategories,
  cacheProductsList,
  getCachedCategories,
  getCachedProductsList,
} from "@/lib/cache/product-cache";
import { createServerClient } from "@/lib/supabase/server";
import { transformCategoryRow, transformProductRow } from "@/lib/utils/product-transforms";
import type { Product } from "@/types/product";

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Enable ISR with 30 minutes revalidation for product listings
export const revalidate = 1800;

// Generate metadata for products page using i18n content
export async function generateMetadata({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  const { category } = await searchParams;

  // Import translations dynamically
  const messages = await import(`../../../../messages/${locale}.json`);
  const seoData = messages.default.seo.products;

  let title = seoData.title;
  let description = seoData.description;
  const keywords = seoData.keywords;

  // If filtering by category, get category info for better metadata
  if (category && typeof category === "string") {
    const supabase = createServerClient();
    const { data: categoryData } = await supabase
      .from("categories")
      .select("name_cs, name_en, description_cs, description_en")
      .eq("slug", category)
      .eq("active", true)
      .single();

    if (categoryData) {
      const categoryName = locale === "cs" ? categoryData.name_cs : categoryData.name_en;
      const categoryDesc =
        locale === "cs" ? categoryData.description_cs : categoryData.description_en;

      title = `${categoryName} | ${seoData.title}`;
      description = categoryDesc || description;
    }
  }

  return generatePageMetadata({
    title,
    description,
    keywords,
    locale,
    path: "/products",
    type: "website",
    openGraph: seoData.openGraph,
  });
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations("product");
  const tNav = await getTranslations("navigation");

  // Try to get categories from cache first
  let categories = await getCachedCategories();

  if (!categories) {
    // Fetch categories from database if not cached
    const supabase = createServerClient();
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    categories = (categoriesData || []).map(transformCategoryRow);

    // Cache categories for future requests
    await cacheCategories(categories);
  }

  // Try to get initial products from cache
  const initialFilters = { active: true, limit: 12, order: "created_at" };
  const cachedProductsData = await getCachedProductsList(initialFilters);
  let products: Product[];

  if (cachedProductsData) {
    products = cachedProductsData.products;
  } else {
    // Fetch initial products from database if not cached
    const supabase = createServerClient();
    const { data: productsData } = await supabase
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
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(12);

    // Transform the data
    products = (productsData || []).map((row) => {
      const category = row.categories ? transformCategoryRow(row.categories) : undefined;
      return transformProductRow(row, category);
    });

    // Cache products for future requests
    await cacheProductsList(initialFilters, products);
  }

  // Generate structured data
  const breadcrumbs = [
    { name: tNav("home"), url: "/" },
    { name: tNav("products"), url: "/products" },
  ];

  // Add category to breadcrumbs if filtering by category
  if (category && typeof category === "string") {
    const categoryData = categories.find((cat) => cat.slug === category);
    if (categoryData) {
      const categoryName = locale === "cs" ? categoryData.name.cs : categoryData.name.en;
      breadcrumbs.push({
        name: categoryName,
        url: `/products?category=${category}`,
      });
    }
  }

  const breadcrumbStructuredData = generateBreadcrumbStructuredData(breadcrumbs, locale);
  const websiteStructuredData = generateWebsiteStructuredData(locale);

  // Generate ItemList structured data for products
  const productItems = products.map((product) => {
    const description = locale === "cs" ? product.description?.cs : product.description?.en;
    return {
      name: locale === "cs" ? product.name.cs : product.name.en,
      url: `/${locale}/products/${product.slug}`,
      ...(product.images?.[0]?.url && { image: product.images[0].url }),
      ...(description && { description }),
      price: product.basePrice,
    };
  });

  const itemListStructuredData = generateItemListStructuredData(productItems, t("collectionTitle"));

  // Generate CollectionPage structured data if filtering by category
  let collectionPageStructuredData = null;
  if (category && typeof category === "string") {
    const categoryData = categories.find((cat) => cat.slug === category);
    if (categoryData) {
      const categoryName = locale === "cs" ? categoryData.name.cs : categoryData.name.en;
      const categoryDescription =
        locale === "cs" ? categoryData.description?.cs : categoryData.description?.en;

      collectionPageStructuredData = generateCollectionPageStructuredData(
        {
          name: categoryName,
          ...(categoryDescription && { description: categoryDescription }),
          url: `/${locale}/products?category=${category}`,
          productCount: products.length, // This would be the total count in a real implementation
        },
        locale
      );
    }
  }

  return (
    <>
      <StructuredData data={breadcrumbStructuredData} />
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={itemListStructuredData} />
      {collectionPageStructuredData && <StructuredData data={collectionPageStructuredData} />}

      {/* Page Header */}
        <div className="m-8 mx-auto w-7xl text-center justify-center">
          <div className=" rounded-lg p-8 mb-8">
          {/* TODO translation */}
            <h2 className="text-elegant text-4xl font-semibold mb-4 text-teal-900">{t("title")}</h2>
            <p className="text-lg text-teal-900">{t("pageDescription")}</p>
          </div>
        </div>
      <div className="container mx-auto px-4 py-8">


        {/* Product Grid with Filters */}
        <ProductGridWithCart
          initialProducts={products}
          initialCategories={categories}
          locale={locale}
        />
      </div>
    </>
  );
}
