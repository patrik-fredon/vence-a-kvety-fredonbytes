/**
 * Navigation-specific validation and error handling
 * Provides comprehensive validation for routing parameters and navigation state
 */

import { logError } from "@/lib/monitoring/error-logger";
import {
  isValidLocale,
  isValidProductSlug,
  isValidNavigationParams,
  ValidationResult,
  ValidationError
} from "./type-guards";

export interface NavigationValidationContext {
  currentPath?: string;
  referrer?: string;
  userAgent?: string;
  timestamp?: string;
}

export interface NavigationParams {
  locale: string;
  slug?: string;
  category?: string;
  page?: string;
}

export interface NavigationValidationResult extends ValidationResult<NavigationParams> {
  sanitizedParams?: NavigationParams;
  redirectPath?: string;
}

/**
 * Validate navigation parameters with comprehensive error handling
 */
export async function validateNavigationParams(
  params: unknown,
  context: NavigationValidationContext = {}
): Promise<NavigationValidationResult> {
  const errors: ValidationError[] = [];
  let sanitizedParams: NavigationParams | undefined;

  try {
    // Check if params is an object
    if (!params || typeof params !== 'object') {
      errors.push({
        field: 'params',
        message: 'Navigation parameters must be an object',
        code: 'INVALID_PARAMS_TYPE',
        severity: 'error'
      });

      await logError(new Error('Invalid navigation parameters type'), {
        level: 'component',
        context: 'navigation-validation',
        additionalData: { params, ...context }
      });

      return {
        isValid: false,
        errors,
        redirectPath: '/cs' // Default fallback
      };
    }

    const navParams = params as any;
    sanitizedParams = {} as NavigationParams;

    // Validate locale
    if (!isValidLocale(navParams.locale)) {
      errors.push({
        field: 'locale',
        message: 'Invalid locale parameter',
        code: 'INVALID_LOCALE',
        severity: 'error'
      });

      // Fallback to Czech locale
      sanitizedParams.locale = 'cs';
    } else {
      sanitizedParams.locale = navParams.locale;
    }

    // Validate product slug if present
    if (navParams.slug !== undefined) {
      if (!isValidProductSlug(navParams.slug)) {
        errors.push({
          field: 'slug',
          message: 'Invalid product slug format',
          code: 'INVALID_PRODUCT_SLUG',
          severity: 'error'
        });

        await logError(new Error('Invalid product slug'), {
          level: 'component',
          context: 'navigation-validation',
          additionalData: {
            slug: navParams.slug,
            locale: sanitizedParams.locale,
            ...context
          }
        });
      } else {
        sanitizedParams.slug = navParams.slug;
      }
    }

    // Validate category if present
    if (navParams.category !== undefined) {
      if (typeof navParams.category !== 'string' || navParams.category.length === 0) {
        errors.push({
          field: 'category',
          message: 'Invalid category parameter',
          code: 'INVALID_CATEGORY',
          severity: 'warning'
        });
      } else {
        // Sanitize category slug
        sanitizedParams.category = navParams.category.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      }
    }

    // Validate page parameter if present
    if (navParams.page !== undefined) {
      const pageNum = parseInt(navParams.page, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        errors.push({
          field: 'page',
          message: 'Invalid page number',
          code: 'INVALID_PAGE_NUMBER',
          severity: 'warning'
        });
        sanitizedParams.page = '1'; // Default to first page
      } else {
        sanitizedParams.page = pageNum.toString();
      }
    }

    // Determine if validation passed
    const hasErrors = errors.some(error => error.severity === 'error');

    if (hasErrors) {
      // Generate redirect path for error cases
      let redirectPath = `/${sanitizedParams.locale}`;

      if (sanitizedParams.slug && !errors.find(e => e.field === 'slug')) {
        redirectPath += `/products/${sanitizedParams.slug}`;
      } else if (sanitizedParams.category && !errors.find(e => e.field === 'category')) {
        redirectPath += `/products?category=${sanitizedParams.category}`;
      } else {
        redirectPath += '/products';
      }

      return {
        isValid: false,
        errors,
        sanitizedParams,
        redirectPath
      };
    }

    return {
      isValid: true,
      data: sanitizedParams,
      sanitizedParams,
      errors: errors.filter(e => e.severity === 'warning') // Keep warnings
    };

  } catch (error) {
    const validationError: ValidationError = {
      field: 'validation',
      message: error instanceof Error ? error.message : 'Navigation validation failed',
      code: 'NAVIGATION_VALIDATION_ERROR',
      severity: 'error'
    };

    await logError(error instanceof Error ? error : new Error('Navigation validation error'), {
      level: 'component',
      context: 'navigation-validation',
      additionalData: { params, ...context }
    });

    return {
      isValid: false,
      errors: [validationError],
      redirectPath: '/cs'
    };
  }
}

/**
 * Validate product navigation specifically
 */
export async function validateProductNavigation(
  locale: unknown,
  slug: unknown,
  context: NavigationValidationContext = {}
): Promise<NavigationValidationResult> {
  const errors: ValidationError[] = [];

  try {
    // Validate locale
    if (!isValidLocale(locale)) {
      errors.push({
        field: 'locale',
        message: 'Invalid or missing locale for product navigation',
        code: 'INVALID_PRODUCT_LOCALE',
        severity: 'error'
      });
    }

    // Validate product slug
    if (!isValidProductSlug(slug)) {
      errors.push({
        field: 'slug',
        message: 'Invalid or missing product slug',
        code: 'INVALID_PRODUCT_SLUG',
        severity: 'error'
      });
    }

    if (errors.length > 0) {
      await logError(new Error('Product navigation validation failed'), {
        level: 'component',
        context: 'product-navigation-validation',
        additionalData: { locale, slug, ...context }
      });

      return {
        isValid: false,
        errors,
        redirectPath: `/${isValidLocale(locale) ? locale : 'cs'}/products`
      };
    }

    return {
      isValid: true,
      data: { locale: locale as string, slug: slug as string },
      errors: []
    };

  } catch (error) {
    const validationError: ValidationError = {
      field: 'validation',
      message: error instanceof Error ? error.message : 'Product navigation validation failed',
      code: 'PRODUCT_NAVIGATION_ERROR',
      severity: 'error'
    };

    await logError(error instanceof Error ? error : new Error('Product navigation validation error'), {
      level: 'component',
      context: 'product-navigation-validation',
      additionalData: { locale, slug, ...context }
    });

    return {
      isValid: false,
      errors: [validationError],
      redirectPath: '/cs/products'
    };
  }
}

/**
 * Validate search parameters
 */
export function validateSearchParams(searchParams: URLSearchParams): ValidationResult<Record<string, string>> {
  const errors: ValidationError[] = [];
  const validatedParams: Record<string, string> = {};

  try {
    // Validate search query
    const query = searchParams.get('q');
    if (query !== null) {
      if (query.length > 100) {
        errors.push({
          field: 'query',
          message: 'Search query too long',
          code: 'QUERY_TOO_LONG',
          severity: 'warning'
        });
        validatedParams.q = query.substring(0, 100);
      } else if (query.length > 0) {
        // Sanitize search query
        validatedParams.q = query.replace(/[<>]/g, '');
      }
    }

    // Validate category filter
    const category = searchParams.get('category');
    if (category !== null && category.length > 0) {
      if (!/^[a-z0-9-]+$/.test(category)) {
        errors.push({
          field: 'category',
          message: 'Invalid category format',
          code: 'INVALID_CATEGORY_FORMAT',
          severity: 'warning'
        });
      } else {
        validatedParams.category = category;
      }
    }

    // Validate sort parameter
    const sort = searchParams.get('sort');
    if (sort !== null) {
      const validSortOptions = ['name', 'price', 'date', 'popularity'];
      if (!validSortOptions.includes(sort)) {
        errors.push({
          field: 'sort',
          message: 'Invalid sort option',
          code: 'INVALID_SORT_OPTION',
          severity: 'warning'
        });
      } else {
        validatedParams.sort = sort;
      }
    }

    // Validate page parameter
    const page = searchParams.get('page');
    if (page !== null) {
      const pageNum = parseInt(page, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        errors.push({
          field: 'page',
          message: 'Invalid page number',
          code: 'INVALID_PAGE_NUMBER',
          severity: 'warning'
        });
        validatedParams.page = '1';
      } else {
        validatedParams.page = Math.min(pageNum, 1000).toString(); // Cap at 1000 pages
      }
    }

    return {
      isValid: errors.every(e => e.severity !== 'error'),
      data: validatedParams,
      errors
    };

  } catch (error) {
    const validationError: ValidationError = {
      field: 'searchParams',
      message: error instanceof Error ? error.message : 'Search params validation failed',
      code: 'SEARCH_PARAMS_ERROR',
      severity: 'error'
    };

    return {
      isValid: false,
      errors: [validationError]
    };
  }
}

/**
 * Create safe navigation URL with validation
 */
export function createSafeNavigationUrl(
  locale: string,
  path: string,
  params?: Record<string, string>
): string {
  try {
    // Validate and sanitize locale
    const safeLocale = isValidLocale(locale) ? locale : 'cs';

    // Sanitize path
    const safePath = path.replace(/[^a-zA-Z0-9\-\/]/g, '').replace(/\/+/g, '/');

    // Build base URL
    let url = `/${safeLocale}${safePath.startsWith('/') ? '' : '/'}${safePath}`;

    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        // Sanitize parameter values
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '');
        const safeValue = value.replace(/[<>]/g, '');

        if (safeKey && safeValue) {
          searchParams.set(safeKey, safeValue);
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;

  } catch (error) {
    // Fallback to safe default
    logError(error instanceof Error ? error : new Error('URL creation failed'), {
      level: 'component',
      context: 'safe-navigation-url',
      additionalData: { locale, path, params }
    });

    return `/${isValidLocale(locale) ? locale : 'cs'}`;
  }
}

/**
 * Validate and sanitize form data
 */
export function validateFormData(formData: FormData): ValidationResult<Record<string, string>> {
  const errors: ValidationError[] = [];
  const validatedData: Record<string, string> = {};

  try {
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        // Sanitize field name
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '');

        if (safeKey) {
          // Basic XSS protection
          const safeValue = value
            .replace(/[<>]/g, '')
            .trim()
            .substring(0, 1000); // Limit length

          validatedData[safeKey] = safeValue;
        }
      }
    }

    return {
      isValid: true,
      data: validatedData,
      errors
    };

  } catch (error) {
    const validationError: ValidationError = {
      field: 'formData',
      message: error instanceof Error ? error.message : 'Form data validation failed',
      code: 'FORM_DATA_ERROR',
      severity: 'error'
    };

    return {
      isValid: false,
      errors: [validationError]
    };
  }
}
