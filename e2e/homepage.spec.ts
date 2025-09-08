import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the main heading and navigation', async ({ page }) => {
    await page.goto('/');

    // Check main heading
    await expect(page.locator('h1')).toContainText('Pohřební věnce');

    // Check main description
    await expect(page.locator('text=Prémiové pohřební věnce a květinové aranžmá')).toBeVisible();

    // Check call-to-action buttons
    await expect(page.locator('button:has-text("Prohlédnout věnce")')).toBeVisible();
    await expect(page.locator('button:has-text("Kontaktovat nás")')).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');

    // Check feature cards
    await expect(page.locator('text=Ruční výroba')).toBeVisible();
    await expect(page.locator('text=Rychlé dodání')).toBeVisible();
    await expect(page.locator('text=Osobní přístup')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Pohřební věnce/);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Prémiové pohřební věnce/);
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Prohlédnout věnce")')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Prohlédnout věnce")')).toBeVisible();
  });
});
