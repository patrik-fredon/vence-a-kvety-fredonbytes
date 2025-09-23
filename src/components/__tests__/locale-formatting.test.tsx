/**
 * Locale-specific Formatting Tests
 * Tests date, number, and currency formatting for Czech and English locales
 */

import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

// Import translation files
import csMessages from "../../../messages/cs.json";
import enMessages from "../../../messages/en.json";

// Import formatting utilities
import { CurrencyDisplay } from "../i18n/CurrencyDisplay";
import { DateDisplay } from "../i18n/DateDisplay";

// Mock contexts
jest.mock("../../lib/cart/context", () => ({
  useCart: () => ({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
  }),
}));

// Test wrapper
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

describe("Locale-specific Formatting Tests - Task 15.1: Currency and Date Formatting", () => {
  describe("Currency Formatting", () => {
    const testAmounts = [
      { amount: 1000, cs: "1 000 Kč", en: "1,000 CZK" },
      { amount: 2500, cs: "2 500 Kč", en: "2,500 CZK" },
      { amount: 12345, cs: "12 345 Kč", en: "12,345 CZK" },
      { amount: 123456, cs: "123 456 Kč", en: "123,456 CZK" },
      { amount: 1234567, cs: "1 234 567 Kč", en: "1,234,567 CZK" },
    ];

    testAmounts.forEach(({ amount, cs, en }) => {
      it(`should format ${amount} correctly for Czech locale`, () => {
        render(
          <TestWrapper locale="cs" messages={csMessages}>
            <CurrencyDisplay amount={amount} />
          </TestWrapper>
        );

        // Czech format: space-separated thousands, Kč suffix
        expect(screen.getByText(cs)).toBeInTheDocument();
      });

      it(`should format ${amount} correctly for English locale`, () => {
        render(
          <TestWrapper locale="en" messages={enMessages}>
            <CurrencyDisplay amount={amount} />
          </TestWrapper>
        );

        // English format: comma-separated thousands, CZK suffix
        expect(screen.getByText(en)).toBeInTheDocument();
      });
    });

    it("should handle decimal amounts correctly for Czech locale", () => {
      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <CurrencyDisplay amount={1234.56} />
        </TestWrapper>
      );

      // Czech decimal format: comma as decimal separator
      expect(screen.getByText("1 234,56 Kč")).toBeInTheDocument();
    });

    it("should handle decimal amounts correctly for English locale", () => {
      render(
        <TestWrapper locale="en" messages={enMessages}>
          <CurrencyDisplay amount={1234.56} />
        </TestWrapper>
      );

      // English decimal format: dot as decimal separator
      expect(screen.getByText("1,234.56 CZK")).toBeInTheDocument();
    });

    it("should handle zero amounts correctly", () => {
      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <CurrencyDisplay amount={0} />
        </TestWrapper>
      );

      expect(screen.getByText("0 Kč")).toBeInTheDocument();
    });

    it("should handle negative amounts correctly for Czech locale", () => {
      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <CurrencyDisplay amount={-1500} />
        </TestWrapper>
      );

      expect(screen.getByText("-1 500 Kč")).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    const testDate = new Date("2024-01-15T10:30:00");

    it("should format dates correctly for Czech locale", () => {
      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <DateDisplay date={testDate} />
        </TestWrapper>
      );

      // Czech date format: DD.MM.YYYY or DD. MM. YYYY
      const dateText = screen.getByTestId("date-display").textContent;
      expect(dateText).toMatch(/15\.\s?1\.\s?2024/);
    });

    it("should format dates correctly for English locale", () => {
      render(
        <TestWrapper locale="en" messages={enMessages}>
          <DateDisplay date={testDate} />
        </TestWrapper>
      );

      // English date format: MM/DD/YYYY
      expect(screen.getByText("1/15/2024")).toBeInTheDocument();
    });

    it("should format dates with time for Czech locale", () => {
      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <DateDisplay date={testDate} includeTime />
        </TestWrapper>
      );

      // Czech datetime format: DD.MM.YYYY HH:mm
      const dateTimeText = screen.getByTestId("date-display").textContent;
      expect(dateTimeText).toMatch(/15\.\s?1\.\s?2024.*10:30/);
    });

    it("should format dates with time for English locale", () => {
      render(
        <TestWrapper locale="en" messages={enMessages}>
          <DateDisplay date={testDate} includeTime />
        </TestWrapper>
      );

      // English datetime format: MM/DD/YYYY, HH:mm AM/PM
      const dateTimeText = screen.getByTestId("date-display").textContent;
      expect(dateTimeText).toMatch(/1\/15\/2024.*10:30/);
    });

    it("should handle relative dates for Czech locale", () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <DateDisplay date={today} relative />
        </TestWrapper>
      );

      expect(screen.getByText("Dnes")).toBeInTheDocument();
    });

    it("should handle relative dates for English locale", () => {
      const today = new Date();

      render(
        <TestWrapper locale="en" messages={enMessages}>
          <DateDisplay date={today} relative />
        </TestWrapper>
      );

      expect(screen.getByText("Today")).toBeInTheDocument();
    });
  });

  describe("Number Formatting", () => {
    const testNumbers = [
      { number: 1000, cs: "1 000", en: "1,000" },
      { number: 12345, cs: "12 345", en: "12,345" },
      { number: 1234567, cs: "1 234 567", en: "1,234,567" },
      { number: 1234.56, cs: "1 234,56", en: "1,234.56" },
      { number: 0.99, cs: "0,99", en: "0.99" },
    ];

    testNumbers.forEach(({ number, cs, en }) => {
      it(`should format number ${number} correctly for Czech locale`, () => {
        const formatted = number.toLocaleString("cs-CZ");
        expect(formatted).toBe(cs);
      });

      it(`should format number ${number} correctly for English locale`, () => {
        const formatted = number.toLocaleString("en-US");
        expect(formatted).toBe(en);
      });
    });
  });

  describe("Percentage Formatting", () => {
    it("should format percentages correctly for Czech locale", () => {
      const percentage = 0.21; // 21% VAT
      const formatted = percentage.toLocaleString("cs-CZ", {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });

      expect(formatted).toBe("21 %");
    });

    it("should format percentages correctly for English locale", () => {
      const percentage = 0.21; // 21% VAT
      const formatted = percentage.toLocaleString("en-US", {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });

      expect(formatted).toBe("21%");
    });
  });

  describe("Time Formatting", () => {
    const testTime = new Date("2024-01-15T14:30:00");

    it("should format time correctly for Czech locale (24-hour)", () => {
      const formatted = testTime.toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
      });

      expect(formatted).toBe("14:30");
    });

    it("should format time correctly for English locale (12-hour)", () => {
      const formatted = testTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      expect(formatted).toBe("02:30 PM");
    });
  });

  describe("Delivery Date Formatting", () => {
    it("should format delivery dates appropriately for Czech customers", () => {
      const deliveryDate = new Date("2024-01-20");

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <div data-testid="delivery-date">
            Doručení: {deliveryDate.toLocaleDateString("cs-CZ")}
          </div>
        </TestWrapper>
      );

      const deliveryText = screen.getByTestId("delivery-date").textContent;
      expect(deliveryText).toMatch(/Doručení: 20\.\s?1\.\s?2024/);
    });

    it("should format delivery dates appropriately for English customers", () => {
      const deliveryDate = new Date("2024-01-20");

      render(
        <TestWrapper locale="en" messages={enMessages}>
          <div data-testid="delivery-date">
            Delivery: {deliveryDate.toLocaleDateString("en-US")}
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId("delivery-date")).toHaveTextContent("Delivery: 1/20/2024");
    });
  });

  describe("Business Hours Formatting", () => {
    it("should format business hours for Czech locale", () => {
      const openTime = new Date("2024-01-15T08:00:00");
      const closeTime = new Date("2024-01-15T18:00:00");

      const openFormatted = openTime.toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const closeFormatted = closeTime.toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
      });

      expect(openFormatted).toBe("08:00");
      expect(closeFormatted).toBe("18:00");
    });

    it("should format business hours for English locale", () => {
      const openTime = new Date("2024-01-15T08:00:00");
      const closeTime = new Date("2024-01-15T18:00:00");

      const openFormatted = openTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const closeFormatted = closeTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      expect(openFormatted).toBe("08:00 AM");
      expect(closeFormatted).toBe("06:00 PM");
    });
  });

  describe("Error Handling in Formatting", () => {
    it("should handle invalid dates gracefully", () => {
      const invalidDate = new Date("invalid");

      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <DateDisplay date={invalidDate} />
        </TestWrapper>
      );

      // Should display fallback text or handle gracefully
      expect(screen.getByTestId("date-display")).toBeInTheDocument();
    });

    it("should handle invalid numbers gracefully", () => {
      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <CurrencyDisplay amount={Number.NaN} />
        </TestWrapper>
      );

      // Should display fallback or handle gracefully
      expect(screen.getByTestId("currency-display")).toBeInTheDocument();
    });

    it("should handle null/undefined values gracefully", () => {
      render(
        <TestWrapper locale="cs" messages={csMessages}>
          <CurrencyDisplay amount={null as any} />
        </TestWrapper>
      );

      // Should display fallback or handle gracefully
      expect(screen.getByTestId("currency-display")).toBeInTheDocument();
    });
  });
});
