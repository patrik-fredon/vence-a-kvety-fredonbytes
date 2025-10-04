/**
 * Utility functions for transforming between database rows and TypeScript interfaces
 */

import type { Locale, LocalizedContent } from "@/types";
import type { Category, CategoryRow, Product, ProductRow } from "@/types/product";

/**
 * Transform a database category row to Category interface
 */
export function transformCategoryRow(row: CategoryRow): Category {
  const name: LocalizedContent = {
    cs: row.name_cs,
    en: row.name_en,
  };

  const description: LocalizedContent | undefined =
    row.description_cs || row.description_en
      ? {
          cs: row.description_cs || "",
          en: row.description_en || "",
        }
      : undefined;

  return {
    id: row.id,
    nameCs: row.name_cs,
    nameEn: row.name_en,
    slug: row.slug,
    ...(row.description_cs && { descriptionCs: row.description_cs }),
    ...(row.description_en && { descriptionEn: row.description_en }),
    ...(row.image_url && { imageUrl: row.image_url }),
    ...(row.parent_id && { parentId: row.parent_id }),
    sortOrder: row.sort_order,
    active: row.active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    name,
    ...(description && { description }),
  };
}

/**
 * Transform a database product row to Product interface
 */
export function transformProductRow(row: ProductRow, category?: Category): Product {
  const name: LocalizedContent = {
    cs: row.name_cs,
    en: row.name_en,
  };

  const description: LocalizedContent | undefined =
    row.description_cs || row.description_en
      ? {
          cs: row.description_cs || "",
          en: row.description_en || "",
        }
      : undefined;

  return {
    id: row.id,
    nameCs: row.name_cs,
    nameEn: row.name_en,
    slug: row.slug,
    ...(row.description_cs && { descriptionCs: row.description_cs }),
    ...(row.description_en && { descriptionEn: row.description_en }),
    basePrice: Number(row.base_price),
    ...(row.category_id && { categoryId: row.category_id }),
    images: Array.isArray(row.images) ? row.images : [],
    customizationOptions: Array.isArray(row.customization_options) ? row.customization_options : [],
    availability: typeof row.availability === "object" ? row.availability : { inStock: true },
    seoMetadata:
      typeof row.seo_metadata === "object"
        ? row.seo_metadata
        : { title: name, description: description || name },
    active: row.active,
    featured: row.featured,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    name,
    ...(description && { description }),
    ...(category && { category }),
  };
}

/**
 * Transform Category interface to database row format
 */
export function categoryToRow(
  category: Omit<Category, "id" | "createdAt" | "updatedAt" | "name" | "description">
): Omit<CategoryRow, "id" | "created_at" | "updated_at"> {
  return {
    name_cs: category.nameCs,
    name_en: category.nameEn,
    slug: category.slug,
    description_cs: category.descriptionCs || null,
    description_en: category.descriptionEn || null,
    image_url: category.imageUrl || null,
    parent_id: category.parentId || null,
    sort_order: category.sortOrder,
    active: category.active,
  };
}

/**
 * Transform Product interface to database row format
 */
export function productToRow(
  product: Omit<Product, "id" | "createdAt" | "updatedAt" | "name" | "description" | "category">
): Omit<ProductRow, "id" | "created_at" | "updated_at"> {
  return {
    name_cs: product.nameCs,
    name_en: product.nameEn,
    slug: product.slug,
    description_cs: product.descriptionCs || null,
    description_en: product.descriptionEn || null,
    base_price: product.basePrice,
    category_id: product.categoryId || null,
    images: product.images,
    customization_options: product.customizationOptions,
    availability: product.availability,
    seo_metadata: product.seoMetadata,
    active: product.active,
    featured: product.featured,
  };
}

/**
 * Get localized content based on locale
 */
export function getLocalizedContent<T>(content: LocalizedContent<T>, locale: Locale): T {
  return content[locale] || content.cs || content.en;
}

/**
 * Create slug from localized name
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Validate product data
 */
export function validateProductData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.nameCs || typeof data.nameCs !== "string") {
    errors.push("Czech name is required");
  }

  if (!data.nameEn || typeof data.nameEn !== "string") {
    errors.push("English name is required");
  }

  if (!data.slug || typeof data.slug !== "string") {
    errors.push("Slug is required");
  }

  if (typeof data.basePrice !== "number" || data.basePrice < 0) {
    errors.push("Base price must be a positive number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate category data
 */
export function validateCategoryData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.nameCs || typeof data.nameCs !== "string") {
    errors.push("Czech name is required");
  }

  if (!data.nameEn || typeof data.nameEn !== "string") {
    errors.push("English name is required");
  }

  if (!data.slug || typeof data.slug !== "string") {
    errors.push("Slug is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
