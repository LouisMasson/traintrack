import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the navbar with correct title', async ({ page }) => {
    await page.goto('/');

    // Check navbar title
    await expect(page.getByText('Train Tracker Switzerland')).toBeVisible();
  });

  test('should display navigation links', async ({ page }) => {
    await page.goto('/');

    // Check navigation links
    await expect(page.getByRole('link', { name: 'Live Map' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible();
  });

  test('should display train count in navbar', async ({ page }) => {
    await page.goto('/');

    // Wait for trains to load
    await page.waitForTimeout(2000);

    // Check for trains text (count may vary)
    await expect(page.getByText('trains')).toBeVisible();
  });

  test('should have Live Map link active on homepage', async ({ page }) => {
    await page.goto('/');

    const liveMapLink = page.getByRole('link', { name: 'Live Map' });
    await expect(liveMapLink).toHaveClass(/text-red-500/);
  });

  test('should load the map container', async ({ page }) => {
    await page.goto('/');

    // Wait for map to initialize
    await page.waitForTimeout(2000);

    // Check for Mapbox map region
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible();
  });

  test('should display train markers on map', async ({ page }) => {
    await page.goto('/');

    // Wait for trains to load
    await page.waitForTimeout(3000);

    // Check for at least one train marker
    const markers = page.getByRole('img', { name: 'Map marker' });
    await expect(markers.first()).toBeVisible();
  });

  test('should display map controls', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    // Check for zoom controls
    await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zoom out' })).toBeVisible();
  });
});
