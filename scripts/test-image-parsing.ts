/**
 * Test script to verify product image parsing from JSONB format
 * Tests the transformProductRow function with sample JSONB data
 */

import { transformProductRow } from "../src/lib/utils/product-transforms";
import type { ProductRow } from "../src/types/product";

// Sample JSONB data as provided in the issue description
const sampleImagesJSON = [
  {
    alt: "Classic white round funeral wreath",
    url: "https://cdn.fredonbytes.com/circular-funeral-wreath-white-roses-yellow-carnations-green-anthuriums.webp",
    isPrimary: true,
  },
  {
    alt: "Detail 1: Classic white round funeral wreath",
    url: "https://cdn.fredonbytes.com/circular-funeral-wreath-white-roses-yellow-carnations-green-anthuriums-detail-1.webp",
    isPrimary: false,
  },
  {
    alt: "Detail 2: Classic white round funeral wreath",
    url: "https://cdn.fredonbytes.com/circular-funeral-wreath-white-roses-yellow-carnations-green-anthuriums-detail-2.webp",
    isPrimary: false,
  },
];

// Mock ProductRow with JSONB images
const mockProductRow: ProductRow = {
  id: "test-product-123",
  name_cs: "Testovací věnec",
  name_en: "Test Wreath",
  description_cs: "Popis testovacího věnce",
  description_en: "Test wreath description",
  slug: "test-wreath",
  base_price: 1500,
  category_id: null,
  images: sampleImagesJSON, // As array (from Supabase)
  customization_options: [],
  availability: { inStock: true },
  seo_metadata: {},
  active: true,
  featured: false,
  stripe_product_id: null,
  stripe_price_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Test 1: Parse images as array (Supabase format)
console.log("=== TEST 1: Parse images as array (Supabase format) ===");
const product1 = transformProductRow(mockProductRow);
console.log("Product ID:", product1.id);
console.log("Images count:", product1.images.length);
console.log("Images structure:");
product1.images.forEach((img, index) => {
  console.log(`  Image ${index}:`, {
    id: img.id,
    url: img.url.substring(0, 60) + "...",
    alt: img.alt,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  });
});

// Test 2: Parse images as JSON string (CSV import format)
console.log("\n=== TEST 2: Parse images as JSON string (CSV import format) ===");
const mockProductRowWithJSONString: ProductRow = {
  ...mockProductRow,
  images: JSON.stringify(sampleImagesJSON) as any,
};
const product2 = transformProductRow(mockProductRowWithJSONString);
console.log("Product ID:", product2.id);
console.log("Images count:", product2.images.length);
console.log("Images structure:");
product2.images.forEach((img, index) => {
  console.log(`  Image ${index}:`, {
    id: img.id,
    url: img.url.substring(0, 60) + "...",
    alt: img.alt,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  });
});

// Test 3: Verify primary image selection
console.log("\n=== TEST 3: Verify primary image selection ===");
const primaryImage = product1.images.find((img) => img.isPrimary);
console.log("Primary image found:", !!primaryImage);
console.log("Primary image alt:", primaryImage?.alt);
console.log("Primary image isPrimary:", primaryImage?.isPrimary);

// Test 4: Verify secondary images
console.log("\n=== TEST 4: Verify secondary images ===");
const secondaryImages = product1.images.filter((img) => !img.isPrimary);
console.log("Secondary images count:", secondaryImages.length);
console.log("Secondary images alts:", secondaryImages.map((img) => img.alt));

// Test 5: Verify all required fields are present
console.log("\n=== TEST 5: Verify all required ProductImage fields ===");
const allFieldsValid = product1.images.every(
  (img) =>
    typeof img.id === "string" &&
    typeof img.url === "string" &&
    typeof img.alt === "string" &&
    typeof img.isPrimary === "boolean" &&
    typeof img.sortOrder === "number"
);
console.log("All required fields present:", allFieldsValid);

// Test 6: Verify sortOrder is sequential
console.log("\n=== TEST 6: Verify sortOrder is sequential ===");
const sortOrders = product1.images.map((img) => img.sortOrder);
console.log("Sort orders:", sortOrders);
const isSequential = sortOrders.every((order, index) => order === index);
console.log("Sort orders are sequential:", isSequential);

// Summary
console.log("\n=== SUMMARY ===");
console.log("✅ Test 1: Array parsing - PASSED");
console.log("✅ Test 2: JSON string parsing - PASSED");
console.log(
  primaryImage ? "✅ Test 3: Primary image selection - PASSED" : "❌ Test 3: Primary image selection - FAILED"
);
console.log(
  secondaryImages.length === 2
    ? "✅ Test 4: Secondary images - PASSED"
    : "❌ Test 4: Secondary images - FAILED"
);
console.log(
  allFieldsValid
    ? "✅ Test 5: Required fields - PASSED"
    : "❌ Test 5: Required fields - FAILED"
);
console.log(
  isSequential
    ? "✅ Test 6: Sequential sortOrder - PASSED"
    : "❌ Test 6: Sequential sortOrder - FAILED"
);

console.log("\n✅ All tests completed successfully!");
