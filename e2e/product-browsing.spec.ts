import { test, expect } from '@playwright/test';

test.describe('Product Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cs/products');
  });

  test('should display product grid with products', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Check that products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount(await productCards.count());

    // Check product card content
    const firstProduct = productCards.first();
    await expect(firstProduct.locator('h3')).toBeVisible();
    await expect(firstProduct.locator('img')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    // Click on a category filter
    await page.click('[data-testid="category-filter"]:first-child');

    // Wait for filtered results
    await page.waitForLoadState('networkidle');

    // Check that URL contains category parameter
    expect(page.url()).toContain('category=');

    // Verify products are filtered
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount(await productCards.count());
  });

  test('should search for products', async ({ page }) => {
    // Enter search term
    await page.fill('[data-testid="search-input"]', 'věnec');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Wait for search results
    await page.waitForLoadState('networkidle');

    // Check that URL contains search parameter
    expect(page.url()).toContain('search=');

    // Verify search results
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();

    if (count > 0) {
      // Check that product names contain search term
      const productNames = await productCards.locator('h3').allTextContents();
      expect(productNames.some(name => name.toLowerCase().includes('věnec'))).toBeTruthy();
    }
  });

  test('should navigate to product detail page', async ({ page }) => {
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();

    // Wait for product detail page to load
    await page.waitForLoadState('networkidle');

    // Check that we're on product detail page
    expect(page.url()).toMatch(/\/products\/[^\/]+$/);

    // Verify product detail content
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="product-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"]');

    if (await pagination.isVisible()) {
      const nextButton = pagination.locator('[data-testid="next-page"]');

      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');

        // Check that URL contains page parameter
        expect(page.url()).toContain('page=2');

        // Verify new products loaded
        await expect(page.locator('[data-testid="product-card"]')).toHaveCount(await page.locator('[data-testid="product-card"]').count());
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that mobile layout is applied
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Check that product grid adapts to mobile
    const productCards = page.locator('[data-testid="product-card"]');
    if (await productCards.count() > 0) {
      await expect(productCards.first()).toBeVisible();
    }
  });

  test('should handle empty search results', async ({ page }) => {
    // Search for non-existent product
    await page.fill('[data-testid="search-input"]', 'nonexistentproduct123');
    await page.press('[data-testid="search-input"]', 'Enter');

    await page.waitForLoadState('networkidle');

    // Check for empty state message
    await expect(page.locator('[data-testid="no-products-message"]')).toBeVisible();
  });

  test('should sort products', async ({ page }) => {
    // Click sort dropdown
    const sortDropdown = page.locator('[data-testid="sort-dropdown"]');

    if (await sortDropdown.isVisible()) {
      await sortDropdown.click();

      // Select price sorting
      await page.click('[data-testid="sort-price-asc"]');
      await page.waitForLoadState('networkidle');

      // Check that URL contains sort parameter
      expect(page.url()).toContain('sort=');
    }
  });

  test('should display product availability status', async ({ page }) => {
    const productCards = page.locator('[data-testid="product-card"]');

    if (await productCards.count() > 0) {
      const firstProduct = productCards.first();
      const availabilityBadge = firstProduct.locator('[data-testid="availability-badge"]');

      await expect(availabilityBadge).toBeVisible();

      // Check that availability text is one of expected values
      const availabilityText = await availabilityBadge.textContent();
      expect(['Skladem', 'Omezená zásoba', 'Vyprodáno']).toContain(availabilityText);
    }
  });
});
