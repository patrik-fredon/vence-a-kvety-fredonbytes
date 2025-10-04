"use client";

import { ClockIcon, EnvelopeIcon, MapPinIcon, PhoneIcon } from "@/lib/icons";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations("footer");
  const tAccessibility = useTranslations("accessibility");

  return (
    <ErrorBoundary
      fallback={
        <footer className="bg-stone-900 shadow-2xl text-amber-100 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-amber-200">© 2025 FredonBytes</p>
          </div>
        </footer>
      }
    >
      <footer
        id="footer"
        className="bg-stone-900 text-amber-100 py-12 mt-20 border-t border-teal-900"
        role="contentinfo"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {/* Company Info Section */}
            <div className="sm:col-span-2 lg:col-span-2">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-amber-100">
                {t("company")}
              </h3>
              <p className="text-sm sm:text-base text-amber-200 mb-4 sm:mb-6 leading-relaxed max-w-md">
                {t("description")}
              </p>

              {/* Business Hours */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-amber-100 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {t("businessHours")}
                </h4>
                <div className="text-amber-100 text-xs sm:text-sm space-y-1">
                  <p>Po - Ne: Dle objednávek</p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-amber-100">
                {t("contact")}
              </h4>
              <div className="space-y-3 sm:space-y-4 text-amber-200">
                <div className="flex items-start space-x-3">
                  <PhoneIcon
                    className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-100"
                    aria-hidden="true"
                  />
                  <div>
                    <a
                      href="tel:+420733116328"
                      className="hover:text-amber-100 transition-colors duration-200  rounded"
                      aria-label={tAccessibility("callMainNumber")}
                    >
                      +420 733 116 328
                    </a>
                    <p className="text-xs text-amber-100 mt-0.5">
                      Hlavní linka
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <EnvelopeIcon
                    className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-100"
                    aria-hidden="true"
                  />
                  <div>
                    <a
                      href="mailto:objednavky@ketingmar.cz"
                      className="hover:text-amber-100 transition-colors duration-200  rounded"
                      aria-label={tAccessibility("sendOrderEmail")}
                    >
                      info@pohrebni-vence.cz
                    </a>
                    <p className="text-xs text-amber-100 mt-0.5">Objednávky</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPinIcon
                    className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-100"
                    aria-hidden="true"
                  />
                  <div>
                    <address className="not-italic text-amber-200">
                      Jistebník 87
                      <br />
                      742 82 Jistebník <br />
                      Česká republika
                    </address>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Section */}
            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-amber-100">
                {t("quickLinks")}
              </h4>
              <nav
                className="space-y-1 sm:space-y-2"
                aria-label={tAccessibility("quickLinks")}
              >
                <Link
                  href={`/${locale}/about`}
                  className="block text-amber-200 hover:text-amber-100 transition-colors duration-200  rounded px-1 py-0.5"
                >
                  {t("about")}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="block text-amber-200 hover:text-amber-100 transition-colors duration-200  rounded px-1 py-0.5"
                >
                  {t("contact")}
                </Link>
                <Link
                  href={`/${locale}/faq`}
                  className="block text-amber-200 hover:text-amber-100 transition-colors duration-200  rounded px-1 py-0.5"
                >
                  {t("faq")}
                </Link>
                <Link
                  href={`/${locale}/legal`}
                  className="block text-amber-200 hover:text-amber-100 transition-colors duration-200  rounded px-1 py-0.5"
                >
                  {t("delivery")}
                </Link>
              </nav>

              {/* Legal Links Section */}
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-amber-100">
                {t("legal")}
              </h4>
              <nav
                className="space-y-1 sm:space-y-2"
                aria-label={tAccessibility("legalInfo")}
              >
                <Link
                  href={`/${locale}/privacy`}
                  className="block text-amber-200 hover:text-amber-100 transition-colors duration-200  rounded px-1 py-0.5"
                >
                  {t("privacy")}
                </Link>
                <Link
                  href={`/${locale}/terms`}
                  className="block text-amber-200 hover:text-amber-100 transition-colors duration-200  rounded px-1 py-0.5"
                >
                  {t("terms")}
                </Link>
                <Link
                  href={`/${locale}/cookies`}
                  className="block text-amber-200 hover:text-amber-100 transition-colors duration-200  rounded px-1 py-0.5"
                >
                  {t("cookies")}
                </Link>
                <Link
                  href={`/${locale}/gdpr`}
                  className="block text-amber-200 hover:text-amber-100 transition-colors duration-200  rounded px-1 py-0.5"
                >
                  GDPR
                </Link>
              </nav>

              {/* Accessibility Link - Desktop Only */}
              <div className="hidden md:block">
                <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-amber-100">
                  {tAccessibility("accessibility")}
                </h4>
                <nav
                  className="space-y-1 sm:space-y-2"
                  aria-label={tAccessibility("accessibilityOptions")}
                >
                  <button
                    onClick={() => {
                      const toolbarButton = document.querySelector(
                        '[aria-controls="accessibility-panel"]'
                      ) as HTMLButtonElement;
                      if (toolbarButton) {
                        toolbarButton.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                        toolbarButton.focus();
                        // Trigger click to open toolbar if it's closed
                        if (
                          toolbarButton.getAttribute("aria-expanded") ===
                          "false"
                        ) {
                          toolbarButton.click();
                        }
                      }
                    }}
                    className="block text-left text-amber-200 hover:text-amber-100 transition-colors duration-200  rounded px-1 py-0.5"
                  >
                    {tAccessibility("openAccessibilityToolbar")}
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Footer Bottom Section */}
          <div className="border-t border-teal-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row lg:flex-row justify-between items-start sm:items-center lg:items-center space-y-4 sm:space-y-0 lg:space-y-0">
              <div className="text-amber-100 text-xs sm:text-sm">
                <p>© 2024 {t("company")} • IČO: 12345678 • DIČ: CZ12345678</p>
                <p className="mt-1">
                  {t("description")} • Všechna práva vyhrazena
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </ErrorBoundary>
  );
}
