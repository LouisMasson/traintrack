import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should have Analytics link pointing to /stats', async ({ page }) => {
    await page.goto('/');

    const analyticsLink = page.getByRole('link', { name: 'Analytics' });
    await expect(analyticsLink).toHaveAttribute('href', '/stats');
  });

  test('should have Live Map link pointing to /', async ({ page }) => {
    await page.goto('/');

    const liveMapLink = page.getByRole('link', { name: 'Live Map' });
    await expect(liveMapLink).toHaveAttribute('href', '/');
  });

  test('should navigate to /stats when clicking Analytics', async ({ page }) => {
    await page.goto('/');

    // Click Analytics link
    await page.getByRole('link', { name: 'Analytics' }).click();

    // Verify URL changed
    await expect(page).toHaveURL('/stats');
  });

  test('should keep Live Map link functional', async ({ page }) => {
    await page.goto('/stats');

    // Click Live Map link to go back
    await page.getByRole('link', { name: 'Live Map' }).click();

    // Verify URL changed back to homepage
    await expect(page).toHaveURL('/');

    // Wait for map to load
    await page.waitForTimeout(2000);

    // Live Map link should be active
    const liveMapLink = page.getByRole('link', { name: 'Live Map' });
    await expect(liveMapLink).toHaveClass(/text-red-500/);
  });
});
