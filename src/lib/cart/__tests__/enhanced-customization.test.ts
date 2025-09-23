import { describe, it, expect } from '@jest/globals';
import {
  formatCustomizationForDisplay,
  validateConditionalCustomizations,
  calculateCustomizationPriceModifier
} from '../utils';
import type { Customization, CustomizationOption } from '@/types/product';

describe('Enhanced Cart Customization Utils', () => {
  const mockCustomizationOptions: CustomizationOption[] = [
    {
      id: 'size',
      type: 'size',
      name: { cs: 'Velikost', en: 'Size' },
      choices: [
        {
          id: 'size_120',
          value: '120cm',
          label: { cs: '120 cm', en: '120 cm' },
          priceModifier: 0,
          available: true
        },
        {
          id: 'size_150',
          value: '150cm',
          label: {
            cs: '150 cm', en: '150
ceModifier: 500,
            available: true
          }
      ],
      required: true
    },
    {
      id: 'ribbon',
      type: 'ribbon',
      name: { cs: 'Stuha', en: 'Ribbon' },
      choices: [
        {
          id: 'ribbon_yes',
          value: 'yes',
          label: { cs: 'Ano', en: 'Yes' },
          priceModifier: 200,
          available: true
        }
      ],
      required: false
    },
    {
      id: 'ribbon_text',
      type: 'text',
      name: { cs: 'Text na stuze', en: 'Ribbon Text' },
      choices: [
        {
          id: 'text_custom',
          value: 'custom',
          label: { cs: 'Vlastní text', en: 'Custom Text' },
          priceModifier: 0,
          available: true,
          allowCustomInput: true
        }
      ],
      required: false,
      dependsOn: {
        optionId: 'ribbon',
        requiredChoiceIds: ['ribbon_yes']
      }
    }
  ];

  describe('formatCustomizationForDisplay', () => {
    it('should format choice-based customization correctly', () => {
      const customization: Customization = {
        optionId: 'size',
        choiceIds: ['size_150'],
        priceModifier: 500
      };

      const result = formatCustomizationForDisplay(customization, mockCustomizationOptions, 'en');
      expect(result).toBe('Size: 150 cm');
    });

    it('should format custom text customization correctly', () => {
      const customization: Customization = {
        optionId: 'ribbon_text',
        choiceIds: ['text_custom'],
        customValue: 'In loving memory',
        priceModifier: 0
      };

      const result = formatCustomizationForDisplay(customization, mockCustomizationOptions, 'en');
      expect(result).toBe('Ribbon Text: In loving memory');
    });

    it('should handle multiple choices', () => {
      const customization: Customization = {
        optionId: 'size',
        choiceIds: ['size_120', 'size_150'],
        priceModifier: 500
      };

      const result = formatCustomizationForDisplay(customization, mockCustomizationOptions, 'en');
      expect(result).toBe('Size: 120 cm, 150 cm');
    });

    it('should return null for unknown option', () => {
      const customization: Customization = {
        optionId: 'unknown',
        choiceIds: ['unknown_choice'],
        priceModifier: 0
      };

      const result = formatCustomizationForDisplay(customization, mockCustomizationOptions, 'en');
      expect(result).toBeNull();
    });
  });

  describe('validateConditionalCustomizations', () => {
    it('should validate conditional customizations correctly', () => {
      const customizations: Customization[] = [
        {
          optionId: 'ribbon',
          choiceIds: ['ribbon_yes'],
          priceModifier: 200
        },
        {
          optionId: 'ribbon_text',
          choiceIds: ['text_custom'],
          customValue: 'Custom text',
          priceModifier: 0
        }
      ];

      const result = validateConditionalCustomizations(customizations, mockCustomizationOptions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing dependency', () => {
      const customizations: Customization[] = [
        {
          optionId: 'ribbon_text',
          choiceIds: ['text_custom'],
          customValue: 'Custom text',
          priceModifier: 0
        }
      ];

      const result = validateConditionalCustomizations(customizations, mockCustomizationOptions);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required dependency for ribbon_text');
    });

    it('should detect invalid dependency configuration', () => {
      const customizations: Customization[] = [
        {
          optionId: 'ribbon',
          choiceIds: ['ribbon_no'], // Wrong choice
          priceModifier: 0
        },
        {
          optionId: 'ribbon_text',
          choiceIds: ['text_custom'],
          customValue: 'Custom text',
          priceModifier: 0
        }
      ];

      const result = validateConditionalCustomizations(customizations, mockCustomizationOptions);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid dependency configuration for ribbon_text');
    });
  });

  describe('calculateCustomizationPriceModifier', () => {
    it('should calculate total price modifier correctly', () => {
      const customizations: Customization[] = [
        {
          optionId: 'size',
          choiceIds: ['size_150'],
          priceModifier: 500
        },
        {
          optionId: 'ribbon',
          choiceIds: ['ribbon_yes'],
          priceModifier: 200
        }
      ];

      const result = calculateCustomizationPriceModifier(customizations);
      expect(result).toBe(700);
    });

    it('should handle customizations without price modifiers', () => {
      const customizations: Customization[] = [
        {
          optionId: 'ribbon_text',
          choiceIds: ['text_custom'],
          customValue: 'Custom text'
        }
      ];

      const result = calculateCustomizationPriceModifier(customizations);
      expect(result).toBe(0);
    });

    it('should handle empty customizations array', () => {
      const result = calculateCustomizationPriceModifier([]);
      expect(result).toBe(0);
    });
  });
});
