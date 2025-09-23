/**
 * Test for comprehensive validation error handling
 */

import { validateWreathConfiguration, WREATH_VALIDATION_MESSAGES } from '../wreath';
import type { Customization, CustomizationOption } from '@/types/product';

// Mock customization options for testing
const mockSizeOption: CustomizationOption = {
  id: 'size',
  type: 'size',
  name: { cs: 'Velikost', en: 'Size' },
  required: true,
  choices: [
    {
      id: 'size_120',
      value: '120cm',
      label: { cs: '120cm průměr', en: '120cm diameter' },
      priceModifier: 0,
      available: true
    },
    {
      id: 'size_150',
      value: '150cm',
      label: { cs: '150cm průměr', en: '150cm diameter' },
      priceModifier: 500,
      available: true
    }
  ]
};

const mockRibbonOption: CustomizationOption = {
  id: 'ribbon',
  type: 'ribbon',
  name: { cs: 'Stuha', en: 'Ribbon' },
  required: false,
  choices: [
    {
      id: 'ribbon_yes',
      value: 'yes',
      label: { cs: 'Ano, přidat stuhu', en: 'Yes, add ribbon' },
      priceModifier: 0,
      available: true
    }
  ]
};

describe('Validation Error Handling', () => {
  it('should provide user-friendly error messages in Czech', () => {
    const customizations: Customization[] = [];
    const customizationOptions = [mockSizeOption];
    const selectedSize = null;

    const result = validateWreathConfiguration(
      customizations,
      customizationOptions,
      selectedSize,
      { locale: 'cs' }
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.cs.sizeRequired);
  });

  it('should provide user-friendly error messages in English', () => {
    const customizations: Customization[] = [];
    const customizationOptions = [mockSizeOption];
    const selectedSize = null;

    const result = validateWreathConfiguration(
      customizations,
      customizationOptions,
      selectedSize,
      { locale: 'en' }
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(WREATH_VALIDATION_MESSAGES.en.sizeRequired);
  });

  it('should validate ribbon dependencies correctly', () => {
    const customizations: Customization[] = [
      {
        optionId: 'ribbon',
        choiceIds: ['ribbon_yes']
      }
    ];
    const customizationOptions = [mockSizeOption, mockRibbonOption];
    const selectedSize = 'size_120';

    const result = validateWreathConfiguration(
      customizations,
      customizationOptions,
      selectedSize,
      { locale: 'cs' }
    );

    // Should pass basic validation but may have warnings about ribbon configuration
    expect(result.isValid).toBe(true);
  });

  it('should handle network error messages', () => {
    const messages = WREATH_VALIDATION_MESSAGES.cs;

    expect(messages.networkError).toBe('Chyba připojení, zkontrolujte internetové připojení');
    expect(messages.sessionExpired).toBe('Relace vypršela, obnovte prosím stránku');
    expect(messages.tryAgain).toBe('Zkusit znovu');
  });

  it('should handle network error messages in English', () => {
    const messages = WREATH_VALIDATION_MESSAGES.en;

    expect(messages.networkError).toBe('Connection error, please check your internet connection');
    expect(messages.sessionExpired).toBe('Session expired, please refresh the page');
    expect(messages.tryAgain).toBe('Try again');
  });
});
