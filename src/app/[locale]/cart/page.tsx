import { useTranslations } from 'next-intl';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface CartPageProps {
  params: { locale: string };
}

export default function CartPage({ params: { locale } }: CartPageProps) {
  const t = useTranslations('cart');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-elegant text-4xl font-semibold text-primary-800 mb-8">
          {t('title')}
        </h1>

        {/* Empty cart placeholder */}
        <div className="bg-white rounded-lg shadow-soft p-12 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCartIcon className="w-8 h-8 text-primary-600" />
          </div>

          <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-4">
            {t('empty')}
          </h2>

          <p className="text-neutral-600 mb-8">
            Přidejte si produkty do košíku a pokračujte v nákupu.
          </p>

          <a
            href={`/${locale}/products`}
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('continueShopping')}
          </a>
        </div>
      </div>
    </div>
  );
}
