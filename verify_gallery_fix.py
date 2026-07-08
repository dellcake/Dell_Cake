import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Test Gallery Page (should show Mock state)
        await page.goto('http://localhost:8000/gallery.html')
        await asyncio.sleep(3) # Wait for JS to execute and fail/mock
        await page.screenshot(path='gallery_page_mock.png')

        # Test Home Page Gallery
        await page.goto('http://localhost:8000/index.html')
        await asyncio.sleep(3)
        await page.screenshot(path='home_gallery_mock.png')

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
