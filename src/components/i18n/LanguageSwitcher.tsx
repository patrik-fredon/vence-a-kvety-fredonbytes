'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { locales, localeNames, type Locale } from '../../i18n/config';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  className?: string;
}

export function LanguageSwitcher({
  currentLocale,
  className = ''
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const switchLanguage = (newLocale: Locale) => {
    setIsOpen(false);

    // Get current path without locale prefix
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';

    // Preserve query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const queryString = searchParams.toString();
    const newPath = `/${newLocale}${pathWithoutLocale}${queryString ? `?${queryString}` : ''}`;

    router.replace(newPath);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-md transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={t('selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span>{localeNames[currentLocale]}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="listbox"
          aria-label={t('selectLanguage')}
        >
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                type="button"
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${locale === currentLocale
                    ? 'bg-amber-50 text-amber-900 font-medium'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                onClick={() => switchLanguage(locale)}
                role="option"
                aria-selected={locale === currentLocale}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {locale === 'cs' ? '🇨🇿' : '🇬🇧'}
                  </span>
                  <span>{localeNames[locale]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook version for easier usage
export function useLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: Locale) => {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    const searchParams = new URLSearchParams(window.location.search);
    const queryString = searchParams.toString();
    const newPath = `/${newLocale}${pathWithoutLocale}${queryString ? `?${queryString}` : ''}`;

    router.replace(newPath);
  };

  return { switchLanguage };
}
