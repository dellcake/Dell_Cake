/* =====================================================
        Dell Cake CMS
        Component Loader
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await loadComponent(
    "#sidebarContainer",
    "../../components/sidebar.html"
);

await loadComponent(
    "#headerContainer",
    "../../components/header.html"
);
        
    initializeLayout();

    /* -------------------------------
       Load Modules After Components
    -------------------------------- */

    await import("../dashboard/dashboard.js");

});


/* =====================================================
        Load Component
===================================================== */

async function loadComponent(selector, url) {

    const container = document.querySelector(selector);

    if (!container) return;

    try {

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(response.status);

        }

        container.innerHTML = await response.text();

    } catch (error) {

        console.error("Component Error:", error);

    }
}


/* =====================================================
        Layout Init
===================================================== */

function initializeLayout() {

    setPageTitle();

    setActiveMenu();

}


/* =====================================================
        Page Title
===================================================== */

function setPageTitle() {

    const title = document.getElementById("pageTitle");

    if (!title) return;

    const page = window.location.pathname
        .split("/")
        .pop()
        .replace(".html", "");

    const pages = {

        dashboard: "داشبورد مدیریت",

        orders: "مدیریت سفارش‌ها",

        gallery: "مدیریت گالری",

        products: "مدیریت محصولات",

        courses: "مدیریت دوره‌ها",

        users: "مدیریت کاربران",

        settings: "تنظیمات",

        profile: "پروفایل مدیر"

    };

    title.textContent = pages[page] || "پنل مدیریت";

}


/* =====================================================
        Active Menu
===================================================== */

function setActiveMenu() {

    const current = window.location.pathname
        .split("/")
        .pop();

    document.querySelectorAll(".menu-item").forEach(item => {

        item.classList.remove("active");

        const href = item.getAttribute("href");

        if (!href) return;

        if (href.endsWith(current)) {

            item.classList.add("active");

        }

    });

}
