import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');

  return (
    <footer className="bg-primary-900 text-primary-100 py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-elegant text-xl font-semibold mb-4">
              {t('company')}
            </h3>
            <p className="text-primary-200 mb-4 leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t('contact')}</h4>
            <div className="space-y-2 text-primary-200">
              <p>+420 123 456 789</p>
              <p>info@ketingmar.cz</p>
              <p>Praha, Česká republika</p>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('legal')}</h4>
            <div className="space-y-2">
              <Link
                href={`/${locale}/privacy`}
                className="block text-primary-200 hover:text-white transition-colors"
              >
                {t('privacy')}
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="block text-primary-200 hover:text-white transition-colors"
              >
                {t('terms')}
              </Link>
              <Link
                href={`/${locale}/cookies`}
                className="block text-primary-200 hover:text-white transition-colors"
              >
                {t('cookies')}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-8 text-center">
          <p className="text-primary-200 text-sm">
            © 2024 {t('company')} • {t('description')} • Všechna práva vyhrazena
          </p>
        </div>
      </div>
    </footer>
  );
}
