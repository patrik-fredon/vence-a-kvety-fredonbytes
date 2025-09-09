'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');

  return (
    <ErrorBoundary
      fallback={
        <footer className="bg-primary-900 text-primary-100 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-primary-200">
              © 2024 Ketingmar s.r.o. • Všechna práva vyhrazena
            </p>
          </div>
        </footer>
      }
    >
      <footer className="bg-primary-900 text-primary-100 py-12 mt-20" role="contentinfo">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-elegant text-xl font-semibold mb-4 text-white">
                {t('company')}
              </h3>
              <p className="text-primary-200 mb-6 leading-relaxed">
                {t('description')}
              </p>

              {/* Business Hours */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-white flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  Otevírací doba
                </h4>
                <div className="text-primary-200 text-sm space-y-1">
                  <p>Po - Pá: 8:00 - 18:00</p>
                  <p>So: 9:00 - 15:00</p>
                  <p>Ne: 10:00 - 14:00</p>
                  <p className="text-accent-rose-300 font-medium">
                    Nouzové objednávky: 24/7
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="font-semibold mb-4 text-white">{t('contact')}</h4>
              <div className="space-y-3 text-primary-200">
                <div className="flex items-start space-x-3">
                  <PhoneIcon className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <a
                      href="tel:+420123456789"
                      className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
                      aria-label="Zavolat na hlavní číslo"
                    >
                      +420 123 456 789
                    </a>
                    <p className="text-xs text-primary-300">Hlavní linka</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <PhoneIcon className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <a
                      href="tel:+420987654321"
                      className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
                      aria-label="Zavolat na nouzové číslo"
                    >
                      +420 987 654 321
                    </a>
                    <p className="text-xs text-primary-300">Nouzová linka (24/7)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <a
                      href="mailto:info@ketingmar.cz"
                      className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
                      aria-label="Poslat email"
                    >
                      info@ketingmar.cz
                    </a>
                    <p className="text-xs text-primary-300">Obecné dotazy</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <a
                      href="mailto:objednavky@ketingmar.cz"
                      className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
                      aria-label="Poslat email pro objednávky"
                    >
                      objednavky@ketingmar.cz
                    </a>
                    <p className="text-xs text-primary-300">Objednávky</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <address className="not-italic">
                      Květinová 123<br />
                      110 00 Praha 1<br />
                      Česká republika
                    </address>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal & Navigation */}
            <div>
              <h4 className="font-semibold mb-4 text-white">{t('legal')}</h4>
              <nav className="space-y-2" aria-label="Právní informace">
                <Link
                  href={`/${locale}/privacy`}
                  className="block text-primary-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded px-1 py-0.5"
                >
                  {t('privacy')}
                </Link>
                <Link
                  href={`/${locale}/terms`}
                  className="block text-primary-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded px-1 py-0.5"
                >
                  {t('terms')}
                </Link>
                <Link
                  href={`/${locale}/cookies`}
                  className="block text-primary-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded px-1 py-0.5"
                >
                  {t('cookies')}
                </Link>
                <Link
                  href={`/${locale}/gdpr`}
                  className="block text-primary-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded px-1 py-0.5"
                >
                  GDPR
                </Link>
              </nav>

              {/* Quick Links */}
              <h4 className="font-semibold mb-4 mt-6 text-white">Rychlé odkazy</h4>
              <nav className="space-y-2" aria-label="Rychlé odkazy">
                <Link
                  href={`/${locale}/about`}
                  className="block text-primary-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded px-1 py-0.5"
                >
                  O nás
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="block text-primary-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded px-1 py-0.5"
                >
                  Kontakt
                </Link>
                <Link
                  href={`/${locale}/faq`}
                  className="block text-primary-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded px-1 py-0.5"
                >
                  Často kladené otázky
                </Link>
                <Link
                  href={`/${locale}/delivery`}
                  className="block text-primary-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded px-1 py-0.5"
                >
                  Doprava a dodání
                </Link>
              </nav>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-primary-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-primary-200 text-sm text-center md:text-left">
                <p>
                  © 2024 {t('company')} • IČO: 12345678 • DIČ: CZ12345678
                </p>
                <p className="mt-1">
                  {t('description')} • Všechna práva vyhrazena
                </p>
              </div>

              {/* Emergency Notice */}
              <div className="text-center md:text-right">
                <p className="text-accent-rose-300 text-sm font-medium">
                  Nouzové objednávky: 24/7
                </p>
                <p className="text-primary-300 text-xs">
                  Rozumíme naléhavosti vašich potřeb
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </ErrorBoundary>
  );
}
