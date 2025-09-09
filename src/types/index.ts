/**
 * Core type definitions for the funeral wreaths e-commerce platform
 */

// Locale types for internationalization
export type Locale = 'cs' | 'en';

// Localized content type
export type LocalizedContent<T = string> = Record<Locale, T>;

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Environment configuration
export interface AppConfig {
  env: 'development' | 'production' | 'test';
  baseUrl: string;
  apiUrl: string;
  defaultLocale: Locale;
  supportedLocales: Locale[];
}

// Error types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T = any> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Component props with common patterns
export interface ComponentWithChildren {
  children: React.ReactNode;
}

export interface ComponentWithClassName {
  className?: string;
}

export interface ComponentWithLocale {
  locale: Locale;
}

// SEO metadata
export interface SEOMetadata {
  title: LocalizedContent;
  description: LocalizedContent;
  keywords?: LocalizedContent<string[]>;
  ogImage?: string;
  canonicalUrl?: string;
}

// Image types
export interface ImageData {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
}

// Address information
export interface Address {
  id?: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// Contact information
export interface ContactInfo {
  email: string;
  phone?: string;
  name: string;
}

// Re-export product types for convenience
export * from './product';

export default {};
