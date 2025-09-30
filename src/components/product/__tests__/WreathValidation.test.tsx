import {
  validateWreathConfiguration,
  validateCustomRibbonText,
  validateWreathSizeSelection,
  validateRibbonDependencies,
  WREATH_VALIDATION_MESSAGES,
} from "@/lib/validation/wreath";
import type { Customization, CustomizationOption } from "@/types/product";

describe("Wreath Validation", () => {
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
        available: true,
      },
    ],
  };

  const mockRibbonOption: CustomizationOption = {
    id: "ribbon",
    type: "ribbon",
    name: { cs: "Stuha", en: "Ribbon" },
    required: false,
    choices: [
      {
        id: "ribbon_yes",
        value: "ribbon_yes",
        label: { cs: "Ano, přidat stuhu", en: "Yes, add ribbon" },
        priceModifier: 0,
        available: true,
      },
    ],
  };

  const mockRibbonColorOption: CustomizationOption = {
    id: "ribbon_color",
    type: "ribbon_color",
    name: { cs: "Barva stuhy", en: "Ribbon Color" },
    required: false,
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

  const mockRibbonTextOption: CustomizationOption = {
    id: "ribbon_text",
    type: "ribbon_text",
    name: { cs: "Text na stuze", en: "Ribbon Text" },
    required: false,
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
      },
    ],
  };

  const allOptions = [mockSizeOption, mockRibbonOption, mockRibbonColorOption, mockRibbonTextOption];

  describe("Size Validation", () => {
    it("should require size selection when size option is required", () => {
      const customizations: Customization[] = [];
      const selectedSize = null;

      const result = validateWreathConfiguration(
        customizations,
        [mockSizeOption],
        selectedSize,
        { locale: "en" }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.sizeRequired);
    });

    it("should pass validation when valid size is selected", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_150"],
        },
      ];
      const selectedSize = "size_150";

      const result = validateWreathConfiguration(
        customizations,
        [mockSizeOption],
        selectedSize,
        { locale: "en" }
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid size selection", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["invalid_size"],
        },
      ];
      const selectedSize = "invalid_size";

      const result = validateWreathConfiguration(
        customizations,
        [mockSizeOption],
        selectedSize,
        { locale: "en" }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.sizeInvalid);
    });

    it("should validate size selection independently", () => {
      const result = validateWreathSizeSelection(null, mockSizeOption, "en");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(WREATH_VALIDATION_MESSAGES.en.sizeRequired);

      const validResult = validateWreathSizeSelection("size_120", mockSizeOption, "en");
      expect(validResult.isValid).toBe(true);
      expect(validResult.error).toBeUndefined();
    });
  });

  describe("Ribbon Dependencies Validation", () => {
    it("should require ribbon color when ribbon is selected", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_120"],
        },
        {
          optionId: "ribbon",
          choiceIds: ["ribbon_yes"],
        },
      ];
      const selectedSize = "size_120";

      const result = validateWreathConfiguration(
        customizations,
        allOptions,
        selectedSize,
        { locale: "en" }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.ribbonColorRequired);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.ribbonTextRequired);
      expect(result.hasRibbonSelected).toBe(true);
    });

    it("should pass validation when ribbon with color and text is selected", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_120"],
        },
        {
          optionId: "ribbon",
          choiceIds: ["ribbon_yes"],
        },
        {
          optionId: "ribbon_color",
          choiceIds: ["color_black"],
        },
        {
          optionId: "ribbon_text",
          choiceIds: ["text_sympathy"],
        },
      ];
      const selectedSize = "size_120";

      const result = validateWreathConfiguration(
        customizations,
        allOptions,
        selectedSize,
        { locale: "en" }
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.hasRibbonSelected).toBe(true);
    });

    it("should validate ribbon dependencies independently", () => {
      const customizationsWithRibbon: Customization[] = [
        {
          optionId: "ribbon",
          choiceIds: ["ribbon_yes"],
        },
      ];

      const result = validateRibbonDependencies(
        customizationsWithRibbon,
        mockRibbonOption,
        mockRibbonColorOption,
        mockRibbonTextOption,
        "en"
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.ribbonColorRequired);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.ribbonTextRequired);
    });

    it("should pass validation when no ribbon is selected", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_120"],
        },
      ];
      const selectedSize = "size_120";

      const result = validateWreathConfiguration(
        customizations,
        allOptions,
        selectedSize,
        { locale: "en" }
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.hasRibbonSelected).toBe(false);
    });
  });

  describe("Custom Text Validation", () => {
    it("should validate custom text length", () => {
      const shortText = "A";
      const validText = "Valid custom text";
      const longText = "A".repeat(51);

      const shortResult = validateCustomRibbonText(shortText, "en");
      expect(shortResult.errors).toContain(WREATH_VALIDATION_MESSAGES.en.customTextTooShort);

      const validResult = validateCustomRibbonText(validText, "en");
      expect(validResult.errors).toHaveLength(0);

      const longResult = validateCustomRibbonText(longText, "en");
      expect(longResult.errors).toContain(WREATH_VALIDATION_MESSAGES.en.customTextTooLong);
    });

    it("should reject empty custom text", () => {
      const emptyText = "";
      const whitespaceText = "   ";

      const emptyResult = validateCustomRibbonText(emptyText, "en");
      expect(emptyResult.errors).toContain(WREATH_VALIDATION_MESSAGES.en.customTextEmpty);

      const whitespaceResult = validateCustomRibbonText(whitespaceText, "en");
      expect(whitespaceResult.errors).toContain(WREATH_VALIDATION_MESSAGES.en.customTextEmpty);
    });

    it("should reject inappropriate content", () => {
      const profaneText = "This is fucking inappropriate";
      const scriptText = "<script>alert('xss')</script>";

      const profaneResult = validateCustomRibbonText(profaneText, "en");
      expect(profaneResult.errors).toContain(WREATH_VALIDATION_MESSAGES.en.customTextInvalid);

      const scriptResult = validateCustomRibbonText(scriptText, "en");
      expect(scriptResult.errors).toContain(WREATH_VALIDATION_MESSAGES.en.customTextInvalid);
    });

    it("should warn about approaching character limit", () => {
      const longText = "A".repeat(45); // Approaching 50 character limit

      const result = validateCustomRibbonText(longText, "en");
      expect(result.warnings).toContain(WREATH_VALIDATION_MESSAGES.en.customTextWarning);
    });

    it("should validate custom text in complete configuration", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_120"],
        },
        {
          optionId: "ribbon",
          choiceIds: ["ribbon_yes"],
        },
        {
          optionId: "ribbon_color",
          choiceIds: ["color_black"],
        },
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
          customValue: "A", // Too short
        },
      ];
      const selectedSize = "size_120";

      const result = validateWreathConfiguration(
        customizations,
        allOptions,
        selectedSize,
        { locale: "en" }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.customTextTooShort);
    });
  });

  describe("Localization", () => {
    it("should provide Czech error messages", () => {
      const customizations: Customization[] = [];
      const selectedSize = null;

      const result = validateWreathConfiguration(
        customizations,
        [mockSizeOption],
        selectedSize,
        { locale: "cs" }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.cs.sizeRequired);
    });

    it("should provide English error messages", () => {
      const customizations: Customization[] = [];
      const selectedSize = null;

      const result = validateWreathConfiguration(
        customizations,
        [mockSizeOption],
        selectedSize,
        { locale: "en" }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.sizeRequired);
    });
  });

  describe("Complex Scenarios", () => {
    it("should validate complete wreath configuration", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_150"],
        },
        {
          optionId: "ribbon",
          choiceIds: ["ribbon_yes"],
        },
        {
          optionId: "ribbon_color",
          choiceIds: ["color_white"],
        },
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
          customValue: "Milovanému otci",
        },
      ];
      const selectedSize = "size_150";

      const result = validateWreathConfiguration(
        customizations,
        allOptions,
        selectedSize,
        { locale: "cs" }
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.hasRibbonSelected).toBe(true);
    });

    it("should handle multiple validation errors", () => {
      const customizations: Customization[] = [
        {
          optionId: "ribbon",
          choiceIds: ["ribbon_yes"],
        },
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
          customValue: "A".repeat(60), // Too long
        },
      ];
      const selectedSize = null; // Missing size

      const result = validateWreathConfiguration(
        customizations,
        allOptions,
        selectedSize,
        { locale: "en" }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.sizeRequired);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.ribbonColorRequired);
      expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.customTextTooLong);
    });

    it("should handle edge cases gracefully", () => {
      // Empty customization options
      const result1 = validateWreathConfiguration([], [], null, { locale: "en" });
      expect(result1.isValid).toBe(true);

      // Undefined options
      const result2 = validateWreathSizeSelection("size_120", undefined, "en");
      expect(result2.isValid).toBe(true);

      // Empty ribbon dependencies
      const result3 = validateRibbonDependencies([], undefined, undefined, undefined, "en");
      expect(result3.isValid).toBe(true);
    });
  });

  describe("Strict Mode", () => {
    it("should treat warnings as errors in strict mode", () => {
      const customizations: Customization[] = [
        {
          optionId: "size",
          choiceIds: ["size_120"],
        },
        {
          optionId: "ribbon",
          choiceIds: ["ribbon_yes"],
        },
        {
          optionId: "ribbon_color",
          choiceIds: ["color_black"],
        },
        {
          optionId: "ribbon_text",
          choiceIds: ["text_custom"],
          customValue: "A".repeat(45), // Approaching limit (warning)
        },
      ];
      const selectedSize = "size_120";

      const normalResult = validateWreathConfiguration(
        customizations,
        allOptions,
        selectedSize,
        { locale: "en", strictMode: false }
      );

      const strictResult = validateWreathConfiguration(
        customizations,
        allOptions,
        selectedSize,
        { locale: "en", strictMode: true }
      );

      expect(normalResult.isValid).toBe(true);
      expect(normalResult.warnings.length).toBeGreaterThan(0);

      expect(strictResult.isValid).toBe(false);
      expect(strictResult.errors.length).toBeGreaterThan(0);
    });
  });
});
