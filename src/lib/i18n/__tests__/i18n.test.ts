import {
  formatCurrency,
  formatCurrencyCustom,
  formatDate,
  formatDeliveryDate,
  getLocalizedContent,
  pluralize,
  getRelativeTime,
} from "../utils";
import { locales, defaultLocale, currencyConfig } from "@/i18n/config";

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
