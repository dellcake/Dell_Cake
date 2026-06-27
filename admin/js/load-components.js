/* ==========================================
        Dell Cake CMS
        Component Loader
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await loadComponent(
        "#sidebarContainer",
        "components/sidebar.html"
    );

    await loadComponent(
        "#headerContainer",
        "components/header.html"
    );

    initSidebar();

});


/* ==========================================
        Load HTML Component
========================================== */

async function loadComponent(
    selector,
    file
){

    const container =
        document.querySelector(selector);

    if(!container) return;

    try{

        const response =
            await fetch(file);

        const html =
            await response.text();

        container.innerHTML =
            html;

    }

    catch(error){

        console.error(
            "Component Error:",
            error
        );

    }

}
