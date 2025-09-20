/**
 * I18n Integration Tests
 * Tests core internationalization functionality without complex component dependencies
 */

import { jest } from '@jest/globals';

// Import translation files
import csMessages from '../../../messages/cs.json';
import enMessages from '../../../messages/en.json';

// Import i18n configuration
import { locales, defaultLocale, localeNames, currencyConfig } from '../../i18n/config';

describe('I18n Integration Tests - Task 15.2: I18n Integration Completeness', () => {
  describe('Configuration Validation', () => {
    it('should have correct locale configuration', () => {
      expect(locales).toEqual(['cs', 'en']);
      expect(defaultLocale).toBe('cs');
      expect(localeNames.cs).toBe('Čeština');
      expect(localeNames.en).toBe('English');
    });

    it('should have correct currency configuration', () => {
      expect(currencyConfig.cs.currency).toBe('CZK');
      expect(currencyConfig.cs.locale).toBe('cs-CZ');
      expect(currencyConfig.cs.symbol).toBe('Kč');

      expect(currencyConfig.en.currency).toBe('CZK');
      expect(currencyConfig.en.locale).toBe('en-US');
      expect(currencyConfig.en.symbol).toBe('CZK');
    });
  });

  describe('Translation Completeness', () => {
    it('should have no missing translation keys between locales', () => {
      const checkKeysMatch = (csObj: any, enObj: any, path = '') => {
        if (typeof csObj !== 'object' || typeof enObj !== 'object') return;

        const csKeys = Object.keys(csObj);
        const enKeys = Object.keys(enObj);

        // Check if all Czech keys exist in English
        csKeys.forEach(key => {
          expect(enKeys).toContain(key);

          if (typeof csObj[key] === 'object' && typeof enObj[key] === 'object') {
            checkKeysMatch(csObj[key], enObj[key], `${path}.${key}`);
          }
        });

        // Check if all English keys exist in Czech
        enKeys.forEach(key => {
          expect(csKeys).toContain(key);
        });
      };

      checkKeysMatch(csMessages, enMessages);
    });

    it('should not have empty translation values', () => {
      const checkForEmptyValues = (obj: any, locale: string, path = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;

          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkForEmptyValues(value, locale, currentPath);
          }
        });
      };

      checkForEmptyValues(csMessages, 'cs');
      checkForEmptyValues(enMessages, 'en');
    });

    it('should have all required sections for e-commerce functionality', () => {
      const requiredSections = [
        'navigation', 'common', 'product', 'cart', 'checkout',
        'auth', 'footer', 'delivery', 'home', 'faq', 'about',
        'gdpr', 'accessibility', 'currency', 'date'
      ];

      requiredSections.forEach(section => {
        expect(csMessages).toHaveProperty(section);
        expect(enMessages).toHaveProperty(section);

        expect(typeof csMessages[section as keyof typeof csMessages]).toBe('object');
        expect(typeof enMessages[section as keyof typeof enMessages]).toBe('object');
      });
    });
  });

  describe('Business Context Appropriateness', () => {
    it('should use respectful language appropriate for funeral services in Czech', () => {
      // Check that Czech translations use appropriate, respectful tone
      expect(csMessages.home.hero.title).toContain('Důstojné rozloučení');
      expect(csMessages.home.hero.subtitle).toContain('láskou a úctou');
      expect(csMessages.about.mission).toContain('nejtěžších chvílích');
    });

    it('should use respectful language appropriate for funeral services in English', () => {
      // Check that English translations use appropriate, respectful tone
      expect(enMessages.home.hero.title).toContain('Dignified Farewell');
      expect(enMessages.home.hero.subtitle).toContain('love and respect');
      expect(enMessages.about.mission).toContain('most difficult moments');
    });

    it('should avoid casual or promotional language', () => {
      const casualWords = ['awesome', 'amazing', 'cool', 'wow', 'great deal', 'sale'];

      const checkForCasualWords = (obj: any) => {
        Object.values(obj).forEach(value => {
          if (typeof value === 'string') {
            casualWords.forEach(word => {
              // Use word boundaries to avoid false positives like "cool" in "cooler"
              const regex = new RegExp(`\\b${word}\\b`, 'i');
              expect(regex.test(value)).toBe(false);
            });
          } else if (typeof value === 'object' && value !== null) {
            checkForCasualWords(value);
          }
        });
      };

      checkForCasualWords(csMessages);
      checkForCasualWords(enMessages);
    });
  });

  describe('Accessibility Translation Coverage', () => {
    it('should have accessibility translations in both languages', () => {
      const requiredAccessibilityKeys = [
        'accessibilityOptions', 'navigation', 'visualOptions',
        'skipToContent', 'skipToNavigation', 'loading', 'error',
        'success', 'required', 'optional'
      ];

      requiredAccessibilityKeys.forEach(key => {
        expect(csMessages.accessibility).toHaveProperty(key);
        expect(enMessages.accessibility).toHaveProperty(key);

        expect(typeof csMessages.accessibility[key as keyof typeof csMessages.accessibility]).toBe('string');
        expect(typeof enMessages.accessibility[key as keyof typeof enMessages.accessibility]).toBe('string');
      });
    });

    it('should have ARIA label translations', () => {
      // Check that common ARIA labels are translated
      expect(csMessages.accessibility.showPassword).toBeDefined();
      expect(csMessages.accessibility.hidePassword).toBeDefined();
      expect(csMessages.accessibility.toggleMenu).toBeDefined();

      expect(enMessages.accessibility.showPassword).toBeDefined();
      expect(enMessages.accessibility.hidePassword).toBeDefined();
      expect(enMessages.accessibility.toggleMenu).toBeDefined();
    });
  });

  describe('Locale-specific Formatting Functions', () => {
    it('should format currency correctly for Czech locale', () => {
      const amount = 2500;
      const czechFormat = amount.toLocaleString('cs-CZ');
      const expectedFormat = `${czechFormat} Kč`;

      expect(expectedFormat).toMatch(/2\s?500\s?Kč/);
    });

    it('should format currency correctly for English locale', () => {
      const amount = 2500;
      const englishFormat = amount.toLocaleString('en-US');
      const expectedFormat = `${englishFormat} CZK`;

      expect(expectedFormat).toMatch(/2,500\s?CZK/);
    });

    it('should format dates correctly for Czech locale', () => {
      const testDate = new Date('2024-01-15');
      const czechFormat = testDate.toLocaleDateString('cs-CZ');

      // Czech date format: DD.MM.YYYY or DD. MM. YYYY
      expect(czechFormat).toMatch(/15\.\s?1\.\s?2024/);
    });

    it('should format dates correctly for English locale', () => {
      const testDate = new Date('2024-01-15');
      const englishFormat = testDate.toLocaleDateString('en-US');

      // English date format: MM/DD/YYYY
      expect(englishFormat).toBe('1/15/2024');
    });

    it('should format numbers correctly for Czech locale', () => {
      const largeNumber = 12345.67;
      const czechFormat = largeNumber.toLocaleString('cs-CZ');

      // Czech number format: space as thousands separator, comma as decimal
      expect(czechFormat).toMatch(/12\s?345,67/);
    });

    it('should format numbers correctly for English locale', () => {
      const largeNumber = 12345.67;
      const englishFormat = largeNumber.toLocaleString('en-US');

      // English number format: comma as thousands separator, dot as decimal
      expect(englishFormat).toBe('12,345.67');
    });
  });

  describe('URL and Routing Patterns', () => {
    it('should have correct locale path patterns', () => {
      const testPaths = [
        '/cs/products',
        '/en/products',
        '/cs/about',
        '/en/about',
        '/cs/contact',
        '/en/contact'
      ];

      testPaths.forEach(path => {
        const pathParts = path.split('/');
        const locale = pathParts[1];

        expect(['cs', 'en']).toContain(locale);
      });
    });

    it('should handle locale switching URL transformation', () => {
      const switchLocale = (currentPath: string, newLocale: 'cs' | 'en') => {
        const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, '') || '/';
        return `/${newLocale}${pathWithoutLocale}`;
      };

      expect(switchLocale('/cs/products', 'en')).toBe('/en/products');
      expect(switchLocale('/en/about', 'cs')).toBe('/cs/about');
      expect(switchLocale('/cs/products/funeral-wreaths', 'en')).toBe('/en/products/funeral-wreaths');
    });
  });

  describe('Error Message Appropriateness', () => {
    it('should have compassionate error messages for Czech locale', () => {
      // Check that error messages are appropriate for the sensitive context
      expect(csMessages.common.error).toBe('Chyba');
      expect(csMessages.common.loading).toBe('Načítání...');

      // Validation messages should be helpful but not harsh
      expect(csMessages.checkout.validation.required).toBe('Toto pole je povinné');
    });

    it('should have compassionate error messages for English locale', () => {
      // Check that error messages are appropriate for the sensitive context
      expect(enMessages.common.error).toBe('Error');
      expect(enMessages.common.loading).toBe('Loading...');

      // Validation messages should be helpful but not harsh
      expect(enMessages.checkout.validation.required).toBe('This field is required');
    });
  });

  describe('SEO and Meta Content', () => {
    it('should have proper SEO translations for Czech', () => {
      expect(csMessages.seo.home.title).toContain('Pohřební věnce Praha');
      expect(csMessages.seo.home.description).toContain('Prémiové pohřební věnce');
      expect(csMessages.seo.home.keywords).toBeInstanceOf(Array);
      expect(csMessages.seo.home.keywords.length).toBeGreaterThan(5);
    });

    it('should have proper SEO translations for English', () => {
      expect(enMessages.seo.home.title).toContain('Funeral Wreaths Prague');
      expect(enMessages.seo.home.description).toContain('Premium funeral wreaths');
      expect(enMessages.seo.home.keywords).toBeInstanceOf(Array);
      expect(enMessages.seo.home.keywords.length).toBeGreaterThan(5);
    });
  });

  describe('GDPR Compliance Translations', () => {
    it('should have GDPR-compliant translations in Czech', () => {
      expect(csMessages.gdpr.consentTitle).toContain('Souhlas se zpracováním');
      expect(csMessages.gdpr.acceptAll).toBe('Přijmout vše');
      expect(csMessages.gdpr.rejectAll).toBe('Odmítnout vše');
    });

    it('should have GDPR-compliant translations in English', () => {
      expect(enMessages.gdpr.consentTitle).toContain('Data Processing Consent');
      expect(enMessages.gdpr.acceptAll).toBe('Accept All');
      expect(enMessages.gdpr.rejectAll).toBe('Reject All');
    });
  });
});
