/**
 * About page tests
 * Tests for About page content integration, layout, and SEO
 */

import { render, screen } from "@testing-library/react";
import AboutPage from "../page";

// Mock next-intl server functions
jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      title: "O naší květinové dílničce",
      mission:
        "Pomáháme rodinám vyjádřit lásku a úctu k jejich blízkým prostřednictvím krásných květinových aranžmá v nejtěžších chvílích života.",
      story:
        "Jsme malá rodinná květinová dílnička s dlouholetými zkušenostmi, která svou práci dělá s citem a důrazem na každý detail. Květinám se věnujeme řadu let a věříme, že sféra smutečních květin si zaslouží více pozornosti a krásy. Do každé vaší objednávky dáváme kousek svého srdce a profesionální přístup, aby tato smutná událost ve vašich životech byla alespoň trochu příjemnější.",
      values:
        "Každý květ vybíráme s odbornou pečlivostí a kvalitou, aby výsledek naší práce splňoval všechna vaša očekávání. Květiny kupujeme vždy čerstvé, pečlivě je čistíme a ošetřujeme s profesionální péčí, aby památku vašeho milovaného uctívaly na pietním místě co nejdéle.",
      commitment:
        "Naším závazkem je poskytovat nejen krásné květinové aranžmá, ale také porozumění, empatie a podporu v těžkých chvílích. Věříme, že kvalitní ruční práce a osobní přístup mohou přinést útěchu a důstojnost do procesu rozloučení.",
    };
    return translations[key] || key;
  }),
}));

// Mock SEO components
jest.mock("@/components/seo/StructuredData", () => ({
  StructuredData: ({ data }: { data: any }) => (
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  ),
  generateOrganizationStructuredData: jest.fn(() => ({ "@type": "Organization" })),
  generateLocalBusinessStructuredData: jest.fn(() => ({ "@type": "LocalBusiness" })),
}));

jest.mock("@/components/seo/PageMetadata", () => ({
  generateAboutPageMetadata: jest.fn(() => ({
    title: "About Test Title",
    description: "About Test Description",
  })),
}));

describe("About Page", () => {
  const mockParams = Promise.resolve({ locale: "cs" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Page Structure", () => {
    it("should render the main heading", async () => {
      render(await AboutPage({ params: mockParams }));

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "O naší květinové dílničce"
      );
    });

    it("should render the mission statement", async () => {
      render(await AboutPage({ params: mockParams }));

      expect(screen.getByText(/Pomáháme rodinám vyjádřit lásku a úctu/)).toBeInTheDocument();
    });

    it("should have proper page layout structure", async () => {
      const { container } = render(await AboutPage({ params: mockParams }));

      const mainContainer = container.querySelector(".container.mx-auto.px-4.py-16");
      expect(mainContainer).toBeInTheDocument();

      const contentContainer = container.querySelector(".max-w-4xl.mx-auto");
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe("Content Sections", () => {
    it("should display company story section", async () => {
      render(await AboutPage({ params: mockParams }));

      expect(screen.getByText("Naše příběh")).toBeInTheDocument();
      expect(
        screen.getByText(/Jsme malá rodinná květinová dílnička s dlouholetými zkušenostmi/)
      ).toBeInTheDocument();
    });

    it("should display quality and values section", async () => {
      render(await AboutPage({ params: mockParams }));

      expect(screen.getByText("Kvalita a péče")).toBeInTheDocument();
      expect(screen.getByText(/Každý květ vybíráme s odbornou pečlivostí/)).toBeInTheDocument();
    });

    it("should display commitment section", async () => {
      render(await AboutPage({ params: mockParams }));

      expect(screen.getByText("Náš závazek")).toBeInTheDocument();
      expect(
        screen.getByText(/Naším závazkem je poskytovat nejen krásné květinové aranžmá/)
      ).toBeInTheDocument();
    });

    it("should display company information section", async () => {
      render(await AboutPage({ params: mockParams }));

      expect(screen.getByText("Ketingmar s.r.o.")).toBeInTheDocument();
      expect(
        screen.getByText("Rodinná květinová dílnička s tradicí a důrazem na kvalitu")
      ).toBeInTheDocument();
    });

    it("should display call-to-action buttons", async () => {
      render(await AboutPage({ params: mockParams }));

      expect(screen.getByRole("link", { name: "Prohlédnout naše věnce" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Kontaktovat nás" })).toBeInTheDocument();
    });

    it("should have correct button links", async () => {
      render(await AboutPage({ params: mockParams }));

      const productsLink = screen.getByRole("link", { name: "Prohlédnout naše věnce" });
      const contactLink = screen.getByRole("link", { name: "Kontaktovat nás" });

      expect(productsLink).toHaveAttribute("href", "/cs/products");
      expect(contactLink).toHaveAttribute("href", "/cs/contact");
    });
  });

  describe("Content Integration", () => {
    it("should use translations from i18n system", async () => {
      const { getTranslations } = require("next-intl/server");

      render(await AboutPage({ params: mockParams }));

      expect(getTranslations).toHaveBeenCalledWith("about");
    });

    it("should display all content from about section", async () => {
      render(await AboutPage({ params: mockParams }));

      // Check that all about content is rendered
      expect(screen.getByText("O naší květinové dílničce")).toBeInTheDocument();
      expect(screen.getByText(/Pomáháme rodinám vyjádřit lásku a úctu/)).toBeInTheDocument();
      expect(screen.getByText(/Jsme malá rodinná květinová dílnička/)).toBeInTheDocument();
      expect(screen.getByText(/Každý květ vybíráme s odbornou pečlivostí/)).toBeInTheDocument();
      expect(
        screen.getByText(/Naším závazkem je poskytovat nejen krásné květinové aranžmá/)
      ).toBeInTheDocument();
    });
  });

  describe("SEO and Structured Data", () => {
    it("should include structured data scripts", async () => {
      const { container } = render(await AboutPage({ params: mockParams }));

      const scripts = container.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts.length).toBeGreaterThanOrEqual(2);
    });

    it("should include organization structured data", async () => {
      const { generateOrganizationStructuredData } = require("@/components/seo/StructuredData");

      render(await AboutPage({ params: mockParams }));

      expect(generateOrganizationStructuredData).toHaveBeenCalledWith("cs");
    });

    it("should include local business structured data", async () => {
      const { generateLocalBusinessStructuredData } = require("@/components/seo/StructuredData");

      render(await AboutPage({ params: mockParams }));

      expect(generateLocalBusinessStructuredData).toHaveBeenCalledWith("cs");
    });

    it("should generate page metadata", async () => {
      const { generateAboutPageMetadata } = require("@/components/seo/PageMetadata");
      const AboutPageModule = require("../page");

      await AboutPageModule.generateMetadata({ params: mockParams });

      expect(generateAboutPageMetadata).toHaveBeenCalledWith("cs");
    });
  });

  describe("Responsive Design", () => {
    it("should have rensive heading classes", async () => {
      render(await AboutPage({ params: mockParams }));

      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toHaveClass("text-4xl", "md:text-5xl");

      const sectionHeadings = screen.getAllByRole("heading", { level: 2 });
      sectionHeadings.forEach((heading) => {
        expect(heading).toHaveClass("text-2xl", "md:text-3xl");
      });
    });

    it("should have responsive container classes", async () => {
      const { container } = render(await AboutPage({ params: mockParams }));

      const mainContainer = container.querySelector(".container");
      expect(mainContainer).toHaveClass("mx-auto", "px-4", "py-16");

      const contentContainer = container.querySelector(".max-w-4xl");
      expect(contentContainer).toHaveClass("mx-auto");
    });

    it("should have responsive button layout", async () => {
      render(await AboutPage({ params: mockParams }));

      const buttonContainer = screen.getByRole("link", {
        name: "Prohlédnout naše věnce",
      }).parentElement;
      expect(buttonContainer).toHaveClass("flex", "flex-col", "sm:flex-row");
    });

    it("should have responsive text classes", async () => {
      render(await AboutPage({ params: mockParams }));

      const mission = screen.getByText(/Pomáháme rodinám vyjádřit lásku a úctu/);
      expect(mission).toHaveClass("text-lg", "text-neutral-600", "text-center");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", async () => {
      render(await AboutPage({ params: mockParams }));

      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toBeInTheDocument();

      const sectionHeadings = screen.getAllByRole("heading", { level: 2 });
      expect(sectionHeadings).toHaveLength(4); // Story, Quality, Commitment, Company
    });

    it("should have semantic HTML structure", async () => {
      const { container } = render(await AboutPage({ params: mockParams }));

      // Check for proper container structure
      expect(container.querySelector("div.container")).toBeInTheDocument();
      expect(container.querySelector("h1")).toBeInTheDocument();

      // Check for content sections
      const contentSections = container.querySelectorAll(".bg-white.rounded-xl.shadow-soft");
      expect(contentSections).toHaveLength(3);
    });

    it("should have proper color contrast classes", async () => {
      render(await AboutPage({ params: mockParams }));

      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toHaveClass("text-primary-800");

      const sectionHeadings = screen.getAllByRole("heading", { level: 2 });
      sectionHeadings.forEach((heading) => {
        expect(heading).toHaveClass("text-primary-800");
      });
    });

    it("should have accessible button styling", async () => {
      render(await AboutPage({ params: mockParams }));

      const primaryButton = screen.getByRole("link", { name: "Prohlédnout naše věnce" });
      const secondaryButton = screen.getByRole("link", { name: "Kontaktovat nás" });

      expect(primaryButton).toHaveClass("bg-primary-600", "hover:bg-primary-700");
      expect(secondaryButton).toHaveClass("border-2", "border-primary-600");
    });
  });

  describe("Layout and Styling", () => {
    it("should have proper spacing between sections", async () => {
      const { container } = render(await AboutPage({ params: mockParams }));

      const sectionsContainer = container.querySelector(".space-y-12");
      expect(sectionsContainer).toBeInTheDocument();
    });

    it("should have proper card styling for content sections", async () => {
      const { container } = render(await AboutPage({ params: mockParams }));

      const contentCards = container.querySelectorAll(".bg-white.rounded-xl.shadow-soft.p-8");
      expect(contentCards).toHaveLength(3);
    });

    it("should have highlighted company section", async () => {
      const { container } = render(await AboutPage({ params: mockParams }));

      const companySection = container.querySelector(".bg-primary-50.rounded-xl.p-8.text-center");
      expect(companySection).toBeInTheDocument();
    });

    it("should have proper text styling", async () => {
      render(await AboutPage({ params: mockParams }));

      const storyText = screen.getByText(/Jsme malá rodinná květinová dílnička/);
      expect(storyText).toHaveClass("text-neutral-700", "leading-relaxed", "text-lg");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing translations gracefully", async () => {
      const { getTranslations } = require("next-intl/server");
      getTranslations.mockImplementation(() => (key: string) => key);

      render(await AboutPage({ params: mockParams }));

      // Should still render the page structure
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should handle empty translations", async () => {
      const { getTranslations } = require("next-intl/server");
      getTranslations.mockImplementation(() => () => "");

      render(await AboutPage({ params: mockParams }));

      // Should still render page structure
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
    });
  });
});
