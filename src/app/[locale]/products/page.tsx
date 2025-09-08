import { useTranslations } from 'next-intl';
import { ComponentLoadingState } from '@/components/ui/LoadingSpinner';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  const t = useTranslations('product');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-elegant text-4xl font-semibold text-primary-800 mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-neutral-600">
          Prohlédněte si naši kolekci pohřebních věnců a květinových aranžmá.
        </p>
      </div>

      {/* Placeholder content - will be replaced with actual product grid */}
      <div className="bg-white rounded-lg shadow-soft p-8 text-center">
        <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-4">
          Produkty se načítají...
        </h2>
        <p className="text-neutral-600 mb-6">
          Tato stránka bude implementována v dalších krocích.
        </p>
        <ComponentLoadingState />
      </div>
    </div>
  );
}
