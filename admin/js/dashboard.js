/* =====================================================
        Dell Cake CMS
        Dashboard
===================================================== */

import { auth } from "../firebase/firebase-config.js";

import {

    onAuthStateChanged,
    signOut

} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";


/* =====================================================
        Elements
===================================================== */

const ordersCount =
    document.getElementById("ordersCount");

const customersCount =
    document.getElementById("customersCount");

const productsCount =
    document.getElementById("productsCount");

const revenueCount =
    document.getElementById("revenueCount");

const todayOrders =
    document.getElementById("todayOrders");

const todayIncome =
    document.getElementById("todayIncome");

const todayUsers =
    document.getElementById("todayUsers");


/* =====================================================
        Dashboard State
===================================================== */

const dashboard={

    orders:0,

    customers:0,

    products:0,

    revenue:0,

    todayOrders:0,

    todayIncome:0,

    todayUsers:0

};

/* =====================================================
        Authentication
===================================================== */

const ADMIN_EMAIL =

"sobhanrahimisrj@gmail.com";


onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    if(user.email !== ADMIN_EMAIL){

        signOut(auth);

        alert("شما اجازه ورود به پنل مدیریت را ندارید.");

        window.location.href="../index.html";

        return;

    }

    loadAdminProfile(user);

    loadDashboard();

});


/* =====================================================
        Admin Profile
===================================================== */

function loadAdminProfile(user){

    const profileImage =

        document.querySelector(".profile-image img");

    const profileName =

        document.querySelector(".profile-info h4");

    const profileRole =

        document.querySelector(".profile-info span");


    if(profileImage && user.photoURL){

        profileImage.src = user.photoURL;

    }

    if(profileName){

        profileName.textContent =

        user.displayName || "مدیر";

    }

    if(profileRole){

        profileRole.textContent =

        "مدیر سایت";

    }

}
