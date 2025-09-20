#!/usr/bin/env node

/**
 * Color contrast validation script for WCAG 2.1 AA compliance
 * Validates all color combinations used in the design system
 */

const { ColorContrast, validateDesignSystemColors } = require('../lib/accessibility/validation');

// Design system colors from Tailwind config
const colors = {
  // Stone palette (primary neutral colors)
  stone: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917'
  },
  // Amber palette (accent colors)
  amber: {
    200: '#fde68a',
    600: '#d97706',
    700: '#b45309'
  },
  // Semantic colors
  white: '#ffffff',
  black: '#000000',
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626'
  }
};

// Common color combinations used in the design
const colorCombinations = [
  // Primary text combinations
  { name: 'Stone 900 on White', fg: colors.stone[900], bg: colors.white, context: 'Primary text' },
  { name: 'Stone 800 on White', fg: colors.stone[800], bg: colors.white, context: 'Secondary text' },
  { name: 'Stone 700 on White', fg: colors.stone[700], bg: colors.white, context: 'Tertiary text' },
  { name: 'Stone 600 on White', fg: colors.stone[600], bg: colors.white, context: 'Muted text' },

  // Button combinations
  { name: 'White on Stone 900', fg: colors.white, bg: colors.stone[900], context: 'Primary button' },
  { name: 'Stone 900 on Stone 100', fg: colors.stone[900], bg: colors.stone[100], context: 'Secondary button' },
  { name: 'Stone 700 on White', fg: colors.stone[700], bg: colors.white, context: 'Ghost button' },

  // Accent combinations
  { name: 'Amber 600 on White', fg: colors.amber[600], bg: colors.white, context: 'Accent text' },
  { name: 'White on Amber 600', fg: colors.white, bg: colors.amber[600], context: 'Accent button' },

  // Error combinations
  { name: 'Error 600 on White', fg: colors.error[600], bg: colors.white, context: 'Error text' },
  { name: 'Error 600 on Error 50', fg: colors.error[600], bg: colors.error[50], context: 'Error background' },

  // Border and subtle combinations
  { name: 'Stone 300 on White', fg: colors.stone[300], bg: colors.white, context: 'Border color (decorative)' },
  { name: 'Stone 200 on White', fg: colors.stone[200], bg: colors.white, context: 'Subtle border (decorative)' },

  // High contrast mode combinations
  { name: 'Black on White (High Contrast)', fg: colors.black, bg: colors.white, context: 'High contrast text' },
  { name: 'White on Black (High Contrast)', fg: colors.white, bg: colors.black, context: 'High contrast button' }
];

function validateColorContrast() {
  console.log('🎨 Validating Color Contrast for WCAG 2.1 AA Compliance\n');
  console.log('=' .repeat(60));

  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;

  const results = {
    compliant: [],
    nonCompliant: [],
    warnings: []
  };

  colorCombinations.forEach(({ name, fg, bg, context }) => {
    const ratio = ColorContrast.getContrastRatio(fg, bg);
    const meetsAA = ColorContrast.meetsWCAGAA(fg, bg);
    const meetsAAA = ColorContrast.meetsWCAGAAA(fg, bg);

    console.log(`\n📋 ${name}`);
    console.log(`   Context: ${context}`);
    console.log(`   Foreground: ${fg}`);
    console.log(`   Background: ${bg}`);
    console.log(`   Contrast Ratio: ${ratio.toFixed(2)}:1`);

    if (meetsAA) {
      console.log(`   ✅ WCAG AA: PASS`);
      if (meetsAAA) {
        console.log(`   🌟 WCAG AAA: PASS`);
      } else {
        console.log(`   ⚠️  WCAG AAA: FAIL`);
      }

      results.compliant.push({ name, ratio, context, meetsAAA });
      passCount++;
    } else {
      console.log(`   ❌ WCAG AA: FAIL (minimum 4.5:1 required)`);
      console.log(`   ❌ WCAG AAA: FAIL`);

      results.nonCompliant.push({ name, ratio, context, required: 4.5 });
      failCount++;
    }

    // Special warnings for decorative elements
    if (context.includes('decorative') && ratio < 3) {
      console.log(`   ⚠️  Warning: Very low contrast for decorative element`);
      results.warnings.push({ name, ratio, context, issue: 'Very low contrast for decorative element' });
      warningCount++;
    }
  });

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Compliant combinations: ${passCount}`);
  console.log(`❌ Non-compliant combinations: ${failCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`📈 Overall compliance rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

  if (failCount > 0) {
    console.log('\n🚨 NON-COMPLIANT COMBINATIONS:');
    results.nonCompliant.forEach(({ name, ratio, context, required }) => {
      console.log(`   • ${name}: ${ratio.toFixed(2)}:1 (needs ${required}:1)`);
      console.log(`     Context: ${context}`);
    });
  }

  if (warningCount > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(({ name, ratio, context, issue }) => {
      console.log(`   • ${name}: ${ratio.toFixed(2)}:1`);
      console.log(`     Issue: ${issue}`);
      console.log(`     Context: ${context}`);
    });
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('   • All text content should meet WCAG AA (4.5:1) minimum');
  console.log('   • Large text (18pt+ or 14pt+ bold) can use 3:1 ratio');
  console.log('   • Decorative elements don\'t need to meet contrast requirements');
  console.log('   • Interactive elements should have clear focus indicators');
  console.log('   • Consider WCAG AAA (7:1) for better accessibility');

  // Exit with error code if there are failures
  if (failCount > 0) {
    console.log('\n❌ Color contrast validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All color combinations meet WCAG 2.1 AA requirements!');
    process.exit(0);
  }
}

// Additional function to test specific color combinations
function testCustomColors() {
  console.log('\n🧪 Testing Custom Color Combinations\n');

  // Test funeral-appropriate colors
  const funeralColors = [
    { name: 'Deep Green on Cream', fg: '#2D5016', bg: '#F9F7F4' },
    { name: 'Sage Green on White', fg: '#6F7752', bg: '#FFFFFF' },
    { name: 'Gold Accent on White', fg: '#D4AF37', bg: '#FFFFFF' },
    { name: 'Charcoal on Light Gray', fg: '#2C2C2C', bg: '#F5F5F5' }
  ];

  funeralColors.forEach(({ name, fg, bg }) => {
    const ratio = ColorContrast.getContrastRatio(fg, bg);
    const meetsAA = ColorContrast.meetsWCAGAA(fg, bg);

    console.log(`${name}: ${ratio.toFixed(2)}:1 ${meetsAA ? '✅' : '❌'}`);
  });
}

// Run validation
if (require.main === module) {
  validateColorContrast();
  testCustomColors();
}

module.exports = {
  validateColorContrast,
  testCustomColors,
  colorCombinations,
  colors
};
