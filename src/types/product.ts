/**
 * Product-related type definitions for the funeral wreaths e-commerce platform
 */

import { BaseEntity, LocalizedContent, ImageData, SEOMetadata } from "./index";

// Customization option types
export type CustomizationType = "size" | "flowers" | "ribbon" | "message";

export interface CustomizationChoice {
  id: string;
  value: string;
  label: LocalizedContent;
  priceModifier: number;
  available: boolean;
  imageUrl?: string;
}

export interface CustomizationOption {
  id: string;
  type: CustomizationType;
  name: LocalizedContent;
  description?: LocalizedContent;
  choices: CustomizationChoice[];
  required: boolean;
  maxSelections?: number;
  minSelections?: number;
}

// Product availability
export interface ProductAvailability {
  inStock: boolean;
  stockQuantity?: number;
  estimatedRestockDate?: Date;
  maxOrderQuantity?: number;
  leadTimeHours?: number;
}

// Product image with additional metadata
export interface ProductImage extends ImageData {
  id: string;
  isPrimary: boolean;
  sortOrder: number;
  customizationId?: string; // Links image to specific customization
}

// Category interface
export interface Category extends BaseEntity {
  nameCs: string;
  nameEn: string;
  slug: string;
  descriptionCs?: string;
  descriptionEn?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder: number;
  active: boolean;

  // Computed fields
  name: LocalizedContent;
  description?: LocalizedContent;
  children?: Category[];
  parent?: Category;
  productCount?: number;
}

// Main Product interface
export interface Product extends BaseEntity {
  nameCs: string;
  nameEn: string;
  slug: string;
  descriptionCs?: string;
  descriptionEn?: string;
  basePrice: number;
  categoryId?: string;
  images: ProductImage[];
  customizationOptions: CustomizationOption[];
  availability: ProductAvailability;
  seoMetadata: SEOMetadata;
  active: boolean;
  featured: boolean;

  // Computed fields
  name: LocalizedContent;
  description?: LocalizedContent;
  category?: Category;
  finalPrice?: number; // Price after customizations
}

// Product customization selection
export interface Customization {
  optionId: string;
  choiceIds: string[];
  customValue?: string; // For text inputs like messages
  priceModifier?: number; // Price adjustment for this customization
}

// Product with applied customizations
export interface CustomizedProduct extends Product {
  customizations: Customization[];
  finalPrice: number;
  estimatedDeliveryDate?: Date;
}

// Product search and filtering
export interface ProductFilters {
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  tags?: string[];
}

export interface ProductSortOptions {
  field: "name" | "price" | "created_at" | "featured" | "popularity";
  direction: "asc" | "desc";
}

export interface ProductSearchParams extends ProductFilters {
  page?: number;
  limit?: number;
  sort?: ProductSortOptions;
  locale?: string;
}

// API request/response types
export interface CreateProductRequest {
  nameCs: string;
  nameEn: string;
  slug: string;
  descriptionCs?: string;
  descriptionEn?: string;
  basePrice: number;
  categoryId?: string;
  images?: Omit<ProductImage, "id">[];
  customizationOptions?: Omit<CustomizationOption, "id">[];
  availability?: ProductAvailability;
  seoMetadata?: SEOMetadata;
  active?: boolean;
  featured?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface CreateCategoryRequest {
  nameCs: string;
  nameEn: string;
  slug: string;
  descriptionCs?: string;
  descriptionEn?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

// Database row types (matching Supabase schema)
export interface ProductRow {
  id: string;
  name_cs: string;
  name_en: string;
  description_cs: string | null;
  description_en: string | null;
  slug: string;
  base_price: number;
  category_id: string | null;
  images: any; // JSONB
  customization_options: any; // JSONB
  availability: any; // JSONB
  seo_metadata: any; // JSONB
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name_cs: string;
  name_en: string;
  description_cs: string | null;
  description_en: string | null;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
