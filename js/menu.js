/**
 * Bulletproof Menu Handler for Dell Cake
 * Handles sidebar toggling, overlay management, and eliminates dynamic component race conditions.
 */

function initMenu() {
    const menuBtn = document.querySelector(".menu-btn");
    const sideMenu = document.getElementById("sideMenu");
    let overlay = document.getElementById("menuOverlay");

    if (!overlay && sideMenu) {
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

        // Bind cleanly
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
            link.onclick = () => toggleMenu(false);
        });
    }
}

// Ensure initMenu runs safely whenever any component is loaded
document.addEventListener("componentsLoaded", () => {
    initMenu();
});

// Polyfill / Poll to ensure binding as soon as both elements appear in DOM
(function pollMenuElements() {
    initMenu();
    if (!document.querySelector(".menu-btn") || !document.getElementById("sideMenu")) {
        setTimeout(pollMenuElements, 100);
    }
})();

// Also init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    initMenu();
});
