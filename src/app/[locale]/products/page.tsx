import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { ProductGridWithCart } from "@/components/product/ProductGridWithCart";
import { transformProductRow, transformCategoryRow } from "@/lib/utils/product-transforms";
import { Product, Category, ProductRow, CategoryRow } from "@/types/product";
import {
  getCachedCategories,
  cacheCategories,
  getCachedProductsList,
  cacheProductsList,
} from "@/lib/cache/product-cache";
import { generatePageMetadata } from "@/components/seo/PageMetadata";
import {
  StructuredData,
  generateBreadcrumbStructuredData,
  generateWebsiteStructuredData,
  generateItemListStructuredData,
  generateCollectionPageStructuredData
} from "@/components/seo/StructuredData";

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
  let keywords = seoData.keywords;

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
      const categoryDesc = locale === "cs" ? categoryData.description_cs : categoryData.description_en;

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
    type: 'website',
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
  let cachedProductsData = await getCachedProductsList(initialFilters);
  let products: Product[];

  if (cachedProductsData) {
    products = cachedProductsData.products;
  } else {
    // Fetch initial products from database if not cached
    const supabase = createServerClient();
    const { data: productsData } = await supabase
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
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(12);

    // Transform the data
    products = (productsData || []).map((row: ProductRow & { categories?: CategoryRow | null }) => {
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
    const categoryData = categories.find(cat => cat.slug === category);
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
  const productItems = products.map(product => ({
    name: locale === "cs" ? product.name.cs : product.name.en,
    url: `/${locale}/products/${product.slug}`,
    image: product.images?.[0]?.url,
    description: locale === "cs" ? product.description?.cs : product.description?.en,
    price: product.basePrice,
  }));

  const itemListStructuredData = generateItemListStructuredData(
    productItems,
    locale === "cs" ? "Pohřební věnce a květinové aranžmá" : "Funeral Wreaths and Floral Arrangements",
    locale
  );

  // Generate CollectionPage structured data if filtering by category
  let collectionPageStructuredData = null;
  if (category && typeof category === "string") {
    const categoryData = categories.find(cat => cat.slug === category);
    if (categoryData) {
      const categoryName = locale === "cs" ? categoryData.name.cs : categoryData.name.en;
      const categoryDescription = locale === "cs" ? categoryData.description?.cs : categoryData.description?.en;

      collectionPageStructuredData = generateCollectionPageStructuredData({
        name: categoryName,
        description: categoryDescription,
        url: `/${locale}/products?category=${category}`,
        productCount: products.length, // This would be the total count in a real implementation
      }, locale);
    }
  }

  return (
    <>
      <StructuredData data={breadcrumbStructuredData} />
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={itemListStructuredData} />
      {collectionPageStructuredData && <StructuredData data={collectionPageStructuredData} />}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-elegant text-4xl font-semibold text-primary-800 mb-4">{t("title")}</h1>
          <p className="text-lg text-neutral-600">
            {locale === "cs"
              ? "Prohlédněte si naši kolekci pohřebních věnců a květinových aranžmá."
              : "Browse our collection of funeral wreaths and floral arrangements."}
          </p>
        </div>

        {/* Product Grid with Filters */}
        <ProductGridWithCart initialProducts={products} initialCategories={categories} locale={locale} />
      </div>
    </>
  );
}
