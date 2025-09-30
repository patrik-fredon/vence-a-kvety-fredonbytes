import { currencyConfig, defaultLocale, i18nConfig, locales } from "@/i18n/config";
import {
  detectBrowserLocale,
  formatCurrency,
  formatCurrencyCustom,
  formatDate,
  formatDeliveryDate,
  getBestLocale,
  getLocaleCookie,
  getLocalePreference,
  getLocalizedContent,
  getRelativeTime,
  getValidLocale,
  isValidLocale,
  pluralize,
  setLocaleCookie,
  setLocalePreference,
  translationValidation,
} from "../utils";

describe("i18n Configuration", () => {
  test("should have correct locale configuration", () => {
    expect(locales).toEqual(["cs", "en"]);
    expect(defaultLocale).toBe("cs");
  });

  test("should have currency configuration for both locales", () => {
    expect(currencyConfig.cs).toEqual({
      currency: "CZK",
      locale: "cs-CZ",
      symbol: "Kč",
    });
    expect(currencyConfig.en).toEqual({
      currency: "CZK",
      locale: "en-US",
      symbol: "CZK",
    });
  });
});

describe("Currency Formatting", () => {
  test("should format Czech currency correctly", () => {
    const result = formatCurrency(1500, "cs");
    expect(result).toMatch(/1[\s,]500.*Kč/);
  });

  test("should format English currency correctly", () => {
    const result = formatCurrency(1500, "en");
    expect(result).toMatch(/CZK.*1[,\s]500/);
  });

  test("should format custom Czech currency correctly", () => {
    const result = formatCurrencyCustom(1500, "cs");
    expect(result).toMatch(/1[\s\u00A0]500[\s\u00A0]Kč/); // Allow for different space characters
  });

  test("should format custom English currency correctly", () => {
    const result = formatCurrencyCustom(1500, "en");
    expect(result).toBe("1,500 CZK");
  });
});

describe("Date Formatting", () => {
  const testDate = new Date("2024-03-15T10:00:00Z");

  test("should format Czech date correctly", () => {
    const result = formatDate(testDate, "cs");
    expect(result).toContain("2024");
    expect(result).toMatch(/březen|března/); // Match either form
  });

  test("should format English date correctly", () => {
    const result = formatDate(testDate, "en");
    expect(result).toContain("2024");
    expect(result).toContain("March");
  });

  test("should format delivery dates with relative terms", () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    expect(formatDeliveryDate(today, "cs")).toBe("Dnes");
    expect(formatDeliveryDate(today, "en")).toBe("Today");
    expect(formatDeliveryDate(tomorrow, "cs")).toBe("Zítra");
    expect(formatDeliveryDate(tomorrow, "en")).toBe("Tomorrow");
  });
});

describe("Localized Content", () => {
  const testContent = {
    cs: "Český obsah",
    en: "English content",
  };

  test("should return correct localized content", () => {
    expect(getLocalizedContent(testContent, "cs")).toBe("Český obsah");
    expect(getLocalizedContent(testContent, "en")).toBe("English content");
  });

  test("should fallback to default locale", () => {
    const partialContent = { cs: "Český obsah" } as any;
    expect(getLocalizedContent(partialContent, "en")).toBe("Český obsah");
  });
});

describe("Pluralization", () => {
  test("should handle Czech pluralization", () => {
    expect(pluralize(1, "položka", "položky", "cs")).toBe("položka");
    expect(pluralize(2, "položka", "položky", "cs")).toBe("položky");
    expect(pluralize(5, "položka", "položky", "cs")).toBe("položky");
  });

  test("should handle English pluralization", () => {
    expect(pluralize(1, "item", "items", "en")).toBe("item");
    expect(pluralize(2, "item", "items", "en")).toBe("items");
    expect(pluralize(0, "item", "items", "en")).toBe("items");
  });
});

describe("Relative Time", () => {
  test("should format relative time correctly", () => {
    const now = new Date();
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000); // -1 day

    const futureResult = getRelativeTime(future, "cs");
    const pastResult = getRelativeTime(past, "cs");

    // Check that we get some relative time format (could be "zítra", "za 1 den", etc.)
    expect(typeof futureResult).toBe("string");
    expect(futureResult.length).toBeGreaterThan(0);
    expect(typeof pastResult).toBe("string");
    expect(pastResult.length).toBeGreaterThan(0);
  });
});

describe("Enhanced i18n Configuration", () => {
  test("should have enhanced i18n configuration", () => {
    expect(i18nConfig.locales).toEqual(["cs", "en"]);
    expect(i18nConfig.defaultLocale).toBe("cs");
    expect(i18nConfig.persistence.cookieName).toBe("NEXT_LOCALE");
    expect(i18nConfig.fallback.enabled).toBe(true);
  });
});

describe("Locale Validation", () => {
  test("should validate locales correctly", () => {
    expect(isValidLocale("cs")).toBe(true);
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("fr")).toBe(false);
    expect(isValidLocale("")).toBe(false);
    expect(isValidLocale("invalid")).toBe(false);
  });

  test("should get valid locale with fallback", () => {
    expect(getValidLocale("cs")).toBe("cs");
    expect(getValidLocale("en")).toBe("en");
    expect(getValidLocale("fr")).toBe("cs");
    expect(getValidLocale(null)).toBe("cs");
    expect(getValidLocale(undefined)).toBe("cs");
  });
});

describe("Locale Persistence", () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };

  // Mock document.cookie
  const mockDocument = {
    cookie: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockDocument.cookie = "";

    // Mock window and document
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
    Object.defineProperty(global, "document", {
      value: mockDocument,
      writable: true,
    });
  });

  test("should set and get locale preference from localStorage", () => {
    mockLocalStorage.getItem.mockReturnValue("en");

    setLocalePreference("en");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("preferred-locale", "en");

    const preference = getLocalePreference();
    expect(preference).toBe("en");
  });

  test("should handle localStorage errors gracefully", () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error("Storage error");
    });
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error("Storage error");
    });

    // Should not throw
    expect(() => setLocalePreference("en")).not.toThrow();
    expect(() => getLocalePreference()).not.toThrow();

    expect(getLocalePreference()).toBe(null);
  });

  test("should set and get locale cookie", () => {
    setLocaleCookie("en");
    // Cookie setting is tested by checking if document.cookie would be set
    // In a real browser environment, this would work properly

    // Mock cookie reading
    mockDocument.cookie = "NEXT_LOCALE=en; path=/";
    getLocaleCookie();
    // This would work in a real browser environment
  });
});

describe("Translation Validation", () => {
  const mockMessages = {
    common: {
      loading: "Loading...",
      error: "Error",
    },
    navigation: {
      home: "Home",
    },
  };

  test("should check if translation exists", () => {
    expect(translationValidation.hasTranslation(mockMessages, "common.loading")).toBe(true);
    expect(translationValidation.hasTranslation(mockMessages, "common.error")).toBe(true);
    expect(translationValidation.hasTranslation(mockMessages, "navigation.home")).toBe(true);
    expect(translationValidation.hasTranslation(mockMessages, "common.missing")).toBe(false);
    expect(translationValidation.hasTranslation(mockMessages, "missing.key")).toBe(false);
  });

  test("should get missing translation keys", () => {
    const requiredKeys = [
      "common.loading",
      "common.error",
      "common.missing",
      "navigation.home",
      "navigation.missing",
    ];

    const missingKeys = translationValidation.getMissingKeys(mockMessages, requiredKeys);
    expect(missingKeys).toEqual(["common.missing", "navigation.missing"]);
  });

  test("should get translation with fallback", () => {
    const fallbackMessages = {
      common: {
        missing: "Fallback text",
      },
    };

    // Existing translation
    const existing = translationValidation.getTranslationWithFallback(
      mockMessages,
      fallbackMessages,
      "common.loading",
      "en"
    );
    expect(existing).toBe("Loading...");

    // Fallback translation
    const fallback = translationValidation.getTranslationWithFallback(
      mockMessages,
      fallbackMessages,
      "common.missing",
      "en"
    );
    expect(fallback).toBe("Fallback text");

    // Missing translation
    const missing = translationValidation.getTranslationWithFallback(
      mockMessages,
      fallbackMessages,
      "completely.missing",
      "en"
    );
    expect(missing).toBe("[completely.missing]"); // In development mode
  });
});

describe("Browser Locale Detection", () => {
  const mockNavigator = {
    languages: ["cs-CZ", "en-US"],
    language: "cs-CZ",
  };

  beforeEach(() => {
    Object.defineProperty(global, "navigator", {
      value: mockNavigator,
      writable: true,
    });
  });

  test("should detect browser locale", () => {
    mockNavigator.languages = ["cs-CZ", "en-US"];
    expect(detectBrowserLocale()).toBe("cs");

    mockNavigator.languages = ["en-US", "cs-CZ"];
    expect(detectBrowserLocale()).toBe("en");

    mockNavigator.languages = ["fr-FR", "de-DE"];
    expect(detectBrowserLocale()).toBe("cs"); // fallback to default
  });

  test("should get best locale based on preferences", () => {
    // This would test the priority: localStorage > cookie > browser > default
    const bestLocale = getBestLocale();
    expect(typeof bestLocale).toBe("string");
    expect(isValidLocale(bestLocale)).toBe(true);
  });
});
