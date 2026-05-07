import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test('should register and then login', async ({ page }) => {
    const username = `user_${Date.now()}`;
    const password = 'password123';

    // Registration
    await page.goto('http://localhost:3001/users/register');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);

    // Login
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to home
    await expect(page).toHaveURL('http://localhost:3001/');
    
    // Check if username is displayed
    await expect(page.locator('.username')).toContainText(username);
  });

  test('should save and persist score', async ({ page }) => {
    const username = `user_score_${Date.now()}`;
    const password = 'password123';

    // Register and login
    await page.goto('http://localhost:3001/users/register');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click cookie
    const cookieButton = page.locator('#cookie-button');
    for (let i = 0; i < 5; i++) {
      await cookieButton.click();
      await page.waitForTimeout(200);
    }

    // Verify count
    await expect(page.locator('#cookie-count')).toHaveText('5');

    // Wait for auto-save (10s interval in clicker.js)
    await page.waitForTimeout(12000);

    // Reload
    await page.reload();
    await expect(page.locator('#cookie-count')).toHaveText('5');
  });
});
