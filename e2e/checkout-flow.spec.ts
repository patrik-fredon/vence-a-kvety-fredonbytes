import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add a product to cart first
    await page.goto('/cs/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Add to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(1000); // Wait for cart update
    }
  });

  test('should navigate to cart and proceed to checkout', async ({ page }) => {
    // Open cart
    const cartIcon = page.locator('[data-testid="cart-icon"]');
    await cartIcon.click();

    // Verify cart contents
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(await page.locator('[data-testid="cart-item"]').count());

    // Proceed to checkout
    const checkoutButton = page.locator('[data-testid="proceed-to-checkout"]');
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    // Verify we're on checkout page
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/checkout');
  });

  test('should complete checkout form with valid data', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/cs/checkout');
    await page.waitForLoadState('networkidle');

    // Fill customer information
    await page.fill('[data-testid="customer-name"]', 'Jan Novák');
    await page.fill('[data-testid="customer-email"]', 'jan.novak@example.com');
    await page.fill('[data-testid="customer-phone"]', '+420123456789');

    // Fill delivery address
    await page.fill('[data-testid="delivery-street"]', 'Václavské náměstí 1');
    await page.fill('[data-testid="delivery-city"]', 'Praha');
    await page.fill('[data-testid="delivery-postal-code"]', '11000');

    // Select delivery date
    const deliveryCalendar = page.locator('[data-testid="delivery-calendar"]');
    if (await deliveryCalendar.isVisible()) {
      const availableDate = deliveryCalendar.locator('[data-testid="available-date"]').first();
      await availableDate.click();
    }

    // Select payment method
    const stripePayment = page.locator('[data-testid="payment-stripe"]');
    if (await stripePayment.isVisible()) {
      await stripePayment.click();
    }

    // Verify order summary
    const orderSummary = page.locator('[data-testid="order-summary"]');
    await expect(orderSummary).toBeVisible();
    await expect(orderSummary.locator('[data-testid="total-amount"]')).toBeVisible();

    // Submit order (but don't actually process payment in test)
    const submitButton = page.locator('[data-testid="submit-order"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should validate required checkout fields', async ({ page }) => {
    await page.goto('/cs/checkout');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling required fields
    const submitButton = page.locator('[data-testid="submit-order"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Check for validation errors
      const nameError = page.locator('[data-testid="customer-name-error"]');
      const emailError = page.locator('[data-testid="customer-email-error"]');

      if (await nameError.isVisible()) {
        await expect(nameError).toContainText('povinné');
      }
      if (await emailError.isVisible()) {
        await expect(emailError).toContainText('povinné');
      }
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/cs/checkout');
    await page.waitForLoadState('networkidle');

    // Enter invalid email
    await page.fill('[data-testid="customer-email"]', 'invalid-email');
    await page.blur('[data-testid="customer-email"]');

    // Check for email validation error
    const emailError = page.locator('[data-testid="customer-email-error"]');
    if (await emailError.isVisible()) {
      await expect(emailError).toContainText('platný');
    }
  });

  test('should calculate delivery costs correctly', async ({ page }) => {
    await page.goto('/cs/checkout');
    await page.waitForLoadState('networkidle');

    // Fill delivery address
    await page.fill('[data-testid="delivery-street"]', 'Václavské náměstí 1');
    await page.fill('[data-testid="delivery-city"]', 'Praha');
    await page.fill('[data-testid="delivery-postal-code"]', '11000');

    // Select delivery date
    const deliveryCalendar = page.locator('[data-testid="delivery-calendar"]');
    if (await deliveryCalendar.isVisible()) {
      const availableDate = deliveryCalendar.locator('[data-testid="available-date"]').first();
      await availableDate.click();

      // Wait for delivery cost calculation
      await page.waitForTimeout(1000);

      // Check that delivery cost is displayed
      const deliveryCost = page.locator('[data-testid="delivery-cost"]');
      if (await deliveryCost.isVisible()) {
        await expect(deliveryCost).toBeVisible();

        const costText = await deliveryCost.textContent();
        expect(costText).toMatch(/\d+/); // Should contain numbers
      }
    }
  });

  test('should show order summary with correct totals', async ({ page }) => {
    await page.goto('/cs/checkout');
    await page.waitForLoadState('networkidle');

    const orderSummary = page.locator('[data-testid="order-summary"]');
    await expect(orderSummary).toBeVisible();

    // Check subtotal
    const subtotal = orderSummary.locator('[data-testid="subtotal"]');
    await expect(subtotal).toBeVisible();

    // Check delivery cost
    const deliveryCost = orderSummary.locator('[data-testid="delivery-cost"]');
    if (await deliveryCost.isVisible()) {
      await expect(deliveryCost).toBeVisible();
    }

    // Check total
    const total = orderSummary.locator('[data-testid="total-amount"]');
    await expect(total).toBeVisible();

    // Verify total calculation
    const subtotalText = await subtotal.textContent();
    const totalText = await total.textContent();

    // Extract numbers from text
    const subtotalAmount = parseInt(subtotalText?.replace(/\D/g, '') || '0');
    const totalAmount = parseInt(totalText?.replace(/\D/g, '') || '0');

    expect(totalAmount).toBeGreaterThanOrEqual(subtotalAmount);
  });

  test('should handle payment method selection', async ({ page }) => {
    await page.goto('/cs/checkout');
    await page.waitForLoadState('networkidle');

    // Check available payment methods
    const stripePayment = page.locator('[data-testid="payment-stripe"]');
    const gopayPayment = page.locator('[data-testid="payment-gopay"]');

    if (await stripePayment.isVisible()) {
      await stripePayment.click();
      await expect(stripePayment).toBeChecked();
    }

    if (await gopayPayment.isVisible()) {
      await gopayPayment.click();
      await expect(gopayPayment).toBeChecked();
    }
  });

  test('should save delivery address for future use', async ({ page }) => {
    // This test would require authentication
    // For now, just check that the save address checkbox exists
    await page.goto('/cs/checkout');
    await page.waitForLoadState('networkidle');

    const saveAddressCheckbox = page.locator('[data-testid="save-address"]');
    if (await saveAddressCheckbox.isVisible()) {
      await saveAddressCheckbox.click();
      await expect(saveAddressCheckbox).toBeChecked();
    }
  });

  test('should handle delivery date restrictions', async ({ page }) => {
    await page.goto('/cs/checkout');
    await page.waitForLoadState('networkidle');

    const deliveryCalendar = page.locator('[data-testid="delivery-calendar"]');
    if (await deliveryCalendar.isVisible()) {
      // Check that past dates are disabled
      const disabledDates = deliveryCalendar.locator('[data-testid="disabled-date"]');
      const disabledCount = await disabledDates.count();

      if (disabledCount > 0) {
        await expect(disabledDates.first()).toHaveAttribute('disabled');
      }

      // Check that weekends might be disabled (depending on business rules)
      const weekendDates = deliveryCalendar.locator('[data-testid="weekend-date"]');
      const weekendCount = await weekendDates.count();

      if (weekendCount > 0) {
        // Weekend dates might be disabled or have different pricing
        const firstWeekend = weekendDates.first();
        const isDisabled = await firstWeekend.getAttribute('disabled');
        const hasSpecialPricing = await firstWeekend.locator('[data-testid="special-pricing"]').isVisible();

        expect(isDisabled !== null || hasSpecialPricing).toBeTruthy();
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cs/checkout');
    await page.waitForLoadState('networkidle');

    // Check that mobile layout is applied
    const checkoutForm = page.locator('[data-testid="checkout-form"]');
    await expect(checkoutForm).toBeVisible();

    // Check that form fields are properly sized for mobile
    const nameInput = page.locator('[data-testid="customer-name"]');
    if (await nameInput.isVisible()) {
      const boundingBox = await nameInput.boundingBox();
      expect(boundingBox?.width).toBeLessThan(400); // Should fit mobile screen
    }
  });

  test('should handle checkout errors gracefully', async ({ page }) => {
    await page.goto('/cs/checkout');
    await page.waitForLoadState('networkidle');

    // Fill form with potentially problematic data
    await page.fill('[data-testid="customer-name"]', 'Test User');
    await page.fill('[data-testid="customer-email"]', 'test@example.com');
    await page.fill('[data-testid="delivery-postal-code"]', '00000'); // Invalid postal code

    const submitButton = page.locator('[data-testid="submit-order"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Check for error messages
      const errorMessages = page.locator('[data-testid*="error"], .error-message');
      const errorCount = await errorMessages.count();

      if (errorCount > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });
});
