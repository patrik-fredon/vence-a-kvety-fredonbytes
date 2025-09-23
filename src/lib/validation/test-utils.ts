import { validateWreathConfiguration } from './wreath';
import type { Customization, CustomizationOption } from '@/types/product';

// Test utility for manual validation testing
export function testWreathValidation() {
  console.log('🧪 Testing Wreath Validation System...');

  // Mock customization options
  const mockOptions: CustomizationOption[] = [
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
          id: 'text_custom',
          label: { cs: 'Vlastní text', en: 'Custom text' },
          priceModifier: 100,
          available: true
        }
      ]
    }
  ];

  // Test Case 1: Missing size (should fail)
  console.log('\n📋 Test 1: Missing size validation');
  const test1 = validateWreathConfiguration([], mockOptions, null, { locale: 'cs' });
  console.log('Result:', test1.isValid ? '✅ PASS' : '❌ FAIL');
  console.log('Errors:', test1.errors);

  // Test Case 2: Valid size only (should pass)
  console.log('\n📋 Test 2: Valid size only');
  const test2 = validateWreathConfiguration([], mockOptions, 'size_120', { locale: 'cs' });
  console.log('Result:', test2.isValid ? '✅ PASS' : '❌ FAIL');
  console.log('Errors:', test2.errors);

  // Test Case 3: Ribbon selected but missing dependencies (should fail)
  console.log('\n📋 Test 3: Ribbon without dependencies');
  const customizations3: Customization[] = [
    { optionId: 'ribbon', choiceIds: ['ribbon_yes'] }
  ];
  const test3 = validateWreathConfiguration(customizations3, mockOptions, 'size_120', { locale: 'cs' });
  console.log('Result:', test3.isValid ? '✅ PASS' : '❌ FAIL');
  console.log('Errors:', test3.errors);

  // Test Case 4: Complete valid configuration (should pass)
  console.log('\n📋 Test 4: Complete valid configuration');
  const customizations4: Customization[] = [
    { optionId: 'ribbon', choiceIds: ['ribbon_yes'] },
    { optionId: 'ribbon_color', choiceIds: ['color_black'] },
    { optionId: 'ribbon_text', choiceIds: ['text_custom'], customValue: 'S láskou vzpomínáme' }
  ];
  const test4 = validateWreathConfiguration(customizations4, mockOptions, 'size_120', { locale: 'cs' });
  console.log('Result:', test4.isValid ? '✅ PASS' : '❌ FAIL');
  console.log('Errors:', test4.errors);
  console.log('Warnings:', test4.warnings);

  // Test Case 5: Custom text too long (should fail)
  console.log('\n📋 Test 5: Custom text too long');
  const customizations5: Customization[] = [
    { optionId: 'ribbon', choiceIds: ['ribbon_yes'] },
    { optionId: 'ribbon_color', choiceIds: ['color_black'] },
    { optionId: 'ribbon_text', choiceIds: ['text_custom'], customValue: 'A'.repeat(51) }
  ];
  const test5 = validateWreathConfiguration(customizations5, mockOptions, 'size_120', { locale: 'cs' });
  console.log('Result:', test5.isValid ? '✅ PASS' : '❌ FAIL');
  console.log('Errors:', test5.errors);

  console.log('\n🎉 Validation testing complete!');
}

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).testWreathValidation = testWreathValidation;
}
