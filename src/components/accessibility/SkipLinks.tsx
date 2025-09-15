/**
 * Skip links component for keyboard navigation
 * Provides quick navigation to main content areas
 */

'use client';

import { useTranslations } from 'next-intl';

interface SkipLinksProps {
  locale: string;
}

export function SkipLinks({ locale }: SkipLinksProps) {
  const t = useTranslations('accessibility');

  const skipLinks = [
    {
      href: '#main-content',
      label: t('skipToContent'),
      key: 'content'
    },
    {
      href: '#main-navigation',
      label: t('skipToNavigation'),
      key: 'navigation'
    },
    {
      href: '#search',
      label: t('skipToSearch'),
      key: 'search'
    },
    {
      href: '#footer',
      label: t('skipToFooter'),
      key: 'footer'
    }
  ];

  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary-600 text-white p-2">
        <div className="container mx-auto">
          <nav aria-label={t('skipNavigation')}>
            <ul className="flex flex-wrap gap-4">
              {skipLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="
                      inline-block px-4 py-2 bg-primary-700 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600
                      hover:bg-primary-800 transition-colors
                    "
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.querySelector(link.href);
                      if (target) {
                        // Make the target focusable if it isn't already
                        if (!target.hasAttribute('tabindex')) {
                          target.setAttribute('tabindex', '-1');
                        }
                        (target as HTMLElement).focus();
                        target.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
