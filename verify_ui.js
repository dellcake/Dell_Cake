const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const urls = [
    { name: 'index', path: 'index.html', width: 1280, height: 800 },
    { name: 'index_mobile', path: 'index.html', width: 375, height: 667 },
    { name: 'gallery', path: 'gallery.html', width: 1280, height: 800 },
    { name: 'admin_login', path: 'admin/login.html', width: 1280, height: 800 }
  ];

  for (const item of urls) {
    await page.setViewportSize({ width: item.width, height: item.height });
    const filePath = 'file://' + path.resolve(item.path);
    await page.goto(filePath);
    await page.waitForTimeout(1000); // Wait for animations/dynamic loads
    await page.screenshot({ path: `${item.name}.png`, fullPage: true });
    console.log(`Captured ${item.name}.png`);
  }

  await browser.close();
})();
