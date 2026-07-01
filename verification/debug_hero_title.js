import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/index.html');

  // Wait for scripts to run
  await page.waitForTimeout(2000);

  const count = await page.locator('.hero-title').count();
  console.log(`Found ${count} .hero-title elements`);

  for (let i = 0; i < count; i++) {
    const html = await page.locator('.hero-title').nth(i).evaluate(el => el.outerHTML);
    console.log(`Element ${i}: ${html}`);
  }

  await browser.close();
})();
