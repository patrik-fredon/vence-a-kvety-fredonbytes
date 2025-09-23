import { describe, it, expect } from 'vitest';
import {
  validateWreathConfiguration,
  validateCustomRibbonText,
  validateWreathSizeSelection,
  validateRibbonDependencies,
  sanitizeCustomText,
  getValidationMessage,
  WREATH_VALIDATION_MESSAGES
} from '../wreath';
import type { Customization, CustomizationOption } from '@/types/product';

// Mock customization options for testing
const mockCustomizationOptions: CustomizationOption[] = [
  {
    id: 'size',
    type: 'size',
    name: { cs: 'Velikost', en: 'Size' },
    required: true,
    minSelections: 1,
    maxSelections: 1,
    choices: [
      {
        id: 'size_120',
        label: { cs: '120cm průměr', en: '120cm diameter' },
        priceModifier: 0,
        available: true
      },
      {
        id: 'size_150',
        label: { cs: '150cm průměr', en: '150cm diameter' },
        priceModifier: 500,
        available: true
      }
    ]
  },
  {
    id: 'ribbon',
    type: 'ribbon',
    name: { cs: 'Stuha', en: 'Ribbon' },
    required: false,
    choices: [
      {
        id: 'ribbon_yes',
        label: { cs: 'Ano, přidat stuhu', en: 'Yes, add ribbon' },
        priceModifier: 0,
        available: true
      }
    ]
  },
  {
    id: 'ribbon_color',
    type: 'ribbon_color',
    name: { cs: 'Barva stuhy', en: 'Ribbon Color' },
    required: false,
    choices: [
      {
        id: 'color_black',
        label: { cs: 'Černá', en: 'Black' },
        priceModifier: 0,
        available: true
      },
      {
        id: 'color_white',
        label: { cs: 'Bílá', en: 'White' },
        priceModifier: 0,
        available: true
      }
    ]
  },
  {
    id: 'ribbon_text',
    type: 'ribbon_text',
    name: { cs: 'Text na stuze', en: 'Ribbon Text' },
    required: false,
    choices: [
      {
        id: 'text_sympathy',
        label: { cs: 'S upřímnou soustrasti', en: 'With sincere sympathy' },
        priceModifier: 50,
        available: true
      },
      {
        id: 'text_custom',
        label: { cs: 'Vlastní text', en: 'Custom text' },
        priceModifier: 100,
        available: true
      }
    ]
  }
];

describe('Wreath Validation System', () => {
  describe('validateWreathSizeSelection', () => {
    it('should pass when size is selected and required', () => {
      const sizeOption = mockCustomizationOptions[0];
      const result = validateWreathSizeSelection('size_120', sizeOption, 'cs');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail when size is required but not selected', () => {
      const sizeOption = mockCustomizationOptions[0];
      const result = validateWreathSizeSelection(null, sizeOption, 'cs');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Velikost věnce je povinná');
    });

    it('should fail when selected size is not available', () => {
      const sizeOption = mockCustomizationOptions[0];
      const result = validateWreathSizeSelection('invalid_size', sizeOption, 'cs');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Vybraná velikost není dostupná');
    });

    it('should pass when size option is not defined', () => {
      const result = validateWreathSizeSelection(null, undefined, 'cs');

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCustomRibbonText', () => {
    it('should pass with valid custom text', () => {
      const result = validateCustomRibbonText('S láskou vzpomínáme', 'cs');

      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should fail with empty text', () => {
      const result = validateCustomRibbonText('', 'cs');

      expect(result.errors).toContain('Vlastní text nemůže být prázdný');
    });

    it('should fail with text too long', () => {
      const longText = 'A'.repeat(51);
      const result = validateCustomRibbonText(longText, 'cs');

      expect(result.errors).toContain('Vlastní text může mít maximálně 50 znaků');
    });

    it('should fail with text too short', () => {
      const result = validateCustomRibbonText('A', 'cs');

      expect(result.errors).toContain('Vlastní text musí mít alespoň 2 znaky');
    });

    it('should fail with inappropriate content', () => {
      const result = validateCustomRibbonText('fuck this', 'cs');

      expect(result.errors).toContain('Text obsahuje nepovolené znaky nebo obsah');
    });

    it('should warn when approaching character limit', () => {
      const longText = 'A'.repeat(45);
      const result = validateCustomRibbonText(longText, 'cs');

      expect(result.warnings).toContain('Text se blíží maximální délce');
    });

    it('should fail with HTML content', () => {
      const result = validateCustomRibbonText('<script>alert("xss")</script>', 'cs');

      expect(result.errors).toContain('Text obsahuje nepovolené znaky nebo obsah');
    });
  });

  describe('sanitizeCustomText', () => {
    it('should trim whitespace', () => {
      const result = sanitizeCustomText('  hello world  ');
      expect(result).toBe('hello world');
    });

    it('should replace multiple spaces with single space', () => {
      const result = sanitizeCustomText('hello    world');
      expect(result).toBe('hello world');
    });

    it('should remove HTML brackets', () => {
      const result = sanitizeCustomText('hello <world>');
      expect(result).toBe('hello world');
    });

    it('should enforce max length', () => {
      const longText = 'A'.repeat(100);
      const result = sanitizeCustomText(longText);
      expect(result).toHaveLength(50);
    });

    it('should handle empty input', () => {
      const result = sanitizeCustomText('');
      expect(result).toBe('');
    });
  });

  describe('validateRibbonDependencies', () => {
    const ribbonOption = mockCustomizationOptions[1];
    const ribbonColorOption = mockCustomizationOptions[2];
    const ribbonTextOption = mockCustomizationOptions[3];

    it('should pass when ribbon is not selected', () => {
      const customizations: Customization[] = [];
      const result = validateRibbonDependencies(
        customizations,
        ribbonOption,
        ribbonColorOption,
        ribbonTextOption,
        'cs'
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when ribbon is selected but color is missing', () => {
      const customizations: Customization[] = [
        { optionId: 'ribbon', choiceIds: ['ribbon_yes'] }
      ];
      const result = validateRibbonDependencies(
        customizations,
        ribbonOption,
        ribbonColorOption,
        ribbonTextOption,
        'cs'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Barva stuhy je povinná při výběru stuhy');
    });

    it('should fail when ribbon is selected but text is missing', () => {
      const customizations: Customization[] = [
        { optionId: 'ribbon', choiceIds: ['ribbon_yes'] },
        { optionId: 'ribbon_color', choiceIds: ['color_black'] }
      ];
      const result = validateRibbonDependencies(
        customizations,
        ribbonOption,
        ribbonColorOption,
        ribbonTextOption,
        'cs'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text stuhy je povinný při výběru stuhy');
    });

    it('should pass when ribbon is selected with all dependencies', () => {
      const customizations: Customization[] = [
        { optionId: 'ribbon', choiceIds: ['ribbon_yes'] },
        { optionId: 'ribbon_color', choiceIds: ['color_black'] },
        { optionId: 'ribbon_text', choiceIds: ['text_sympathy'] }
      ];
      const result = validateRibbonDependencies(
        customizations,
        ribbonOption,
        ribbonColorOption,
        ribbonTextOption,
        'cs'
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateWreathConfiguration', () => {
    it('should pass with valid complete configuration', () => {
      const customizations: Customization[] = [
        { optionId: 'ribbon', choiceIds: ['ribbon_yes'] },
        { optionId: 'ribbon_color', choiceIds: ['color_black'] },
        { optionId: 'ribbon_text', choiceIds: ['text_sympathy'] }
      ];

      const result = validateWreathConfiguration(
        customizations,
        mockCustomizationOptions,
        'size_120',
        { locale: 'cs' }
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.hasRibbonSelected).toBe(true);
    });

    it('should fail when size is missing', () => {
      const customizations: Customization[] = [];

      const result = validateWreathConfiguration(
        customizations,
        mockCustomizationOptions,
        null,
        { locale: 'cs' }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prosím vyberte velikost věnce před přidáním do košíku');
    });

    it('should fail with incomplete ribbon configuration', () => {
      const customizations: Customization[] = [
        { optionId: 'ribbon', choiceIds: ['ribbon_yes'] }
        // Missing color and text
      ];

      const result = validateWreathConfiguration(
        customizations,
        mockCustomizationOptions,
        'size_120',
        { locale: 'cs' }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.hasRibbonSelected).toBe(true);
    });

    it('should validate custom text when provided', () => {
      const customizations: Customization[] = [
        { optionId: 'ribbon', choiceIds: ['ribbon_yes'] },
        { optionId: 'ribbon_color', choiceIds: ['color_black'] },
        { optionId: 'ribbon_text', choiceIds: ['text_custom'], customValue: 'A'.repeat(51) }
      ];

      const result = validateWreathConfiguration(
        customizations,
        mockCustomizationOptions,
        'size_120',
        { locale: 'cs' }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Vlastní text může mít maximálně 50 znaků');
    });

    it('should work in strict mode', () => {
      const customizations: Customization[] = [
        { optionId: 'ribbon', choiceIds: ['ribbon_yes'] },
        { optionId: 'ribbon_color', choiceIds: ['color_black'] },
        { optionId: 'ribbon_text', choiceIds: ['text_custom'], customValue: 'A'.repeat(45) }
      ];

      const result = validateWreathConfiguration(
        customizations,
        mockCustomizationOptions,
        'size_120',
        { locale: 'cs', strictMode: true }
      );

      expect(result.isValid).toBe(false); // Warnings become errors in strict mode
      expect(result.errors).toContain('Text se blíží maximální délce');
    });
  });

  describe('getValidationMessage', () => {
    it('should return Czech message by default', () => {
      const message = getValidationMessage('sizeRequired', 'cs');
      expect(message).toBe(WREATH_VALIDATION_MESSAGES.cs.sizeRequired);
    });

    it('should return English message when specified', () => {
      const message = getValidationMessage('sizeRequired', 'en');
      expect(message).toBe(WREATH_VALIDATION_MESSAGES.en.sizeRequired);
    });

    it('should fallback to Czech for unknown locale', () => {
      const message = getValidationMessage('sizeRequired', 'unknown');
      expect(message).toBe(WREATH_VALIDATION_MESSAGES.cs.sizeRequired);
    });

    it('should replace parameters in message', () => {
      const message = getValidationMessage('minSelections', 'cs', { min: 2 });
      expect(message).toContain('2');
    });

    it('should return key if message not found', () => {
      const message = getValidationMessage('nonexistent' as any, 'cs');
      expect(message).toBe('nonexistent');
    });
  });
});
