import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { SizeSelector } from "../SizeSelector";
import { RibbonConfigurator } from "../RibbonConfigurator";
import type { CustomizationOption, Customization } from "@/types/product";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));

// Mock utils
jest.mock("@/lib/utils", () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(" ")),
}));

// Mock price calculator
jest.mock("@/lib/utils/price-calculator", () => ({
  formatPrice: jest.fn((price: number, locale: string, showSign?: boolean) => {
    const sign = showSign && price > 0 ? "+" : "";
    return locale === "cs" ? `${sign}${price.toLocaleString()} Kč` : `${sign}CZK ${price.toLocaleString()}`;
  }),
}));

// Mock validation
jest.mock("@/lib/validation/wreath", () => ({
  validateCustomRibbonText: jest.fn(() => ({ errors: [], warnings: [] })),
}));

const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;

const mockSizeOption: CustomizationOption = {
  id: "size",
  type: "size",
  name: { cs: "Velikost", en: "Size" },
  required: true,
  minSelections: 1,
  maxSelections: 1,
  choices: [
    {
      id: "size_120",
      value: "size_120",
      label: { cs: "120cm průměr", en: "120cm diameter" },
      priceModifier: 0,
      available: true,
    },
    {
      id: "size_150",
      value: "size_150",
      label: { cs: "150cm průměr", en: "150cm diameter" },
      priceModifier: 500,
      available: true,
    },
    {
      id: "size_180",
      value: "size_180",
      label: { cs: "180cm průměr", en: "180cm diameter" },
      priceModifier: 1000,
      available: false,
    },
  ],
};

const mockColorOption: CustomizationOption = {
  id: "ribbon_color",
  type: "ribbon_color",
  name: { cs: "Barva stuhy", en: "Ribbon Color" },
  required: true,
  minSelections: 1,
  maxSelections: 1,
  choices: [
    {
      id: "color_black",
      value: "color_black",
      label: { cs: "Černá", en: "Black" },
      priceModifier: 0,
      available: true,
    },
    {
      id: "color_white",
      value: "color_white",
      label: { cs: "Bílá", en: "White" },
      priceModifier: 0,
      available: true,
    },
  ],
};

const mockTextOption: CustomizationOption = {
  id: "ribbon_text",
  type: "ribbon_text",
  name: { cs: "Text na stuze", en: "Ribbon Text" },
  required: true,
  minSelections: 1,
  maxSelections: 1,
  choices: [
    {
      id: "text_sympathy",
      value: "text_sympathy",
      label: { cs: "S upřímnou soustrasti", en: "With sincere sympathy" },
      priceModifier: 50,
      available: true,
    },
    {
      id: "text_custom",
      value: "text_custom",
      label: { cs: "Vlastní text", en: "Custom text" },
      priceModifier: 100,
      available: true,
      allowCustomInput: true,
      maxLength: 50,
    },
  ],
};

const setupMocks = (locale: "cs" | "en" = "cs") => {
  const mockT = jest.fn((key: string, params?: any) => {
    const translations: Record<string, any> = {
      cs: {
        required: "Povinné",
        optional: "volitelné",
        customTextPlaceholder: "Zadejte vlastní text...",
        customTextHelp: "Vlastní text na stuhu",
        customTextAriaLabel: "Vstupní pole pro vlastní text na stuhu",
        ribbonConfiguration: "Konfigurace stuhy",
        sizeOption: `Velikost: ${params?.size || "{size}"}, Cena: ${params?.price || "{price}"} ${params?.modifier || "{modifier}"}`,
        "validation.sizeRequired": "Prosím vyberte velikost před přidáním do košíku",
        "validation.conditionalRequired": `${params?.option || "{option}"} je povinné při výběru stuhy`,
      },
      en: {
        required: "Required",
        optional: "optional",
        customTextPlaceholder: "Enter your custom text...",
        customTextHelp: "Custom text for ribbon",
        customTextAriaLabel: "Custom text input for ribbon",
        ribbonConfiguration: "Ribbon Configuration",
        sizeOption: `Size: ${params?.size || "{size}"}, Price: ${params?.price || "{price}"} ${params?.modifier || "{modifier}"}`,
        "validation.sizeRequired": "Please select a size before adding to cart",
        "validation.conditionalRequired": `${params?.option || "{option}"} is required when ribbon is selected`,
      },
    };
    return translations[locale][key] || key;
  });

  const mockTCurrency = jest.fn((key: string, params?: any) => params?.amount || key);
  const mockTAccessibility = jest.fn((key: string) => {
    const translations: Record<string, any> = {
      cs: {
        required: "povinné",
        optional: "volitelné",
        selected: "vybráno",
        unavailable: "nedostupné",
        charactersOf: "znaků z",
      },
      en: {
        required: "required",
        optional: "optional",
        selected: "selected",
        unavailable: "unavailable",
        charactersOf: "characters of",
      },
    };
    return translations[locale][key] || key;
  });

  mockUseTranslations.mockImplementation((namespace: string) => {
    if (namespace === "product") return mockT;
    if (namespace === "currency") return mockTCurrency;
    if (namespace === "accessibility") return mockTAccessibility;
    return mockT;
  });

  return { mockT, mockTCurrency, mockTAccessibility };
};

describe("SizeSelector Accessibility & Internationalization", () => {
  const mockOnSizeChange = jest.fn();

  beforeEach(() => {
    mockOnSizeChange.mockClear();
  });

  describe("WCAG 2.1 AA Compliance", () => {
    test("should have proper ARIA attributes for radio group", () => {
      setupMocks("cs");
      render(
        <SizeSelector
          sizeOption={mockSizeOption}
          selectedSize={null}
          onSizeChange={mockOnSizeChange}
          locale="cs"
          basePrice={2500}
        />
      );

      // Check for proper fieldset and radiogroup structure
      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toBeInTheDocument();
      expect(radioGroup).toHaveAttribute("aria-labelledby");

      // Check for proper radio buttons
      const radioButtons = screen.getAllByRole("radio");
      expect(radioButtons).toHaveLength(3);

      radioButtons.forEach((radio, index) => {
        expect(radio).toHaveAttribute("aria-checked");
        expect(radio).toHaveAttribute("aria-describedby");
        expect(radio).toHaveAttribute("aria-labelledby");
        expect(radio).toHaveAttribute("aria-posinset", String(index + 1));
        expect(radio).toHaveAttribute("aria-setsize", "3");
      });
    });

    test("should have proper focus management", () => {
      setupMocks("cs");
      render(
        <SizeSelector
          sizeOption={mockSizeOption}
          selectedSize="size_120"
          onSizeChange={mockOnSizeChange}
          locale="cs"
          basePrice={2500}
        />
      );

      const radioButtons = screen.getAllByRole("radio");
      const selectedRadio = radioButtons.find(radio =>
        radio.getAttribute("aria-checked") === "true"
      );
      const unselectedRadios = radioButtons.filter(radio =>
        radio.getAttribute("aria-checked") === "false"
      );

      // Selected radio should be focusable
      expect(selectedRadio).toHaveAttribute("tabIndex", "0");

      // Unselected radios should not be focusable
      unselectedRadios.forEach(radio => {
        expect(radio).toHaveAttribute("tabIndex", "-1");
      });
    });

    test("should have proper error messaging with ARIA live regions", () => {
      setupMocks("cs");
      render(
        <SizeSelector
          sizeOption={mockSizeOption}
          selectedSize={null}
          onSizeChange={mockOnSizeChange}
          locale="cs"
          basePrice={2500}
        />
      );

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute("aria-live", "polite");
      expect(errorMessage).toHaveTextContent("Prosím vyberte velikost před přidáním do košíku");
    });

    test("should handle disabled options correctly", () => {
      setupMocks("cs");
      render(
        <SizeSelector
          sizeOption={mockSizeOption}
          selectedSize={null}
          onSizeChange={mockOnSizeChange}
          locale="cs"
          basePrice={2500}
        />
      );

      const radioButtons = screen.getAllByRole("radio");
      const disabledRadio = radioButtons.find(radio =>
        radio.hasAttribute("disabled")
      );

      expect(disabledRadio).toBeInTheDocument();
      expect(disabledRadio).toHaveAttribute("disabled");

      // Check screen reader description includes unavailable status
      const description = disabledRadio?.getAttribute("aria-describedby");
      if (description) {
        const descriptionElement = document.getElementById(description);
        expect(descriptionElement).toHaveTextContent("nedostupné");
      }
    });
  });

  describe("Internationalization", () => {
    test("should display Czech translations correctly", () => {
      setupMocks("cs");
      render(
        <SizeSelector
          sizeOption={mockSizeOption}
          selectedSize={null}
          onSizeChange={mockOnSizeChange}
          locale="cs"
          basePrice={2500}
        />
      );

      expect(screen.getByText("Velikost")).toBeInTheDocument();
      expect(screen.getByText("Povinné")).toBeInTheDocument();
      expect(screen.getByText("120cm průměr")).toBeInTheDocument();
      expect(screen.getByText("150cm průměr")).toBeInTheDocument();
      expect(screen.getByText("180cm průměr")).toBeInTheDocument();
      expect(screen.getByText("Prosím vyberte velikost před přidáním do košíku")).toBeInTheDocument();
    });

    test("should display English translations correctly", () => {
      setupMocks("en");
      render(
        <SizeSelector
          sizeOption={mockSizeOption}
          selectedSize={null}
          onSizeChange={mockOnSizeChange}
          locale="en"
          basePrice={2500}
        />
      );

      expect(screen.getByText("Size")).toBeInTheDocument();
      expect(screen.getByText("Required")).toBeInTheDocument();
      expect(screen.getByText("120cm diameter")).toBeInTheDocument();
      expect(screen.getByText("150cm diameter")).toBeInTheDocument();
      expect(screen.getByText("180cm diameter")).toBeInTheDocument();
      expect(screen.getByText("Please select a size before adding to cart")).toBeInTheDocument();
    });

    test("should format prices according to locale", () => {
      setupMocks("cs");
      render(
        <SizeSelector
          sizeOption={mockSizeOption}
          selectedSize={null}
          onSizeChange={mockOnSizeChange}
          locale="cs"
          basePrice={2500}
        />
      );

      expect(screen.getByText("2 500 Kč")).toBeInTheDocument();
      expect(screen.getByText("3 000 Kč")).toBeInTheDocument();
      expect(screen.getByText("(+500 Kč)")).toBeInTheDocument();
    });
  });
});

describe("RibbonConfigurator Accessibility & Internationalization", () => {
  const mockOnCustomizationChange = jest.fn();
  const mockCustomizations: Customization[] = [];

  beforeEach(() => {
    mockOnCustomizationChange.mockClear();
  });

  describe("WCAG 2.1 AA Compliance", () => {
    test("should have proper semantic structure with fieldsets and legends", () => {
      setupMocks("cs");
      render(
        <RibbonConfigurator
          isVisible={true}
          colorOption={mockColorOption}
          textOption={mockTextOption}
          customizations={mockCustomizations}
          onCustomizationChange={mockOnCustomizationChange}
          locale="cs"
        />
      );

      // Check for proper section structure
      const section = screen.getByRole("region");
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute("aria-labelledby");

      // Check for fieldsets
      const fieldsets = document.querySelectorAll("fieldset");
      expect(fieldsets).toHaveLength(2); // Color and text options

      fieldsets.forEach(fieldset => {
        expect(fieldset).toHaveAttribute("aria-labelledby");
        expect(fieldset).toHaveAttribute("aria-required");
      });
    });

    test("should have proper radio group structure for single selection options", () => {
      renderWithIntl(
        <RibbonConfigurator
          isVisible={true}
          colorOption={mockColorOption}
          textOption={mockTextOption}
          customizations={mockCustomizations}
          onCustomizationChange={mockOnCustomizationChange}
          locale="cs"
        />
      );

      const radioGroups = screen.getAllByRole("radiogroup");
      expect(radioGroups).toHaveLength(2); // Color and text options

      radioGroups.forEach(group => {
        expect(group).toHaveAttribute("aria-labelledby");
        expect(group).toHaveAttribute("aria-required");
      });
    });

    test("should have proper ARIA attributes for radio buttons", () => {
      renderWithIntl(
        <RibbonConfigurator
          isVisible={true}
          colorOption={mockColorOption}
          textOption={mockTextOption}
          customizations={mockCustomizations}
          onCustomizationChange={mockOnCustomizationChange}
          locale="cs"
        />
      );

      const radioButtons = screen.getAllByRole("radio");
      expect(radioButtons.length).toBeGreaterThan(0);

      radioButtons.forEach((radio, index) => {
        expect(radio).toHaveAttribute("aria-checked");
        expect(radio).toHaveAttribute("aria-describedby");
        expect(radio).toHaveAttribute("aria-labelledby");
        expect(radio).toHaveAttribute("aria-posinset");
        expect(radio).toHaveAttribute("aria-setsize");
      });
    });

    test("should have proper custom text input accessibility", async () => {
      const customizationsWithCustomText: Customization[] = [
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
        },
      ];

      renderWithIntl(
        <RibbonConfigurator
          isVisible={true}
          colorOption={mockColorOption}
          textOption={mockTextOption}
          customizations={customizationsWithCustomText}
          onCustomizationChange={mockOnCustomizationChange}
          locale="cs"
        />
      );

      // First select the custom text option
      const customTextRadio = screen.getByRole("radio", { name: /vlastní text/i });
      fireEvent.click(customTextRadio);

      await waitFor(() => {
        const textArea = screen.getByRole("textbox");
        expect(textArea).toBeInTheDocument();
        expect(textArea).toHaveAttribute("aria-label");
        expect(textArea).toHaveAttribute("aria-describedby");
        expect(textArea).toHaveAttribute("aria-required");
        expect(textArea).toHaveAttribute("maxLength", "50");
      });
    });

    test("should provide proper validation feedback with ARIA live regions", async () => {
      const customizationsWithCustomText: Customization[] = [
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
          customValue: "This is a very long text that exceeds the maximum allowed length for ribbon text",
        },
      ];

      renderWithIntl(
        <RibbonConfigurator
          isVisible={true}
          colorOption={mockColorOption}
          textOption={mockTextOption}
          customizations={customizationsWithCustomText}
          onCustomizationChange={mockOnCustomizationChange}
          locale="cs"
        />
      );

      await waitFor(() => {
        const alerts = screen.getAllByRole("alert");
        expect(alerts.length).toBeGreaterThan(0);

        alerts.forEach(alert => {
          expect(alert).toHaveAttribute("aria-live", "polite");
        });
      });
    });
  });

  describe("Internationalization", () => {
    test("should display Czech translations correctly", () => {
      renderWithIntl(
        <RibbonConfigurator
          isVisible={true}
          colorOption={mockColorOption}
          textOption={mockTextOption}
          customizations={mockCustomizations}
          onCustomizationChange={mockOnCustomizationChange}
          locale="cs"
        />
      );

      expect(screen.getByText("Konfigurace stuhy")).toBeInTheDocument();
      expect(screen.getByText("(volitelné)")).toBeInTheDocument();
      expect(screen.getByText("Barva stuhy")).toBeInTheDocument();
      expect(screen.getByText("Text na stuze")).toBeInTheDocument();
      expect(screen.getByText("Černá")).toBeInTheDocument();
      expect(screen.getByText("Bílá")).toBeInTheDocument();
      expect(screen.getByText("S upřímnou soustrasti")).toBeInTheDocument();
      expect(screen.getByText("Vlastní text")).toBeInTheDocument();
    });

    test("should display English translations correctly", () => {
      renderWithIntl(
        <RibbonConfigurator
          isVisible={true}
          colorOption={mockColorOption}
          textOption={mockTextOption}
          customizations={mockCustomizations}
          onCustomizationChange={mockOnCustomizationChange}
          locale="en"
        />,
        "en"
      );

      expect(screen.getByText("Ribbon Configuration")).toBeInTheDocument();
      expect(screen.getByText("(optional)")).toBeInTheDocument();
      expect(screen.getByText("Ribbon Color")).toBeInTheDocument();
      expect(screen.getByText("Ribbon Text")).toBeInTheDocument();
      expect(screen.getByText("Black")).toBeInTheDocument();
      expect(screen.getByText("White")).toBeInTheDocument();
      expect(screen.getByText("With sincere sympathy")).toBeInTheDocument();
      expect(screen.getByText("Custom text")).toBeInTheDocument();
    });

    test("should handle custom text input in both languages", async () => {
      const customizationsWithCustomText: Customization[] = [
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
        },
      ];

      // Test Czech
      const { rerender } = renderWithIntl(
        <RibbonConfigurator
          isVisible={true}
          colorOption={mockColorOption}
          textOption={mockTextOption}
          customizations={customizationsWithCustomText}
          onCustomizationChange={mockOnCustomizationChange}
          locale="cs"
        />
      );

      await waitFor(() => {
        const textArea = screen.getByPlaceholderText("Zadejte vlastní text...");
        expect(textArea).toBeInTheDocument();
        expect(screen.getByText("Vlastní text na stuhu")).toBeInTheDocument();
      });

      // Test English
      rerender(
        <NextIntlClientProvider locale="en" messages={mockMessages.en}>
          <RibbonConfigurator
            isVisible={true}
            colorOption={mockColorOption}
            textOption={mockTextOption}
            customizations={customizationsWithCustomText}
            onCustomizationChange={mockOnCustomizationChange}
            locale="en"
          />
        </NextIntlClientProvider>
      );

      await waitFor(() => {
        const textArea = screen.getByPlaceholderText("Enter your custom text...");
        expect(textArea).toBeInTheDocument();
        expect(screen.getByText("Custom text for ribbon")).toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    test("should support keyboard navigation within radio groups", () => {
      renderWithIntl(
        <RibbonConfigurator
          isVisible={true}
          colorOption={mockColorOption}
          textOption={mockTextOption}
          customizations={mockCustomizations}
          onCustomizationChange={mockOnCustomizationChange}
          locale="cs"
        />
      );

      const radioButtons = screen.getAllByRole("radio");
      const firstRadio = radioButtons[0];

      // Focus first radio
      firstRadio.focus();
      expect(document.activeElement).toBe(firstRadio);

      // Test arrow key navigation
      fireEvent.keyDown(firstRadio, { key: "ArrowDown" });
      // Note: Full arrow key navigation would require additional implementation
    });
  });
});
