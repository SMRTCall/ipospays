const { test, expect } = require('@playwright/test');

test.describe('iPosPays Integration E2E Tests', () => {
  const baseURL = 'http://localhost:3000';
  const merchantName = `TestMerchant_${Date.now()}`;
  const authToken = `test_auth_token_${Date.now()}`;

  test('should register a new merchant', async ({ page }) => {
    await page.goto(`${baseURL}/register`);

    await page.fill('input[name="name"]', merchantName);
    await page.fill('input[name="authToken"]', authToken);
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Merchant registered successfully')).toBeVisible();
  });

  test('should initiate a payment', async ({ page }) => {
    // First, register a merchant to use for the payment
    await page.goto(`${baseURL}/register`);
    await page.fill('input[name="name"]', merchantName);
    await page.fill('input[name="authToken"]', authToken);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Merchant registered successfully')).toBeVisible();

    // Now, go to the payment page
    await page.goto(`${baseURL}/`);

    // There should be a dropdown to select a merchant.
    // We'll just assume the one we created is available and select it.
    // In a real app, you might need to find it by name.
    // For this simple UI, we might need a more robust selector if the list grows.
    await page.selectOption('select[name="merchant"]', { label: merchantName });

    await page.fill('input[name="amount"]', '10.00');
    await page.click('button[type="submit"]');

    // We expect to be redirected to the Dejavoo Hosted Payment Page.
    // We can't test the HPP itself, but we can verify the URL is correct.
    await page.waitForNavigation();
    const url = page.url();
    expect(url).toContain('https://c.dejavoo.io/hpp');
  });
});
