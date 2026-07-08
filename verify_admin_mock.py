import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Test Admin Login Page
        await page.goto('http://localhost:8000/admin/login.html')
        await asyncio.sleep(2)
        await page.screenshot(path='admin_login_mock.png')

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
