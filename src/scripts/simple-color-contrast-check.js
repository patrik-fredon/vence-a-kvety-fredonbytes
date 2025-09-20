#!/usr/bin/env node

/**
 * Simple color contrast validation for WCAG 2.1 AA compliance
 */

// Color contrast calculation functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

function meetsWCAGAA(foreground, background, isLargeText = false) {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// Test color combinations
const colorCombinations = [
  // Primary text combinations
  { name: 'Stone 900 on White', fg: '#1c1917', bg: '#ffffff', context: 'Primary text' },
  { name: 'Stone 800 on White', fg: '#292524', bg: '#ffffff', context: 'Secondary text' },
  { name: 'Stone 700 on White', fg: '#44403c', bg: '#ffffff', context: 'Tertiary text' },
  { name: 'Stone 600 on White', fg: '#57534e', bg: '#ffffff', context: 'Muted text' },

  // Button combinations
  { name: 'White on Stone 900', fg: '#ffffff', bg: '#1c1917', context: 'Primary button' },
  { name: 'Stone 900 on Stone 100', fg: '#1c1917', bg: '#f5f5f4', context: 'Secondary button' },

  // Accent combinations
  { name: 'Amber 600 on White', fg: '#d97706', bg: '#ffffff', context: 'Accent text' },
  { name: 'White on Amber 600', fg: '#ffffff', bg: '#d97706', context: 'Accent button' },

  // Error combinations
  { name: 'Red 600 on White', fg: '#dc2626', bg: '#ffffff', context: 'Error text' },
  { name: 'Red 600 on Red 50', fg: '#dc2626', bg: '#fef2f2', context: 'Error background' },
];

console.log('🎨 Color Contrast Validation for WCAG 2.1 AA Compliance\n');
console.log('=' .repeat(60));

let passCount = 0;
let failCount = 0;

colorCombinations.forEach(({ name, fg, bg, context }) => {
  const ratio = getContrastRatio(fg, bg);
  const meetsAA = meetsWCAGAA(fg, bg);

  console.log(`\n📋 ${name}`);
  console.log(`   Context: ${context}`);
  console.log(`   Foreground: ${fg}`);
  console.log(`   Background: ${bg}`);
  console.log(`   Contrast Ratio: ${ratio.toFixed(2)}:1`);

  if (meetsAA) {
    console.log(`   ✅ WCAG AA: PASS`);
    passCount++;
  } else {
    console.log(`   ❌ WCAG AA: FAIL (minimum 4.5:1 required)`);
    failCount++;
  }
});

// Summary
console.log('\n' + '=' .repeat(60));
console.log('📊 SUMMARY');
console.log('=' .repeat(60));
console.log(`✅ Compliant combinations: ${passCount}`);
console.log(`❌ Non-compliant combinations: ${failCount}`);
console.log(`📈 Overall compliance rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

console.log('\n🎯 RECOMMENDATIONS:');
console.log('   • All text content should meet WCAG AA (4.5:1) minimum');
console.log('   • Large text (18pt+ or 14pt+ bold) can use 3:1 ratio');
console.log('   • Interactive elements should have clear focus indicators');
console.log('   • Consider WCAG AAA (7:1) for better accessibility');

// Exit with appropriate code
if (failCount > 0) {
  console.log('\n❌ Color contrast validation found issues!');
  process.exit(1);
} else {
  console.log('\n✅ All color combinations meet WCAG 2.1 AA requirements!');
  process.exit(0);
}
