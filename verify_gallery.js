const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to mobile to test hamburger menu
  await page.setViewportSize({ width: 375, height: 667 });

  try {
    const filePath = 'file://' + path.resolve('gallery.html');
    await page.goto(filePath);

    // Check if gallery grid is present
    const grid = await page.$('#main-gallery-grid');
    console.log('Gallery grid found:', !!grid);

    // Test Hamburger Menu click
    const menuBtn = await page.$('.menu-btn');
    if (menuBtn) {
        await menuBtn.click();
        await page.waitForTimeout(500); // Wait for animation
        const sideMenu = await page.$('#sideMenu');
        const isActive = await sideMenu.evaluate(el => el.classList.contains('active'));
        console.log('Sidebar active after click:', isActive);
    } else {
        console.log('Menu button not found');
    }

    await page.screenshot({ path: 'verification/gallery_mobile.png' });

    // Switch to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(filePath);
    await page.waitForTimeout(1000); // Wait for dynamic load
    await page.screenshot({ path: 'verification/gallery_desktop.png' });

  } catch (e) {
    console.error('Verification failed:', e);
  } finally {
    await browser.close();
  }
})();
