/**
 * Homepage Conversion Elements Test Suite
 *
 * This test suite validates:
 * - Hero section CTA buttons with new content
 * - Trust-building benefits section
 * - User journey from homepage to conversion points
 *
 * Requirements: 6.1, 6.2, 6.3
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import csMessages from "../../../../messages/cs.json";
import enMessages from "../../../../messages/en.json";
import Home from "../page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/cs",
}));

// Mock next-intl server functions
jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn((namespace) => {
    const messages = csMessages as any;
    const getNestedValue = (obj: any, path: string) => {
      return path.split(".").reduce((current, key) => current?.[key], obj);
    };

    return (key: string, params?: any) => {
      const value = getNestedValue(messages[namespace], key);
      if (params && typeof value === "string") {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => params[paramKey] || match);
      }
      return value || key;
    };
  }),
}));

// Mock structured data components
jest.mock("@/components/seo/StructuredData", () => ({
  StructuredData: ({ data }: { data: any }) => (
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  ),
  generateOrganizationStructuredData: () => ({}),
  generateWebsiteStructuredData: () => ({}),
  generateLocalBusinessStructuredData: () => ({}),
  generateFAQStructuredData: () => ({}),
}));

// Mock metadata generation
jest.mock("@/components/seo/PageMetadata", () => ({
  generateHomepageMetadata: () => ({
    title: "Test Title",
    description: "Test Description",
  }),
}));

// Test wrapper component
const TestWrapper = ({
  children,
  locale = "cs",
}: {
  children: React.ReactNode;
  locale?: string;
}) => {
  const messages = locale === "cs" ? csMessages : enMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};

describe("Homepage Conversion Elements", () => {
  const mockParams = Promise.resolve({ locale: "cs" });

  describe("Hero Section CTA Buttons", () => {
    test("should display primary CTA with empathetic messaging (Czech)", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check for primary CTA button with new empathetic text
      const primaryCTA = screen.getByRole("link", { name: /vybrat věnec pro rozloučení/i });
      expect(primaryCTA).toBeInTheDocument();
      expect(primaryCTA).toHaveAttribute("href", "/cs/products");
      expect(primaryCTA).toHaveClass("bg-primary-600", "hover:bg-primary-700", "text-white");
    });

    test("should display secondary CTA for contact", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check for secondary CTA button
      const secondaryCTA = screen.getByRole("link", { name: /kontaktovat nás/i });
      expect(secondaryCTA).toBeInTheDocument();
      expect(secondaryCTA).toHaveAttribute("href", "/cs/contact");
      expect(secondaryCTA).toHaveClass("border-2", "border-primary-600", "text-primary-700");
    });

    test("should display hero title with dignified messaging", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check hero title
      const heroTitle = screen.getByRole("heading", { level: 1 });
      expect(heroTitle).toHaveTextContent("Důstojné rozloučení s krásou květin");
      expect(heroTitle).toHaveClass(
        "text-elegant",
        "text-5xl",
        "md:text-6xl",
        "font-semibold",
        "text-primary-800"
      );
    });

    test("should display empathetic subtitle", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check subtitle
      const subtitle = screen.getByText(
        "Pohřební věnce vytvořené s láskou a úctou k vašim blízkým"
      );
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveClass("text-xl", "md:text-2xl", "text-neutral-700");
    });

    test("should display compassionate description", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check description
      const description = screen.getByText(/v těžkých chvílích rozloučení vám pomůžeme/i);
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-lg", "text-neutral-600");
    });
  });

  describe("Trust-Building Benefits Section", () => {
    test("should display benefits section title", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      const benefitsTitle = screen.getByRole("heading", {
        level: 2,
        name: /proč si vybrat naše pohřební věnce/i,
      });
      expect(benefitsTitle).toBeInTheDocument();
      expect(benefitsTitle).toHaveClass(
        "text-elegant",
        "text-3xl",
        "md:text-4xl",
        "font-semibold",
        "text-primary-800"
      );
    });

    test("should display all four trust-building benefits", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check all four benefits
      expect(screen.getByText("Garance čerstvosti květin")).toBeInTheDocument();
      expect(screen.getByText("Spolehlivé doručení na míru")).toBeInTheDocument();
      expect(screen.getByText("Pečlivá ruční práce")).toBeInTheDocument();
      expect(screen.getByText("Možnost personalizace")).toBeInTheDocument();
    });

    test("should display benefit descriptions with trust-building language", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check specific trust-building descriptions
      expect(
        screen.getByText(/květiny objednáváme vždy čerstvé až na základě vaší objednávky/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/rozumíme naléhavosti a zajistíme včasné dodání bez stresu/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/každý věnec je jedinečné dílo vytvořené s láskou a úctou/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/pomůžeme vám vytvořit osobní a významné rozloučení/i)
      ).toBeInTheDocument();
    });

    test("should display benefits in proper grid layout", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check grid container
      const benefitsGrid = screen.getByText("Garance čerstvosti květin").closest(".grid");
      expect(benefitsGrid).toHaveClass("grid", "md:grid-cols-2", "lg:grid-cols-4", "gap-8");
    });
  });

  describe("Philosophy Section Trust Elements", () => {
    test("should display philosophical quote with elegant styling", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      const quote = screen.getByText(
        "Život je křehký jako motýlí prach, ale krása a láska zůstávají navždy"
      );
      expect(quote).toBeInTheDocument();
      expect(quote).toHaveClass(
        "text-2xl",
        "md:text-3xl",
        "text-primary-700",
        "font-elegant",
        "italic"
      );
    });

    test("should display philosophical explanation", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      const philosophyText = screen.getByText(
        /uvědomujeme si, že život je křehký jako motýlí prach/i
      );
      expect(philosophyText).toBeInTheDocument();
      expect(philosophyText).toHaveClass("text-lg", "text-neutral-600", "leading-relaxed");
    });
  });

  describe("Features Section Value Propositions", () => {
    test("should display handcrafted feature with icon", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      expect(screen.getByText("Ruční výroba")).toBeInTheDocument();
      expect(screen.getByText("🌹")).toBeInTheDocument();
      expect(
        screen.getByText(/každý věnec je pečlivě vytvořen našimi zkušenými floristy/i)
      ).toBeInTheDocument();
    });

    test("should display fast delivery feature with icon", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      expect(screen.getByText("Rychlé dodání")).toBeInTheDocument();
      expect(screen.getByText("🚚")).toBeInTheDocument();
      expect(screen.getByText(/dodání již následující den/i)).toBeInTheDocument();
    });

    test("should display personal approach feature with icon", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      expect(screen.getByText("Osobní přístup")).toBeInTheDocument();
      expect(screen.getByText("💝")).toBeInTheDocument();
      expect(screen.getByText(/pomůžeme vám vybrat nebo přizpůsobit věnec/i)).toBeInTheDocument();
    });
  });

  describe("User Journey Validation", () => {
    test("should provide clear navigation path from hero to products", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      const productLink = screen.getByRole("link", { name: /vybrat věnec pro rozloučení/i });
      expect(productLink).toHaveAttribute("href", "/cs/products");
    });

    test("should provide alternative path to contact", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      const contactLink = screen.getByRole("link", { name: /kontaktovat nás/i });
      expect(contactLink).toHaveAttribute("href", "/cs/contact");
    });

    test("should have proper responsive design classes", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check responsive container
      const container = screen.getByRole("heading", { level: 1 }).closest(".container");
      expect(container).toHaveClass("container", "mx-auto", "px-4", "py-16");

      // Check responsive CTA layout
      const ctaContainer = screen
        .getByRole("link", { name: /vybrat věnec pro rozloučení/i })
        .closest(".flex");
      expect(ctaContainer).toHaveClass(
        "flex",
        "flex-col",
        "sm:flex-row",
        "gap-6",
        "justify-center"
      );
    });

    test("should maintain accessibility standards", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check heading hierarchy
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2 = screen.getByRole("heading", { level: 2 });
      expect(h2).toBeInTheDocument();

      // Check link accessibility
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
  });

  describe("English Language Conversion Elements", () => {
    test("should display English CTA buttons correctly", async () => {
      const mockEnParams = Promise.resolve({ locale: "en" });

      // Mock English translations
      jest.mocked(require("next-intl/server").getTranslations).mockImplementation((namespace) => {
        const messages = enMessages as any;
        const getNestedValue = (obj: any, path: string) => {
          return path.split(".").reduce((current, key) => current?.[key], obj);
        };

        return (key: string, params?: any) => {
          const value = getNestedValue(messages[namespace], key);
          if (params && typeof value === "string") {
            return value.replace(/\{(\w+)\}/g, (match, paramKey) => params[paramKey] || match);
          }
          return value || key;
        };
      });

      const HomeComponent = await Home({ params: mockEnParams });

      render(<TestWrapper locale="en">{HomeComponent}</TestWrapper>);

      // Check English CTA text
      const primaryCTA = screen.getByRole("link", { name: /choose a wreath for farewell/i });
      expect(primaryCTA).toBeInTheDocument();
      expect(primaryCTA).toHaveAttribute("href", "/en/products");

      const secondaryCTA = screen.getByRole("link", { name: /contact us/i });
      expect(secondaryCTA).toBeInTheDocument();
      expect(secondaryCTA).toHaveAttribute("href", "/en/contact");
    });

    test("should display English hero content with same emotional tone", async () => {
      const mockEnParams = Promise.resolve({ locale: "en" });
      const HomeComponent = await Home({ params: mockEnParams });

      render(<TestWrapper locale="en">{HomeComponent}</TestWrapper>);

      // Check English hero title maintains dignity
      const heroTitle = screen.getByRole("heading", { level: 1 });
      expect(heroTitle).toHaveTextContent("A Dignified Farewell with the Beauty of Flowers");
    });
  });

  describe("Conversion Optimization Metrics", () => {
    test("should have proper button styling for conversion", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      const primaryCTA = screen.getByRole("link", { name: /vybrat věnec pro rozloučení/i });

      // Check conversion-optimized styling
      expect(primaryCTA).toHaveClass(
        "bg-primary-600",
        "hover:bg-primary-700",
        "text-white",
        "px-8",
        "py-4",
        "rounded-lg",
        "font-medium",
        "text-lg",
        "transition-colors",
        "shadow-elegant"
      );
    });

    test("should have clear visual hierarchy for scanning", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check text size hierarchy
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveClass("text-5xl", "md:text-6xl");

      const subtitle = screen.getByText(/pohřební věnce vytvořené s láskou/i);
      expect(subtitle).toHaveClass("text-xl", "md:text-2xl");

      const description = screen.getByText(/v těžkých chvílích rozloučení/i);
      expect(description).toHaveClass("text-lg");
    });

    test("should provide sufficient contrast for readability", async () => {
      const HomeComponent = await Home({ params: mockParams });

      render(<TestWrapper locale="cs">{HomeComponent}</TestWrapper>);

      // Check color classes for proper contrast
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveClass("text-primary-800"); // Dark text on light background

      const subtitle = screen.getByText(/pohřební věnce vytvořené s láskou/i);
      expect(subtitle).toHaveClass("text-neutral-700"); // Good contrast

      const description = screen.getByText(/v těžkých chvílích rozloučení/i);
      expect(description).toHaveClass("text-neutral-600"); // Readable contrast
    });
  });
});
