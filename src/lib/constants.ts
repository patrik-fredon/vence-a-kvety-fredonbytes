/**
 * Application constants for the funeral wreaths e-commerce platform
 */

// Application metadata
export const APP_NAME = "Pohřební věnce";
export const APP_DESCRIPTION = {
  cs: "Prémiové pohřební věnce a květinové aranžmá od Ketingmar s.r.o.",
  en: "Premium funeral wreaths and floral arrangements by Ketingmar s.r.o.",
};

// Currency and pricing
export const CURRENCY = "CZK";
export const CURRENCY_SYMBOL = "Kč";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// Image dimensions
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  card: { width: 300, height: 300 },
  detail: { width: 600, height: 600 },
  hero: { width: 1200, height: 600 },
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Form validation
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+420)?[0-9]{9}$/,
  postalCode: /^[0-9]{3}\s?[0-9]{2}$/,
  minPasswordLength: 8,
  maxMessageLength: 500,
} as const;

// Order statuses
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  STRIPE: "stripe",
  GOPAY: "gopay",
} as const;

// Delivery options
export const DELIVERY_TYPES = {
  STANDARD: "standard",
  EXPRESS: "express",
  PICKUP: "pickup",
} as const;

// Product categories (will be expanded based on actual categories)
export const PRODUCT_CATEGORIES = {
  WREATHS: "wreaths",
  BOUQUETS: "bouquets",
  ARRANGEMENTS: "arrangements",
  ACCESSORIES: "accessories",
} as const;

// Customization types
export const CUSTOMIZATION_TYPES = {
  SIZE: "size",
  FLOWERS: "flowers",
  RIBBON: "ribbon",
  MESSAGE: "message",
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

// Cache keys
export const CACHE_KEYS = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  CART: "cart",
  USER_PREFERENCES: "user_preferences",
  DELIVERY_CALENDAR: "delivery_calendar",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  CART: "funeral_wreaths_cart",
  LOCALE: "funeral_wreaths_locale",
  USER_PREFERENCES: "funeral_wreaths_preferences",
  RECENT_PRODUCTS: "funeral_wreaths_recent",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: "/api/products",
  CATEGORIES: "/api/categories",
  CART: "/api/cart",
  ORDERS: "/api/orders",
  AUTH: "/api/auth",
  DELIVERY: "/api/delivery",
  PAYMENT: "/api/payment",
} as const;

// Social media and contact
export const CONTACT_INFO = {
  email: "info@pohrebni-vence.cz",
  phone: "+420 123 456 789",
  address: {
    street: "Hlavní 123",
    city: "Praha",
    postalCode: "110 00",
    country: "Česká republika",
  },
} as const;

// Business hours
export const BUSINESS_HOURS = {
  monday: { open: "08:00", close: "17:00" },
  tuesday: { open: "08:00", close: "17:00" },
  wednesday: { open: "08:00", close: "17:00" },
  thursday: { open: "08:00", close: "17:00" },
  friday: { open: "08:00", close: "17:00" },
  saturday: { open: "09:00", close: "14:00" },
  sunday: { open: null, close: null }, // Closed
} as const;
