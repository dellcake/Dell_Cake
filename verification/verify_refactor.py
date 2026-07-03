from playwright.sync_api import sync_playwright
import os

def verify_dashboard_refactor(page, base_url):
    print(f"Navigating to Admin Dashboard (via login redirect check): {base_url}/admin/")
    page.goto(f"{base_url}/admin/login/")

    # We can't easily bypass real auth, but we can check if the assets are correctly linked
    # and if the dashboard structure is sound.

    # Check if the CSS is loaded
    page.goto(f"{base_url}/admin/css/admin.css")
    if "skeleton" in page.content():
        print("Success: Skeleton CSS is present in admin.css")

    # Check the dashboard HTML structure for refactored classes
    page.goto(f"{base_url}/admin/pages/dashboard.html")
    content = page.content()
    if "card stat-card skeleton" in content:
        print("Success: Dashboard HTML uses refactored skeleton classes")
    if "dashboard-main-grid" in content:
        print("Success: Dashboard HTML uses standardized grid classes")

    # Verify the JS module exist
    page.goto(f"{base_url}/admin/js/modules/dashboard.js")
    if "loadDashboardData" in page.content():
        print("Success: Dashboard JS module is accessible and contains expected functions")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        try:
            verify_dashboard_refactor(page, "http://localhost:8000")
        finally:
            browser.close()
