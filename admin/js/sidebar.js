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
/* ==========================================
        Toggle Sidebar
========================================== */

function toggleSidebar(){

    if(window.innerWidth <= 768){

        openSidebar();

        return;

    }

    sidebar.classList.toggle("collapsed");

    saveSidebarState();

}


/* ==========================================
        Open Sidebar (Mobile)
========================================== */

function openSidebar(){

    sidebar.classList.add("show");

    if(overlay){

        overlay.classList.add("show");

    }

}


/* ==========================================
        Close Sidebar
========================================== */

function closeSidebar(){

    sidebar.classList.remove("show");

    if(overlay){

        overlay.classList.remove("show");

    }

}


/* ==========================================
        ESC Keyboard
========================================== */

function handleEscape(event){

    if(event.key !== "Escape") return;

    closeSidebar();

}


/* ==========================================
        Window Resize
========================================== */

window.addEventListener("resize",()=>{

    if(window.innerWidth > 768){

        closeSidebar();

    }

});
/* ==========================================
        Save Sidebar State
========================================== */

function saveSidebarState(){

    const collapsed =
        sidebar.classList.contains("collapsed");

    localStorage.setItem(
        "dellcake_sidebar",
        collapsed
    );

}


/* ==========================================
        Restore Sidebar State
========================================== */

function restoreSidebarState(){

    if(window.innerWidth <= 768) return;

    const collapsed =
        localStorage.getItem(
            "dellcake_sidebar"
        );

    if(collapsed === "true"){

        sidebar.classList.add("collapsed");

    }

}


/* ==========================================
        Active Menu
========================================== */

function setActiveMenu(){

    const currentPage =
        window.location.pathname
        .split("/")
        .pop();

    const menuItems =
        document.querySelectorAll(".menu-item");

    menuItems.forEach(item=>{

        item.classList.remove("active");

        const href =
            item.getAttribute("href");

        if(!href) return;

        if(href.endsWith(currentPage)){

            item.classList.add("active");

        }

    });

}


/* ==========================================
        Public Refresh
========================================== */

function refreshSidebar(){

    setActiveMenu();

}

/* ==========================================
        Close Sidebar After Click
        (Mobile)
========================================== */

document.addEventListener("click",(event)=>{

    const menuItem =
        event.target.closest(".menu-item");

    if(!menuItem) return;

    if(window.innerWidth <= 768){

        closeSidebar();

    }

});


/* ==========================================
        Sidebar API
========================================== */

window.DellCakeSidebar={

    open:openSidebar,

    close:closeSidebar,

    toggle:toggleSidebar,

    refresh:refreshSidebar

};


/* ==========================================
        Future Hooks
========================================== */

/*
بعداً این قسمت برای:

Firebase Notifications

Realtime Orders

Badge Updates

استفاده خواهد شد.
*/


/* ==========================================
        End
========================================== */
