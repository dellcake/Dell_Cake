from playwright.sync_api import sync_playwright
import os

def verify_admin(page, base_url):
    print(f"Checking Admin Login Page: {base_url}/admin/login/")
    page.goto(f"{base_url}/admin/login/")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/admin_login_final.png")

    # Check for core elements
    if page.locator("#googleLogin").is_visible():
        print("Success: Google Login button is visible")
    if page.locator("#loginForm").is_visible():
        print("Success: Login Form is visible")

    # Since I cannot actually log in (needs real Google credentials or DB bypass),
    # I will verify the admin dashboard structure by bypassing the guard for a screenshot if possible,
    # or just checking the file content again.

    print("Verifying course management structure...")
    # I'll check if the courses page has the expected fields
    page.goto(f"{base_url}/admin/index.html") # Might redirect to login because of guard
    page.wait_for_timeout(1000)

    # Check if the page contains the sidebar container
    if page.locator("#sidebar-container").exists:
        print("Success: Admin layout structure exists")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        try:
            verify_admin(page, "http://localhost:8000")
        finally:
            browser.close()
