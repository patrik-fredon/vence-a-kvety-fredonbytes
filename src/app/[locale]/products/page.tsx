import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/product';
import { transformProductRow, transformCategoryRow } from '@/lib/utils/product-transforms';
import { Product, Category, ProductRow, CategoryRow } from '@/types/product';
import { getCachedCategories, cacheCategories, getCachedProductsList, cacheProductsList } from '@/lib/cache/product-cache';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
}

// Enable ISR with 30 minutes revalidation for product listings
export const revalidate = 1800;

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('product');

  // Try to get categories from cache first
  let categories = await getCachedCategories();

  if (!categories) {
    // Fetch categories from database if not cached
    const supabase = createServerClient();
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    categories = (categoriesData || []).map(transformCategoryRow);

    // Cache categories for future requests
    await cacheCategories(categories);
  }

  // Try to get initial products from cache
  const initialFilters = { active: true, limit: 12, order: 'created_at' };
  let cachedProductsData = await getCachedProductsList(initialFilters);
  let products: Product[];

  if (cachedProductsData) {
    products = cachedProductsData.products;
  } else {
    // Fetch initial products from database if not cached
    const supabase = createServerClient();
    const { data: productsData } = await supabase
      .from('products')
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
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(12);

    // Transform the data
    products = (productsData || []).map((row: ProductRow & { categories?: CategoryRow | null }) => {
      const category = row.categories ? transformCategoryRow(row.categories) : undefined;
      return transformProductRow(row, category);
    });

    // Cache products for future requests
    await cacheProductsList(initialFilters, products);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-elegant text-4xl font-semibold text-primary-800 mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-neutral-600">
          {locale === 'cs'
            ? 'Prohlédněte si naši kolekci pohřebních věnců a květinových aranžmá.'
            : 'Browse our collection of funeral wreaths and floral arrangements.'
          }
        </p>
      </div>

      {/* Product Grid with Filters */}
      <ProductGrid
        initialProducts={products}
        initialCategories={categories}
        locale={locale}
      />
    </div>
  );
}
