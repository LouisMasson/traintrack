import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('GET /api/trains/current should return valid response', async ({ request }) => {
    const response = await request.get('/api/trains/current');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Check response structure
    expect(data).toHaveProperty('trains');
    expect(data).toHaveProperty('count');
    expect(data).toHaveProperty('timestamp');
    expect(Array.isArray(data.trains)).toBe(true);
  });

  test('GET /api/trains/current should return count matching trains length', async ({
    request,
  }) => {
    const response = await request.get('/api/trains/current');
    const data = await response.json();

    expect(data.count).toBe(data.trains.length);
  });

  test('GET /api/trains/stats should return valid response', async ({ request }) => {
    const response = await request.get('/api/trains/stats');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('GET /api/trains/history should return valid response', async ({ request }) => {
    const response = await request.get('/api/trains/history');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });
});
