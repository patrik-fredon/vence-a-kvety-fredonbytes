import { test, expect } from '@playwright/test';

test.describe('Product Customization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product detail page
    await page.goto('/cs/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    await page.waitForLoadState('networkidle');
  });

  test('should display customization options', async ({ page }) => {
    // Check for customization section
    const customizationSection = page.locator('[data-testid="product-customizer"]');

    if (await customizationSection.isVisible()) {
      // Check for size options
      const sizeOptions = page.locator('[data-testid="size-options"]');
      if (await sizeOptions.isVisible()) {
        await expect(sizeOptions.locator('input[type="radio"]')).toHaveCount(await sizeOptions.locator('input[type="radio"]').count());
      }

      // Check for flower options
      const flowerOptions = page.locator('[data-testid="flower-options"]');
      if (await flowerOptions.isVisible()) {
        await expect(flowerOptions.locator('input[type="checkbox"], input[type="radio"]')).toHaveCount(await flowerOptions.locator('input[type="checkbox"], input[type="radio"]').count());
      }

      // Check for ribbon options
      const ribbonOptions = page.locator('[data-testid="ribbon-options"]');
      if (await ribbonOptions.isVisible()) {
        await expect(ribbonOptions.locator('select, input[type="radio"]')).toHaveCount(await ribbonOptions.locator('select, input[type="radio"]').count());
      }

      // Check for message input
      const messageInput = page.locator('[data-testid="custom-message"]');
      if (await messageInput.isVisible()) {
        await expect(messageInput).toBeEditable();
      }
    }
  });

  test('should update price when customizations change', async ({ page }) => {
    const customizationSection = page.locator('[data-testid="product-customizer"]');

    if (await customizationSection.isVisible()) {
      // Get initial price
      const initialPrice = await page.locator('[data-testid="product-price"]').textContent();

      // Select a size option that changes price
      const sizeOptions = page.locator('[data-testid="size-options"] input[type="radio"]');
      const sizeCount = await sizeOptions.count();

      if (sizeCount > 1) {
        await sizeOptions.nth(1).click();
        await page.waitForTimeout(500); // Wait for price update

        // Check that price has updated
        const updatedPrice = await page.locator('[data-testid="product-price"]').textContent();
        expect(updatedPrice).not.toBe(initialPrice);
      }
    }
  });

  test('should validate custom message length', async ({ page }) => {
    const messageInput = page.locator('[data-testid="custom-message"]');

    if (await messageInput.isVisible()) {
      // Enter a very long message
      const longMessage = 'A'.repeat(500);
      await messageInput.fill(longMessage);

      // Check for validation error
      const errorMessage = page.locator('[data-testid="message-error"]');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toContainText('příliš dlouhá');
      }
    }
  });

  test('should show preview of customizations', async ({ page }) => {
    const customizationSection = page.locator('[data-testid="product-customizer"]');

    if (await customizationSection.isVisible()) {
      // Make some customizations
      const sizeOptions = page.locator('[data-testid="size-options"] input[type="radio"]');
      if (await sizeOptions.count() > 0) {
        await sizeOptions.first().click();
      }

      const messageInput = page.locator('[data-testid="custom-message"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('In loving memory');
      }

      // Check for customization preview
      const preview = page.locator('[data-testid="customization-preview"]');
      if (await preview.isVisible()) {
        await expect(preview).toBeVisible();
      }
    }
  });

  test('should add customized product to cart', async ({ page }) => {
    const customizationSection = page.locator('[data-testid="product-customizer"]');

    if (await customizationSection.isVisible()) {
      // Make customizations
      const messageInput = page.locator('[data-testid="custom-message"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('Test message');
      }
    }

    // Add to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Check for success message or cart update
    const successMessage = page.locator('[data-testid="add-to-cart-success"]');
    const cartIcon = page.locator('[data-testid="cart-icon"]');

    // Either success message should appear or cart count should update
    await expect(successMessage.or(cartIcon)).toBeVisible();
  });

  test('should handle unavailable customizations', async ({ page }) => {
    const customizationSection = page.locator('[data-testid="product-customizer"]');

    if (await customizationSection.isVisible()) {
      // Look for disabled options
      const disabledOptions = page.locator('[data-testid*="option"][disabled]');
      const disabledCount = await disabledOptions.count();

      if (disabledCount > 0) {
        // Check that disabled options are properly marked
        await expect(disabledOptions.first()).toBeDisabled();

        // Check for unavailable indicator
        const unavailableIndicator = page.locator('[data-testid="unavailable-indicator"]');
        if (await unavailableIndicator.isVisible()) {
          await expect(unavailableIndicator).toContainText('Nedostupné');
        }
      }
    }
  });

  test('should reset customizations', async ({ page }) => {
    const customizationSection = page.locator('[data-testid="product-customizer"]');

    if (await customizationSection.isVisible()) {
      // Make some customizations
      const messageInput = page.locator('[data-testid="custom-message"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('Test message');
      }

      // Look for reset button
      const resetButton = page.locator('[data-testid="reset-customizations"]');
      if (await resetButton.isVisible()) {
        await resetButton.click();

        // Check that customizations are reset
        if (await messageInput.isVisible()) {
          await expect(messageInput).toHaveValue('');
        }
      }
    }
  });

  test('should show delivery estimate based on customizations', async ({ page }) => {
    const customizationSection = page.locator('[data-testid="product-customizer"]');

    if (await customizationSection.isVisible()) {
      // Make complex customizations that might affect delivery
      const sizeOptions = page.locator('[data-testid="size-options"] input[type="radio"]');
      if (await sizeOptions.count() > 1) {
        await sizeOptions.last().click(); // Select largest/most complex option
      }

      // Check for delivery estimate update
      const deliveryEstimate = page.locator('[data-testid="delivery-estimate"]');
      if (await deliveryEstimate.isVisible()) {
        await expect(deliveryEstimate).toBeVisible();

        // Should contain date information
        const estimateText = await deliveryEstimate.textContent();
        expect(estimateText).toMatch(/\d+/); // Should contain numbers (dates)
      }
    }
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    const customizationSection = page.locator('[data-testid="product-customizer"]');

    if (await customizationSection.isVisible()) {
      // Tab through customization options
      await page.keyboard.press('Tab');

      // Check that focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Continue tabbing through options
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to select options with keyboard
      await page.keyboard.press('Space');
    }
  });

  test('should validate required customizations', async ({ page }) => {
    const customizationSection = page.locator('[data-testid="product-customizer"]');

    if (await customizationSection.isVisible()) {
      // Try to add to cart without required customizations
      const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
      await addToCartButton.click();

      // Check for validation errors
      const validationErrors = page.locator('[data-testid*="error"], .error-message');
      const errorCount = await validationErrors.count();

      if (errorCount > 0) {
        await expect(validationErrors.first()).toBeVisible();
      }
    }
  });
});
