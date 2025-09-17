// Simple test script to verify SEO implementation
const { validatePageMetadata, validateStructuredData } = require("./src/lib/seo/validation.ts");

// Test metadata validation
const testMetadata = {
  title: "Pohřební věnce | Ketingmar s.r.o.",
  description: "Prémiové pohřební věnce a květinové aranžmá. Ruční výroba, rychlé dodání.",
  keywords: ["pohřební věnce", "květinové aranžmá"],
  url: "https://pohrebni-vence.cz/cs",
  image: "/og-image.jpg",
};

// Test structured data
const testStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Test Wreath",
  description: "Beautiful funeral wreath",
  offers: {
    "@type": "Offer",
    price: "1500",
    priceCurrency: "CZK",
  },
};

console.log("SEO Implementation Test Results:");
console.log("================================");

try {
  const metadataResult = validatePageMetadata(testMetadata);
  console.log("Metadata Validation:", metadataResult.isValid ? "PASS" : "FAIL");
  console.log("Score:", metadataResult.score);
  if (metadataResult.errors.length > 0) {
    console.log("Errors:", metadataResult.errors);
  }

  const structuredDataResult = validateStructuredData(testStructuredData);
  console.log("Structured Data Validation:", structuredDataResult.isValid ? "PASS" : "FAIL");
  console.log("Score:", structuredDataResult.score);
  if (structuredDataResult.errors.length > 0) {
    console.log("Errors:", structuredDataResult.errors);
  }

  console.log("\n✅ SEO implementation test completed successfully!");
} catch (error) {
  console.error("❌ Test failed:", error.message);
}
