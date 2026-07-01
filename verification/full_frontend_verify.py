from playwright.sync_api import sync_playwright
import os

def run_verification(page):
    # 1. Verify Login Page
    print("Verifying Login Page...")
    page.goto("http://localhost:3000/admin/login.html")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/admin_login.png")

    # 2. Verify Public Homepage & Academy Popup
    print("Verifying Public Homepage & Academy Popup...")
    page.goto("http://localhost:3000/index.html")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/homepage.png")

    # Click Academy Button
    page.click("text=ثبت‌نام دوره")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/academy_popup.png")

    # 3. Verify Admin Dashboard (with mock auth)
    print("Verifying Admin Dashboard...")
    # Inject mock to bypass auth redirect
    page.add_init_script("""
        window.isMockAuth = true;
        // Intercept Firebase Auth if needed or just prevent location.replace
        const originalReplace = window.location.replace;
        window.location.replace = function(url) {
            if (url.includes('login.html')) {
                console.log('Prevented redirect to login');
                return;
            }
            originalReplace.apply(this, arguments);
        };
    """)

    page.goto("http://localhost:3000/admin/admin.html")
    page.wait_for_timeout(2000)

    # Switch to Courses tab
    page.click("text=مدیریت دوره‌ها")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/admin_courses.png")

    # Open Add Course Modal
    page.click("button:has-text('افزودن دوره جدید')")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/admin_add_course_modal.png")

    # Switch to Orders tab
    page.click("button:has-text('بستن')") # Close modal first
    page.wait_for_timeout(500)
    page.click("text=مدیریت سفارش‌ها")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/admin_orders.png")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="/home/jules/verification/videos")
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
