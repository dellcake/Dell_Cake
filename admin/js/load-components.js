/* =====================================================
        Dell Cake CMS
        Component Loader
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await loadComponent(
        "#sidebarContainer",
        "components/sidebar.html"
    );

    await loadComponent(
        "#headerContainer",
        "components/header.html"
    );

    initializeLayout();

});


/* =====================================================
        Load HTML Component
===================================================== */

async function loadComponent(selector, url){

    const container = document.querySelector(selector);

    if(!container) return;

    try{

        const response = await fetch(url);

        if(!response.ok){

            throw new Error(url);

        }

        container.innerHTML = await response.text();

    }

    catch(error){

        console.error(

            "Component Load Error:",

            error

        );

    }

}


/* =====================================================
        Initialize Layout
===================================================== */

function initializeLayout(){

    setPageTitle();

    setActiveSidebar();

}


/* =====================================================
        Page Title
===================================================== */

function setPageTitle(){

    const pageTitle =

        document.getElementById("pageTitle");

    if(!pageTitle) return;

    const path =

        window.location.pathname
        .split("/")
        .pop()
        .replace(".html","");

    const titles={

        dashboard:"داشبورد مدیریت",

        orders:"مدیریت سفارش‌ها",

        gallery:"مدیریت گالری",

        products:"مدیریت محصولات",

        courses:"مدیریت دوره‌ها",

        users:"مدیریت کاربران",

        settings:"تنظیمات",

        profile:"پروفایل مدیر"

    };

    pageTitle.textContent =

        titles[path] ||

        "پنل مدیریت";

}


/* =====================================================
        Active Sidebar Menu
===================================================== */

function setActiveSidebar(){

    const current =

        window.location.pathname
        .split("/")
        .pop();

    document

        .querySelectorAll(".menu-item")

        .forEach(item=>{

            item.classList.remove("active");

            const href=item.getAttribute("href");

            if(!href) return;

            if(href.endsWith(current)){

                item.classList.add("active");

            }

        });

}
