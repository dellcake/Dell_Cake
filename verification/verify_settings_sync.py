from playwright.sync_api import sync_playwright
import os

def verify_sync(page):
    # Wait for the site-settings.js to run
    page.wait_for_timeout(3000)

    # Check if the hero title is present
    hero_title_locator = page.locator(".hero-section .hero-title")
    if hero_title_locator.count() > 0:
        original_title = hero_title_locator.first.inner_text()
        print(f"Current Hero Title: {original_title}")
    else:
        print("Hero Title not found with selector '.hero-section .hero-title'")

    # Check for Logo
    logo = page.locator(".site-logo-mini img").first
    if logo.is_visible():
        print(f"Logo is visible: {logo.get_attribute('src')}")
    else:
        print("Logo is not visible")

    # Check for Social Links
    instagram = page.locator("a[href*='instagram.com']").first
    if instagram.count() > 0:
        print(f"Instagram link found: {instagram.get_attribute('href')}")

    # Check Academy Popup triggers
    page.click("text=ثبت‌نام دوره")
    page.wait_for_selector("#academyPopup", state="visible", timeout=5000)
    print("Academy Popup opened successfully via header button")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000/index.html")
            verify_sync(page)
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
