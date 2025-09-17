/**
 * SEO validation utilities for ensuring proper metadata and structured data
 */

interface SEOValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

interface MetadataValidation {
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
  image?: string;
}

/**
 * Validate page metadata for SEO compliance
 */
export function validatePageMetadata(metadata: MetadataValidation): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Title validation
  if (!metadata.title) {
    errors.push("Title is required");
    score -= 20;
  } else {
    if (metadata.title.length < 30) {
      warnings.push("Title is shorter than recommended (30+ characters)");
      score -= 5;
    }
    if (metadata.title.length > 60) {
      warnings.push("Title is longer than recommended (60 characters max)");
      score -= 10;
    }
    if (!metadata.title.includes("|")) {
      warnings.push("Consider adding brand name to title");
      score -= 5;
    }
  }

  // Description validation
  if (!metadata.description) {
    errors.push("Meta description is required");
    score -= 20;
  } else {
    if (metadata.description.length < 120) {
      warnings.push("Meta description is shorter than recommended (120+ characters)");
      score -= 5;
    }
    if (metadata.description.length > 160) {
      warnings.push("Meta description is longer than recommended (160 characters max)");
      score -= 10;
    }
  }

  // Keywords validation
  if (!metadata.keywords || metadata.keywords.length === 0) {
    warnings.push("No keywords specified");
    score -= 5;
  } else {
    if (metadata.keywords.length > 10) {
      warnings.push("Too many keywords (10 max recommended)");
      score -= 5;
    }
  }

  // URL validation
  if (metadata.url) {
    try {
      new URL(metadata.url);

      // Check for SEO-friendly URL structure
      if (metadata.url.includes("?") && !metadata.url.includes("category=")) {
        warnings.push("URL contains query parameters that may not be SEO-friendly");
        score -= 3;
      }

      if (metadata.url.includes("_")) {
        warnings.push("URL contains underscores, hyphens are preferred for SEO");
        score -= 2;
      }
    } catch {
      errors.push("Invalid URL format");
      score -= 10;
    }
  }

  // Image validation
  if (metadata.image) {
    if (!metadata.image.startsWith("http") && !metadata.image.startsWith("/")) {
      warnings.push("Image URL should be absolute or start with /");
      score -= 3;
    }
  } else {
    warnings.push("No Open Graph image specified");
    score -= 5;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * Validate structured data for schema.org compliance
 */
export function validateStructuredData(data: any): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  try {
    // Basic JSON validation
    if (typeof data !== "object" || data === null) {
      errors.push("Structured data must be a valid object");
      return { isValid: false, errors, warnings, score: 0 };
    }

    // Required fields validation
    if (!data["@context"]) {
      errors.push("@context is required");
      score -= 25;
    } else if (data["@context"] !== "https://schema.org") {
      warnings.push("Consider using https://schema.org as @context");
      score -= 5;
    }

    if (!data["@type"]) {
      errors.push("@type is required");
      score -= 25;
    }

    // Type-specific validations
    switch (data["@type"]) {
      case "Product":
        if (!data.name) {
          errors.push("Product name is required");
          score -= 15;
        }
        if (!data.offers) {
          warnings.push("Product offers are recommended");
          score -= 10;
        } else {
          if (!data.offers.price) {
            warnings.push("Product price is recommended");
            score -= 5;
          }
          if (!data.offers.priceCurrency) {
            warnings.push("Product price currency is recommended");
            score -= 5;
          }
        }
        if (!data.image) {
          warnings.push("Product image is recommended");
          score -= 5;
        }
        break;

      case "Organization":
      case "LocalBusiness":
        if (!data.name) {
          errors.push("Organization name is required");
          score -= 15;
        }
        if (!data.url) {
          warnings.push("Organization URL is recommended");
          score -= 5;
        }
        if (!data.address) {
          warnings.push("Organization address is recommended for LocalBusiness");
          score -= 10;
        }
        break;

      case "BreadcrumbList":
        if (!data.itemListElement || !Array.isArray(data.itemListElement)) {
          errors.push("BreadcrumbList must have itemListElement array");
          score -= 20;
        } else {
          data.itemListElement.forEach((item: any, index: number) => {
            if (!item.position) {
              errors.push(`Breadcrumb item ${index + 1} missing position`);
              score -= 5;
            }
            if (!item.name) {
              errors.push(`Breadcrumb item ${index + 1} missing name`);
              score -= 5;
            }
          });
        }
        break;
    }

    // JSON-LD validation
    try {
      JSON.stringify(data);
    } catch {
      errors.push("Structured data is not valid JSON");
      score -= 30;
    }
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`);
    score = 0;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * Validate robots.txt compliance
 */
export function validateRobotsRules(rules: any): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  if (!rules.rules || !Array.isArray(rules.rules)) {
    errors.push("Robots rules must be an array");
    return { isValid: false, errors, warnings, score: 0 };
  }

  // Check for essential rules
  const hasGeneralRule = rules.rules.some((rule: any) => rule.userAgent === "*");
  if (!hasGeneralRule) {
    warnings.push("No general rule for all user agents (*)");
    score -= 10;
  }

  // Check for sitemap
  if (!rules.sitemap) {
    warnings.push("No sitemap specified in robots.txt");
    score -= 15;
  }

  // Check for common disallowed paths
  const commonDisallows = ["/api/", "/admin/", "/_next/", "/checkout/", "/cart/"];
  const allDisallows = rules.rules.flatMap((rule: any) => rule.disallow || []);

  commonDisallows.forEach((path) => {
    if (!allDisallows.includes(path)) {
      warnings.push(`Consider disallowing ${path} for better SEO`);
      score -= 3;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * Validate sitemap structure
 */
export function validateSitemap(sitemap: any[]): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  if (!Array.isArray(sitemap)) {
    errors.push("Sitemap must be an array");
    return { isValid: false, errors, warnings, score: 0 };
  }

  if (sitemap.length === 0) {
    errors.push("Sitemap cannot be empty");
    return { isValid: false, errors, warnings, score: 0 };
  }

  if (sitemap.length > 50000) {
    warnings.push("Sitemap has more than 50,000 URLs, consider splitting");
    score -= 10;
  }

  sitemap.forEach((entry, index) => {
    // URL validation
    if (!entry.url) {
      errors.push(`Sitemap entry ${index + 1} missing URL`);
      score -= 5;
    } else {
      try {
        new URL(entry.url);
      } catch {
        errors.push(`Sitemap entry ${index + 1} has invalid URL: ${entry.url}`);
        score -= 5;
      }
    }

    // Priority validation
    if (entry.priority !== undefined) {
      if (typeof entry.priority !== "number" || entry.priority < 0 || entry.priority > 1) {
        warnings.push(`Sitemap entry ${index + 1} has invalid priority (should be 0-1)`);
        score -= 2;
      }
    }

    // Change frequency validation
    if (entry.changeFrequency) {
      const validFrequencies = [
        "always",
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "yearly",
        "never",
      ];
      if (!validFrequencies.includes(entry.changeFrequency)) {
        warnings.push(`Sitemap entry ${index + 1} has invalid changeFrequency`);
        score -= 2;
      }
    }

    // Last modified validation
    if (entry.lastModified) {
      try {
        new Date(entry.lastModified);
      } catch {
        warnings.push(`Sitemap entry ${index + 1} has invalid lastModified date`);
        score -= 2;
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * Comprehensive SEO audit for a page
 */
export function auditPageSEO(params: {
  metadata: MetadataValidation;
  structuredData?: any[];
  content?: string;
  url?: string;
}): SEOValidationResult {
  const results: SEOValidationResult[] = [];

  // Validate metadata
  results.push(validatePageMetadata(params.metadata));

  // Validate structured data
  if (params.structuredData) {
    params.structuredData.forEach((data) => {
      results.push(validateStructuredData(data));
    });
  }

  // Content analysis
  if (params.content) {
    const contentResult = analyzeContent(params.content);
    results.push(contentResult);
  }

  // Combine results
  const allErrors = results.flatMap((r) => r.errors);
  const allWarnings = results.flatMap((r) => r.warnings);
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    score: Math.round(averageScore),
  };
}

/**
 * Analyze content for SEO factors
 */
function analyzeContent(content: string): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Remove HTML tags for analysis
  const textContent = content.replace(/<[^>]*>/g, "");
  const wordCount = textContent.trim().split(/\s+/).length;

  // Word count analysis
  if (wordCount < 300) {
    warnings.push("Content is shorter than recommended (300+ words)");
    score -= 10;
  }

  // Heading structure analysis
  const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count === 0) {
    errors.push("No H1 heading found");
    score -= 15;
  } else if (h1Count > 1) {
    warnings.push("Multiple H1 headings found, consider using only one");
    score -= 5;
  }

  // Image alt text analysis
  const images = content.match(/<img[^>]*>/gi) || [];
  const imagesWithoutAlt = images.filter((img) => !img.includes("alt="));
  if (imagesWithoutAlt.length > 0) {
    warnings.push(`${imagesWithoutAlt.length} images missing alt text`);
    score -= imagesWithoutAlt.length * 3;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * Generate SEO recommendations based on validation results
 */
export function generateSEORecommendations(validationResult: SEOValidationResult): string[] {
  const recommendations: string[] = [];

  if (validationResult.score < 70) {
    recommendations.push("Overall SEO score is below recommended threshold (70+)");
  }

  // Add specific recommendations based on common issues
  validationResult.errors.forEach((error) => {
    if (error.includes("Title")) {
      recommendations.push("Add a descriptive, unique title for this page");
    }
    if (error.includes("description")) {
      recommendations.push("Write a compelling meta description that summarizes the page content");
    }
    if (error.includes("@context")) {
      recommendations.push("Add proper structured data with @context and @type");
    }
  });

  validationResult.warnings.forEach((warning) => {
    if (warning.includes("keywords")) {
      recommendations.push("Research and add relevant keywords for better discoverability");
    }
    if (warning.includes("image")) {
      recommendations.push("Add high-quality images with descriptive alt text");
    }
    if (warning.includes("URL")) {
      recommendations.push("Optimize URL structure to be more SEO-friendly");
    }
  });

  return recommendations;
}
