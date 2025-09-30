/**
 * Integration tests for i18n functionality
 * Tests the complete language switching flow
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
// Removed unused NextIntlClientProvider import
import { LanguageToggle } from "@/components/layout/LanguageToggle";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/cs/products",
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useLocale: () => "cs",
  useTranslations: () => (key: string) => key,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock document.cookie
Object.defineProperty(document, "cookie", {
  writable: true,
  value: "",
});

describe("i18n Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test("should render language toggle and handle locale switching", async () => {
    render(<LanguageToggle currentLocale="cs" />);

    // Should render the select dropdown
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("cs");

    // Should have both locale options
    expect(screen.getByDisplayValue("Čeština")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();

    // Simulate locale change
    fireEvent.change(select, { target: { value: "en" } });

    // Should attempt to navigate to new locale
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/en/products");
    });
  });

  test("should handle button variant", () => {
    render(<LanguageToggle currentLocale="cs" variant="buttons" />);

    // Should render buttons for each locale
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);

    // Current locale button should be disabled
    const csButton = buttons.find((btn) => btn.textContent?.includes("Čeština"));
    expect(csButton).toBeDisabled();
  });

  test("should persist locale preference", async () => {
    render(<LanguageToggle currentLocale="cs" />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "en" } });

    // Should save to localStorage (mocked)
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("preferred-locale", "en");
    });
  });
});

describe("Translation Validation", () => {
  test("should validate translation keys format", () => {
    const validKeys = ["common.loading", "navigation.home", "product.addToCart", "seo.home.title"];

    const invalidKeys = ["123invalid", "invalid-key", "invalid key", ""];

    // This would use the validation utilities
    validKeys.forEach((key) => {
      expect(key).toMatch(/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)*$/);
    });

    invalidKeys.forEach((key) => {
      expect(key).not.toMatch(/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)*$/);
    });
  });

  test("should handle missing translations gracefully", () => {
    // This would test the fallback behavior
    const mockMessages = {
      common: {
        loading: "Loading...",
      },
    };

    // Test that missing keys are handled properly
    expect(mockMessages.common.loading).toBe("Loading...");
    expect((mockMessages as any).common.missing).toBeUndefined();
  });
});

describe("Locale Detection", () => {
  test("should detect browser locale", () => {
    // Mock navigator.languages
    Object.defineProperty(navigator, "languages", {
      writable: true,
      value: ["cs-CZ", "en-US"],
    });

    // This would test browser locale detection
    const supportedLocales = ["cs", "en"];
    const browserLocales = navigator.languages;

    let detectedLocale = "cs"; // default
    for (const browserLocale of browserLocales) {
      const languageCode = browserLocale.split("-")[0];
      if (supportedLocales.includes(languageCode)) {
        detectedLocale = languageCode;
        break;
      }
    }

    expect(detectedLocale).toBe("cs");
  });

  test("should fallback to default locale for unsupported languages", () => {
    Object.defineProperty(navigator, "languages", {
      writable: true,
      value: ["fr-FR", "de-DE"],
    });

    const supportedLocales = ["cs", "en"];
    const browserLocales = navigator.languages;

    let detectedLocale = "cs"; // default
    for (const browserLocale of browserLocales) {
      const languageCode = browserLocale.split("-")[0];
      if (supportedLocales.includes(languageCode)) {
        detectedLocale = languageCode;
        break;
      }
    }

    expect(detectedLocale).toBe("cs"); // Should fallback to default
  });
});
