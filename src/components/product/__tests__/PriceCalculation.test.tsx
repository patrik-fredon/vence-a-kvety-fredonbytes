import {
  calculateTotalPrice,
  calculateCustomizationPriceModifiers,
  calculateTotalPriceWithOptions,
  formatPriceForDisplay,
} from "@/lib/utils/price-calculator";
import { usePriceCalculation } from "@/lib/utils/usePriceCalculation";
import { renderHook, act } from "@testing-library/react";
import type { Customization, CustomizationOption } from "@/types/product";

// Mock the price calculation hook dependencies
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useMemo: jest.fn((fn) => fn()),
  useCallback: jest.fn((fn) => fn),
}));

describe("Price Calculation", () => {
  const mockSizeOption: CustomizationOption = {
    id: "size",
    type: "size",
    name: { cs: "Velikost", en: "Size" },
    required: true,
    choices: [
      {
        id: "size_120",
        label: { cs: "120cm průměr", en: "120cm diameter" },
        priceModifier: 0,
        available: true,
      },
      {
        id: "size_150",
        label: { cs: "150cm průměr", en: "150cm diameter" },
        priceModifier: 500,
        available: true,
      },
      {
        id: "size_180",
        label: { cs: "180cm průměr", en: "180cm diameter" },
        priceModifier: 1000,
        available: true,
      },
    ],
  };

  const mockRibbonTextOption: CustomizationOption = {
    id: "ribbon_text",
    type: "ribbon_text",
    name: { cs: "Text na stuze", en: "Ribbon Text" },
    required: false,
    choices: [
      {
        id: "text_sympathy",
        label: { cs: "S upřímnou soustrasti", en: "With sincere sympathy" },
        priceModifier: 50,
        available: true,
      },
      {
        id: "text_custom",
        label: { cs: "Vlastní text", en: "Custom text" },
        priceModifier: 100,
        available: true,
      },
    ],
  };

  const customizationOptions = [mockSizeOption, mockRibbonTextOption];

  describe("Basic Price Calculation", () => {
    it("should calculate total price with no customizations", () => {
      const basePrice = 1500;
      const customizations: Customization[] = [];

      const totalPrice = calculateTotalPrice(basePrice, customizations);
      expect(totalPrice).toBe(1500);
    });

    it("should calculate total price with size customization", () => {
      const basePrice = 1500;
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_150"],
          priceModifier: 500,
        },
      ];

      const totalPrice = calculateTotalPrice(basePrice, customizations);
      expect(totalPrice).toBe(2000);
    });

    it("should calculate total price with multiple customizations", () => {
      const basePrice = 1500;
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_180"],
          priceModifier: 1000,
        },
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
          priceModifier: 100,
        },
      ];

      const totalPrice = calculateTotalPrice(basePrice, customizations);
      expect(totalPrice).toBe(2600);
    });

    it("should not allow negative prices", () => {
      const basePrice = 100;
      const customizations: Customization[] = [
        {
          optionId: "discount",
          choiceIds: ["large_discount"],
          priceModifier: -200,
        },
      ];

      const totalPrice = calculateTotalPrice(basePrice, customizations);
      expect(totalPrice).toBe(0);
    });
  });

  describe("Enhanced Price Calculation with Options", () => {
    it("should calculate price modifiers from customization options", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_150"],
        },
        {
          optionId: "ribbon_text",
          choiceIds: ["text_sympathy"],
        },
      ];

      const result = calculateCustomizationPriceModifiers(customizations, customizationOptions);

      expect(result.totalModifier).toBe(550); // 500 + 50
      expect(result.breakdown).toHaveLength(2);
      expect(result.breakdown[0].optionId).toBe("size");
      expect(result.breakdown[0].totalModifier).toBe(500);
      expect(result.breakdown[1].optionId).toBe("ribbon_text");
      expect(result.breakdown[1].totalModifier).toBe(50);
    });

    it("should calculate total price with customization options", () => {
      const basePrice = 1500;
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_180"],
        },
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
        },
      ];

      const totalPrice = calculateTotalPriceWithOptions(
        basePrice,
        customizations,
        customizationOptions
      );

      expect(totalPrice).toBe(2600); // 1500 + 1000 + 100
    });

    it("should handle custom values in price calculation", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_120"],
        },
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
          customValue: "Custom message",
        },
      ];

      const result = calculateCustomizationPriceModifiers(customizations, customizationOptions);

      expect(result.totalModifier).toBe(100); // 0 + 100
      expect(result.breakdown[1].customValue).toBe("Custom message");
    });

    it("should handle multiple choices for single option", () => {
      const multiChoiceOption: CustomizationOption = {
        id: "extras",
        type: "extras",
        name: { cs: "Doplňky", en: "Extras" },
        required: false,
        maxSelections: 3,
        choices: [
          {
            id: "extra1",
            label: { cs: "Doplněk 1", en: "Extra 1" },
            priceModifier: 100,
            available: true,
          },
          {
            id: "extra2",
            label: { cs: "Doplněk 2", en: "Extra 2" },
            priceModifier: 150,
            available: true,
          },
        ],
      };

      const customizations: Customization[] = [
        {
          optionId: "extras",
          choiceIds: ["extra1", "extra2"],
        },
      ];

      const result = calculateCustomizationPriceModifiers(customizations, [multiChoiceOption]);

      expect(result.totalModifier).toBe(250); // 100 + 150
      expect(result.breakdown[0].choices).toHaveLength(2);
    });
  });

  describe("Price Formatting", () => {
    it("should format Czech prices correctly", () => {
      const price = 1500;
      const formatted = formatPriceForDisplay(price, "cs", true);

      // Should include VAT and Czech formatting
      expect(formatted).toContain("Kč");
      expect(formatted).toContain("DPH");
    });

    it("should format English prices correctly", () => {
      const price = 1500;
      const formatted = formatPriceForDisplay(price, "en", true);

      // Should include VAT and English formatting
      expect(formatted).toContain("CZK");
      expect(formatted).toContain("VAT");
    });

    it("should format prices without tax when specified", () => {
      const price = 1500;
      const formatted = formatPriceForDisplay(price, "cs", false);

      expect(formatted).not.toContain("DPH");
      expect(formatted).not.toContain("VAT");
    });
  });

  describe("Real-time Price Calculation Hook", () => {
    it("should calculate price in real-time", () => {
      const basePrice = 1500;
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_150"],
        },
      ];

      const { result } = renderHook(() =>
        usePriceCalculation({
          basePrice,
          customizations,
          customizationOptions,
        })
      );

      expect(result.current.totalPrice).toBe(2000);
      expect(result.current.totalModifier).toBe(500);
      expect(result.current.breakdown).toHaveLength(1);
    });

    it("should update price when customizations change", () => {
      const basePrice = 1500;
      let customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_120"],
        },
      ];

      const { result, rerender } = renderHook(() =>
        usePriceCalculation({
          basePrice,
          customizations,
          customizationOptions,
        })
      );

      expect(result.current.totalPrice).toBe(1500);

      // Update customizations
      customizations = [
        {
          optionId: "size",
          choiceIds: ["size_180"],
        },
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
        },
      ];

      rerender();

      expect(result.current.totalPrice).toBe(2600);
      expect(result.current.totalModifier).toBe(1100);
    });

    it("should handle empty customizations", () => {
      const basePrice = 1500;
      const customizations: Customization[] = [];

      const { result } = renderHook(() =>
        usePriceCalculation({
          basePrice,
          customizations,
          customizationOptions,
        })
      );

      expect(result.current.totalPrice).toBe(1500);
      expect(result.current.totalModifier).toBe(0);
      expect(result.current.breakdown).toHaveLength(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing customization options", () => {
      const customizations: Customization[] = [
        {
          optionId: "nonexistent",
          choiceIds: ["choice1"],
        },
      ];

      const result = calculateCustomizationPriceModifiers(customizations, customizationOptions);

      expect(result.totalModifier).toBe(0);
      expect(result.breakdown).toHaveLength(0);
    });

    it("should handle missing choices in options", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["nonexistent_size"],
        },
      ];

      const result = calculateCustomizationPriceModifiers(customizations, customizationOptions);

      expect(result.totalModifier).toBe(0);
      expect(result.breakdown[0].choices).toHaveLength(0);
    });

    it("should handle customizations with both choice and direct price modifier", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_150"],
          priceModifier: 200, // Additional direct modifier
        },
      ];

      const result = calculateCustomizationPriceModifiers(customizations, customizationOptions);

      expect(result.totalModifier).toBe(700); // 500 from choice + 200 direct
    });

    it("should handle zero and negative price modifiers", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_120"], // 0 modifier
        },
      ];

      const result = calculateCustomizationPriceModifiers(customizations, customizationOptions);

      expect(result.totalModifier).toBe(0);
      expect(result.breakdown).toHaveLength(0); // Should not include zero modifiers
    });
  });

  describe("Performance", () => {
    it("should handle large numbers of customizations efficiently", () => {
      const largeCustomizations: Customization[] = Array.from({ length: 100 }, (_, i) => ({
        optionId: `option_${i}`,
        choiceIds: [`choice_${i}`],
        priceModifier: i,
      }));

      const startTime = performance.now();
      const totalPrice = calculateTotalPrice(1500, largeCustomizations);
      const endTime = performance.now();

      expect(totalPrice).toBe(1500 + (99 * 100) / 2); // Sum of 0 to 99
      expect(endTime - startTime).toBeLessThan(10); // Should complete in less than 10ms
    });

    it("should handle complex customization options efficiently", () => {
      const complexOptions: CustomizationOption[] = Array.from({ length: 50 }, (_, i) => ({
        id: `option_${i}`,
        type: `type_${i}`,
        name: { cs: `Možnost ${i}`, en: `Option ${i}` },
        required: false,
        choices: Array.from({ length: 10 }, (_, j) => ({
          id: `choice_${i}_${j}`,
          label: { cs: `Volba ${i}-${j}`, en: `Choice ${i}-${j}` },
          priceModifier: i * j,
          available: true,
        })),
      }));

      const customizations: Customization[] = Array.from({ length: 25 }, (_, i) => ({
        optionId: `option_${i}`,
        choiceIds: [`choice_${i}_5`],
      }));

      const startTime = performance.now();
      const result = calculateCustomizationPriceModifiers(customizations, complexOptions);
      const endTime = performance.now();

      expect(result.breakdown).toHaveLength(24); // Excluding option_0 (0 modifier)
      expect(endTime - startTime).toBeLessThan(50); // Should complete in reasonable time
    });
  });
});
