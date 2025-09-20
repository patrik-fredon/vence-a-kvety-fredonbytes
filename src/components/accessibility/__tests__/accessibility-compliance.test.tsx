/**
 * Comprehensive accessibility compliance tests
 * Tests WCAG 2.1 AA compliance, keyboard navigation, and screen reader support
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { AccessibilityProvider } from '@/lib/accessibility/context';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { ProductCard } from '@/components/product/ProductCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';
import { KeyboardNavigationGrid, GridItem } from '@/components/accessibility/KeyboardNavigationGrid';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock translations
const messages = {
  accessibility: {
    accessibilityOptions: 'Možnosti přístupnosti',
    toolbarDescription: 'Přizpůsobte si prohlížení pomocí funkcí pro přístupnost',
    skipToContent: 'Přejít na hlavní obsah',
    skipToNavigation: 'Přejít na navigaci',
    productGrid: 'Mřížka produktů',
    loading: 'Načítání',
    required: 'povinné'
  },
  navigation: {
    home: 'Domů',
    products: 'Produkty',
    about: 'O nás',
    contact: 'Kontakt',
    search: 'Vyhledat'
  },
  product: {
    addToCart: 'Přidat do košíku',
    addToFavorites: 'Přidat do oblíbených',
    removeFromFavorites: 'Odebrat z oblíbených',
    featured: 'Doporučené',
    outOfStock: 'Není skladem'
  },
  currency: {
    format: '{amount} Kč'
  },
  footer: {
    company: 'Ketingmar s.r.o.',
    description: 'Profesionální pohřební služby',
    contact: 'Kontakt',
    businessHours: 'Otevírací doba',
    emergencyOrders: 'Nouzové objednávky',
    quickLinks: 'Rychlé odkazy',
    legal: 'Právní informace',
    about: 'O nás',
    faq: 'FAQ',
    privacy: 'Ochrana osobních údajů',
    terms: 'Obchodní podmínky',
    cookies: 'Cookies'
  }
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider messages={messages} locale="cs">
    <AccessibilityProvider>
      {children}
    </AccessibilityProvider>
  </NextIntlClientProvider>
);

// Mock product data
const mockProduct = {
  id: '1',
  name: { cs: 'Testovací věnec', en: 'Test Wreath' },
  description: { cs: 'Krásný testovací věnec', en: 'Beautiful test wreath' },
  slug: 'test-wreath',
  basePrice: 1500,
  images: [
    {
      id: '1',
      url: '/test-image.jpg',
      alt: 'Testovací obrázek věnce',
      isPrimary: true
    }
  ],
  category: {
    id: '1',
    name: { cs: 'Klasické věnce', en: 'Classic Wreaths' },
    slug: 'classic-wreaths'
  },
  availability: {
    inStock: true,
    quantity: 10
  },
  featured: false
};

describe('Accessibility Compliance Tests', () => {
  describe('Button Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Button>Test Button</Button>
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <TestWrapper>
          <Button onClick={handleClick}>Test Button</Button>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Test Button' });

      // Test Tab navigation
      await user.tab();
      expect(button).toHaveFocus();

      // Test Enter key activation
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Test Space key activation
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should have proper ARIA attributes when loading', async () => {
      render(
        <TestWrapper>
          <Button loading loadingText="Načítání...">Test Button</Button>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('aria-describedby');

      // Check for loading text in screen reader content
      expect(screen.getByText('Načítání...')).toHaveClass('sr-only');
    });
  });

  describe('FormField Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <FormField
            label="Test Input"
            helpText="This is help text"
            required
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <FormField
            label="Test Input"
            error="This field is required"
            helpText="This is help text"
            required
          />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox', { name: /test input/i });
      const errorMessage = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-describedby');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FormField label="Test Input" />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');

      await user.tab();
      expect(input).toHaveFocus();

      await user.type(input, 'test value');
      expect(input).toHaveValue('test value');
    });
  });

  describe('Modal Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Modal
            isOpen={true}
            onClose={() => { }}
            title="Test Modal"
            description="This is a test modal"
          >
            <p>Modal content</p>
          </Modal>
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();

      render(
        <TestWrapper>
          <button>Outside Button</button>
          <Modal
            isOpen={true}
            onClose={handleClose}
            title="Test Modal"
          >
            <button>Inside Button</button>
          </Modal>
        </TestWrapper>
      );

      // Modal should be focused initially
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Tab should cycle within modal
      await user.tab();
      const closeButton = screen.getByRole('button', { name: /zavřít dialog/i });
      expect(closeButton).toHaveFocus();

      await user.tab();
      const insideButton = screen.getByRole('button', { name: 'Inside Button' });
      expect(insideButton).toHaveFocus();
    });

    it('should close on Escape key', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();

      render(
        <TestWrapper>
          <Modal
            isOpen={true}
            onClose={handleClose}
            title="Test Modal"
          >
            <p>Modal content</p>
          </Modal>
        </TestWrapper>
      );

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ProductCard Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <ProductCard
            product={mockProduct}
            locale="cs"
            onAddToCart={() => { }}
            onToggleFavorite={() => { }}
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <ProductCard
            product={mockProduct}
            locale="cs"
            onAddToCart={() => { }}
            onToggleFavorite={() => { }}
          />
        </TestWrapper>
      );

      const article = screen.getByRole('article');
      const heading = screen.getByRole('heading', { level: 3 });
      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });
      const favoriteButton = screen.getByRole('button', { name: /přidat do oblíbených/i });

      expect(article).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
      expect(addToCartButton).toBeInTheDocument();
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleAddToCart = jest.fn();
      const handleToggleFavorite = jest.fn();

      render(
        <TestWrapper>
          <ProductCard
            product={mockProduct}
            locale="cs"
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
          />
        </TestWrapper>
      );

      // Tab through interactive elements
      await user.tab(); // Product link
      await user.tab(); // Favorite button
      await user.tab(); // Add to cart button

      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });
      expect(addToCartButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleAddToCart).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('KeyboardNavigationGrid Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <KeyboardNavigationGrid columns={2} ariaLabel="Test Grid">
            <GridItem>Item 1</GridItem>
            <GridItem>Item 2</GridItem>
            <GridItem>Item 3</GridItem>
            <GridItem>Item 4</GridItem>
          </KeyboardNavigationGrid>
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support arrow key navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <KeyboardNavigationGrid columns={2} ariaLabel="Test Grid">
            <GridItem>Item 1</GridItem>
            <GridItem>Item 2</GridItem>
            <GridItem>Item 3</GridItem>
            <GridItem>Item 4</GridItem>
          </KeyboardNavigationGrid>
        </TestWrapper>
      );

      const grid = screen.getByRole('grid');
      const items = screen.getAllByRole('gridcell');

      // Focus grid
      grid.focus();

      // Arrow right should move to next item
      await user.keyboard('{ArrowRight}');
      expect(items[1]).toHaveFocus();

      // Arrow down should move to item below
      await user.keyboard('{ArrowDown}');
      expect(items[3]).toHaveFocus();

      // Arrow left should move to previous item
      await user.keyboard('{ArrowLeft}');
      expect(items[2]).toHaveFocus();

      // Arrow up should move to item above
      await user.keyboard('{ArrowUp}');
      expect(items[0]).toHaveFocus();
    });
  });

  describe('AccessibilityToolbar Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <AccessibilityToolbar locale="cs" />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should toggle high contrast mode', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AccessibilityToolbar locale="cs" />
        </TestWrapper>
      );

      // Open toolbar
      const toggleButton = screen.getByRole('button', { name: /otevřít panel přístupnosti/i });
      await user.click(toggleButton);

      // Find and click high contrast button
      const highContrastButton = screen.getByRole('button', { name: /zapnout vysoký kontrast/i });
      await user.click(highContrastButton);

      // Check if high contrast class is added to document
      expect(document.documentElement).toHaveClass('high-contrast');
    });
  });

  describe('Header Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Header locale="cs" />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper landmark roles', () => {
      render(
        <TestWrapper>
          <Header locale="cs" />
        </TestWrapper>
      );

      const banner = screen.getByRole('banner');
      const navigation = screen.getByRole('navigation', { name: /hlavní navigace/i });

      expect(banner).toBeInTheDocument();
      expect(navigation).toBeInTheDocument();
    });

    it('should support keyboard navigation in mobile menu', async () => {
      const user = userEvent.setup();

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(
        <TestWrapper>
          <Header locale="cs" />
        </TestWrapper>
      );

      const menuButton = screen.getByRole('button', { name: /otevřít menu/i });

      // Open mobile menu with keyboard
      await user.tab();
      // Skip other focusable elements to get to menu button
      menuButton.focus();
      await user.keyboard('{Enter}');

      // Check if menu is expanded
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Footer Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Footer locale="cs" />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper landmark role', () => {
      render(
        <TestWrapper>
          <Footer locale="cs" />
        </TestWrapper>
      );

      const contentinfo = screen.getByRole('contentinfo');
      expect(contentinfo).toBeInTheDocument();
    });

    it('should have proper contact information structure', () => {
      render(
        <TestWrapper>
          <Footer locale="cs" />
        </TestWrapper>
      );

      // Check for proper address element
      const address = screen.getByText(/květinová 123/i).closest('address');
      expect(address).toBeInTheDocument();
      expect(address).toHaveClass('not-italic');

      // Check for phone links with proper aria-labels
      const phoneLinks = screen.getAllByRole('link', { name: /zavolat/i });
      expect(phoneLinks.length).toBeGreaterThan(0);

      // Check for email links
      const emailLinks = screen.getAllByRole('link', { name: /poslat email/i });
      expect(emailLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Color Contrast Compliance', () => {
    it('should meet WCAG AA contrast requirements for primary colors', () => {
      // Test primary color combinations
      const { ColorContrast } = require('@/lib/accessibility/validation');

      // Primary text on white background
      const primaryOnWhite = ColorContrast.getContrastRatio('#2D5016', '#FFFFFF');
      expect(primaryOnWhite).toBeGreaterThanOrEqual(4.5);

      // Secondary text on white background
      const secondaryOnWhite = ColorContrast.getContrastRatio('#6F7752', '#FFFFFF');
      expect(secondaryOnWhite).toBeGreaterThanOrEqual(4.5);

      // White text on primary background
      const whiteOnPrimary = ColorContrast.getContrastRatio('#FFFFFF', '#2D5016');
      expect(whiteOnPrimary).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper screen reader announcements', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AccessibilityToolbar locale="cs" />
        </TestWrapper>
      );

      // Open toolbar
      const toggleButton = screen.getByRole('button', { name: /otevřít panel přístupnosti/i });
      await user.click(toggleButton);

      // Check for live region announcements
      await waitFor(() => {
        const liveRegion = document.querySelector('[aria-live]');
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <div>
            <h1>Main Title</h1>
            <ProductCard
              product={mockProduct}
              locale="cs"
              onAddToCart={() => { }}
              onToggleFavorite={() => { }}
            />
          </div>
        </TestWrapper>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      const h3 = screen.getByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });
  });
});

describe('Keyboard Navigation Integration Tests', () => {
  it('should support complete keyboard navigation flow', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <div>
          <Header locale="cs" />
          <main id="main-content" tabIndex={-1}>
            <KeyboardNavigationGrid columns={2} ariaLabel="Product Grid">
              <GridItem>
                <ProductCard
                  product={mockProduct}
                  locale="cs"
                  onAddToCart={() => { }}
                  onToggleFavorite={() => { }}
                />
              </GridItem>
              <GridItem>
                <ProductCard
                  product={{ ...mockProduct, id: '2', name: { cs: 'Druhý věnec', en: 'Second Wreath' } }}
                  locale="cs"
                  onAddToCart={() => { }}
                  onToggleFavorite={() => { }}
                />
              </GridItem>
            </KeyboardNavigationGrid>
          </main>
          <Footer locale="cs" />
        </div>
      </TestWrapper>
    );

    // Test skip link functionality
    const skipLink = screen.getByText('Přejít na hlavní obsah');
    skipLink.focus();
    await user.keyboard('{Enter}');

    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveFocus();

    // Test grid navigation
    const grid = screen.getByRole('grid');
    grid.focus();

    await user.keyboard('{ArrowRight}');
    const gridCells = screen.getAllByRole('gridcell');
    expect(gridCells[1]).toHaveFocus();
  });
});
