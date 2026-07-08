# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Frontend Interview Guide Authentication E2E Tests >> should display registration form validation errors
- Location: tests\e2e\auth.spec.ts:22:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Full name is required').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Full name is required').first()

```

```yaml
- banner:
  - link " Interview Preparation Guide":
    - /url: /
  - text: 
  - textbox "Search Q&A... (Ctrl + F)"
  - text: "Ctrl+F Total: 41"
  - button "Switch to dark theme":  Light
  - link "Sign In":
    - /url: /login
  - link "Sign Up":
    - /url: /register
- main:
  - heading "Create Account" [level=2]
  - paragraph: Join the community and test your skills
  - text: Full Name 
  - textbox "Full Name":
    - /placeholder: John Doe
  - text: Username @
  - textbox "Username":
    - /placeholder: johndoe_99
  - text: Email Address 
  - textbox "Email Address":
    - /placeholder: you@example.com
  - text: Password 
  - textbox "Password":
    - /placeholder: ••••••••
  - text: Confirm Password 
  - textbox "Confirm Password":
    - /placeholder: ••••••••
  - button "Sign Up"
  - text: or register with
  - link " Google":
    - /url: /api/v1/auth/google
  - link " GitHub":
    - /url: /api/v1/auth/github
  - text: Already have an account?
  - link "Login":
    - /url: /login
- contentinfo:
  - paragraph: © 2026 Interview Preparation Guide. All Rights Reserved.
  - paragraph: Redesigned & Modernized with Premium Accessibility and Responsive UX.
- status: 
- alert
- img
- text: 4 errors
- button "Hide Errors":
  - img
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Frontend Interview Guide Authentication E2E Tests', () => {
  4  |   test('should redirect guest users from protected pages to login', async ({ page }) => {
  5  |     // 1. Try accessing /profile directly as guest
  6  |     await page.goto('/profile');
  7  |     await page.waitForLoadState('networkidle');
  8  |     
  9  |     // Expect redirection to /login
  10 |     expect(page.url()).toContain('/login');
  11 |     const loginHeading = page.locator('h2');
  12 |     await expect(loginHeading).toContainText('Welcome Back');
  13 | 
  14 |     // 2. Try accessing /settings directly as guest
  15 |     await page.goto('/settings');
  16 |     await page.waitForLoadState('networkidle');
  17 |     
  18 |     // Expect redirection to /login
  19 |     expect(page.url()).toContain('/login');
  20 |   });
  21 | 
  22 |   test('should display registration form validation errors', async ({ page }) => {
  23 |     await page.goto('/register');
  24 |     await page.waitForLoadState('networkidle');
  25 | 
  26 |     // Trigger submit on empty fields
  27 |     const signUpBtn = page.locator('button[type="submit"]');
  28 |     await signUpBtn.click();
  29 | 
  30 |     // Check validation error messages are displayed
> 31 |     await expect(page.locator('text=Full name is required').first()).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  32 |     await expect(page.locator('text=Username is required').first()).toBeVisible();
  33 |     await expect(page.locator('text=Email address is required').first()).toBeVisible();
  34 |     await expect(page.locator('text=Password is required').first()).toBeVisible();
  35 |   });
  36 | 
  37 |   test('should display login form validation errors', async ({ page }) => {
  38 |     await page.goto('/login');
  39 |     await page.waitForLoadState('networkidle');
  40 | 
  41 |     // Trigger submit on empty fields
  42 |     const signInBtn = page.locator('button[type="submit"]');
  43 |     await signInBtn.click();
  44 | 
  45 |     await expect(page.locator('text=Email address is required').first()).toBeVisible();
  46 |     await expect(page.locator('text=Password is required').first()).toBeVisible();
  47 |   });
  48 | });
  49 | 
```