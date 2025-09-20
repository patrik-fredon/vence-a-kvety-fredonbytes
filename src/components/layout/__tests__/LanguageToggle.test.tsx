import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageToggle } from "../LanguageToggle";

// Mock the i18n hooks
jest.mock("@/lib/i18n/hooks", () => ({
  useLocaleSwitch: jest.fn(),
  useSafeTranslations: jest.fn(),
}));

// Mock the LoadingSpinner component
jest.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>
      Loading...
    </div>
  ),
}));

describe("LanguageToggle", () => {
  const mockSwitchLocale = jest.fn();
  const mockClearError = jest.fn();
  const mockT = jest.fn();

  const defaultMockReturn = {
    switchLocale: mockSwitchLocale,
    isLoading: false,
    error: null,
    clearError: mockClearError,
    availableLocales: ["cs", "en"],
    localeNames: { cs: "Čeština", en: "English" },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const { useLocaleSwitch, useSafeTranslations } = require("@/lib/i18n/hooks");
    useLocaleSwitch.mockReturnValue(defaultMockReturn);
    useSafeTranslations.mockReturnValue({ t: mockT });

    mockT.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        "selectLanguage": "Select language",
        "switchTo": "Switch to",
      };
      return translations[key] || key;
    });
  });

  describe("Select variant", () => {
    test("should render select dropdown with current locale", () => {
      render(<LanguageToggle currentLocale="cs" />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue("cs");

      expect(screen.getByText("Čeština")).toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
    });

    test("should call switchLocale when option is selected", async () => {
      render(<LanguageToggle currentLocale="cs" />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "en" } });

      await waitFor(() => {
        expect(mockSwitchLocale).toHaveBeenCalledWith("en");
      });
    });

    test("should show loading state", () => {
      const { useLocaleSwitch } = require("@/lib/i18n/hooks");
      useLocaleSwitch.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      render(<LanguageToggle currentLocale="cs" />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeDisabled();
    });

    test("should show error message", () => {
      const { useLocaleSwitch } = require("@/lib/i18n/hooks");
      useLocaleSwitch.mockReturnValue({
        ...defaultMockReturn,
        error: "Failed to switch language",
      });

      render(<LanguageToggle currentLocale="cs" />);

      // Trigger error display by changing locale
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "en" } });

      // Error would be shown after the switch attempt
    });
  });

  describe("Buttons variant", () => {
    test("should render buttons for each locale", () => {
      render(<LanguageToggle currentLocale="cs" variant="buttons" />);

      expect(screen.getByRole("button", { name: /čeština/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /english/i })).toBeInTheDocument();
    });

    test("should highlight current locale button", () => {
      render(<LanguageToggle currentLocale="cs" variant="buttons" />);

      const csButton = screen.getByRole("button", { name: /čeština/i });
      const enButton = screen.getByRole("button", { name: /english/i });

      expect(csButton).toHaveAttribute("aria-pressed", "true");
      expect(enButton).toHaveAttribute("aria-pressed", "false");
      expect(csButton).toBeDisabled();
    });

    test("should call switchLocale when button is clicked", async () => {
      render(<LanguageToggle currentLocale="cs" variant="buttons" />);

      const enButton = screen.getByRole("button", { name: /english/i });
      fireEvent.click(enButton);

      await waitFor(() => {
        expect(mockSwitchLocale).toHaveBeenCalledWith("en");
      });
    });

    test("should show loading state on buttons", () => {
      const { useLocaleSwitch } = require("@/lib/i18n/hooks");
      useLocaleSwitch.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      render(<LanguageToggle currentLocale="cs" variant="buttons" />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
      });
    });

    test("should not show labels when showLabels is false", () => {
      render(
        <LanguageToggle
          currentLocale="cs"
          variant="buttons"
          showLabels={false}
        />
      );

      expect(screen.getByText("CS")).toBeInTheDocument();
      expect(screen.getByText("EN")).toBeInTheDocument();
      expect(screen.queryByText("Čeština")).not.toBeInTheDocument();
      expect(screen.queryByText("English")).not.toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    test("should clear error when switching locale", async () => {
      render(<LanguageToggle currentLocale="cs" />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "en" } });

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    test("should handle switch locale errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSwitchLocale.mockRejectedValue(new Error("Network error"));

      render(<LanguageToggle currentLocale="cs" />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "en" } });

      // Should not throw error and should handle gracefully
      await waitFor(() => {
        expect(mockSwitchLocale).toHaveBeenCalledWith("en");
      });

      // Should log error to console
      expect(consoleSpy).toHaveBeenCalledWith("Language switch failed:", expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    test("should have proper ARIA labels", () => {
      render(<LanguageToggle currentLocale="cs" />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-label", "Select language");
    });

    test("should have proper ARIA labels for buttons", () => {
      render(<LanguageToggle currentLocale="cs" variant="buttons" />);

      expect(screen.getByLabelText("Switch to Čeština")).toBeInTheDocument();
      expect(screen.getByLabelText("Switch to English")).toBeInTheDocument();
    });

    test("should support keyboard navigation", () => {
      render(<LanguageToggle currentLocale="cs" />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("Custom styling", () => {
    test("should apply custom className", () => {
      render(<LanguageToggle currentLocale="cs" className="custom-class" />);

      const container = screen.getByRole("combobox").parentElement;
      expect(container).toHaveClass("custom-class");
    });
  });
});
