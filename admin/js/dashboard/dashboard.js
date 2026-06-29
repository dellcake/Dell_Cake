/* =====================================================
        Dell Cake CMS
        Dashboard Bootstrap
===================================================== */

import { initAuth } from "./auth.js";

import { initClock } from "./clock.js";

import { initProfile } from "./profile.js";

import { initNotifications } from "./notifications.js";

import { initSearch } from "./search.js";

import { initStats } from "./stats.js";


/* =====================================================
        Dashboard Init
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        await initializeDashboard();

    }

);


/* =====================================================
        Initialize
===================================================== */

async function initializeDashboard(){

    try{

        /* --------------------------
                Authentication
        --------------------------- */

        const user=

            await initAuth();

        /* --------------------------
                Header
        --------------------------- */

        initClock();

        initProfile(user);

        initNotifications();

        initSearch();

        /* --------------------------
                Dashboard
        --------------------------- */

        initStats();

        console.log(

            "Dell Cake Dashboard Ready"

        );

    }

    catch(error){

        console.error(error);

    }

}
