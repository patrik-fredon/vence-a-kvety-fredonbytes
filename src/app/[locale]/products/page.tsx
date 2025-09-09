import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/product';
import { transformProductRow, transformCategoryRow } from '@/lib/utils/product-transforms';
import { Product, Category, ProductRow, CategoryRow } from '@/types/product';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('product');
  const tHome = await getTranslations('home');

  // Fetch initial products and categories from the server
  const supabase = createServerClient();

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  // Fetch initial products (first page)
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
  const categories: Category[] = (categoriesData || []).map(transformCategoryRow);
  const products: Product[] = (productsData || []).map((row: ProductRow & { categories?: CategoryRow }) => {
    const category = row.categories ? transformCategoryRow(row.categories) : undefined;
    return transformProductRow(row, category);
  });

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
        onAddToCart={(product) => {
          // TODO: Implement cart functionality in later tasks
          console.log('Added to cart:', product.name);
        }}
      />
    </div>
  );
}
