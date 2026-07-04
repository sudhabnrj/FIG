import { test, expect } from '@playwright/test';

test.describe('Frontend Interview Guide E2E Smoke Tests', () => {
  test('should verify the critical user journey', async ({ page }) => {
    // 1. Open the homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check header/logo existence
    const headerTitle = page.locator('header a');
    await expect(headerTitle).toBeVisible();

    // 2. Perform search
    const searchInput = page.locator('header input[type="text"]');
    if (await searchInput.count() > 0) {
      await searchInput.click();
      await searchInput.pressSequentially('closure', { delay: 100 });
      await page.waitForTimeout(1500); // wait for debounce
    }

    // 3. Expand a card
    const firstCardHeaderButton = page.locator('div[id^="card-"] button[aria-expanded]').first();
    if (await firstCardHeaderButton.count() > 0) {
      const isExpandedBefore = await firstCardHeaderButton.getAttribute('aria-expanded');
      expect(isExpandedBefore).toBe('false');

      // Click to expand
      await firstCardHeaderButton.click();
      await page.waitForTimeout(200);

      const isExpandedAfter = await firstCardHeaderButton.getAttribute('aria-expanded');
      expect(isExpandedAfter).toBe('true');
    }

    // 4. Verify theme toggling
    const themeButton = page.locator('header button[aria-label*="theme" i]');
    if (await themeButton.count() > 0) {
      const initialLabel = await themeButton.getAttribute('aria-label') || '';
      const initialTheme = initialLabel.includes('dark') ? 'light' : 'dark';

      // Click to switch
      await themeButton.click();
      await page.waitForTimeout(200);

      const htmlElement = page.locator('html');
      if (initialTheme === 'light') {
        await expect(htmlElement).toHaveClass(/dark/);
      } else {
        await expect(htmlElement).not.toHaveClass(/dark/);
      }
    }
  });
});
