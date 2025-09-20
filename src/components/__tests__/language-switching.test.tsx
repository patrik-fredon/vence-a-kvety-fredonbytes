/**
 * Language Switching Functionality Tests
 * Tests language switching across all pages and components
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { jest } from '@jest/globals';

// Import translation files
import csMessages from '../../../messages/cs.json';
import enMessages from '../../../messages/en.json';

// Import components
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { Header } from '../layout/Header';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock cart and auth contexts
jest.mock('../../lib/cart/context', () => ({
  useCart: () => ({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
  }),
}));

jest.mock('../../lib/auth/hooks', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
  }),
}));

// Test wrapper
const TestWrapper = ({
  children,
  locale = 'cs',
  messages = csMessages
}: {
  children: React.ReactNode;
  locale?: string;
  messages?: any;
}) => (
  <NextIntlClientProvider locale={locale} messages={messages}>
    {children}
  </NextIntlClientProvider>
);

describe('Language Switching Tests - Task 15.2: I18n Integration Completeness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
    });
  });

  describe('Language Switcher Component', () => {
    it('should render language switcher with current locale', () => {
      (usePathname as jest.Mock).mockReturnValue('/cs');

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      expect(screen.getByText('Čeština')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show language options when clicked', async () => {
      (usePathname as jest.Mock).mockReturnValue('/cs');

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole('button');
      fireEvent.click(switcher);

      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Čeština')).toBeInTheDocument();
      });
    });

    it('should switch to English when English option is selected', async () => {
      (usePathname as jest.Mock).mockReturnValue('/cs/products');

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole('button');
      fireEvent.click(switcher);

      await waitFor(() => {
        const englishOption = screen.getByText('English');
        fireEvent.click(englishOption);
      });

      expect(mockReplace).toHaveBeenCalledWith('/en/products');
    });

    it('should switch to Czech when Czech option is selected', async () => {
      (usePathname as jest.Mock).mockReturnValue('/en/about');

      render(
        <TestWrapper locale="en" messages={enMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole('button');
      fireEvent.click(switcher);

      await waitFor(() => {
        const czechOption = screen.getByText('Čeština');
        fireEvent.click(czechOption);
      });

      expect(mockReplace).toHaveBeenCalledWith('/cs/about');
    });
  });

  describe('Language Switching Across Pages', () => {
    const testPages = [
      { path: '/products', cs: '/cs/products', en: '/en/products' },
      { path: '/about', cs: '/cs/about', en: '/en/about' },
      { path: '/contact', cs: '/cs/contact', en: '/en/contact' },
      { path: '/cart', cs: '/cs/cart', en: '/en/cart' },
      { path: '/checkout', cs: '/cs/checkout', en: '/en/checkout' },
    ];

    testPages.forEach(({ path, cs, en }) => {
      it(`should switch language correctly on ${path} page`, async () => {
        (usePathname as jest.Mock).mockReturnValue(cs);

        render(
          <TestWrapper locale="cs" messages={csMessages}>
            <LanguageSwitcher />
          </TestWrapper>
        );

        const switcher = screen.getByRole('button');
        fireEvent.click(switcher);

        await waitFor(() => {
          const englishOption = screen.getByText('English');
          fireEvent.click(englishOption);
        });

        expect(mockReplace).toHaveBeenCalledWith(en);
      });
    });
  });

  describe('Content Display After Language Switch', () => {
    it('should display Czech content after switching to Czech', () => {
      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText('Domů')).toBeInTheDocument();
      expect(screen.getByText('Produkty')).toBeInTheDocument();
      expect(screen.getByText('O nás')).toBeInTheDocument();
      expect(screen.getByText('Kontakt')).toBeInTheDocument();
    });

    it('should display English content after switching to English', () => {
      render(
        <TestWrapper locale="en" messages={enMessages}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  describe('URL Structure Validation', () => {
    it('should maintain correct URL structure for Czech locale', () => {
      (usePathname as jest.Mock).mockReturnValue('/cs/products/funeral-wreaths');

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole('button');
      fireEvent.click(switcher);

      fireEvent.click(screen.getByText('English'));

      expect(mockReplace).toHaveBeenCalledWith('/en/products/funeral-wreaths');
    });

    it('should maintain correct URL structure for English locale', () => {
      (usePathname as jest.Mock).mockReturnValue('/en/products/funeral-wreaths');

      render(
        <TestWrapper locale="en" messages={enMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole('button');
      fireEvent.click(switcher);

      fireEvent.click(screen.getByText('Čeština'));

      expect(mockReplace).toHaveBeenCalledWith('/cs/products/funeral-wreaths');
    });

    it('should handle query parameters correctly during language switch', () => {
      (usePathname as jest.Mock).mockReturnValue('/cs/products');

      // Mock search params
      Object.defineProperty(window, 'location', {
        value: {
          search: '?category=wreaths&sort=price',
        },
        writable: true,
      });

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole('button');
      fireEvent.click(switcher);

      fireEvent.click(screen.getByText('English'));

      expect(mockReplace).toHaveBeenCalledWith('/en/products?category=wreaths&sort=price');
    });
  });

  describe('Accessibility in Language Switching', () => {
    it('should have proper ARIA labels for language switcher', () => {
      (usePathname as jest.Mock).mockReturnValue('/cs');

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole('button');
      expect(switcher).toHaveAttribute('aria-label');
      expect(switcher).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update ARIA attributes when dropdown is opened', async () => {
      (usePathname as jest.Mock).mockReturnValue('/cs');

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole('button');
      fireEvent.click(switcher);

      await waitFor(() => {
        expect(switcher).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should be keyboard navigable', async () => {
      (usePathname as jest.Mock).mockReturnValue('/cs');

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole('button');

      // Test keyboard navigation
      fireEvent.keyDown(switcher, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
      });

      // Test escape key to close
      fireEvent.keyDown(switcher, { key: 'Escape' });

      await waitFor(() => {
        expect(switcher).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid locale gracefully', () => {
      (usePathname as jest.Mock).mockReturnValue('/invalid/products');

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole('button');
      fireEvent.click(switcher);

      fireEvent.click(screen.getByText('English'));

      // Should default to valid locale structure
      expect(mockReplace).toHaveBeenCalledWith('/en/products');
    });

    it('should handle missing translation keys gracefully', () => {
      const incompleteMessages = {
        navigation: {
          home: 'Home',
          // Missing other keys
        },
      };

      render(
        <TestWrapper locale="en" messages={incompleteMessages}>
          <Header />
        </TestWrapper>
      );

      // Should not crash and should display fallback or key
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
