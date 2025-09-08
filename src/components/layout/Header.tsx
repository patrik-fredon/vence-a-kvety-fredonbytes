'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { LanguageToggle } from './LanguageToggle';
import { locales, localeNames } from '@/i18n/config';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('navigation');

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="text-elegant text-2xl font-semibold text-primary-800 hover:text-primary-700 transition-colors"
          >
            Pohřební věnce
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href={`/${locale}`}
              className="text-neutral-700 hover:text-primary-700 transition-colors"
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/products`}
              className="text-neutral-700 hover:text-primary-700 transition-colors"
            >
              {t('products')}
            </Link>
            <Link
              href={`/${locale}/categories`}
              className="text-neutral-700 hover:text-primary-700 transition-colors"
            >
              {t('categories')}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="text-neutral-700 hover:text-primary-700 transition-colors"
            >
              {t('about')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="text-neutral-700 hover:text-primary-700 transition-colors"
            >
              {t('contact')}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <LanguageToggle currentLocale={locale} />
            <AuthStatus locale={locale} />

            {/* Cart icon */}
            <Link
              href={`/${locale}/cart`}
              className="text-neutral-700 hover:text-primary-700 transition-colors"
            >
              <span className="sr-only">{t('cart')}</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
