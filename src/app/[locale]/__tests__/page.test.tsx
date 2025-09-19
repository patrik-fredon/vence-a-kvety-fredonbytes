/**
 * Homepage content rendering tests
 * Tests for hero section, benefits section, philosophy section, and features section integration
 */

import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import Home from '../page';

// Mock next-intl server functions
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      // Hero section
      'hero.title': 'Důstojné rozloučení s krásou květin',
      'hero.subtitle': 'Pohřební věnce vytvořené s láskou a úctou k vašim blízkým',
      'hero.description': 'V těžkých chvílích rozloučení vám pomůžeme vyjádřit lásku a úctu prostřednictvím nádherných květinových aranžmá. Každý věnec vytváříme s citem, pečlivostí a porozuměním pro vaši ztrátu.',
      'hero.cta': 'Vybrat věnec pro rozloučení',
      'contactUs': 'Kontaktovat nás',

      // Philosophy section
      'philosophy.quote': 'Život je křehký jako motýlí prach, ale krása a láska zůstávají navždy',
      'philosophy.text': 'Uvědomujeme si, že život je křehký jako motýlí prach a že v jednom okamžiku se může náš svět změnit. Naše fyzická podoba se pak promění v jinou energii. Každý den je plný těchto proměn, viditelných i neviditelných. Jednou z těchto viditelných proměn je motýl, jehož přirozeným procesem je transformace z housenky na krásného tvora. Stejně tak vnímáme odchod na druhou stranu – jako přirozenou transformaci, která pokračuje v jiné podobě.',

      // Benefits section
      'benefits.title': 'Proč si vybrat naše pohřební věnce',
      'benefits.items.0.title': 'Garance čerstvosti květin',
      'benefits.items.0.description': 'Květiny objednáváme vždy čerstvé až na základě vaší objednávky. Garantujeme nejvyšší kvalitu a dlouhou výdrž každého květu pro důstojné rozloučení.',
      'benefits.items.1.title': 'Spolehlivé doručení na míru',
      'benefits.items.1.description': 'Produkty doručíme přesně na vámi určené místo v čase, který vám vyhovuje. Rozumíme naléhavosti a zajistíme včasné dodání bez stresu.',
      'benefits.items.2.title': 'Pečlivá ruční práce',
      'benefits.items.2.description': 'Dáváme si záležet na uložení každého jednoho květu tak, aby výsledná práce byla dokonalá. Každý věnec je jedinečné dílo vytvořené s láskou a úctou.',
      'benefits.items.3.title': 'Možnost personalizace',
      'benefits.items.3.description': 'Máte možnost si vybrat tvar, velikost a barevnost vašeho smutečního věnce podle vlastních představ. Pomůžeme vám vytvořit osobní a významné rozloučení.',

      // Features section (existing)
      'features.handcrafted.title': 'Ruční výroba',
      'features.handcrafted.description': 'Každý věnec je pečlivě vytvořen našimi zkušenými floristy s důrazem na detail a kvalitu.',
      'features.fastDelivery.title': 'Rychlé dodání',
      'features.fastDelivery.description': 'Dodání již následující den. Rozumíme naléhavosti a zajistíme včasné doručení.',
      'features.personalApproach.title': 'Osobní přístup',
      'features.personalApproach.description': 'Pomůžeme vám vybrat nebo přizpůsobit věnec podle vašich představ a požadavků.'
    };
    return translations[key] || key;
  })
}));

// Mock SEO components
jest.mock('@/components/seo/StructuredData', () => ({
  StructuredData: ({ data }: { data: any }) => <script type="application/ld+json">{JSON.stringify(data)}</script>,
  generateOrganizationStructuredData: jest.fn(() => ({ '@type': 'Organization' })),
  generateWebsiteStructuredData: jest.fn(() => ({ '@type': 'WebSite' })),
  generateLocalBusinessStructuredData: jest.fn(() => ({ '@type': 'LocalBusiness' })),
  generateFAQStructuredData: jest.fn(() => ({ '@type': 'FAQPage' }))
}));

jest.mock('@/components/seo/PageMetadata', () => ({
  generateHomepageMetadata: jest.fn(() => ({
    title: 'Test Title',
    description: 'Test Description'
  }))
}));

describe('Homepage Content Rendering', () => {
  const mockParams = Promise.resolve({ locale: 'cs' });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Hero Section', () => {
    it('should display main title correctly', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Důstojné rozloučení s krásou květin');
    });

    it('should display subtitle correctly', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByText('Pohřební věnce vytvořené s láskou a úctou k vašim blízkým')).toBeInTheDocument();
    });

    it('should display description correctly', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByText(/V těžkých chvílích rozloučení vám pomůžeme vyjádřit lásku a úctu/)).toBeInTheDocument();
    });

    it('should display call-to-action buttons', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByRole('link', { name: 'Vybrat věnec pro rozloučení' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Kontaktovat nás' })).toBeInTheDocument();
    });

    it('should have correct button links', async () => {
      render(await Home({ params: mockParams }));

      const browseLink = screen.getByRole('link', { name: 'Vybrat věnec pro rozloučení' });
      const contactLink = screen.getByRole('link', { name: 'Kontaktovat nás' });

      expect(browseLink).toHaveAttribute('href', '/cs/products');
      expect(contactLink).toHaveAttribute('href', '/cs/contact');
    });
  });

  describe('Philosophy Section', () => {
    it('should display philosophy quote', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByText(/Život je křehký jako motýlí prach, ale krása a láska zůstávají navždy/)).toBeInTheDocument();
    });

    it('should display philosophy text', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByText(/Uvědomujeme si, že život je křehký jako motýlí prach/)).toBeInTheDocument();
    });

    it('should have proper quote styling', async () => {
      render(await Home({ params: mockParams }));

      const blockquote = screen.getByRole('blockquote');
      expect(blockquote).toHaveClass('text-2xl', 'md:text-3xl', 'text-primary-700', 'font-elegant', 'italic');
      expect(blockquote).toHaveTextContent('Život je křehký jako motýlí prach, ale krása a láska zůstávají navždy');
    });
  });

  describe('Benefits Section', () => {
    it('should display benefits title', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Proč si vybrat naše pohřební věnce');
    });

    it('should display all four benefit items', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByText('Garance čerstvosti květin')).toBeInTheDocument();
      expect(screen.getByText('Spolehlivé doručení na míru')).toBeInTheDocument();
      expect(screen.getByText('Pečlivá ruční práce')).toBeInTheDocument();
      expect(screen.getByText('Možnost personalizace')).toBeInTheDocument();
    });

    it('should display benefit descriptions', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByText(/Květiny objednáváme vždy čerstvé až na základě vaší objednávky/)).toBeInTheDocument();
      expect(screen.getByText(/Produkty doručíme přesně na vámi určené místo/)).toBeInTheDocument();
      expect(screen.getByText(/Dáváme si záležet na uložení každého jednoho květu/)).toBeInTheDocument();
      expect(screen.getByText(/Máte možnost si vybrat tvar, velikost a barevnost/)).toBeInTheDocument();
    });

    it('should have responsive grid layout', async () => {
      render(await Home({ params: mockParams }));

      const benefitsGrid = screen.getByText('Garance čerstvosti květin').closest('.grid');
      expect(benefitsGrid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-4');
    });
  });

  describe('Features Section', () => {
    it('should display all three feature cards', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByText('Ruční výroba')).toBeInTheDocument();
      expect(screen.getByText('Rychlé dodání')).toBeInTheDocument();
      expect(screen.getByText('Osobní přístup')).toBeInTheDocument();
    });

    it('should display feature descriptions', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByText('Každý věnec je pečlivě vytvořen našimi zkušenými floristy s důrazem na detail a kvalitu.')).toBeInTheDocument();
      expect(screen.getByText('Dodání již následující den. Rozumíme naléhavosti a zajistíme včasné doručení.')).toBeInTheDocument();
      expect(screen.getByText('Pomůžeme vám vybrat nebo přizpůsobit věnec podle vašich představ a požadavků.')).toBeInTheDocument();
    });

    it('should display feature icons', async () => {
      render(await Home({ params: mockParams }));

      expect(screen.getByText('🌹')).toBeInTheDocument();
      expect(screen.getByText('🚚')).toBeInTheDocument();
      expect(screen.getByText('💝')).toBeInTheDocument();
    });
  });

  describe('SEO and Structured Data', () => {
    it('should include structured data scripts', async () => {
      const { container } = render(await Home({ params: mockParams }));

      const scripts = container.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(4); // Organization, Website, LocalBusiness, FAQ
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for mobile and desktop', async () => {
      render(await Home({ params: mockParams }));

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('text-5xl', 'md:text-6xl');

      const subtitle = screen.getByText('Pohřební věnce vytvořené s láskou a úctou k vašim blízkým');
      expect(subtitle).toHaveClass('text-xl', 'md:text-2xl');
    });

    it('should have responsive button layout', async () => {
      render(await Home({ params: mockParams }));

      const buttonContainer = screen.getByRole('link', { name: 'Vybrat věnec pro rozloučení' }).parentElement;
      expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });

    it('should have responsive grid for features', async () => {
      render(await Home({ params: mockParams }));

      const featuresGrid = screen.getByText('Ruční výroba').closest('.grid');
      expect(featuresGrid).toHaveClass('md:grid-cols-3');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(await Home({ params: mockParams }));

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();

      const benefitsHeading = screen.getByRole('heading', { level: 2 });
      expect(benefitsHeading).toBeInTheDocument();

      const featureHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(featureHeadings.length).toBeGreaterThanOrEqual(3); // Features + Benefits
    });

    it('should have accessible button styling', async () => {
      render(await Home({ params: mockParams }));

      const primaryButton = screen.getByRole('link', { name: 'Vybrat věnec pro rozloučení' });
      const secondaryButton = screen.getByRole('link', { name: 'Kontaktovat nás' });

      expect(primaryButton).toHaveClass('bg-primary-600', 'hover:bg-primary-700');
      expect(secondaryButton).toHaveClass('border-2', 'border-primary-600');
    });
  });
});
