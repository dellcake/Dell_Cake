/* ==========================================
        Dell Cake CMS
        Sidebar Controller
========================================== */

let sidebar;
let overlay;
let menuToggle;
let sidebarClose;

/* ==========================================
        Init
========================================== */

function initSidebar(){

    sidebar =
        document.getElementById("sidebar");

    overlay =
        document.getElementById("sidebarOverlay");

    menuToggle =
        document.getElementById("menuToggle");

    sidebarClose =
        document.getElementById("sidebarClose");

    if(!sidebar) return;

    restoreSidebarState();

    registerSidebarEvents();

    setActiveMenu();

}

/* ==========================================
        Events
========================================== */

function registerSidebarEvents(){

    if(menuToggle){

        menuToggle.addEventListener(
            "click",
            toggleSidebar
        );

    }

    if(sidebarClose){

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );

    }

    if(overlay){

        overlay.addEventListener(
            "click",
            closeSidebar
        );

    }

    document.addEventListener(
        "keydown",
        handleEscape
    );

}
