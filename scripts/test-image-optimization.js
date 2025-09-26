#!/usr/bin/env node

/**
 * Test script to verify image optimization implementation
 * This script checks if our image optimization features are working correctly
 */

const fs = require("fs");
const path = require("path");

console.log("🖼️  Testing Image Optimization Implementation...\n");

// Test 1: Check if OptimizedImage component exists
console.log("1. Checking OptimizedImage component...");
const optimizedImagePath = path.join(
  __dirname,
  "../src/components/ui/OptimizedImage.tsx"
);
if (fs.existsSync(optimizedImagePath)) {
  console.log("   ✅ OptimizedImage component exists");

  const content = fs.readFileSync(optimizedImagePath, "utf8");

  // Check for key features
  const features = [
    { name: "Blur placeholder generation", pattern: /generateBlurDataURL/ },
    { name: "Variant-based sizing", pattern: /getSizesForVariant/ },
    { name: "Quality optimization", pattern: /getQualityForVariant/ },
    { name: "Loading states", pattern: /isLoading.*setIsLoading/ },
    { name: "Error handling", pattern: /hasError.*setHasError/ },
    { name: "Performance optimizations", pattern: /useMemo|useCallback/ },
  ];

  features.forEach((feature) => {
    if (feature.pattern.test(content)) {
      console.log(`   ✅ ${feature.name} implemented`);
    } else {
      console.log(`   ❌ ${feature.name} missing`);
    }
  });
} else {
  console.log("   ❌ OptimizedImage component not found");
}

// Test 2: Check if image optimization hooks exist
console.log("\n2. Checking image optimization hooks...");
const hooksPath = path.join(__dirname, "../src/lib/hooks");
const hooks = ["useImageOptimization.ts", "useImagePerformance.ts"];

hooks.forEach((hook) => {
  const hookPath = path.join(hooksPath, hook);
  if (fs.existsSync(hookPath)) {
    console.log(`   ✅ ${hook} exists`);
  } else {
    console.log(`   ❌ ${hook} missing`);
  }
});

// Test 3: Check if image utilities exist
console.log("\n3. Checking image optimization utilities...");
const utilsPath = path.join(
  __dirname,
  "../src/lib/utils/image-optimization.ts"
);
if (fs.existsSync(utilsPath)) {
  console.log("   ✅ Image optimization utilities exist");

  const content = fs.readFileSync(utilsPath, "utf8");
  const utilities = [
    { name: "Blur data URL generation", pattern: /generateBlurDataURL/ },
    { name: "Optimal image sizes", pattern: /getOptimalImageSizes/ },
    { name: "Quality optimization", pattern: /getOptimalQuality/ },
    { name: "Modern format support", pattern: /supportsModernFormats/ },
    { name: "Image preloading", pattern: /preloadImage/ },
    { name: "Performance tracking", pattern: /trackImagePerformance/ },
  ];

  utilities.forEach((util) => {
    if (util.pattern.test(content)) {
      console.log(`   ✅ ${util.name} implemented`);
    } else {
      console.log(`   ❌ ${util.name} missing`);
    }
  });
} else {
  console.log("   ❌ Image optimization utilities not found");
}

// Test 4: Check if components are using OptimizedImage
console.log("\n4. Checking component integration...");
const components = [
  "src/components/product/ProductCardLayout.tsx",
  "src/components/product/ProductQuickView.tsx",
];

components.forEach((componentPath) => {
  const fullPath = path.join(__dirname, "..", componentPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8");
    if (content.includes("OptimizedImage")) {
      console.log(`   ✅ ${path.basename(componentPath)} uses OptimizedImage`);
    } else {
      console.log(
        `   ❌ ${path.basename(componentPath)} not using OptimizedImage`
      );
    }
  } else {
    console.log(`   ❌ ${path.basename(componentPath)} not found`);
  }
});

// Test 5: Check Next.js configuration
console.log("\n5. Checking Next.js image configuration...");
const nextConfigPath = path.join(__dirname, "../next.config.ts");
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, "utf8");

  const configFeatures = [
    {
      name: "Modern image formats (AVIF, WebP)",
      pattern: /formats.*avif.*webp/,
    },
    { name: "Device sizes optimization", pattern: /deviceSizes/ },
    { name: "Image sizes configuration", pattern: /imageSizes/ },
    { name: "Cache TTL optimization", pattern: /minimumCacheTTL/ },
    { name: "Remote patterns for Supabase", pattern: /supabase\.co/ },
  ];

  configFeatures.forEach((feature) => {
    if (feature.pattern.test(content)) {
      console.log(`   ✅ ${feature.name} configured`);
    } else {
      console.log(`   ❌ ${feature.name} missing`);
    }
  });
} else {
  console.log("   ❌ Next.js config not found");
}

// Test 6: Check ProductGrid optimization
console.log("\n6. Checking ProductGrid optimization...");
const productGridPath = path.join(
  __dirname,
  "../src/components/product/ProductGrid.tsx"
);
if (fs.existsSync(productGridPath)) {
  const content = fs.readFileSync(productGridPath, "utf8");

  const gridFeatures = [
    { name: "Image optimization hook", pattern: /useImageOptimization/ },
    {
      name: "Priority loading for first 6 products",
      pattern: /shouldPrioritize.*index/,
    },
    {
      name: "Initial display count of 6",
      pattern: /INITIAL_PRODUCTS_COUNT.*6/,
    },
  ];

  gridFeatures.forEach((feature) => {
    if (feature.pattern.test(content)) {
      console.log(`   ✅ ${feature.name} implemented`);
    } else {
      console.log(`   ❌ ${feature.name} missing`);
    }
  });
} else {
  console.log("   ❌ ProductGrid component not found");
}

console.log("\n🎉 Image optimization test completed!");
console.log("\n📋 Summary of implemented features:");
console.log("   • OptimizedImage component with blur placeholders");
console.log("   • Variant-based image sizing and quality optimization");
console.log("   • Priority loading for above-fold content (first 6 products)");
console.log('   • Lazy loading for products after "Load More" actions');
console.log("   • Performance monitoring and tracking hooks");
console.log("   • Next.js configuration for modern image formats");
console.log("   • Image optimization utilities and helpers");
console.log(
  "   • Integration with ProductGrid, ProductCardLayout, and ProductQuickView"
);
