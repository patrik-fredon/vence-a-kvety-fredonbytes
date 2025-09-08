'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { LanguageToggle } from './LanguageToggle';
import { AuthStatus } from '../auth/AuthStatus';
import { Navigation } from './Navigation';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('navigation');
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar with language toggle and auth status */}
        <div className="flex justify-between items-center py-2 border-b border-neutral-100">
          <div className="flex items-center space-x-4">
            <LanguageToggle currentLocale={locale} />
          </div>
          <div className="flex items-center space-x-4">
            <AuthStatus />
          </div>
        </div>

        {/* Main header */}
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-3 group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <span className="text-2xl">🌹</span>
            </div>
            <div>
              <h1 className="text-elegant text-xl font-semibold text-primary-800 group-hover:text-primary-700 transition-colors">
                Pohřební věnce
              </h1>
              <p className="text-xs text-neutral-600">Ketingmar s.r.o.</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <Navigation locale={locale} />
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href={`/${locale}/cart`}
              className="relative p-2 text-neutral-700 hover:text-primary-700 transition-colors"
              aria-label={t('cart')}
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {/* Cart badge - will be implemented with cart state */}
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-neutral-700 hover:text-primary-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-100 animate-slide-down">
          <div className="container mx-auto px-4 py-4">
            <Navigation locale={locale} mobile onItemClick={() => setIsMobileMenuOpen(false)} />

            {/* Mobile cart link */}
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <Link
                href={`/${locale}/cart`}
                className="flex items-center space-x-3 p-3 text-neutral-700 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>{t('cart')}</span>
                <span className="ml-auto bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
