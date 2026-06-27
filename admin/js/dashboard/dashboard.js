/* =====================================================
        Dell Cake CMS
        Dashboard Core
===================================================== */

import { auth } from "../../../js/firebase-auth.js";

import {

    onAuthStateChanged,

    signOut

} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";


/* =====================================================
        Admin Config
===================================================== */

const ADMIN_EMAIL = "sobhanrahimisrj@gmail.com";


/* =====================================================
        Dashboard Entry Point
===================================================== */

export function initDashboard(){

    initializeDashboard();

}

/* =====================================================
        Initialize
===================================================== */

function initializeDashboard(){

    authGuard();

    startClock();

    setPersianDate();

    bindEvents();

}
/* =====================================================
        Authentication Guard
===================================================== */

function authGuard(){

    onAuthStateChanged(auth,(user)=>{

        if(!user){

            window.location.href="login.html";

            return;

        }

        if(user.email !== ADMIN_EMAIL){

            signOut(auth);

            alert("شما اجازه ورود به این پنل را ندارید.");

            window.location.href="../index.html";

            return;

        }

        loadAdmin(user);

    });

}


/* =====================================================
        Admin Information
===================================================== */

function loadAdmin(user){

    const avatar=document.getElementById("adminAvatar");

    const dropdownAvatar=document.getElementById("dropdownAvatar");

    const name=document.getElementById("adminName");

    const dropdownName=document.getElementById("dropdownName");

    const email=document.getElementById("dropdownEmail");


    if(avatar && user.photoURL){

        avatar.src=user.photoURL;

    }

    if(dropdownAvatar && user.photoURL){

        dropdownAvatar.src=user.photoURL;

    }

    if(name){

        name.textContent=

            user.displayName || "مدیر";

    }

    if(dropdownName){

        dropdownName.textContent=

            user.displayName || "مدیر";

    }

    if(email){

        email.textContent=user.email;

    }
        loadDashboard();
}
/* =====================================================
        Clock
===================================================== */

function startClock(){

    const clock=document.getElementById("liveClock");

    if(!clock) return;

    updateClock();

    setInterval(updateClock,1000);

}

function updateClock(){

    const now=new Date();

    const time=now.toLocaleTimeString("fa-IR",{

        hour:"2-digit",

        minute:"2-digit"

    });

    const clock=document.getElementById("liveClock");

    if(clock){

        clock.textContent=time;

    }

}


/* =====================================================
        Persian Date
===================================================== */

function setPersianDate(){

    const date=document.getElementById("persianDate");

    if(!date) return;

    const today=new Date();

    date.textContent=

        today.toLocaleDateString("fa-IR",{

            year:"numeric",

            month:"long",

            day:"numeric",

            weekday:"long"

        });

}
/* =====================================================
        Events
===================================================== */

function bindEvents(){

    bindProfileDropdown();

    bindNotificationPanel();

    bindLogout();
        
    bindSearch();

}


/* =====================================================
        Profile Dropdown
===================================================== */

function bindProfileDropdown(){

    const profile=

        document.getElementById("adminProfile");

    const dropdown=

        document.getElementById("profileDropdown");

    if(!profile || !dropdown) return;

    profile.addEventListener("click",(e)=>{

        e.stopPropagation();

        dropdown.classList.toggle("show");

    });

    document.addEventListener("click",()=>{

        dropdown.classList.remove("show");

    });

}
/* =====================================================
        Logout
===================================================== */

function bindLogout(){

    const logout=

        document.getElementById("logoutBtn");

    if(!logout) return;

    logout.addEventListener("click",async()=>{

        try{

            await signOut(auth);

            window.location.href="login.html";

        }

        catch(error){

            console.error(error);

        }

    });

}
/* =====================================================
        Search
===================================================== */

function bindSearch(){

    const input=

        document.getElementById("globalSearch");

    const box=

        document.getElementById("searchResultBox");

    if(!input || !box) return;

    input.addEventListener("focus",()=>{

        box.classList.add("show");

    });

    document.addEventListener("click",(e)=>{

        if(

            !box.contains(e.target) &&

            e.target!==input

        ){

            box.classList.remove("show");

        }

    });

}
/* =====================================================
        Dashboard Data
===================================================== */

const dashboardState = {

    orders: 0,

    customers: 0,

    products: 0,

    revenue: 0

};


/* =====================================================
        Load Dashboard
===================================================== */

async function loadDashboard(){

    updateStatistics();

}


/* =====================================================
        Update Statistics
===================================================== */

function updateStatistics(){

    setValue("ordersCount", dashboardState.orders);

    setValue("customersCount", dashboardState.customers);

    setValue("productsCount", dashboardState.products);

    setValue("revenueCount", dashboardState.revenue);

}


/* =====================================================
        Helpers
===================================================== */

function setValue(id,value){

    const element=document.getElementById(id);

    if(!element) return;

    element.textContent=value;

}


/* =====================================================
        Public Refresh
===================================================== */

export function refreshDashboard(data){

    dashboardState.orders=

        data.orders ?? dashboardState.orders;

    dashboardState.customers=

        data.customers ?? dashboardState.customers;

    dashboardState.products=

        data.products ?? dashboardState.products;

    dashboardState.revenue=

        data.revenue ?? dashboardState.revenue;

    updateStatistics();

}
