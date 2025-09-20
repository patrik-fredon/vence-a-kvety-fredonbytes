"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations("footer");

  return (
    <ErrorBoundary
      fallback={
        <footer className="bg-stone-900 text-stone-100 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-stone-200">© 2024 Ketingmar s.r.o. • Všechna práva vyhrazena</p>
          </div>
        </footer>
      }
    >
      <footer
        id="footer"
        className="bg-stone-900 text-stone-100 py-12 mt-20 border-t border-stone-800"
        role="contentinfo"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info Section */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-white">{t("company")}</h3>
              <p className="text-stone-300 mb-6 leading-relaxed max-w-md">{t("description")}</p>

              {/* Business Hours */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-white flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {t("businessHours")}
                </h4>
                <div className="text-stone-300 text-sm space-y-1">
                  <p>Po - Pá: 8:00 - 18:00</p>
                  <p>So: 9:00 - 15:00</p>
                  <p>Ne: 10:00 - 14:00</p>
                  <p className="text-amber-300 font-medium mt-2">{t("emergencyOrders")}: 24/7</p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h4 className="font-semibold mb-4 text-white">{t("contact")}</h4>
              <div className="space-y-4 text-stone-300">
                <div className="flex items-start space-x-3">
                  <PhoneIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-stone-400" aria-hidden="true" />
                  <div>
                    <a
                      href="tel:+420123456789"
                      className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded"
                      aria-label="Zavolat na hlavní číslo"
                    >
                      +420 123 456 789
                    </a>
                    <p className="text-xs text-stone-400 mt-0.5">Hlavní linka</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <PhoneIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-400" aria-hidden="true" />
                  <div>
                    <a
                      href="tel:+420987654321"
                      className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded"
                      aria-label="Zavolat na nouzové číslo"
                    >
                      +420 987 654 321
                    </a>
                    <p className="text-xs text-amber-300 mt-0.5">Nouzová linka (24/7)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-stone-400" aria-hidden="true" />
                  <div>
                    <a
                      href="mailto:info@ketingmar.cz"
                      className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded"
                      aria-label="Poslat email"
                    >
                      info@ketingmar.cz
                    </a>
                    <p className="text-xs text-stone-400 mt-0.5">Obecné dotazy</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-stone-400" aria-hidden="true" />
                  <div>
                    <a
                      href="mailto:objednavky@ketingmar.cz"
                      className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded"
                      aria-label="Poslat email pro objednávky"
                    >
                      objednavky@ketingmar.cz
                    </a>
                    <p className="text-xs text-stone-400 mt-0.5">Objednávky</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-stone-400" aria-hidden="true" />
                  <div>
                    <address className="not-italic text-stone-300">
                      Květinová 123
                      <br />
                      110 00 Praha 1<br />
                      Česká republika
                    </address>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Section */}
            <div>
              <h4 className="font-semibold mb-4 text-white">{t("quickLinks")}</h4>
              <nav className="space-y-2" aria-label="Rychlé odkazy">
                <Link
                  href={`/${locale}/about`}
                  className="block text-stone-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded px-1 py-0.5"
                >
                  {t("about")}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="block text-stone-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded px-1 py-0.5"
                >
                  {t("contact")}
                </Link>
                <Link
                  href={`/${locale}/faq`}
                  className="block text-stone-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded px-1 py-0.5"
                >
                  {t("faq")}
                </Link>
                <Link
                  href={`/${locale}/delivery`}
                  className="block text-stone-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded px-1 py-0.5"
                >
                  {t("delivery")}
                </Link>
              </nav>

              {/* Legal Links Section */}
              <h4 className="font-semibold mb-4 mt-8 text-white">{t("legal")}</h4>
              <nav className="space-y-2" aria-label="Právní informace">
                <Link
                  href={`/${locale}/privacy`}
                  className="block text-stone-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded px-1 py-0.5"
                >
                  {t("privacy")}
                </Link>
                <Link
                  href={`/${locale}/terms`}
                  className="block text-stone-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded px-1 py-0.5"
                >
                  {t("terms")}
                </Link>
                <Link
                  href={`/${locale}/cookies`}
                  className="block text-stone-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded px-1 py-0.5"
                >
                  {t("cookies")}
                </Link>
                <Link
                  href={`/${locale}/gdpr`}
                  className="block text-stone-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 rounded px-1 py-0.5"
                >
                  GDPR
                </Link>
              </nav>
            </div>
          </div>

          {/* Footer Bottom Section */}
          <div className="border-t border-stone-800 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="text-stone-400 text-sm">
                <p>© 2024 {t("company")} • IČO: 12345678 • DIČ: CZ12345678</p>
                <p className="mt-1">{t("description")} • Všechna práva vyhrazena</p>
              </div>

              {/* Emergency Notice */}
              <div className="text-left lg:text-right">
                <p className="text-amber-300 text-sm font-medium">{t("emergencyOrders")}: 24/7</p>
                <p className="text-stone-400 text-xs mt-1">Rozumíme naléhavosti vašich potřeb</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </ErrorBoundary>
  );
}
