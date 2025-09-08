'use client';

import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

interface LanguageToggleProps {
  currentLocale: string;
}

export function LanguageToggle({ currentLocale }: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const switchLanguage = (locale: Locale) => {
    // Remove current locale from pathname and add new locale
    const segments = pathname.split('/').filter(Boolean);
    if (locales.includes(segments[0] as Locale)) {
      segments.shift(); // Remove current locale
    }

    const newPath = `/${locale}${segments.length > 0 ? '/' + segments.join('/') : ''}`;
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLocaleName = localeNames[currentLocale as Locale] || localeNames.cs;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 text-sm text-neutral-700 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <GlobeAltIcon className="w-4 h-4" />
        <span className="font-medium">{currentLocaleName}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-elegant min-w-[120px] animate-scale-in z-50">
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 transition-colors ${
                  locale === currentLocale
                    ? 'text-primary-700 bg-primary-50 font-medium'
                    : 'text-neutral-700'
                }`}
                disabled={locale === currentLocale}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
