/**
 * FAQ page tests
 * Tests for FAQ page rendering, content integration, and SEO
 */

import { render, screen } from '@testing-library/react';
import FAQPage from '../page';

// Mock next-intl server functions
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Často kladené otázky',
      'items.0.question': 'Jak správně skladovat a pečovat o pohřební věnec?',
      'items.0.answer': 'Pokud si přejete věnec doručit den nebo dva před obřadem, doporučujeme jej nechat vodorovně uložený v původní krabici. Zajistíte tak, že voda z korpusu věnce neodteče. Žádná další péče není nutná – věnec je dostatečně nasycen vodou a květiny jsou ošetřeny pro co nejdelší výdrž.',
      'items.1.question': 'Jak dlouho zůstanou květiny v pohřebním věnci čerstvé?',
      'items.1.answer': 'Výdrž květin závisí na povětrnostních podmínkách. Obecně platí, že čím kratší stonek, tím delší výdrž. Smuteční věnce jsou určeny k vystavení na pietním místě. V létě při vysokých teplotách vydrží věnec krásný po dobu jednoho týdne, v chladnějším období může vydržet až dva týdny.',
      'items.2.question': 'Co dělat s věncem po uvadnutí květin?',
      'items.2.answer': 'Doporučujeme ekologickou recyklaci. Květiny z věnce vyhoďte do sběrné popelnice určené pro bio odpad a korpus věnce do sběru plastů. Společně tak šetříme přírodu a dbáme na odpovědné nakládání s materiály.'
    };
    return translations[key] || key;
  })
}));

// Mock SEO components
jest.mock('@/components/seo/StructuredData', () => ({
  StructuredData: ({ data }: { data: any }) => <script type="application/ld+json">{JSON.stringify(data)}</script>,
  generateFAQStructuredData: jest.fn(() => ({ '@type': 'FAQPage' })),
  generateOrganizationStructuredData: jest.fn(() => ({ '@type': 'Organization' }))
}));

jest.mock('@/components/seo/PageMetadata', () => ({
  generateFAQPageMetadata: jest.fn(() => ({
    title: 'FAQ Test Title',
    description: 'FAQ Test Description'
  }))
}));

// Mock FAQ Accordion component
jest.mock('@/components/faq/FAQAccordion', () => ({
  FAQAccordion: ({ items }: { items: Array<{ question: string; answer: string }> }) => (
    <div data-testid="faq-accordion">
      {items.map((item, index) => (
        <div key={index} data-testid={`faq-item-${index}`}>
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      ))}
    </div>
  )
}));

describe('FAQ Page', () => {
  const mockParams = Promise.resolve({ locale: 'cs' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Structure', () => {
    it('should render the main heading', async () => {
      render(await FAQPage({ params: mockParams }));

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Často kladené otázky');
    });

    it('should render the page description', async () => {
      render(await FAQPage({ params: mockParams }));

      expect(screen.getByText(/Odpovědi na nejčastější otázky o našich pohřebních věncích/)).toBeInTheDocument();
    });

    it('should render the FAQ accordion component', async () => {
      render(await FAQPage({ params: mockParams }));

      expect(screen.getByTestId('faq-accordion')).toBeInTheDocument();
    });

    it('should have proper page layout structure', async () => {
      const { container } = render(await FAQPage({ params: mockParams }));

      const mainContainer = container.querySelector('.container.mx-auto.px-4.py-16');
      expect(mainContainer).toBeInTheDocument();

      const contentContainer = container.querySelector('.max-w-4xl.mx-auto');
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('Content Integration', () => {
    it('should pass correct FAQ items to accordion', async () => {
      render(await FAQPage({ params: mockParams }));

      // Check that all three FAQ items are rendered
      expect(screen.getByTestId('faq-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('faq-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('faq-item-2')).toBeInTheDocument();
    });

    it('should display all FAQ questions', async () => {
      render(await FAQPage({ params: mockParams }));

      expect(screen.getByText('Jak správně skladovat a pečovat o pohřební věnec?')).toBeInTheDocument();
      expect(screen.getByText('Jak dlouho zůstanou květiny v pohřebním věnci čerstvé?')).toBeInTheDocument();
      expect(screen.getByText('Co dělat s věncem po uvadnutí květin?')).toBeInTheDocument();
    });

    it('should display all FAQ answers', async () => {
      render(await FAQPage({ params: mockParams }));

      expect(screen.getByText(/Pokud si přejete věnec doručit den nebo dva před obřadem/)).toBeInTheDocument();
      expect(screen.getByText(/Výdrž květin závisí na povětrnostních podmínkách/)).toBeInTheDocument();
      expect(screen.getByText(/Doporučujeme ekologickou recyklaci/)).toBeInTheDocument();
    });

    it('should use translations from i18n system', async () => {
      const { getTranslations } = require('next-intl/server');

      render(await FAQPage({ params: mockParams }));

      expect(getTranslations).toHaveBeenCalledWith('faq');
    });
  });

  describe('SEO and Structured Data', () => {
    it('should include FAQ structured data', async () => {
      const { container } = render(await FAQPage({ params: mockParams }));

      const scripts = container.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts.length).toBeGreaterThanOrEqual(1);
    });

    it('should include organization structured data', async () => {
      const { generateOrganizationStructuredData } = require('@/components/seo/StructuredData');

      render(await FAQPage({ params: mockParams }));

      expect(generateOrganizationStructuredData).toHaveBeenCalledWith('cs');
    });

    it('should generate FAQ structured data with correct items', async () => {
      const { generateFAQStructuredData } = require('@/components/seo/StructuredData');

      render(await FAQPage({ params: mockParams }));

      expect(generateFAQStructuredData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            question: 'Jak správně skladovat a pečovat o pohřební věnec?',
            answer: expect.stringContaining('Pokud si přejete věnec doručit')
          }),
          expect.objectContaining({
            question: 'Jak dlouho zůstanou květiny v pohřebním věnci čerstvé?',
            answer: expect.stringContaining('Výdrž květin závisí')
          }),
          expect.objectContaining({
            question: 'Co dělat s věncem po uvadnutí květin?',
            answer: expect.stringContaining('Doporučujeme ekologickou recyklaci')
          })
        ]),
        'cs'
      );
    });

    it('should generate page metadata', async () => {
      const { generateFAQPageMetadata } = require('@/components/seo/PageMetadata');
      const FAQPageModule = require('../page');

      await FAQPageModule.generateMetadata({ params: mockParams });

      expect(generateFAQPageMetadata).toHaveBeenCalledWith('cs');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive heading classes', async () => {
      render(await FAQPage({ params: mockParams }));

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-4xl', 'md:text-5xl');
    });

    it('should have responsive container classes', async () => {
      const { container } = render(await FAQPage({ params: mockParams }));

      const mainContainer = container.querySelector('.container');
      expect(mainContainer).toHaveClass('mx-auto', 'px-4', 'py-16');

      const contentContainer = container.querySelector('.max-w-4xl');
      expect(contentContainer).toHaveClass('mx-auto');
    });

    it('should have responsive text classes', async () => {
      render(await FAQPage({ params: mockParams }));

      const description = screen.getByText(/Odpovědi na nejčastější otázky/);
      expect(description).toHaveClass('text-lg', 'text-neutral-600', 'text-center');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(await FAQPage({ params: mockParams }));

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent('Často kladené otázky');
    });

    it('should have semantic HTML structure', async () => {
      const { container } = render(await FAQPage({ params: mockParams }));

      // Check for proper container structure
      expect(container.querySelector('div.container')).toBeInTheDocument();
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    it('should have proper color contrast classes', async () => {
      render(await FAQPage({ params: mockParams }));

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-primary-800');

      const description = screen.getByText(/Odpovědi na nejčastější otázky/);
      expect(description).toHaveClass('text-neutral-600');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translations gracefully', async () => {
      const { getTranslations } = require('next-intl/server');
      getTranslations.mockImplementation(() => (key: string) => key);

      render(await FAQPage({ params: mockParams }));

      // Should still render the page structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByTestId('faq-accordion')).toBeInTheDocument();
    });

    it('should handle empty FAQ items', async () => {
      const { getTranslations } = require('next-intl/server');
      getTranslations.mockImplementation(() => () => '');

      render(await FAQPage({ params: mockParams }));

      // Should still render accordion component
      expect(screen.getByTestId('faq-accordion')).toBeInTheDocument();
    });
  });
});
