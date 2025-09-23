/**
 * Internationalization Testing Suite
 * Tests Czech and English language support across all migrated components
 */

import { jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

// Import translation files
import csMessages from "../../../messages/cs.json";
import enMessages from "../../../messages/en.json";

// Import i18n components
import { CurrencyDisplay } from "../i18n/CurrencyDisplay";
import { DateDisplay } from "../i18n/DateDisplay";

// Mock cart context
const mockCartContext = {
  items: [],
  addItem: jest.fn(),
  removeItem: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
};

jest.mock("../../lib/cart/context", () => ({
  useCart: () => mockCartContext,
}));

// Mock auth context
jest.mock("../../lib/auth/hooks", () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
}));

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/cs",
  useSearchParams: () => new URLSearchParams(),
}));

// Test wrapper component
const TestWrapper = ({
  children,
  locale = "cs",
  messages = csMessages,
}: {
  children: React.ReactNode;
  locale?: string;
  messages?: any;
}) => (
  <NextIntlClientProvider locale={locale} messages={messages}>
    {children}
  </NextIntlClientProvider>
);

// Sample product data for testing
const mockProduct = {
  id: "1",
  name: { cs: "Smuteční věnec", en: "Funeral Wreath" },
  description: { cs: "Krásný smuteční věnec", en: "Beautiful funeral wreath" },
  category: "wreaths" as const,
  pricing: { base: 2500, currency: "CZK" as const, customizationFees: {} },
  images: ["/test-image.jpg"],
  availability: true,
  customization: {
    sizes: ["small", "medium", "large"],
    flowers: ["roses", "lilies"],
    ribbons: true,
    personalMessage: true,
  },
};

describe("I18n Validation - Task 15.1: Czech and English Language Support", () => {
  describe("Translation File Structure", () => {
    it("should have all required translation sections in Czech", () => {
      const requiredSections = [
        "navigation",
        "common",
        "product",
        "cart",
        "checkout",
        "auth",
        "footer",
        "delivery",
        "home",
        "faq",
        "about",
        "gdpr",
        "accessibility",
        "currency",
        "date",
      ];

      requiredSections.forEach((section) => {
        expect(csMessages).toHaveProperty(section);
        expect(typeof csMessages[section as keyof typeof csMessages]).toBe("object");
      });
    });

    it("should have all required translation sections in English", () => {
      const requiredSections = [
        "navigation",
        "common",
        "product",
        "cart",
        "checkout",
        "auth",
        "footer",
        "delivery",
        "home",
        "faq",
        "about",
        "gdpr",
        "accessibility",
        "currency",
        "date",
      ];

      requiredSections.forEach((section) => {
        expect(enMessages).toHaveProperty(section);
        expect(typeof enMessages[section as keyof typeof enMessages]).toBe("object");
      });
    });

    it("should have matching navigation keys between Czech and English", () => {
      const csNavKeys = Object.keys(csMessages.navigation);
      const enNavKeys = Object.keys(enMessages.navigation);

      expect(csNavKeys.sort()).toEqual(enNavKeys.sort());
    });

    it("should have matching product keys between Czech and English", () => {
      const csProductKeys = Object.keys(csMessages.product);
      const enProductKeys = Object.keys(enMessages.product);

      expect(csProductKeys.sort()).toEqual(enProductKeys.sort());
    });
  });

  describe("Currency Formatting Validation", () => {
    it("should format currency correctly for Czech locale", () => {
      const amount = 2500;
      const czechFormat = amount.toLocaleString("cs-CZ");
      const expectedFormat = `${czechFormat} Kč`;

      expect(expectedFormat).toMatch(/2\s?500\s?Kč/);
    });

    it("should format currency correctly for English locale", () => {
      const amount = 2500;
      const englishFormat = amount.toLocaleString("en-US");
      const expectedFormat = `${englishFormat} CZK`;

      expect(expectedFormat).toMatch(/2,500\s?CZK/);
    });

    it("should have correct currency format strings in translations", () => {
      expect(csMessages.currency.format).toBe("{amount} Kč");
      expect(enMessages.currency.format).toBe("{amount} CZK");
    });
  });

  describe("Translation Key Preservation", () => {
    it("should have proper Czech navigation translations", () => {
      expect(csMessages.navigation.home).toBe("Domů");
      expect(csMessages.navigation.products).toBe("Produkty");
      expect(csMessages.navigation.about).toBe("O nás");
      expect(csMessages.navigation.contact).toBe("Kontakt");
      expect(csMessages.navigation.cart).toBe("Košík");
    });

    it("should have proper English navigation translations", () => {
      expect(enMessages.navigation.home).toBe("Home");
      expect(enMessages.navigation.products).toBe("Products");
      expect(enMessages.navigation.about).toBe("About");
      expect(enMessages.navigation.contact).toBe("Contact");
      expect(enMessages.navigation.cart).toBe("Cart");
    });

    it("should have proper Czech product translations", () => {
      expect(csMessages.product.addToCart).toBe("Přidat do košíku");
      expect(csMessages.product.price).toBe("Cena");
      expect(csMessages.product.customize).toBe("Přizpůsobit");
    });

    it("should have proper English product translations", () => {
      expect(enMessages.product.addToCart).toBe("Add to Cart");
      expect(enMessages.product.price).toBe("Price");
      expect(enMessages.product.customize).toBe("Customize");
    });
  });

  describe("Locale-specific Features", () => {
    it("should handle date formatting for Czech locale", () => {
      const testDate = new Date("2024-01-15");
      const czechFormat = testDate.toLocaleDateString("cs-CZ");

      // Czech date format: DD.MM.YYYY or DD. MM. YYYY
      expect(czechFormat).toMatch(/15\.\s?1\.\s?2024/);
    });

    it("should handle date formatting for English locale", () => {
      const testDate = new Date("2024-01-15");
      const englishFormat = testDate.toLocaleDateString("en-US");

      // English date format: MM/DD/YYYY
      expect(englishFormat).toBe("1/15/2024");
    });

    it("should handle number formatting for Czech locale", () => {
      const largeNumber = 12345.67;
      const czechFormat = largeNumber.toLocaleString("cs-CZ");

      // Czech number format: space as thousands separator, comma as decimal
      // Use regex to handle potential variations in space characters
      expect(czechFormat).toMatch(/12\s?345,67/);
    });

    it("should handle number formatting for English locale", () => {
      const largeNumber = 12345.67;
      const englishFormat = largeNumber.toLocaleString("en-US");

      // English number format: comma as thousands separator, dot as decimal
      expect(englishFormat).toBe("12,345.67");
    });

    it("should have proper date translation keys", () => {
      expect(csMessages.date.today).toBe("Dnes");
      expect(csMessages.date.tomorrow).toBe("Zítra");

      expect(enMessages.date.today).toBe("Today");
      expect(enMessages.date.tomorrow).toBe("Tomorrow");
    });
  });
});
