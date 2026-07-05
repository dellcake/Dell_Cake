/**
 * Menu Handler for Dell Cake
 * Handles sidebar toggling and overlay management.
 */

function initMenu() {
    const menuBtn = document.querySelector(".menu-btn");
    const sideMenu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");

    if (menuBtn && sideMenu && overlay) {
        // Remove existing listeners if any (to prevent multiple attachments)
        const newMenuBtn = menuBtn.cloneNode(true);
        menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);

        newMenuBtn.addEventListener("click", () => {
            sideMenu.classList.toggle("active");
            overlay.classList.toggle("active");
        });

        overlay.addEventListener("click", () => {
            sideMenu.classList.remove("active");
            overlay.classList.remove("active");
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
