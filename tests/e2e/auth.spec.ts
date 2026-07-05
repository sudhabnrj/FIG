import { test, expect } from '@playwright/test';

test.describe('Frontend Interview Guide Authentication E2E Tests', () => {
  test('should redirect guest users from protected pages to login', async ({ page }) => {
    // 1. Try accessing /profile directly as guest
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Expect redirection to /login
    expect(page.url()).toContain('/login');
    const loginHeading = page.locator('h2');
    await expect(loginHeading).toContainText('Welcome Back');

    // 2. Try accessing /settings directly as guest
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Expect redirection to /login
    expect(page.url()).toContain('/login');
  });

  test('should display registration form validation errors', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Trigger submit on empty fields
    const signUpBtn = page.locator('button[type="submit"]');
    await signUpBtn.click();

    // Check validation error messages are displayed
    await expect(page.locator('text=Full name is required').first()).toBeVisible();
    await expect(page.locator('text=Username is required').first()).toBeVisible();
    await expect(page.locator('text=Email address is required').first()).toBeVisible();
    await expect(page.locator('text=Password is required').first()).toBeVisible();
  });

  test('should display login form validation errors', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Trigger submit on empty fields
    const signInBtn = page.locator('button[type="submit"]');
    await signInBtn.click();

    await expect(page.locator('text=Email address is required').first()).toBeVisible();
    await expect(page.locator('text=Password is required').first()).toBeVisible();
  });
});
