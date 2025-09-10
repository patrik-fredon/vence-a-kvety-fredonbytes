import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase/server';
import { transformProductRow, transformCategoryRow } from '@/lib/utils/product-transforms';
import { Product, ProductRow, CategoryRow } from '@/types/product';
import { ProductDetail } from '@/components/product/ProductDetail';

interface ProductDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  const supabase = createServerClient();

  // Fetch product by slug
  const { data, error } = await supabase
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
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (error || !data) {
    notFound();
  }

  // Transform the data
  const category = data.categories ? transformCategoryRow(data.categories) : undefined;
  const product = transformProductRow(data, category);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product} locale={locale} />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  const supabase = createServerClient();

  const { data } = await supabase
    .from('products')
    .select('name_cs, name_en, description_cs, description_en, seo_metadata')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!data) {
    return {
      title: 'Product Not Found',
    };
  }

  const name = locale === 'cs' ? data.name_cs : data.name_en;
  const description = locale === 'cs' ? data.description_cs : data.description_en;

  // Type-safe handling of seo_metadata
  const seoMetadata = data.seo_metadata as any;
  const seoTitle = seoMetadata?.title?.[locale] as string;
  const seoDescription = seoMetadata?.description?.[locale] as string;
  const ogImage = seoMetadata?.ogImage as string;

  return {
    title: seoTitle || name,
    description: seoDescription || description,
    openGraph: {
      title: seoTitle || name,
      description: seoDescription || description,
      images: ogImage ? [ogImage] : [],
    },
  };
}
