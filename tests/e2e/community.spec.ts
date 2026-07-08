import { test, expect } from '@playwright/test';

test.describe('Frontend Interview Guide Community E2E Tests', () => {
  test('should redirect guest users from /community to /login', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');
  });

  test('should redirect guest users from /community/questions/create to /login', async ({ page }) => {
    await page.goto('/community/questions/create');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');
  });

  test('should redirect guest users from /community/review to /login', async ({ page }) => {
    await page.goto('/community/review');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');
  });
});
