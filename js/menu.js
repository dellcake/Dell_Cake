/**
 * Menu Handler for Dell Cake
 * Handles sidebar toggling and overlay management.
 */

function initMenu() {
    const menuBtn = document.querySelector(".menu-btn");
    const sideMenu = document.getElementById("sideMenu");
    let overlay = document.getElementById("menuOverlay");

    // Create overlay if it doesn't exist
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "menuOverlay";
        overlay.className = "menu-overlay";
        document.body.appendChild(overlay);
    }

    if (menuBtn && sideMenu && overlay) {
        const toggleMenu = (show) => {
            const isActive = typeof show === 'boolean' ? show : !sideMenu.classList.contains("active");
            sideMenu.classList.toggle("active", isActive);
            overlay.classList.toggle("active", isActive);
            document.body.style.overflow = isActive ? "hidden" : "";
        };

        // Remove existing listeners by cloning (if needed) or just using a flag
        menuBtn.onclick = (e) => {
            e.preventDefault();
            toggleMenu();
        };

        overlay.onclick = () => toggleMenu(false);

        // Escape key to close
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && sideMenu.classList.contains("active")) {
                toggleMenu(false);
            }
        });

        // Handle links inside sidebar
        sideMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });
    }
}

// Re-initialize menu when components are loaded dynamically
document.addEventListener("componentsLoaded", () => {
    initMenu();
});

// Also try to init on DOMContentLoaded for static pages (if any)
document.addEventListener("DOMContentLoaded", () => {
    initMenu();
});
