/**
 * Tests for product API functionality
 * Note: These are unit tests for the transform functions and validation logic
 */

import {
  createSlug,
  getLocalizedContent,
  transformCategoryRow,
  transformProductRow,
  validateCategoryData,
  validateProductData,
} from "@/lib/utils/product-transforms";
import type { CategoryRow, ProductRow } from "@/types/product";

describe("Product Transform Functions", () => {
  const mockCategoryRow: CategoryRow = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name_cs: "Pohřební věnce",
    name_en: "Funeral Wreaths",
    slug: "funeral-wreaths",
    description_cs: "Tradiční pohřební věnce",
    description_en: "Traditional funeral wreaths",
    image_url: "https://example.com/image.jpg",
    parent_id: null,
    sort_order: 1,
    active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockProductRow: ProductRow = {
    id: "123e4567-e89b-12d3-a456-426614174001",
    name_cs: "Klasický věnec",
    name_en: "Classic Wreath",
    slug: "classic-wreath",
    description_cs: "Krásný klasický pohřební věnec",
    description_en: "Beautiful classic funeral wreath",
    base_price: 1500,
    category_id: "123e4567-e89b-12d3-a456-426614174000",
    images: [],
    customization_options: [],
    availability: { inStock: true },
    seo_metadata: {
      title: { cs: "Klasický věnec", en: "Classic Wreath" },
      description: { cs: "Krásný klasický pohřební věnec", en: "Beautiful classic funeral wreath" },
    },
    active: true,
    featured: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  describe("transformCategoryRow", () => {
    it("should transform category row correctly", () => {
      const category = transformCategoryRow(mockCategoryRow);

      expect(category.id).toBe(mockCategoryRow.id);
      expect(category.nameCs).toBe(mockCategoryRow.name_cs);
      expect(category.nameEn).toBe(mockCategoryRow.name_en);
      expect(category.slug).toBe(mockCategoryRow.slug);
      expect(category.name.cs).toBe(mockCategoryRow.name_cs);
      expect(category.name.en).toBe(mockCategoryRow.name_en);
      expect(category.description?.cs).toBe(mockCategoryRow.description_cs);
      expect(category.description?.en).toBe(mockCategoryRow.description_en);
      expect(category.active).toBe(mockCategoryRow.active);
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    it("should handle missing descriptions", () => {
      const rowWithoutDescription = {
        ...mockCategoryRow,
        description_cs: null,
        description_en: null,
      };
      const category = transformCategoryRow(rowWithoutDescription);

      expect(category.description).toBeUndefined();
    });
  });

  describe("transformProductRow", () => {
    it("should transform product row correctly", () => {
      const category = transformCategoryRow(mockCategoryRow);
      const product = transformProductRow(mockProductRow, category);

      expect(product.id).toBe(mockProductRow.id);
      expect(product.nameCs).toBe(mockProductRow.name_cs);
      expect(product.nameEn).toBe(mockProductRow.name_en);
      expect(product.slug).toBe(mockProductRow.slug);
      expect(product.basePrice).toBe(mockProductRow.base_price);
      expect(product.name.cs).toBe(mockProductRow.name_cs);
      expect(product.name.en).toBe(mockProductRow.name_en);
      expect(product.category).toBe(category);
      expect(product.active).toBe(mockProductRow.active);
      expect(product.createdAt).toBeInstanceOf(Date);
    });

    it("should handle product without category", () => {
      const product = transformProductRow(mockProductRow);

      expect(product.category).toBeUndefined();
      expect(product.categoryId).toBe(mockProductRow.category_id);
    });
  });

  describe("validateProductData", () => {
    it("should validate correct product data", () => {
      const validData = {
        nameCs: "Test věnec",
        nameEn: "Test wreath",
        slug: "test-wreath",
        basePrice: 1000,
      };

      const result = validateProductData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid product data", () => {
      const invalidData = {
        nameCs: "",
        nameEn: null,
        basePrice: -100,
      };

      const result = validateProductData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain("Czech name is required");
      expect(result.errors).toContain("English name is required");
      expect(result.errors).toContain("Base price must be a positive number");
    });
  });

  describe("validateCategoryData", () => {
    it("should validate correct category data", () => {
      const validData = {
        nameCs: "Test kategorie",
        nameEn: "Test category",
        slug: "test-category",
      };

      const result = validateCategoryData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid category data", () => {
      const invalidData = {
        nameCs: "",
        nameEn: null,
      };

      const result = validateCategoryData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("createSlug", () => {
    it("should create valid slugs from Czech text", () => {
      expect(createSlug("Pohřební věnce")).toBe("pohrebni-vence");
      expect(createSlug("Krásný věnec s růžemi")).toBe("krasny-venec-s-ruzemi");
    });

    it("should create valid slugs from English text", () => {
      expect(createSlug("Funeral Wreaths")).toBe("funeral-wreaths");
      expect(createSlug("Beautiful Wreath with Roses")).toBe("beautiful-wreath-with-roses");
    });

    it("should handle special characters", () => {
      expect(createSlug("Test & Special Characters!")).toBe("test-special-characters");
      expect(createSlug("Multiple   Spaces")).toBe("multiple-spaces");
    });
  });

  describe("getLocalizedContent", () => {
    const localizedContent = {
      cs: "Český text",
      en: "English text",
    };

    it("should return correct locale content", () => {
      expect(getLocalizedContent(localizedContent, "cs")).toBe("Český text");
      expect(getLocalizedContent(localizedContent, "en")).toBe("English text");
    });

    it("should fallback to Czech if locale not found", () => {
      const contentWithMissingEn = { cs: "Český text", en: "" };
      expect(getLocalizedContent(contentWithMissingEn as any, "en")).toBe("Český text");
    });
  });
});
