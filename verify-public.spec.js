import { test, expect } from '@playwright/test';

test('verify public site dynamic integration', async ({ page }) => {
  // Go to homepage
  await page.goto('http://localhost:3000/');

  // Check if site-settings.js is loaded and applying title (might take a second for firebase)
  await page.waitForTimeout(2000);

  // Verify footer brand exists (part of components/footer.html loaded dynamically)
  const footerBrand = page.locator('.footer-brand h3');
  await expect(footerBrand).toBeVisible();

  // Verify Academy Popup works
  const academyBtn = page.locator('.academy-btn').first();
  await academyBtn.click();

  const popup = page.locator('#academyPopup');
  await expect(popup).toBeVisible();

  // Verify course container exists in popup
  const courseContainer = page.locator('#academy-courses-container');
  await expect(courseContainer).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'public-site-verification.png', fullPage: true });
});
