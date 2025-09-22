"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { AuthStatus } from "@/components/auth";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Navigation } from "./Navigation";
import { CartIcon } from "@/components/cart/CartIcon";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { cn } from "@/lib/utils";
import { type Locale } from "@/i18n/config";

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("navigation");
  const tAccessibility = useTranslations("accessibility");
  const tUI = useTranslations("ui");
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
      <header
        className="border-b border-stone-200 bg-white sticky top-0 z-40 shadow-sm"
        role="banner"
      >
        {/* Container with max-width and centered content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Skip to main content link for screen readers */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-stone-900 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            onClick={(e) => {
              e.preventDefault();
              const mainContent = document.getElementById('main-content');
              if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {tAccessibility('skipToContent')}
          </a>

          {/* Top bar - Quick navigation */}
          <div className="flex items-center justify-between py-2 text-sm text-stone-600 border-b border-stone-100">
            <div className="hidden md:flex items-center gap-6">
              <Link
                href={`/${locale}/products`}
                className="hover:text-stone-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded px-1 py-0.5"
              >
                {t("products")}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="hover:text-stone-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded px-1 py-0.5"
              >
                {t("contact")}
              </Link>
              <Link
                href={`/${locale}/faq`}
                className="hover:text-stone-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded px-1 py-0.5"
              >
                {t("howToOrder")}
              </Link>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Search icon */}
              <button
                className="p-1.5 hover:text-stone-800 hover:bg-stone-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-md"
                aria-label={t("search")}
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>

              {/* Language Switcher - Desktop */}
              <div className="hidden sm:block">
                <LanguageSwitcher currentLocale={locale} />
              </div>

              {/* User/Auth status - Desktop */}
              <div className="hidden sm:block">
                <AuthStatus locale={locale} />
              </div>

              {/* Cart icon with enhanced styling */}
              <CartIcon locale={locale} className="p-1.5 hover:bg-stone-50 rounded-md transition-colors duration-200" />
            </div>
          </div>

          {/* Main header */}
          <div className="flex items-center justify-between py-4">
            {/* Logo with enhanced typography */}
            <Link
              href={`/${locale}`}
              className="text-2xl font-light tracking-wide text-stone-900 hover:text-stone-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-lg px-2 py-1"
              aria-label={t("home")}
            >
              POHŘEBNÍ <span className="text-teal-700 font-medium">VĚNCE</span>
            </Link>

            {/* Desktop Navigation with enhanced styling */}
            <nav
              id="main-navigation"
              className="hidden md:flex items-center gap-8"
              role="navigation"
              aria-label={tAccessibility('mainNavigation')}
            >
              <Link
                href={`/${locale}`}
                className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-md px-3 py-2"
              >
                {t("home")}
              </Link>
              <Link
                href={`/${locale}/products`}
                className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-md px-3 py-2"
              >
                {t("products")}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-md px-3 py-2"
              >
                {t("about")}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-md px-3 py-2"
              >
                {t("contact")}
              </Link>
            </nav>

            {/* Mobile menu button with enhanced styling */}
            <button
              onClick={toggleMobileMenu}
              className={cn(
                "md:hidden p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-50",
                "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-lg",
                isMobileMenuOpen && "bg-stone-100"
              )}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? tAccessibility('closeMenu') : tAccessibility('openMenu')}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Bars3Icon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu overlay with enhanced backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile menu with enhanced design */}
        <div
          id="mobile-menu"
          className={cn(
            "fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-xl",
            "transform transition-transform duration-300 ease-in-out z-50 md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="flex flex-col h-full">
            {/* Mobile menu header with enhanced styling */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
              <span className="text-lg font-light text-stone-900">{tUI('menu')}</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-lg"
                aria-label={tAccessibility('closeMenu')}
              >
                <XMarkIcon className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile navigation with enhanced spacing */}
            <div className="flex-1 overflow-y-auto p-6">
              <ErrorBoundary
                fallback={
                  <div className="text-sm text-stone-500 p-4 bg-stone-50 rounded-lg">
                    {tUI('navigationNotAvailable')}
                  </div>
                }
              >
                <Navigation locale={locale} mobile={true} onItemClick={closeMobileMenu} />
              </ErrorBoundary>
            </div>

            {/* Mobile menu footer with enhanced styling */}
            <div className="border-t border-stone-200 p-4 space-y-4 bg-stone-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700">{tUI('language')}:</span>
                <LanguageSwitcher currentLocale={locale} />
              </div>

              <div className="pt-2 border-t border-stone-200">
                <AuthStatus locale={locale} />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
