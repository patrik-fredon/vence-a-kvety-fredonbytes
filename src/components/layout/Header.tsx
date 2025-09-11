"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { LanguageToggle } from "./LanguageToggle";
import { Navigation } from "./Navigation";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("navigation");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Přejít na hlavní obsah
      </a>

      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="text-elegant text-xl sm:text-2xl font-semibold text-primary-800 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
              aria-label={t("home")}
            >
              Pohřební věnce
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <ErrorBoundary
                fallback={<div className="text-sm text-neutral-500">Navigace není dostupná</div>}
              >
                <Navigation locale={locale} />
              </ErrorBoundary>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop language toggle and auth */}
              <div className="hidden sm:flex items-center space-x-4">
                <LanguageToggle currentLocale={locale} />
                <AuthStatus locale={locale} />
              </div>

              {/* Cart icon */}
              <Link
                href={`/${locale}/cart`}
                className="p-2 text-neutral-700 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
                aria-label={t("cart")}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01"
                  />
                </svg>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-neutral-700 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? "Zavřít menu" : "Otevřít menu"}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-elegant transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="flex flex-col h-full">
            {/* Mobile menu header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <span className="text-elegant text-lg font-semibold text-primary-800">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-neutral-700 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
                aria-label="Zavřít menu"
              >
                <XMarkIcon className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <ErrorBoundary
                fallback={
                  <div className="text-sm text-neutral-500 p-4">Navigace není dostupná</div>
                }
              >
                <Navigation locale={locale} mobile={true} onItemClick={closeMobileMenu} />
              </ErrorBoundary>
            </div>

            {/* Mobile menu footer */}
            <div className="border-t border-neutral-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Jazyk:</span>
                <LanguageToggle currentLocale={locale} />
              </div>
              <AuthStatus locale={locale} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
