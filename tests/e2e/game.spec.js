import { test, expect } from '@playwright/test';

test.describe('Game Mechanics E2E', () => {
  test.beforeEach(async ({ page }) => {
    const username = `gamer_${Date.now()}`;
    const password = 'password123';

    // Register and login to start fresh
    await page.goto('/users/register');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*localhost:3001\//);
    await page.waitForLoadState('networkidle');
  });

  test('should increase score on click and show notification', async ({ page }) => {
    const cookieButton = page.locator('#cookie-button');
    await cookieButton.click();
    
    await expect(page.locator('#cookie-count')).toHaveText('1');
    
    // Check for achievement notification
    await expect(page.locator('.notification')).toBeVisible();
    await expect(page.locator('.notification-title')).toContainText('Succès débloqué !');
    await expect(page.locator('.notification-message')).toContainText('Premier pas');
  });

  test('should buy building and generate passive income', async ({ page }) => {
    const cookieButton = page.locator('#cookie-button');
    
    // Click enough to buy a cursor (15 cookies)
    for (let i = 0; i < 15; i++) {
      await cookieButton.click();
    }
    
    const buyCursorBtn = page.locator('#buy-cursor');
    await expect(buyCursorBtn).not.toBeDisabled();
    await buyCursorBtn.click();
    
    // Check cursor count
    await expect(page.locator('#cursor-count')).toHaveText('1');
    
    // Check CPS update
    await expect(page.locator('#cps-count')).not.toHaveText('0');
    
    // Wait for passive income (0.1/sec, so 10s = 1 cookie)
    await page.waitForTimeout(11000);
    const score = await page.locator('#cookie-count').innerText();
    expect(parseFloat(score.replace(',', ''))).toBeGreaterThan(0);
  });

  test('should display achievements in the grid', async ({ page }) => {
    const cookieButton = page.locator('#cookie-button');
    await cookieButton.click();
    
    // Achievement badge should be unlocked (colored)
    const badge = page.locator('.achievement-badge.unlocked').first();
    await expect(badge).toBeVisible();
    
    // Check tooltip content
    await badge.hover();
    await expect(page.locator('.achievement-tooltip').first()).toContainText('Premier pas');
  });

  test('should show advanced stats dashboard', async ({ page }) => {
    await expect(page.locator('.stats-dashboard')).toBeVisible();
    await expect(page.locator('#total-clicks')).toBeVisible();
    await expect(page.locator('#play-time')).toContainText('0h 0m');
  });
});
