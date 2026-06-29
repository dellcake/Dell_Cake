/* =====================================================
        Dell Cake CMS
        Core Loader
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    try {

        /* ==========================
                Load Components
        ========================== */

        await loadComponent(
            "#sidebarContainer",
            "./components/sidebar.html"
        );

        await loadComponent(
            "#headerContainer",
            "./components/header.html"
        );

        /* ==========================
                Initialize Layout
        ========================== */

        initializeLayout();

        /* ==========================
                Load JS Modules
        ========================== */

        await Promise.all([

            import("../sidebar/sidebar.js"),

            import("../header/header.js"),

            import("../dashboard/dashboard.js")

        ]);

    }

    catch (error) {

        console.error("CMS Loader Error :", error);

    }

});


/* =====================================================
        Load HTML Component
===================================================== */

async function loadComponent(selector, url) {

    const container = document.querySelector(selector);

    if (!container) {

        console.warn(`Container not found : ${selector}`);

        return;

    }

    try {

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(`Cannot load ${url}`);

        }

        container.innerHTML = await response.text();

    }

    catch (error) {

        console.error(error);

    }

}


/* =====================================================
        Initialize Layout
===================================================== */

function initializeLayout() {

    setPageTitle();

    setActiveMenu();

}


/* =====================================================
        Page Title
===================================================== */

function setPageTitle() {

    const pageTitle = document.getElementById("pageTitle");

    if (!pageTitle) return;

    const page = location.pathname
        .split("/")
        .pop()
        .replace(".html", "");

    const titles = {

        dashboard: "داشبورد",

        academy: "آکادمی",

        gallery: "گالری",

        products: "محصولات",

        customers: "مشتریان",

        settings: "تنظیمات"

    };

    pageTitle.textContent = titles[page] || "پنل مدیریت";

}


/* =====================================================
        Active Sidebar Item
===================================================== */

function setActiveMenu() {

    const currentPage = location.pathname
        .split("/")
        .pop();

    document.querySelectorAll(".menu-item").forEach(item => {

        item.classList.remove("active");

        const href = item.getAttribute("href");

        if (!href) return;

        if (href.endsWith(currentPage)) {

            item.classList.add("active");

        }

    });

}
